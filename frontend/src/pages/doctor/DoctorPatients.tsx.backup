import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Filter,
  ChevronDown,
  X,
  AlertTriangle,
  Download,
  Calendar,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Patient {
  id: number
  name: string
  address: string
  email: string
  lastVisit: number
  recordCount: number
  accessStatus: 'active' | 'expired' | 'none' | 'pending'
  accessExpiry?: number
  conditions: string[]
}

const mockPatients: Patient[] = [
  {
    id: 1,
    name: 'John Smith',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    email: 'john.smith@email.com',
    lastVisit: Date.now() - 86400000 * 3,
    recordCount: 24,
    accessStatus: 'active',
    accessExpiry: Date.now() + 86400000 * 30,
    conditions: ['Hypertension', 'Type 2 Diabetes'],
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    email: 'sarah.j@email.com',
    lastVisit: Date.now() - 86400000 * 7,
    recordCount: 18,
    accessStatus: 'active',
    accessExpiry: Date.now() + 86400000 * 14,
    conditions: ['Asthma'],
  },
  {
    id: 3,
    name: 'Michael Brown',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    email: 'michael.b@email.com',
    lastVisit: Date.now() - 86400000 * 30,
    recordCount: 12,
    accessStatus: 'expired',
    conditions: ['High Cholesterol'],
  },
  {
    id: 4,
    name: 'Emily Davis',
    address: '0xfedcba9876543210fedcba9876543210fedcba98',
    email: 'emily.davis@email.com',
    lastVisit: Date.now() - 86400000 * 15,
    recordCount: 8,
    accessStatus: 'pending',
    conditions: ['Migraine'],
  },
  {
    id: 5,
    name: 'Robert Wilson',
    address: '0x456789abcdef0123456789abcdef0123456789ab',
    email: 'r.wilson@email.com',
    lastVisit: Date.now() - 86400000 * 60,
    recordCount: 32,
    accessStatus: 'none',
    conditions: ['Arthritis', 'Osteoporosis'],
  },
]

interface Record {
  id: number
  title: string
  type: string
  date: number
  hospital: string
}

const mockRecords: Record[] = [
  { id: 1, title: 'Blood Test Results', type: 'Lab Results', date: Date.now() - 86400000 * 2, hospital: 'City Hospital' },
  { id: 2, title: 'Chest X-Ray', type: 'Imaging', date: Date.now() - 86400000 * 7, hospital: 'Medical Center' },
  { id: 3, title: 'Annual Physical', type: 'Examination', date: Date.now() - 86400000 * 30, hospital: 'City Hospital' },
  { id: 4, title: 'ECG Report', type: 'Cardiology', date: Date.now() - 86400000 * 45, hospital: 'Heart Clinic' },
  { id: 5, title: 'Prescription Renewal', type: 'Prescription', date: Date.now() - 86400000 * 5, hospital: 'Primary Care' },
]

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showRecordsModal, setShowRecordsModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [requestPurpose, setRequestPurpose] = useState('')
  const [requestDuration, setRequestDuration] = useState('30')

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || patient.accessStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
    return `${Math.floor(diff / 86400000)} days ago`
  }

  const handleRequestAccess = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowRequestModal(true)
  }

  const handleViewRecords = (patient: Patient) => {
    if (patient.accessStatus !== 'active') {
      toast.error('You need active access to view records')
      return
    }
    setSelectedPatient(patient)
    setShowRecordsModal(true)
  }

  const submitAccessRequest = () => {
    if (!requestPurpose.trim()) {
      toast.error('Please provide a purpose for the access request')
      return
    }
    toast.success(`Access request sent to ${selectedPatient?.name}`)
    setShowRequestModal(false)
    setRequestPurpose('')
    setRequestDuration('30')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="status-badge-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active Access
          </span>
        )
      case 'expired':
        return (
          <span className="status-badge-danger">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        )
      case 'pending':
        return (
          <span className="status-badge-warning">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      default:
        return (
          <span className="status-badge bg-slate-100 text-slate-600">
            <XCircle className="w-3 h-3 mr-1" />
            No Access
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Management</h1>
          <p className="text-slate-500">Search and manage access to patient records</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or wallet address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-10 py-3 rounded-xl border border-slate-200 focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all text-slate-900 appearance-none bg-white min-w-[180px]"
            >
              <option value="all">All Patients</option>
              <option value="active">Active Access</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="none">No Access</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center text-white text-xl font-semibold">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{patient.name}</h3>
                    <p className="text-slate-500 text-sm font-mono">{patient.address.slice(0, 10)}...{patient.address.slice(-8)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {patient.conditions.map((condition, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Records</p>
                    <p className="text-xl font-bold text-slate-900">{patient.recordCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Last Visit</p>
                    <p className="font-medium text-slate-700">{formatTimeAgo(patient.lastVisit)}</p>
                  </div>
                  <div>
                    {getStatusBadge(patient.accessStatus)}
                    {patient.accessExpiry && patient.accessStatus === 'active' && (
                      <p className="text-xs text-slate-400 mt-1">
                        Expires {formatDate(patient.accessExpiry)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {patient.accessStatus === 'active' ? (
                      <button
                        onClick={() => handleViewRecords(patient)}
                        className="btn-primary"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Records
                      </button>
                    ) : patient.accessStatus === 'pending' ? (
                      <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
                        <Clock className="w-4 h-4 mr-2" />
                        Awaiting
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequestAccess(patient)}
                        className="btn-primary"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Request Access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPatients.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Patients Found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Request Access Modal */}
      <AnimatePresence>
        {showRequestModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Request Access</h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Patient</p>
                  <p className="font-semibold text-slate-900">{selectedPatient.name}</p>
                  <p className="text-sm text-slate-500 font-mono">{selectedPatient.address}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purpose of Access *
                  </label>
                  <textarea
                    value={requestPurpose}
                    onChange={(e) => setRequestPurpose(e.target.value)}
                    rows={3}
                    placeholder="Describe why you need access to this patient's records..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Access Duration
                  </label>
                  <select
                    value={requestDuration}
                    onChange={(e) => setRequestDuration(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-all text-slate-900"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 text-sm">Consent Required</p>
                    <p className="text-amber-600 text-sm">
                      The patient will receive this request and must grant consent before you can access their records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAccessRequest}
                  className="btn-primary flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Records Modal */}
      <AnimatePresence>
        {showRecordsModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRecordsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}'s Records</h2>
                  <p className="text-slate-500 text-sm">{selectedPatient.recordCount} records available</p>
                </div>
                <button
                  onClick={() => setShowRecordsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Patient Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Activity className="w-4 h-4" />
                    Conditions
                  </div>
                  <p className="font-medium text-slate-900">
                    {selectedPatient.conditions.join(', ')}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    Last Visit
                  </div>
                  <p className="font-medium text-slate-900">
                    {formatDate(selectedPatient.lastVisit)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Access Expires
                  </div>
                  <p className="font-medium text-slate-900">
                    {selectedPatient.accessExpiry ? formatDate(selectedPatient.accessExpiry) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Records List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {mockRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-medical-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-medical-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{record.title}</p>
                        <p className="text-sm text-slate-500">
                          {record.type} • {record.hospital} • {formatDate(record.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-medical-600">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-medical-600">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">
                  All access is logged and audited on the blockchain
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
