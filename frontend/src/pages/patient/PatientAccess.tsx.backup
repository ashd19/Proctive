import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Plus,
  Clock,
  CheckCircle,
  Calendar,
  Lock,
  Unlock,
  X,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import { AccessLevel } from '../../types'

const accessLevelLabels = {
  [AccessLevel.NONE]: 'No Access',
  [AccessLevel.VIEW_ONLY]: 'View Only',
  [AccessLevel.VIEW_AND_DOWNLOAD]: 'View & Download',
  [AccessLevel.FULL_ACCESS]: 'Full Access',
}

// Sample data
const activeGrants = [
  {
    id: 1,
    grantee: '0x1234...5678',
    granteeName: 'Dr. Sarah Johnson',
    institution: 'City General Hospital',
    accessLevel: AccessLevel.VIEW_AND_DOWNLOAD,
    grantedAt: Date.now() - 86400000 * 7,
    expiresAt: Date.now() + 86400000 * 23,
    recordCount: 5,
    purpose: 'Ongoing treatment and follow-up care',
  },
  {
    id: 2,
    grantee: '0xabcd...efgh',
    granteeName: 'Metro Diagnostic Lab',
    institution: 'Metro Diagnostic Lab',
    accessLevel: AccessLevel.VIEW_ONLY,
    grantedAt: Date.now() - 86400000 * 3,
    expiresAt: Date.now() + 86400000 * 27,
    recordCount: 2,
    purpose: 'Lab result analysis and reporting',
  },
]

const pendingRequests = [
  {
    id: 1,
    requester: '0x9876...5432',
    requesterName: 'Dr. Michael Chen',
    institution: 'Heart Care Specialists',
    requestedLevel: AccessLevel.FULL_ACCESS,
    purpose: 'Cardiovascular assessment and treatment planning',
    requestedAt: Date.now() - 86400000 * 2,
    validityPeriod: 30,
    recordIds: [],
  },
  {
    id: 2,
    requester: '0xijkl...mnop',
    requesterName: 'HealthFirst Insurance',
    institution: 'HealthFirst Insurance Co.',
    requestedLevel: AccessLevel.VIEW_ONLY,
    purpose: 'Insurance claim verification - Claim #CLM-2024-1234',
    requestedAt: Date.now() - 86400000,
    validityPeriod: 14,
    recordIds: [1, 2, 3],
  },
]

export default function PatientAccess() {
  const [activeTab, setActiveTab] = useState<'grants' | 'requests'>('requests')
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const handleApprove = async (requestId: number) => {
    setProcessingId(requestId)
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Consent granted successfully!')
    setProcessingId(null)
  }

  const handleReject = async (requestId: number) => {
    setProcessingId(requestId)
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Consent request rejected')
    setProcessingId(null)
  }

  const handleRevoke = async (grantId: number) => {
    setProcessingId(grantId)
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Access revoked successfully')
    setProcessingId(null)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (expiresAt: number) => {
    const days = Math.ceil((expiresAt - Date.now()) / 86400000)
    return days > 0 ? days : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access Control</h1>
          <p className="text-slate-500">Manage who can view your medical records</p>
        </div>
        <button
          onClick={() => setShowGrantModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Grant New Access
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Unlock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeGrants.length}</p>
              <p className="text-slate-500 text-sm">Active Grants</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingRequests.length}</p>
              <p className="text-slate-500 text-sm">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-slate-500 text-sm">Data Protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'requests' 
                ? 'text-primary-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                {pendingRequests.length}
              </span>
            )}
            {activeTab === 'requests' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('grants')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'grants' 
                ? 'text-primary-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Active Grants
            {activeTab === 'grants' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              />
            )}
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'requests' ? (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">All caught up!</h3>
                    <p className="text-slate-400">No pending consent requests</p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      layout
                      className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                            {request.requesterName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{request.requesterName}</h3>
                            <p className="text-slate-500 text-sm">{request.institution}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                request.requestedLevel === AccessLevel.FULL_ACCESS 
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {accessLevelLabels[request.requestedLevel]}
                              </span>
                              <span className="text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {request.validityPeriod} days validity
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                            className="btn-success flex items-center gap-2"
                          >
                            {processingId === request.id ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                            Approve
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-white rounded-lg">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Purpose: </span>
                          {request.purpose}
                        </p>
                        {request.recordIds.length > 0 && (
                          <p className="text-sm text-slate-500 mt-2">
                            Requesting access to {request.recordIds.length} specific record(s)
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="grants"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {activeGrants.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No active grants</h3>
                    <p className="text-slate-400">You haven't granted access to anyone yet</p>
                  </div>
                ) : (
                  activeGrants.map((grant) => (
                    <motion.div
                      key={grant.id}
                      layout
                      className="bg-slate-50 rounded-xl p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                            {grant.granteeName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{grant.granteeName}</h3>
                            <p className="text-slate-500 text-sm">{grant.institution}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                grant.accessLevel === AccessLevel.FULL_ACCESS 
                                  ? 'bg-purple-100 text-purple-700'
                                  : grant.accessLevel === AccessLevel.VIEW_AND_DOWNLOAD
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {accessLevelLabels[grant.accessLevel]}
                              </span>
                              <span className="text-slate-400">
                                {grant.recordCount} records
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-slate-500">Expires in</p>
                            <p className="font-semibold text-slate-900">
                              {getDaysRemaining(grant.expiresAt)} days
                            </p>
                          </div>
                          <button
                            onClick={() => handleRevoke(grant.id)}
                            disabled={processingId === grant.id}
                            className="btn-danger flex items-center gap-2"
                          >
                            {processingId === grant.id ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Lock className="w-5 h-5" />
                            )}
                            Revoke
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-white rounded-lg">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Purpose: </span>
                          {grant.purpose}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Granted: {formatDate(grant.grantedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires: {formatDate(grant.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grant Modal */}
      <AnimatePresence>
        {showGrantModal && (
          <GrantAccessModal onClose={() => setShowGrantModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function GrantAccessModal({ onClose }: { onClose: () => void }) {
  const [address, setAddress] = useState('')
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.VIEW_ONLY)
  const [validityDays, setValidityDays] = useState(30)
  const [purpose, setPurpose] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Access granted successfully!')
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
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Grant Access</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="input-field font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Access Level
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(Number(e.target.value) as AccessLevel)}
              className="input-field"
            >
              <option value={AccessLevel.VIEW_ONLY}>View Only</option>
              <option value={AccessLevel.VIEW_AND_DOWNLOAD}>View & Download</option>
              <option value={AccessLevel.FULL_ACCESS}>Full Access</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Validity Period (days)
            </label>
            <input
              type="number"
              value={validityDays}
              onChange={(e) => setValidityDays(Number(e.target.value))}
              min={1}
              max={365}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Purpose
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Reason for granting access..."
              className="input-field min-h-[80px] resize-none"
              rows={3}
              required
            />
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
              Grant Access
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
