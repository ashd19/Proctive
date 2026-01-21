import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Loader, Eye, FileText, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useServices } from "../../services/useServices";
import { useWalletStore } from "../../store/walletStore";
import { MedicalRecord } from "../../services/patientRecordsService";

export default function DoctorPatients() {
  const { services, loading: servicesLoading } = useServices();
  const { address } = useWalletStore();

  const [accessiblePatients, setAccessiblePatients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      if (!services.accessControl || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const patients =
          await services.accessControl.getRequesterAccessiblePatients(address);
        setAccessiblePatients(patients);
      } catch (error: any) {
        console.error("Error loading patients:", error);
        toast.error(error.message || "Failed to load patients");
      } finally {
        setLoading(false);
      }
    }

    if (!servicesLoading) {
      loadPatients();
    }
  }, [services.accessControl, address, servicesLoading]);

  const handleViewRecords = async (patientAddress: string) => {
    if (!services.patientRecords) return;

    try {
      setLoadingRecords(true);
      setSelectedPatient(patientAddress);
      const records = await services.patientRecords.getPatientRecords(
        patientAddress,
      );
      setPatientRecords(records);
    } catch (error: any) {
      console.error("Error loading records:", error);
      toast.error(error.message || "Failed to load patient records");
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleViewRecord = async (record: MedicalRecord) => {
    if (!services.patientRecords || !address) return;

    try {
      toast.loading("Loading record...");
      const data = await services.patientRecords.getRecordData(record);

      // Log the access - wait for transaction to succeed
      if (address && services.auditLog) {
        toast.loading("Logging access to blockchain...");
        await services.auditLog.logAccess(
          record.patient,
          record.id,
          0, // VIEW access type
          "Doctor",
          "doctor",
          record.metadata.hospitalName || "Hospital",
          "browser",
          navigator.userAgent.substring(0, 50),
        );
      }

      toast.dismiss();
      toast.success("✓ Access logged successfully");

      // Display the record
      const recordWindow = window.open("", "_blank");
      if (recordWindow) {
        // Check if data contains file information (PDF or image)
        const isFile = data.fileData || data.mimeType || data.fileName;
        const mimeType = data.mimeType || "";

        if (isFile && mimeType.includes("pdf")) {
          // Display PDF
          const pdfUrl =
            data.fileUrl ||
            `https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`;
          recordWindow.document.write(`
            <html>
              <head>
                <title>${
                  data.title || data.fileName || "PDF Medical Record"
                }</title>
                <style>
                  body { margin: 0; padding: 0; height: 100vh; display: flex; flex-direction: column; }
                  .header { background: #1e293b; color: white; padding: 1rem; text-align: center; display: flex; justify-content: space-between; align-items: center; }
                  .header-info { flex: 1; }
                  .actions { display: flex; gap: 0.5rem; }
                  .btn { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 0.5rem; }
                  .btn:hover { background: #2563eb; }
                  iframe { flex: 1; border: none; }
                </style>
              </head>
              <body>
                <div class="header">
                  <div class="header-info">
                    <h2 style="margin: 0;">${
                      data.title || data.fileName || "PDF Medical Record"
                    }</h2>
                    <p style="margin: 0.25rem 0 0 0; font-size: 14px;">Type: PDF Document | Size: ${
                      data.fileSize
                        ? Math.round(data.fileSize / 1024) + " KB"
                        : "N/A"
                    }</p>
                  </div>
                  <div class="actions">
                    <button class="btn" onclick="window.open('${pdfUrl}', '_blank')">📥 Download</button>
                    <button class="btn" onclick="navigator.clipboard.writeText('${pdfUrl}').then(() => alert('Link copied to clipboard!'))">📋 Copy Link</button>
                  </div>
                </div>
                <iframe src="${pdfUrl}" type="application/pdf"></iframe>
              </body>
            </html>
          `);
        } else if (isFile && mimeType.includes("image")) {
          // Display Image
          const imageUrl =
            data.fileUrl ||
            `https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`;
          recordWindow.document.write(`
            <html>
              <head>
                <title>${data.title || data.fileName || "Medical Image"}</title>
                <style>
                  body { font-family: system-ui; padding: 0; margin: 0; background: #f1f5f9; }
                  .header { background: #1e293b; color: white; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
                  .header-info { flex: 1; }
                  .actions { display: flex; gap: 0.5rem; }
                  .btn { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 0.5rem; }
                  .btn:hover { background: #2563eb; }
                  .image-container { padding: 2rem; text-align: center; }
                  img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                </style>
              </head>
              <body>
                <div class="header">
                  <div class="header-info">
                    <h2 style="margin: 0;">${
                      data.title || data.fileName || "Medical Image"
                    }</h2>
                    <p style="margin: 0.25rem 0 0 0;">Type: ${mimeType} | Size: ${
            data.fileSize ? Math.round(data.fileSize / 1024) + " KB" : "N/A"
          }</p>
                  </div>
                  <div class="actions">
                    <a href="${imageUrl}" download="${
            data.fileName || "medical-image"
          }" class="btn" style="text-decoration: none;">📥 Download</a>
                    <button class="btn" onclick="navigator.clipboard.writeText('${imageUrl}').then(() => alert('Link copied to clipboard!'))">📋 Copy Link</button>
                  </div>
                </div>
                <div class="image-container">
                  <img src="${imageUrl}" alt="Medical Image" />
                </div>
              </body>
            </html>
          `);
        } else {
          // Display JSON/Text Data
          const contentHtml =
            typeof data === "object"
              ? `<pre id="recordData">${JSON.stringify(data, null, 2)}</pre>`
              : data.content ||
                data.description ||
                data.notes ||
                JSON.stringify(data);

          const jsonData =
            typeof data === "object"
              ? JSON.stringify(data, null, 2)
              : contentHtml;

          recordWindow.document.write(`
            <html>
              <head>
                <title>${data.title || "Medical Record"}</title>
                <style>
                  body { font-family: system-ui; padding: 2rem; max-width: 900px; margin: 0 auto; background: #f8fafc; }
                  .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                  h1 { color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 0.5rem; margin: 0; }
                  .actions { display: flex; gap: 0.5rem; }
                  .btn { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 14px; }
                  .btn:hover { background: #2563eb; }
                  .metadata { background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                  .metadata-item { margin: 0.5rem 0; }
                  .metadata-label { font-weight: 600; color: #475569; }
                  .content { background: white; padding: 1.5rem; border-radius: 8px; line-height: 1.8; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                  pre { background: #f1f5f9; padding: 1rem; border-radius: 4px; overflow-x: auto; }
                </style>
                <script>
                  function copyContent() {
                    const content = ${JSON.stringify(jsonData)};
                    navigator.clipboard.writeText(content).then(() => {
                      alert('Record data copied to clipboard!');
                    }).catch(err => {
                      console.error('Copy failed:', err);
                      alert('Failed to copy. Please select and copy manually.');
                    });
                  }
                  
                  function downloadContent() {
                    const content = ${JSON.stringify(jsonData)};
                    const blob = new Blob([content], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = '${(data.title || "medical-record").replace(
                      /[^a-z0-9]/gi,
                      "-",
                    )}.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                </script>
              </head>
              <body>
                <div class="header-actions">
                  <h1>${data.title || "Medical Record"}</h1>
                  <div class="actions">
                    <button class="btn" onclick="copyContent()">📋 Copy Data</button>
                    <button class="btn" onclick="downloadContent()">📥 Download JSON</button>
                  </div>
                </div>
                <div class="metadata">
                  <div class="metadata-item"><span class="metadata-label">Type:</span> ${
                    data.recordType || record.metadata.recordType || "N/A"
                  }</div>
                  <div class="metadata-item"><span class="metadata-label">Hospital:</span> ${
                    data.hospitalName || record.metadata.hospitalName || "N/A"
                  }</div>
                  <div class="metadata-item"><span class="metadata-label">Doctor:</span> ${
                    data.doctorName || record.metadata.doctorName || "N/A"
                  }</div>
                  <div class="metadata-item"><span class="metadata-label">Date:</span> ${new Date(
                    record.createdAt * 1000,
                  ).toLocaleDateString()}</div>
                  ${
                    data.diagnosis
                      ? `<div class="metadata-item"><span class="metadata-label">Diagnosis:</span> ${data.diagnosis}</div>`
                      : ""
                  }
                  ${
                    data.treatment
                      ? `<div class="metadata-item"><span class="metadata-label">Treatment:</span> ${data.treatment}</div>`
                      : ""
                  }
                </div>
                <div class="content">${contentHtml}</div>
              </body>
            </html>
          `);
        }
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to view record");
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              My Patients
            </h1>
            <p className="text-slate-600">Patients you have access to</p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Request Access
          </button>
        </div>

        {accessiblePatients.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No patients yet
            </h3>
            <p className="text-slate-600 mb-6">
              Request access to a patient to get started
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Request Access
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessiblePatients.map((patientAddress, idx) => (
              <motion.div
                key={patientAddress}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Patient
                    </h3>
                    <p className="text-sm text-slate-600 font-mono">
                      {patientAddress.slice(0, 6)}...{patientAddress.slice(-4)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleViewRecords(patientAddress)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                  disabled={
                    loadingRecords && selectedPatient === patientAddress
                  }
                >
                  {loadingRecords && selectedPatient === patientAddress ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      View Records
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Patient Records Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Patient Records
                  </h2>
                  <p className="text-sm text-slate-600 font-mono">
                    {selectedPatient.slice(0, 10)}...{selectedPatient.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientRecords([]);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {loadingRecords ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : patientRecords.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No records found
                  </h3>
                  <p className="text-slate-600">
                    This patient hasn't uploaded any medical records yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientRecords
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((record) => (
                      <div
                        key={record.id}
                        className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {record.metadata.title}
                            </h3>
                            <p className="text-sm text-slate-600 mb-2">
                              {record.metadata.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>Type: {record.metadata.recordType}</span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  record.createdAt * 1000,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewRecord(record)}
                            className="btn-secondary flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Request Consent Modal */}
      <RequestConsentModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          setShowRequestModal(false);
          if (services.accessControl && address) {
            services.accessControl
              .getRequesterAccessiblePatients(address)
              .then(setAccessiblePatients);
          }
        }}
        services={services}
        doctorAddress={address || ""}
      />
    </div>
  );
}

function RequestConsentModal({
  isOpen,
  onClose,
  onSuccess,
  services,
  doctorAddress: _doctorAddress,
}: any) {
  const [requesting, setRequesting] = useState(false);
  const [patientAddress, setPatientAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("30");
  const [institutionName, setInstitutionName] = useState("General Hospital");
  const [accessLevel, setAccessLevel] = useState("2"); // VIEW_AND_DOWNLOAD

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!services.accessControl) {
      toast.error("Services not initialized");
      return;
    }

    try {
      setRequesting(true);
      toast.loading("Requesting consent on blockchain...");

      const durationDays = parseInt(duration);
      const level = parseInt(accessLevel);

      // Request all records (empty array means all)
      const recordIds: number[] = [];

      await services.accessControl.requestConsent(
        patientAddress,
        recordIds,
        level,
        purpose,
        institutionName,
        durationDays,
      );

      toast.dismiss();
      toast.success("✓ Consent request sent!");
      onSuccess();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to request consent");
    } finally {
      setRequesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Request Patient Consent
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Patient Address
            </label>
            <input
              type="text"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Access Level
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="1">View Only</option>
              <option value="2">View and Download</option>
              <option value="3">Full Access</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g., General Hospital"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Purpose
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Reason for accessing patient records..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="365"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={requesting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={requesting}
            >
              {requesting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Request
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
