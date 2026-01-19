import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Search,
  Shield,
  User,
  FileText,
  Activity,
  X,
  CheckCircle,
  AlertCircle,
  History,
  Phone,
  Heart,
  Stethoscope,
  Pill,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useWalletStore } from '../../store/walletStore'

interface EmergencySession {
  id: number
  patientName: string
  patientAddress: string
  startedAt: number
  expiresAt: number
  reason: string
  location: string
  status: 'active' | 'expired' | 'closed'
  recordsAccessed: number
}

interface CriticalInfo {
  bloodType: string
  allergies: string[]
  medications: string[]
  conditions: string[]
  emergencyContact: {
    name: string
    phone: string
    relation: string
  }
}

const mockSessions: EmergencySession[] = [
  {
    id: 1,
    patientName: 'Unknown Patient',
    patientAddress: '0x1234567890abcdef1234567890abcdef12345678',
    startedAt: Date.now() - 3600000,
    expiresAt: Date.now() + 82800000,
    reason: 'Cardiac arrest - CPR administered',
    location: 'Emergency Room A',
    status: 'active',
    recordsAccessed: 5,
  },
]

const mockCriticalInfo: CriticalInfo = {
  bloodType: 'O+',
  allergies: ['Penicillin', 'Shellfish', 'Latex'],
  medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Aspirin 81mg'],
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Previous MI (2021)'],
  emergencyContact: {
    name: 'Jane Smith',
    phone: '+1 (555) 123-4567',
    relation: 'Spouse',
  },
}

const pastSessions: EmergencySession[] = [
  {
    id: 2,
    patientName: 'Robert Johnson',
    patientAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    startedAt: Date.now() - 86400000 * 7,
    expiresAt: Date.now() - 86400000 * 6,
    reason: 'Severe allergic reaction',
    location: 'Emergency Room B',
    status: 'closed',
    recordsAccessed: 3,
  },
  {
    id: 3,
    patientName: 'Mary Williams',
    patientAddress: '0x9876543210fedcba9876543210fedcba98765432',
    startedAt: Date.now() - 86400000 * 14,
    expiresAt: Date.now() - 86400000 * 13,
    reason: 'Unconscious - head trauma',
    location: 'Trauma Unit',
    status: 'closed',
    recordsAccessed: 8,
  },
]

export default function DoctorEmergency() {
  useWalletStore()
  const [showNewSession, setShowNewSession] = useState(false)
  const [showActiveSession, setShowActiveSession] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [emergencyReason, setEmergencyReason] = useState('')
  const [emergencyLocation, setEmergencyLocation] = useState('')
  const [activeSession, setActiveSession] = useState<EmergencySession | null>(mockSessions[0])
  const [confirmText, setConfirmText] = useState('')

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTimeRemaining = (expiresAt: number) => {
    const remaining = expiresAt - Date.now()
    if (remaining < 0) return 'Expired'
    const hours = Math.floor(remaining / 3600000)
    const minutes = Math.floor((remaining % 3600000) / 60000)
    return `${hours}h ${minutes}m remaining`
  }

  const startEmergencySession = () => {
    if (confirmText !== 'EMERGENCY') {
      toast.error('Please type EMERGENCY to confirm')
      return
    }
    if (!patientSearch || !emergencyReason || !emergencyLocation) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Emergency session started')
    setShowNewSession(false)
    setConfirmText('')
    setPatientSearch('')
    setEmergencyReason('')
    setEmergencyLocation('')
  }

  const endSession = () => {
    toast.success('Emergency session ended')
    setActiveSession(null)
    setShowActiveSession(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Emergency Access</h1>
          <p className="text-slate-500">Override patient consent in life-threatening situations</p>
        </div>
        <button
          onClick={() => setShowNewSession(true)}
          className="btn-danger"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          Start Emergency Session
        </button>
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Emergency Access Protocol</h3>
            <p className="text-red-700 text-sm mb-3">
              Emergency access should ONLY be used in life-threatening situations where immediate access
              to patient medical history is critical for treatment. All emergency accesses are:
            </p>
            <ul className="text-red-600 text-sm space-y-1">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Permanently logged on the blockchain
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Subject to immediate review by hospital compliance
              </li>
              <li className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Notified to the patient upon session end
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Active Session */}
      {activeSession && activeSession.status === 'active' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-red-100 text-sm">Active Emergency Session</p>
                  <h3 className="text-xl font-bold">Session #{activeSession.id}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-100 text-sm">Time Remaining</p>
                <p className="text-xl font-bold">{formatTimeRemaining(activeSession.expiresAt)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-red-100 text-xs mb-1">Patient</p>
                <p className="font-medium">{activeSession.patientName}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-red-100 text-xs mb-1">Location</p>
                <p className="font-medium">{activeSession.location}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-red-100 text-xs mb-1">Records Accessed</p>
                <p className="font-medium">{activeSession.recordsAccessed}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowActiveSession(true)}
                className="flex-1 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
              >
                View Patient Records
              </button>
              <button
                onClick={endSession}
                className="px-6 py-3 bg-white/20 rounded-xl font-semibold hover:bg-white/30 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Session History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Session History</h2>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <span className="text-slate-500 text-sm">Last 30 days</span>
          </div>
        </div>

        <div className="space-y-4">
          {[...mockSessions, ...pastSessions].map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-xl border ${
                session.status === 'active'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    session.status === 'active' ? 'bg-red-100' : 'bg-slate-200'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      session.status === 'active' ? 'text-red-600' : 'text-slate-500'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{session.patientName}</p>
                      {session.status === 'active' ? (
                        <span className="status-badge-danger animate-pulse">Active</span>
                      ) : (
                        <span className="status-badge bg-slate-200 text-slate-600">Closed</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm mt-1">{session.reason}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {session.location} • {formatDate(session.startedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">{session.recordsAccessed} records accessed</p>
                  <p className="text-xs text-slate-400 font-mono">{session.patientAddress.slice(0, 10)}...</p>
                </div>
              </div>
            </div>
          ))}

          {mockSessions.length === 0 && pastSessions.length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No emergency sessions in the last 30 days</p>
            </div>
          )}
        </div>
      </div>

      {/* New Emergency Session Modal */}
      <AnimatePresence>
        {showNewSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewSession(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Start Emergency Session</h2>
                </div>
                <button
                  onClick={() => setShowNewSession(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Patient Wallet Address *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="0x..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-slate-900 placeholder-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Emergency Reason *
                  </label>
                  <textarea
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    rows={3}
                    placeholder="Describe the emergency situation..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={emergencyLocation}
                    onChange={(e) => setEmergencyLocation(e.target.value)}
                    placeholder="e.g., Emergency Room A, ICU"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="font-semibold text-red-900 text-sm mb-2">
                    ⚠️ Confirm Emergency Access
                  </p>
                  <p className="text-red-700 text-sm mb-3">
                    Type <strong>EMERGENCY</strong> below to confirm this is a genuine life-threatening emergency.
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type EMERGENCY"
                    className="w-full px-4 py-3 rounded-xl border border-red-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-slate-900 placeholder-slate-400 text-center font-bold tracking-wider"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewSession(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={startEmergencySession}
                  className="btn-danger flex-1"
                  disabled={confirmText !== 'EMERGENCY'}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Start Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Session Records Modal */}
      <AnimatePresence>
        {showActiveSession && activeSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowActiveSession(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                    <Activity className="w-4 h-4 animate-pulse" />
                    Emergency Session Active
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Patient Emergency Records</h2>
                </div>
                <button
                  onClick={() => setShowActiveSession(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Critical Information */}
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Critical Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                        <Heart className="w-4 h-4" />
                        Blood Type
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{mockCriticalInfo.bloodType}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                        <AlertCircle className="w-4 h-4" />
                        Allergies
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mockCriticalInfo.allergies.map((allergy, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medications */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-purple-500" />
                    Current Medications
                  </h3>
                  <div className="grid md:grid-cols-3 gap-2">
                    {mockCriticalInfo.medications.map((med, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                        <p className="font-medium text-slate-900">{med}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-medical-500" />
                    Medical Conditions
                  </h3>
                  <div className="space-y-2">
                    {mockCriticalInfo.conditions.map((condition, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200">
                        <CheckCircle className="w-5 h-5 text-medical-500" />
                        <span className="font-medium text-slate-900">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Emergency Contact
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-amber-100">
                    <p className="font-semibold text-slate-900">{mockCriticalInfo.emergencyContact.name}</p>
                    <p className="text-slate-600">{mockCriticalInfo.emergencyContact.relation}</p>
                    <p className="text-medical-600 font-medium mt-2">{mockCriticalInfo.emergencyContact.phone}</p>
                  </div>
                </div>

                {/* Recent Records */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-500" />
                    Recent Medical Records
                  </h3>
                  <div className="space-y-2">
                    {[
                      { title: 'Last Lab Results', date: '2 weeks ago', type: 'Lab Results' },
                      { title: 'Cardiology Report', date: '1 month ago', type: 'Specialist Report' },
                      { title: 'Previous Hospitalization', date: '6 months ago', type: 'Hospital Record' },
                    ].map((record, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{record.title}</p>
                            <p className="text-sm text-slate-500">{record.type} • {record.date}</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <Download className="w-5 h-5 text-slate-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  All access during this session is being logged
                </p>
                <button
                  onClick={endSession}
                  className="btn-danger"
                >
                  End Emergency Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
