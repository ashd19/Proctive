import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  X,
  Download,
  AlertTriangle,
  User,
  Calendar,
  Building,
  Link as LinkIcon,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Claim {
  id: string
  patientName: string
  patientAddress: string
  policyNumber: string
  amount: number
  type: string
  description: string
  submittedAt: number
  status: 'pending' | 'review_required' | 'approved' | 'auto_approved' | 'rejected'
  priority: 'normal' | 'high' | 'urgent'
  hospital: string
  documents: string[]
  ipfsHash: string
}

const mockClaims: Claim[] = [
  {
    id: 'CLM-2024-0892',
    patientName: 'John Smith',
    patientAddress: '0x1234567890abcdef1234567890abcdef12345678',
    policyNumber: 'POL-2023-45678',
    amount: 2450.00,
    type: 'Hospitalization',
    description: 'Emergency room visit and overnight stay for chest pain observation',
    submittedAt: Date.now() - 3600000 * 2,
    status: 'pending',
    priority: 'high',
    hospital: 'City General Hospital',
    documents: ['hospital_bill.pdf', 'doctor_report.pdf', 'lab_results.pdf'],
    ipfsHash: 'Qm1234567890abcdef',
  },
  {
    id: 'CLM-2024-0891',
    patientName: 'Sarah Johnson',
    patientAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    policyNumber: 'POL-2022-12345',
    amount: 350.00,
    type: 'Lab Tests',
    description: 'Annual blood work and health screening',
    submittedAt: Date.now() - 3600000 * 5,
    status: 'auto_approved',
    priority: 'normal',
    hospital: 'HealthFirst Labs',
    documents: ['lab_report.pdf', 'receipt.pdf'],
    ipfsHash: 'Qmabcdef1234567890',
  },
  {
    id: 'CLM-2024-0890',
    patientName: 'Michael Brown',
    patientAddress: '0x9876543210fedcba9876543210fedcba98765432',
    policyNumber: 'POL-2021-98765',
    amount: 12500.00,
    type: 'Surgery',
    description: 'Knee replacement surgery - right knee',
    submittedAt: Date.now() - 3600000 * 8,
    status: 'review_required',
    priority: 'urgent',
    hospital: 'Orthopedic Specialists Center',
    documents: ['surgical_report.pdf', 'itemized_bill.pdf', 'pre_auth.pdf', 'mri_scans.pdf'],
    ipfsHash: 'Qm9876543210fedcba',
  },
  {
    id: 'CLM-2024-0889',
    patientName: 'Emily Davis',
    patientAddress: '0xfedcba9876543210fedcba9876543210fedcba98',
    policyNumber: 'POL-2023-55555',
    amount: 180.00,
    type: 'Consultation',
    description: 'Specialist consultation for recurring headaches',
    submittedAt: Date.now() - 86400000,
    status: 'approved',
    priority: 'normal',
    hospital: 'Neurology Associates',
    documents: ['consultation_notes.pdf', 'invoice.pdf'],
    ipfsHash: 'Qmfedcba9876543210',
  },
  {
    id: 'CLM-2024-0888',
    patientName: 'Robert Wilson',
    patientAddress: '0x456789abcdef0123456789abcdef0123456789ab',
    policyNumber: 'POL-2020-11111',
    amount: 8750.00,
    type: 'Hospitalization',
    description: 'Appendectomy and 3-day hospital stay',
    submittedAt: Date.now() - 86400000 * 3,
    status: 'rejected',
    priority: 'high',
    hospital: 'St. Mary\'s Hospital',
    documents: ['hospital_records.pdf', 'surgical_report.pdf'],
    ipfsHash: 'Qm456789abcdef0123',
  },
]

export default function InsuranceClaimsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')

  const filteredClaims = mockClaims.filter(claim => {
    const matchesSearch = claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus
    const matchesType = filterType === 'all' || claim.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
    return `${Math.floor(diff / 86400000)} days ago`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge-warning"><Clock className="w-3 h-3 mr-1" />Pending</span>
      case 'auto_approved':
        return <span className="status-badge-success"><CheckCircle className="w-3 h-3 mr-1" />Auto-Approved</span>
      case 'approved':
        return <span className="status-badge-success"><CheckCircle className="w-3 h-3 mr-1" />Approved</span>
      case 'review_required':
        return <span className="status-badge bg-purple-100 text-purple-700"><AlertTriangle className="w-3 h-3 mr-1" />Review Required</span>
      case 'rejected':
        return <span className="status-badge-danger"><XCircle className="w-3 h-3 mr-1" />Rejected</span>
      default:
        return <span className="status-badge bg-slate-100 text-slate-600">{status}</span>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">Urgent</span>
      case 'high':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">High</span>
      default:
        return null
    }
  }

  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim)
    setShowDetailsModal(true)
  }

  const handleProcessClaim = (claim: Claim) => {
    setSelectedClaim(claim)
    setShowProcessModal(true)
  }

  const approveClaim = () => {
    toast.success(`Claim ${selectedClaim?.id} approved`)
    setShowProcessModal(false)
    setApprovalNotes('')
  }

  const rejectClaim = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    toast.success(`Claim ${selectedClaim?.id} rejected`)
    setShowProcessModal(false)
    setRejectionReason('')
  }

  const pendingCount = mockClaims.filter(c => c.status === 'pending' || c.status === 'review_required').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims Processing</h1>
          <p className="text-slate-500">Review and process insurance claims</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
            {pendingCount} claims need attention
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by claim ID, patient name, or policy number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-10 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-slate-900 appearance-none bg-white min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="review_required">Review Required</option>
              <option value="approved">Approved</option>
              <option value="auto_approved">Auto-Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-slate-900 appearance-none bg-white min-w-[160px]"
            >
              <option value="all">All Types</option>
              <option value="Hospitalization">Hospitalization</option>
              <option value="Surgery">Surgery</option>
              <option value="Lab Tests">Lab Tests</option>
              <option value="Consultation">Consultation</option>
              <option value="Medication">Medication</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Claim ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Submitted</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredClaims.map((claim, index) => (
                  <motion.tr
                    key={claim.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{claim.id}</span>
                        {getPriorityBadge(claim.priority)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{claim.patientName}</p>
                        <p className="text-slate-400 text-xs font-mono">{claim.policyNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{claim.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">${claim.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-500 text-sm">{formatTimeAgo(claim.submittedAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(claim)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-purple-600"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {(claim.status === 'pending' || claim.status === 'review_required') && (
                          <button
                            onClick={() => handleProcessClaim(claim)}
                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                          >
                            Process
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredClaims.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Claims Found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedClaim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedClaim.id}</h2>
                  <p className="text-slate-500 text-sm">{selectedClaim.type}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status & Amount */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedClaim.status)}
                    {getPriorityBadge(selectedClaim.priority)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Claim Amount</p>
                    <p className="text-2xl font-bold text-slate-900">${selectedClaim.amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <User className="w-4 h-4" />
                      Patient
                    </div>
                    <p className="font-semibold text-slate-900">{selectedClaim.patientName}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {selectedClaim.patientAddress.slice(0, 16)}...
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <FileText className="w-4 h-4" />
                      Policy Number
                    </div>
                    <p className="font-semibold text-slate-900">{selectedClaim.policyNumber}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <Building className="w-4 h-4" />
                      Healthcare Provider
                    </div>
                    <p className="font-semibold text-slate-900">{selectedClaim.hospital}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      Submitted
                    </div>
                    <p className="font-semibold text-slate-900">{formatDate(selectedClaim.submittedAt)}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-500 text-sm mb-1">Description</p>
                  <p className="text-slate-900">{selectedClaim.description}</p>
                </div>

                {/* IPFS Hash */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <LinkIcon className="w-4 h-4" />
                    IPFS Reference
                  </div>
                  <p className="font-mono text-sm text-slate-900 break-all">{selectedClaim.ipfsHash}</p>
                </div>

                {/* Documents */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">Attached Documents</p>
                  <div className="space-y-2">
                    {selectedClaim.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-900">{doc}</span>
                        </div>
                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
                {(selectedClaim.status === 'pending' || selectedClaim.status === 'review_required') && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleProcessClaim(selectedClaim)
                    }}
                    className="btn-primary flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Process Claim
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Process Modal */}
      <AnimatePresence>
        {showProcessModal && selectedClaim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProcessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Process Claim</h2>
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{selectedClaim.id}</span>
                    {getPriorityBadge(selectedClaim.priority)}
                  </div>
                  <p className="text-slate-600">{selectedClaim.patientName}</p>
                  <p className="text-xl font-bold text-slate-900 mt-2">${selectedClaim.amount.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Approval Notes (Optional)
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={2}
                    placeholder="Add any notes for this approval..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rejection Reason (Required for rejection)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    placeholder="Explain why this claim is being rejected..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 text-sm">Blockchain Transaction</p>
                    <p className="text-amber-600 text-sm">
                      This action will be permanently recorded on the blockchain and cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={rejectClaim}
                  className="btn-danger flex-1"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={approveClaim}
                  className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
