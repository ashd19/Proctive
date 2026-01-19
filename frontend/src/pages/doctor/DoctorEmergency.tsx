import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Loader, FileText, Clock, CheckCircle, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { useServices } from '../../services/useServices'
import { useWalletStore } from '../../store/walletStore'
import { EmergencyAccessLog } from '../../services/emergencyAccessService'
import { MedicalRecord } from '../../services/patientRecordsService'

export default function DoctorEmergency() {
  const { services, loading: servicesLoading } = useServices()
  const { address } = useWalletStore()
  
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyAccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)

  useEffect(() => {
    async function loadEmergencyLogs() {
      if (!services.emergencyAccess || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const logs = await services.emergencyAccess.getDoctorEmergencyLogs(address)
        setEmergencyLogs(logs.sort((a, b) => b.timestamp - a.timestamp))
      } catch (error: any) {
        console.error('Error loading emergency logs:', error)
        toast.error(error.message || 'Failed to load emergency logs')
      } finally {
        setLoading(false)
      }
    }

    if (!servicesLoading) {
      loadEmergencyLogs()
    }
  }, [services.emergencyAccess, address, servicesLoading])

  if (servicesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const unresolvedLogs = emergencyLogs.filter(log => !log.wasResolved)
  const resolvedLogs = emergencyLogs.filter(log => log.wasResolved)

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Emergency Access</h1>
            <p className="text-slate-600">Request and manage emergency patient access</p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            Request Emergency Access
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Unresolved</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{unresolvedLogs.length}</p>
            <p className="text-sm text-slate-600 mt-1">Awaiting patient acknowledgment</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Resolved</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{resolvedLogs.length}</p>
            <p className="text-sm text-slate-600 mt-1">Acknowledged by patients</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Total</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{emergencyLogs.length}</p>
            <p className="text-sm text-slate-600 mt-1">All emergency accesses</p>
          </div>
        </div>

        {/* Emergency Logs */}
        <div className="space-y-6">
          {/* Unresolved */}
          {unresolvedLogs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Unresolved Emergency Accesses ({unresolvedLogs.length})
              </h2>
              <div className="space-y-4">
                {unresolvedLogs.map((log) => (
                  <EmergencyLogCard key={log.logId} log={log} services={services} />
                ))}
              </div>
            </div>
          )}

          {/* Resolved */}
          {resolvedLogs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Resolved Emergency Accesses ({resolvedLogs.length})
              </h2>
              <div className="space-y-4">
                {resolvedLogs.map((log) => (
                  <EmergencyLogCard key={log.logId} log={log} services={services} />
                ))}
              </div>
            </div>
          )}

          {emergencyLogs.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No emergency accesses</h3>
              <p className="text-slate-600 mb-6">Request emergency access when needed in critical situations</p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn-primary bg-red-600 hover:bg-red-700 inline-flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Request Emergency Access
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Request Emergency Access Modal */}
      <RequestEmergencyModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          setShowRequestModal(false)
          if (services.emergencyAccess && address) {
            services.emergencyAccess.getDoctorEmergencyLogs(address).then((logs) =>
              setEmergencyLogs(logs.sort((a, b) => b.timestamp - a.timestamp))
            )
          }
        }}
        services={services}
        doctorAddress={address || ''}
      />
    </div>
  )
}

function EmergencyLogCard({ log, services }: { log: EmergencyAccessLog; services: any }) {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [showRecords, setShowRecords] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadRecords = async () => {
    if (!services.patientRecords || showRecords) {
      setShowRecords(false)
      return
    }

    try {
      setLoading(true)
      const patientRecords = await services.patientRecords.getPatientRecords(log.patientAddress)
      setRecords(patientRecords)
      setShowRecords(true)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-6 shadow-sm border ${
        log.wasResolved ? 'border-slate-200' : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${log.wasResolved ? 'bg-green-100' : 'bg-red-100'}`}>
            {log.wasResolved ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Emergency Access #{log.logId}
            </h3>
            <p className="text-sm text-slate-600 font-mono mb-2">
              Patient: {log.patientAddress.slice(0, 10)}...{log.patientAddress.slice(-8)}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(log.timestamp * 1000).toLocaleString()}
              </span>
              {log.wasResolved && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Resolved {new Date(log.resolvedAt * 1000).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        {!log.wasResolved && (
          <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Pending Acknowledgment
          </span>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-slate-900 mb-2">Emergency Justification:</h4>
        <p className="text-slate-700">{log.reason}</p>
      </div>

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
            View Accessed Records
          </>
        )}
      </button>

      {showRecords && records.length > 0 && (
        <div className="mt-4 space-y-2">
          {records.map((record) => (
            <div key={record.id} className="bg-slate-100 rounded-lg p-3">
              <h5 className="font-medium text-slate-900">{record.metadata.title}</h5>
              <p className="text-sm text-slate-600">{record.metadata.description}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function RequestEmergencyModal({ isOpen, onClose, onSuccess, services, doctorAddress }: any) {
  const [requesting, setRequesting] = useState(false)
  const [patientAddress, setPatientAddress] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!services.emergencyAccess) {
      toast.error('Services not initialized')
      return
    }

    try {
      setRequesting(true)
      toast.loading('Requesting emergency access on blockchain...')

      await services.emergencyAccess.requestEmergencyAccess(
        patientAddress,
        doctorAddress,
        reason
      )

      toast.dismiss()
      toast.success('✓ Emergency access granted!')
      onSuccess()
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to request emergency access')
    } finally {
      setRequesting(false)
    }
  }

  if (!isOpen) return null

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
          <h2 className="text-2xl font-bold text-slate-900">Request Emergency Access</h2>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> Emergency access bypasses patient consent and should only be used in life-threatening situations.
            All emergency accesses are logged and auditable.
          </p>
        </div>

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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 font-mono text-sm"
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
              placeholder="Describe the life-threatening emergency requiring immediate access..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              rows={4}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              This justification will be permanently recorded on the blockchain
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={requesting}>
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
              disabled={requesting}
            >
              {requesting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Request Access
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
