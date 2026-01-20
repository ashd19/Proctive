const hre = require("hardhat");

async function main() {
  console.log("\n🏥 Complete Emergency Access Demo Setup\n");
  console.log("=" .repeat(60));

  // Contract addresses
  const vitalChainCoreAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const patientRecordsAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Get signers
  const [deployer, patient, doctor] = await hre.ethers.getSigners();
  
  console.log("Accounts:");
  console.log(`  Deployer/Admin: ${deployer.address}`);
  console.log(`  Patient: ${patient.address}`);
  console.log(`  Doctor: ${doctor.address}`);
  console.log();

  // Get contracts
  const VitalChainCore = await hre.ethers.getContractFactory("contracts/VitalChainCore.sol:VitalChainCore");
  const vitalChainCore = await VitalChainCore.attach(vitalChainCoreAddress);
  
  const PatientRecords = await hre.ethers.getContractFactory("PatientRecords");
  const patientRecords = await PatientRecords.attach(patientRecordsAddress);

  // Get roles
  const DOCTOR_ROLE = await vitalChainCore.DOCTOR_ROLE();
  const EMERGENCY_ROLE = await vitalChainCore.EMERGENCY_ROLE();

  // Step 1: Register patient
  console.log("1️⃣  Registering patient...");
  const isPatientRegistered = await vitalChainCore.isRegisteredPatient(patient.address);
  if (!isPatientRegistered) {
    const tx1 = await vitalChainCore.connect(patient).registerPatient();
    await tx1.wait();
    console.log("   ✅ Patient registered");
  } else {
    console.log("   ℹ️  Patient already registered");
  }
  console.log();

  // Step 2: Grant DOCTOR_ROLE
  console.log("2️⃣  Granting DOCTOR_ROLE...");
  const hasDoctorRole = await vitalChainCore.hasRole(DOCTOR_ROLE, doctor.address);
  if (!hasDoctorRole) {
    const tx2 = await vitalChainCore.grantRole(DOCTOR_ROLE, doctor.address);
    await tx2.wait();
    console.log("   ✅ DOCTOR_ROLE granted to doctor");
  } else {
    console.log("   ℹ️  Doctor already has DOCTOR_ROLE");
  }
  console.log();

  // Step 3: Grant EMERGENCY_ROLE
  console.log("3️⃣  Granting EMERGENCY_ROLE...");
  const hasEmergencyRole = await vitalChainCore.hasRole(EMERGENCY_ROLE, doctor.address);
  if (!hasEmergencyRole) {
    const tx3 = await vitalChainCore.grantRole(EMERGENCY_ROLE, doctor.address);
    await tx3.wait();
    console.log("   ✅ EMERGENCY_ROLE granted to doctor");
  } else {
    console.log("   ℹ️  Doctor already has EMERGENCY_ROLE");
  }
  console.log();

  // Step 4: Create medical records
  console.log("4️⃣  Creating medical records...");
  
  // Record 1: Medical History
  const tx4 = await patientRecords.connect(doctor).createRecord(
    patient.address,
    0,
    "QmMedicalHistory123",
    "0x" + "1234567890abcdef".repeat(8),
    "0x" + "abcdef1234567890".repeat(4),
    "Complete Medical History",
    "Patient history: Type 2 Diabetes (diagnosed 2020), Hypertension (2018), High Cholesterol (2019). No surgeries. Non-smoker.",
    "City General Hospital",
    "Dr. Sarah Johnson",
    ["history", "diabetes", "hypertension", "cholesterol"]
  );
  await tx4.wait();
  console.log("   ✅ Medical History created");

  // Record 2: Allergy Information (CRITICAL)
  const tx5 = await patientRecords.connect(doctor).createRecord(
    patient.address,
    0,
    "QmAllergyInfo456",
    "0x" + "fedcba0987654321".repeat(8),
    "0x" + "0987654321fedcba".repeat(4),
    "⚠️ CRITICAL: Allergy Information",
    "SEVERE ALLERGIES - Penicillin (anaphylaxis risk), Aspirin (severe rash), Sulfa drugs (breathing difficulty). Always check before prescribing!",
    "City General Hospital",
    "Dr. Sarah Johnson",
    ["allergy", "critical", "penicillin", "aspirin", "life-threatening"]
  );
  await tx5.wait();
  console.log("   ✅ Allergy Information created");

  // Record 3: Current Medications
  const tx6 = await patientRecords.connect(doctor).createRecord(
    patient.address,
    0,
    "QmMedications789",
    "0x" + "abcd1234efgh5678".repeat(8),
    "0x" + "5678efghabcd1234".repeat(4),
    "Current Medications",
    "Daily medications: Metformin 500mg (twice daily with meals), Lisinopril 10mg (morning), Atorvastatin 20mg (bedtime). Good compliance.",
    "City General Hospital",
    "Dr. Sarah Johnson",
    ["medication", "active", "diabetes", "blood-pressure"]
  );
  await tx6.wait();
  console.log("   ✅ Current Medications created");

  // Record 4: Lab Results
  const tx7 = await patientRecords.connect(doctor).createRecord(
    patient.address,
    0,
    "QmLabResults2026",
    "0x" + "9999888877776666".repeat(8),
    "0x" + "6666777788889999".repeat(4),
    "Recent Lab Results (Jan 2026)",
    "HbA1c: 6.8% (improving), Blood Pressure: 128/82, LDL: 95 mg/dL, HDL: 52 mg/dL, Creatinine: 0.9 mg/dL (normal kidney function)",
    "City General Hospital Lab",
    "Dr. Sarah Johnson",
    ["lab", "results", "recent", "diabetes-control"]
  );
  await tx7.wait();
  console.log("   ✅ Lab Results created");
  console.log();

  // Step 5: Verify records
  console.log("5️⃣  Verifying setup...");
  const recordIds = await patientRecords.getPatientRecords(patient.address);
  console.log(`   ✅ Total records created: ${recordIds.length}`);
  console.log();

  console.log("=" .repeat(60));
  console.log("✅ Setup Complete!");
  console.log();
  console.log("📋 Ready for Emergency Access Demo:");
  console.log(`   Patient Address: ${patient.address}`);
  console.log(`   Doctor Address: ${doctor.address}`);
  console.log(`   Records Available: ${recordIds.length}`);
  console.log();
  console.log("🚀 Next Steps:");
  console.log("   1. Use doctor address in MetaMask");
  console.log("   2. Go to /doctor/emergency");
  console.log("   3. Start emergency session");
  console.log("   4. Use patient address above");
  console.log("   5. View patient records!");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
