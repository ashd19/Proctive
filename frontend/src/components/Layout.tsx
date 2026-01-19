import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  FileText, 
  Shield, 
  Receipt, 
  ClipboardList,
  Users,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bell,
  Settings,
  User,
  Activity,
  Copy,
  ExternalLink,
  Check,
  Upload
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import { UserRole } from '../types'
import { toast } from 'react-hot-toast'

interface LayoutProps {
  role: UserRole
}

const menuItems = {
  patient: [
    { path: '/patient', label: 'Dashboard', icon: Home },
    { path: '/patient/records', label: 'Medical Records', icon: FileText },
    { path: '/patient/addPdf', label: 'Upload PDF', icon: Upload },
    { path: '/patient/access', label: 'Access Control', icon: Shield },
    { path: '/patient/claims', label: 'Insurance Claims', icon: Receipt },
    { path: '/patient/audit', label: 'Audit Log', icon: ClipboardList },
  ],
  doctor: [
    { path: '/doctor', label: 'Dashboard', icon: Home },
    { path: '/doctor/patients', label: 'Patient Records', icon: Users },
    { path: '/doctor/emergency', label: 'Emergency Access', icon: AlertTriangle },
  ],
  insurance: [
    { path: '/insurance', label: 'Dashboard', icon: Home },
    { path: '/insurance/claims', label: 'Claims Management', icon: Receipt },
  ],
  admin: [
    { path: '/admin', label: 'Dashboard', icon: Home },
  ],
  hospital: [],
  lab: [],
}

const roleLabels = {
  patient: 'Patient Portal',
  doctor: 'Healthcare Provider',
  insurance: 'Insurance Portal',
  admin: 'Administration',
  hospital: 'Hospital',
  lab: 'Diagnostic Lab',
}

const roleColors = {
  patient: 'from-primary-500 to-primary-600',
  doctor: 'from-medical-500 to-medical-600',
  insurance: 'from-emerald-500 to-emerald-600',
  admin: 'from-amber-500 to-amber-600',
  hospital: 'from-purple-500 to-purple-600',
  lab: 'from-pink-500 to-pink-600',
}

export default function Layout({ role }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { address, disconnect } = useWalletStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const items = menuItems[role] || []

  const handleDisconnect = () => {
    disconnect()
    navigate('/')
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async () => {
    if (!address) return
    
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success('Address copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const openInMetaMask = () => {
    if (!address) return
    window.open(`https://metamask.app.link/send/${address}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40 shadow-sm"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center shadow-lg`}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <span className="font-bold text-xl gradient-text">VitalChain</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Role Badge */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-3"
            >
              <div className={`bg-gradient-to-r ${roleColors[role]} rounded-xl p-3 text-white shadow-md`}>
                <p className="text-xs font-medium text-white/80">Portal</p>
                <p className="font-semibold">{roleLabels[role]}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-r ${roleColors[role]} text-white shadow-md` 
                    : 'text-slate-600 hover:bg-slate-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium overflow-hidden whitespace-nowrap"
                >
                  Disconnect Wallet
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div 
        className="transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-slate-800">
                {items.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">
                      {address ? formatAddress(address) : 'Not Connected'}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">{roleLabels[role]}</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-mono text-slate-700">
                            {address ? formatAddress(address) : 'Not Connected'}
                          </p>
                          <button
                            onClick={copyAddress}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Copy address"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={openInMetaMask}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in MetaMask
                      </button>
                      
                      <Link
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Switch Role
                      </Link>
                      
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleDisconnect}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect Wallet
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
