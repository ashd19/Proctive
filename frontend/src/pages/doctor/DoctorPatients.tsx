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
    if (!services.patientRecords || !services.auditLog || !address) return;

    try {
      toast.loading("Loading record...");
      const data = await services.patientRecords.getRecordData(record);

      // Log the access
      if (address) {
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

      // Display the record
      const recordWindow = window.open("", "_blank");
      if (recordWindow) {
        recordWindow.document.write(`
          <html>
            <head>
              <title>${data.title || "Medical Record"}</title>
              <style>
                body { font-family: system-ui; padding: 2rem; max-width: 800px; margin: 0 auto; }
                h1 { color: #1e293b; }
                .metadata { background: #f1f5f9; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
                .content { white-space: pre-wrap; line-height: 1.6; }
              </style>
            </head>
            <body>
              <h1>${data.title || "Medical Record"}</h1>
              <div class="metadata">
                <strong>Type:</strong> ${data.type || "N/A"}<br>
                <strong>Date:</strong> ${data.date || "N/A"}
              </div>
              <div class="content">${
                data.content || data.description || "No content"
              }</div>
            </body>
          </html>
        `);
      }

      toast.success("✓ Record accessed and logged");
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
        {selectedPatient && patientRecords.length > 0 && (
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

              <div className="space-y-4">
                {patientRecords.map((record) => (
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
  doctorAddress,
}: any) {
  const [requesting, setRequesting] = useState(false);
  const [patientAddress, setPatientAddress] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("30");

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
      await services.accessControl.requestConsent(
        patientAddress,
        doctorAddress,
        purpose,
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
