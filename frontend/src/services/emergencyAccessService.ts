import { Contract } from 'ethers'

export interface EmergencyAccessLog {
  id: number
  logId: number
  doctor: string
  patient: string
  patientAddress: string
  recordId: number
  reason: string
  timestamp: number
  resolved: boolean
  wasResolved: boolean
  resolvedAt: number
  resolution: string
}

export class EmergencyAccessService {
  constructor(
    private emergencyAccessContract: Contract,
    private _userAddress: string
  ) {}

  // Request emergency access to patient records
  async requestEmergencyAccess(
    patientAddress: string,
    recordId: number,
    reason: string
  ): Promise<void> {
    try {
      const tx = await this.emergencyAccessContract.requestEmergencyAccess(
        patientAddress,
        recordId,
        reason
      )
      await tx.wait()
    } catch (error: any) {
      console.error('Error requesting emergency access:', error)
      throw new Error(error.message || 'Failed to request emergency access')
    }
  }

  // Resolve emergency access (patient or admin acknowledges)
  async resolveEmergencyAccess(logId: number, resolution: string): Promise<void> {
    try {
      const tx = await this.emergencyAccessContract.resolveEmergencyAccess(logId, resolution)
      await tx.wait()
    } catch (error: any) {
      console.error('Error resolving emergency access:', error)
      throw new Error(error.message || 'Failed to resolve emergency access')
    }
  }

  // Get emergency access logs for a patient
  async getPatientEmergencyLogs(patientAddress: string): Promise<EmergencyAccessLog[]> {
    try {
      const logs = await this.emergencyAccessContract.getPatientEmergencyLogs(patientAddress)
      
      return logs.map((log: any) => ({
        id: Number(log.id),
        doctor: log.doctor,
        patient: log.patient,
        recordId: Number(log.recordId),
        reason: log.reason,
        timestamp: Number(log.timestamp),
        resolved: log.resolved,
        resolution: log.resolution
      }))
    } catch (error: any) {
      console.error('Error fetching emergency logs:', error)
      return []
    }
  }

  // Get emergency access logs made by a doctor
  async getDoctorEmergencyLogs(doctorAddress: string): Promise<EmergencyAccessLog[]> {
    try {
      const logs = await this.emergencyAccessContract.getDoctorEmergencyLogs(doctorAddress)
      
      return logs.map((log: any) => ({
        id: Number(log.id),
        doctor: log.doctor,
        patient: log.patient,
        recordId: Number(log.recordId),
        reason: log.reason,
        timestamp: Number(log.timestamp),
        resolved: log.resolved,
        resolution: log.resolution
      }))
    } catch (error: any) {
      console.error('Error fetching doctor emergency logs:', error)
      return []
    }
  }

  // Get unresolved emergency access logs for patient
  async getUnresolvedEmergencyLogs(patientAddress: string): Promise<EmergencyAccessLog[]> {
    try {
      const logs = await this.emergencyAccessContract.getUnresolvedEmergencyLogs(patientAddress)
      
      return logs.map((log: any) => ({
        id: Number(log.id),
        doctor: log.doctor,
        patient: log.patient,
        recordId: Number(log.recordId),
        reason: log.reason,
        timestamp: Number(log.timestamp),
        resolved: log.resolved,
        resolution: log.resolution
      }))
    } catch (error: any) {
      console.error('Error fetching unresolved logs:', error)
      return []
    }
  }

  // Check if doctor is authorized for emergency access
  async isAuthorizedDoctor(doctorAddress: string): Promise<boolean> {
    try {
      return await this.emergencyAccessContract.isAuthorizedDoctor(doctorAddress)
    } catch (error: any) {
      console.error('Error checking doctor authorization:', error)
      return false
    }
  }

  // Get total emergency access count
  async getTotalEmergencyAccess(): Promise<number> {
    try {
      return Number(await this.emergencyAccessContract.getTotalEmergencyAccess())
    } catch (error: any) {
      console.error('Error fetching total emergency access:', error)
      return 0
    }
  }
}
