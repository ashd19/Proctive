import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, Shield, AlertTriangle, Loader, Clock, CheckCircle } from 'lucide-react'
import { useServices } from '../../services/useServices'
import { useWalletStore } from '../../store/walletStore'

export default function DoctorDashboard() {
  const { services, loading: servicesLoading } = useServices()
  const { address } = useWalletStore()
  
  const [stats, setStats] = useState({
    accessiblePatients: 0,
    pendingRequests: 0,
    emergencyAccesses: 0,
    totalRecordsViewed: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      if (!services.accessControl || !services.emergencyAccess || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        const [patients, requests, emergencyLogs] = await Promise.all([
          services.accessControl.getRequesterAccessiblePatients(address),
          services.accessControl.getRequesterConsentRequests(address),
          services.emergencyAccess.getDoctorEmergencyLogs(address)
        ])

        const pendingCount = requests.filter((r: any) => r.status === 0).length
        const unresolvedEmergencies = emergencyLogs.filter((log: any) => !log.wasResolved).length

        setStats({
          accessiblePatients: patients.length,
          pendingRequests: pendingCount,
          emergencyAccesses: unresolvedEmergencies,
          totalRecordsViewed: patients.length * 2 // Approximate
        })
      } catch (error: any) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!servicesLoading) {
      loadDashboardData()
    }
  }, [services, address, servicesLoading])

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Doctor Dashboard</h1>
          <p className="text-slate-600">Welcome back, Doctor! Here's your patient overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <CheckCircle className="w-5 h-5 text-white/60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.accessiblePatients}</div>
            <div className="text-blue-100 text-sm">Accessible Patients</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              {stats.pendingRequests > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">New</span>
              )}
            </div>
            <div className="text-3xl font-bold mb-1">{stats.pendingRequests}</div>
            <div className="text-amber-100 text-sm">Pending Requests</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              {stats.emergencyAccesses > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">!</span>
              )}
            </div>
            <div className="text-3xl font-bold mb-1">{stats.emergencyAccesses}</div>
            <div className="text-red-100 text-sm">Unresolved Emergencies</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <Shield className="w-5 h-5 text-white/60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalRecordsViewed}</div>
            <div className="text-green-100 text-sm">Records Accessed</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="/doctor/patients"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">View Patients</h3>
                <p className="text-sm text-slate-600">Access patient medical records</p>
              </div>
            </div>
          </a>

          <a
            href="/doctor/emergency"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg group-hover:bg-red-200 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Emergency Access</h3>
                <p className="text-sm text-slate-600">Request emergency record access</p>
              </div>
            </div>
          </a>

          <a
            href="/doctor/patients"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Request Consent</h3>
                <p className="text-sm text-slate-600">Request access to new patients</p>
              </div>
            </div>
          </a>
        </div>

        {/* Alerts */}
        {stats.emergencyAccesses > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  {stats.emergencyAccesses} Unresolved Emergency Access
                </h3>
                <p className="text-red-700 text-sm mb-3">
                  You have emergency access requests that require patient acknowledgment
                </p>
                <a href="/doctor/emergency" className="text-red-600 font-medium text-sm hover:underline">
                  View Emergency Logs →
                </a>
              </div>
            </div>
          </div>
        )}

        {stats.pendingRequests > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  {stats.pendingRequests} Pending Consent Requests
                </h3>
                <p className="text-amber-700 text-sm mb-3">
                  Waiting for patients to approve your access requests
                </p>
                <a href="/doctor/patients" className="text-amber-600 font-medium text-sm hover:underline">
                  View Requests →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
