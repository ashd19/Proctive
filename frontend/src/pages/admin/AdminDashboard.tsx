import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Users,
  Building,
  Stethoscope,
  TestTube,
  Briefcase,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  X,
  AlertTriangle,
  Globe
} from 'lucide-react'
import { useWalletStore } from '../../store/walletStore'
import toast from 'react-hot-toast'

const stats = [
  {
    label: 'Total Entities',
    value: '156',
    change: '+12 this month',
    icon: Building,
    color: 'from-slate-600 to-slate-700',
  },
  {
    label: 'Hospitals',
    value: '24',
    change: 'Active',
    icon: Building,
    color: 'from-medical-500 to-medical-600',
  },
  {
    label: 'Doctors',
    value: '89',
    change: 'Registered',
    icon: Stethoscope,
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    label: 'Insurance Providers',
    value: '12',
    change: 'Active',
    icon: Briefcase,
    color: 'from-purple-500 to-purple-600',
  },
]

interface Entity {
  id: number
  name: string
  type: 'hospital' | 'doctor' | 'laboratory' | 'insurance'
  address: string
  registeredAt: number
  status: 'active' | 'pending' | 'suspended'
  verificationLevel: 'basic' | 'verified' | 'premium'
}

const mockEntities: Entity[] = [
  {
    id: 1,
    name: 'City General Hospital',
    type: 'hospital',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    registeredAt: Date.now() - 86400000 * 90,
    status: 'active',
    verificationLevel: 'premium',
  },
  {
    id: 2,
    name: 'Dr. Sarah Wilson, MD',
    type: 'doctor',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    registeredAt: Date.now() - 86400000 * 45,
    status: 'active',
    verificationLevel: 'verified',
  },
  {
    id: 3,
    name: 'MedLab Diagnostics',
    type: 'laboratory',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    registeredAt: Date.now() - 86400000 * 30,
    status: 'active',
    verificationLevel: 'verified',
  },
  {
    id: 4,
    name: 'HealthFirst Insurance',
    type: 'insurance',
    address: '0xfedcba9876543210fedcba9876543210fedcba98',
    registeredAt: Date.now() - 86400000 * 60,
    status: 'active',
    verificationLevel: 'premium',
  },
  {
    id: 5,
    name: 'Regional Medical Center',
    type: 'hospital',
    address: '0x456789abcdef0123456789abcdef0123456789ab',
    registeredAt: Date.now() - 86400000 * 2,
    status: 'pending',
    verificationLevel: 'basic',
  },
]

const pendingRegistrations = [
  {
    id: 6,
    name: 'Dr. Michael Chen, MD',
    type: 'doctor',
    address: '0x111222333444555666777888999aaabbbcccddde',
    submittedAt: Date.now() - 86400000,
  },
  {
    id: 7,
    name: 'BioTech Labs Inc.',
    type: 'laboratory',
    address: '0xaaabbbccc111222333444555666777888999ddde',
    submittedAt: Date.now() - 3600000 * 5,
  },
]

export default function AdminDashboard() {
  const { address } = useWalletStore()
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [entityName, setEntityName] = useState('')
  const [entityType, setEntityType] = useState('hospital')
  const [entityAddress, setEntityAddress] = useState('')
  const [entityLicense, setEntityLicense] = useState('')

  const filteredEntities = mockEntities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entity.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || entity.type === filterType
    return matchesSearch && matchesType
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Building className="w-5 h-5" />
      case 'doctor':
        return <Stethoscope className="w-5 h-5" />
      case 'laboratory':
        return <TestTube className="w-5 h-5" />
      case 'insurance':
        return <Briefcase className="w-5 h-5" />
      default:
        return <Building className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'bg-medical-100 text-medical-600'
      case 'doctor':
        return 'bg-cyan-100 text-cyan-600'
      case 'laboratory':
        return 'bg-amber-100 text-amber-600'
      case 'insurance':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge-success"><CheckCircle className="w-3 h-3 mr-1" />Active</span>
      case 'pending':
        return <span className="status-badge-warning"><Clock className="w-3 h-3 mr-1" />Pending</span>
      case 'suspended':
        return <span className="status-badge-danger"><XCircle className="w-3 h-3 mr-1" />Suspended</span>
      default:
        return <span className="status-badge bg-slate-100 text-slate-600">{status}</span>
    }
  }

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'premium':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">Premium</span>
      case 'verified':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Verified</span>
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">Basic</span>
    }
  }

  const handleRegister = () => {
    if (!entityName || !entityAddress || !entityLicense) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success(`${entityName} registered successfully`)
    setShowRegisterModal(false)
    setEntityName('')
    setEntityType('hospital')
    setEntityAddress('')
    setEntityLicense('')
  }

  const approveEntity = (name: string) => {
    toast.success(`${name} has been approved`)
  }

  const rejectEntity = (name: string) => {
    toast.error(`${name} registration rejected`)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Shield className="w-5 h-5" />
            System Administrator
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-slate-300 mb-4">
            Manage entity registrations, monitor system health, and configure platform settings.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2">
              <Activity className="w-4 h-4" />
              <span>Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-green-500/20 text-green-400 rounded-lg px-3 py-2">
              <Globe className="w-4 h-4" />
              <span>Network: Healthy</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
            <p className="text-slate-500 text-sm">{stat.label}</p>
            <p className="text-slate-400 text-xs mt-2">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Registrations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Pending Registrations</h2>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-sm rounded-full font-medium">
              {pendingRegistrations.length}
            </span>
          </div>
          <div className="space-y-4">
            {pendingRegistrations.map((entity) => (
              <div key={entity.id} className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(entity.type)}`}>
                    {getTypeIcon(entity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{entity.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{entity.type}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(entity.submittedAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => approveEntity(entity.name)}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectEntity(entity.name)}
                    className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingRegistrations.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-slate-500">No pending registrations</p>
              </div>
            )}
          </div>
        </div>

        {/* Entity List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Registered Entities</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 transition-all text-sm w-full md:w-48"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 focus:border-slate-400 text-sm appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="hospital">Hospitals</option>
                <option value="doctor">Doctors</option>
                <option value="laboratory">Labs</option>
                <option value="insurance">Insurance</option>
              </select>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn-primary text-sm py-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Register
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filteredEntities.map((entity, index) => (
                <motion.div
                  key={entity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(entity.type)}`}>
                      {getTypeIcon(entity.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{entity.name}</p>
                        {getVerificationBadge(entity.verificationLevel)}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        {entity.address.slice(0, 12)}...{entity.address.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-slate-400">Registered</p>
                      <p className="text-sm text-slate-600">{formatDate(entity.registeredAt)}</p>
                    </div>
                    {getStatusBadge(entity.status)}
                    <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredEntities.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No entities found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">System Overview</h3>
            <p className="text-slate-600 text-sm mb-4">
              All blockchain systems operational. Smart contracts deployed and verified on Sepolia testnet.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Total Records</p>
                <p className="text-xl font-bold text-slate-900">12,458</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Access Grants</p>
                <p className="text-xl font-bold text-slate-900">3,892</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Claims Processed</p>
                <p className="text-xl font-bold text-slate-900">1,245</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Audit Logs</p>
                <p className="text-xl font-bold text-slate-900">45,678</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Register New Entity</h2>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Entity Type *
                  </label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all text-slate-900"
                  >
                    <option value="hospital">Hospital</option>
                    <option value="doctor">Doctor</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="insurance">Insurance Provider</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Entity Name *
                  </label>
                  <input
                    type="text"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="e.g., City General Hospital"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={entityAddress}
                    onChange={(e) => setEntityAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all text-slate-900 placeholder-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    value={entityLicense}
                    onChange={(e) => setEntityLicense(e.target.value)}
                    placeholder="e.g., MED-2024-12345"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 text-sm">Blockchain Registration</p>
                    <p className="text-amber-600 text-sm">
                      This will create a permanent record on the blockchain. Verify all information before submitting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  className="btn-primary flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Register Entity
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
