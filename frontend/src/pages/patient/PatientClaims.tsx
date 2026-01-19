import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
  Building2,
  Calendar,
  X,
  Send,
  Eye,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ClaimStatus, ClaimType } from '../../types'

const claimStatusConfig = {
  [ClaimStatus.DRAFT]: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
  [ClaimStatus.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Send },
  [ClaimStatus.PENDING_DOCUMENTS]: { label: 'Pending Docs', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  [ClaimStatus.UNDER_REVIEW]: { label: 'Under Review', color: 'bg-purple-100 text-purple-700', icon: Clock },
  [ClaimStatus.APPROVED]: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  [ClaimStatus.PARTIALLY_APPROVED]: { label: 'Partial', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  [ClaimStatus.REJECTED]: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  [ClaimStatus.APPEALED]: { label: 'Appealed', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  [ClaimStatus.SETTLED]: { label: 'Settled', color: 'bg-green-100 text-green-700', icon: DollarSign },
  [ClaimStatus.CLOSED]: { label: 'Closed', color: 'bg-slate-100 text-slate-700', icon: CheckCircle },
}

const claimTypeLabels = {
  [ClaimType.HOSPITALIZATION]: 'Hospitalization',
  [ClaimType.OUTPATIENT]: 'Outpatient',
  [ClaimType.SURGERY]: 'Surgery',
  [ClaimType.MEDICATION]: 'Medication',
  [ClaimType.DIAGNOSTIC]: 'Diagnostic',
  [ClaimType.MATERNITY]: 'Maternity',
  [ClaimType.DENTAL]: 'Dental',
  [ClaimType.VISION]: 'Vision',
  [ClaimType.MENTAL_HEALTH]: 'Mental Health',
  [ClaimType.OTHER]: 'Other',
}

// Sample claims data
const sampleClaims = [
  {
    id: 1,
    policyNumber: 'HF-2024-001234',
    insuranceProvider: 'HealthFirst Insurance',
    claimType: ClaimType.HOSPITALIZATION,
    status: ClaimStatus.APPROVED,
    claimAmount: 15000,
    approvedAmount: 12500,
    hospitalName: 'City General Hospital',
    treatmentDate: Date.now() - 86400000 * 30,
    submittedAt: Date.now() - 86400000 * 25,
    processedAt: Date.now() - 86400000 * 10,
    diagnosisCode: 'K35.80',
    treatmentDescription: 'Emergency appendectomy surgery',
  },
  {
    id: 2,
    policyNumber: 'HF-2024-001234',
    insuranceProvider: 'HealthFirst Insurance',
    claimType: ClaimType.DIAGNOSTIC,
    status: ClaimStatus.UNDER_REVIEW,
    claimAmount: 800,
    approvedAmount: 0,
    hospitalName: 'Metro Diagnostic Lab',
    treatmentDate: Date.now() - 86400000 * 14,
    submittedAt: Date.now() - 86400000 * 10,
    processedAt: 0,
    diagnosisCode: 'Z00.00',
    treatmentDescription: 'Full blood panel and metabolic tests',
  },
  {
    id: 3,
    policyNumber: 'HF-2024-001234',
    insuranceProvider: 'HealthFirst Insurance',
    claimType: ClaimType.MEDICATION,
    status: ClaimStatus.REJECTED,
    claimAmount: 350,
    approvedAmount: 0,
    hospitalName: 'City Pharmacy',
    treatmentDate: Date.now() - 86400000 * 45,
    submittedAt: Date.now() - 86400000 * 40,
    processedAt: Date.now() - 86400000 * 35,
    diagnosisCode: 'J06.9',
    treatmentDescription: 'Prescription medications for respiratory infection',
    rejectionReason: 'Medication not covered under current plan',
  },
]

const policyInfo = {
  policyNumber: 'HF-2024-001234',
  insuranceProvider: 'HealthFirst Insurance',
  coverageLimit: 100000,
  usedAmount: 12500,
  deductible: 1000,
  startDate: Date.now() - 86400000 * 180,
  endDate: Date.now() + 86400000 * 185,
}

export default function PatientClaims() {
  const [claims] = useState(sampleClaims)
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | 'all'>('all')
  const [showNewClaimModal, setShowNewClaimModal] = useState(false)
  const [viewingClaim, setViewingClaim] = useState<typeof sampleClaims[0] | null>(null)

  const filteredClaims = claims.filter(claim => 
    selectedStatus === 'all' || claim.status === selectedStatus
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const coverageUsedPercent = (policyInfo.usedAmount / policyInfo.coverageLimit) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Insurance Claims</h1>
          <p className="text-slate-500">Manage and track your insurance claims</p>
        </div>
        <button
          onClick={() => setShowNewClaimModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          File New Claim
        </button>
      </div>

      {/* Policy Overview */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-emerald-200 text-sm mb-1">Insurance Policy</p>
            <h2 className="text-xl font-bold mb-2">{policyInfo.insuranceProvider}</h2>
            <p className="text-emerald-100 font-mono">{policyInfo.policyNumber}</p>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-emerald-200">Coverage Used</span>
              <span className="font-semibold">
                {formatCurrency(policyInfo.usedAmount)} / {formatCurrency(policyInfo.coverageLimit)}
              </span>
            </div>
            <div className="h-3 bg-emerald-900/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${coverageUsedPercent}%` }}
              />
            </div>
            <p className="text-emerald-200 text-sm mt-2">
              {formatCurrency(policyInfo.coverageLimit - policyInfo.usedAmount)} remaining
            </p>
          </div>

          <div className="text-right">
            <p className="text-emerald-200 text-sm">Valid Until</p>
            <p className="font-semibold">{formatDate(policyInfo.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: claims.length, color: 'text-primary-600' },
          { label: 'Approved', value: claims.filter(c => c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.SETTLED).length, color: 'text-green-600' },
          { label: 'Pending', value: claims.filter(c => c.status === ClaimStatus.UNDER_REVIEW || c.status === ClaimStatus.SUBMITTED).length, color: 'text-amber-600' },
          { label: 'Total Recovered', value: formatCurrency(claims.reduce((acc, c) => acc + c.approvedAmount, 0)), color: 'text-emerald-600' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === 'all' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Claims
          </button>
          {Object.entries(claimStatusConfig).slice(0, 6).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedStatus(Number(key) as ClaimStatus)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === Number(key)
                  ? config.color
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.map((claim, index) => {
          const statusConfig = claimStatusConfig[claim.status]
          const StatusIcon = statusConfig.icon

          return (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover cursor-pointer"
              onClick={() => setViewingClaim(claim)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">
                        {claimTypeLabels[claim.claimType]}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm">{claim.treatmentDescription}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {claim.hospitalName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(claim.treatmentDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-slate-500 text-sm">Claimed</p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(claim.claimAmount)}
                    </p>
                  </div>
                  {claim.approvedAmount > 0 && (
                    <div className="text-right">
                      <p className="text-slate-500 text-sm">Approved</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(claim.approvedAmount)}
                      </p>
                    </div>
                  )}
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Eye className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}

        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No claims found</h3>
            <p className="text-slate-400">No claims match the selected filter</p>
          </div>
        )}
      </div>

      {/* New Claim Modal */}
      <AnimatePresence>
        {showNewClaimModal && (
          <NewClaimModal onClose={() => setShowNewClaimModal(false)} />
        )}
      </AnimatePresence>

      {/* View Claim Modal */}
      <AnimatePresence>
        {viewingClaim && (
          <ViewClaimModal claim={viewingClaim} onClose={() => setViewingClaim(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function NewClaimModal({ onClose }: { onClose: () => void }) {
  const [claimType, setClaimType] = useState<ClaimType>(ClaimType.HOSPITALIZATION)
  const [amount, setAmount] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [treatmentDate, setTreatmentDate] = useState('')
  const [description, setDescription] = useState('')
  const [diagnosisCode, setDiagnosisCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Claim submitted successfully!')
    setIsSubmitting(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">File New Claim</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Claim Type
              </label>
              <select
                value={claimType}
                onChange={(e) => setClaimType(Number(e.target.value) as ClaimType)}
                className="input-field"
              >
                {Object.entries(claimTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Claim Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Healthcare Facility
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Hospital or clinic name"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Treatment Date
              </label>
              <input
                type="date"
                value={treatmentDate}
                onChange={(e) => setTreatmentDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Diagnosis Code (ICD-10)
            </label>
            <input
              type="text"
              value={diagnosisCode}
              onChange={(e) => setDiagnosisCode(e.target.value)}
              placeholder="e.g., K35.80"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Treatment Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the treatment or procedure..."
              className="input-field min-h-[100px] resize-none"
              rows={3}
              required
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-slate-700">Attach Medical Records</span>
            </div>
            <p className="text-sm text-slate-500">
              Select relevant medical records to attach to this claim. This helps speed up the verification process.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Submit Claim
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function ViewClaimModal({ claim, onClose }: { claim: typeof sampleClaims[0], onClose: () => void }) {
  const statusConfig = claimStatusConfig[claim.status]
  const StatusIcon = statusConfig.icon

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">Claim Details</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-slate-500 text-sm">Claim Type</p>
                <p className="font-semibold text-slate-900">{claimTypeLabels[claim.claimType]}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Healthcare Facility</p>
                <p className="font-semibold text-slate-900">{claim.hospitalName}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Treatment Date</p>
                <p className="font-semibold text-slate-900">{formatDate(claim.treatmentDate)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-slate-500 text-sm">Claim Amount</p>
                <p className="font-semibold text-slate-900 text-xl">{formatCurrency(claim.claimAmount)}</p>
              </div>
              {claim.approvedAmount > 0 && (
                <div>
                  <p className="text-slate-500 text-sm">Approved Amount</p>
                  <p className="font-semibold text-green-600 text-xl">{formatCurrency(claim.approvedAmount)}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 text-sm">Diagnosis Code</p>
                <p className="font-mono text-slate-900">{claim.diagnosisCode}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-sm mb-1">Treatment Description</p>
            <p className="text-slate-900">{claim.treatmentDescription}</p>
          </div>

          {claim.rejectionReason && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-red-700 font-medium mb-1">Rejection Reason</p>
              <p className="text-red-600 text-sm">{claim.rejectionReason}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Submitted: {formatDate(claim.submittedAt)}</span>
            {claim.processedAt > 0 && (
              <span>Processed: {formatDate(claim.processedAt)}</span>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            {claim.status === ClaimStatus.REJECTED && (
              <button className="btn-primary">Appeal Claim</button>
            )}
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
