import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Upload,
  Search,
  Eye,
  Download,
  Clock,
  Building2,
  User,
  Tag,
  ChevronDown,
  Plus,
  X,
  File,
  Image,
  Stethoscope,
  Pill,
  TestTube,
  Syringe,
  Heart,
  AlertTriangle
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { RecordType } from '../../types'

const recordTypeConfig = {
  [RecordType.GENERAL]: { label: 'General', icon: FileText, color: 'bg-slate-500' },
  [RecordType.PRESCRIPTION]: { label: 'Prescription', icon: Pill, color: 'bg-blue-500' },
  [RecordType.LAB_RESULT]: { label: 'Lab Result', icon: TestTube, color: 'bg-purple-500' },
  [RecordType.IMAGING]: { label: 'Imaging', icon: Image, color: 'bg-indigo-500' },
  [RecordType.SURGERY]: { label: 'Surgery', icon: Stethoscope, color: 'bg-red-500' },
  [RecordType.VACCINATION]: { label: 'Vaccination', icon: Syringe, color: 'bg-green-500' },
  [RecordType.ALLERGY]: { label: 'Allergy', icon: AlertTriangle, color: 'bg-amber-500' },
  [RecordType.CHRONIC_CONDITION]: { label: 'Chronic Condition', icon: Heart, color: 'bg-pink-500' },
}

// Sample records data
const sampleRecords = [
  {
    id: 1,
    title: 'Annual Physical Examination',
    type: RecordType.GENERAL,
    hospitalName: 'City General Hospital',
    doctorName: 'Dr. Sarah Johnson',
    createdAt: Date.now() - 86400000 * 7,
    description: 'Complete physical examination with all vital signs recorded.',
    tags: ['checkup', 'annual'],
  },
  {
    id: 2,
    title: 'Complete Blood Count (CBC)',
    type: RecordType.LAB_RESULT,
    hospitalName: 'Metro Diagnostic Lab',
    doctorName: 'Dr. Michael Chen',
    createdAt: Date.now() - 86400000 * 14,
    description: 'Full blood panel with detailed analysis.',
    tags: ['blood-test', 'routine'],
  },
  {
    id: 3,
    title: 'Chest X-Ray',
    type: RecordType.IMAGING,
    hospitalName: 'City General Hospital',
    doctorName: 'Dr. Emily Brown',
    createdAt: Date.now() - 86400000 * 30,
    description: 'Frontal and lateral chest X-ray images.',
    tags: ['x-ray', 'respiratory'],
  },
  {
    id: 4,
    title: 'COVID-19 Vaccination',
    type: RecordType.VACCINATION,
    hospitalName: 'Community Health Center',
    doctorName: 'Dr. James Wilson',
    createdAt: Date.now() - 86400000 * 90,
    description: 'Pfizer-BioNTech COVID-19 vaccine, booster dose.',
    tags: ['vaccine', 'covid-19'],
  },
  {
    id: 5,
    title: 'Penicillin Allergy Record',
    type: RecordType.ALLERGY,
    hospitalName: 'City General Hospital',
    doctorName: 'Dr. Sarah Johnson',
    createdAt: Date.now() - 86400000 * 365,
    description: 'Documented allergic reaction to penicillin-based antibiotics.',
    tags: ['allergy', 'medication'],
  },
]

export default function PatientRecords() {
  const [records] = useState(sampleRecords)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<RecordType | 'all'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [viewingRecord, setViewingRecord] = useState<typeof sampleRecords[0] | null>(null)

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.hospitalName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || record.type === selectedType
    return matchesSearch && matchesType
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="text-slate-500">View and manage your encrypted health records</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Upload Record
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value === 'all' ? 'all' : Number(e.target.value) as RecordType)}
              className="input-field pr-10 appearance-none min-w-[180px]"
            >
              <option value="all">All Types</option>
              {Object.entries(recordTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Records Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record, index) => {
          const config = recordTypeConfig[record.type]
          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover cursor-pointer"
              onClick={() => setViewingRecord(record)}
            >
              {/* Type Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${config.color}`}>
                  <config.icon className="w-4 h-4" />
                  {config.label}
                </div>
                <span className="text-slate-400 text-sm">
                  {formatDate(record.createdAt)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1">
                {record.title}
              </h3>

              {/* Description */}
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                {record.description}
              </p>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {record.hospitalName}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  {record.doctorName}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {record.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No records found</h3>
          <p className="text-slate-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadRecordModal onClose={() => setShowUploadModal(false)} />
        )}
      </AnimatePresence>

      {/* View Record Modal */}
      <AnimatePresence>
        {viewingRecord && (
          <ViewRecordModal record={viewingRecord} onClose={() => setViewingRecord(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Upload Modal Component
function UploadRecordModal({ onClose }: { onClose: () => void }) {
  const [recordType, setRecordType] = useState<RecordType>(RecordType.GENERAL)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles])
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Record uploaded successfully!')
    setIsUploading(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Upload Medical Record</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Record Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Record Type
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(Number(e.target.value) as RecordType)}
              className="input-field"
            >
              {Object.entries(recordTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Record Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Annual Physical Examination"
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the medical record..."
              className="input-field min-h-[100px] resize-none"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Hospital Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hospital/Facility
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Hospital name"
                className="input-field"
              />
            </div>

            {/* Doctor Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Doctor/Provider
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Doctor name"
                className="input-field"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attachments
            </label>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Supports PDF, PNG, JPG (Max 10MB each)
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-slate-700">{file.name}</span>
                      <span className="text-xs text-slate-400">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="btn-primary flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Encrypting & Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Record
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// View Record Modal
function ViewRecordModal({ record, onClose }: { record: typeof sampleRecords[0], onClose: () => void }) {
  const config = recordTypeConfig[record.type]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${config.color}`}>
              <config.icon className="w-4 h-4" />
              {config.label}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{record.title}</h2>
            <p className="text-slate-600">{record.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Building2 className="w-4 h-4" />
                Healthcare Facility
              </div>
              <p className="font-medium text-slate-900">{record.hospitalName}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <User className="w-4 h-4" />
                Healthcare Provider
              </div>
              <p className="font-medium text-slate-900">{record.doctorName}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Clock className="w-4 h-4" />
                Date Created
              </div>
              <p className="font-medium text-slate-900">
                {new Date(record.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Tag className="w-4 h-4" />
                Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {record.tags.map((tag, i) => (
                  <span key={i} className="text-sm text-primary-600">#{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button className="btn-secondary flex items-center gap-2">
              <Eye className="w-5 h-5" />
              View Full Record
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
