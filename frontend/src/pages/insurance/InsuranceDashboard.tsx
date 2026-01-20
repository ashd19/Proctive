import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  BarChart3,
} from "lucide-react";
import { useServices } from "../../services/useServices";
import { useWalletStore } from "../../store/walletStore";
import { ClaimStatus } from "../../services/insuranceClaimsService";
import Navbar from "@/components/Navbar";

export default function InsuranceDashboard() {
  const { services, loading: servicesLoading } = useServices();
  const { address, disconnect } = useWalletStore();

  const [stats, setStats] = useState({
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!services.insuranceClaims || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [pending, underReview, approved, rejected, paid] =
          await Promise.all([
            services.insuranceClaims.getClaimsByStatus(ClaimStatus.PENDING),
            services.insuranceClaims.getClaimsByStatus(
              ClaimStatus.UNDER_REVIEW,
            ),
            services.insuranceClaims.getClaimsByStatus(ClaimStatus.APPROVED),
            services.insuranceClaims.getClaimsByStatus(ClaimStatus.REJECTED),
            services.insuranceClaims.getClaimsByStatus(ClaimStatus.PAID),
          ]);

        const allApproved = [...approved, ...paid];
        const totalApproved = allApproved.reduce(
          (sum, claim) => sum + Number(claim.approvedAmount),
          0,
        );

        setStats({
          pendingClaims: pending.length + underReview.length,
          approvedClaims: allApproved.length,
          rejectedClaims: rejected.length,
          totalAmount: totalApproved,
        });
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
      <Navbar
        isConnected={true}
        handleDisconnect={disconnect}
        otherThanLanding={true}
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Insurance Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome back! Here's your claims overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              {stats.pendingClaims > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  Action Required
                </span>
              )}
            </div>
            <div className="text-3xl font-bold mb-1">{stats.pendingClaims}</div>
            <div className="text-amber-100 text-sm">Pending Claims</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <BarChart3 className="w-5 h-5 text-white/60" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats.approvedClaims}
            </div>
            <div className="text-green-100 text-sm">Approved Claims</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats.rejectedClaims}
            </div>
            <div className="text-red-100 text-sm">Rejected Claims</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${(stats.totalAmount / 1e18).toFixed(2)}
            </div>
            <div className="text-blue-100 text-sm">Total Approved Amount</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="/insurance/claims"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Review Claims
                </h3>
                <p className="text-sm text-slate-600">Process pending claims</p>
              </div>
            </div>
          </a>

          <a
            href="/insurance/claims?status=approved"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Approved Claims
                </h3>
                <p className="text-sm text-slate-600">View approved claims</p>
              </div>
            </div>
          </a>

          <a
            href="/insurance/claims?status=rejected"
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg group-hover:bg-red-200 transition-colors">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Rejected Claims
                </h3>
                <p className="text-sm text-slate-600">View rejected claims</p>
              </div>
            </div>
          </a>
        </div>

        {/* Alert */}
        {stats.pendingClaims > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  {stats.pendingClaims} Claims Awaiting Review
                </h3>
                <p className="text-amber-700 text-sm mb-3">
                  Review and process pending insurance claims
                </p>
                <a
                  href="/insurance/claims"
                  className="text-amber-600 font-medium text-sm hover:underline"
                >
                  Review Claims →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
