export interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number | null
  role: UserRole | null
}

export type UserRole = 'patient' | 'doctor' | 'hospital' | 'lab' | 'insurance' | 'admin'

export enum RecordType {
  GENERAL = 0,
  PRESCRIPTION = 1,
  LAB_RESULT = 2,
  IMAGING = 3,
  SURGERY = 4,
  VACCINATION = 5,
  ALLERGY = 6,
  CHRONIC_CONDITION = 7
}

export interface MedicalRecord {
  id: number
  patient: string
  createdBy: string
  recordType: RecordType
  ipfsHash: string
  encryptedKey: string
  metadataHash: string
  createdAt: number
  updatedAt: number
  isActive: boolean
  metadata?: RecordMetadata
}

export interface RecordMetadata {
  title: string
  description: string
  hospitalName: string
  doctorName: string
  tags: string[]
}

export enum AccessLevel {
  NONE = 0,
  VIEW_ONLY = 1,
  VIEW_AND_DOWNLOAD = 2,
  FULL_ACCESS = 3
}

export enum ConsentStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  EXPIRED = 3,
  REVOKED = 4
}

export interface AccessGrant {
  id: number
  patient: string
  grantee: string
  recordIds: number[]
  accessLevel: AccessLevel
  grantedAt: number
  expiresAt: number
  isActive: boolean
  purpose: string
}

export interface ConsentRequest {
  id: number
  requester: string
  patient: string
  recordIds: number[]
  requestedLevel: AccessLevel
  purpose: string
  institutionName: string
  status: ConsentStatus
  requestedAt: number
  respondedAt: number
  validityPeriod: number
}

export enum AccessType {
  VIEW = 0,
  DOWNLOAD = 1,
  UPDATE = 2,
  CREATE = 3,
  EMERGENCY_ACCESS = 4,
  CONSENT_GRANTED = 5,
  CONSENT_REVOKED = 6,
  INSURANCE_CLAIM = 7
}

export interface AuditLogEntry {
  id: number
  patient: string
  accessor: string
  recordId: number
  accessType: AccessType
  accessorName: string
  accessorRole: string
  institutionName: string
  timestamp: number
  isEmergencyAccess: boolean
  emergencyReason: string
}

export enum EmergencyStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  FLAGGED = 2,
  REVIEWED = 3,
  APPROVED = 4,
  REJECTED = 5
}

export interface EmergencySession {
  id: number
  doctor: string
  patient: string
  reason: string
  diagnosis: string
  doctorName: string
  hospitalName: string
  startTime: number
  endTime: number
  accessedRecords: number[]
  status: EmergencyStatus
}

export enum ClaimStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  PENDING_DOCUMENTS = 2,
  UNDER_REVIEW = 3,
  APPROVED = 4,
  PARTIALLY_APPROVED = 5,
  REJECTED = 6,
  APPEALED = 7,
  SETTLED = 8,
  CLOSED = 9
}

export enum ClaimType {
  HOSPITALIZATION = 0,
  OUTPATIENT = 1,
  SURGERY = 2,
  MEDICATION = 3,
  DIAGNOSTIC = 4,
  MATERNITY = 5,
  DENTAL = 6,
  VISION = 7,
  MENTAL_HEALTH = 8,
  OTHER = 9
}

export interface InsuranceClaim {
  id: number
  patient: string
  insuranceProvider: string
  policyNumber: string
  claimType: ClaimType
  status: ClaimStatus
  claimAmount: bigint
  approvedAmount: bigint
  recordIds: number[]
  hospitalName: string
  diagnosisCode: string
  treatmentDescription: string
  treatmentDate: number
  submittedAt: number
  processedAt: number
  rejectionReason: string
  notes: string
}

export interface InsurancePolicy {
  policyNumber: string
  patient: string
  insuranceProvider: string
  coverageLimit: bigint
  usedAmount: bigint
  deductible: bigint
  startDate: number
  endDate: number
  isActive: boolean
  coveredProcedures: string[]
}

export interface Hospital {
  id: number
  name: string
  location: string
  licenseNumber: string
  isActive: boolean
  registeredAt: number
  address?: string
}

export interface Doctor {
  id: number
  name: string
  specialization: string
  licenseNumber: string
  hospitalId: number
  isActive: boolean
  hasEmergencyAccess: boolean
  registeredAt: number
  address?: string
}

export interface DiagnosticLab {
  id: number
  name: string
  location: string
  licenseNumber: string
  isActive: boolean
  registeredAt: number
  address?: string
}

export interface InsuranceProvider {
  id: number
  name: string
  policyPrefix: string
  isActive: boolean
  registeredAt: number
  address?: string
}
