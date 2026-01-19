import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers'

// Import contract ABIs and addresses
import {
  MedChainCoreABI,
  PatientRecordsABI,
  AccessControlManagerABI,
  AuditLogABI,
  EmergencyAccessABI,
  InsuranceClaimsABI,
} from '../contracts/abis'
import { CONTRACT_ADDRESSES, getNetworkName, NetworkName } from '../contracts/addresses'

export interface ContractInstances {
  medChainCore: Contract
  patientRecords: Contract
  accessControl: Contract
  auditLog: Contract
  emergencyAccess: Contract
  insuranceClaims: Contract
}

export async function getContracts(
  signerOrProvider: JsonRpcSigner | BrowserProvider,
  network: NetworkName = 'localhost'
): Promise<ContractInstances> {
  const addresses = CONTRACT_ADDRESSES[network]

  const medChainCore = new Contract(
    addresses.MedChainCore,
    MedChainCoreABI,
    signerOrProvider
  )

  const patientRecords = new Contract(
    addresses.PatientRecords,
    PatientRecordsABI,
    signerOrProvider
  )

  const accessControl = new Contract(
    addresses.AccessControlManager,
    AccessControlManagerABI,
    signerOrProvider
  )

  const auditLog = new Contract(
    addresses.AuditLog,
    AuditLogABI,
    signerOrProvider
  )

  const emergencyAccess = new Contract(
    addresses.EmergencyAccess,
    EmergencyAccessABI,
    signerOrProvider
  )

  const insuranceClaims = new Contract(
    addresses.InsuranceClaims,
    InsuranceClaimsABI,
    signerOrProvider
  )

  return {
    medChainCore,
    patientRecords,
    accessControl,
    auditLog,
    emergencyAccess,
    insuranceClaims,
  }
}

export async function getContractsFromProvider(
  provider: BrowserProvider
): Promise<ContractInstances | null> {
  try {
    const network = await provider.getNetwork()
    const networkName = getNetworkName(Number(network.chainId))
    
    if (!networkName) {
      console.error('Unsupported network')
      return null
    }

    const signer = await provider.getSigner()
    return getContracts(signer, networkName)
  } catch (error) {
    console.error('Failed to get contracts:', error)
    return null
  }
}

export { CONTRACT_ADDRESSES, getNetworkName }
