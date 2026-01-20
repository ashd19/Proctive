import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Copy,
  Download,
  FileCode,
  Upload,
  Database,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useServices } from "../../services/useServices";
import { useWalletStore } from "../../store/walletStore";

export default function ConvertToJson() {
  const { address, isConnected } = useWalletStore();
  const { services, loading: servicesLoading } = useServices();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const [jsonString, setJsonString] = useState<string>("");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    recordType: "",
    description: "",
  });

  const SUPPORTED_FORMATS = [
    ".dcm",
    ".dicom", // DICOM medical imaging
    ".nii",
    ".nii.gz", // NIfTI brain imaging
    ".hl7",
    ".xml", // HL7 clinical data
    ".pdf", // PDF documents
    ".jpg",
    ".jpeg",
    ".png", // Medical images
    ".json", // Direct JSON upload
  ];

  const validateAndSetFile = async (selectedFile?: File) => {
    if (!selectedFile) return;

    const fileExt = selectedFile.name.toLowerCase();
    const isSupported = SUPPORTED_FORMATS.some((ext) => fileExt.endsWith(ext));

    if (!isSupported) {
      toast.error(
        `Unsupported file type. Supported formats: ${SUPPORTED_FORMATS.join(
          ", ",
        )}`,
      );
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setFile(selectedFile);

    // If it's a JSON file, load it directly
    if (fileExt.endsWith(".json")) {
      try {
        const text = await selectedFile.text();
        const parsed = JSON.parse(text);
        setJsonData(parsed);
        setJsonString(JSON.stringify(parsed, null, 2));
        toast.success("JSON file loaded successfully!");
      } catch (error) {
        toast.error("Invalid JSON file");
        setFile(null);
      }
    } else {
      setJsonData(null);
      setJsonString("");
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

  const convertToJson = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setConverting(true);
    try {
      toast.loading("Converting file to JSON...", { id: "convert" });
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:5000/api/medical/convert",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Conversion failed");
      }

      const result = await response.json();
      setJsonData(result);
      const formatted = JSON.stringify(result, null, 2);
      setJsonString(formatted);

      toast.success("File converted to JSON successfully!", { id: "convert" });
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert: " + (error as Error).message, {
        id: "convert",
      });
    } finally {
      setConverting(false);
    }
  };

  const copyToClipboard = () => {
    if (!jsonString) return;

    navigator.clipboard
      .writeText(jsonString)
      .then(() => toast.success("JSON copied to clipboard!"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  const downloadJson = () => {
    if (!jsonString) return;

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(/\.[^/.]+$/, "")}_converted.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded!");
  };

  const resetFile = () => {
    setFile(null);
    setJsonData(null);
    setJsonString("");
    setUploadForm({ title: "", recordType: "", description: "" });
  };

  const uploadToIPFS = async () => {
    if (!jsonData || !address || !isConnected) {
      toast.error("Please connect your wallet and convert a file first");
      return;
    }

    if (!uploadForm.title || !uploadForm.recordType) {
      toast.error("Please fill in title and record type");
      return;
    }

    if (!services || !services.ipfs || !services.auditLog) {
      toast.error("Services are still loading, please wait...");
      return;
    }

    setUploading(true);
    try {
      // Step 1: Request MetaMask signature
      toast.loading("Please sign the transaction in MetaMask...", {
        id: "upload",
      });

      const message = `Upload medical data to IPFS\nTitle: ${
        uploadForm.title
      }\nType: ${
        uploadForm.recordType
      }\nTimestamp: ${new Date().toISOString()}`;

      // Request signature from MetaMask
      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error("MetaMask not found");
      }

      const signature = await provider.request({
        method: "personal_sign",
        params: [message, address],
      });

      toast.loading("Creating blockchain record...", { id: "upload" });

      // Create blockchain record (handles IPFS upload internally)
      const recordData = {
        patientId: address,
        recordType: 0, // GENERAL type
        title: uploadForm.title,
        description: uploadForm.description || "Medical Data JSON",
        hospitalName: "Patient Upload",
        doctorName: "Self",
        diagnosis: jsonData.diagnosis,
        treatment: jsonData.treatment,
        medications: jsonData.medications,
        notes: JSON.stringify(jsonData, null, 2),
        tags: [uploadForm.recordType, "JSON", "Patient Upload"],
      };

      const recordId = await services.patientRecords.createRecord(
        address,
        recordData,
      );
      console.log("Blockchain record created with ID:", recordId);

      // Log to audit trail
      toast.loading("Recording in audit log...", { id: "upload" });
      await services.auditLog.logAccess(
        address,
        recordId,
        3, // UPLOAD type
        "Patient",
        "patient",
        "Direct Upload",
        "browser",
        navigator.userAgent.substring(0, 50),
      );

      toast.success(`✓ Record created on blockchain! ID: ${recordId}`, {
        id: "upload",
        duration: 5000,
      });

      // Reset after successful upload
      setTimeout(() => {
        resetFile();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mb-4">
            <FileCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Medical File to JSON Converter & Uploader
          </h1>
          <p className="text-slate-600 mt-2">
            Convert DICOM, HL7, NIfTI to JSON or upload JSON files directly to
            IPFS
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - File Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
          >
            {/* File Upload Area */}
            <div className="p-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Medical File
              </label>

              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={handleClick}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                >
                  <input
                    ref={inputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={converting}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileCode className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-1">
                        Drop your medical file or JSON here or click to browse
                      </p>
                      <p className="text-sm text-slate-500">
                        Supports: DICOM, NIfTI, HL7, PDF, Images, JSON (Max
                        50MB)
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
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-slate-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {!converting && (
                          <button
                            onClick={resetFile}
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-slate-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Convert Button - Only show if file is not JSON */}
              {file && !file.name.toLowerCase().endsWith(".json") && (
                <button
                  onClick={convertToJson}
                  disabled={!file || converting}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25"
                >
                  {converting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <FileCode className="w-5 h-5" />
                      Convert to JSON
                    </>
                  )}
                </button>
              )}

              {/* JSON file indicator */}
              {file &&
                file.name.toLowerCase().endsWith(".json") &&
                jsonData && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      JSON file loaded! Ready to upload to IPFS
                    </p>
                  </div>
                )}
            </div>

            {/* Info Section */}
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">
                Supported Formats:
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700">DICOM (.dcm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700">NIfTI (.nii)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700">HL7 (.hl7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700">PDF (.pdf)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700">Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-slate-700">JSON (.json)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - JSON Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                JSON Output
              </h2>
              {jsonData && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={downloadJson}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {!jsonData ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center p-8"
                  >
                    <div className="text-center">
                      <FileCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">
                        Upload and convert a file to see JSON output
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="json"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col"
                  >
                    <div className="p-4 bg-green-50 border-b border-green-200 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-800 font-medium">
                        Conversion successful! {Object.keys(jsonData).length}{" "}
                        fields extracted
                      </p>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <pre className="p-6 text-xs font-mono text-slate-800 whitespace-pre-wrap break-words">
                        {jsonString}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Upload to IPFS Section */}
        <AnimatePresence>
          {jsonData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Upload JSON to IPFS & Blockchain
                    </h2>
                    <p className="text-sm text-slate-600">
                      Store converted data permanently on decentralized storage
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Connection Warning */}
                {!isConnected && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      Please connect your wallet to upload to IPFS
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Record Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, title: e.target.value })
                      }
                      placeholder="e.g., Blood Test Results - Jan 2026"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={uploading}
                    />
                  </div>

                  {/* Record Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Record Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={uploadForm.recordType}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          recordType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={uploading}
                    >
                      <option value="">Select type...</option>
                      <option value="Blood Test">Blood Test</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="MRI">MRI Scan</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="Ultrasound">Ultrasound</option>
                      <option value="DICOM Imaging">DICOM Imaging</option>
                      <option value="Brain Scan">Brain Scan (NIfTI)</option>
                      <option value="HL7 Clinical Data">
                        HL7 Clinical Data
                      </option>
                      <option value="Lab Report">Lab Report</option>
                      <option value="Pathology">Pathology</option>
                      <option value="Radiology">Radiology</option>
                      <option value="ECG">ECG/EKG</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Add any additional notes about this medical record..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={uploading}
                  />
                </div>

                {/* Upload Button */}
                <button
                  onClick={uploadToIPFS}
                  disabled={
                    uploading ||
                    !uploadForm.title ||
                    !uploadForm.recordType ||
                    !isConnected
                  }
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading to IPFS...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload JSON to IPFS & Blockchain
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Smart Conversion
            </h3>
            <p className="text-sm text-slate-600">
              Automatically detects format and extracts structured medical data
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Standards Compliant
            </h3>
            <p className="text-sm text-slate-600">
              Supports DICOM, HL7, and other healthcare data standards
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Export Options
            </h3>
            <p className="text-sm text-slate-600">
              Copy to clipboard or download JSON file for integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
