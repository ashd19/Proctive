import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Briefcase,
  Users,
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react'
import { useWalletStore } from '../../store/walletStore'

const stats = [
  {
    label: 'Pending Claims',
    value: '23',
    change: '+5 today',
    icon: Clock,
    color: 'from-amber-500 to-amber-600',
  },
  {
    label: 'Approved (MTD)',
    value: '156',
    change: '$1.2M total',
    icon: CheckCircle,
    color: 'from-green-500 to-green-600',
  },
  {
    label: 'Rejected (MTD)',
    value: '12',
    change: '7.1% rate',
    icon: XCircle,
    color: 'from-red-500 to-red-600',
  },
  {
    label: 'Auto-Approved',
    value: '89',
    change: '57% of claims',
    icon: Activity,
    color: 'from-purple-500 to-purple-600',
  },
]

const recentClaims = [
  {
    id: 'CLM-2024-0892',
    patientName: 'John Smith',
    amount: 2450.00,
    type: 'Hospitalization',
    submittedAt: Date.now() - 3600000 * 2,
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'CLM-2024-0891',
    patientName: 'Sarah Johnson',
    amount: 350.00,
    type: 'Lab Tests',
    submittedAt: Date.now() - 3600000 * 5,
    status: 'auto_approved',
    priority: 'normal',
  },
  {
    id: 'CLM-2024-0890',
    patientName: 'Michael Brown',
    amount: 12500.00,
    type: 'Surgery',
    submittedAt: Date.now() - 3600000 * 8,
    status: 'review_required',
    priority: 'high',
  },
  {
    id: 'CLM-2024-0889',
    patientName: 'Emily Davis',
    amount: 180.00,
    type: 'Consultation',
    submittedAt: Date.now() - 86400000,
    status: 'approved',
    priority: 'normal',
  },
]

const claimTypeBreakdown = [
  { type: 'Hospitalization', count: 45, percentage: 28 },
  { type: 'Surgery', count: 32, percentage: 20 },
  { type: 'Lab Tests', count: 48, percentage: 30 },
  { type: 'Consultation', count: 20, percentage: 12 },
  { type: 'Medication', count: 16, percentage: 10 },
]

export default function InsuranceDashboard() {
  const { address } = useWalletStore()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
    return `${Math.floor(diff / 86400000)} days ago`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge-warning">Pending Review</span>
      case 'auto_approved':
        return <span className="status-badge-success">Auto-Approved</span>
      case 'approved':
        return <span className="status-badge-success">Approved</span>
      case 'review_required':
        return <span className="status-badge bg-purple-100 text-purple-700">Manual Review</span>
      case 'rejected':
        return <span className="status-badge-danger">Rejected</span>
      default:
        return <span className="status-badge bg-slate-100 text-slate-600">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative">
          <div className="flex items-center gap-2 text-purple-200 mb-1">
            <Briefcase className="w-5 h-5" />
            {greeting}
          </div>
          <h1 className="text-3xl font-bold mb-2">Insurance Claims Dashboard</h1>
          <p className="text-purple-100 mb-4">
            Process claims, verify documents, and manage policy holders with blockchain transparency.
          </p>
          <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2 w-fit">
            <Activity className="w-4 h-4" />
            <span>Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
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
        {/* Quick Actions & Analytics */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/insurance/claims"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-700 flex-1">Review Pending Claims</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">23</span>
              </Link>
              <Link
                to="/insurance/claims?filter=review"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-700 flex-1">Manual Reviews</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">8</span>
              </Link>
              <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group w-full">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-700 flex-1">Policy Holders</span>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Claim Type Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Claims by Type</h2>
              <PieChart className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {claimTypeBreakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.type}</span>
                    <span className="text-slate-900 font-medium">{item.count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Claims */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Recent Claims</h2>
              <Link to="/insurance/claims" className="text-purple-600 text-sm font-medium hover:text-purple-700">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentClaims.map((claim, index) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      claim.priority === 'high' ? 'bg-amber-100' : 'bg-purple-100'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        claim.priority === 'high' ? 'text-amber-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{claim.id}</p>
                        {claim.priority === 'high' && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm">{claim.patientName} • {claim.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-slate-900">${claim.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">{formatTimeAgo(claim.submittedAt)}</p>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Approval Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">Smart Auto-Approval Active</h3>
            <p className="text-slate-600 text-sm mb-3">
              Claims under $500 with verified documentation are automatically approved by the smart contract.
              57% of claims this month were auto-approved, saving an average of 48 hours processing time.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-slate-600">89 claims auto-approved</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-slate-600">$28,450 processed</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
