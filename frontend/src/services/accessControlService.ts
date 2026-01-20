import { Contract } from "ethers";

export enum AccessLevel {
  NONE = 0,
  VIEW_ONLY = 1,
  VIEW_AND_DOWNLOAD = 2,
  FULL_ACCESS = 3,
}

export enum ConsentStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  EXPIRED = 3,
  REVOKED = 4,
}

export interface AccessGrant {
  id: number;
  patient: string;
  grantee: string;
  recordIds: number[];
  accessLevel: AccessLevel;
  grantedAt: number;
  expiresAt: number;
  isActive: boolean;
  purpose: string;
}

export interface ConsentRequest {
  id: number;
  requester: string;
  patient: string;
  recordIds: number[];
  requestedLevel: AccessLevel;
  purpose: string;
  institutionName: string;
  status: ConsentStatus;
  requestedAt: number;
  respondedAt: number;
  validityPeriod: number;
}

export class AccessControlService {
  constructor(
    private accessControlContract: Contract,
    private _userAddress: string,
  ) {}

  // Request consent from patient
  async requestConsent(
    patientAddress: string,
    recordIds: number[],
    accessLevel: AccessLevel,
    purpose: string,
    institutionName: string,
    validityDays: number,
  ): Promise<number> {
    try {
      const validityPeriod = validityDays * 24 * 60 * 60; // Convert to seconds

      console.log("Requesting consent with params:", {
        patientAddress,
        recordIds,
        accessLevel,
        purpose,
        institutionName,
        validityPeriod,
      });

      const tx = await this.accessControlContract.requestConsent(
        patientAddress,
        recordIds,
        accessLevel,
        purpose,
        institutionName,
        validityPeriod,
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
      console.log("Receipt status:", receipt.status);
      console.log("Receipt logs count:", receipt.logs.length);

      // Check if transaction succeeded
      if (receipt.status === 0) {
        throw new Error("Transaction failed (reverted)");
      }

      // Extract request ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.accessControlContract.interface.parseLog(log);
          console.log("Parsed log:", parsed?.name, parsed?.args);
          return parsed?.name === "ConsentRequested";
        } catch (e) {
          // Try to parse with other interfaces if needed
          return false;
        }
      });

      if (event) {
        const parsed = this.accessControlContract.interface.parseLog(event);
        // requestId is indexed, so it's in the topics, but also available in args
        const requestId = parsed?.args?.requestId || parsed?.args?.[0];
        console.log("Found request ID:", requestId);
        if (requestId !== undefined) {
          return Number(requestId);
        }
      }

      // The contract function returns the requestId, we can get it from the transaction
      // Since the function has a return value, we can call it statically to get the next ID
      console.warn(
        "Event not found, trying to get request count from contract",
      );

      // Call the view function to get the request count (this is the ID that was just created)
      // Since we can't get the return value from a transaction, we'll need to rely on events
      // If no event is found, it means the transaction didn't actually create a request
      throw new Error(
        "Consent request transaction completed but no ConsentRequested event was emitted. The patient may not be registered.",
      );
    } catch (error: any) {
      console.error("Error requesting consent:", error);

      // Provide more specific error messages
      if (error.message?.includes("Not authorized")) {
        throw new Error(
          "You must be registered as a doctor to request access. Please register first.",
        );
      }
      if (
        error.message?.includes("Patient not registered") ||
        error.message?.includes("patient may not be registered")
      ) {
        throw new Error(
          `Patient address ${patientAddress.slice(
            0,
            6,
          )}...${patientAddress.slice(
            -4,
          )} is not registered. They need to register as a patient first.`,
        );
      }

      throw new Error(
        error.reason || error.message || "Failed to request consent",
      );
    }
  }

  // Approve consent request
  async approveConsent(requestId: number): Promise<void> {
    try {
      const tx = await this.accessControlContract.approveConsent(requestId);
      await tx.wait();
    } catch (error: any) {
      console.error("Error approving consent:", error);
      throw new Error(error.message || "Failed to approve consent");
    }
  }

  // Reject consent request
  async rejectConsent(requestId: number): Promise<void> {
    try {
      const tx = await this.accessControlContract.rejectConsent(requestId);
      await tx.wait();
    } catch (error: any) {
      console.error("Error rejecting consent:", error);
      throw new Error(error.message || "Failed to reject consent");
    }
  }

  // Grant access directly (patient initiated)
  async grantAccess(
    granteeAddress: string,
    recordIds: number[],
    accessLevel: AccessLevel,
    purpose: string,
    validityDays: number,
  ): Promise<void> {
    try {
      const expiresAt =
        Math.floor(Date.now() / 1000) + validityDays * 24 * 60 * 60;

      const tx = await this.accessControlContract.grantAccess(
        granteeAddress,
        recordIds,
        accessLevel,
        expiresAt,
        purpose,
      );
      await tx.wait();
    } catch (error: any) {
      console.error("Error granting access:", error);
      throw new Error(error.message || "Failed to grant access");
    }
  }

  // Revoke access
  async revokeAccess(granteeAddress: string): Promise<void> {
    try {
      const tx = await this.accessControlContract.revokeAccess(granteeAddress);
      await tx.wait();
    } catch (error: any) {
      console.error("Error revoking access:", error);
      throw new Error(error.message || "Failed to revoke access");
    }
  }

  // Get access grant for a grantee
  async getAccessGrant(
    patientAddress: string,
    granteeAddress: string,
  ): Promise<AccessGrant | null> {
    try {
      const grant = await this.accessControlContract.getAccessGrant(
        patientAddress,
        granteeAddress,
      );

      if (!grant.isActive) {
        return null;
      }

      return {
        id: Number(grant.id),
        patient: grant.patient,
        grantee: grant.grantee,
        recordIds: grant.recordIds.map((id: bigint) => Number(id)),
        accessLevel: Number(grant.accessLevel),
        grantedAt: Number(grant.grantedAt),
        expiresAt: Number(grant.expiresAt),
        isActive: grant.isActive,
        purpose: grant.purpose,
      };
    } catch (error: any) {
      console.error("Error fetching access grant:", error);
      return null;
    }
  }

  // Get all grantees for a patient
  async getPatientGrantees(patientAddress: string): Promise<string[]> {
    try {
      return await this.accessControlContract.getPatientGrantees(
        patientAddress,
      );
    } catch (error: any) {
      console.error("Error fetching grantees:", error);
      return [];
    }
  }

  // Get consent requests for patient
  async getPatientConsentRequests(
    patientAddress: string,
  ): Promise<ConsentRequest[]> {
    try {
      // Check if the contract is properly initialized
      if (!this.accessControlContract || !this.accessControlContract.target) {
        console.warn("AccessControl contract not initialized");
        return [];
      }

      let requestIds;
      try {
        requestIds =
          await this.accessControlContract.getPatientConsentRequestIds(
            patientAddress,
          );
      } catch (err: any) {
        // If the call fails with BAD_DATA, it likely means the array is empty
        if (
          err.code === "BAD_DATA" ||
          err.message?.includes("could not decode")
        ) {
          console.log("No consent requests found for patient (empty array)");
          return [];
        }
        throw err;
      }

      if (!requestIds || requestIds.length === 0) {
        return [];
      }

      return await Promise.all(
        requestIds.map(async (id: bigint) => {
          const request = await this.accessControlContract.getConsentRequest(
            Number(id),
          );
          return {
            id: Number(id),
            requester: request.requester,
            patient: request.patient,
            recordIds: request.recordIds.map((rid: bigint) => Number(rid)),
            requestedLevel: Number(request.requestedLevel),
            purpose: request.purpose,
            institutionName: request.institutionName,
            status: Number(request.status),
            requestedAt: Number(request.requestedAt),
            respondedAt: Number(request.respondedAt),
            validityPeriod: Number(request.validityPeriod),
          };
        }),
      );
    } catch (error: any) {
      console.error("Error fetching consent requests:", error);
      return [];
    }
  }

  // Get consent requests made by requester
  async getRequesterConsentRequests(
    requesterAddress: string,
  ): Promise<ConsentRequest[]> {
    try {
      // Check if the contract is properly initialized
      if (!this.accessControlContract || !this.accessControlContract.target) {
        console.warn("AccessControl contract not initialized");
        return [];
      }

      let requestIds;
      try {
        requestIds =
          await this.accessControlContract.getRequesterConsentRequestIds(
            requesterAddress,
          );
      } catch (err: any) {
        // If the call fails with BAD_DATA, it likely means the array is empty or the function reverted
        // This is normal if the doctor hasn't made any requests yet
        if (
          err.code === "BAD_DATA" ||
          err.message?.includes("could not decode")
        ) {
          console.log("No consent requests found for requester (empty array)");
          return [];
        }
        throw err;
      }

      if (!requestIds || requestIds.length === 0) {
        return [];
      }

      return await Promise.all(
        requestIds.map(async (id: bigint) => {
          const request = await this.accessControlContract.getConsentRequest(
            Number(id),
          );
          return {
            id: Number(id),
            requester: request.requester,
            patient: request.patient,
            recordIds: request.recordIds.map((rid: bigint) => Number(rid)),
            requestedLevel: Number(request.requestedLevel),
            purpose: request.purpose,
            institutionName: request.institutionName,
            status: Number(request.status),
            requestedAt: Number(request.requestedAt),
            respondedAt: Number(request.respondedAt),
            validityPeriod: Number(request.validityPeriod),
          };
        }),
      );
    } catch (error: any) {
      console.error("Error fetching requester consent requests:", error);
      return [];
    }
  }

  // Get all patients that requester has access to
  async getRequesterAccessiblePatients(
    requesterAddress: string,
  ): Promise<string[]> {
    try {
      const requests = await this.getRequesterConsentRequests(requesterAddress);
      const approvedRequests = requests.filter(
        (r) => r.status === ConsentStatus.APPROVED,
      );
      return [...new Set(approvedRequests.map((r) => r.patient))];
    } catch (error: any) {
      console.error("Error fetching accessible patients:", error);
      return [];
    }
  }

  // Check if has access to records
  async hasAccessToRecords(
    patientAddress: string,
    granteeAddress: string,
    recordIds: number[],
  ): Promise<boolean> {
    try {
      return await this.accessControlContract.hasAccessToRecords(
        patientAddress,
        granteeAddress,
        recordIds,
      );
    } catch (error: any) {
      console.error("Error checking access:", error);
      return false;
    }
  }

  // Check if grant is expired
  async isGrantExpired(
    patientAddress: string,
    granteeAddress: string,
  ): Promise<boolean> {
    try {
      return await this.accessControlContract.isGrantExpired(
        patientAddress,
        granteeAddress,
      );
    } catch (error: any) {
      console.error("Error checking expiration:", error);
      return true;
    }
  }

  // Helper: Get access level name
  static getAccessLevelName(level: AccessLevel): string {
    switch (level) {
      case AccessLevel.VIEW_ONLY:
        return "View Only";
      case AccessLevel.VIEW_AND_DOWNLOAD:
        return "View & Download";
      case AccessLevel.FULL_ACCESS:
        return "Full Access";
      default:
        return "None";
    }
  }

  // Helper: Get consent status name
  static getConsentStatusName(status: ConsentStatus): string {
    switch (status) {
      case ConsentStatus.PENDING:
        return "Pending";
      case ConsentStatus.APPROVED:
        return "Approved";
      case ConsentStatus.REJECTED:
        return "Rejected";
      case ConsentStatus.EXPIRED:
        return "Expired";
      case ConsentStatus.REVOKED:
        return "Revoked";
      default:
        return "Unknown";
    }
  }
}
