import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileText,
  Shield,
  Receipt,
  ClipboardList,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Activity,
  Calendar,
  Heart,
  Pill
} from 'lucide-react'
import { useWalletStore } from '../../store/walletStore'

const stats = [
  {
    label: 'Medical Records',
    value: '24',
    change: '+3 this month',
    icon: FileText,
    color: 'from-blue-500 to-indigo-600',
    trend: 'up'
  },
  {
    label: 'Active Access Grants',
    value: '5',
    change: '2 pending requests',
    icon: Shield,
    color: 'from-purple-500 to-pink-600',
    trend: 'neutral'
  },
  {
    label: 'Insurance Claims',
    value: '3',
    change: '1 approved',
    icon: Receipt,
    color: 'from-green-500 to-emerald-600',
    trend: 'up'
  },
  {
    label: 'Audit Entries',
    value: '156',
    change: 'Last 30 days',
    icon: ClipboardList,
    color: 'from-orange-500 to-red-600',
    trend: 'neutral'
  },
]

const recentActivity = [
  {
    id: 1,
    type: 'access_granted',
    title: 'Access granted to Dr. Smith',
    description: 'City General Hospital',
    time: '2 hours ago',
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    id: 2,
    type: 'record_added',
    title: 'New lab results added',
    description: 'Blood Test - Complete Panel',
    time: '1 day ago',
    icon: FileText,
    color: 'text-blue-500'
  },
  {
    id: 3,
    type: 'claim_submitted',
    title: 'Insurance claim submitted',
    description: 'Claim #INS-2024-0892',
    time: '3 days ago',
    icon: Receipt,
    color: 'text-purple-500'
  },
  {
    id: 4,
    type: 'access_request',
    title: 'Access request pending',
    description: 'Metro Diagnostic Lab',
    time: '5 days ago',
    icon: AlertCircle,
    color: 'text-amber-500'
  },
]

const healthSummary = [
  { label: 'Last Checkup', value: 'Jan 5, 2026', icon: Calendar },
  { label: 'Blood Type', value: 'O+', icon: Heart },
  { label: 'Active Medications', value: '2', icon: Pill },
  { label: 'Upcoming Appointments', value: '1', icon: Clock },
]

const quickActions = [
  { label: 'View Records', path: '/patient/records', icon: FileText, color: 'from-blue-500 to-blue-600' },
  { label: 'Manage Access', path: '/patient/access', icon: Shield, color: 'from-purple-500 to-purple-600' },
  { label: 'File Claim', path: '/patient/claims', icon: Receipt, color: 'from-green-500 to-green-600' },
  { label: 'View Audit Log', path: '/patient/audit', icon: ClipboardList, color: 'from-orange-500 to-orange-600' },
]

export default function PatientDashboard() {
  const { address } = useWalletStore()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative">
          <p className="text-primary-200 mb-1">{greeting}</p>
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Health Portal</h1>
          <p className="text-primary-100 mb-4">
            Your medical data is secure and under your control. Manage access, view records, and track all activity.
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
              {stat.trend === 'up' && (
                <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                </div>
              )}
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
            <p className="text-slate-500 text-sm">{stat.label}</p>
            <p className="text-slate-400 text-xs mt-2">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-700 flex-1">{action.label}</span>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Health Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Health Summary</h2>
            <div className="space-y-4">
              {healthSummary.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-slate-600 text-sm">{item.label}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
              <Link to="/patient/audit" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <p className="text-slate-500 text-sm">{activity.description}</p>
                  </div>
                  <span className="text-slate-400 text-sm whitespace-nowrap">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pending Requests Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mt-6 border border-amber-100"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">2 Pending Access Requests</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Healthcare providers are requesting access to your medical records. Review and respond to these requests.
                </p>
                <Link
                  to="/patient/access"
                  className="inline-flex items-center gap-2 text-amber-700 font-medium hover:text-amber-800 transition-colors"
                >
                  Review Requests
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
