// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VitalChainCore.sol";
import "./PatientRecords.sol";
import "./AccessControlManager.sol";
import "./AuditLog.sol";

/**
 * @title InsuranceClaims
 * @dev Automates insurance claim processing through smart contracts
 */
contract InsuranceClaims is ReentrancyGuard {
    VitalChainCore public VitalChainCore;
    PatientRecords public patientRecords;
    AccessControlManager public accessControl;
    AuditLog public auditLog;

    enum ClaimStatus {
        DRAFT,
        SUBMITTED,
        PENDING_DOCUMENTS,
        UNDER_REVIEW,
        APPROVED,
        PARTIALLY_APPROVED,
        REJECTED,
        APPEALED,
        SETTLED,
        CLOSED
    }

    enum ClaimType {
        HOSPITALIZATION,
        OUTPATIENT,
        SURGERY,
        MEDICATION,
        DIAGNOSTIC,
        MATERNITY,
        DENTAL,
        VISION,
        MENTAL_HEALTH,
        OTHER
    }

    struct InsuranceClaim {
        uint256 id;
        address patient;
        address insuranceProvider;
        string policyNumber;
        ClaimType claimType;
        ClaimStatus status;
        uint256 claimAmount;
        uint256 approvedAmount;
        uint256[] recordIds;
        string hospitalName;
        string diagnosisCode;
        string treatmentDescription;
        uint256 treatmentDate;
        uint256 submittedAt;
        uint256 processedAt;
        string rejectionReason;
        string notes;
    }

    struct ClaimDocument {
        uint256 id;
        uint256 claimId;
        string documentType;
        string ipfsHash;
        string encryptedKey;
        uint256 uploadedAt;
        bool isVerified;
        address verifiedBy;
    }

    struct InsurancePolicy {
        string policyNumber;
        address patient;
        address insuranceProvider;
        uint256 coverageLimit;
        uint256 usedAmount;
        uint256 deductible;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        string[] coveredProcedures;
    }

    // Claim ID => InsuranceClaim
    mapping(uint256 => InsuranceClaim) public claims;
    // Patient => Claim IDs
    mapping(address => uint256[]) public patientClaims;
    // Insurance Provider => Claim IDs
    mapping(address => uint256[]) public providerClaims;
    // Policy Number => InsurancePolicy
    mapping(string => InsurancePolicy) public policies;
    // Patient => Policy Numbers
    mapping(address => string[]) public patientPolicies;
    // Claim ID => Document IDs
    mapping(uint256 => uint256[]) public claimDocuments;
    // Document ID => ClaimDocument
    mapping(uint256 => ClaimDocument) public documents;

    uint256 private claimCounter;
    uint256 private documentCounter;

    // Auto-approval settings per insurance provider
    mapping(address => uint256) public autoApprovalLimit;
    mapping(address => bool) public autoApprovalEnabled;

    event ClaimCreated(
        uint256 indexed claimId,
        address indexed patient,
        address indexed insuranceProvider,
        ClaimType claimType,
        uint256 amount
    );

    event ClaimSubmitted(
        uint256 indexed claimId,
        address indexed patient,
        uint256 timestamp
    );

    event ClaimStatusUpdated(
        uint256 indexed claimId,
        ClaimStatus oldStatus,
        ClaimStatus newStatus,
        uint256 timestamp
    );

    event ClaimApproved(
        uint256 indexed claimId,
        uint256 approvedAmount,
        uint256 timestamp
    );

    event ClaimRejected(
        uint256 indexed claimId,
        string reason,
        uint256 timestamp
    );

    event ClaimSettled(
        uint256 indexed claimId,
        uint256 settledAmount,
        uint256 timestamp
    );

    event DocumentUploaded(
        uint256 indexed documentId,
        uint256 indexed claimId,
        string documentType,
        uint256 timestamp
    );

    event PolicyRegistered(
        string indexed policyNumber,
        address indexed patient,
        address indexed insuranceProvider
    );

    modifier onlyRegisteredPatient() {
        require(VitalChainCore.isRegisteredPatient(msg.sender), "Not a registered patient");
        _;
    }

    modifier onlyInsuranceProvider() {
        require(
            VitalChainCore.hasRole(VitalChainCore.INSURANCE_ROLE(), msg.sender),
            "Not an insurance provider"
        );
        _;
    }

    modifier onlyClaimParticipant(uint256 _claimId) {
        InsuranceClaim storage claim = claims[_claimId];
        require(
            claim.patient == msg.sender || claim.insuranceProvider == msg.sender,
            "Not a participant in this claim"
        );
        _;
    }

    constructor(
        address _VitalChainCoreAddress,
        address _patientRecordsAddress,
        address _accessControlAddress,
        address _auditLogAddress
    ) {
        VitalChainCore = VitalChainCore(_VitalChainCoreAddress);
        patientRecords = PatientRecords(_patientRecordsAddress);
        accessControl = AccessControlManager(_accessControlAddress);
        auditLog = AuditLog(_auditLogAddress);
    }

    // ============ Policy Management ============

    /**
     * @dev Register a new insurance policy
     */
    function registerPolicy(
        string memory _policyNumber,
        address _patient,
        uint256 _coverageLimit,
        uint256 _deductible,
        uint256 _startDate,
        uint256 _endDate,
        string[] memory _coveredProcedures
    ) external onlyInsuranceProvider nonReentrant {
        require(bytes(policies[_policyNumber].policyNumber).length == 0, "Policy already exists");
        require(VitalChainCore.isRegisteredPatient(_patient), "Patient not registered");

        policies[_policyNumber] = InsurancePolicy({
            policyNumber: _policyNumber,
            patient: _patient,
            insuranceProvider: msg.sender,
            coverageLimit: _coverageLimit,
            usedAmount: 0,
            deductible: _deductible,
            startDate: _startDate,
            endDate: _endDate,
            isActive: true,
            coveredProcedures: _coveredProcedures
        });

        patientPolicies[_patient].push(_policyNumber);

        emit PolicyRegistered(_policyNumber, _patient, msg.sender);
    }

    // ============ Claim Management ============

    /**
     * @dev Create a new insurance claim
     */
    function createClaim(
        string memory _policyNumber,
        ClaimType _claimType,
        uint256 _claimAmount,
        uint256[] memory _recordIds,
        string memory _hospitalName,
        string memory _diagnosisCode,
        string memory _treatmentDescription,
        uint256 _treatmentDate
    ) external onlyRegisteredPatient nonReentrant returns (uint256) {
        InsurancePolicy storage policy = policies[_policyNumber];
        require(policy.patient == msg.sender, "Not your policy");
        require(policy.isActive, "Policy not active");
        require(block.timestamp >= policy.startDate && block.timestamp <= policy.endDate, "Policy not in valid period");

        claimCounter++;

        claims[claimCounter] = InsuranceClaim({
            id: claimCounter,
            patient: msg.sender,
            insuranceProvider: policy.insuranceProvider,
            policyNumber: _policyNumber,
            claimType: _claimType,
            status: ClaimStatus.DRAFT,
            claimAmount: _claimAmount,
            approvedAmount: 0,
            recordIds: _recordIds,
            hospitalName: _hospitalName,
            diagnosisCode: _diagnosisCode,
            treatmentDescription: _treatmentDescription,
            treatmentDate: _treatmentDate,
            submittedAt: 0,
            processedAt: 0,
            rejectionReason: "",
            notes: ""
        });

        patientClaims[msg.sender].push(claimCounter);
        providerClaims[policy.insuranceProvider].push(claimCounter);

        emit ClaimCreated(claimCounter, msg.sender, policy.insuranceProvider, _claimType, _claimAmount);

        return claimCounter;
    }

    /**
     * @dev Submit a claim for processing
     */
    function submitClaim(uint256 _claimId) external onlyRegisteredPatient nonReentrant {
        InsuranceClaim storage claim = claims[_claimId];
        require(claim.patient == msg.sender, "Not your claim");
        require(claim.status == ClaimStatus.DRAFT || claim.status == ClaimStatus.PENDING_DOCUMENTS, "Cannot submit");

        ClaimStatus oldStatus = claim.status;
        claim.status = ClaimStatus.SUBMITTED;
        claim.submittedAt = block.timestamp;

        emit ClaimSubmitted(_claimId, msg.sender, block.timestamp);
        emit ClaimStatusUpdated(_claimId, oldStatus, ClaimStatus.SUBMITTED, block.timestamp);

        // Auto-approve if enabled and under limit
        if (autoApprovalEnabled[claim.insuranceProvider] && 
            claim.claimAmount <= autoApprovalLimit[claim.insuranceProvider]) {
            _approveClaim(_claimId, claim.claimAmount, "Auto-approved");
        }
    }

    /**
     * @dev Upload supporting document for a claim
     */
    function uploadDocument(
        uint256 _claimId,
        string memory _documentType,
        string memory _ipfsHash,
        string memory _encryptedKey
    ) external nonReentrant returns (uint256) {
        InsuranceClaim storage claim = claims[_claimId];
        require(
            claim.patient == msg.sender ||
            VitalChainCore.hasRole(VitalChainCore.DOCTOR_ROLE(), msg.sender) ||
            VitalChainCore.hasRole(VitalChainCore.HOSPITAL_ROLE(), msg.sender),
            "Not authorized"
        );

        documentCounter++;

        documents[documentCounter] = ClaimDocument({
            id: documentCounter,
            claimId: _claimId,
            documentType: _documentType,
            ipfsHash: _ipfsHash,
            encryptedKey: _encryptedKey,
            uploadedAt: block.timestamp,
            isVerified: false,
            verifiedBy: address(0)
        });

        claimDocuments[_claimId].push(documentCounter);

        emit DocumentUploaded(documentCounter, _claimId, _documentType, block.timestamp);

        return documentCounter;
    }

    /**
     * @dev Insurance provider reviews and updates claim status
     */
    function updateClaimStatus(
        uint256 _claimId,
        ClaimStatus _newStatus,
        string memory _notes
    ) external onlyInsuranceProvider {
        InsuranceClaim storage claim = claims[_claimId];
        require(claim.insuranceProvider == msg.sender, "Not your claim to process");

        ClaimStatus oldStatus = claim.status;
        claim.status = _newStatus;
        claim.notes = _notes;

        emit ClaimStatusUpdated(_claimId, oldStatus, _newStatus, block.timestamp);
    }

    /**
     * @dev Approve a claim
     */
    function approveClaim(
        uint256 _claimId,
        uint256 _approvedAmount,
        string memory _notes
    ) external onlyInsuranceProvider {
        InsuranceClaim storage claim = claims[_claimId];
        require(claim.insuranceProvider == msg.sender, "Not your claim to approve");
        require(claim.status == ClaimStatus.SUBMITTED || claim.status == ClaimStatus.UNDER_REVIEW, "Cannot approve");

        _approveClaim(_claimId, _approvedAmount, _notes);
    }

    function _approveClaim(uint256 _claimId, uint256 _approvedAmount, string memory _notes) internal {
        InsuranceClaim storage claim = claims[_claimId];
        InsurancePolicy storage policy = policies[claim.policyNumber];

        ClaimStatus oldStatus = claim.status;
        claim.approvedAmount = _approvedAmount;
        claim.processedAt = block.timestamp;
        claim.notes = _notes;

        if (_approvedAmount == claim.claimAmount) {
            claim.status = ClaimStatus.APPROVED;
        } else if (_approvedAmount > 0) {
            claim.status = ClaimStatus.PARTIALLY_APPROVED;
        }

        // Update policy used amount
        policy.usedAmount += _approvedAmount;

        emit ClaimStatusUpdated(_claimId, oldStatus, claim.status, block.timestamp);
        emit ClaimApproved(_claimId, _approvedAmount, block.timestamp);
    }

    /**
     * @dev Reject a claim
     */
    function rejectClaim(
        uint256 _claimId,
        string memory _reason
    ) external onlyInsuranceProvider {
        InsuranceClaim storage claim = claims[_claimId];
        require(claim.insuranceProvider == msg.sender, "Not your claim to reject");
        require(claim.status == ClaimStatus.SUBMITTED || claim.status == ClaimStatus.UNDER_REVIEW, "Cannot reject");

        ClaimStatus oldStatus = claim.status;
        claim.status = ClaimStatus.REJECTED;
        claim.rejectionReason = _reason;
        claim.processedAt = block.timestamp;

        emit ClaimStatusUpdated(_claimId, oldStatus, ClaimStatus.REJECTED, block.timestamp);
        emit ClaimRejected(_claimId, _reason, block.timestamp);
    }

    /**
     * @dev Settle an approved claim
     */
    function settleClaim(uint256 _claimId) external onlyInsuranceProvider {
        InsuranceClaim storage claim = claims[_claimId];
        require(claim.insuranceProvider == msg.sender, "Not your claim");
        require(
            claim.status == ClaimStatus.APPROVED || claim.status == ClaimStatus.PARTIALLY_APPROVED,
            "Claim not approved"
        );

        ClaimStatus oldStatus = claim.status;
        claim.status = ClaimStatus.SETTLED;

        // Log the settlement
        auditLog.logAccess(
            claim.patient,
            claim.recordIds.length > 0 ? claim.recordIds[0] : 0,
            AuditLog.AccessType.INSURANCE_CLAIM,
            "Insurance Settlement",
            "Insurance Provider",
            "",
            "",
            ""
        );

        emit ClaimStatusUpdated(_claimId, oldStatus, ClaimStatus.SETTLED, block.timestamp);
        emit ClaimSettled(_claimId, claim.approvedAmount, block.timestamp);
    }

    /**
     * @dev Patient appeals a rejected claim
     */
    function appealClaim(uint256 _claimId, string memory _appealReason) external onlyRegisteredPatient {
        InsuranceClaim storage claim = claims[_claimId];
        require(claim.patient == msg.sender, "Not your claim");
        require(claim.status == ClaimStatus.REJECTED, "Can only appeal rejected claims");

        ClaimStatus oldStatus = claim.status;
        claim.status = ClaimStatus.APPEALED;
        claim.notes = _appealReason;

        emit ClaimStatusUpdated(_claimId, oldStatus, ClaimStatus.APPEALED, block.timestamp);
    }

    /**
     * @dev Configure auto-approval settings
     */
    function configureAutoApproval(uint256 _limit, bool _enabled) external onlyInsuranceProvider {
        autoApprovalLimit[msg.sender] = _limit;
        autoApprovalEnabled[msg.sender] = _enabled;
    }

    /**
     * @dev Verify a document
     */
    function verifyDocument(uint256 _documentId) external {
        ClaimDocument storage doc = documents[_documentId];
        InsuranceClaim storage claim = claims[doc.claimId];
        
        require(
            claim.insuranceProvider == msg.sender ||
            VitalChainCore.hasRole(VitalChainCore.HOSPITAL_ROLE(), msg.sender),
            "Not authorized to verify"
        );

        doc.isVerified = true;
        doc.verifiedBy = msg.sender;
    }

    // ============ View Functions ============

    function getClaim(uint256 _claimId) external view returns (
        uint256 id,
        address patient,
        address insuranceProvider,
        string memory policyNumber,
        ClaimType claimType,
        ClaimStatus status,
        uint256 claimAmount,
        uint256 approvedAmount,
        uint256[] memory recordIds,
        string memory hospitalName,
        uint256 submittedAt,
        uint256 processedAt
    ) {
        InsuranceClaim storage claim = claims[_claimId];
        return (
            claim.id,
            claim.patient,
            claim.insuranceProvider,
            claim.policyNumber,
            claim.claimType,
            claim.status,
            claim.claimAmount,
            claim.approvedAmount,
            claim.recordIds,
            claim.hospitalName,
            claim.submittedAt,
            claim.processedAt
        );
    }

    function getClaimDetails(uint256 _claimId) external view returns (
        string memory diagnosisCode,
        string memory treatmentDescription,
        uint256 treatmentDate,
        string memory rejectionReason,
        string memory notes
    ) {
        InsuranceClaim storage claim = claims[_claimId];
        return (
            claim.diagnosisCode,
            claim.treatmentDescription,
            claim.treatmentDate,
            claim.rejectionReason,
            claim.notes
        );
    }

    function getPolicy(string memory _policyNumber) external view returns (
        address patient,
        address insuranceProvider,
        uint256 coverageLimit,
        uint256 usedAmount,
        uint256 deductible,
        uint256 startDate,
        uint256 endDate,
        bool isActive
    ) {
        InsurancePolicy storage policy = policies[_policyNumber];
        return (
            policy.patient,
            policy.insuranceProvider,
            policy.coverageLimit,
            policy.usedAmount,
            policy.deductible,
            policy.startDate,
            policy.endDate,
            policy.isActive
        );
    }

    function getPatientClaimIds(address _patient) external view returns (uint256[] memory) {
        return patientClaims[_patient];
    }

    function getProviderClaimIds(address _provider) external view returns (uint256[] memory) {
        return providerClaims[_provider];
    }

    function getPatientPolicyNumbers(address _patient) external view returns (string[] memory) {
        return patientPolicies[_patient];
    }

    function getClaimDocumentIds(uint256 _claimId) external view returns (uint256[] memory) {
        return claimDocuments[_claimId];
    }

    function getDocument(uint256 _documentId) external view returns (
        uint256 id,
        uint256 claimId,
        string memory documentType,
        string memory ipfsHash,
        uint256 uploadedAt,
        bool isVerified,
        address verifiedBy
    ) {
        ClaimDocument storage doc = documents[_documentId];
        return (
            doc.id,
            doc.claimId,
            doc.documentType,
            doc.ipfsHash,
            doc.uploadedAt,
            doc.isVerified,
            doc.verifiedBy
        );
    }

    function getTotalClaims() external view returns (uint256) {
        return claimCounter;
    }
}
