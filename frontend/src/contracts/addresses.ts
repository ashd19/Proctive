// Contract addresses - Update these after deployment
// Run `npx hardhat run scripts/deploy.js --network localhost` to deploy contracts
// Then copy the addresses from the console output

export const CONTRACT_ADDRESSES = {
  // Localhost (Hardhat Network)
  localhost: {
    MedChainCore: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    PatientRecords: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    AccessControlManager: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    AuditLog: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    EmergencyAccess: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    InsuranceClaims: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  },
  // Sepolia Testnet
  sepolia: {
    MedChainCore: '',
    PatientRecords: '',
    AccessControlManager: '',
    AuditLog: '',
    EmergencyAccess: '',
    InsuranceClaims: '',
  },
} as const

export type NetworkName = keyof typeof CONTRACT_ADDRESSES

export function getContractAddresses(network: NetworkName) {
  return CONTRACT_ADDRESSES[network]
}

// Chain IDs
export const CHAIN_IDS = {
  localhost: 31337,
  sepolia: 11155111,
} as const

export function getNetworkName(chainId: number): NetworkName | null {
  const entry = Object.entries(CHAIN_IDS).find(([_, id]) => id === chainId)
  return entry ? (entry[0] as NetworkName) : null
}
