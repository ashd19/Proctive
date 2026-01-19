import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users,
  AlertTriangle,
  FileText,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
  Stethoscope,
  Send
} from 'lucide-react'
import { useWalletStore } from '../../store/walletStore'

const stats = [
  {
    label: 'Patients Today',
    value: '12',
    change: '+3 from yesterday',
    icon: Users,
    color: 'from-medical-500 to-medical-600',
    trend: 'up'
  },
  {
    label: 'Pending Consents',
    value: '4',
    change: 'Awaiting response',
    icon: Clock,
    color: 'from-amber-500 to-amber-600',
    trend: 'neutral'
  },
  {
    label: 'Active Access',
    value: '28',
    change: 'Patients',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    trend: 'up'
  },
  {
    label: 'Emergency Sessions',
    value: '2',
    change: 'This month',
    icon: AlertTriangle,
    color: 'from-red-500 to-red-600',
    trend: 'neutral'
  },
]

const recentPatients = [
  {
    id: 1,
    name: 'John Smith',
    address: '0x1234...5678',
    lastAccess: Date.now() - 3600000 * 2,
    recordCount: 12,
    hasAccess: true,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    address: '0xabcd...efgh',
    lastAccess: Date.now() - 3600000 * 5,
    recordCount: 8,
    hasAccess: true,
  },
  {
    id: 3,
    name: 'Michael Brown',
    address: '0x9876...5432',
    lastAccess: Date.now() - 86400000,
    recordCount: 15,
    hasAccess: false,
  },
]

const pendingConsents = [
  {
    id: 1,
    patientName: 'Emily Davis',
    patientAddress: '0xijkl...mnop',
    requestedAt: Date.now() - 86400000 * 2,
    purpose: 'Cardiovascular assessment',
  },
  {
    id: 2,
    patientName: 'Robert Wilson',
    patientAddress: '0xqrst...uvwx',
    requestedAt: Date.now() - 86400000,
    purpose: 'Pre-surgery evaluation',
  },
]

export default function DoctorDashboard() {
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-medical-600 via-medical-700 to-cyan-800 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative">
          <div className="flex items-center gap-2 text-medical-200 mb-1">
            <Stethoscope className="w-5 h-5" />
            {greeting}, Doctor
          </div>
          <h1 className="text-3xl font-bold mb-2">Healthcare Provider Portal</h1>
          <p className="text-medical-100 mb-4">
            Access patient records, manage consent requests, and handle emergency situations.
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
              <Link
                to="/doctor/patients"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-700 flex-1">Search Patients</span>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </Link>
              <Link
                to="/doctor/emergency"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-700 flex-1">Emergency Access</span>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </Link>
              <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group w-full">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-700 flex-1">Request Access</span>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Pending Consents */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Pending Consents</h2>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-sm rounded-full font-medium">
                {pendingConsents.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingConsents.map((consent) => (
                <div key={consent.id} className="p-3 bg-amber-50/50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-900">{consent.patientName}</p>
                    <span className="text-xs text-slate-400">
                      {formatTimeAgo(consent.requestedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{consent.purpose}</p>
                </div>
              ))}
              {pendingConsents.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No pending requests</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Recent Patients</h2>
              <Link to="/doctor/patients" className="text-medical-600 text-sm font-medium hover:text-medical-700">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center text-white font-semibold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{patient.name}</p>
                      <p className="text-slate-500 text-sm font-mono">{patient.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Records</p>
                      <p className="font-semibold text-slate-900">{patient.recordCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Last Access</p>
                      <p className="font-medium text-slate-700">{formatTimeAgo(patient.lastAccess)}</p>
                    </div>
                    {patient.hasAccess ? (
                      <span className="status-badge-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="status-badge bg-slate-100 text-slate-600">
                        <Clock className="w-3 h-3 mr-1" />
                        Expired
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Emergency Access Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mt-6 border border-red-100"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Emergency Access Available</h3>
                <p className="text-slate-600 text-sm mb-3">
                  In life-threatening situations, you can access patient records without prior consent. 
                  All emergency accesses are logged and subject to review.
                </p>
                <Link
                  to="/doctor/emergency"
                  className="inline-flex items-center gap-2 text-red-700 font-medium hover:text-red-800 transition-colors"
                >
                  Start Emergency Session
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
