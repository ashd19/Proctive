import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Shield,
  Eye,
  Users,
  Activity,
  TrendingUp,
  Loader,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useServices } from "../../services/useServices";
import { useWalletStore } from "../../store/walletStore";

export default function PatientDashboard() {
  const { services, loading: servicesLoading } = useServices();
  const { address } = useWalletStore();

  const [stats, setStats] = useState({
    recordCount: 0,
    activeGrants: 0,
    totalAccesses: 0,
    pendingRequests: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (
        !services.patientRecords ||
        !services.accessControl ||
        !services.auditLog ||
        !address
      ) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [records, grantees, logs, requests] = await Promise.all([
          services.patientRecords.getPatientRecords(address),
          services.accessControl.getPatientGrantees(address),
          services.auditLog.getPatientLogs(address),
          services.accessControl.getPatientConsentRequests(address),
        ]);

        setStats({
          recordCount: records.length,
          activeGrants: grantees.length,
          totalAccesses: logs.length,
          pendingRequests: requests.filter((r: any) => r.status === 0).length,
        });

        const recent = logs.slice(0, 5).map((log: any) => ({
          type: "access",
          accessor: log.accessor,
          timestamp: log.timestamp,
          recordId: log.recordId,
          wasEmergency: log.wasEmergency,
        }));

        setRecentActivity(recent);
      } catch (error: any) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!servicesLoading) {
      loadDashboardData();
    }
  }, [services, address, servicesLoading]);

  if (servicesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Patient Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome back! Here's your health data overview
          </p>
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
                <FileText className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.recordCount}</div>
            <div className="text-blue-100 text-sm">Medical Records</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <Activity className="w-5 h-5 text-white/60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.activeGrants}</div>
            <div className="text-green-100 text-sm">Active Access Grants</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Eye className="w-6 h-6" />
              </div>
              <Activity className="w-5 h-5 text-white/60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalAccesses}</div>
            <div className="text-purple-100 text-sm">Total Accesses</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              {stats.pendingRequests > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  New
                </span>
              )}
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats.pendingRequests}
            </div>
            <div className="text-amber-100 text-sm">Pending Requests</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/patient/records"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Manage Records
                </h3>
                <p className="text-sm text-slate-600">
                  Upload and view your medical records
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/patient/access"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Access Control
                </h3>
                <p className="text-sm text-slate-600">
                  Manage who can view your records
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/patient/audit"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Audit Log</h3>
                <p className="text-sm text-slate-600">
                  View all access to your records
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <p className="text-slate-600 text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.wasEmergency ? "bg-amber-100" : "bg-blue-100"
                      }`}
                    >
                      {activity.wasEmergency ? (
                        <Activity className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Record #{activity.recordId}{" "}
                        {activity.wasEmergency && "(Emergency)"}
                      </p>
                      <p className="text-sm text-slate-600">
                        Accessed by {activity.accessor.slice(0, 6)}...
                        {activity.accessor.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(activity.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
