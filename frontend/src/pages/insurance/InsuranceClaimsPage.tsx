import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, XCircle, Eye, Loader, DollarSign, User, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { useServices } from '../../services/useServices'
import { useWalletStore } from '../../store/walletStore'
import { InsuranceClaim, ClaimStatus, InsuranceClaimsService } from '../../services/insuranceClaimsService'

export default function InsuranceClaimsPage() {
  const { services, loading: servicesLoading } = useServices()
  const { address } = useWalletStore()
  
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | ClaimStatus>(ClaimStatus.PENDING)
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null)

  useEffect(() => {
    loadClaims()
  }, [filter, services.insuranceClaims, servicesLoading])

  async function loadClaims() {
    if (!services.insuranceClaims) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let allClaims: InsuranceClaim[] = []

      if (filter === 'all') {
        const [pending, underReview, approved, rejected, paid] = await Promise.all([
          services.insuranceClaims.getClaimsByStatus(ClaimStatus.PENDING),
          services.insuranceClaims.getClaimsByStatus(ClaimStatus.UNDER_REVIEW),
          services.insuranceClaims.getClaimsByStatus(ClaimStatus.APPROVED),
          services.insuranceClaims.getClaimsByStatus(ClaimStatus.REJECTED),
          services.insuranceClaims.getClaimsByStatus(ClaimStatus.PAID)
        ])
        allClaims = [...pending, ...underReview, ...approved, ...rejected, ...paid]
      } else {
        allClaims = await services.insuranceClaims.getClaimsByStatus(filter)
      }

      setClaims(allClaims.sort((a, b) => b.submittedAt - a.submittedAt))
    } catch (error: any) {
      console.error('Error loading claims:', error)
      toast.error(error.message || 'Failed to load claims')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClaim = async (claimId: number, approvedAmount: string) => {
    if (!services.insuranceClaims) return

    try {
      toast.loading('Approving claim on blockchain...')
      await services.insuranceClaims.approveClaim(claimId, approvedAmount, 'Approved by insurance provider')
      toast.dismiss()
      toast.success('✓ Claim approved successfully!')
      loadClaims()
      setSelectedClaim(null)
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to approve claim')
    }
  }

  const handleRejectClaim = async (claimId: number, reason: string) => {
    if (!services.insuranceClaims) return

    try {
      toast.loading('Rejecting claim on blockchain...')
      await services.insuranceClaims.rejectClaim(claimId, reason)
      toast.dismiss()
      toast.success('✓ Claim rejected')
      loadClaims()
      setSelectedClaim(null)
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to reject claim')
    }
  }

  if (servicesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Insurance Claims</h1>
          <p className="text-slate-600">Review and process insurance claims</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            All Claims
          </button>
          <button
            onClick={() => setFilter(ClaimStatus.PENDING)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === ClaimStatus.PENDING
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter(ClaimStatus.UNDER_REVIEW)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === ClaimStatus.UNDER_REVIEW
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Under Review
          </button>
          <button
            onClick={() => setFilter(ClaimStatus.APPROVED)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === ClaimStatus.APPROVED
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter(ClaimStatus.REJECTED)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === ClaimStatus.REJECTED
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter(ClaimStatus.PAID)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === ClaimStatus.PAID
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Paid
          </button>
        </div>

        {/* Claims List */}
        {claims.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No claims found</h3>
            <p className="text-slate-600">No claims match the selected filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">Claim #{claim.id}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        InsuranceClaimsService.getClaimStatusColor(claim.status)
                      }`}>
                        {InsuranceClaimsService.getClaimStatusName(claim.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {claim.patientAddress.slice(0, 6)}...{claim.patientAddress.slice(-4)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(claim.submittedAt * 1000).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{claim.hospitalName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      ${(Number(claim.claimAmount) / 1e18).toFixed(2)}
                    </div>
                    {claim.status === ClaimStatus.APPROVED && (
                      <div className="text-sm text-green-600 font-medium">
                        Approved: ${(Number(claim.approvedAmount) / 1e18).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Diagnosis: </span>
                    <span className="text-sm text-slate-900">{claim.diagnosis}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Treatment: </span>
                    <span className="text-sm text-slate-900">{claim.treatment}</span>
                  </div>
                </div>

                {claim.status === ClaimStatus.PENDING || claim.status === ClaimStatus.UNDER_REVIEW ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    {claim.notes && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="font-semibold">Notes: </span>
                        <span>{claim.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedClaim && (
        <ReviewClaimModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onApprove={handleApproveClaim}
          onReject={handleRejectClaim}
        />
      )}
    </div>
  )
}

function ReviewClaimModal({ claim, onClose, onApprove, onReject }: any) {
  const [approvedAmount, setApprovedAmount] = useState((Number(claim.claimAmount) / 1e18).toString())
  const [rejectionReason, setRejectionReason] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = () => {
    const amountWei = (parseFloat(approvedAmount) * 1e18).toString()
    onApprove(claim.id, amountWei)
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    onReject(claim.id, rejectionReason)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Review Claim #{claim.id}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-slate-700">Patient: </span>
                <span className="text-sm text-slate-900 font-mono">
                  {claim.patientAddress.slice(0, 10)}...{claim.patientAddress.slice(-8)}
                </span>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-700">Hospital: </span>
                <span className="text-sm text-slate-900">{claim.hospitalName}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-700">Submitted: </span>
                <span className="text-sm text-slate-900">
                  {new Date(claim.submittedAt * 1000).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-700">Service Date: </span>
                <span className="text-sm text-slate-900">
                  {new Date(claim.dateOfService * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Diagnosis:</h4>
            <p className="text-slate-700">{claim.diagnosis}</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Treatment:</h4>
            <p className="text-slate-700">{claim.treatment}</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Requested Amount:</h4>
            <p className="text-2xl font-bold text-slate-900">
              ${(Number(claim.claimAmount) / 1e18).toFixed(2)}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Linked Records:</h4>
            <p className="text-slate-700">{claim.recordIds.length} medical records attached</p>
          </div>
        </div>

        {!action ? (
          <div className="flex gap-3">
            <button
              onClick={() => setAction('reject')}
              className="flex-1 btn-secondary bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
            <button
              onClick={() => setAction('approve')}
              className="flex-1 btn-primary bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Approve
            </button>
          </div>
        ) : action === 'approve' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Approved Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAction(null)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button onClick={handleApprove} className="flex-1 btn-primary bg-green-600 hover:bg-green-700">
                Confirm Approval
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide reason for rejection..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAction(null)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button onClick={handleReject} className="flex-1 btn-primary bg-red-600 hover:bg-red-700">
                Confirm Rejection
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
