import { Contract } from 'ethers'
import { ipfsService } from './ipfs'

export interface MedicalRecordData {
  patientId: string
  recordType: number
  title: string
  description: string
  hospitalName: string
  doctorName: string
  diagnosis?: string
  treatment?: string
  medications?: string[]
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: string
    temperature?: string
    weight?: string
  }
  notes?: string
  tags: string[]
}

export interface MedicalRecord {
  id: number
  patient: string
  createdBy: string
  recordType: number
  ipfsHash: string
  encryptedKey: string
  metadataHash: string
  createdAt: number
  updatedAt: number
  isActive: boolean
  metadata: {
    title: string
    description: string
    recordType: string
    hospitalName: string
    doctorName: string
    tags: string[]
  }
}

export class PatientRecordsService {
  constructor(
    private patientRecordsContract: Contract,
    private userAddress: string
  ) {}

  // Create a new medical record
  async createRecord(
    patientAddress: string,
    recordData: MedicalRecordData
  ): Promise<number> {
    try {
      // Encrypt and upload to IPFS
      const ipfsResult = await ipfsService.uploadEncryptedRecord(
        recordData,
        patientAddress
      )

      // Call smart contract
      const tx = await this.patientRecordsContract.createRecord(
        patientAddress,
        recordData.recordType,
        ipfsResult.ipfsHash,
        ipfsResult.encryptedKey,
        ipfsResult.metadataHash,
        recordData.title,
        recordData.description,
        recordData.hospitalName,
        recordData.doctorName,
        recordData.tags
      )

      const receipt = await tx.wait()
      
      // Extract record ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.patientRecordsContract.interface.parseLog(log)
          return parsed?.name === 'RecordCreated'
        } catch {
          return false
        }
      })

      if (event) {
        const parsed = this.patientRecordsContract.interface.parseLog(event)
        return Number(parsed?.args[0])
      }

      throw new Error('Record ID not found in transaction')
    } catch (error: any) {
      console.error('Error creating record:', error)
      throw new Error(error.message || 'Failed to create medical record')
    }
  }

  // Get all records for a patient
  async getPatientRecords(patientAddress: string): Promise<MedicalRecord[]> {
    try {
      const recordIds = await this.patientRecordsContract.getPatientRecords(patientAddress)
      
      const records = await Promise.all(
        recordIds.map(async (id: bigint) => {
          const record = await this.patientRecordsContract.getRecord(Number(id))
          const metadata = await this.patientRecordsContract.getRecordMetadata(Number(id))
          
          return {
            id: Number(id),
            patient: record.patient,
            createdBy: record.createdBy,
            recordType: Number(record.recordType),
            ipfsHash: record.ipfsHash,
            encryptedKey: record.encryptedKey,
            metadataHash: record.metadataHash,
            createdAt: Number(record.createdAt),
            updatedAt: Number(record.updatedAt),
            isActive: record.isActive,
            metadata: {
              title: metadata.title,
              description: metadata.description,
              hospitalName: metadata.hospitalName,
              doctorName: metadata.doctorName,
              tags: metadata.tags,
            }
          }
        })
      )

      return records.filter(r => r.isActive)
    } catch (error: any) {
      console.error('Error fetching patient records:', error)
      throw new Error(error.message || 'Failed to fetch patient records')
    }
  }

  // Get a specific record
  async getRecord(recordId: number): Promise<MedicalRecord> {
    try {
      const record = await this.patientRecordsContract.getRecord(recordId)
      const metadata = await this.patientRecordsContract.getRecordMetadata(recordId)
      
      return {
        id: recordId,
        patient: record.patient,
        createdBy: record.createdBy,
        recordType: Number(record.recordType),
        ipfsHash: record.ipfsHash,
        encryptedKey: record.encryptedKey,
        metadataHash: record.metadataHash,
        createdAt: Number(record.createdAt),
        updatedAt: Number(record.updatedAt),
        isActive: record.isActive,
        metadata: {
          title: metadata.title,
          description: metadata.description,
          recordType: metadata.recordType || 'General',
          hospitalName: metadata.hospitalName,
          doctorName: metadata.doctorName,
          tags: metadata.tags,
        }
      }
    } catch (error: any) {
      console.error('Error fetching record:', error)
      throw new Error(error.message || 'Failed to fetch record')
    }
  }

  // Decrypt and retrieve record data from IPFS
  async getRecordData(record: MedicalRecord): Promise<any> {
    try {
      // For patients, they can decrypt with their address as private key (demo)
      // In production, use actual key management
      const data = await ipfsService.retrieveRecord(
        record.ipfsHash,
        record.encryptedKey,
        this.userAddress
      )
      
      return data
    } catch (error: any) {
      console.error('Error retrieving record data:', error)
      throw new Error('Failed to decrypt record data')
    }
  }

  // Update record (metadata only, IPFS hash is immutable)
  async updateRecordMetadata(
    recordId: number,
    title: string,
    description: string,
    tags: string[]
  ): Promise<void> {
    try {
      const tx = await this.patientRecordsContract.updateRecordMetadata(
        recordId,
        title,
        description,
        tags
      )
      await tx.wait()
    } catch (error: any) {
      console.error('Error updating record:', error)
      throw new Error(error.message || 'Failed to update record')
    }
  }

  // Deactivate a record
  async deactivateRecord(recordId: number): Promise<void> {
    try {
      const tx = await this.patientRecordsContract.deactivateRecord(recordId)
      await tx.wait()
    } catch (error: any) {
      console.error('Error deactivating record:', error)
      throw new Error(error.message || 'Failed to deactivate record')
    }
  }

  // Get record type name
  static getRecordTypeName(type: number): string {
    const types = [
      'General',
      'Prescription',
      'Lab Result',
      'Imaging',
      'Surgery',
      'Vaccination',
      'Allergy',
      'Chronic Condition'
    ]
    return types[type] || 'Unknown'
  }
}
