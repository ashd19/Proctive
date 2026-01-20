import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"
import { Lock, Mail, Shield, User, ChevronRight, HeartPulse, CheckCircle2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("doctor")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate()


  const signIn = async () => {
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const role = data.session?.user.user_metadata?.role

    switch (role) {
      case "doctor":
        navigate("/doctor", { replace: true })
        break
      case "insurance":
        navigate("/insurance", { replace: true })
        break
      case "admin":
        navigate("/admin", { replace: true })
        break
      default:
        navigate("/patient", { replace: true })
    }

    setLoading(false)
  }


  const signUp = async () => {
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    })

    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative">
      {/* Structural Background Pattern - "Blockchain/Security" Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 items-center">

          {/* Left Side: Brand Value Proposition */}
          <div className="hidden lg:block space-y-10 pr-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >


              <h1 className="text-5xl font-bold font-display text-slate-900 leading-tight">
                Secure. Transparent. <br />
                <span className="text-blue-700">Decentralized Care.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed pt-2">
                Access the next generation of healthcare records. Powered by blockchain technology for immutable security and instant verifiability.
              </p>
            </motion.div>

            <div className="space-y-4">
              {[
                "End-to-end encrypted patient data",
                "Immutable audit trails for every action",
                "Instant multi-party insurance verification"
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="flex items-center gap-3 text-slate-700 font-medium"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side: Login Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-white rounded-xl border-2 border-slate-200 shadow-xl overflow-hidden relative">
              {/* Header */}
              <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <HeartPulse className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-900 tracking-tight">VitalChain</span>
                </div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-4">Secure Portal Login</h2>
              </div>

              {/* Form Body */}
              <div className="p-8 space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">Authentication Failed</span>
                      {error}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                        placeholder=""
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                        placeholder=""
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Access Role</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <ChevronRight className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={loading}
                        className="w-full pl-12 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-900 font-medium appearance-none focus:outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value="patient">Patient Portal</option>
                        <option value="doctor">Medical Staff</option>
                        <option value="insurance">Insurance Adjuster</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={signIn}
                    disabled={loading}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.99] transition-all flex items-center justify-center gap-2 group border-2 border-transparent"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Verifying Credentials...
                      </span>
                    ) : (
                      <>
                        Secure Sign In
                        <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={signUp}
                        disabled={loading}
                        className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all text-sm uppercase tracking-wide"
                      >
                        {loading ? "Sending..." : "Register New ID"}
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Your Email</AlertDialogTitle>
                        <AlertDialogDescription className="mt-2">
                          📩 A confirmation email has been sent to your registered email address.
                          <br />
                          Please check your inbox and click the verification link to activate your account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="flex justify-end mt-4">
                        <AlertDialogAction className="bg-slate-900 text-white">
                          Got it
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>

                </div>
              </div>

              {/* Secure Footer */}
              <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> 256-bit SSL Encrypted
                </span>
                {/* <span>v2.4.0 (Stable)</span> */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
