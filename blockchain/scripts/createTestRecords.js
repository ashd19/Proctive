const hre = require("hardhat");

async function main() {
  console.log("\n📄 Creating Test Medical Record\n");
  console.log("=" .repeat(60));

  // Get the deployed contract addresses
  const patientRecordsAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  // Patient address (use the one we registered earlier)
  const patientAddress = process.argv[2] || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  // Get signers (use deployer as doctor)
  const [deployer] = await hre.ethers.getSigners();
  
  console.log(`Patient: ${patientAddress}`);
  console.log(`Doctor (creator): ${deployer.address}`);
  console.log();

  // Get contract instance
  const PatientRecords = await hre.ethers.getContractFactory("PatientRecords");
  const patientRecords = await PatientRecords.attach(patientRecordsAddress);

  // Create a test medical record
  console.log("Creating medical record...");
  
  const tx = await patientRecords.createRecord(
    patientAddress,
    0, // RecordType.GENERAL
    "QmTestMedicalRecord123456789", // IPFS hash (simulated)
    "0x" + "1234567890abcdef".repeat(8), // Encrypted key (128 bytes hex)
    "0x" + "abcdef1234567890".repeat(4), // Metadata hash (64 bytes hex)
    "Patient Medical History",
    "Complete medical history including allergies, current medications, and chronic conditions",
    "City General Hospital",
    "Dr. Sarah Johnson",
    ["allergy", "medication", "history", "chronic-conditions"]
  );
  
  const receipt = await tx.wait();
  
  // Get record ID from event
  const createEvent = receipt.logs.find(log => {
    try {
      const parsed = patientRecords.interface.parseLog(log);
      return parsed?.name === "RecordCreated";
    } catch {
      return false;
    }
  });
  
  const recordId = createEvent 
    ? Number(patientRecords.interface.parseLog(createEvent).args[0]) 
    : 'Unknown';
    
  console.log(`✅ Medical record created with ID: ${recordId}`);
  console.log();
  
  // Create another record (Allergy Information)
  console.log("Creating allergy record...");
  
  const tx2 = await patientRecords.createRecord(
    patientAddress,
    0, // RecordType.GENERAL
    "QmTestAllergyRecord987654321",
    "0x" + "fedcba0987654321".repeat(8),
    "0x" + "0987654321fedcba".repeat(4),
    "Allergy Information",
    "CRITICAL: Patient allergic to Penicillin (anaphylaxis), Aspirin (severe rash), Sulfa drugs (breathing difficulty)",
    "City General Hospital",
    "Dr. Sarah Johnson",
    ["allergy", "critical", "penicillin", "aspirin"]
  );
  
  await tx2.wait();
  console.log("✅ Allergy record created");
  console.log();
  
  // Create medication record
  console.log("Creating medication record...");
  
  const tx3 = await patientRecords.createRecord(
    patientAddress,
    0,
    "QmTestMedicationRecord456789123",
    "0x" + "abcd1234efgh5678".repeat(8),
    "0x" + "5678efghabcd1234".repeat(4),
    "Current Medications",
    "Metformin 500mg twice daily, Lisinopril 10mg once daily, Atorvastatin 20mg at bedtime",
    "City General Hospital",
    "Dr. Sarah Johnson",
    ["medication", "current", "diabetes", "hypertension"]
  );
  
  await tx3.wait();
  console.log("✅ Medication record created");
  console.log();
  
  // Fetch all records for patient
  console.log("Fetching all patient records...");
  const recordIds = await patientRecords.getPatientRecords(patientAddress);
  console.log(`Total records: ${recordIds.length}`);
  
  console.log();
  console.log("=" .repeat(60));
  console.log("✅ Test records created successfully!");
  console.log();
  console.log("Now you can view these records in the Emergency Access UI");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
