import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { UserRole } from '../types'

interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number | null
  role: UserRole | null
  provider: BrowserProvider | null
  signer: JsonRpcSigner | null
  isLoading: boolean
  error: string | null
}

interface WalletActions {
  connect: () => Promise<void>
  disconnect: () => void
  setRole: (role: UserRole) => void
  checkConnection: () => Promise<void>
  switchNetwork: (chainId: number) => Promise<void>
}

const SUPPORTED_CHAIN_IDS = [31337, 11155111] // Hardhat local and Sepolia

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set, get) => ({
      address: null,
      isConnected: false,
      chainId: null,
      role: null,
      provider: null,
      signer: null,
      isLoading: false,
      error: null,

      connect: async () => {
        set({ isLoading: true, error: null })
        
        try {
          if (!window.ethereum) {
            throw new Error('Please install MetaMask to use this application')
          }

          const provider = new BrowserProvider(window.ethereum)
          const accounts = await provider.send('eth_requestAccounts', [])
          
          if (accounts.length === 0) {
            throw new Error('No accounts found')
          }

          const signer = await provider.getSigner()
          const network = await provider.getNetwork()
          const chainId = Number(network.chainId)

          if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
            // Try to switch to Hardhat local network
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x7A69' }], // 31337 in hex
              })
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x7A69',
                    chainName: 'Hardhat Local',
                    rpcUrls: ['http://127.0.0.1:8545'],
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18
                    }
                  }]
                })
              }
            }
          }

          set({
            address: accounts[0],
            isConnected: true,
            chainId,
            provider,
            signer,
            isLoading: false,
          })

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
              get().disconnect()
            } else {
              set({ address: accounts[0] })
            }
          })

          // Listen for network changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload()
          })

        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to connect wallet',
            isLoading: false 
          })
          throw error
        }
      },

      disconnect: () => {
        set({
          address: null,
          isConnected: false,
          chainId: null,
          role: null,
          provider: null,
          signer: null,
          error: null,
        })
      },

      setRole: (role: UserRole) => {
        set({ role })
      },

      checkConnection: async () => {
        if (!window.ethereum) return

        try {
          const provider = new BrowserProvider(window.ethereum)
          const accounts = await provider.send('eth_accounts', [])
          
          if (accounts.length > 0) {
            const signer = await provider.getSigner()
            const network = await provider.getNetwork()
            
            set({
              address: accounts[0],
              isConnected: true,
              chainId: Number(network.chainId),
              provider,
              signer,
            })
          }
        } catch (error) {
          console.error('Error checking connection:', error)
        }
      },

      switchNetwork: async (chainId: number) => {
        if (!window.ethereum) return

        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          })
        } catch (error: any) {
          if (error.code === 4902) {
            throw new Error('Network not found in wallet')
          }
          throw error
        }
      },
    }),
    {
      name: 'VitalChain-wallet',
      partialize: (state) => ({ 
        role: state.role,
      }),
    }
  )
)

// TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
