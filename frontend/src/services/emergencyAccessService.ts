import { Contract } from 'ethers'

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
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: number
}

export interface EmergencyConfig {
  maxSessionDuration: number
  cooldownPeriod: number
  requiresJustification: boolean
  autoFlagThreshold: number
}

export class EmergencyAccessService {
  constructor(
    private emergencyAccessContract: Contract,
    private auditLogContract: Contract,
    private _userAddress: string
  ) {}

  /**
   * Start an emergency access session
   */
  async startEmergencySession(
    patientAddress: string,
    reason: string,
    doctorName: string,
    hospitalName: string
  ): Promise<number> {
    try {
      console.log('🚨 Starting emergency session:', { patientAddress, reason, doctorName, hospitalName })
      
      const tx = await this.emergencyAccessContract.startEmergencySession(
        patientAddress,
        reason,
        doctorName,
        hospitalName
      )
      const receipt = await tx.wait()
      
      // Extract session ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.emergencyAccessContract.interface.parseLog(log)
          return parsed?.name === 'EmergencySessionStarted'
        } catch {
          return false
        }
      })

      if (event) {
        const parsed = this.emergencyAccessContract.interface.parseLog(event)
        const sessionId = Number(parsed?.args[0])
        console.log('✅ Emergency session started:', sessionId)
        return sessionId
      }

      throw new Error('Session ID not found in transaction')
    } catch (error: any) {
      console.error('Error starting emergency session:', error)
      throw new Error(error.message || 'Failed to start emergency session')
    }
  }

  /**
   * Access a medical record during emergency session
   */
  async accessRecordInEmergency(
    recordId: number,
    ipAddressHash: string = '0x0',
    deviceInfoHash: string = '0x0'
  ): Promise<void> {
    try {
      console.log('📋 Accessing record in emergency:', recordId)
      
      const tx = await this.emergencyAccessContract.accessRecordInEmergency(
        recordId,
        ipAddressHash,
        deviceInfoHash
      )
      await tx.wait()
      
      console.log('✅ Record accessed in emergency')
    } catch (error: any) {
      console.error('Error accessing record in emergency:', error)
      throw new Error(error.message || 'Failed to access record in emergency')
    }
  }

  /**
   * End an emergency access session
   */
  async endEmergencySession(diagnosis: string): Promise<void> {
    try {
      console.log('🏁 Ending emergency session with diagnosis:', diagnosis)
      
      const tx = await this.emergencyAccessContract.endEmergencySession(diagnosis)
      await tx.wait()
      
      console.log('✅ Emergency session ended')
    } catch (error: any) {
      console.error('Error ending emergency session:', error)
      throw new Error(error.message || 'Failed to end emergency session')
    }
  }

  /**
   * Flag a session for review
   */
  async flagSession(sessionId: number, reason: string): Promise<void> {
    try {
      const tx = await this.emergencyAccessContract.flagSession(sessionId, reason)
      await tx.wait()
    } catch (error: any) {
      console.error('Error flagging session:', error)
      throw new Error(error.message || 'Failed to flag session')
    }
  }

  /**
   * Review a flagged session (hospital/admin only)
   */
  async reviewSession(
    sessionId: number,
    approved: boolean,
    notes: string
  ): Promise<void> {
    try {
      const tx = await this.emergencyAccessContract.reviewSession(sessionId, approved, notes)
      await tx.wait()
    } catch (error: any) {
      console.error('Error reviewing session:', error)
      throw new Error(error.message || 'Failed to review session')
    }
  }

  /**
   * Get emergency session details
   */
  async getSession(sessionId: number): Promise<EmergencySession> {
    try {
      const session = await this.emergencyAccessContract.getSession(sessionId)
      
      return {
        id: Number(session.id),
        doctor: session.doctor,
        patient: session.patient,
        reason: session.reason,
        diagnosis: session.diagnosis,
        doctorName: session.doctorName,
        hospitalName: session.hospitalName,
        startTime: Number(session.startTime),
        endTime: Number(session.endTime),
        accessedRecords: session.accessedRecords.map((id: bigint) => Number(id)),
        status: Number(session.status) as EmergencyStatus
      }
    } catch (error: any) {
      console.error('Error fetching session:', error)
      throw new Error(error.message || 'Failed to fetch session')
    }
  }

  /**
   * Get doctor's active session ID (0 if none)
   */
  async getActiveSession(doctorAddress: string): Promise<number> {
    try {
      return Number(await this.emergencyAccessContract.getActiveSession(doctorAddress))
    } catch (error: any) {
      console.error('Error fetching active session:', error)
      return 0
    }
  }

  /**
   * Check if doctor has active session
   */
  async isSessionActive(doctorAddress: string): Promise<boolean> {
    try {
      return await this.emergencyAccessContract.isSessionActive(doctorAddress)
    } catch (error: any) {
      console.error('Error checking session status:', error)
      return false
    }
  }

  /**
   * Get all emergency session IDs for a patient
   */
  async getPatientEmergencySessions(patientAddress: string): Promise<EmergencySession[]> {
    try {
      const sessionIds = await this.emergencyAccessContract.getPatientEmergencySessionIds(patientAddress)
      
      const sessions = await Promise.all(
        sessionIds.map(async (id: bigint) => this.getSession(Number(id)))
      )
      
      return sessions.sort((a, b) => b.startTime - a.startTime)
    } catch (error: any) {
      console.error('Error fetching patient emergency sessions:', error)
      return []
    }
  }

  /**
   * Get all emergency session IDs for a doctor
   */
  async getDoctorEmergencySessions(doctorAddress: string): Promise<EmergencySession[]> {
    try {
      const sessionIds = await this.emergencyAccessContract.getDoctorEmergencySessionIds(doctorAddress)
      
      const sessions = await Promise.all(
        sessionIds.map(async (id: bigint) => this.getSession(Number(id)))
      )
      
      return sessions.sort((a, b) => b.startTime - a.startTime)
    } catch (error: any) {
      console.error('Error fetching doctor emergency sessions:', error)
      return []
    }
  }

  /**
   * Get all flagged session IDs
   */
  async getFlaggedSessions(): Promise<EmergencySession[]> {
    try {
      const sessionIds = await this.emergencyAccessContract.getFlaggedSessionIds()
      
      const sessions = await Promise.all(
        sessionIds.map(async (id: bigint) => this.getSession(Number(id)))
      )
      
      return sessions.sort((a, b) => b.startTime - a.startTime)
    } catch (error: any) {
      console.error('Error fetching flagged sessions:', error)
      return []
    }
  }

  /**
   * Get emergency access configuration
   */
  async getConfig(): Promise<EmergencyConfig> {
    try {
      const config = await this.emergencyAccessContract.getConfig()
      
      return {
        maxSessionDuration: Number(config.maxSessionDuration),
        cooldownPeriod: Number(config.cooldownPeriod),
        requiresJustification: config.requiresJustification,
        autoFlagThreshold: Number(config.autoFlagThreshold)
      }
    } catch (error: any) {
      console.error('Error fetching config:', error)
      throw new Error(error.message || 'Failed to fetch emergency config')
    }
  }

  /**
   * Get emergency access audit logs from AuditLog contract
   */
  async getEmergencyAccessLogs(patientAddress?: string): Promise<any[]> {
    try {
      // Get all audit logs and filter for emergency access events
      const filter = this.auditLogContract.filters.EmergencyAccessLogged()
      const events = await this.auditLogContract.queryFilter(filter)
      
      const logs = await Promise.all(
        events.map(async (event: any) => {
          const args = event.args
          return {
            patient: args.patient,
            recordId: Number(args.recordId),
            doctorName: args.doctorName,
            hospitalName: args.hospitalName,
            reason: args.reason,
            timestamp: Number(args.timestamp),
            blockNumber: event.blockNumber
          }
        })
      )
      
      // Filter by patient if specified
      if (patientAddress) {
        return logs.filter(log => 
          log.patient.toLowerCase() === patientAddress.toLowerCase()
        )
      }
      
      return logs.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error: any) {
      console.error('Error fetching emergency access logs:', error)
      return []
    }
  }

  /**
   * Helper: Format session status
   */
  static getStatusName(status: EmergencyStatus): string {
    const names = ['Active', 'Completed', 'Flagged', 'Reviewed', 'Approved', 'Rejected']
    return names[status] || 'Unknown'
  }

  /**
   * Helper: Get status color class
   */
  static getStatusColor(status: EmergencyStatus): string {
    const colors = {
      [EmergencyStatus.ACTIVE]: 'bg-yellow-100 text-yellow-800',
      [EmergencyStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
      [EmergencyStatus.FLAGGED]: 'bg-red-100 text-red-800',
      [EmergencyStatus.REVIEWED]: 'bg-purple-100 text-purple-800',
      [EmergencyStatus.APPROVED]: 'bg-green-100 text-green-800',
      [EmergencyStatus.REJECTED]: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
}
