import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Loader,
  FileText,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import { useServices } from "../../services/useServices";
import { useWalletStore } from "../../store/walletStore";
import {
  EmergencySession,
  EmergencyStatus,
} from "../../services/emergencyAccessService";
import { MedicalRecord } from "../../services/patientRecordsService";

export default function DoctorEmergency() {
  const { services, loading: servicesLoading } = useServices();
  const { address } = useWalletStore();

  const [emergencySessions, setEmergencySessions] = useState<
    EmergencySession[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    async function loadEmergencySessions() {
      if (!services.emergencyAccess || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sessions =
          await services.emergencyAccess.getDoctorEmergencySessions(address);
        setEmergencySessions(sessions);
      } catch (error: any) {
        console.error("Error loading emergency sessions:", error);
        toast.error(error.message || "Failed to load emergency sessions");
      } finally {
        setLoading(false);
      }
    }

    if (!servicesLoading) {
      loadEmergencySessions();
    }
  }, [services.emergencyAccess, address, servicesLoading]);

  if (servicesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const activeSessions = emergencySessions.filter(
    (s) =>
      s.status === EmergencyStatus.ACTIVE ||
      s.status === EmergencyStatus.FLAGGED,
  );
  const completedSessions = emergencySessions.filter(
    (s) =>
      s.status === EmergencyStatus.COMPLETED ||
      s.status === EmergencyStatus.APPROVED ||
      s.status === EmergencyStatus.REJECTED,
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Emergency Access
            </h1>
            <p className="text-slate-600">
              Manage emergency patient access sessions
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            Start Emergency Session
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Active</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {activeSessions.length}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Currently active sessions
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Completed</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {completedSessions.length}
            </p>
            <p className="text-sm text-slate-600 mt-1">Finished sessions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Total</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {emergencySessions.length}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              All emergency sessions
            </p>
          </div>
        </div>

        {/* Emergency Sessions */}
        <div className="space-y-6">
          {/* Active */}
          {activeSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Active Emergency Sessions ({activeSessions.length})
              </h2>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    services={services}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Completed Emergency Sessions ({completedSessions.length})
              </h2>
              <div className="space-y-4">
                {completedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    services={services}
                  />
                ))}
              </div>
            </div>
          )}

          {emergencySessions.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No emergency sessions
              </h3>
              <p className="text-slate-600 mb-6">
                Start an emergency session when needed in critical situations
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn-primary bg-red-600 hover:bg-red-700 inline-flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Start Emergency Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start Emergency Session Modal */}
      <StartEmergencyModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          setShowRequestModal(false);
          if (services.emergencyAccess && address) {
            services.emergencyAccess
              .getDoctorEmergencySessions(address)
              .then(setEmergencySessions);
          }
        }}
        services={services}
        doctorAddress={address || ""}
      />
    </div>
  );
}

function SessionCard({
  session,
  services,
}: {
  session: EmergencySession;
  services: any;
}) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showRecords, setShowRecords] = useState(false);
  const [loading, setLoading] = useState(false);

  const isActive =
    session.status === EmergencyStatus.ACTIVE ||
    session.status === EmergencyStatus.FLAGGED;
  const isCompleted = session.endTime > 0;
  const duration = isCompleted
    ? Math.floor((session.endTime - session.startTime) / 60)
    : Math.floor((Date.now() / 1000 - session.startTime) / 60);

  const loadRecords = async () => {
    if (!services.patientRecords || showRecords) {
      setShowRecords(false);
      return;
    }

    try {
      setLoading(true);
      const patientRecords = await services.patientRecords.getPatientRecords(
        session.patient,
      );
      setRecords(patientRecords);
      setShowRecords(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (session.status === EmergencyStatus.ACTIVE)
      return "bg-yellow-100 border-yellow-200";
    if (session.status === EmergencyStatus.FLAGGED)
      return "bg-red-100 border-red-200";
    if (session.status === EmergencyStatus.APPROVED)
      return "bg-green-100 border-green-200";
    if (session.status === EmergencyStatus.REJECTED)
      return "bg-gray-100 border-gray-200";
    return "bg-blue-100 border-blue-200";
  };

  const getStatusBadge = () => {
    const badges = {
      [EmergencyStatus.ACTIVE]: {
        text: "Active",
        class: "bg-yellow-100 text-yellow-700",
      },
      [EmergencyStatus.COMPLETED]: {
        text: "Completed",
        class: "bg-blue-100 text-blue-700",
      },
      [EmergencyStatus.FLAGGED]: {
        text: "Flagged",
        class: "bg-red-100 text-red-700",
      },
      [EmergencyStatus.REVIEWED]: {
        text: "Under Review",
        class: "bg-purple-100 text-purple-700",
      },
      [EmergencyStatus.APPROVED]: {
        text: "Approved",
        class: "bg-green-100 text-green-700",
      },
      [EmergencyStatus.REJECTED]: {
        text: "Rejected",
        class: "bg-gray-100 text-gray-700",
      },
    };
    const badge = badges[session.status];
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${badge.class}`}
      >
        {badge.text}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-6 shadow-sm border ${getStatusColor()}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-lg ${
              isActive ? "bg-red-100" : "bg-green-100"
            }`}
          >
            {isActive ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Emergency Session #{session.id}
            </h3>
            <p className="text-sm text-slate-600 mb-2">
              <span className="font-medium">Doctor:</span> {session.doctorName}
            </p>
            <p className="text-sm text-slate-600 font-mono mb-2">
              <span className="font-medium">Patient:</span>{" "}
              {session.patient.slice(0, 10)}...{session.patient.slice(-8)}
            </p>
            <p className="text-sm text-slate-600 mb-2">
              <span className="font-medium">Hospital:</span>{" "}
              {session.hospitalName}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(session.startTime * 1000).toLocaleString()}
              </span>
              <span>Duration: {duration} min</span>
              <span>Records: {session.accessedRecords.length}</span>
            </div>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="bg-slate-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-slate-900 mb-2">
          Emergency Justification:
        </h4>
        <p className="text-slate-700">{session.reason}</p>
      </div>

      {session.diagnosis && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-slate-900 mb-2">
            Diagnosis/Outcome:
          </h4>
          <p className="text-slate-700">{session.diagnosis}</p>
        </div>
      )}

      <button
        onClick={loadRecords}
        className="btn-secondary flex items-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : showRecords ? (
          <>
            <FileText className="w-4 h-4" />
            Hide Records
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            View Patient Records
          </>
        )}
      </button>

      {showRecords && (
        <div className="mt-4">
          {records.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-700 mb-2">
                📋 Patient Records ({records.length})
              </div>
              {records.map((record, idx) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-900 mb-1">
                          {record.metadata?.title || `Medical Record #${record.id}`}
                        </h5>
                        <p className="text-sm text-slate-600 mb-2">
                          {record.metadata?.description || 'No description available'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {record.metadata?.hospitalName && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              🏥 {record.metadata.hospitalName}
                            </span>
                          )}
                          {record.metadata?.doctorName && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                              👨‍⚕️ {record.metadata.doctorName}
                            </span>
                          )}
                          {record.metadata?.tags && record.metadata.tags.length > 0 && (
                            record.metadata.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                #{tag}
                              </span>
                            ))
                          )}
                        </div>
                        {record.createdAt && (
                          <p className="text-xs text-slate-500 mt-2">
                            Created: {new Date(record.createdAt * 1000).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      ID: {record.id}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">No medical records found for this patient</p>
              <p className="text-slate-500 text-xs mt-1">Records may not have been created yet</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function StartEmergencyModal({
  isOpen,
  onClose,
  onSuccess,
  services,
  doctorAddress,
}: any) {
  const [starting, setStarting] = useState(false);
  const [patientAddress, setPatientAddress] = useState("");
  const [reason, setReason] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!services.emergencyAccess) {
      toast.error("Services not initialized");
      return;
    }

    try {
      setStarting(true);
      toast.loading("Starting emergency session on blockchain...");

      await services.emergencyAccess.startEmergencySession(
        patientAddress,
        reason,
        doctorName,
        hospitalName,
      );

      toast.dismiss();
      toast.success("✓ Emergency session started!");
      setPatientAddress("");
      setReason("");
      setDoctorName("");
      setHospitalName("");
      onSuccess();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to start emergency session");
    } finally {
      setStarting(false);
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
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Start Emergency Session
          </h2>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> Emergency access bypasses patient consent
            and should only be used in life-threatening situations. All
            emergency accesses are logged and auditable.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Patient Address *
            </label>
            <input
              type="text"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr. John Smith"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hospital/Facility *
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="City General Hospital ER"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Emergency Justification *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Patient unconscious after car accident. Unknown medical history. Need to check for allergies and pre-existing conditions before treatment..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              rows={4}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              This justification will be permanently recorded on the blockchain
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={starting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
              disabled={starting}
            >
              {starting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Start Session
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
