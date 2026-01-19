// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VitalChainCore.sol";

/**
 * @title PatientRecords
 * @dev Manages patient medical records with patient-controlled access
 */
contract PatientRecords is ReentrancyGuard {
    VitalChainCore public VitalChainCore;

    enum RecordType { 
        GENERAL, 
        PRESCRIPTION, 
        LAB_RESULT, 
        IMAGING, 
        SURGERY, 
        VACCINATION, 
        ALLERGY, 
        CHRONIC_CONDITION 
    }

    struct MedicalRecord {
        uint256 id;
        address patient;
        address createdBy;
        RecordType recordType;
        string ipfsHash;           // Encrypted data stored on IPFS
        string encryptedKey;       // Encrypted AES key (encrypted with patient's public key)
        string metadataHash;       // Hash of unencrypted metadata for verification
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
    }

    struct RecordMetadata {
        string title;
        string description;
        string hospitalName;
        string doctorName;
        string[] tags;
    }

    // Patient => Record IDs
    mapping(address => uint256[]) public patientRecords;
    // Record ID => Record
    mapping(uint256 => MedicalRecord) public records;
    // Record ID => Metadata
    mapping(uint256 => RecordMetadata) public recordMetadata;
    
    uint256 private recordCounter;

    event RecordCreated(
        uint256 indexed recordId,
        address indexed patient,
        address indexed createdBy,
        RecordType recordType,
        uint256 timestamp
    );
    
    event RecordUpdated(
        uint256 indexed recordId,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    event RecordDeactivated(
        uint256 indexed recordId,
        address indexed deactivatedBy,
        uint256 timestamp
    );

    modifier onlyRegisteredPatient() {
        require(VitalChainCore.isRegisteredPatient(msg.sender), "Not a registered patient");
        _;
    }

    modifier onlyAuthorizedCreator() {
        require(
            VitalChainCore.hasRole(VitalChainCore.DOCTOR_ROLE(), msg.sender) ||
            VitalChainCore.hasRole(VitalChainCore.LAB_ROLE(), msg.sender) ||
            VitalChainCore.hasRole(VitalChainCore.HOSPITAL_ROLE(), msg.sender),
            "Not authorized to create records"
        );
        _;
    }

    constructor(address _VitalChainCoreAddress) {
        VitalChainCore = VitalChainCore(_VitalChainCoreAddress);
    }

    /**
     * @dev Creates a new medical record
     * @param _patient Address of the patient
     * @param _recordType Type of medical record
     * @param _ipfsHash IPFS hash of encrypted medical data
     * @param _encryptedKey AES key encrypted with patient's public key
     * @param _metadataHash Hash of the unencrypted metadata
     * @param _title Record title
     * @param _description Record description
     * @param _hospitalName Name of the hospital
     * @param _doctorName Name of the doctor
     * @param _tags Array of tags for categorization
     */
    function createRecord(
        address _patient,
        RecordType _recordType,
        string memory _ipfsHash,
        string memory _encryptedKey,
        string memory _metadataHash,
        string memory _title,
        string memory _description,
        string memory _hospitalName,
        string memory _doctorName,
        string[] memory _tags
    ) external onlyAuthorizedCreator nonReentrant returns (uint256) {
        require(VitalChainCore.isRegisteredPatient(_patient), "Patient not registered");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        recordCounter++;
        
        records[recordCounter] = MedicalRecord({
            id: recordCounter,
            patient: _patient,
            createdBy: msg.sender,
            recordType: _recordType,
            ipfsHash: _ipfsHash,
            encryptedKey: _encryptedKey,
            metadataHash: _metadataHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true
        });

        recordMetadata[recordCounter] = RecordMetadata({
            title: _title,
            description: _description,
            hospitalName: _hospitalName,
            doctorName: _doctorName,
            tags: _tags
        });

        patientRecords[_patient].push(recordCounter);

        emit RecordCreated(recordCounter, _patient, msg.sender, _recordType, block.timestamp);
        
        return recordCounter;
    }

    /**
     * @dev Patient can create their own records (for uploading existing records)
     */
    function createOwnRecord(
        RecordType _recordType,
        string memory _ipfsHash,
        string memory _encryptedKey,
        string memory _metadataHash,
        string memory _title,
        string memory _description,
        string memory _hospitalName,
        string memory _doctorName,
        string[] memory _tags
    ) external onlyRegisteredPatient nonReentrant returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        recordCounter++;
        
        records[recordCounter] = MedicalRecord({
            id: recordCounter,
            patient: msg.sender,
            createdBy: msg.sender,
            recordType: _recordType,
            ipfsHash: _ipfsHash,
            encryptedKey: _encryptedKey,
            metadataHash: _metadataHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true
        });

        recordMetadata[recordCounter] = RecordMetadata({
            title: _title,
            description: _description,
            hospitalName: _hospitalName,
            doctorName: _doctorName,
            tags: _tags
        });

        patientRecords[msg.sender].push(recordCounter);

        emit RecordCreated(recordCounter, msg.sender, msg.sender, _recordType, block.timestamp);
        
        return recordCounter;
    }

    /**
     * @dev Updates an existing record (only by creator or patient)
     */
    function updateRecord(
        uint256 _recordId,
        string memory _ipfsHash,
        string memory _encryptedKey,
        string memory _metadataHash
    ) external nonReentrant {
        MedicalRecord storage record = records[_recordId];
        require(record.isActive, "Record not active");
        require(
            record.patient == msg.sender || record.createdBy == msg.sender,
            "Not authorized to update"
        );

        record.ipfsHash = _ipfsHash;
        record.encryptedKey = _encryptedKey;
        record.metadataHash = _metadataHash;
        record.updatedAt = block.timestamp;

        emit RecordUpdated(_recordId, msg.sender, block.timestamp);
    }

    /**
     * @dev Deactivates a record (only by patient)
     */
    function deactivateRecord(uint256 _recordId) external {
        MedicalRecord storage record = records[_recordId];
        require(record.patient == msg.sender, "Only patient can deactivate");
        require(record.isActive, "Record already inactive");

        record.isActive = false;
        record.updatedAt = block.timestamp;

        emit RecordDeactivated(_recordId, msg.sender, block.timestamp);
    }

    // ============ View Functions ============

    function getPatientRecordIds(address _patient) external view returns (uint256[] memory) {
        return patientRecords[_patient];
    }

    function getRecord(uint256 _recordId) external view returns (
        uint256 id,
        address patient,
        address createdBy,
        RecordType recordType,
        string memory ipfsHash,
        string memory encryptedKey,
        string memory metadataHash,
        uint256 createdAt,
        uint256 updatedAt,
        bool isActive
    ) {
        MedicalRecord storage record = records[_recordId];
        return (
            record.id,
            record.patient,
            record.createdBy,
            record.recordType,
            record.ipfsHash,
            record.encryptedKey,
            record.metadataHash,
            record.createdAt,
            record.updatedAt,
            record.isActive
        );
    }

    function getRecordMetadata(uint256 _recordId) external view returns (
        string memory title,
        string memory description,
        string memory hospitalName,
        string memory doctorName,
        string[] memory tags
    ) {
        RecordMetadata storage metadata = recordMetadata[_recordId];
        return (
            metadata.title,
            metadata.description,
            metadata.hospitalName,
            metadata.doctorName,
            metadata.tags
        );
    }

    function getPatientRecordCount(address _patient) external view returns (uint256) {
        return patientRecords[_patient].length;
    }

    function getTotalRecords() external view returns (uint256) {
        return recordCounter;
    }
}
