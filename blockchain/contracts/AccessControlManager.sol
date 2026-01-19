// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MedChainCore.sol";
import "./PatientRecords.sol";

/**
 * @title AccessControl
 * @dev Manages patient-controlled access to medical records with consent management
 */
contract AccessControlManager is ReentrancyGuard {
    MedChainCore public medChainCore;
    PatientRecords public patientRecords;

    enum AccessLevel { 
        NONE, 
        VIEW_ONLY, 
        VIEW_AND_DOWNLOAD, 
        FULL_ACCESS 
    }

    enum ConsentStatus { 
        PENDING, 
        APPROVED, 
        REJECTED, 
        EXPIRED, 
        REVOKED 
    }

    struct AccessGrant {
        uint256 id;
        address patient;
        address grantee;
        uint256[] recordIds;        // Empty array means all records
        AccessLevel accessLevel;
        uint256 grantedAt;
        uint256 expiresAt;
        bool isActive;
        string purpose;
    }

    struct ConsentRequest {
        uint256 id;
        address requester;
        address patient;
        uint256[] recordIds;
        AccessLevel requestedLevel;
        string purpose;
        string institutionName;
        ConsentStatus status;
        uint256 requestedAt;
        uint256 respondedAt;
        uint256 validityPeriod;     // In seconds
    }

    // Patient => Grantee => AccessGrant
    mapping(address => mapping(address => AccessGrant)) public accessGrants;
    // Request ID => ConsentRequest
    mapping(uint256 => ConsentRequest) public consentRequests;
    // Patient => Request IDs
    mapping(address => uint256[]) public patientConsentRequests;
    // Requester => Request IDs
    mapping(address => uint256[]) public requesterConsentRequests;
    // Patient => All granted addresses
    mapping(address => address[]) public patientGrantees;

    uint256 private grantCounter;
    uint256 private requestCounter;

    event AccessGranted(
        uint256 indexed grantId,
        address indexed patient,
        address indexed grantee,
        AccessLevel accessLevel,
        uint256 expiresAt
    );

    event AccessRevoked(
        uint256 indexed grantId,
        address indexed patient,
        address indexed grantee,
        uint256 timestamp
    );

    event ConsentRequested(
        uint256 indexed requestId,
        address indexed requester,
        address indexed patient,
        AccessLevel requestedLevel,
        string purpose
    );

    event ConsentApproved(
        uint256 indexed requestId,
        address indexed patient,
        address indexed requester,
        uint256 timestamp
    );

    event ConsentRejected(
        uint256 indexed requestId,
        address indexed patient,
        address indexed requester,
        uint256 timestamp
    );

    modifier onlyRegisteredPatient() {
        require(medChainCore.isRegisteredPatient(msg.sender), "Not a registered patient");
        _;
    }

    modifier onlyAuthorizedRequester() {
        require(
            medChainCore.hasRole(medChainCore.DOCTOR_ROLE(), msg.sender) ||
            medChainCore.hasRole(medChainCore.LAB_ROLE(), msg.sender) ||
            medChainCore.hasRole(medChainCore.HOSPITAL_ROLE(), msg.sender) ||
            medChainCore.hasRole(medChainCore.INSURANCE_ROLE(), msg.sender),
            "Not authorized to request access"
        );
        _;
    }

    constructor(address _medChainCoreAddress, address _patientRecordsAddress) {
        medChainCore = MedChainCore(_medChainCoreAddress);
        patientRecords = PatientRecords(_patientRecordsAddress);
    }

    /**
     * @dev Patient directly grants access to an entity
     */
    function grantAccess(
        address _grantee,
        uint256[] memory _recordIds,
        AccessLevel _accessLevel,
        uint256 _validityPeriod,
        string memory _purpose
    ) external onlyRegisteredPatient nonReentrant returns (uint256) {
        require(_accessLevel != AccessLevel.NONE, "Invalid access level");
        require(_validityPeriod > 0, "Validity period must be positive");

        grantCounter++;
        uint256 expiresAt = block.timestamp + _validityPeriod;

        accessGrants[msg.sender][_grantee] = AccessGrant({
            id: grantCounter,
            patient: msg.sender,
            grantee: _grantee,
            recordIds: _recordIds,
            accessLevel: _accessLevel,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true,
            purpose: _purpose
        });

        // Add to grantees list if not already present
        bool found = false;
        for (uint i = 0; i < patientGrantees[msg.sender].length; i++) {
            if (patientGrantees[msg.sender][i] == _grantee) {
                found = true;
                break;
            }
        }
        if (!found) {
            patientGrantees[msg.sender].push(_grantee);
        }

        emit AccessGranted(grantCounter, msg.sender, _grantee, _accessLevel, expiresAt);

        return grantCounter;
    }

    /**
     * @dev Patient revokes access from an entity
     */
    function revokeAccess(address _grantee) external onlyRegisteredPatient {
        AccessGrant storage grant = accessGrants[msg.sender][_grantee];
        require(grant.isActive, "No active access grant");

        grant.isActive = false;

        emit AccessRevoked(grant.id, msg.sender, _grantee, block.timestamp);
    }

    /**
     * @dev Healthcare provider requests consent from patient
     */
    function requestConsent(
        address _patient,
        uint256[] memory _recordIds,
        AccessLevel _requestedLevel,
        string memory _purpose,
        string memory _institutionName,
        uint256 _validityPeriod
    ) external onlyAuthorizedRequester nonReentrant returns (uint256) {
        require(medChainCore.isRegisteredPatient(_patient), "Patient not registered");
        require(_requestedLevel != AccessLevel.NONE, "Invalid access level");

        requestCounter++;

        consentRequests[requestCounter] = ConsentRequest({
            id: requestCounter,
            requester: msg.sender,
            patient: _patient,
            recordIds: _recordIds,
            requestedLevel: _requestedLevel,
            purpose: _purpose,
            institutionName: _institutionName,
            status: ConsentStatus.PENDING,
            requestedAt: block.timestamp,
            respondedAt: 0,
            validityPeriod: _validityPeriod
        });

        patientConsentRequests[_patient].push(requestCounter);
        requesterConsentRequests[msg.sender].push(requestCounter);

        emit ConsentRequested(requestCounter, msg.sender, _patient, _requestedLevel, _purpose);

        return requestCounter;
    }

    /**
     * @dev Patient approves a consent request
     */
    function approveConsent(uint256 _requestId) external onlyRegisteredPatient nonReentrant {
        ConsentRequest storage request = consentRequests[_requestId];
        require(request.patient == msg.sender, "Not your consent request");
        require(request.status == ConsentStatus.PENDING, "Request not pending");

        request.status = ConsentStatus.APPROVED;
        request.respondedAt = block.timestamp;

        // Create access grant
        grantCounter++;
        uint256 expiresAt = block.timestamp + request.validityPeriod;

        accessGrants[msg.sender][request.requester] = AccessGrant({
            id: grantCounter,
            patient: msg.sender,
            grantee: request.requester,
            recordIds: request.recordIds,
            accessLevel: request.requestedLevel,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true,
            purpose: request.purpose
        });

        patientGrantees[msg.sender].push(request.requester);

        emit ConsentApproved(_requestId, msg.sender, request.requester, block.timestamp);
        emit AccessGranted(grantCounter, msg.sender, request.requester, request.requestedLevel, expiresAt);
    }

    /**
     * @dev Patient rejects a consent request
     */
    function rejectConsent(uint256 _requestId) external onlyRegisteredPatient {
        ConsentRequest storage request = consentRequests[_requestId];
        require(request.patient == msg.sender, "Not your consent request");
        require(request.status == ConsentStatus.PENDING, "Request not pending");

        request.status = ConsentStatus.REJECTED;
        request.respondedAt = block.timestamp;

        emit ConsentRejected(_requestId, msg.sender, request.requester, block.timestamp);
    }

    // ============ Access Check Functions ============

    /**
     * @dev Check if an entity has access to a patient's records
     */
    function hasAccess(
        address _patient,
        address _accessor,
        uint256 _recordId
    ) external view returns (bool, AccessLevel) {
        AccessGrant storage grant = accessGrants[_patient][_accessor];
        
        if (!grant.isActive || block.timestamp > grant.expiresAt) {
            return (false, AccessLevel.NONE);
        }

        // If recordIds is empty, access to all records is granted
        if (grant.recordIds.length == 0) {
            return (true, grant.accessLevel);
        }

        // Check if specific record is in the granted list
        for (uint i = 0; i < grant.recordIds.length; i++) {
            if (grant.recordIds[i] == _recordId) {
                return (true, grant.accessLevel);
            }
        }

        return (false, AccessLevel.NONE);
    }

    /**
     * @dev Check if accessor has any valid access to patient records
     */
    function hasAnyAccess(address _patient, address _accessor) external view returns (bool) {
        AccessGrant storage grant = accessGrants[_patient][_accessor];
        return grant.isActive && block.timestamp <= grant.expiresAt;
    }

    // ============ View Functions ============

    function getAccessGrant(address _patient, address _grantee) external view returns (
        uint256 id,
        address patient,
        address grantee,
        uint256[] memory recordIds,
        AccessLevel accessLevel,
        uint256 grantedAt,
        uint256 expiresAt,
        bool isActive,
        string memory purpose
    ) {
        AccessGrant storage grant = accessGrants[_patient][_grantee];
        return (
            grant.id,
            grant.patient,
            grant.grantee,
            grant.recordIds,
            grant.accessLevel,
            grant.grantedAt,
            grant.expiresAt,
            grant.isActive,
            grant.purpose
        );
    }

    function getConsentRequest(uint256 _requestId) external view returns (
        uint256 id,
        address requester,
        address patient,
        uint256[] memory recordIds,
        AccessLevel requestedLevel,
        string memory purpose,
        string memory institutionName,
        ConsentStatus status,
        uint256 requestedAt,
        uint256 respondedAt
    ) {
        ConsentRequest storage request = consentRequests[_requestId];
        return (
            request.id,
            request.requester,
            request.patient,
            request.recordIds,
            request.requestedLevel,
            request.purpose,
            request.institutionName,
            request.status,
            request.requestedAt,
            request.respondedAt
        );
    }

    function getPatientConsentRequestIds(address _patient) external view returns (uint256[] memory) {
        return patientConsentRequests[_patient];
    }

    function getRequesterConsentRequestIds(address _requester) external view returns (uint256[] memory) {
        return requesterConsentRequests[_requester];
    }

    function getPatientGrantees(address _patient) external view returns (address[] memory) {
        return patientGrantees[_patient];
    }
}
