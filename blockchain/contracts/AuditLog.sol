// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VitalChainCore.sol";
import "./PatientRecords.sol";
import "./AccessControlManager.sol";

/**
 * @title AuditLog
 * @dev Tamper-evident audit logging for all medical record accesses
 */
contract AuditLog is ReentrancyGuard {
    VitalChainCore public VitalChainCore;
    PatientRecords public patientRecords;
    AccessControlManager public accessControl;

    enum AccessType {
        VIEW,
        DOWNLOAD,
        UPDATE,
        CREATE,
        EMERGENCY_ACCESS,
        CONSENT_GRANTED,
        CONSENT_REVOKED,
        INSURANCE_CLAIM
    }

    struct LogEntry {
        uint256 id;
        address patient;
        address accessor;
        uint256 recordId;
        AccessType accessType;
        string accessorName;
        string accessorRole;
        string institutionName;
        string ipAddress;           // Hashed for privacy
        string deviceInfo;          // Hashed for privacy
        uint256 timestamp;
        bool isEmergencyAccess;
        string emergencyReason;
        bytes32 transactionHash;
    }

    // Log ID => LogEntry
    mapping(uint256 => LogEntry) public logs;
    // Patient => Log IDs
    mapping(address => uint256[]) public patientLogs;
    // Accessor => Log IDs
    mapping(address => uint256[]) public accessorLogs;
    // Record => Log IDs
    mapping(uint256 => uint256[]) public recordLogs;

    uint256 private logCounter;

    // Emergency access specific
    mapping(uint256 => bool) public flaggedEmergencyAccess;
    uint256[] public allEmergencyAccessLogs;

    event AccessLogged(
        uint256 indexed logId,
        address indexed patient,
        address indexed accessor,
        uint256 recordId,
        AccessType accessType,
        uint256 timestamp
    );

    event EmergencyAccessLogged(
        uint256 indexed logId,
        address indexed patient,
        address indexed accessor,
        uint256 recordId,
        string reason,
        uint256 timestamp
    );

    event EmergencyAccessFlagged(
        uint256 indexed logId,
        address indexed flaggedBy,
        uint256 timestamp
    );

    constructor(
        address _VitalChainCoreAddress,
        address _patientRecordsAddress,
        address _accessControlAddress
    ) {
        VitalChainCore = VitalChainCore(_VitalChainCoreAddress);
        patientRecords = PatientRecords(_patientRecordsAddress);
        accessControl = AccessControlManager(_accessControlAddress);
    }

    /**
     * @dev Log a standard access event
     */
    function logAccess(
        address _patient,
        uint256 _recordId,
        AccessType _accessType,
        string memory _accessorName,
        string memory _accessorRole,
        string memory _institutionName,
        string memory _ipAddressHash,
        string memory _deviceInfoHash
    ) external nonReentrant returns (uint256) {
        require(VitalChainCore.isRegisteredPatient(_patient), "Patient not registered");

        logCounter++;

        logs[logCounter] = LogEntry({
            id: logCounter,
            patient: _patient,
            accessor: msg.sender,
            recordId: _recordId,
            accessType: _accessType,
            accessorName: _accessorName,
            accessorRole: _accessorRole,
            institutionName: _institutionName,
            ipAddress: _ipAddressHash,
            deviceInfo: _deviceInfoHash,
            timestamp: block.timestamp,
            isEmergencyAccess: false,
            emergencyReason: "",
            transactionHash: blockhash(block.number - 1)
        });

        patientLogs[_patient].push(logCounter);
        accessorLogs[msg.sender].push(logCounter);
        recordLogs[_recordId].push(logCounter);

        emit AccessLogged(logCounter, _patient, msg.sender, _recordId, _accessType, block.timestamp);

        return logCounter;
    }

    /**
     * @dev Log an emergency access event
     */
    function logEmergencyAccess(
        address _patient,
        uint256 _recordId,
        string memory _accessorName,
        string memory _institutionName,
        string memory _emergencyReason,
        string memory _ipAddressHash,
        string memory _deviceInfoHash
    ) external nonReentrant returns (uint256) {
        require(VitalChainCore.hasRole(VitalChainCore.EMERGENCY_ROLE(), msg.sender), "No emergency access rights");
        require(VitalChainCore.isRegisteredPatient(_patient), "Patient not registered");

        logCounter++;

        logs[logCounter] = LogEntry({
            id: logCounter,
            patient: _patient,
            accessor: msg.sender,
            recordId: _recordId,
            accessType: AccessType.EMERGENCY_ACCESS,
            accessorName: _accessorName,
            accessorRole: "Emergency Doctor",
            institutionName: _institutionName,
            ipAddress: _ipAddressHash,
            deviceInfo: _deviceInfoHash,
            timestamp: block.timestamp,
            isEmergencyAccess: true,
            emergencyReason: _emergencyReason,
            transactionHash: blockhash(block.number - 1)
        });

        patientLogs[_patient].push(logCounter);
        accessorLogs[msg.sender].push(logCounter);
        recordLogs[_recordId].push(logCounter);
        allEmergencyAccessLogs.push(logCounter);

        emit EmergencyAccessLogged(
            logCounter,
            _patient,
            msg.sender,
            _recordId,
            _emergencyReason,
            block.timestamp
        );

        return logCounter;
    }

    /**
     * @dev Flag an emergency access for audit review
     */
    function flagEmergencyAccess(uint256 _logId) external {
        require(
            logs[_logId].patient == msg.sender ||
            VitalChainCore.hasRole(VitalChainCore.DEFAULT_ADMIN_ROLE(), msg.sender) ||
            VitalChainCore.hasRole(VitalChainCore.HOSPITAL_ROLE(), msg.sender),
            "Not authorized to flag"
        );
        require(logs[_logId].isEmergencyAccess, "Not an emergency access log");
        require(!flaggedEmergencyAccess[_logId], "Already flagged");

        flaggedEmergencyAccess[_logId] = true;

        emit EmergencyAccessFlagged(_logId, msg.sender, block.timestamp);
    }

    // ============ View Functions ============

    function getLog(uint256 _logId) external view returns (
        uint256 id,
        address patient,
        address accessor,
        uint256 recordId,
        AccessType accessType,
        string memory accessorName,
        string memory accessorRole,
        string memory institutionName,
        uint256 timestamp,
        bool isEmergencyAccess,
        string memory emergencyReason
    ) {
        LogEntry storage log = logs[_logId];
        return (
            log.id,
            log.patient,
            log.accessor,
            log.recordId,
            log.accessType,
            log.accessorName,
            log.accessorRole,
            log.institutionName,
            log.timestamp,
            log.isEmergencyAccess,
            log.emergencyReason
        );
    }

    function getPatientLogIds(address _patient) external view returns (uint256[] memory) {
        return patientLogs[_patient];
    }

    function getAccessorLogIds(address _accessor) external view returns (uint256[] memory) {
        return accessorLogs[_accessor];
    }

    function getRecordLogIds(uint256 _recordId) external view returns (uint256[] memory) {
        return recordLogs[_recordId];
    }

    function getAllEmergencyAccessLogIds() external view returns (uint256[] memory) {
        return allEmergencyAccessLogs;
    }

    function getPatientLogCount(address _patient) external view returns (uint256) {
        return patientLogs[_patient].length;
    }

    function isLogFlagged(uint256 _logId) external view returns (bool) {
        return flaggedEmergencyAccess[_logId];
    }

    function getTotalLogs() external view returns (uint256) {
        return logCounter;
    }

    /**
     * @dev Get logs for a patient within a time range
     */
    function getPatientLogsInRange(
        address _patient,
        uint256 _startTime,
        uint256 _endTime
    ) external view returns (uint256[] memory) {
        uint256[] storage allLogs = patientLogs[_patient];
        uint256 count = 0;

        // First pass to count
        for (uint i = 0; i < allLogs.length; i++) {
            if (logs[allLogs[i]].timestamp >= _startTime && logs[allLogs[i]].timestamp <= _endTime) {
                count++;
            }
        }

        // Second pass to populate
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint i = 0; i < allLogs.length; i++) {
            if (logs[allLogs[i]].timestamp >= _startTime && logs[allLogs[i]].timestamp <= _endTime) {
                result[index] = allLogs[i];
                index++;
            }
        }

        return result;
    }
}
