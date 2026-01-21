const hre = require("hardhat");

async function main() {
  console.log("🏥 Registering test entities for development...\n");

  const [deployer, patient, unused, doctor] = await hre.ethers.getSigners();

  console.log("Deployer (Admin/Hospital):", deployer.address);
  console.log("Patient:", deployer.address);
  // Load deployed contract addresses
  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "../deployments/localhost.json");

  if (!fs.existsSync(deploymentPath)) {
    console.error(
      "❌ Deployment file not found. Please deploy contracts first.",
    );
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const vitalChainCoreAddress = deployment.contracts.VitalChainCore;

  // Get VitalChainCore contract
  const VitalChainCore = await hre.ethers.getContractFactory(
    "contracts/VitalChainCore.sol:VitalChainCore",
  );
  const vitalChainCore = VitalChainCore.attach(vitalChainCoreAddress);

  console.log("📝 Connected to VitalChainCore at:", vitalChainCoreAddress);
  console.log("");

  // 1. Register Hospital (deployer as hospital)
  console.log("1️⃣  Registering hospital...");
  try {
    const tx1 = await vitalChainCore.registerHospital(
      deployer.address,
      "General Hospital",
      "City Medical District",
      "LIC-12345",
    );
    await tx1.wait();
    console.log("   ✅ Hospital registered:", deployer.address);
  } catch (error) {
    if (error.message.includes("Hospital already registered")) {
      console.log("   ℹ️  Hospital already registered");
    } else {
      throw error;
    }
  }

  // 2. Register Doctor (using deployer as hospital to register the doctor)
  console.log("2️⃣  Registering doctor...");
  try {
    const tx2 = await vitalChainCore.registerDoctor(
      doctor.address,
      "Dr. John Smith",
      "General Practice",
      "DOC-67890",
      1, // hospitalId (first hospital)
      true, // hasEmergencyAccess
    );
    await tx2.wait();
    console.log("   ✅ Doctor registered:", doctor.address);
  } catch (error) {
    if (error.message.includes("Doctor already registered")) {
      console.log("   ℹ️  Doctor already registered");
    } else {
      throw error;
    }
  }

  // 3. Register Deployer as Patient (for testing)
  console.log("3️⃣  Registering deployer as patient...");
  try {
    const tx3 = await vitalChainCore.registerPatient();
    await tx3.wait();
    console.log("   ✅ Patient registered:", deployer.address);
  } catch (error) {
    if (error.message.includes("Patient already registered")) {
      console.log("   ℹ️  Patient already registered:", deployer.address);
    } else {
      throw error;
    }
  }

  // 4. Register Account #1 as Patient
  console.log("4️⃣  Registering second patient...");
  try {
    const patientSigner = await hre.ethers.getSigner(patient.address);
    const vitalChainCoreAsPatient = vitalChainCore.connect(patientSigner);
    const tx4 = await vitalChainCoreAsPatient.registerPatient();
    await tx4.wait();
    console.log("   ✅ Patient registered:", patient.address);
  } catch (error) {
    if (error.message.includes("Patient already registered")) {
      console.log("   ℹ️  Patient already registered:", patient.address);
    } else {
      throw error;
    }
  }

  console.log("\n✅ All test entities registered successfully!\n");

  console.log("=".repeat(60));
  console.log("📋 TEST ACCOUNTS");
  console.log("=".repeat(60));
  console.log(`Admin/Hospital/Patient: ${deployer.address}`);
  console.log(`Patient (alt):          ${patient.address}`);
  console.log(`Doctor:                 ${doctor.address}`);
  console.log("=".repeat(60));
  console.log("\n💡 You can now:");
  console.log("   1. Login as patient (0xf39F...) to upload records");
  console.log("   2. Login as doctor (0x3C44...) to request access");
  console.log("   3. Switch back to patient to approve access\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
