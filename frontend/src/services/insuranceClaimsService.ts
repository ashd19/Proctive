import { Contract } from "ethers";

export enum ClaimStatus {
  PENDING = 0,
  UNDER_REVIEW = 1,
  APPROVED = 2,
  REJECTED = 3,
  PAID = 4,
  DISPUTED = 5,
}

export interface InsuranceClaim {
  id: number;
  patient: string;
  patientAddress: string;
  provider: string;
  recordIds: number[];
  claimAmount: bigint;
  approvedAmount: bigint;
  diagnosis: string;
  treatment: string;
  hospitalName: string;
  dateOfService: number;
  status: ClaimStatus;
  submittedAt: number;
  processedAt: number;
  reviewedAt: number;
  reviewedBy: string;
  notes: string;
}

export class InsuranceClaimsService {
  constructor(
    private insuranceClaimsContract: Contract,
    private _userAddress: string,
  ) {}

  // Create a new insurance claim (draft)
  async createClaim(
    policyNumber: string,
    claimType: number,
    claimAmount: string,
    recordIds: number[],
    hospitalName: string,
    diagnosis: string,
    treatment: string,
    dateOfService: number,
  ): Promise<number> {
    try {
      const tx = await this.insuranceClaimsContract.createClaim(
        policyNumber,
        claimType,
        claimAmount,
        recordIds,
        hospitalName,
        diagnosis,
        treatment,
        dateOfService,
      );

      const receipt = await tx.wait();

      // Extract claim ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.insuranceClaimsContract.interface.parseLog(log);
          return parsed?.name === "ClaimCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.insuranceClaimsContract.interface.parseLog(event);
        return Number(parsed?.args[0]);
      }

      throw new Error("Claim ID not found");
    } catch (error: any) {
      console.error("Error creating claim:", error);
      throw new Error(error.message || "Failed to create claim");
    }
  }

  // Submit a claim by ID (changes status from DRAFT to SUBMITTED)
  async submitClaimById(claimId: number): Promise<void> {
    try {
      const tx = await this.insuranceClaimsContract.submitClaim(claimId);
      await tx.wait();
    } catch (error: any) {
      console.error("Error submitting claim:", error);
      throw new Error(error.message || "Failed to submit claim");
    }
  }

  // Submit a new insurance claim (legacy method - kept for backwards compatibility)
  async submitClaim(
    patientAddress: string,
    recordIds: number[],
    claimAmount: string,
    diagnosis: string,
    treatment: string,
    hospitalName: string,
    dateOfService: number,
  ): Promise<number> {
    try {
      const tx = await this.insuranceClaimsContract.submitClaim(
        patientAddress,
        recordIds,
        claimAmount,
        diagnosis,
        treatment,
        hospitalName,
        dateOfService,
      );

      const receipt = await tx.wait();

      // Extract claim ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.insuranceClaimsContract.interface.parseLog(log);
          return parsed?.name === "ClaimSubmitted";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.insuranceClaimsContract.interface.parseLog(event);
        return Number(parsed?.args[0]);
      }

      throw new Error("Claim ID not found");
    } catch (error: any) {
      console.error("Error submitting claim:", error);
      throw new Error(error.message || "Failed to submit claim");
    }
  }

  // Update claim status
  async updateClaimStatus(
    claimId: number,
    newStatus: ClaimStatus,
    approvedAmount: string,
    notes: string,
  ): Promise<void> {
    try {
      const tx = await this.insuranceClaimsContract.updateClaimStatus(
        claimId,
        newStatus,
        approvedAmount,
        notes,
      );
      await tx.wait();
    } catch (error: any) {
      console.error("Error updating claim status:", error);
      throw new Error(error.message || "Failed to update claim status");
    }
  }

  // Approve claim
  async approveClaim(
    claimId: number,
    approvedAmount: string,
    notes: string,
  ): Promise<void> {
    try {
      const tx = await this.insuranceClaimsContract.approveClaim(
        claimId,
        approvedAmount,
        notes,
      );
      await tx.wait();
    } catch (error: any) {
      console.error("Error approving claim:", error);
      throw new Error(error.message || "Failed to approve claim");
    }
  }

  // Reject claim
  async rejectClaim(claimId: number, reason: string): Promise<void> {
    try {
      const tx = await this.insuranceClaimsContract.rejectClaim(
        claimId,
        reason,
      );
      await tx.wait();
    } catch (error: any) {
      console.error("Error rejecting claim:", error);
      throw new Error(error.message || "Failed to reject claim");
    }
  }

  // Mark claim as paid
  async markAsPaid(claimId: number): Promise<void> {
    try {
      const tx = await this.insuranceClaimsContract.markAsPaid(claimId);
      await tx.wait();
    } catch (error: any) {
      console.error("Error marking claim as paid:", error);
      throw new Error(error.message || "Failed to mark claim as paid");
    }
  }

  // Dispute claim
  async disputeClaim(claimId: number, reason: string): Promise<void> {
    try {
      const tx = await this.insuranceClaimsContract.disputeClaim(
        claimId,
        reason,
      );
      await tx.wait();
    } catch (error: any) {
      console.error("Error disputing claim:", error);
      throw new Error(error.message || "Failed to dispute claim");
    }
  }

  // Get claim by ID
  async getClaim(claimId: number): Promise<InsuranceClaim> {
    try {
      const claim = await this.insuranceClaimsContract.getClaim(claimId);

      return {
        id: Number(claim.id),
        patient: claim.patient,
        patientAddress: claim.patient,
        provider: claim.provider,
        recordIds: claim.recordIds.map((id: bigint) => Number(id)),
        claimAmount: claim.claimAmount,
        approvedAmount: claim.approvedAmount,
        diagnosis: claim.diagnosis,
        treatment: claim.treatment,
        hospitalName: claim.hospitalName,
        dateOfService: Number(claim.dateOfService),
        status: Number(claim.status),
        submittedAt: Number(claim.submittedAt),
        processedAt: Number(claim.reviewedAt),
        reviewedAt: Number(claim.reviewedAt),
        reviewedBy: claim.reviewedBy,
        notes: claim.notes,
      };
    } catch (error: any) {
      console.error("Error fetching claim:", error);
      throw new Error(error.message || "Failed to fetch claim");
    }
  }

  // Get patient's claims
  async getPatientClaims(patientAddress: string): Promise<InsuranceClaim[]> {
    try {
      const claimIds = await this.insuranceClaimsContract.getPatientClaims(
        patientAddress,
      );

      return await Promise.all(
        claimIds.map(async (id: bigint) => {
          return this.getClaim(Number(id));
        }),
      );
    } catch (error: any) {
      console.error("Error fetching patient claims:", error);
      return [];
    }
  }

  // Get provider's claims
  async getProviderClaims(providerAddress: string): Promise<InsuranceClaim[]> {
    try {
      const claimIds = await this.insuranceClaimsContract.getProviderClaims(
        providerAddress,
      );

      return await Promise.all(
        claimIds.map(async (id: bigint) => {
          return this.getClaim(Number(id));
        }),
      );
    } catch (error: any) {
      console.error("Error fetching provider claims:", error);
      return [];
    }
  }

  // Get claims by status
  async getClaimsByStatus(status: ClaimStatus): Promise<InsuranceClaim[]> {
    try {
      const claimIds = await this.insuranceClaimsContract.getClaimsByStatus(
        status,
      );

      return await Promise.all(
        claimIds.map(async (id: bigint) => {
          return this.getClaim(Number(id));
        }),
      );
    } catch (error: any) {
      console.error("Error fetching claims by status:", error);
      return [];
    }
  }

  // Get total claim count
  async getTotalClaimCount(): Promise<number> {
    try {
      return Number(await this.insuranceClaimsContract.getTotalClaimCount());
    } catch (error: any) {
      console.error("Error fetching total claim count:", error);
      return 0;
    }
  }

  // Helper: Get claim status name
  static getClaimStatusName(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.PENDING:
        return "Pending";
      case ClaimStatus.UNDER_REVIEW:
        return "Under Review";
      case ClaimStatus.APPROVED:
        return "Approved";
      case ClaimStatus.REJECTED:
        return "Rejected";
      case ClaimStatus.PAID:
        return "Paid";
      case ClaimStatus.DISPUTED:
        return "Disputed";
      default:
        return "Unknown";
    }
  }

  // Helper: Get claim status color
  static getClaimStatusColor(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case ClaimStatus.UNDER_REVIEW:
        return "bg-blue-100 text-blue-800";
      case ClaimStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case ClaimStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case ClaimStatus.PAID:
        return "bg-emerald-100 text-emerald-800";
      case ClaimStatus.DISPUTED:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
}
