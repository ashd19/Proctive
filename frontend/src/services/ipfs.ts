import CryptoJS from "crypto-js";

// Pinata API Configuration
const PINATA_API_KEY = "49ead6420aacfa844d00";
const PINATA_API_SECRET =
  "5f281cbf0115d45bdc2cd8f9ce8835aa4898ab955e7a6b69585e5e7b72e132ce";
const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjZWU4NWY2Ny0xNDE1LTRlNmUtYjk3Yi02Yjg0OGQ3ODE0OGYiLCJlbWFpbCI6ImFzaHRvbmRzb3V6YTE5MkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDllYWQ2NDIwYWFjZmE4NDRkMDAiLCJzY29wZWRLZXlTZWNyZXQiOiI1ZjI4MWNiZjAxMTVkNDViZGMyY2Q4ZjljZTg4MzVhYTQ4OThhYjk1NWU3YTZiNjk1ODVlNWU3YjcyZTEzMmNlIiwiZXhwIjoxNzk5Njc5NzYwfQ.bqcsXbdSh2qYlVOPO-n98SbU9eRQSwf--AmBHJhTXW0";
const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

// IPFS Gateway URLs for retrieval
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];

class IPFSService {
  private localStore: Map<string, string> = new Map();
  private usePinata: boolean = true;

  // Generate encryption key
  generateEncryptionKey(): string {
    const key = CryptoJS.lib.WordArray.random(256 / 8);
    return key.toString(CryptoJS.enc.Hex);
  }

  // Encrypt data with AES
  encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  // Decrypt data with AES
  decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Hash data for verification
  hashData(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  // Encrypt the encryption key with user's public key (RSA simulation)
  encryptKeyForUser(key: string, publicKey: string): string {
    // In production, use actual RSA encryption with user's public key
    // For demo, we use a deterministic encryption based on publicKey
    // Normalize address to lowercase to avoid checksum issues
    const normalizedKey = publicKey.toLowerCase();
    return CryptoJS.AES.encrypt(key, normalizedKey).toString();
  }

  // Decrypt the encryption key with user's private key
  decryptKeyForUser(encryptedKey: string, privateKey: string): string {
    try {
      // Normalize address to lowercase to match encryption
      const normalizedKey = privateKey.toLowerCase();
      const bytes = CryptoJS.AES.decrypt(encryptedKey, normalizedKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error("Decryption failed - wrong key or corrupted data");
      }

      return decrypted;
    } catch (error: any) {
      console.error("❌ Key decryption failed:", error);
      console.log("Encrypted key length:", encryptedKey?.length);
      console.log(
        "Private key (first 10 chars):",
        privateKey?.substring(0, 10),
      );
      console.log(
        "Normalized key:",
        privateKey?.toLowerCase().substring(0, 10),
      );
      throw new Error(
        "Failed to decrypt encryption key - access denied or corrupted data",
      );
    }
  }

  // Upload data to IPFS using Pinata
  async uploadToIPFS(data: string | File): Promise<string> {
    if (this.usePinata && PINATA_API_KEY) {
      try {
        if (data instanceof File) {
          return await this.uploadFileToPinata(data);
        } else {
          return await this.uploadJSONToPinata({ content: data });
        }
      } catch (error) {
        console.error("❌ Pinata upload failed:", error);
        console.error(
          "Error details:",
          error instanceof Error ? error.message : String(error),
        );
        throw new Error(
          `IPFS upload failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    throw new Error("Pinata API key not configured");
  }

  // Upload JSON to Pinata
  async uploadJSON(jsonData: any, filename?: string): Promise<string> {
    return this.uploadJSONToPinata(jsonData, filename);
  }

  // Upload JSON to Pinata
  private async uploadJSONToPinata(
    jsonData: any,
    filename?: string,
  ): Promise<string> {
    const name = filename ? filename : `VitalChain-${Date.now()}.json`;

    console.log("📤 Uploading to Pinata:", name);
    console.log("📦 Data size:", JSON.stringify(jsonData).length, "bytes");

    const response = await fetch(PINATA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name,
          keyvalues: {
            private: "true",
            encrypted: "true",
            type: "medical-record",
          },
        },
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Pinata error response:", errorText);
      throw new Error(
        `Pinata upload failed (${response.status}): ${errorText}`,
      );
    }

    const result = await response.json();
    console.log("✅ Pinata upload successful! Hash:", result.IpfsHash);
    return result.IpfsHash;
  }

  // Upload File to Pinata
  private async uploadFileToPinata(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: file.name,
        keyvalues: {
          private: "true",
          encrypted: "true",
          type: file.type,
          originalName: file.name,
        },
      }),
    );
    formData.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      }),
    );

    const response = await fetch(PINATA_FILE_URL, {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Pinata file upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  }

  // Upload encrypted medical record
  async uploadEncryptedRecord(
    recordData: object,
    patientPublicKey: string,
  ): Promise<{
    ipfsHash: string;
    encryptedKey: string;
    metadataHash: string;
  }> {
    const jsonData = JSON.stringify(recordData);

    // Generate encryption key
    const encryptionKey = this.generateEncryptionKey();
    console.log("🔐 Generated AES-256 encryption key");

    // Encrypt the data
    const encryptedData = this.encryptData(jsonData, encryptionKey);
    console.log("🔒 Data encrypted with AES-256 before IPFS upload");
    console.log("📊 Original size:", jsonData.length, "bytes");
    console.log("🔐 Encrypted size:", encryptedData.length, "bytes");

    // Upload encrypted data to IPFS
    const ipfsHash = await this.uploadToIPFS(encryptedData);
    console.log("☁️ Encrypted data uploaded to IPFS:", ipfsHash);
    console.log("✅ Data is ENCRYPTED on IPFS - unreadable without key");

    // Encrypt the key for the patient
    const encryptedKey = this.encryptKeyForUser(
      encryptionKey,
      patientPublicKey,
    );
    console.log("🔑 Encryption key encrypted for patient");

    // Create metadata hash for verification
    const metadataHash = this.hashData(jsonData);
    console.log("✓ Metadata hash created for integrity verification");

    return {
      ipfsHash,
      encryptedKey,
      metadataHash,
    };
  }

  // Retrieve and decrypt medical record
  async retrieveRecord(
    ipfsHash: string,
    encryptedKey: string,
    privateKey: string,
  ): Promise<object | null> {
    try {
      console.log("🔍 Retrieving record from IPFS:", ipfsHash);

      // Get encrypted data from IPFS
      const encryptedData = await this.getFromIPFS(ipfsHash);

      if (!encryptedData) {
        console.error("❌ Record not found on IPFS");
        throw new Error("Record not found on IPFS");
      }

      console.log("🔓 Decrypting encryption key...");
      // Decrypt the encryption key
      const encryptionKey = this.decryptKeyForUser(encryptedKey, privateKey);

      console.log("🔓 Decrypting record data...");
      // Decrypt the data
      const decryptedData = this.decryptData(encryptedData, encryptionKey);

      console.log("✅ Record successfully decrypted");
      return JSON.parse(decryptedData);
    } catch (error: any) {
      console.error("❌ Error retrieving record:", error);
      throw error;
    }
  }

  // Get data from IPFS
  async getFromIPFS(cid: string): Promise<string | null> {
    // Check local store first (for demo)
    if (this.localStore.has(cid)) {
      return this.localStore.get(cid) || null;
    }

    // Try fetching from public gateways
    for (const gateway of IPFS_GATEWAYS) {
      try {
        console.log(`🌐 Fetching from ${gateway}${cid}`);
        const response = await fetch(`${gateway}${cid}`, {
          signal: AbortSignal.timeout(10000),
          mode: "cors",
        });
        if (response.ok) {
          const text = await response.text();
          // If data was uploaded as JSON with { content: "..." }, extract it
          try {
            const json = JSON.parse(text);
            if (json.content) {
              console.log("✅ Retrieved and extracted content from IPFS");
              return json.content;
            }
          } catch {
            // Not JSON or doesn't have content field, return as-is
          }
          console.log("✅ Retrieved data from IPFS");
          return text;
        }
      } catch (error) {
        console.warn(`❌ Failed to fetch from ${gateway}:`, error);
        continue;
      }
    }

    console.error("❌ Failed to retrieve from all IPFS gateways");
    return null;
  }

  // Upload file to IPFS with encryption
  async uploadEncryptedFile(
    file: File,
    patientPublicKey: string,
  ): Promise<{
    ipfsHash: string;
    encryptedKey: string;
    fileHash: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }> {
    const base64Content = await this.fileToBase64(file);

    // Create a JSON wrapper with file metadata and content
    const fileData = {
      isFile: true,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileContent: base64Content, // Store base64 content in JSON
    };

    const jsonData = JSON.stringify(fileData);

    // Generate encryption key
    const encryptionKey = this.generateEncryptionKey();

    // Encrypt the JSON (which contains the file)
    const encryptedContent = this.encryptData(jsonData, encryptionKey);

    // Upload to IPFS
    const ipfsHash = await this.uploadToIPFS(encryptedContent);

    // Encrypt key for patient
    const encryptedKey = this.encryptKeyForUser(
      encryptionKey,
      patientPublicKey,
    );

    // Hash for verification
    const fileHash = this.hashData(base64Content);

    return {
      ipfsHash,
      encryptedKey,
      fileHash,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  // Retrieve and decrypt file
  async retrieveFile(
    ipfsHash: string,
    encryptedKey: string,
    privateKey: string,
  ): Promise<Blob | null> {
    try {
      const encryptedContent = await this.getFromIPFS(ipfsHash);

      if (!encryptedContent) {
        throw new Error("File not found");
      }

      const encryptionKey = this.decryptKeyForUser(encryptedKey, privateKey);
      const base64Content = this.decryptData(encryptedContent, encryptionKey);

      return this.base64ToBlob(base64Content);
    } catch (error) {
      console.error("Error retrieving file:", error);
      return null;
    }
  }

  // Helper: File to Base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] || result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Helper: Base64 to Blob
  private base64ToBlob(
    base64: string,
    mimeType = "application/octet-stream",
  ): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Verify data integrity
  verifyDataIntegrity(data: string, expectedHash: string): boolean {
    const computedHash = this.hashData(data);
    return computedHash === expectedHash;
  }
}

export const ipfsService = new IPFSService();
export default ipfsService;
