import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  Loader, 
  FileText, 
  Clock, 
  CheckCircle, 
  Activity,
  XCircle,
  PlayCircle,
  StopCircle,
  Eye,
  Flag
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useServices } from '../../services/useServices'
import { useWalletStore } from '../../store/walletStore'
import { EmergencySession, EmergencyStatus, EmergencyAccessService } from '../../services/emergencyAccessService'
import { MedicalRecord } from '../../services/patientRecordsService'

export default function DoctorEmergency() {
  const { services, loading: servicesLoading } = useServices()
  const { address } = useWalletStore()
  
  const [emergencySessions, setEmergencySessions] = useState<EmergencySession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [showStartModal, setShowStartModal] = useState(false)

  const loadData = async () => {
    if (!services.emergencyAccess || !address) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [sessions, activeId] = await Promise.all([
        services.emergencyAccess.getDoctorEmergencySessions(address),
        services.emergencyAccess.getActiveSession(address)
      ])
      setEmergencySessions(sessions)
      setActiveSessionId(activeId)
    } catch (error: any) {
      console.error('Error loading emergency data:', error)
      toast.error(error.message || 'Failed to load emergency sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!servicesLoading) {
      loadData()
    }
  }, [services.emergencyAccess, address, servicesLoading])

  if (servicesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const activeSessions = emergencySessions.filter(s => 
    s.status === EmergencyStatus.ACTIVE || s.status === EmergencyStatus.FLAGGED
  )
  const completedSessions = emergencySessions.filter(s => s.status === EmergencyStatus.COMPLETED)
  const flaggedSessions = emergencySessions.filter(s => 
    s.status === EmergencyStatus.FLAGGED || 
    s.status === EmergencyStatus.REVIEWED ||
    s.status === EmergencyStatus.REJECTED
  )

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Emergency Access Protocol</h1>
            <p className="text-slate-600">Bypass consent in life-threatening situations</p>
          </div>
          <button
            onClick={() => setShowStartModal(true)}
            disabled={activeSessionId > 0}
            className={`btn-primary flex items-center gap-2 ${
              activeSessionId > 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <PlayCircle className="w-5 h-5" />
            {activeSessionId > 0 ? 'Session Active' : 'Start Emergency Session'}
          </button>
        </div>

        {/* Active Session Alert */}
        {activeSessionId > 0 && (
          <ActiveSessionAlert 
            sessionId={activeSessionId} 
            services={services}
            onEnd={loadData}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<PlayCircle className="w-5 h-5" />}
            title="Active"
            value={activeSessions.length}
            description="Current emergency sessions"
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            title="Completed"
            value={completedSessions.length}
            description="Successfully closed"
            color="green"
          />
          <StatCard
            icon={<Flag className="w-5 h-5" />}
            title="Flagged"
            value={flaggedSessions.length}
            description="Require review"
            color="red"
          />
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            title="Total"
            value={emergencySessions.length}
            description="All time sessions"
            color="blue"
          />
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <SessionSection
              title="Active Emergency Sessions"
              count={activeSessions.length}
              sessions={activeSessions}
              services={services}
              onUpdate={loadData}
            />
          )}

          {/* Flagged Sessions */}
          {flaggedSessions.length > 0 && (
            <SessionSection
              title="Flagged Sessions"
              count={flaggedSessions.length}
              sessions={flaggedSessions}
              services={services}
              onUpdate={loadData}
            />
          )}

          {/* Completed Sessions */}
          {completedSessions.length > 0 && (
            <SessionSection
              title="Completed Sessions"
              count={completedSessions.length}
              sessions={completedSessions}
              services={services}
              onUpdate={loadData}
            />
          )}

          {/* Empty State */}
          {emergencySessions.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
              <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No emergency sessions</h3>
              <p className="text-slate-600 mb-6">Start an emergency session when facing a life-threatening situation</p>
              <button
                onClick={() => setShowStartModal(true)}
                className="btn-primary bg-red-600 hover:bg-red-700 inline-flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Start Emergency Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start Session Modal */}
      <StartSessionModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onSuccess={() => {
          setShowStartModal(false)
          loadData()
        }}
        services={services}
      />
    </div>
  )
}

// Stat Card Component
function StatCard({ icon, title, value, description, color }: any) {
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600'
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </div>
  )
}

// Active Session Alert
function ActiveSessionAlert({ sessionId, services, onEnd }: any) {
  const [session, setSession] = useState<EmergencySession | null>(null)
  const [ending, setEnding] = useState(false)
  const [diagnosis, setDiagnosis] = useState('')
  const [showEndModal, setShowEndModal] = useState(false)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const s = await services.emergencyAccess.getSession(sessionId)
        setSession(s)
      } catch (error) {
        console.error('Error loading session:', error)
      }
    }
    loadSession()
  }, [sessionId, services])

  const handleEnd = async () => {
    if (!diagnosis.trim()) {
      toast.error('Please enter a diagnosis')
      return
    }

    try {
      setEnding(true)
      toast.loading('Ending emergency session...')
      await services.emergencyAccess.endEmergencySession(diagnosis)
      toast.dismiss()
      toast.success('Emergency session ended')
      setShowEndModal(false)
      onEnd()
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to end session')
    } finally {
      setEnding(false)
    }
  }

  if (!session) return null

  const duration = Math.floor((Date.now() / 1000) - session.startTime)
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)

  return (
    <>
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-yellow-500 rounded-full p-2 animate-pulse">
                <PlayCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-yellow-900">Emergency Session Active</h3>
            </div>
            <p className="text-yellow-800 mb-2">
              <strong>Patient:</strong> {session.patient}
            </p>
            <p className="text-yellow-800 mb-2">
              <strong>Reason:</strong> {session.reason}
            </p>
            <p className="text-yellow-800">
              <strong>Duration:</strong> {hours}h {minutes}m
            </p>
          </div>
          <button
            onClick={() => setShowEndModal(true)}
            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            <StopCircle className="w-5 h-5" />
            End Session
          </button>
        </div>
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">End Emergency Session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diagnosis / Summary *
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter final diagnosis and treatment summary..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowEndModal(false)} 
                  className="flex-1 btn-secondary"
                  disabled={ending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnd}
                  className="flex-1 btn-primary bg-red-600 hover:bg-red-700"
                  disabled={ending}
                >
                  {ending ? 'Ending...' : 'End Session'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

// Session Section
function SessionSection({ title, count, sessions, services, onUpdate }: any) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        {title} ({count})
      </h2>
      <div className="space-y-4">
        {sessions.map((session: EmergencySession) => (
          <SessionCard 
            key={session.id} 
            session={session} 
            services={services}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  )
}

// Session Card
function SessionCard({ session, services, onUpdate }: any) {
  const [showRecords, setShowRecords] = useState(false)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)

  const loadRecords = async () => {
    if (showRecords) {
      setShowRecords(false)
      return
    }

    try {
      setLoading(true)
      const patientRecords = await services.patientRecords.getPatientRecords(session.patient)
      const accessedRecords = patientRecords.filter((r: MedicalRecord) => 
        session.accessedRecords.includes(r.id)
      )
      setRecords(accessedRecords)
      setShowRecords(true)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  const duration = session.endTime 
    ? session.endTime - session.startTime 
    : Math.floor(Date.now() / 1000) - session.startTime
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${getStatusBg(session.status)}`}>
            {getStatusIcon(session.status)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-slate-900">
                Session #{session.id}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                EmergencyAccessService.getStatusColor(session.status)
              }`}>
                {EmergencyAccessService.getStatusName(session.status)}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              <strong>Patient:</strong> {session.patient.slice(0, 10)}...{session.patient.slice(-8)}
            </p>
            <p className="text-sm text-slate-600 mb-2">
              <strong>Hospital:</strong> {session.hospitalName} | <strong>Doctor:</strong> {session.doctorName}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(session.startTime * 1000).toLocaleString()}
              </span>
              <span>Duration: {hours}h {minutes}m</span>
              <span>Records Accessed: {session.accessedRecords.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="bg-slate-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-slate-900 mb-2">Emergency Reason:</h4>
        <p className="text-slate-700">{session.reason}</p>
      </div>

      {/* Diagnosis (if ended) */}
      {session.diagnosis && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-slate-900 mb-2">Diagnosis/Summary:</h4>
          <p className="text-slate-700">{session.diagnosis}</p>
        </div>
      )}

      {/* View Records Button */}
      {session.accessedRecords.length > 0 && (
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
              <Eye className="w-4 h-4" />
              Hide Records
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              View Accessed Records ({session.accessedRecords.length})
            </>
          )}
        </button>
      )}

      {/* Records List */}
      {showRecords && records.length > 0 && (
        <div className="mt-4 space-y-2">
          {records.map((record) => (
            <div key={record.id} className="bg-slate-100 rounded-lg p-3">
              <h5 className="font-medium text-slate-900">{record.metadata.title}</h5>
              <p className="text-sm text-slate-600">{record.metadata.description}</p>
              <p className="text-xs text-slate-500 mt-1">
                {record.metadata.hospitalName} • {new Date(record.createdAt * 1000).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Start Session Modal
function StartSessionModal({ isOpen, onClose, onSuccess, services }: any) {
  const [starting, setStarting] = useState(false)
  const [patientAddress, setPatientAddress] = useState('')
  const [reason, setReason] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [hospitalName, setHospitalName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!services.emergencyAccess) {
      toast.error('Services not initialized')
      return
    }

    try {
      setStarting(true)
      toast.loading('Starting emergency session...')

      await services.emergencyAccess.startEmergencySession(
        patientAddress,
        reason,
        doctorName,
        hospitalName
      )

      toast.dismiss()
      toast.success('✓ Emergency session started!')
      onSuccess()
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to start emergency session')
    } finally {
      setStarting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Start Emergency Session</h2>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>⚠️ Warning:</strong> Emergency access bypasses patient consent and should <strong>only</strong> be used in life-threatening situations. All actions are permanently logged and auditable.
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
              placeholder="General Hospital ER"
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
              placeholder="Describe the life-threatening emergency requiring immediate access (e.g., cardiac arrest, severe trauma, anaphylactic shock)..."
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
                  <PlayCircle className="w-5 h-5" />
                  Start Session
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Helper functions
function getStatusIcon(status: EmergencyStatus) {
  const icons = {
    [EmergencyStatus.ACTIVE]: <PlayCircle className="w-6 h-6 text-yellow-600" />,
    [EmergencyStatus.COMPLETED]: <CheckCircle className="w-6 h-6 text-green-600" />,
    [EmergencyStatus.FLAGGED]: <Flag className="w-6 h-6 text-red-600" />,
    [EmergencyStatus.REVIEWED]: <Eye className="w-6 h-6 text-purple-600" />,
    [EmergencyStatus.APPROVED]: <CheckCircle className="w-6 h-6 text-green-600" />,
    [EmergencyStatus.REJECTED]: <XCircle className="w-6 h-6 text-gray-600" />
  }
  return icons[status] || <Activity className="w-6 h-6 text-gray-600" />
}

function getStatusBg(status: EmergencyStatus) {
  const bgs = {
    [EmergencyStatus.ACTIVE]: 'bg-yellow-100',
    [EmergencyStatus.COMPLETED]: 'bg-green-100',
    [EmergencyStatus.FLAGGED]: 'bg-red-100',
    [EmergencyStatus.REVIEWED]: 'bg-purple-100',
    [EmergencyStatus.APPROVED]: 'bg-green-100',
    [EmergencyStatus.REJECTED]: 'bg-gray-100'
  }
  return bgs[status] || 'bg-gray-100'
}
