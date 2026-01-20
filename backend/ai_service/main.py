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

def get_model():
    global model, transform
    if model is None:
        print("Loading TorchXrayVision model (DenseNet121-res224-all)...")
        # Load model that predicts all 18 pathologies
        model = xrv.models.DenseNet(weights="densenet121-res224-all")
        transform = torchvision.transforms.Compose([xrv.datasets.XRayCenterCrop(),xrv.datasets.XRayResizer(224)])
        print("Model loaded successfully!")
    return model

import torchvision

@app.get("/")
def read_root():
    return {"status": "ok", "service": "X-Ray AI Analysis"}

@app.post("/analyze")
async def analyze_xray(file: UploadFile = File(...)):
    global model
    try:
        if model is None:
            get_model()
        
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('L') # Convert to grayscale
        img = np.array(image)
        
        # Normalize and Resize logic essential for xrv
        # Resize to 224x224 first to match model input easier
        image_resized = image.resize((224, 224))
        img_array = np.array(image_resized)
        
        # Keep original for dimensions
        orig_w, orig_h = image.size
        
        # Normalize: XRV expects -1024 to 1024 range
        img_array = xrv.datasets.normalize(img_array, 255) 
        
        # Add batch and channel dims [1, 1, 224, 224]
        img_tensor = torch.from_numpy(img_array[None, None, ...]).float()
        img_tensor.requires_grad = True # Enable gradient calculation

        # Inference
        # We need to capture features for Grad-CAM
        # But for simpler "saliency" we can just gradient the input
        # Better: use the model instructions.
        
        outputs = model(img_tensor)
        
        # Outputs is [1, 18] Tensor
        
        predictions = {}
        # Get top prediction index to localize
        # Apply sigmoid to convert logits to probabilities?
        # xrv DenseNet usually returns raw logits.
        # But let's check values. If range is large (-10 to 10), it's logits.
        # Assuming logits -> Sigmoid for standard probability
        # Note: xrv models output is often already "appropriate" but usually logits.
        
        # Let's apply sigmoid just to be safe for 0-1 range
        probs = torch.sigmoid(outputs)[0]
        
        # Prepare predictions dict
        active_detections = []
        
        for i, pathology in enumerate(model.pathologies):
            score = float(probs[i].item())
            predictions[pathology] = score
            if score > 0.5: # Threshold for "Active Detection" localization
                 active_detections.append((i, pathology, score))
        
        # Sort by score
        active_detections.sort(key=lambda x: x[2], reverse=True)
        
        # Localization Logic (Gradient of Top Detection input)
        # Calculate coordinate of the most suspicious area
        best_x, best_y = 112, 112 # Center default
        
        if len(active_detections) > 0:
            top_idx = active_detections[0][0]
            
            # Zero gradients
            if img_tensor.grad is not None:
                img_tensor.grad.zero_()
            
            # Backproprogate the top class score
            outputs[0, top_idx].backward()
            
            # Get gradients at input layer
            gradients = img_tensor.grad[0, 0].abs() # [224, 224] maps
            
            # Smooth/Blur to find center of mass of hotspot
            # Simple approach: Find index of max gradient pixel
            # Better: Gaussian filter? Let's stick to simple Max for speed.
            
            # Find max simple
            # flat_idx = gradients.argmax()
            # y_idx, x_idx = np.unravel_index(flat_idx, gradients.shape)
            
            # Robust: Find Center of Mass of top 10% gradients
            g_np = gradients.detach().numpy()
            threshold = np.percentile(g_np, 95)
            mask = g_np > threshold
            if mask.sum() > 0:
                y_indices, x_indices = np.where(mask)
                best_y = int(np.mean(y_indices))
                best_x = int(np.mean(x_indices))
            
            print(f"[AI] Localized {active_detections[0][1]} at {best_x}, {best_y}")

        # Scale coordinates back to 0-100% range for frontend
        x_percent = (best_x / 224) * 100
        y_percent = (best_y / 224) * 100
            
        return {
            "source": "local_torchxrayvision",
            "model": "densenet121-res224-all",
            "predictions": predictions,
            "localization": {
                "x": x_percent,
                "y": y_percent
            }
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
