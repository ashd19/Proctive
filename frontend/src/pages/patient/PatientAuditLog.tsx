import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, Download, Clock, User, FileText, AlertTriangle, Loader, Filter } from 'lucide-react'
import { useServices } from '../../services/useServices'
import { useWalletStore } from '../../store/walletStore'
import { AuditLogEntry, AuditLogService, AccessType } from '../../services/auditLogService'

export default function PatientAuditLog() {
  const { services, loading: servicesLoading } = useServices()
  const { address } = useWalletStore()
  
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'emergency'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadAuditLogs() {
      if (!services.auditLog || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const auditLogs = await services.auditLog.getPatientLogs(address)
        setLogs(auditLogs.sort((a, b) => b.timestamp - a.timestamp))
      } catch (error: any) {
        console.error('Error loading audit logs:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!servicesLoading) {
      loadAuditLogs()
    }
  }, [services.auditLog, address, servicesLoading])

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || (filter === 'emergency' && log.wasEmergency)
    const matchesSearch = 
      log.accessor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const emergencyCount = logs.filter(log => log.wasEmergency).length

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Log</h1>
          <p className="text-slate-600">
            Tamper-proof record of all access to your medical records
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Total Accesses</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{logs.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Emergency Access</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{emergencyCount}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Unique Accessors</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {new Set(logs.map(log => log.accessor)).size}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by accessor or purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Access
              </button>
              <button
                onClick={() => setFilter('emergency')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'emergency'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Emergency Only
                {emergencyCount > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {emergencyCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Audit Log Entries */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {logs.length === 0 ? 'No access logs yet' : 'No matching logs'}
            </h3>
            <p className="text-slate-600">
              {logs.length === 0
                ? 'Access events will appear here when someone views your records'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl p-6 shadow-sm border transition-all hover:shadow-md ${
                  log.wasEmergency ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      log.wasEmergency ? 'bg-amber-100' : getAccessTypeColor(log.accessType)
                    }`}>
                      {log.wasEmergency ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : (
                        getAccessTypeIcon(log.accessType)
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {AuditLogService.getAccessTypeName(log.accessType)}
                        </h3>
                        {log.wasEmergency && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            EMERGENCY
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Accessor:</span>
                          <span className="font-mono">
                            {log.accessor.slice(0, 6)}...{log.accessor.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(log.timestamp * 1000).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>Record ID: {log.recordId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">IP:</span>
                          <span>{log.ipAddress || 'N/A'}</span>
                        </div>
                      </div>

                      {log.purpose && (
                        <div className="text-sm">
                          <span className="font-medium text-slate-700">Purpose: </span>
                          <span className="text-slate-900">{log.purpose}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Blockchain info */}
        {logs.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Tamper-Evident Blockchain Logging</p>
                <p>
                  All access events are permanently recorded on the blockchain and cannot be altered or deleted.
                  Each entry includes the accessor's address, timestamp, and purpose for maximum transparency and security.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getAccessTypeIcon(type: AccessType) {
  switch (type) {
    case AccessType.VIEW:
      return <Eye className="w-5 h-5 text-blue-600" />
    case AccessType.DOWNLOAD:
      return <Download className="w-5 h-5 text-green-600" />
    case AccessType.EMERGENCY:
      return <AlertTriangle className="w-5 h-5 text-amber-600" />
    default:
      return <FileText className="w-5 h-5 text-slate-600" />
  }
}

function getAccessTypeColor(type: AccessType): string {
  switch (type) {
    case AccessType.VIEW:
      return 'bg-blue-100'
    case AccessType.DOWNLOAD:
      return 'bg-green-100'
    case AccessType.UPDATE:
      return 'bg-purple-100'
    case AccessType.SHARE:
      return 'bg-indigo-100'
    case AccessType.EMERGENCY:
      return 'bg-amber-100'
    default:
      return 'bg-slate-100'
  }
}
