import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Search,
  Eye,
  Download,
  Clock,
  Building2,
  User,
  Tag,
  Plus,
  X,
  Image,
  Stethoscope,
  Pill,
  TestTube,
  Syringe,
  Heart,
  AlertTriangle,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useServices } from "../../services/useServices";
import { useWalletStore } from "../../store/walletStore";
import { MedicalRecord } from "../../services/patientRecordsService";

const recordTypeConfig = {
  0: { label: "General", icon: FileText, color: "bg-slate-500" },
  1: { label: "Prescription", icon: Pill, color: "bg-blue-500" },
  2: { label: "Lab Result", icon: TestTube, color: "bg-purple-500" },
  3: { label: "Imaging", icon: Image, color: "bg-indigo-500" },
  4: { label: "Surgery", icon: Stethoscope, color: "bg-red-500" },
  5: { label: "Vaccination", icon: Syringe, color: "bg-green-500" },
  6: { label: "Allergy", icon: AlertTriangle, color: "bg-amber-500" },
  7: { label: "Chronic Condition", icon: Heart, color: "bg-pink-500" },
};

export default function PatientRecords() {
  const { services, loading: servicesLoading } = useServices();
  const { address } = useWalletStore();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<number | "all">("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [viewingRecordData, setViewingRecordData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    recordType: 0,
    title: "",
    description: "",
    hospitalName: "",
    doctorName: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  // Load patient records
  useEffect(() => {
    async function loadRecords() {
      if (!services.patientRecords || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const patientRecords = await services.patientRecords.getPatientRecords(
          address,
        );
        setRecords(patientRecords);
      } catch (error: any) {
        console.error("Error loading records:", error);
        // Suppress toast error since service may still be initializing
        // toast.error(error.message || "Failed to load medical records");
      } finally {
        setLoading(false);
      }
    }

    if (!servicesLoading) {
      loadRecords();
    }
  }, [services.patientRecords, address, servicesLoading]);

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.metadata.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.metadata.doctorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.metadata.hospitalName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "all" || record.recordType === selectedType;

    return matchesSearch && matchesType;
  });

  // View record details
  const handleViewRecord = async (record: MedicalRecord) => {
    setViewingRecord(record);
    setViewingRecordData(null);

    try {
      if (services.patientRecords) {
        const data = await services.patientRecords.getRecordData(record);
        setViewingRecordData(data);
      }
    } catch (error: any) {
      console.error("Error fetching record data:", error);
      toast.error("Failed to decrypt record data");
    }
  };

  // Download record
  const handleDownload = async (record: MedicalRecord) => {
    try {
      toast.loading("Downloading record...");

      if (!services.patientRecords) {
        throw new Error("Services not initialized");
      }

      const data = await services.patientRecords.getRecordData(record);

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${record.metadata.title.replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Record downloaded successfully");

      // Log the download
      if (services.auditLog && address) {
        await services.auditLog.logAccess(
          address,
          record.id,
          1,
          "Patient",
          "patient",
          record.metadata.hospitalName || "Direct Upload",
          "browser",
          navigator.userAgent.substring(0, 50),
        );
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to download record");
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!address || !services.patientRecords) {
      toast.error("Please connect your wallet");
      return;
    }

    if (
      !uploadForm.title ||
      !uploadForm.hospitalName ||
      !uploadForm.doctorName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setUploading(true);
      toast.loading("Uploading to IPFS and blockchain...");

      const recordData = {
        patientId: address,
        recordType: uploadForm.recordType,
        title: uploadForm.title,
        description: uploadForm.description,
        hospitalName: uploadForm.hospitalName,
        doctorName: uploadForm.doctorName,
        diagnosis: uploadForm.diagnosis,
        treatment: uploadForm.treatment,
        notes: uploadForm.notes,
        tags: uploadForm.tags,
        timestamp: Date.now(),
      };

      const recordId = await services.patientRecords.createRecord(
        address,
        recordData,
      );

      toast.dismiss();
      toast.success(
        `Record uploaded! ID: ${recordId} - Stored on IPFS & Blockchain`,
      );

      // Reload records
      const updatedRecords = await services.patientRecords.getPatientRecords(
        address,
      );
      setRecords(updatedRecords);

      // Reset form
      setUploadForm({
        recordType: 0,
        title: "",
        description: "",
        hospitalName: "",
        doctorName: "",
        diagnosis: "",
        treatment: "",
        notes: "",
        tags: [],
      });
      setTagInput("");
      setShowUploadModal(false);
    } catch (error: any) {
      toast.dismiss();
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload record");
    } finally {
      setUploading(false);
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !uploadForm.tags.includes(tagInput.trim())) {
      setUploadForm({
        ...uploadForm,
        tags: [...uploadForm.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setUploadForm({
      ...uploadForm,
      tags: uploadForm.tags.filter((t) => t !== tag),
    });
  };

  if (servicesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Medical Records
            </h1>
            <p className="text-slate-600">
              {records.length} record{records.length !== 1 ? "s" : ""} stored on
              blockchain
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/patient/addpdf"
              className="btn-primary flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Upload PDF
            </Link>
            <Link
              to="/patient/addimage"
              className="btn-primary flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              <Image className="w-5 h-5" />
              Upload Image
            </Link>
            <Link
              to="/patient/convert"
              className="btn-primary flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <FileText className="w-5 h-5" />
              Upload/Convert JSON
            </Link>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Quick Upload
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {Object.entries(recordTypeConfig).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {records.length === 0
                ? "No medical records yet"
                : "No records found"}
            </h3>
            <p className="text-slate-600 mb-6">
              {records.length === 0
                ? "Upload your first medical record to get started"
                : "Try adjusting your search or filters"}
            </p>
            {records.length === 0 && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Upload Record
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRecords.map((record) => {
              const config =
                recordTypeConfig[
                  record.recordType as keyof typeof recordTypeConfig
                ];
              const Icon = config?.icon || FileText;

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`${
                        config?.color || "bg-slate-500"
                      } p-3 rounded-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {record.metadata.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {record.metadata.description}
                          </p>
                        </div>
                        <span
                          className={`${
                            config?.color || "bg-slate-500"
                          } text-white text-xs px-3 py-1 rounded-full whitespace-nowrap`}
                        >
                          {config?.label || "Unknown"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {record.metadata.hospitalName}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {record.metadata.doctorName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(
                            record.createdAt * 1000,
                          ).toLocaleDateString()}
                        </div>
                      </div>

                      {record.metadata.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <div className="flex gap-2 flex-wrap">
                            {record.metadata.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(record)}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Upload Medical Record
                </h2>
                <button
                  onClick={() => !uploading && setShowUploadModal(false)}
                  disabled={uploading}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Record Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Record Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadForm.recordType}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        recordType: Number(e.target.value),
                      })
                    }
                    disabled={uploading}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.entries(recordTypeConfig).map(([type, config]) => (
                      <option key={type} value={type}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
                    disabled={uploading}
                    placeholder="e.g., Annual Physical Exam"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
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
                    disabled={uploading}
                    rows={3}
                    placeholder="Brief description of the medical record..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Hospital Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.hospitalName}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        hospitalName: e.target.value,
                      })
                    }
                    disabled={uploading}
                    placeholder="e.g., City General Hospital"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Doctor Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Doctor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.doctorName}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        doctorName: e.target.value,
                      })
                    }
                    disabled={uploading}
                    placeholder="e.g., Dr. Smith"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    value={uploadForm.diagnosis}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        diagnosis: e.target.value,
                      })
                    }
                    disabled={uploading}
                    placeholder="e.g., Hypertension"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Treatment */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Treatment
                  </label>
                  <input
                    type="text"
                    value={uploadForm.treatment}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        treatment: e.target.value,
                      })
                    }
                    disabled={uploading}
                    placeholder="e.g., Medication prescribed"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={uploadForm.notes}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, notes: e.target.value })
                    }
                    disabled={uploading}
                    rows={3}
                    placeholder="Additional notes..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      disabled={uploading}
                      placeholder="Add a tag and press Enter"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddTag}
                      disabled={uploading}
                      className="btn-secondary"
                    >
                      Add
                    </button>
                  </div>
                  {uploadForm.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {uploadForm.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            disabled={uploading}
                            className="hover:text-primary-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading to IPFS...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload to IPFS & Blockchain
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Record Modal */}
      <AnimatePresence>
        {viewingRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewingRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {viewingRecord.metadata.title}
                </h2>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      IPFS Hash
                    </h3>
                    <p className="text-sm text-slate-600 font-mono bg-slate-50 p-2 rounded">
                      {viewingRecord.ipfsHash}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </h3>
                    <p className="text-slate-600">
                      {viewingRecord.metadata.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Hospital</p>
                        <p className="text-slate-900">
                          {viewingRecord.metadata.hospitalName}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Doctor</p>
                        <p className="text-slate-900">
                          {viewingRecord.metadata.doctorName}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Created</p>
                        <p className="text-slate-900">
                          {new Date(
                            viewingRecord.createdAt * 1000,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Record ID</p>
                        <p className="text-slate-900">#{viewingRecord.id}</p>
                      </div>
                    </div>
                  </div>
                  {viewingRecordData && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">
                        Decrypted Data
                      </h3>
                      <pre className="text-xs bg-slate-50 p-4 rounded overflow-x-auto">
                        {JSON.stringify(viewingRecordData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Modals - content truncated for size */}
    </div>
  );
}
