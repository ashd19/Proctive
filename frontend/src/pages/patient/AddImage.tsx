import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Loader,
  CheckCircle2,
  Database,
  AlertCircle,
  X,
  ArrowLeft,
} from "lucide-react";
import { useServices } from "../../services/useServices";
import { toast } from "react-hot-toast";
import { useWalletStore } from "../../store/walletStore";
import { Link } from "react-router-dom";

export default function AddImage() {
  const { address, isConnected } = useWalletStore();
  const { services, loading: servicesLoading } = useServices();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    recordType: "",
    description: "",
  });

  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const validateAndSetFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error("Only image files (JPEG, PNG, GIF, WebP) are allowed");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);

    if (!formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: selectedFile.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ""),
      }));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const uploadToIPFS = async () => {
    if (!file || !address || !isConnected) {
      toast.error("Please connect your wallet and select a file");
      return;
    }

    if (!formData.title || !formData.recordType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!services || !services.ipfs || !services.auditLog) {
      toast.error("Services are still loading, please wait...");
      return;
    }

    setUploading(true);
    try {
      // Step 0: Request MetaMask signature
      toast.loading("Please sign the transaction in MetaMask...", {
        id: "upload",
      });
      const message = `Upload Image to IPFS\nTitle: ${formData.title}\nType: ${
        formData.recordType
      }\nTimestamp: ${new Date().toISOString()}`;
      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error("MetaMask not found");
      }
      const signature = await provider.request({
        method: "personal_sign",
        params: [message, address],
      });

      // Step 1: Upload image to IPFS
      toast.loading("Uploading image to IPFS...", { id: "upload" });
      const imageCid = await services.ipfs.uploadToIPFS(file);

      // Step 2: Create metadata and upload to IPFS
      toast.loading("Creating metadata...", { id: "upload" });
      const imageMetadata = {
        type: "medical-image",
        metadata: {
          title: formData.title,
          recordType: formData.recordType,
          description: formData.description,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: address,
          group: "patient",
          patientAddress: address,
          imageCid,
          imageUrl: `https://gateway.pinata.cloud/ipfs/${imageCid}`,
          signature: signature,
          signedMessage: message,
        },
        imageData: {
          cid: imageCid,
          format: file.type,
          dimensions: "Unknown", // Could be extracted with canvas if needed
        },
      };

      // Step 3: Create blockchain record (handles IPFS upload internally)
      toast.loading("Creating blockchain record...", { id: "upload" });
      const recordData = {
        patientId: address,
        recordType: 3, // IMAGING type
        title: formData.title,
        description: formData.description || "Medical Image Record",
        hospitalName: "Patient Upload",
        doctorName: "Self",
        notes: JSON.stringify(imageMetadata, null, 2),
        tags: [formData.recordType, "Image", "Patient Upload"],
      };

      const recordId = await services.patientRecords.createRecord(
        address,
        recordData,
      );
      console.log("Blockchain record created with ID:", recordId);
      setIpfsHash(recordId.toString());

      // Step 4: Log to audit trail
      toast.loading("Recording in audit log...", { id: "upload" });
      await services.auditLog.logAccess(
        address,
        recordId,
        3, // UPLOAD
        "Patient",
        "patient",
        "Direct Upload",
        "browser",
        navigator.userAgent.substring(0, 50),
      );

      // Step 5: Success
      toast.success(`✓ Record created on blockchain! ID: ${recordId}`, {
        id: "upload",
        duration: 5000,
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setFile(null);
        setPreviewUrl(null);
        setFormData({ title: "", recordType: "", description: "" });
        setIpfsHash(null);
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload: " + (error as Error).message, {
        id: "upload",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setIpfsHash(null);
    setFormData({ title: "", recordType: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/patient/records"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Records
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 mb-4">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Upload Medical Image
          </h1>
          <p className="text-slate-600 mt-2">
            Add a new medical imaging record to IPFS and blockchain
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* File Upload Area */}
          <div className="p-8 border-b border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Select Image File
            </label>

            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleClick}
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer group"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-10 h-10 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900 mb-1">
                      Drop your medical image here or click to browse
                    </p>
                    <p className="text-sm text-slate-500">
                      Supports: JPEG, PNG, GIF, WebP (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-slate-200 rounded-xl p-6 bg-slate-50"
              >
                <div className="flex items-start gap-4">
                  {/* Preview Image */}
                  <div className="flex-shrink-0">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200"
                      />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {!uploading && !ipfsHash && (
                        <button
                          onClick={resetFile}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-600" />
                        </button>
                      )}
                    </div>

                    {/* IPFS Hash Display */}
                    <AnimatePresence>
                      {ipfsHash && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4"
                        >
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-800 mb-1">
                                  Successfully uploaded to IPFS!
                                </p>
                                <p className="text-xs text-green-700 font-mono break-all mb-2">
                                  {ipfsHash}
                                </p>
                                <a
                                  href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-green-700 hover:text-green-800 underline"
                                >
                                  View on IPFS →
                                </a>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Form Fields */}
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Chest X-Ray, MRI Scan"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Record Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.recordType}
                onChange={(e) =>
                  setFormData({ ...formData, recordType: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={uploading}
              >
                <option value="">Select type...</option>
                <option value="Imaging">Medical Imaging</option>
                <option value="X-Ray">X-Ray</option>
                <option value="MRI">MRI Scan</option>
                <option value="CT-Scan">CT Scan</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="Lab-Image">Lab Result Image</option>
                <option value="Surgery-Photo">Surgical Photo</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add any additional notes about this medical image..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 bg-slate-50 border-t border-slate-200 flex gap-4">
            <button
              onClick={resetFile}
              disabled={uploading || !file}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              onClick={uploadToIPFS}
              disabled={
                uploading || !file || !formData.title || !formData.recordType
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading to IPFS...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Upload to IPFS & Blockchain
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {!isConnected && (
            <div className="p-4 bg-amber-50 border-t border-amber-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Please connect your wallet to upload files
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">IPFS Storage</h3>
            <p className="text-sm text-slate-600">
              Images are stored on IPFS for permanent, decentralized access
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Verified</h3>
            <p className="text-sm text-slate-600">
              All uploads are cryptographically verified and immutable
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
              <ImageIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">High Quality</h3>
            <p className="text-sm text-slate-600">
              Original image quality preserved with no compression
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
