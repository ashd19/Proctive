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
import { ipfsService } from '../services/ipfs'
import { useState } from 'react'
import Navbar from '@/components/Navbar'

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
  const { connect, isConnected, setRole, isLoading, signer, address } = useWalletStore()
  const [ipfsHash, setIpfsHash] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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

  // Test signing a message
  const handleTestSignMessage = async () => {
    if (!signer) {
      toast.error('Please connect your wallet first')
      return
    }
    
    try {
      const message = `VitalChain Test Signature\nTimestamp: ${new Date().toISOString()}\nAddress: ${address}`
      toast.loading('Please sign the message in MetaMask...')
      
      const signature = await signer.signMessage(message)
      
      toast.dismiss()
      toast.success('Message signed successfully!')
      console.log('Signature:', signature)
      console.log('Message:', message)
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to sign message')
      console.error('Signing error:', error)
    }
  }

  // Test sending a simple transaction
  const handleTestTransaction = async () => {
    if (!signer) {
      toast.error('Please connect your wallet first')
      return
    }
    
    try {
      toast.loading('Please confirm the transaction in MetaMask...')
      
      // Send 0.001 ETH to yourself (you can change the address)
      const tx = await signer.sendTransaction({
        to: address, // Sending to yourself as a test
        value: '1000000000000000' // 0.001 ETH in wei
      })
      
      toast.dismiss()
      toast.loading('Transaction sent! Waiting for confirmation...')
      
      const receipt = await tx.wait()
      
      toast.dismiss()
      toast.success('Transaction confirmed!')
      console.log('Transaction receipt:', receipt)
    } catch (error: any) {
      toast.dismiss()
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user')
      } else {
        toast.error(error.message || 'Transaction failed')
      }
      console.error('Transaction error:', error)
    }
  }

  // Test IPFS upload (medical record simulation)
  const handleTestIPFSUpload = async () => {
    try {
      toast.loading('Encrypting and uploading to Pinata IPFS...')
      
      // Sample medical record
      const medicalRecord = {
        patientId: address,
        recordType: 'Test Record',
        date: new Date().toISOString(),
        diagnosis: 'Sample Diagnosis for Testing',
        treatment: 'Test Treatment',
        notes: 'This is a simulated medical record for IPFS testing',
        timestamp: Date.now()
      }

      // Use wallet address as public key for demo
      const result = await ipfsService.uploadEncryptedRecord(medicalRecord, address || '')
      
      toast.dismiss()
      toast.success('✓ Uploaded to IPFS! View at gateway.pinata.cloud')
      setIpfsHash(result.ipfsHash)
      
      console.log('IPFS Upload Result:', {
        ipfsHash: result.ipfsHash,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`,
        encryptedKey: result.encryptedKey,
        metadataHash: result.metadataHash,
        originalData: medicalRecord
      })
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to upload to IPFS')
      console.error('IPFS upload error:', error)
    }
  }

  // Test IPFS file upload
  const handleTestIPFSFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      toast.loading(`Uploading ${file.name} to IPFS...`)
      setUploadedFile(file)
      
      const result = await ipfsService.uploadEncryptedFile(file, address || '')
      
      toast.dismiss()
      toast.success('✓ File uploaded to IPFS!')
      setIpfsHash(result.ipfsHash)
      
      console.log('IPFS File Upload Result:', {
        ipfsHash: result.ipfsHash,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`,
        fileName: result.fileName,
        fileSize: result.fileSize,
        mimeType: result.mimeType,
        fileHash: result.fileHash,
        encryptedKey: result.encryptedKey
      })
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to upload file')
      console.error('File upload error:', error)
    }
  }

  // Test IPFS retrieve
  const handleTestIPFSRetrieve = async () => {
    if (!ipfsHash) {
      toast.error('Upload something to IPFS first!')
      return
    }

    try {
      toast.loading('Retrieving from IPFS...')
      
      // For demo, we'll just show that it's stored
      const data = await ipfsService.getFromIPFS(ipfsHash)
      
      toast.dismiss()
      if (data) {
        toast.success('Data retrieved successfully!')
        console.log('Retrieved IPFS Data (encrypted):', data.substring(0, 100) + '...')
        console.log('IPFS Hash:', ipfsHash)
        console.log('Full encrypted content length:', data.length)
      } else {
        toast.error('Data not found')
      }
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to retrieve from IPFS')
      console.error('IPFS retrieve error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar isConnected={isConnected} isLoading={isLoading} handleConnect={handleConnect}/>

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

      {/* MetaMask Testing Section */}
      {isConnected && (
        <section className="py-12 bg-gradient-to-r from-primary-500 to-medical-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  MetaMask Testing Zone
                </h3>
                <p className="text-white/80">
                  Test your MetaMask connection with signing and transactions
                </p>
                <div className="mt-3 text-sm text-white/60">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={handleTestSignMessage}
                  className="bg-white hover:bg-white/90 text-primary-600 font-semibold px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Shield className="w-5 h-5" />
                  Sign Test Message
                </button>
                
                <button
                  onClick={handleTestTransaction}
                  className="bg-white hover:bg-white/90 text-medical-600 font-semibold px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <ArrowRight className="w-5 h-5" />
                  Send Test Transaction (0.001 ETH)
                </button>
              </div>

              <div className="mt-6 text-xs text-white/60 text-center">
                <p>✓ Sign Message: Opens MetaMask to sign a message (free)</p>
                <p>✓ Send Transaction: Sends 0.001 ETH to yourself (requires gas)</p>
                <p>Check browser console (F12) for signature/transaction details</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* IPFS Testing Section */}
      {isConnected && (
        <section className="py-12 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
                  <Database className="w-6 h-6 text-purple-600" />
                  IPFS Storage Demo
                </h3>
                <p className="text-slate-600">
                  Test encrypted medical record storage on real IPFS via Pinata
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  Connected to Pinata Cloud
                </div>
              </div>

              <div className="space-y-4">
                {/* Upload Medical Record */}
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Upload Encrypted Medical Record
                  </h4>
                  <button
                    onClick={handleTestIPFSUpload}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Database className="w-5 h-5" />
                    Upload Sample Record to IPFS
                  </button>
                </div>

                {/* Upload File */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    Upload Encrypted File (Image/PDF/etc)
                  </h4>
                  <label className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
                    <Database className="w-5 h-5" />
                    Choose File to Upload
                    <input
                      type="file"
                      onChange={handleTestIPFSFileUpload}
                      className="hidden"
                      accept="image/*,.pdf,.txt"
                    />
                  </label>
                  {uploadedFile && (
                    <p className="text-sm text-blue-600 mt-2 text-center">
                      Selected: {uploadedFile.name}
                    </p>
                  )}
                </div>

                {/* Retrieve Data */}
                {ipfsHash && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      IPFS Hash Generated
                    </h4>
                    <p className="text-xs font-mono text-slate-600 mb-3 break-all bg-white p-2 rounded border border-green-200">
                      {ipfsHash}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleTestIPFSRetrieve}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-5 h-5" />
                        Retrieve
                      </button>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Globe className="w-5 h-5" />
                        View on IPFS
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                <p className="text-xs text-slate-600 space-y-1">
                  <strong className="block text-slate-900">How it works:</strong>
                  <span className="block">✓ Data is encrypted with AES-256 before upload</span>
                  <span className="block">✓ Encryption key is secured for the patient only</span>
                  <span className="block">✓ Files uploaded to real IPFS via Pinata Cloud</span>
                  <span className="block">✓ IPFS hash is permanently stored on the network</span>
                  <span className="block">✓ Retrieve files from any IPFS gateway worldwide</span>
                  <span className="block">✓ Check browser console (F12) for detailed output</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

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
              How VitalChain Works
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
              <span className="font-bold text-xl text-white">VitalChain</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 VitalChain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
