import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  Users,
  Clock,
  Database,
  AlertTriangle,
  Receipt,
  ArrowRight,
  Activity,
  CheckCircle,
  Sparkles,
  Wallet,
  ChevronRight,
  Globe
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import toast from 'react-hot-toast'

const features = [
  {
    icon: Shield,
    title: 'Patient-Controlled Access',
    description: 'Smart contracts ensure medical records can only be viewed with explicit digital consent from patients.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Database,
    title: 'Interoperable Data Schema',
    description: 'Convert various hospital record formats into standardized, blockchain-compatible structure.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Clock,
    title: 'Tamper-Evident Audit Logs',
    description: 'Every access is recorded with professional name, timestamp, and immutable verification.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Globe,
    title: 'Distributed Storage',
    description: 'Medical images stored on IPFS while access metadata remains securely on the blockchain.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Access Protocol',
    description: 'Authorized doctors can bypass consent in emergencies, with all events flagged for audit.',
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: Receipt,
    title: 'Insurance Automation',
    description: 'Share verified treatment data with insurers to accelerate claim settlement.',
    color: 'from-cyan-500 to-blue-600',
  },
]

const stats = [
  { value: '100K+', label: 'Records Secured' },
  { value: '500+', label: 'Healthcare Providers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '0', label: 'Data Breaches' },
]

const roles = [
  {
    id: 'patient',
    title: 'Patient',
    description: 'Manage your health records, control access, and track who views your data.',
    icon: Users,
    path: '/patient',
    color: 'from-primary-500 to-primary-600',
  },
  {
    id: 'doctor',
    title: 'Healthcare Provider',
    description: 'Access patient records, request consent, and handle emergency situations.',
    icon: Activity,
    path: '/doctor',
    color: 'from-medical-500 to-medical-600',
  },
  {
    id: 'insurance',
    title: 'Insurance Provider',
    description: 'Process claims efficiently with verified medical data and automated workflows.',
    icon: Receipt,
    path: '/insurance',
    color: 'from-emerald-500 to-emerald-600',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { connect, isConnected, setRole, isLoading } = useWalletStore()

  const handleConnect = async () => {
    try {
      await connect()
      toast.success('Wallet connected successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet')
    }
  }

  const handleRoleSelect = (role: 'patient' | 'doctor' | 'insurance', path: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }
    setRole(role)
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-medical-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">MedChain</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#portals" className="nav-link">Portals</a>
            </div>

            <div className="flex items-center gap-4">
              {isConnected ? (
                <button className="btn-primary flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Connected
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-medical-50"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-medical-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Blockchain-Powered Healthcare
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Secure Patient Health
                <span className="gradient-text block">Data Exchange</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                Decentralized architecture for secure sharing of medical records. 
                Empowering patients with ownership while providing doctors comprehensive, 
                verified health information.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {!isConnected ? (
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                  >
                    <Wallet className="w-5 h-5" />
                    {isLoading ? 'Connecting...' : 'Connect Wallet to Start'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <a
                    href="#portals"
                    className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                  >
                    Choose Your Portal
                    <ArrowRight className="w-5 h-5" />
                  </a>
                )}
                <a href="#features" className="btn-secondary text-lg px-8 py-4">
                  Learn More
                </a>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-slate-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Powerful Features for Modern Healthcare
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with cutting-edge blockchain technology to ensure security, 
              transparency, and interoperability across healthcare systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How MedChain Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A simple, secure workflow for managing health data across the ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect Wallet', description: 'Link your Web3 wallet to access the platform securely.' },
              { step: '02', title: 'Upload Records', description: 'Healthcare providers upload encrypted records to IPFS.' },
              { step: '03', title: 'Control Access', description: 'Patients grant or revoke access through smart contracts.' },
              { step: '04', title: 'Verify & Share', description: 'Authorized parties access verified data with full audit trail.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent z-0"></div>
                )}
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-medical-100 flex items-center justify-center">
                    <span className="text-3xl font-bold gradient-text">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Selection */}
      <section id="portals" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Portal
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Select your role to access the appropriate dashboard and features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => handleRoleSelect(role.id as any, role.path)}
                className="group text-left bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-primary-500/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {role.title}
                </h3>
                <p className="text-slate-400 mb-6">
                  {role.description}
                </p>
                <div className="flex items-center gap-2 text-primary-400 font-medium group-hover:gap-4 transition-all">
                  Enter Portal
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.button>
            ))}
          </div>

          {!isConnected && (
            <div className="text-center mt-12">
              <p className="text-slate-400 mb-4">
                Connect your wallet first to access the portals
              </p>
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Wallet className="w-5 h-5" />
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-medical-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">MedChain</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 MedChain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
