import CryptoJS from 'crypto-js'

// Pinata API Configuration
const PINATA_API_KEY = '49ead6420aacfa844d00'
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
const PINATA_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'

// IPFS Gateway URLs for retrieval
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
]

class IPFSService {
  private localStore: Map<string, string> = new Map()
  private usePinata: boolean = true

  // Generate encryption key
  generateEncryptionKey(): string {
    const key = CryptoJS.lib.WordArray.random(256 / 8)
    return key.toString(CryptoJS.enc.Hex)
  }

  // Encrypt data with AES
  encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString()
  }

  // Decrypt data with AES
  decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  // Hash data for verification
  hashData(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex)
  }

  // Encrypt the encryption key with user's public key (RSA simulation)
  encryptKeyForUser(key: string, publicKey: string): string {
    // In production, use actual RSA encryption with user's public key
    // For demo, we use a deterministic encryption based on publicKey
    return CryptoJS.AES.encrypt(key, publicKey).toString()
  }

  // Decrypt the encryption key with user's private key
  decryptKeyForUser(encryptedKey: string, privateKey: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, privateKey)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  // Upload data to IPFS using Pinata
  async uploadToIPFS(data: string | File): Promise<string> {
    if (this.usePinata && PINATA_API_KEY) {
      try {
        if (data instanceof File) {
          return await this.uploadFileToPinata(data)
        } else {
          return await this.uploadJSONToPinata({ content: data })
        }
      } catch (error) {
        console.warn('Pinata upload failed, using local storage:', error)
        this.usePinata = false
      }
    }

    // Fallback to local storage
    let content: string
    if (data instanceof File) {
      content = await this.fileToBase64(data)
    } else {
      content = data
    }

    const hash = this.hashData(content + Date.now().toString())
    const cid = `Qm${hash.substring(0, 44)}`
    this.localStore.set(cid, content)
    return cid
  }

  // Upload JSON to Pinata
  private async uploadJSONToPinata(jsonData: any): Promise<string> {
    const response = await fetch(PINATA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: `VitalChain-${Date.now()}`,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.IpfsHash
  }

  // Upload File to Pinata
  private async uploadFileToPinata(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('pinataMetadata', JSON.stringify({
      name: file.name,
    }))

    const response = await fetch(PINATA_FILE_URL, {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Pinata file upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.IpfsHash
  }

  // Upload encrypted medical record
  async uploadEncryptedRecord(
    recordData: object,
    patientPublicKey: string
  ): Promise<{
    ipfsHash: string
    encryptedKey: string
    metadataHash: string
  }> {
    const jsonData = JSON.stringify(recordData)
    
    // Generate encryption key
    const encryptionKey = this.generateEncryptionKey()
    
    // Encrypt the data
    const encryptedData = this.encryptData(jsonData, encryptionKey)
    
    // Upload encrypted data to IPFS
    const ipfsHash = await this.uploadToIPFS(encryptedData)
    
    // Encrypt the key for the patient
    const encryptedKey = this.encryptKeyForUser(encryptionKey, patientPublicKey)
    
    // Create metadata hash for verification
    const metadataHash = this.hashData(jsonData)

    return {
      ipfsHash,
      encryptedKey,
      metadataHash,
    }
  }

  // Retrieve and decrypt medical record
  async retrieveRecord(
    ipfsHash: string,
    encryptedKey: string,
    privateKey: string
  ): Promise<object | null> {
    try {
      // Get encrypted data from IPFS
      const encryptedData = await this.getFromIPFS(ipfsHash)
      
      if (!encryptedData) {
        throw new Error('Record not found on IPFS')
      }

      // Decrypt the encryption key
      const encryptionKey = this.decryptKeyForUser(encryptedKey, privateKey)
      
      // Decrypt the data
      const decryptedData = this.decryptData(encryptedData, encryptionKey)
      
      return JSON.parse(decryptedData)
    } catch (error) {
      console.error('Error retrieving record:', error)
      return null
    }
  }

  // Get data from IPFS
  async getFromIPFS(cid: string): Promise<string | null> {
    // Check local store first (for demo)
    if (this.localStore.has(cid)) {
      return this.localStore.get(cid) || null
    }

    // Try fetching from public gateways
    for (const gateway of IPFS_GATEWAYS) {
      try {
        const response = await fetch(`${gateway}${cid}`, {
          signal: AbortSignal.timeout(5000),
        })
        if (response.ok) {
          return await response.text()
        }
      } catch {
        continue
      }
    }

    return null
  }

  // Upload file to IPFS with encryption
  async uploadEncryptedFile(
    file: File,
    patientPublicKey: string
  ): Promise<{
    ipfsHash: string
    encryptedKey: string
    fileHash: string
    fileName: string
    fileSize: number
    mimeType: string
  }> {
    const base64Content = await this.fileToBase64(file)
    
    // Generate encryption key
    const encryptionKey = this.generateEncryptionKey()
    
    // Encrypt the file content
    const encryptedContent = this.encryptData(base64Content, encryptionKey)
    
    // Upload to IPFS
    const ipfsHash = await this.uploadToIPFS(encryptedContent)
    
    // Encrypt key for patient
    const encryptedKey = this.encryptKeyForUser(encryptionKey, patientPublicKey)
    
    // Hash for verification
    const fileHash = this.hashData(base64Content)

    return {
      ipfsHash,
      encryptedKey,
      fileHash,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }
  }

  // Retrieve and decrypt file
  async retrieveFile(
    ipfsHash: string,
    encryptedKey: string,
    privateKey: string
  ): Promise<Blob | null> {
    try {
      const encryptedContent = await this.getFromIPFS(ipfsHash)
      
      if (!encryptedContent) {
        throw new Error('File not found')
      }

      const encryptionKey = this.decryptKeyForUser(encryptedKey, privateKey)
      const base64Content = this.decryptData(encryptedContent, encryptionKey)
      
      return this.base64ToBlob(base64Content)
    } catch (error) {
      console.error('Error retrieving file:', error)
      return null
    }
  }

  // Helper: File to Base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1] || result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Helper: Base64 to Blob
  private base64ToBlob(base64: string, mimeType = 'application/octet-stream'): Blob {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  // Verify data integrity
  verifyDataIntegrity(data: string, expectedHash: string): boolean {
    const computedHash = this.hashData(data)
    return computedHash === expectedHash
  }
}

export const ipfsService = new IPFSService()
export default ipfsService
