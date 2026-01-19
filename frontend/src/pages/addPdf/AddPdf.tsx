import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Loader, CheckCircle2, Database, AlertCircle, X } from 'lucide-react'
import { useServices } from '../../services/useServices'
import { toast } from 'react-hot-toast'
import { useWalletStore } from '../../store/walletStore'

type PdfMetadata = {
  title: string
  recordType: string
  description: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

export default function AddPdf() {
  const { address, isConnected } = useWalletStore()
  const { services, loading: servicesLoading } = useServices()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    recordType: '',
    description: ''
  })

  const validateAndSetFile = (selectedFile?: File) => {
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    if (!formData.title) {
      setFormData(prev => ({ ...prev, title: selectedFile.name.replace('.pdf', '') }))
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    validateAndSetFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0])
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const uploadToIPFS = async () => {
    if (!file || !address || !isConnected) {
      toast.error('Please connect your wallet and select a file')
      return
    }

    if (!formData.title || !formData.recordType) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!services || !services.patientRecords) {
      toast.error('Services are still loading, please wait...')
      return
    }

    setUploading(true)
    try {
      // Step 1: Convert PDF to JSON using backend
      toast.loading('Converting PDF to structured data...', { id: 'upload' })
      const formData2 = new FormData()
      formData2.append('file', file)

      const response = await fetch('http://localhost:5000/api/pdf/convert', {
        method: 'POST',
        body: formData2,
      })

      if (!response.ok) {
        throw new Error('PDF conversion failed')
      }

      const pdfData = await response.json()
      console.log('PDF converted to JSON:', pdfData)

      // Step 2: Upload original PDF to IPFS (so it can be retrieved later)
      toast.loading('Uploading original PDF to IPFS...', { id: 'upload' })
      const pdfCid = await services.ipfs.uploadToIPFS(file)

      // Step 3: Upload JSON to IPFS (include pdfCid in metadata)
      toast.loading('Uploading JSON to IPFS...', { id: 'upload' })
      const jsonWithMetadata = {
        ...pdfData,
        metadata: {
          title: formData.title,
          recordType: formData.recordType,
          description: formData.description,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: address,
          group: 'patient',
          patientAddress: address,
          pdfCid,
          pdfUrl: `https://gateway.pinata.cloud/ipfs/${pdfCid}`,
        }
      }

      const safeTitle = formData.title
        ? formData.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50)
        : `record-${Date.now()}`
      const jsonFileName = `${safeTitle}.json`
      const hash = await services.ipfs.uploadJSON(jsonWithMetadata, jsonFileName)
      setIpfsHash(hash)

      // Step 3: Success
      toast.success(
        `JSON data uploaded to IPFS successfully! Hash: ${hash}`,
        { id: 'upload', duration: 5000 }
      )
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFile(null)
        setFormData({ title: '', recordType: '', description: '' })
        setIpfsHash(null)
      }, 3000)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload: ' + (error as Error).message, { id: 'upload' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Upload Medical Record</h1>
        <p className="text-slate-600 mt-2">Add a new PDF medical record to IPFS and blockchain</p>
      </div>

      {/* Connection Warning */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">Please connect your wallet to upload files</p>
        </motion.div>
      )}

      {/* Services Loading Warning */}
      {isConnected && servicesLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3"
        >
          <Loader className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin" />
          <p className="text-sm text-blue-800">Loading blockchain services...</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
      >
        <div className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              PDF File *
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleClick}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                file 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileChange}
              />
              
              <div className="flex flex-col items-center justify-center py-12">
                {file ? (
                  <>
                    <FileText className="w-16 h-16 text-primary-600 mb-4" />
                    <p className="text-sm font-medium text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                      className="mt-4 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-slate-400 mb-4" />
                    <p className="text-base text-slate-700 font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500 mt-1">PDF files only (max 10MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Blood Test Results - Jan 2026"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                disabled={uploading}
              />
            </div>

            {/* Record Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Record Type *
              </label>
              <select
                value={formData.recordType}
                onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                disabled={uploading}
              >
                <option value="">Select a type</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Imaging">Imaging (X-Ray, MRI, CT)</option>
                <option value="Diagnosis">Diagnosis</option>
                <option value="Treatment Plan">Treatment Plan</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Vaccination Record">Vaccination Record</option>
                <option value="Consultation Notes">Consultation Notes</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes about this record..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-shadow"
                disabled={uploading}
              />
            </div>
          </div>

          {/* IPFS Hash Display */}
          <AnimatePresence>
            {ipfsHash && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 mb-1">Successfully uploaded to IPFS!</p>
                  <p className="text-xs text-green-700 font-mono break-all">{ipfsHash}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Debug Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">Status Check:</p>
            <div className="space-y-1 text-xs">
              <p className={file ? "text-green-600" : "text-red-600"}>
                {file ? "✓" : "✗"} File selected: {file?.name || "None"}
              </p>
              <p className={formData.title ? "text-green-600" : "text-red-600"}>
                {formData.title ? "✓" : "✗"} Title: {formData.title || "Empty"}
              </p>
              <p className={formData.recordType ? "text-green-600" : "text-red-600"}>
                {formData.recordType ? "✓" : "✗"} Record Type: {formData.recordType || "Not selected"}
              </p>
              <p className={isConnected ? "text-green-600" : "text-red-600"}>
                {isConnected ? "✓" : "✗"} Wallet connected: {isConnected ? "Yes" : "No"}
              </p>
              <p className={!servicesLoading ? "text-green-600" : "text-yellow-600"}>
                {!servicesLoading ? "✓" : "⏳"} Services loading: {servicesLoading ? "Yes" : "No"}
              </p>
              <p className={services?.patientRecords ? "text-green-600" : "text-red-600"}>
                {services?.patientRecords ? "✓" : "✗"} PatientRecords service: {services?.patientRecords ? "Ready" : "Not ready"}
              </p>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={uploadToIPFS}
            disabled={!file || !formData.title || !formData.recordType || uploading || !isConnected || !services?.patientRecords}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-primary-500/25"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Uploading to IPFS & Blockchain...
              </>
            ) : servicesLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Loading Services...
              </>
            ) : !services?.patientRecords ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Services Not Ready
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Push to IPFS Database
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Your PDF will be encrypted and stored on IPFS, with the hash recorded on the blockchain
          </p>
        </div>
      </motion.div>
    </div>
  )
}
