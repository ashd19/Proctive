from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchxrayvision as xrv
import skimage
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model globally to avoid reloading on request
model = None
transform = None

# Global device setting
device = "cuda" if torch.cuda.is_available() else "cpu"

def get_model():
    global model, transform
    if model is None:
        print(f"Loading TorchXrayVision model (DenseNet121-res224-all) on {device}...")
        # Load model that predicts all 18 pathologies
        model = xrv.models.DenseNet(weights="densenet121-res224-all")
        model.to(device)
        model.eval() # Set to eval mode
        transform = torchvision.transforms.Compose([xrv.datasets.XRayCenterCrop(),xrv.datasets.XRayResizer(224)])
        print("Model loaded successfully!")
    return model

import torchvision

@app.get("/")
def read_root():
    return {"status": "ok", "service": "X-Ray AI Analysis", "device": device}

@app.on_event("startup")
async def startup_event():
    print("Pre-loading AI Model on startup...")
    get_model()

import open_clip

# --- Models ---
biomed_model = None
biomed_preprocess = None
biomed_tokenizer = None

def get_biomed_model():
    global biomed_model, biomed_preprocess, biomed_tokenizer
    if biomed_model is None:
        print(f"Loading BiomedCLIP (General Medical Expert) on {device}...")
        try:
            model_name = 'hf-hub:microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224'
            biomed_model, _, biomed_preprocess = open_clip.create_model_and_transforms(model_name)
            biomed_tokenizer = open_clip.get_tokenizer(model_name)
            biomed_model.to(device)
            biomed_model.eval()
            print("BiomedCLIP loaded successfully!")
        except Exception as e:
            print(f"Failed to load BiomedCLIP: {e}")
            return None
    return biomed_model

@app.post("/analyze")
async def analyze_xray(file: UploadFile = File(...)):
    global model
    try:
        # Load models
        chest_model = get_model()
        biomed = get_biomed_model()
        
        # Read image
        contents = await file.read()
        pil_image = Image.open(io.BytesIO(contents)).convert('RGB') # BiomedCLIP needs RGB usually
        
        # --- Stage 1: Modality Detection (BiomedCLIP) ---
        modality = "Unknown"
        is_chest_xray = True # Default fallback
        
        if biomed:
            print("[AI] Detecting modality with BiomedCLIP...")
            modalities = [
                "Chest X-ray", 
                "Brain MRI", 
                "Skull X-ray", 
                "Hand X-ray", 
                "Bone Fracture X-ray", 
                "Knee MRI",
                "CT Scan"
            ]
            
            image_input = biomed_preprocess(pil_image).unsqueeze(0).to(device)
            text_input = biomed_tokenizer(modalities).to(device)
            
            with torch.no_grad():
                image_features = biomed.encode_image(image_input)
                text_features = biomed.encode_text(text_input)
                image_features /= image_features.norm(dim=-1, keepdim=True)
                text_features /= text_features.norm(dim=-1, keepdim=True)
                
                probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)
            
            top_prob, top_idx = probs[0].topk(1)
            modality = modalities[top_idx]
            print(f"[AI] Detected Modality: {modality} ({top_prob.item():.2f})")
            
            if "Chest X-ray" not in modality and top_prob.item() > 0.5:
                is_chest_xray = False

        # --- Stage 2: Specialist Analysis ---
        
        if is_chest_xray:
            print("[AI] Routing to Chest Specialist (DenseNet)...")
            # Convert to Grayscale for DenseNet
            pil_gray = pil_image.convert('L')
            
            # --- Advanced Preprocessing (CLAHE) ---
            img_np_raw = np.array(pil_gray)
            try:
               img_clahe = skimage.exposure.equalize_adapthist(img_np_raw, clip_limit=0.03)
               img_clahe = (img_clahe * 255).astype(np.uint8)
            except Exception:
               img_clahe = img_np_raw

            # --- Test Time Augmentation (TTA) ---
            variations = []
            
            def prepare_tensor(img_arr):
                img_pil = Image.fromarray(img_arr).resize((224, 224))
                arr = np.array(img_pil)
                arr = xrv.datasets.normalize(arr, 255)
                t = torch.from_numpy(arr[None, None, ...]).float()
                return t.to(device)

            # 1. Original
            t_orig = prepare_tensor(img_clahe)
            t_orig.requires_grad = True # For GradCAM
            variations.append(t_orig)
            
            # 2. Flip
            img_flip = np.fliplr(img_clahe)
            t_flip = prepare_tensor(img_flip)
            variations.append(t_flip)
            
            # --- Inference & Grad-CAM ---
            if chest_model is None: raise Exception("Chest model failed to load")
            
            # Hook for Grad-CAM
            target_layer = chest_model.features.denseblock4.denselayer16
            gradients = []
            activations = []
            
            def backward_hook(module, grad_input, grad_output):
                gradients.append(grad_output[0])
            def forward_hook(module, input, output):
                activations.append(output)
            
            h1 = target_layer.register_forward_hook(forward_hook)
            h2 = target_layer.register_full_backward_hook(backward_hook)
            
            # TTA Runs
            outputs_list = []
            
            # Pass 1 (Original)
            out_orig = chest_model(t_orig)
            outputs_list.append(torch.sigmoid(out_orig).detach().cpu().numpy()[0])
            
            # GradCAM Backprop
            probs_orig = torch.sigmoid(out_orig)[0]
            top_idx_cam = torch.argmax(probs_orig).item()
            chest_model.zero_grad()
            out_orig[0, top_idx_cam].backward()
            
            # Pass 2 (Flip)
            with torch.no_grad():
                out_flip = chest_model(t_flip)
                outputs_list.append(torch.sigmoid(out_flip).detach().cpu().numpy()[0])
                
            h1.remove(); h2.remove()
            
            # Heatmap Gen
            grads = gradients[0]; acts = activations[0]
            weights = torch.mean(grads, dim=(2, 3))[0]
            cam = torch.zeros(acts.shape[2:], device=device)
            for i, w in enumerate(weights): cam += w * acts[0, i, :, :]
            cam = torch.clamp(cam, min=0)
            cam = cam - torch.min(cam); cam = cam / (torch.max(cam) + 1e-8)
            
            y_indices, x_indices = torch.where(cam == torch.max(cam))
            best_y_feat = y_indices[0].item(); best_x_feat = x_indices[0].item()
            feat_h, feat_w = cam.shape
            best_x_pct = (best_x_feat / feat_w) * 100; best_y_pct = (best_y_feat / feat_h) * 100
            
            # Results
            avg_preds = np.mean(outputs_list, axis=0)
            predictions = {}
            active_detections = []
            
            sorted_indices = np.argsort(avg_preds)[::-1]
            for idx in sorted_indices[:5]:
                pathology = chest_model.pathologies[idx]
                score = float(avg_preds[idx])
                predictions[pathology] = score
                if score > 0.1: active_detections.append((pathology, score))
            
            active_detections.sort(key=lambda x: x[1], reverse=True)
            
            print(f"[AI] Localized {chest_model.pathologies[top_idx_cam]} via Grad-CAM at {best_x_pct:.1f}%, {best_y_pct:.1f}%")

            return {
                "source": "local_chest_specialist",
                "model": "densenet121 + biomed_clip_router",
                "device": device,
                "modality_detected": modality,
                "predictions": predictions,
                "localization": { "x": best_x_pct, "y": best_y_pct }
            }

        else:
            # --- GENERAL MEDICAL ANALYSIS (BiomedCLIP) ---
            print(f"[AI] Routing to General Specialist for {modality}...")
            
            # Define potential anomalies for this modality
            anomalies = [
                "Fracture", "Tumor", "Lesion", "Swelling", "Internal Bleeding", "Normal Healthy Tissue"
            ]
            
            # Zero-shot classification for anomalies
            image_input = biomed_preprocess(pil_image).unsqueeze(0).to(device)
            text_input = biomed_tokenizer(anomalies).to(device)
            
            with torch.no_grad():
                image_features = biomed.encode_image(image_input)
                text_features = biomed.encode_text(text_input)
                image_features /= image_features.norm(dim=-1, keepdim=True)
                text_features /= text_features.norm(dim=-1, keepdim=True)
                probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)
            
            predictions = {}
            active_detections = []
            
            for i, anomaly in enumerate(anomalies):
                score = float(probs[0][i].item())
                predictions[anomaly] = score
                if score > 0.1 and anomaly != "Normal Healthy Tissue":
                    active_detections.append((anomaly, score))
            
            active_detections.sort(key=lambda x: x[1], reverse=True)
            
            return {
                "source": "local_biomed_clip",
                "model": "biomed_clip_general",
                "device": device,
                "modality_detected": modality,
                "predictions": predictions,
                "localization": { "x": 50, "y": 50 } # No GradCAM for CLIP yet (complex), defaulting center
            }

    except Exception as e:
        print(f"Error analyzing image: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Clean up old processes if needed manually
    uvicorn.run(app, host="0.0.0.0", port=8000)
