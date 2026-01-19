import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardList,
  Search,
  Eye,
  Download,
  Clock,
  AlertTriangle,
  User,
  FileText,
  ChevronDown,
  Flag
} from 'lucide-react'
import { AccessType } from '../../types'

const accessTypeConfig = {
  [AccessType.VIEW]: { label: 'View', color: 'bg-blue-100 text-blue-700', icon: Eye },
  [AccessType.DOWNLOAD]: { label: 'Download', color: 'bg-purple-100 text-purple-700', icon: Download },
  [AccessType.UPDATE]: { label: 'Update', color: 'bg-amber-100 text-amber-700', icon: FileText },
  [AccessType.CREATE]: { label: 'Create', color: 'bg-green-100 text-green-700', icon: FileText },
  [AccessType.EMERGENCY_ACCESS]: { label: 'Emergency', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  [AccessType.CONSENT_GRANTED]: { label: 'Consent Granted', color: 'bg-emerald-100 text-emerald-700', icon: User },
  [AccessType.CONSENT_REVOKED]: { label: 'Consent Revoked', color: 'bg-slate-100 text-slate-700', icon: User },
  [AccessType.INSURANCE_CLAIM]: { label: 'Insurance', color: 'bg-cyan-100 text-cyan-700', icon: FileText },
}

// Sample audit log data
const sampleLogs = [
  {
    id: 1,
    accessorName: 'Dr. Sarah Johnson',
    accessorRole: 'Cardiologist',
    institutionName: 'City General Hospital',
    recordId: 1,
    recordTitle: 'Annual Physical Examination',
    accessType: AccessType.VIEW,
    timestamp: Date.now() - 3600000 * 2,
    isEmergencyAccess: false,
    isFlagged: false,
  },
  {
    id: 2,
    accessorName: 'Dr. Michael Chen',
    accessorRole: 'Emergency Physician',
    institutionName: 'Metro Emergency Center',
    recordId: 3,
    recordTitle: 'Complete Medical History',
    accessType: AccessType.EMERGENCY_ACCESS,
    timestamp: Date.now() - 86400000 * 3,
    isEmergencyAccess: true,
    emergencyReason: 'Patient unconscious, required immediate access to medical history',
    isFlagged: false,
  },
  {
    id: 3,
    accessorName: 'Metro Diagnostic Lab',
    accessorRole: 'Laboratory',
    institutionName: 'Metro Diagnostic Lab',
    recordId: 2,
    recordTitle: 'Blood Test Results',
    accessType: AccessType.CREATE,
    timestamp: Date.now() - 86400000 * 7,
    isEmergencyAccess: false,
    isFlagged: false,
  },
  {
    id: 4,
    accessorName: 'HealthFirst Insurance',
    accessorRole: 'Insurance Provider',
    institutionName: 'HealthFirst Insurance Co.',
    recordId: 1,
    recordTitle: 'Annual Physical Examination',
    accessType: AccessType.INSURANCE_CLAIM,
    timestamp: Date.now() - 86400000 * 10,
    isEmergencyAccess: false,
    isFlagged: false,
  },
  {
    id: 5,
    accessorName: 'Dr. Emily Brown',
    accessorRole: 'Radiologist',
    institutionName: 'City General Hospital',
    recordId: 4,
    recordTitle: 'Chest X-Ray',
    accessType: AccessType.DOWNLOAD,
    timestamp: Date.now() - 86400000 * 14,
    isEmergencyAccess: false,
    isFlagged: false,
  },
  {
    id: 6,
    accessorName: 'Dr. James Wilson',
    accessorRole: 'General Practitioner',
    institutionName: 'Community Health Center',
    recordId: 5,
    recordTitle: 'Vaccination Record',
    accessType: AccessType.UPDATE,
    timestamp: Date.now() - 86400000 * 21,
    isEmergencyAccess: false,
    isFlagged: false,
  },
]

export default function PatientAuditLog() {
  const [logs] = useState(sampleLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<AccessType | 'all'>('all')
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false)

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.accessorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.recordTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || log.accessType === selectedType
    const matchesEmergency = !showEmergencyOnly || log.isEmergencyAccess
    return matchesSearch && matchesType && matchesEmergency
  })

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} days ago`
    } else {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const emergencyCount = logs.filter(l => l.isEmergencyAccess).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-slate-500">Complete history of all access to your medical records</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
              <p className="text-slate-500 text-sm">Total Entries</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {logs.filter(l => l.accessType === AccessType.VIEW).length}
              </p>
              <p className="text-slate-500 text-sm">Views</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{emergencyCount}</p>
              <p className="text-slate-500 text-sm">Emergency Access</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Flag className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {logs.filter(l => l.isFlagged).length}
              </p>
              <p className="text-slate-500 text-sm">Flagged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, institution, or record..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value === 'all' ? 'all' : Number(e.target.value) as AccessType)}
              className="input-field pr-10 appearance-none min-w-[180px]"
            >
              <option value="all">All Types</option>
              {Object.entries(accessTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>

          {/* Emergency Toggle */}
          <button
            onClick={() => setShowEmergencyOnly(!showEmergencyOnly)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              showEmergencyOnly 
                ? 'bg-red-100 text-red-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency Only
          </button>
        </div>
      </div>

      {/* Audit Log List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-left">Accessor</th>
                <th className="px-6 py-4 text-left">Record</th>
                <th className="px-6 py-4 text-left">Action</th>
                <th className="px-6 py-4 text-left">Time</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => {
                const config = accessTypeConfig[log.accessType]
                const Icon = config.icon

                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`table-row ${log.isEmergencyAccess ? 'bg-red-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          log.isEmergencyAccess 
                            ? 'bg-gradient-to-br from-red-400 to-red-600'
                            : 'bg-gradient-to-br from-primary-400 to-primary-600'
                        }`}>
                          {log.accessorName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{log.accessorName}</p>
                          <p className="text-slate-500 text-sm">{log.institutionName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900">{log.recordTitle}</p>
                      <p className="text-slate-400 text-sm">Record #{log.recordId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                      {log.isEmergencyAccess && (
                        <p className="text-red-600 text-xs mt-1 max-w-xs truncate" title={log.emergencyReason}>
                          {log.emergencyReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        {log.isEmergencyAccess && !log.isFlagged && (
                          <button 
                            className="p-2 hover:bg-amber-100 rounded-lg transition-colors" 
                            title="Flag for Review"
                          >
                            <Flag className="w-4 h-4 text-amber-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No entries found</h3>
            <p className="text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Emergency Access Notice */}
      {emergencyCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Emergency Access Records</h3>
              <p className="text-slate-600 text-sm mb-3">
                {emergencyCount} emergency access event(s) occurred. These are legitimate accesses for critical care situations, 
                but you can flag any access for review if you believe it was unauthorized.
              </p>
              <button className="text-red-700 font-medium hover:text-red-800 transition-colors text-sm">
                Review Emergency Accesses →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
