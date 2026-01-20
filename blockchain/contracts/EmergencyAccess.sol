// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VitalChainCore.sol";
import "./PatientRecords.sol";
import "./AccessControlManager.sol";
import "./AuditLog.sol";

/**
 * @title EmergencyAccess
 * @dev Handles emergency access bypass for life-threatening situations
 */
contract EmergencyAccess is ReentrancyGuard {
    VitalChainCore public vitalChainCore;
    PatientRecords public patientRecords;
    AccessControlManager public accessControl;
    AuditLog public auditLog;

    enum EmergencyStatus {
        ACTIVE,
        COMPLETED,
        FLAGGED,
        REVIEWED,
        APPROVED,
        REJECTED
    }

    struct EmergencySession {
        uint256 id;
        address doctor;
        address patient;
        string reason;
        string diagnosis;
        string doctorName;
        string hospitalName;
        uint256 startTime;
        uint256 endTime;
        uint256[] accessedRecords;
        EmergencyStatus status;
        string reviewNotes;
        address reviewedBy;
        uint256 reviewedAt;
    }

    struct EmergencyConfig {
        uint256 maxSessionDuration;     // Maximum duration of emergency access
        uint256 cooldownPeriod;         // Time before same doctor can use emergency access on same patient
        bool requiresJustification;     // Whether justification is required
        uint256 autoFlagThreshold;      // Number of emergency accesses before auto-flagging
    }

    // Session ID => EmergencySession
    mapping(uint256 => EmergencySession) public sessions;
    // Doctor => Active Session ID (0 if none)
    mapping(address => uint256) public activeSession;
    // Doctor => Patient => Last Emergency Access Time
    mapping(address => mapping(address => uint256)) public lastEmergencyAccess;
    // Patient => Emergency Session IDs
    mapping(address => uint256[]) public patientEmergencySessions;
    // Doctor => Emergency Session IDs
    mapping(address => uint256[]) public doctorEmergencySessions;
    // Doctor => Emergency Access Count
    mapping(address => uint256) public doctorEmergencyCount;

    EmergencyConfig public config;
    uint256 private sessionCounter;
    uint256[] public flaggedSessions;

    event EmergencySessionStarted(
        uint256 indexed sessionId,
        address indexed doctor,
        address indexed patient,
        string reason,
        uint256 timestamp
    );

    event EmergencySessionEnded(
        uint256 indexed sessionId,
        address indexed doctor,
        address indexed patient,
        uint256 duration,
        uint256 recordsAccessed
    );

    event EmergencyRecordAccessed(
        uint256 indexed sessionId,
        address indexed doctor,
        address indexed patient,
        uint256 recordId,
        uint256 timestamp
    );

    event EmergencySessionFlagged(
        uint256 indexed sessionId,
        address indexed flaggedBy,
        string reason,
        uint256 timestamp
    );

    event EmergencySessionReviewed(
        uint256 indexed sessionId,
        address indexed reviewedBy,
        EmergencyStatus newStatus,
        string notes,
        uint256 timestamp
    );

    modifier onlyEmergencyDoctor() {
        require(
            vitalChainCore.hasRole(vitalChainCore.EMERGENCY_ROLE(), msg.sender),
            "No emergency access rights"
        );
        _;
    }

    modifier onlyHospitalOrAdmin() {
        require(
            vitalChainCore.hasRole(vitalChainCore.HOSPITAL_ROLE(), msg.sender) ||
            vitalChainCore.hasRole(vitalChainCore.DEFAULT_ADMIN_ROLE(), msg.sender),
            "Not authorized"
        );
        _;
    }

    constructor(
        address _VitalChainCoreAddress,
        address _patientRecordsAddress,
        address _accessControlAddress,
        address _auditLogAddress
    ) {
        vitalChainCore = VitalChainCore(_VitalChainCoreAddress);
        patientRecords = PatientRecords(_patientRecordsAddress);
        accessControl = AccessControlManager(_accessControlAddress);
        auditLog = AuditLog(_auditLogAddress);

        // Default configuration
        config = EmergencyConfig({
            maxSessionDuration: 4 hours,
            cooldownPeriod: 24 hours,
            requiresJustification: true,
            autoFlagThreshold: 5
        });
    }

    /**
     * @dev Start an emergency access session
     */
    function startEmergencySession(
        address _patient,
        string memory _reason,
        string memory _doctorName,
        string memory _hospitalName
    ) external onlyEmergencyDoctor nonReentrant returns (uint256) {
        require(vitalChainCore.isRegisteredPatient(_patient), "Patient not registered");
        require(activeSession[msg.sender] == 0, "Already has active session");
        require(bytes(_reason).length > 0, "Reason required");

        // Check cooldown period
        uint256 lastAccess = lastEmergencyAccess[msg.sender][_patient];
        require(
            lastAccess == 0 || block.timestamp >= lastAccess + config.cooldownPeriod,
            "Cooldown period not elapsed"
        );

        sessionCounter++;

        sessions[sessionCounter] = EmergencySession({
            id: sessionCounter,
            doctor: msg.sender,
            patient: _patient,
            reason: _reason,
            diagnosis: "",
            doctorName: _doctorName,
            hospitalName: _hospitalName,
            startTime: block.timestamp,
            endTime: 0,
            accessedRecords: new uint256[](0),
            status: EmergencyStatus.ACTIVE,
            reviewNotes: "",
            reviewedBy: address(0),
            reviewedAt: 0
        });

        activeSession[msg.sender] = sessionCounter;
        lastEmergencyAccess[msg.sender][_patient] = block.timestamp;
        patientEmergencySessions[_patient].push(sessionCounter);
        doctorEmergencySessions[msg.sender].push(sessionCounter);
        doctorEmergencyCount[msg.sender]++;

        // Auto-flag if threshold exceeded
        if (doctorEmergencyCount[msg.sender] >= config.autoFlagThreshold) {
            sessions[sessionCounter].status = EmergencyStatus.FLAGGED;
            flaggedSessions.push(sessionCounter);
        }

        emit EmergencySessionStarted(sessionCounter, msg.sender, _patient, _reason, block.timestamp);

        return sessionCounter;
    }

    /**
     * @dev Access a record during an emergency session
     */
    function accessRecordInEmergency(
        uint256 _recordId,
        string memory _ipAddressHash,
        string memory _deviceInfoHash
    ) external onlyEmergencyDoctor nonReentrant {
        uint256 sessionId = activeSession[msg.sender];
        require(sessionId != 0, "No active emergency session");
        
        EmergencySession storage session = sessions[sessionId];
        require(session.status == EmergencyStatus.ACTIVE || session.status == EmergencyStatus.FLAGGED, "Session not active");
        require(block.timestamp <= session.startTime + config.maxSessionDuration, "Session expired");

        // Verify record belongs to the patient
        (,address patient,,,,,,,,) = patientRecords.getRecord(_recordId);
        require(patient == session.patient, "Record does not belong to patient");

        // Add to accessed records
        session.accessedRecords.push(_recordId);

        // Log the access
        auditLog.logEmergencyAccess(
            session.patient,
            _recordId,
            session.doctorName,
            session.hospitalName,
            session.reason,
            _ipAddressHash,
            _deviceInfoHash
        );

        emit EmergencyRecordAccessed(sessionId, msg.sender, session.patient, _recordId, block.timestamp);
    }

    /**
     * @dev End an emergency access session
     */
    function endEmergencySession(string memory _diagnosis) external onlyEmergencyDoctor {
        uint256 sessionId = activeSession[msg.sender];
        require(sessionId != 0, "No active emergency session");

        EmergencySession storage session = sessions[sessionId];
        session.endTime = block.timestamp;
        session.diagnosis = _diagnosis;
        
        if (session.status == EmergencyStatus.ACTIVE) {
            session.status = EmergencyStatus.COMPLETED;
        }

        activeSession[msg.sender] = 0;

        emit EmergencySessionEnded(
            sessionId,
            msg.sender,
            session.patient,
            session.endTime - session.startTime,
            session.accessedRecords.length
        );
    }

    /**
     * @dev Flag a session for review
     */
    function flagSession(uint256 _sessionId, string memory _reason) external {
        EmergencySession storage session = sessions[_sessionId];
        require(
            session.patient == msg.sender ||
            vitalChainCore.hasRole(vitalChainCore.HOSPITAL_ROLE(), msg.sender) ||
            vitalChainCore.hasRole(vitalChainCore.DEFAULT_ADMIN_ROLE(), msg.sender),
            "Not authorized to flag"
        );
        require(
            session.status == EmergencyStatus.ACTIVE || session.status == EmergencyStatus.COMPLETED,
            "Cannot flag this session"
        );

        session.status = EmergencyStatus.FLAGGED;
        flaggedSessions.push(_sessionId);

        emit EmergencySessionFlagged(_sessionId, msg.sender, _reason, block.timestamp);
    }

    /**
     * @dev Review a flagged session
     */
    function reviewSession(
        uint256 _sessionId,
        bool _approved,
        string memory _notes
    ) external onlyHospitalOrAdmin {
        EmergencySession storage session = sessions[_sessionId];
        require(session.status == EmergencyStatus.FLAGGED, "Session not flagged");

        session.status = _approved ? EmergencyStatus.APPROVED : EmergencyStatus.REJECTED;
        session.reviewNotes = _notes;
        session.reviewedBy = msg.sender;
        session.reviewedAt = block.timestamp;

        emit EmergencySessionReviewed(_sessionId, msg.sender, session.status, _notes, block.timestamp);
    }

    /**
     * @dev Update emergency access configuration
     */
    function updateConfig(
        uint256 _maxSessionDuration,
        uint256 _cooldownPeriod,
        bool _requiresJustification,
        uint256 _autoFlagThreshold
    ) external onlyHospitalOrAdmin {
        config = EmergencyConfig({
            maxSessionDuration: _maxSessionDuration,
            cooldownPeriod: _cooldownPeriod,
            requiresJustification: _requiresJustification,
            autoFlagThreshold: _autoFlagThreshold
        });
    }

    // ============ View Functions ============

    function getSession(uint256 _sessionId) external view returns (
        uint256 id,
        address doctor,
        address patient,
        string memory reason,
        string memory diagnosis,
        string memory doctorName,
        string memory hospitalName,
        uint256 startTime,
        uint256 endTime,
        uint256[] memory accessedRecords,
        EmergencyStatus status
    ) {
        EmergencySession storage session = sessions[_sessionId];
        return (
            session.id,
            session.doctor,
            session.patient,
            session.reason,
            session.diagnosis,
            session.doctorName,
            session.hospitalName,
            session.startTime,
            session.endTime,
            session.accessedRecords,
            session.status
        );
    }

    function getActiveSession(address _doctor) external view returns (uint256) {
        return activeSession[_doctor];
    }

    function getPatientEmergencySessionIds(address _patient) external view returns (uint256[] memory) {
        return patientEmergencySessions[_patient];
    }

    function getDoctorEmergencySessionIds(address _doctor) external view returns (uint256[] memory) {
        return doctorEmergencySessions[_doctor];
    }

    function getFlaggedSessionIds() external view returns (uint256[] memory) {
        return flaggedSessions;
    }

    function getConfig() external view returns (
        uint256 maxSessionDuration,
        uint256 cooldownPeriod,
        bool requiresJustification,
        uint256 autoFlagThreshold
    ) {
        return (
            config.maxSessionDuration,
            config.cooldownPeriod,
            config.requiresJustification,
            config.autoFlagThreshold
        );
    }

    function isSessionActive(address _doctor) external view returns (bool) {
        uint256 sessionId = activeSession[_doctor];
        if (sessionId == 0) return false;
        
        EmergencySession storage session = sessions[sessionId];
        return (session.status == EmergencyStatus.ACTIVE || session.status == EmergencyStatus.FLAGGED) &&
               block.timestamp <= session.startTime + config.maxSessionDuration;
    }
}
