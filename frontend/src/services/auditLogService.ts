import { Contract } from "ethers";

export enum AccessType {
  VIEW = 0,
  DOWNLOAD = 1,
  UPDATE = 2,
  SHARE = 3,
  EMERGENCY = 4,
}

export interface AuditLogEntry {
  id: number;
  patient: string;
  accessor: string;
  recordId: number;
  accessType: AccessType;
  timestamp: number;
  ipAddress: string;
  purpose: string;
  wasEmergency: boolean;
}

export class AuditLogService {
  constructor(
    private auditLogContract: Contract,
    private _userAddress: string,
  ) {}

  // Log an access event
  async logAccess(
    patientAddress: string,
    recordId: number,
    accessType: AccessType,
    accessorName: string,
    accessorRole: string,
    institutionName: string,
    ipAddressHash: string,
    deviceInfoHash: string,
  ): Promise<void> {
    try {
      const tx = await this.auditLogContract.logAccess(
        patientAddress,
        recordId,
        accessType,
        accessorName,
        accessorRole,
        institutionName,
        ipAddressHash,
        deviceInfoHash,
      );

      await tx.wait();
    } catch (error: any) {
      console.error("Error logging access:", error);
      throw new Error(error.reason || error.message || "Failed to log access");
    }
  }

  // Log emergency access
  async logEmergencyAccess(
    patientAddress: string,
    recordId: number,
    purpose: string,
  ): Promise<void> {
    try {
      const tx = await this.auditLogContract.logEmergencyAccess(
        patientAddress,
        recordId,
        purpose,
      );
      await tx.wait();
    } catch (error: any) {
      console.error("Error logging emergency access:", error);
      throw new Error(error.message || "Failed to log emergency access");
    }
  }

  // Get patient's audit logs
  async getPatientLogs(patientAddress: string): Promise<AuditLogEntry[]> {
    try {
      const logIds = await this.auditLogContract.getPatientLogIds(
        patientAddress,
      );

      if (!logIds || logIds.length === 0) {
        return [];
      }

      const logs = await Promise.all(
        logIds.map(async (logId: bigint) => {
          const log = await this.auditLogContract.getLog(Number(logId));
          return {
            id: Number(log.id || logId),
            patient: log.patient,
            accessor: log.accessor,
            recordId: Number(log.recordId),
            accessType: Number(log.accessType),
            timestamp: Number(log.timestamp),
            ipAddress: log.ipAddress,
            purpose: log.emergencyReason,
            wasEmergency: log.isEmergencyAccess,
          };
        }),
      );

      return logs;
    } catch (error: any) {
      console.error("Error fetching patient logs:", error);
      return [];
    }
  }

  // Get logs for a specific record
  async getRecordLogs(recordId: number): Promise<AuditLogEntry[]> {
    try {
      const logs = await this.auditLogContract.getRecordLogs(recordId);

      return logs.map((log: any) => ({
        id: Number(log.id),
        patient: log.patient,
        accessor: log.accessor,
        recordId: Number(log.recordId),
        accessType: Number(log.accessType),
        timestamp: Number(log.timestamp),
        ipAddress: log.ipAddress,
        purpose: log.purpose,
        wasEmergency: log.wasEmergency,
      }));
    } catch (error: any) {
      console.error("Error fetching record logs:", error);
      return [];
    }
  }

  // Get logs by accessor
  async getAccessorLogs(accessorAddress: string): Promise<AuditLogEntry[]> {
    try {
      const logs = await this.auditLogContract.getAccessorLogs(accessorAddress);

      return logs.map((log: any) => ({
        id: Number(log.id),
        patient: log.patient,
        accessor: log.accessor,
        recordId: Number(log.recordId),
        accessType: Number(log.accessType),
        timestamp: Number(log.timestamp),
        ipAddress: log.ipAddress,
        purpose: log.purpose,
        wasEmergency: log.wasEmergency,
      }));
    } catch (error: any) {
      console.error("Error fetching accessor logs:", error);
      return [];
    }
  }

  // Get emergency access logs for patient
  async getPatientEmergencyLogs(
    patientAddress: string,
  ): Promise<AuditLogEntry[]> {
    try {
      const logs = await this.auditLogContract.getPatientEmergencyLogs(
        patientAddress,
      );

      return logs.map((log: any) => ({
        id: Number(log.id),
        patient: log.patient,
        accessor: log.accessor,
        recordId: Number(log.recordId),
        accessType: Number(log.accessType),
        timestamp: Number(log.timestamp),
        ipAddress: log.ipAddress,
        purpose: log.purpose,
        wasEmergency: log.wasEmergency,
      }));
    } catch (error: any) {
      console.error("Error fetching emergency logs:", error);
      return [];
    }
  }

  // Get total access count for patient
  async getPatientAccessCount(patientAddress: string): Promise<number> {
    try {
      return Number(
        await this.auditLogContract.getPatientAccessCount(patientAddress),
      );
    } catch (error: any) {
      console.error("Error fetching access count:", error);
      return 0;
    }
  }

  // Helper: Get access type name
  static getAccessTypeName(type: AccessType): string {
    switch (type) {
      case AccessType.VIEW:
        return "View";
      case AccessType.DOWNLOAD:
        return "Download";
      case AccessType.UPDATE:
        return "Update";
      case AccessType.SHARE:
        return "Share";
      case AccessType.EMERGENCY:
        return "Emergency Access";
      default:
        return "Unknown";
    }
  }
}
