const hre = require("hardhat");

async function main() {
  console.log("🏥 Deploying MedChain Health Exchange Contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  // 1. Deploy MedChainCore
  console.log("1️⃣  Deploying MedChainCore...");
  const MedChainCore = await hre.ethers.getContractFactory("MedChainCore");
  const medChainCore = await MedChainCore.deploy();
  await medChainCore.waitForDeployment();
  const medChainCoreAddress = await medChainCore.getAddress();
  console.log("   MedChainCore deployed to:", medChainCoreAddress);

  // 2. Deploy PatientRecords
  console.log("2️⃣  Deploying PatientRecords...");
  const PatientRecords = await hre.ethers.getContractFactory("PatientRecords");
  const patientRecords = await PatientRecords.deploy(medChainCoreAddress);
  await patientRecords.waitForDeployment();
  const patientRecordsAddress = await patientRecords.getAddress();
  console.log("   PatientRecords deployed to:", patientRecordsAddress);

  // 3. Deploy AccessControlManager
  console.log("3️⃣  Deploying AccessControlManager...");
  const AccessControlManager = await hre.ethers.getContractFactory("AccessControlManager");
  const accessControl = await AccessControlManager.deploy(medChainCoreAddress, patientRecordsAddress);
  await accessControl.waitForDeployment();
  const accessControlAddress = await accessControl.getAddress();
  console.log("   AccessControlManager deployed to:", accessControlAddress);

  // 4. Deploy AuditLog
  console.log("4️⃣  Deploying AuditLog...");
  const AuditLog = await hre.ethers.getContractFactory("AuditLog");
  const auditLog = await AuditLog.deploy(medChainCoreAddress, patientRecordsAddress, accessControlAddress);
  await auditLog.waitForDeployment();
  const auditLogAddress = await auditLog.getAddress();
  console.log("   AuditLog deployed to:", auditLogAddress);

  // 5. Deploy EmergencyAccess
  console.log("5️⃣  Deploying EmergencyAccess...");
  const EmergencyAccess = await hre.ethers.getContractFactory("EmergencyAccess");
  const emergencyAccess = await EmergencyAccess.deploy(
    medChainCoreAddress,
    patientRecordsAddress,
    accessControlAddress,
    auditLogAddress
  );
  await emergencyAccess.waitForDeployment();
  const emergencyAccessAddress = await emergencyAccess.getAddress();
  console.log("   EmergencyAccess deployed to:", emergencyAccessAddress);

  // 6. Deploy InsuranceClaims
  console.log("6️⃣  Deploying InsuranceClaims...");
  const InsuranceClaims = await hre.ethers.getContractFactory("InsuranceClaims");
  const insuranceClaims = await InsuranceClaims.deploy(
    medChainCoreAddress,
    patientRecordsAddress,
    accessControlAddress,
    auditLogAddress
  );
  await insuranceClaims.waitForDeployment();
  const insuranceClaimsAddress = await insuranceClaims.getAddress();
  console.log("   InsuranceClaims deployed to:", insuranceClaimsAddress);

  console.log("\n✅ All contracts deployed successfully!\n");

  // Summary
  console.log("=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`MedChainCore:         ${medChainCoreAddress}`);
  console.log(`PatientRecords:       ${patientRecordsAddress}`);
  console.log(`AccessControlManager: ${accessControlAddress}`);
  console.log(`AuditLog:             ${auditLogAddress}`);
  console.log(`EmergencyAccess:      ${emergencyAccessAddress}`);
  console.log(`InsuranceClaims:      ${insuranceClaimsAddress}`);
  console.log("=".repeat(60));

  // Save deployment addresses
  const deploymentData = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      MedChainCore: medChainCoreAddress,
      PatientRecords: patientRecordsAddress,
      AccessControlManager: accessControlAddress,
      AuditLog: auditLogAddress,
      EmergencyAccess: emergencyAccessAddress,
      InsuranceClaims: insuranceClaimsAddress
    }
  };

  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentData, null, 2)
  );
  
  console.log(`\n📁 Deployment data saved to deployments/${hre.network.name}.json`);

  // Copy ABIs for frontend
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const contractNames = [
    "MedChainCore",
    "PatientRecords", 
    "AccessControlManager",
    "AuditLog",
    "EmergencyAccess",
    "InsuranceClaims"
  ];

  for (const name of contractNames) {
    const artifactPath = path.join(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`);
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      fs.writeFileSync(
        path.join(frontendContractsDir, `${name}.json`),
        JSON.stringify({ abi: artifact.abi }, null, 2)
      );
    }
  }

  // Create addresses file for frontend
  fs.writeFileSync(
    path.join(frontendContractsDir, "addresses.json"),
    JSON.stringify(deploymentData.contracts, null, 2)
  );

  console.log("📁 Contract ABIs and addresses copied to frontend/src/contracts/");

  return deploymentData;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
