import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Clock, CheckCircle, XCircle, Loader, AlertTriangle, User, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useServices } from '../../services/useServices'
import { useWalletStore } from '../../store/walletStore'
import { ConsentRequest, AccessGrant, AccessControlService, ConsentStatus, AccessLevel } from '../../services/accessControlService'

export default function PatientAccess() {
  const { services, loading: servicesLoading } = useServices()
  const { address } = useWalletStore()
  
  const [activeTab, setActiveTab] = useState<'requests' | 'grants'>('requests')
  const [consentRequests, setConsentRequests] = useState<ConsentRequest[]>([])
  const [accessGrants, setAccessGrants] = useState<AccessGrant[]>([])
  const [grantees, setGrantees] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  // Load data
  useEffect(() => {
    async function loadData() {
      if (!services.accessControl || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Load consent requests
        const requests = await services.accessControl.getPatientConsentRequests(address)
        setConsentRequests(requests)

        // Load grantees
        const granteeAddresses = await services.accessControl.getPatientGrantees(address)
        setGrantees(granteeAddresses)

        // Load access grants for each grantee
        const grants = await Promise.all(
          granteeAddresses.map(async (grantee) => {
            return services.accessControl!.getAccessGrant(address, grantee)
          })
        )
        setAccessGrants(grants.filter(Boolean) as AccessGrant[])

      } catch (error: any) {
        console.error('Error loading access data:', error)
        toast.error(error.message || 'Failed to load access data')
      } finally {
        setLoading(false)
      }
    }

    if (!servicesLoading) {
      loadData()
    }
  }, [services.accessControl, address, servicesLoading])

  // Approve consent request
  const handleApprove = async (requestId: number) => {
    if (!services.accessControl) return

    try {
      setProcessingId(requestId)
      toast.loading('Approving consent request...')
      
      await services.accessControl.approveConsent(requestId)
      
      toast.dismiss()
      toast.success('✓ Consent approved! Access granted on blockchain')
      
      // Reload data
      if (address) {
        const requests = await services.accessControl.getPatientConsentRequests(address)
        setConsentRequests(requests)
        
        const granteeAddresses = await services.accessControl.getPatientGrantees(address)
        const grants = await Promise.all(
          granteeAddresses.map(async (grantee) => services.accessControl!.getAccessGrant(address, grantee))
        )
        setAccessGrants(grants.filter(Boolean) as AccessGrant[])
      }
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to approve consent')
    } finally {
      setProcessingId(null)
    }
  }

  // Reject consent request
  const handleReject = async (requestId: number) => {
    if (!services.accessControl) return

    try {
      setProcessingId(requestId)
      toast.loading('Rejecting consent request...')
      
      await services.accessControl.rejectConsent(requestId)
      
      toast.dismiss()
      toast.success('✓ Consent request rejected')
      
      // Reload data
      if (address) {
        const requests = await services.accessControl.getPatientConsentRequests(address)
        setConsentRequests(requests)
      }
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to reject consent')
    } finally {
      setProcessingId(null)
    }
  }

  // Revoke access
  const handleRevoke = async (granteeAddress: string) => {
    if (!services.accessControl) return

    try {
      setProcessingId(Date.now())
      toast.loading('Revoking access...')
      
      await services.accessControl.revokeAccess(granteeAddress)
      
      toast.dismiss()
      toast.success('✓ Access revoked successfully')
      
      // Reload grants
      if (address) {
        const granteeAddresses = await services.accessControl.getPatientGrantees(address)
        const grants = await Promise.all(
          granteeAddresses.map(async (grantee) => services.accessControl!.getAccessGrant(address, grantee))
        )
        setAccessGrants(grants.filter(Boolean) as AccessGrant[])
      }
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to revoke access')
    } finally {
      setProcessingId(null)
    }
  }

  if (servicesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const pendingRequests = consentRequests.filter(r => r.status === ConsentStatus.PENDING)
  const activeGrants = accessGrants.filter(g => g.isActive && g.expiresAt * 1000 > Date.now())

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Management</h1>
          <p className="text-slate-600">
            Control who can access your medical records
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'requests'
                ? 'text-primary-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consent Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                {pendingRequests.length}
              </span>
            )}
            {activeTab === 'requests' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('grants')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'grants'
                ? 'text-primary-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Access Grants
            {activeGrants.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {activeGrants.length}
              </span>
            )}
            {activeTab === 'grants' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        </div>

        {/* Consent Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending requests</h3>
                <p className="text-slate-600">You don't have any pending consent requests</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-amber-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-amber-100 p-3 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          Access Request
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {request.requester.slice(0, 6)}...{request.requester.slice(-4)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {request.institutionName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(request.requestedAt * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Pending
                    </span>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Purpose: </span>
                      <span className="text-sm text-slate-900">{request.purpose}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Requested Level: </span>
                      <span className="text-sm text-slate-900">
                        {AccessControlService.getAccessLevelName(request.requestedLevel)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Validity: </span>
                      <span className="text-sm text-slate-900">
                        {Math.floor(request.validityPeriod / 86400)} days
                      </span>
                    </div>
                    {request.recordIds.length > 0 && (
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Records: </span>
                        <span className="text-sm text-slate-900">
                          {request.recordIds.length} specific record(s)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      {processingId === request.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Active Grants Tab */}
        {activeTab === 'grants' && (
          <div className="space-y-4">
            {activeGrants.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No active access grants</h3>
                <p className="text-slate-600">You haven't granted access to anyone yet</p>
              </div>
            ) : (
              activeGrants.map((grant) => {
                const daysUntilExpiry = Math.ceil((grant.expiresAt * 1000 - Date.now()) / 86400000)
                
                return (
                  <motion.div
                    key={grant.grantee}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {grant.grantee.slice(0, 6)}...{grant.grantee.slice(-4)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Granted {new Date(grant.grantedAt * 1000).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Active
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        daysUntilExpiry <= 7
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {daysUntilExpiry} days left
                      </span>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Purpose: </span>
                        <span className="text-sm text-slate-900">{grant.purpose}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Access Level: </span>
                        <span className="text-sm text-slate-900">
                          {AccessControlService.getAccessLevelName(grant.accessLevel)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Expires: </span>
                        <span className="text-sm text-slate-900">
                          {new Date(grant.expiresAt * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      {grant.recordIds.length > 0 && (
                        <div>
                          <span className="text-sm font-semibold text-slate-700">Records: </span>
                          <span className="text-sm text-slate-900">
                            {grant.recordIds.length} specific record(s)
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRevoke(grant.grantee)}
                      disabled={processingId !== null}
                      className="w-full btn-secondary flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
                    >
                      {processingId !== null ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Revoke Access
                    </button>
                  </motion.div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
