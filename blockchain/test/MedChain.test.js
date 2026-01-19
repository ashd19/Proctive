const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VitalChainCore", function () {
  let VitalChainCore;
  let owner, hospital, doctor, patient, lab, insurance;

  beforeEach(async function () {
    [owner, hospital, doctor, patient, lab, insurance] = await ethers.getSigners();
    
    const VitalChainCore = await ethers.getContractFactory("VitalChainCore");
    VitalChainCore = await VitalChainCore.deploy();
    await VitalChainCore.waitForDeployment();
  });

  describe("Hospital Registration", function () {
    it("Should register a hospital", async function () {
      await VitalChainCore.registerHospital(
        hospital.address,
        "City General Hospital",
        "HOSP-2024-001"
      );

      expect(await VitalChainCore.isHospital(hospital.address)).to.be.true;
      
      const info = await VitalChainCore.getHospitalInfo(hospital.address);
      expect(info.name).to.equal("City General Hospital");
      expect(info.licenseNumber).to.equal("HOSP-2024-001");
      expect(info.isActive).to.be.true;
    });

    it("Should emit HospitalRegistered event", async function () {
      await expect(VitalChainCore.registerHospital(
        hospital.address,
        "City General Hospital",
        "HOSP-2024-001"
      ))
        .to.emit(VitalChainCore, "HospitalRegistered")
        .withArgs(hospital.address, "City General Hospital");
    });

    it("Should not allow duplicate hospital registration", async function () {
      await VitalChainCore.registerHospital(
        hospital.address,
        "City General Hospital",
        "HOSP-2024-001"
      );

      await expect(
        VitalChainCore.registerHospital(
          hospital.address,
          "Another Hospital",
          "HOSP-2024-002"
        )
      ).to.be.revertedWith("Hospital already registered");
    });
  });

  describe("Doctor Registration", function () {
    beforeEach(async function () {
      await VitalChainCore.registerHospital(
        hospital.address,
        "City General Hospital",
        "HOSP-2024-001"
      );
    });

    it("Should register a doctor affiliated with a hospital", async function () {
      await VitalChainCore.registerDoctor(
        doctor.address,
        "Dr. John Smith",
        "MD-2024-001",
        hospital.address
      );

      expect(await VitalChainCore.isDoctor(doctor.address)).to.be.true;
      
      const info = await VitalChainCore.getDoctorInfo(doctor.address);
      expect(info.name).to.equal("Dr. John Smith");
      expect(info.hospitalAddress).to.equal(hospital.address);
    });

    it("Should emit DoctorRegistered event", async function () {
      await expect(VitalChainCore.registerDoctor(
        doctor.address,
        "Dr. John Smith",
        "MD-2024-001",
        hospital.address
      ))
        .to.emit(VitalChainCore, "DoctorRegistered")
        .withArgs(doctor.address, "Dr. John Smith", hospital.address);
    });

    it("Should fail if hospital is not registered", async function () {
      await expect(
        VitalChainCore.registerDoctor(
          doctor.address,
          "Dr. John Smith",
          "MD-2024-001",
          lab.address // not a hospital
        )
      ).to.be.revertedWith("Hospital not registered");
    });
  });

  describe("Laboratory Registration", function () {
    it("Should register a laboratory", async function () {
      await VitalChainCore.registerLaboratory(
        lab.address,
        "MedLab Diagnostics",
        "LAB-2024-001"
      );

      expect(await VitalChainCore.isLaboratory(lab.address)).to.be.true;
    });

    it("Should emit LaboratoryRegistered event", async function () {
      await expect(VitalChainCore.registerLaboratory(
        lab.address,
        "MedLab Diagnostics",
        "LAB-2024-001"
      ))
        .to.emit(VitalChainCore, "LaboratoryRegistered")
        .withArgs(lab.address, "MedLab Diagnostics");
    });
  });

  describe("Insurance Provider Registration", function () {
    it("Should register an insurance provider", async function () {
      await VitalChainCore.registerInsuranceProvider(
        insurance.address,
        "HealthFirst Insurance",
        "INS-2024-001"
      );

      expect(await VitalChainCore.isInsuranceProvider(insurance.address)).to.be.true;
    });

    it("Should emit InsuranceProviderRegistered event", async function () {
      await expect(VitalChainCore.registerInsuranceProvider(
        insurance.address,
        "HealthFirst Insurance",
        "INS-2024-001"
      ))
        .to.emit(VitalChainCore, "InsuranceProviderRegistered")
        .withArgs(insurance.address, "HealthFirst Insurance");
    });
  });

  describe("Patient Registration", function () {
    it("Should allow self-registration as patient", async function () {
      await VitalChainCore.connect(patient).registerPatient();
      expect(await VitalChainCore.isPatient(patient.address)).to.be.true;
    });

    it("Should emit PatientRegistered event", async function () {
      await expect(VitalChainCore.connect(patient).registerPatient())
        .to.emit(VitalChainCore, "PatientRegistered")
        .withArgs(patient.address);
    });

    it("Should not allow duplicate patient registration", async function () {
      await VitalChainCore.connect(patient).registerPatient();
      await expect(
        VitalChainCore.connect(patient).registerPatient()
      ).to.be.revertedWith("Patient already registered");
    });
  });
});

describe("PatientRecords", function () {
  let VitalChainCore, patientRecords;
  let owner, hospital, doctor, patient;

  beforeEach(async function () {
    [owner, hospital, doctor, patient] = await ethers.getSigners();
    
    const VitalChainCore = await ethers.getContractFactory("VitalChainCore");
    VitalChainCore = await VitalChainCore.deploy();
    await VitalChainCore.waitForDeployment();

    const PatientRecords = await ethers.getContractFactory("PatientRecords");
    patientRecords = await PatientRecords.deploy(await VitalChainCore.getAddress());
    await patientRecords.waitForDeployment();

    // Setup: Register entities
    await VitalChainCore.registerHospital(hospital.address, "City Hospital", "HOSP-001");
    await VitalChainCore.registerDoctor(doctor.address, "Dr. Smith", "MD-001", hospital.address);
    await VitalChainCore.connect(patient).registerPatient();
  });

  describe("Adding Records", function () {
    it("Should allow patient to add their own record", async function () {
      await patientRecords.connect(patient).addRecord(
        "QmTestHash123",
        1, // LAB_RESULTS
        '{"test": "blood work"}',
        hospital.address
      );

      const count = await patientRecords.getPatientRecordCount(patient.address);
      expect(count).to.equal(1);
    });

    it("Should emit RecordAdded event", async function () {
      await expect(patientRecords.connect(patient).addRecord(
        "QmTestHash123",
        1,
        '{"test": "blood work"}',
        hospital.address
      ))
        .to.emit(patientRecords, "RecordAdded")
        .withArgs(patient.address, 0, 1, hospital.address);
    });

    it("Should store record correctly", async function () {
      await patientRecords.connect(patient).addRecord(
        "QmTestHash123",
        2, // IMAGING
        '{"type": "X-Ray"}',
        hospital.address
      );

      const record = await patientRecords.getRecordByIndex(patient.address, 0);
      expect(record.ipfsHash).to.equal("QmTestHash123");
      expect(record.recordType).to.equal(2);
      expect(record.sourceProvider).to.equal(hospital.address);
      expect(record.isActive).to.be.true;
    });
  });

  describe("Deactivating Records", function () {
    beforeEach(async function () {
      await patientRecords.connect(patient).addRecord(
        "QmTestHash123",
        1,
        '{"test": "data"}',
        hospital.address
      );
    });

    it("Should allow patient to deactivate their record", async function () {
      await patientRecords.connect(patient).deactivateRecord(0);
      
      const record = await patientRecords.getRecordByIndex(patient.address, 0);
      expect(record.isActive).to.be.false;
    });

    it("Should emit RecordDeactivated event", async function () {
      await expect(patientRecords.connect(patient).deactivateRecord(0))
        .to.emit(patientRecords, "RecordDeactivated")
        .withArgs(patient.address, 0);
    });
  });
});

describe("AccessControlManager", function () {
  let VitalChainCore, accessControl;
  let owner, hospital, doctor, patient;

  beforeEach(async function () {
    [owner, hospital, doctor, patient] = await ethers.getSigners();
    
    const VitalChainCore = await ethers.getContractFactory("VitalChainCore");
    VitalChainCore = await VitalChainCore.deploy();
    await VitalChainCore.waitForDeployment();

    const AccessControlManager = await ethers.getContractFactory("AccessControlManager");
    accessControl = await AccessControlManager.deploy(await VitalChainCore.getAddress());
    await accessControl.waitForDeployment();

    // Setup
    await VitalChainCore.registerHospital(hospital.address, "City Hospital", "HOSP-001");
    await VitalChainCore.registerDoctor(doctor.address, "Dr. Smith", "MD-001", hospital.address);
    await VitalChainCore.connect(patient).registerPatient();
  });

  describe("Access Requests", function () {
    it("Should allow doctor to request access", async function () {
      await accessControl.connect(doctor).requestAccess(
        patient.address,
        30,
        "Treatment follow-up"
      );

      const requests = await accessControl.getPendingRequests(patient.address);
      expect(requests).to.include(doctor.address);
    });

    it("Should emit AccessRequested event", async function () {
      await expect(accessControl.connect(doctor).requestAccess(
        patient.address,
        30,
        "Treatment follow-up"
      ))
        .to.emit(accessControl, "AccessRequested")
        .withArgs(patient.address, doctor.address, "Treatment follow-up");
    });
  });

  describe("Access Grants", function () {
    beforeEach(async function () {
      await accessControl.connect(doctor).requestAccess(
        patient.address,
        30,
        "Treatment"
      );
    });

    it("Should allow patient to approve access", async function () {
      await accessControl.connect(patient).approveAccess(doctor.address, 30);
      
      expect(await accessControl.hasAccess(patient.address, doctor.address)).to.be.true;
    });

    it("Should emit AccessGranted event", async function () {
      await expect(accessControl.connect(patient).approveAccess(doctor.address, 30))
        .to.emit(accessControl, "AccessGranted");
    });

    it("Should set correct expiry time", async function () {
      await accessControl.connect(patient).approveAccess(doctor.address, 30);
      
      const grant = await accessControl.getAccessGrant(patient.address, doctor.address);
      const expectedExpiry = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
      
      // Allow 60 second tolerance
      expect(Number(grant.expiresAt)).to.be.closeTo(expectedExpiry, 60);
    });
  });

  describe("Access Revocation", function () {
    beforeEach(async function () {
      await accessControl.connect(doctor).requestAccess(patient.address, 30, "Treatment");
      await accessControl.connect(patient).approveAccess(doctor.address, 30);
    });

    it("Should allow patient to revoke access", async function () {
      await accessControl.connect(patient).revokeAccess(doctor.address);
      
      expect(await accessControl.hasAccess(patient.address, doctor.address)).to.be.false;
    });

    it("Should emit AccessRevoked event", async function () {
      await expect(accessControl.connect(patient).revokeAccess(doctor.address))
        .to.emit(accessControl, "AccessRevoked")
        .withArgs(patient.address, doctor.address);
    });
  });
});

describe("AuditLog", function () {
  let VitalChainCore, auditLog;
  let owner, hospital, doctor, patient;

  beforeEach(async function () {
    [owner, hospital, doctor, patient] = await ethers.getSigners();
    
    const VitalChainCore = await ethers.getContractFactory("VitalChainCore");
    VitalChainCore = await VitalChainCore.deploy();
    await VitalChainCore.waitForDeployment();

    const AuditLog = await ethers.getContractFactory("AuditLog");
    auditLog = await AuditLog.deploy(await VitalChainCore.getAddress());
    await auditLog.waitForDeployment();

    // Setup
    await VitalChainCore.registerHospital(hospital.address, "City Hospital", "HOSP-001");
    await VitalChainCore.registerDoctor(doctor.address, "Dr. Smith", "MD-001", hospital.address);
    await VitalChainCore.connect(patient).registerPatient();
  });

  describe("Logging Access", function () {
    it("Should log access events", async function () {
      await auditLog.connect(doctor).logAccess(
        patient.address,
        0, // VIEW
        "Viewed lab results"
      );

      const count = await auditLog.getPatientAuditLogCount(patient.address);
      expect(count).to.equal(1);
    });

    it("Should emit AccessLogged event", async function () {
      await expect(auditLog.connect(doctor).logAccess(
        patient.address,
        0,
        "Viewed records"
      ))
        .to.emit(auditLog, "AccessLogged")
        .withArgs(patient.address, doctor.address, 0);
    });

    it("Should store audit entry correctly", async function () {
      await auditLog.connect(doctor).logAccess(
        patient.address,
        1, // DOWNLOAD
        "Downloaded X-Ray"
      );

      const entry = await auditLog.getAuditLogByIndex(patient.address, 0);
      expect(entry.accessor).to.equal(doctor.address);
      expect(entry.accessType).to.equal(1);
      expect(entry.details).to.equal("Downloaded X-Ray");
      expect(entry.isFlagged).to.be.false;
    });
  });

  describe("Flagging Entries", function () {
    beforeEach(async function () {
      await auditLog.connect(doctor).logAccess(
        patient.address,
        0,
        "Viewed records"
      );
    });

    it("Should allow flagging suspicious entries", async function () {
      await auditLog.flagAuditEntry(patient.address, 0, "Unusual access pattern");
      
      const entry = await auditLog.getAuditLogByIndex(patient.address, 0);
      expect(entry.isFlagged).to.be.true;
    });

    it("Should emit AuditEntryFlagged event", async function () {
      await expect(auditLog.flagAuditEntry(patient.address, 0, "Suspicious"))
        .to.emit(auditLog, "AuditEntryFlagged")
        .withArgs(patient.address, 0, "Suspicious");
    });
  });
});

describe("EmergencyAccess", function () {
  let VitalChainCore, emergencyAccess;
  let owner, hospital, doctor, patient;

  beforeEach(async function () {
    [owner, hospital, doctor, patient] = await ethers.getSigners();
    
    const VitalChainCore = await ethers.getContractFactory("VitalChainCore");
    VitalChainCore = await VitalChainCore.deploy();
    await VitalChainCore.waitForDeployment();

    const EmergencyAccess = await ethers.getContractFactory("EmergencyAccess");
    emergencyAccess = await EmergencyAccess.deploy(await VitalChainCore.getAddress());
    await emergencyAccess.waitForDeployment();

    // Setup
    await VitalChainCore.registerHospital(hospital.address, "City Hospital", "HOSP-001");
    await VitalChainCore.registerDoctor(doctor.address, "Dr. Smith", "MD-001", hospital.address);
    await VitalChainCore.connect(patient).registerPatient();
  });

  describe("Starting Emergency Sessions", function () {
    it("Should allow doctor to start emergency session", async function () {
      await emergencyAccess.connect(doctor).startEmergencySession(
        patient.address,
        "Cardiac arrest",
        "Emergency Room A"
      );

      expect(await emergencyAccess.hasActiveEmergencyAccess(doctor.address, patient.address)).to.be.true;
    });

    it("Should emit EmergencySessionStarted event", async function () {
      await expect(emergencyAccess.connect(doctor).startEmergencySession(
        patient.address,
        "Cardiac arrest",
        "Emergency Room A"
      ))
        .to.emit(emergencyAccess, "EmergencySessionStarted");
    });

    it("Should store session details correctly", async function () {
      await emergencyAccess.connect(doctor).startEmergencySession(
        patient.address,
        "Severe allergic reaction",
        "ICU"
      );

      const session = await emergencyAccess.getActiveSession(doctor.address);
      expect(session.patient).to.equal(patient.address);
      expect(session.doctor).to.equal(doctor.address);
      expect(session.reason).to.equal("Severe allergic reaction");
      expect(session.location).to.equal("ICU");
      expect(session.isActive).to.be.true;
    });
  });

  describe("Ending Emergency Sessions", function () {
    beforeEach(async function () {
      await emergencyAccess.connect(doctor).startEmergencySession(
        patient.address,
        "Emergency",
        "ER"
      );
    });

    it("Should allow doctor to end their session", async function () {
      await emergencyAccess.connect(doctor).endEmergencySession();
      
      expect(await emergencyAccess.hasActiveEmergencyAccess(doctor.address, patient.address)).to.be.false;
    });

    it("Should emit EmergencySessionEnded event", async function () {
      await expect(emergencyAccess.connect(doctor).endEmergencySession())
        .to.emit(emergencyAccess, "EmergencySessionEnded");
    });
  });
});

describe("InsuranceClaims", function () {
  let VitalChainCore, insuranceClaims;
  let owner, insurance, patient;

  beforeEach(async function () {
    [owner, insurance, patient] = await ethers.getSigners();
    
    const VitalChainCore = await ethers.getContractFactory("VitalChainCore");
    VitalChainCore = await VitalChainCore.deploy();
    await VitalChainCore.waitForDeployment();

    const InsuranceClaims = await ethers.getContractFactory("InsuranceClaims");
    insuranceClaims = await InsuranceClaims.deploy(await VitalChainCore.getAddress());
    await insuranceClaims.waitForDeployment();

    // Setup
    await VitalChainCore.registerInsuranceProvider(insurance.address, "HealthFirst", "INS-001");
    await VitalChainCore.connect(patient).registerPatient();
  });

  describe("Policy Registration", function () {
    it("Should allow insurance to register a policy", async function () {
      await insuranceClaims.connect(insurance).registerPolicy(
        patient.address,
        ethers.parseEther("100000"), // coverage
        ethers.parseEther("500"),    // premium
        365                          // days
      );

      const policy = await insuranceClaims.getPolicy(patient.address, insurance.address);
      expect(policy.isActive).to.be.true;
      expect(policy.coverageAmount).to.equal(ethers.parseEther("100000"));
    });

    it("Should emit PolicyRegistered event", async function () {
      await expect(insuranceClaims.connect(insurance).registerPolicy(
        patient.address,
        ethers.parseEther("100000"),
        ethers.parseEther("500"),
        365
      ))
        .to.emit(insuranceClaims, "PolicyRegistered")
        .withArgs(patient.address, insurance.address, ethers.parseEther("100000"));
    });
  });

  describe("Claim Submission", function () {
    beforeEach(async function () {
      await insuranceClaims.connect(insurance).registerPolicy(
        patient.address,
        ethers.parseEther("100000"),
        ethers.parseEther("500"),
        365
      );
    });

    it("Should allow patient to submit a claim", async function () {
      await insuranceClaims.connect(patient).submitClaim(
        patient.address,
        ethers.parseEther("2500"),
        0, // HOSPITALIZATION
        "Emergency room visit",
        "QmDocumentsHash"
      );

      const claimCount = await insuranceClaims.getClaimCount();
      expect(claimCount).to.equal(1);
    });

    it("Should emit ClaimSubmitted event", async function () {
      await expect(insuranceClaims.connect(patient).submitClaim(
        patient.address,
        ethers.parseEther("2500"),
        1, // SURGERY
        "Appendectomy",
        "QmDocs"
      ))
        .to.emit(insuranceClaims, "ClaimSubmitted");
    });
  });

  describe("Claim Processing", function () {
    beforeEach(async function () {
      await insuranceClaims.connect(insurance).registerPolicy(
        patient.address,
        ethers.parseEther("100000"),
        ethers.parseEther("500"),
        365
      );
      await insuranceClaims.connect(patient).submitClaim(
        patient.address,
        ethers.parseEther("5000"),
        0,
        "Hospital stay",
        "QmDocs"
      );
    });

    it("Should allow insurance to approve claim", async function () {
      await insuranceClaims.connect(insurance).approveClaim(0, "Verified and approved");
      
      const claim = await insuranceClaims.getClaim(0);
      expect(claim.status).to.equal(2); // APPROVED
    });

    it("Should emit ClaimApproved event", async function () {
      await expect(insuranceClaims.connect(insurance).approveClaim(0, "Approved"))
        .to.emit(insuranceClaims, "ClaimApproved")
        .withArgs(0, "Approved");
    });

    it("Should allow insurance to reject claim", async function () {
      await insuranceClaims.connect(insurance).rejectClaim(0, "Insufficient documentation");
      
      const claim = await insuranceClaims.getClaim(0);
      expect(claim.status).to.equal(3); // REJECTED
    });

    it("Should emit ClaimRejected event", async function () {
      await expect(insuranceClaims.connect(insurance).rejectClaim(0, "Invalid"))
        .to.emit(insuranceClaims, "ClaimRejected")
        .withArgs(0, "Invalid");
    });
  });
});
