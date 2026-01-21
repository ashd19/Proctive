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

// Demo records for showcase when no real records are available
const demoRecords: Partial<MedicalRecord>[] = [
  {
    id: 101,
    patient: "0x0000000000000000000000000000000000DEMO",
    createdBy: "0x00000000000000000000000000000000DEMO01",
    recordType: 3, // Imaging
    ipfsHash: "QmXRayDICOMHash1234567890abcdef",
    encryptedKey: "demo-encrypted-key-dicom",
    metadataHash: "demo-metadata-hash-1",
    createdAt: 1737331200, // Jan 20, 2026
    updatedAt: 1737331200,
    isActive: true,
    metadata: {
      title: "Chest X-Ray (DICOM) - Demo",
      description:
        "DICOM format chest x-ray showing no acute cardiopulmonary disease. Original file: chest_xray.dcm converted to JSON for IPFS storage.",
      recordType: "Imaging",
      hospitalName: "City General Hospital",
      doctorName: "Dr. Jane Doe",
      tags: ["x-ray", "dicom", ".dcm", "imaging", "demo"],
    },
  },
  {
    id: 102,
    patient: "0x0000000000000000000000000000000000DEMO",
    createdBy: "0x00000000000000000000000000000000DEMO02",
    recordType: 2, // Lab Result
    ipfsHash: "QmBloodTestPDFHash0987654321fedcba",
    encryptedKey: "demo-encrypted-key-pdf",
    metadataHash: "demo-metadata-hash-2",
    createdAt: 1737244800, // Jan 19, 2026
    updatedAt: 1737244800,
    isActive: true,
    metadata: {
      title: "Complete Blood Count (PDF) - Demo",
      description:
        "Blood test results in PDF format. CBC showing normal ranges - WBC: 7.2, RBC: 4.8, Hemoglobin: 14.5. Original: blood_test_results.pdf converted to JSON.",
      recordType: "Lab Result",
      hospitalName: "Central Diagnostics Lab",
      doctorName: "Dr. Alan Smith",
      tags: ["lab", "blood test", "pdf", ".pdf", "cbc", "demo"],
    },
  },
  {
    id: 103,
    patient: "0x0000000000000000000000000000000000DEMO",
    createdBy: "0x00000000000000000000000000000000DEMO03",
    recordType: 3, // Imaging
    ipfsHash: "QmBrainMRINIfTIHash2468101214abcd",
    encryptedKey: "demo-encrypted-key-nifti",
    metadataHash: "demo-metadata-hash-3",
    createdAt: 1737158400, // Jan 18, 2026
    updatedAt: 1737158400,
    isActive: true,
    metadata: {
      title: "Brain MRI Scan (NIfTI) - Demo",
      description:
        "3D brain MRI in NIfTI format. T1-weighted structural scan showing normal brain anatomy. Original: brain_scan.nii.gz converted to JSON.",
      recordType: "Imaging",
      hospitalName: "Advanced Imaging Center",
      doctorName: "Dr. Robert Chen",
      tags: [
        "mri",
        "nifti",
        ".nii",
        ".nii.gz",
        "brain",
        "neuroimaging",
        "demo",
      ],
    },
  },
  {
    id: 104,
    patient: "0x0000000000000000000000000000000000DEMO",
    createdBy: "0x00000000000000000000000000000000DEMO04",
    recordType: 1, // Prescription
    ipfsHash: "QmPrescriptionHL7Hash1357924680efgh",
    encryptedKey: "demo-encrypted-key-hl7",
    metadataHash: "demo-metadata-hash-4",
    createdAt: 1737072000, // Jan 17, 2026
    updatedAt: 1737072000,
    isActive: true,
    metadata: {
      title: "Prescription Record (HL7) - Demo",
      description:
        "HL7 v2.x prescription message for hypertension medication. Lisinopril 10mg once daily. Original: prescription.hl7 converted to JSON.",
      recordType: "Prescription",
      hospitalName: "City General Hospital",
      doctorName: "Dr. Sarah Williams",
      tags: [
        "prescription",
        "hl7",
        ".hl7",
        "medication",
        "hypertension",
        "demo",
      ],
    },
  },
  {
    id: 105,
    patient: "0x0000000000000000000000000000000000DEMO",
    createdBy: "0x00000000000000000000000000000000DEMO05",
    recordType: 2, // Lab Result
    ipfsHash: "QmUrinalysisJSONHash9876543210ijkl",
    encryptedKey: "demo-encrypted-key-json",
    metadataHash: "demo-metadata-hash-5",
    createdAt: 1736985600, // Jan 16, 2026
    updatedAt: 1736985600,
    isActive: true,
    metadata: {
      title: "Urinalysis Report (JSON) - Demo",
      description:
        "Direct JSON upload of urinalysis results. pH: 6.5, Specific Gravity: 1.020, Glucose: Negative, Protein: Negative. Original: urinalysis.json",
      recordType: "Lab Result",
      hospitalName: "QuickLab Diagnostics",
      doctorName: "Dr. Michael Lee",
      tags: ["lab", "urinalysis", "json", ".json", "demo"],
    },
  },
  {
    id: 106,
    patient: "0x0000000000000000000000000000000000DEMO",
    createdBy: "0x00000000000000000000000000000000DEMO06",
    recordType: 4, // Surgery
    ipfsHash: "QmSurgeryReportPDFHashmnopqrst1234",
    encryptedKey: "demo-encrypted-key-surgery",
    metadataHash: "demo-metadata-hash-6",
    createdAt: 1736899200, // Jan 15, 2026
    updatedAt: 1736899200,
    isActive: true,
    metadata: {
      title: "Appendectomy Surgery Report (PDF) - Demo",
      description:
        "Post-operative report for laparoscopic appendectomy. Procedure completed successfully, no complications. Original: surgery_report.pdf converted to JSON.",
      recordType: "Surgery",
      hospitalName: "Metropolitan Surgical Center",
      doctorName: "Dr. Patricia Martinez",
      tags: [
        "surgery",
        "appendectomy",
        "pdf",
        ".pdf",
        "operative report",
        "demo",
      ],
    },
  },
];

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
        // If there are no real patient records available, show demo data for showcase
        if (!patientRecords || patientRecords.length === 0) {
          // Cast demoRecords to the expected type
          setRecords(demoRecords as MedicalRecord[]);
        } else {
          setRecords(patientRecords);
        }
      } catch (error: any) {
        console.error("Error loading records:", error);
        toast.error(error.message || "Failed to load medical records");
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
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Upload Record
          </button>
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

      {/* Modals - content truncated for size */}
    </div>
  );
}
