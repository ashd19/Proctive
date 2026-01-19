// Contract ABIs - These will be generated after running `npx hardhat compile`
// Copy the ABIs from blockchain/artifacts/contracts/*.sol/*.json

export const VitalChainCoreABI = [
  "function registerHospital(address _hospitalAddress, string memory _name, string memory _licenseNumber) external",
  "function registerDoctor(address _doctorAddress, string memory _name, string memory _licenseNumber, address _hospitalAddress) external",
  "function registerLaboratory(address _labAddress, string memory _name, string memory _licenseNumber) external",
  "function registerInsuranceProvider(address _insuranceAddress, string memory _name, string memory _licenseNumber) external",
  "function registerPatient() external",
  "function isPatient(address _address) external view returns (bool)",
  "function isDoctor(address _address) external view returns (bool)",
  "function isHospital(address _address) external view returns (bool)",
  "function isLaboratory(address _address) external view returns (bool)",
  "function isInsuranceProvider(address _address) external view returns (bool)",
  "function getHospitalInfo(address _address) external view returns (tuple(string name, string licenseNumber, bool isActive, uint256 registeredAt))",
  "function getDoctorInfo(address _address) external view returns (tuple(string name, string licenseNumber, address hospitalAddress, bool isActive, uint256 registeredAt))",
  "event HospitalRegistered(address indexed hospitalAddress, string name)",
  "event DoctorRegistered(address indexed doctorAddress, string name, address indexed hospitalAddress)",
  "event LaboratoryRegistered(address indexed labAddress, string name)",
  "event InsuranceProviderRegistered(address indexed insuranceAddress, string name)",
  "event PatientRegistered(address indexed patientAddress)"
] as const

export const PatientRecordsABI = [
  "function addRecord(string memory _ipfsHash, uint8 _recordType, string memory _metadata, address _sourceProvider) external",
  "function getPatientRecordCount(address _patient) external view returns (uint256)",
  "function getRecordByIndex(address _patient, uint256 _index) external view returns (tuple(string ipfsHash, uint8 recordType, uint256 timestamp, address sourceProvider, string metadata, bool isActive))",
  "function deactivateRecord(uint256 _recordIndex) external",
  "event RecordAdded(address indexed patient, uint256 recordIndex, uint8 recordType, address indexed sourceProvider)",
  "event RecordDeactivated(address indexed patient, uint256 recordIndex)"
] as const

export const AccessControlManagerABI = [
  "function requestAccess(address _patient, uint256 _durationDays, string memory _purpose) external",
  "function approveAccess(address _requester, uint256 _durationDays) external",
  "function revokeAccess(address _accessor) external",
  "function hasAccess(address _patient, address _accessor) external view returns (bool)",
  "function getAccessGrant(address _patient, address _accessor) external view returns (tuple(address accessor, uint256 grantedAt, uint256 expiresAt, bool isActive, string purpose))",
  "function getPendingRequests(address _patient) external view returns (address[] memory)",
  "function getAccessRequest(address _patient, address _requester) external view returns (tuple(address requester, uint256 requestedAt, uint256 requestedDuration, string purpose, uint8 status))",
  "event AccessRequested(address indexed patient, address indexed requester, string purpose)",
  "event AccessGranted(address indexed patient, address indexed accessor, uint256 expiresAt)",
  "event AccessRevoked(address indexed patient, address indexed accessor)"
] as const

export const AuditLogABI = [
  "function logAccess(address _patient, uint8 _accessType, string memory _details) external",
  "function getPatientAuditLogCount(address _patient) external view returns (uint256)",
  "function getAuditLogByIndex(address _patient, uint256 _index) external view returns (tuple(address accessor, uint8 accessType, uint256 timestamp, string details, bool isEmergencyAccess, bool isFlagged))",
  "function flagAuditEntry(address _patient, uint256 _index, string memory _reason) external",
  "event AccessLogged(address indexed patient, address indexed accessor, uint8 accessType)",
  "event AuditEntryFlagged(address indexed patient, uint256 indexed index, string reason)"
] as const

export const EmergencyAccessABI = [
  "function startEmergencySession(address _patient, string memory _reason, string memory _location) external returns (uint256)",
  "function endEmergencySession() external",
  "function getActiveSession(address _doctor) external view returns (tuple(address patient, address doctor, uint256 startedAt, uint256 expiresAt, string reason, string location, bool isActive, uint8 reviewStatus))",
  "function hasActiveEmergencyAccess(address _doctor, address _patient) external view returns (bool)",
  "function reviewEmergencySession(uint256 _sessionId, bool _isApproved, string memory _reviewNotes) external",
  "event EmergencySessionStarted(address indexed patient, address indexed doctor, uint256 sessionId)",
  "event EmergencySessionEnded(address indexed patient, address indexed doctor, uint256 sessionId)",
  "event EmergencySessionReviewed(uint256 indexed sessionId, bool isApproved)"
] as const

export const InsuranceClaimsABI = [
  "function submitClaim(address _patient, uint256 _amount, uint8 _claimType, string memory _description, string memory _documentsHash) external",
  "function approveClaim(uint256 _claimId, string memory _notes) external",
  "function rejectClaim(uint256 _claimId, string memory _reason) external",
  "function getClaimCount() external view returns (uint256)",
  "function getClaim(uint256 _claimId) external view returns (tuple(address patient, address insuranceProvider, uint256 amount, uint8 claimType, string description, string documentsHash, uint8 status, uint256 submittedAt, uint256 processedAt, string processNotes))",
  "function getPatientClaims(address _patient) external view returns (uint256[] memory)",
  "function registerPolicy(address _patient, uint256 _coverageAmount, uint256 _premiumAmount, uint256 _durationDays) external",
  "function getPolicy(address _patient, address _insuranceProvider) external view returns (tuple(uint256 coverageAmount, uint256 premiumAmount, uint256 startDate, uint256 endDate, bool isActive))",
  "event ClaimSubmitted(uint256 indexed claimId, address indexed patient, address indexed insuranceProvider, uint256 amount)",
  "event ClaimApproved(uint256 indexed claimId, string notes)",
  "event ClaimRejected(uint256 indexed claimId, string reason)",
  "event PolicyRegistered(address indexed patient, address indexed insuranceProvider, uint256 coverageAmount)"
] as const
