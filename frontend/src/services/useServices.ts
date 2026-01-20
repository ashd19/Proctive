import { useEffect, useState } from 'react'
import { useWalletStore } from '../store/walletStore'
import { getContracts } from './contracts'
import { PatientRecordsService } from './patientRecordsService'
import { AccessControlService } from './accessControlService'
import { AuditLogService } from './auditLogService'
import { EmergencyAccessService } from './emergencyAccessService'
import { InsuranceClaimsService } from './insuranceClaimsService'
import ipfsService from './ipfs'

export interface Services {
  patientRecords: PatientRecordsService | null
  accessControl: AccessControlService | null
  auditLog: AuditLogService | null
  emergencyAccess: EmergencyAccessService | null
  insuranceClaims: InsuranceClaimsService | null
  ipfs: typeof ipfsService
}

export function useServices() {
  const { signer, address, isConnected } = useWalletStore()
  const [services, setServices] = useState<Services>({
    patientRecords: null,
    accessControl: null,
    auditLog: null,
    emergencyAccess: null,
    insuranceClaims: null,
    ipfs: ipfsService
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeServices() {
      if (!isConnected || !signer || !address) {
        setServices({
          patientRecords: null,
          accessControl: null,
          auditLog: null,
          emergencyAccess: null,
          insuranceClaims: null,
          ipfs: ipfsService
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const contracts = await getContracts(signer, 'localhost')

        setServices({
          patientRecords: new PatientRecordsService(contracts.patientRecords, address),
          accessControl: new AccessControlService(contracts.accessControl, address),
          auditLog: new AuditLogService(contracts.auditLog, address),
          emergencyAccess: new EmergencyAccessService(contracts.emergencyAccess, contracts.auditLog, address),
          insuranceClaims: new InsuranceClaimsService(contracts.insuranceClaims, address),
          ipfs: ipfsService
        })
      } catch (err: any) {
        console.error('Failed to initialize services:', err)
        setError(err.message || 'Failed to connect to smart contracts')
      } finally {
        setLoading(false)
      }
    }

    initializeServices()
  }, [signer, address, isConnected])

  return { services, loading, error }
}
