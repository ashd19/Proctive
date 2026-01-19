// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MedChainCore
 * @dev Core contract for managing healthcare entities registration and roles
 */
contract MedChainCore is AccessControl, ReentrancyGuard {
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant LAB_ROLE = keccak256("LAB_ROLE");
    bytes32 public constant INSURANCE_ROLE = keccak256("INSURANCE_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    struct Hospital {
        uint256 id;
        string name;
        string location;
        string licenseNumber;
        bool isActive;
        uint256 registeredAt;
    }

    struct Doctor {
        uint256 id;
        string name;
        string specialization;
        string licenseNumber;
        uint256 hospitalId;
        bool isActive;
        bool hasEmergencyAccess;
        uint256 registeredAt;
    }

    struct DiagnosticLab {
        uint256 id;
        string name;
        string location;
        string licenseNumber;
        bool isActive;
        uint256 registeredAt;
    }

    struct InsuranceProvider {
        uint256 id;
        string name;
        string policyPrefix;
        bool isActive;
        uint256 registeredAt;
    }

    mapping(address => Hospital) public hospitals;
    mapping(address => Doctor) public doctors;
    mapping(address => DiagnosticLab) public labs;
    mapping(address => InsuranceProvider) public insuranceProviders;
    mapping(address => bool) public registeredPatients;

    address[] public hospitalAddresses;
    address[] public doctorAddresses;
    address[] public labAddresses;
    address[] public insuranceAddresses;

    uint256 private hospitalCounter;
    uint256 private doctorCounter;
    uint256 private labCounter;
    uint256 private insuranceCounter;

    event HospitalRegistered(address indexed hospitalAddress, string name, uint256 id);
    event DoctorRegistered(address indexed doctorAddress, string name, uint256 hospitalId, uint256 id);
    event LabRegistered(address indexed labAddress, string name, uint256 id);
    event InsuranceProviderRegistered(address indexed insuranceAddress, string name, uint256 id);
    event PatientRegistered(address indexed patientAddress);
    event EntityDeactivated(address indexed entityAddress, string entityType);
    event EmergencyAccessGranted(address indexed doctorAddress);
    event EmergencyAccessRevoked(address indexed doctorAddress);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ============ Hospital Functions ============

    function registerHospital(
        address _hospitalAddress,
        string memory _name,
        string memory _location,
        string memory _licenseNumber
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hospitals[_hospitalAddress].id == 0, "Hospital already registered");
        
        hospitalCounter++;
        hospitals[_hospitalAddress] = Hospital({
            id: hospitalCounter,
            name: _name,
            location: _location,
            licenseNumber: _licenseNumber,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        hospitalAddresses.push(_hospitalAddress);
        _grantRole(HOSPITAL_ROLE, _hospitalAddress);
        
        emit HospitalRegistered(_hospitalAddress, _name, hospitalCounter);
    }

    // ============ Doctor Functions ============

    function registerDoctor(
        address _doctorAddress,
        string memory _name,
        string memory _specialization,
        string memory _licenseNumber,
        uint256 _hospitalId,
        bool _hasEmergencyAccess
    ) external onlyRole(HOSPITAL_ROLE) {
        require(doctors[_doctorAddress].id == 0, "Doctor already registered");
        require(hospitals[msg.sender].isActive, "Hospital is not active");
        
        doctorCounter++;
        doctors[_doctorAddress] = Doctor({
            id: doctorCounter,
            name: _name,
            specialization: _specialization,
            licenseNumber: _licenseNumber,
            hospitalId: _hospitalId,
            isActive: true,
            hasEmergencyAccess: _hasEmergencyAccess,
            registeredAt: block.timestamp
        });
        
        doctorAddresses.push(_doctorAddress);
        _grantRole(DOCTOR_ROLE, _doctorAddress);
        
        if (_hasEmergencyAccess) {
            _grantRole(EMERGENCY_ROLE, _doctorAddress);
            emit EmergencyAccessGranted(_doctorAddress);
        }
        
        emit DoctorRegistered(_doctorAddress, _name, _hospitalId, doctorCounter);
    }

    // ============ Lab Functions ============

    function registerLab(
        address _labAddress,
        string memory _name,
        string memory _location,
        string memory _licenseNumber
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(labs[_labAddress].id == 0, "Lab already registered");
        
        labCounter++;
        labs[_labAddress] = DiagnosticLab({
            id: labCounter,
            name: _name,
            location: _location,
            licenseNumber: _licenseNumber,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        labAddresses.push(_labAddress);
        _grantRole(LAB_ROLE, _labAddress);
        
        emit LabRegistered(_labAddress, _name, labCounter);
    }

    // ============ Insurance Functions ============

    function registerInsuranceProvider(
        address _insuranceAddress,
        string memory _name,
        string memory _policyPrefix
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(insuranceProviders[_insuranceAddress].id == 0, "Insurance provider already registered");
        
        insuranceCounter++;
        insuranceProviders[_insuranceAddress] = InsuranceProvider({
            id: insuranceCounter,
            name: _name,
            policyPrefix: _policyPrefix,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        insuranceAddresses.push(_insuranceAddress);
        _grantRole(INSURANCE_ROLE, _insuranceAddress);
        
        emit InsuranceProviderRegistered(_insuranceAddress, _name, insuranceCounter);
    }

    // ============ Patient Functions ============

    function registerPatient() external {
        require(!registeredPatients[msg.sender], "Patient already registered");
        registeredPatients[msg.sender] = true;
        emit PatientRegistered(msg.sender);
    }

    // ============ Emergency Access Management ============

    function grantEmergencyAccess(address _doctorAddress) external onlyRole(HOSPITAL_ROLE) {
        require(doctors[_doctorAddress].isActive, "Doctor is not active");
        require(!doctors[_doctorAddress].hasEmergencyAccess, "Already has emergency access");
        
        doctors[_doctorAddress].hasEmergencyAccess = true;
        _grantRole(EMERGENCY_ROLE, _doctorAddress);
        
        emit EmergencyAccessGranted(_doctorAddress);
    }

    function revokeEmergencyAccess(address _doctorAddress) external onlyRole(HOSPITAL_ROLE) {
        require(doctors[_doctorAddress].hasEmergencyAccess, "Does not have emergency access");
        
        doctors[_doctorAddress].hasEmergencyAccess = false;
        _revokeRole(EMERGENCY_ROLE, _doctorAddress);
        
        emit EmergencyAccessRevoked(_doctorAddress);
    }

    // ============ View Functions ============

    function getHospitalCount() external view returns (uint256) {
        return hospitalAddresses.length;
    }

    function getDoctorCount() external view returns (uint256) {
        return doctorAddresses.length;
    }

    function getLabCount() external view returns (uint256) {
        return labAddresses.length;
    }

    function getInsuranceCount() external view returns (uint256) {
        return insuranceAddresses.length;
    }

    function isRegisteredPatient(address _patient) external view returns (bool) {
        return registeredPatients[_patient];
    }

    function isActiveDoctor(address _doctor) external view returns (bool) {
        return doctors[_doctor].isActive;
    }

    function isActiveHospital(address _hospital) external view returns (bool) {
        return hospitals[_hospital].isActive;
    }

    function hasEmergencyAccess(address _doctor) external view returns (bool) {
        return doctors[_doctor].hasEmergencyAccess && doctors[_doctor].isActive;
    }
}
