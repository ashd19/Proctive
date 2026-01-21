import { Contract } from "ethers";
import { ipfsService } from "./ipfs";

export interface MedicalRecordData {
  patientId: string;
  recordType: number;
  title: string;
  description: string;
  hospitalName: string;
  doctorName: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
  };
  notes?: string;
  tags: string[];
  // File metadata fields
  fileData?: boolean;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  fileUrl?: string;
}

export interface MedicalRecord {
  id: number;
  patient: string;
  createdBy: string;
  recordType: number;
  ipfsHash: string;
  encryptedKey: string;
  metadataHash: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  metadata: {
    title: string;
    description: string;
    recordType: string;
    hospitalName: string;
    doctorName: string;
    tags: string[];
  };
}

export class PatientRecordsService {
  constructor(
    private patientRecordsContract: Contract,
    private userAddress: string,
  ) {}

  // Create a new medical record
  async createRecord(
    patientAddress: string,
    recordData: MedicalRecordData,
    existingIpfsResult?: {
      ipfsHash: string;
      encryptedKey: string;
      metadataHash?: string;
      fileHash?: string;
    },
  ): Promise<number> {
    try {
      // Use existing IPFS result if provided (for file uploads), otherwise upload record data as JSON
      let ipfsResult;
      if (existingIpfsResult) {
        ipfsResult = {
          ipfsHash: existingIpfsResult.ipfsHash,
          encryptedKey: existingIpfsResult.encryptedKey,
          metadataHash:
            existingIpfsResult.metadataHash ||
            existingIpfsResult.fileHash ||
            this.hashData(JSON.stringify(recordData)),
        };
        console.log("Using existing IPFS file upload:", ipfsResult.ipfsHash);
      } else {
        // Encrypt and upload JSON to IPFS
        ipfsResult = await ipfsService.uploadEncryptedRecord(
          recordData,
          patientAddress,
        );
        console.log("Uploaded JSON record to IPFS:", ipfsResult.ipfsHash);
      }

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
        recordData.tags,
      );

      const receipt = await tx.wait();

      // Extract record ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.patientRecordsContract.interface.parseLog(log);
          return parsed?.name === "RecordCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.patientRecordsContract.interface.parseLog(event);
        return Number(parsed?.args[0]);
      }

      throw new Error("Record ID not found in transaction");
    } catch (error: any) {
      console.error("Error creating record:", error);
      throw new Error(error.message || "Failed to create medical record");
    }
  }

  // Get all records for a patient
  async getPatientRecords(patientAddress: string): Promise<MedicalRecord[]> {
    try {
      console.log("Fetching records for patient:", patientAddress);
      const recordIds = await this.patientRecordsContract.getPatientRecordIds(
        patientAddress,
      );
      console.log("Record IDs found:", recordIds);

      if (!recordIds || recordIds.length === 0) {
        console.log("No record IDs found for patient");
        return [];
      }

      const records = await Promise.all(
        recordIds.map(async (id: bigint) => {
          console.log("Fetching record:", Number(id));
          const record = await this.patientRecordsContract.getRecord(
            Number(id),
          );
          const metadata = await this.patientRecordsContract.getRecordMetadata(
            Number(id),
          );

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
            },
          };
        }),
      );

      const activeRecords = records.filter((r) => r.isActive);
      console.log("Active records found:", activeRecords.length);
      return activeRecords;
    } catch (error: any) {
      console.error("Error fetching patient records:", error);
      throw new Error(error.message || "Failed to fetch patient records");
    }
  }

  // Get a specific record
  async getRecord(recordId: number): Promise<MedicalRecord> {
    try {
      const record = await this.patientRecordsContract.getRecord(recordId);
      const metadata = await this.patientRecordsContract.getRecordMetadata(
        recordId,
      );

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
          recordType: metadata.recordType || "General",
          hospitalName: metadata.hospitalName,
          doctorName: metadata.doctorName,
          tags: metadata.tags,
        },
      };
    } catch (error: any) {
      console.error("Error fetching record:", error);
      throw new Error(error.message || "Failed to fetch record");
    }
  }

  // Decrypt and retrieve record data from IPFS
  async getRecordData(record: MedicalRecord): Promise<any> {
    try {
      // Use patient's address as decryption key (for demo purposes)
      // In production, this would use a proper key management system
      // where the patient re-encrypts keys for authorized doctors
      const decryptionKey = record.patient; // Patient's address

      console.log("📥 Retrieving record data from IPFS...");
      console.log("Patient:", record.patient);
      console.log("IPFS Hash:", record.ipfsHash);
      console.log("Encrypted Key (full):", record.encryptedKey);
      console.log("Encrypted Key length:", record.encryptedKey?.length);
      console.log("Current user:", this.userAddress);
      console.log("Decryption key:", decryptionKey);

      // Validate encrypted key exists
      if (!record.encryptedKey || record.encryptedKey.length === 0) {
        throw new Error(
          "No encryption key found in record - record may be corrupted",
        );
      }

      const data = await ipfsService.retrieveRecord(
        record.ipfsHash,
        record.encryptedKey,
        decryptionKey, // Use patient's address instead of doctor's
      );

      if (!data) {
        throw new Error("Failed to decrypt record data");
      }

      console.log("✅ Record data successfully retrieved and decrypted");

      // If this is a file record (has isFile flag from IPFS or fileData from metadata)
      if (data.isFile || data.fileData || data.mimeType) {
        console.log("📄 File record detected");

        // If we have the actual file content from IPFS
        if (data.isFile && data.fileContent) {
          console.log("📦 Converting base64 file content to blob URL");
          // Convert base64 to blob
          const binaryString = atob(data.fileContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: data.mimeType });
          const fileUrl = URL.createObjectURL(blob);

          return {
            ...data,
            fileUrl: fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
          };
        }

        // Fallback: construct IPFS gateway URL
        return {
          ...data,
          fileUrl:
            data.fileUrl ||
            `https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`,
        };
      }

      return data;
    } catch (error: any) {
      console.error("❌ Error retrieving record data:", error);
      throw new Error(error.message || "Failed to decrypt record data");
    }
  }

  // Hash data for verification
  private hashData(data: string): string {
    const CryptoJS = require("crypto-js");
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  // Update record (metadata only, IPFS hash is immutable)
  async updateRecordMetadata(
    recordId: number,
    title: string,
    description: string,
    tags: string[],
  ): Promise<void> {
    try {
      const tx = await this.patientRecordsContract.updateRecordMetadata(
        recordId,
        title,
        description,
        tags,
      );
      await tx.wait();
    } catch (error: any) {
      console.error("Error updating record:", error);
      throw new Error(error.message || "Failed to update record");
    }
  }

  // Deactivate a record
  async deactivateRecord(recordId: number): Promise<void> {
    try {
      const tx = await this.patientRecordsContract.deactivateRecord(recordId);
      await tx.wait();
    } catch (error: any) {
      console.error("Error deactivating record:", error);
      throw new Error(error.message || "Failed to deactivate record");
    }
  }

  // Get record type name
  static getRecordTypeName(type: number): string {
    const types = [
      "General",
      "Prescription",
      "Lab Result",
      "Imaging",
      "Surgery",
      "Vaccination",
      "Allergy",
      "Chronic Condition",
    ];
    return types[type] || "Unknown";
  }
}
