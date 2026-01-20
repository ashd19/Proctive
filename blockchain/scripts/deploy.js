const hre = require("hardhat");

async function main() {
  console.log("🏥 Deploying VitalChain Health Exchange Contracts...\n");

  // Compile first so missing-import errors are shown early and with clearer guidance
  try {
    console.log("🔧 Compiling contracts...");
    await hre.run("compile");
  } catch (compileErr) {
    console.error("Compilation failed:", compileErr.message || compileErr);

    // If it's a missing-import (HH404) show diagnostics and suggestions
    const msg = (compileErr.message || "").toString();
    if (
      msg.includes("not found") &&
      / File .* imported from .* not found/i.test(msg)
    ) {
      // Try to extract "File X, imported from Y, not found"
      const m = msg.match(
        /File\s+(.*?)\,\s+imported\s+from\s+(.*?)\,\s+not\s+found/i,
      );
      const fs = require("fs");
      const path = require("path");
      const contractsDir = path.join(__dirname, "../contracts");

      if (m) {
        const missing = m[1].trim(); // e.g. ./VitalChainCore.sol
        const importer = m[2].trim(); // e.g. contracts/AccessControlManager.sol
        console.error("\nDetected missing import:");
        console.error(`  Missing:  ${missing}`);
        console.error(`  Imported from: ${importer}\n`);

        // Gather all .sol files under contracts dir
        function walk(dir) {
          let results = [];
          if (!fs.existsSync(dir)) return results;
          for (const entry of fs.readdirSync(dir)) {
            const p = path.join(dir, entry);
            const stat = fs.statSync(p);
            if (stat.isDirectory()) results = results.concat(walk(p));
            else if (entry.endsWith(".sol")) results.push(p);
          }
          return results;
        }

        const allSol = walk(contractsDir);
        if (allSol.length === 0) {
          console.error(
            "No .sol files found under contracts/. Check that your contracts directory exists.",
          );
        } else {
          console.error(
            "Searching for case-insensitive matches for the missing filename...",
          );
          const missingBase = path.basename(missing).toLowerCase();
          const ciMatches = allSol.filter(
            (p) => path.basename(p).toLowerCase() === missingBase,
          );
          if (ciMatches.length > 0) {
            console.error("\nPossible case/casing mismatch(s) found:");
            for (const match of ciMatches) {
              const rel = path.relative(path.join(__dirname, ".."), match);
              console.error(`  - ${rel}`);
              // Suggest an import path relative to the importer file
              const importerAbs = path.join(__dirname, "..", importer);
              const importerDir = path.dirname(importerAbs);
              const suggestedRel = path
                .relative(importerDir, match)
                .split(path.sep)
                .join("/");
              console.error(
                `    Suggested import (from ${importer}): import "${suggestedRel}";`,
              );
            }
          } else {
            console.error(
              "\nNo case-insensitive filename matches found under contracts/.",
            );
            console.error("Top-level contracts/ listing:");
            for (const p of allSol.slice(0, 200)) {
              console.error(
                `  - ${path.relative(path.join(__dirname, ".."), p)}`,
              );
            }
          }
        }

        console.error("\nPossible causes:");
        console.error(
          " - The imported filename is misspelled or has different casing (Linux is case-sensitive).",
        );
        console.error(
          " - The file exists in a different subfolder; update the import path to the correct relative path.",
        );
        console.error(
          "Fix the import or filename, then run: npx hardhat compile\n",
        );
      }
    }

    throw compileErr;
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await hre.ethers.provider.getBalance(deployer.address)).toString(),
  );
  console.log("");

  // 1. Deploy VitalChainCore
  console.log("1️⃣  Deploying VitalChainCore...");
  const VitalChainCoreFactory = await hre.ethers.getContractFactory(
    "VitalChainCore",
  );
  const vitalChainCore = await VitalChainCoreFactory.deploy();
  await vitalChainCore.waitForDeployment();
  const VitalChainCoreAddress = await vitalChainCore.getAddress();
  console.log("   VitalChainCore deployed to:", VitalChainCoreAddress);

  // 2. Deploy PatientRecords
  console.log("2️⃣  Deploying PatientRecords...");
  const PatientRecords = await hre.ethers.getContractFactory("PatientRecords");
  const patientRecords = await PatientRecords.deploy(VitalChainCoreAddress);
  await patientRecords.waitForDeployment();
  const patientRecordsAddress = await patientRecords.getAddress();
  console.log("   PatientRecords deployed to:", patientRecordsAddress);

  // 3. Deploy AccessControlManager
  console.log("3️⃣  Deploying AccessControlManager...");
  const AccessControlManager = await hre.ethers.getContractFactory(
    "AccessControlManager",
  );
  const accessControl = await AccessControlManager.deploy(
    VitalChainCoreAddress,
    patientRecordsAddress,
  );
  await accessControl.waitForDeployment();
  const accessControlAddress = await accessControl.getAddress();
  console.log("   AccessControlManager deployed to:", accessControlAddress);

  // 4. Deploy AuditLog
  console.log("4️⃣  Deploying AuditLog...");
  const AuditLog = await hre.ethers.getContractFactory("AuditLog");
  const auditLog = await AuditLog.deploy(
    VitalChainCoreAddress,
    patientRecordsAddress,
    accessControlAddress,
  );
  await auditLog.waitForDeployment();
  const auditLogAddress = await auditLog.getAddress();
  console.log("   AuditLog deployed to:", auditLogAddress);

  // 5. Deploy EmergencyAccess
  console.log("5️⃣  Deploying EmergencyAccess...");
  const EmergencyAccess = await hre.ethers.getContractFactory(
    "EmergencyAccess",
  );
  const emergencyAccess = await EmergencyAccess.deploy(
    VitalChainCoreAddress,
    patientRecordsAddress,
    accessControlAddress,
    auditLogAddress,
  );
  await emergencyAccess.waitForDeployment();
  const emergencyAccessAddress = await emergencyAccess.getAddress();
  console.log("   EmergencyAccess deployed to:", emergencyAccessAddress);

  // 6. Deploy InsuranceClaims
  console.log("6️⃣  Deploying InsuranceClaims...");
  const InsuranceClaims = await hre.ethers.getContractFactory(
    "InsuranceClaims",
  );
  const insuranceClaims = await InsuranceClaims.deploy(
    VitalChainCoreAddress,
    patientRecordsAddress,
    accessControlAddress,
    auditLogAddress,
  );
  await insuranceClaims.waitForDeployment();
  const insuranceClaimsAddress = await insuranceClaims.getAddress();
  console.log("   InsuranceClaims deployed to:", insuranceClaimsAddress);

  console.log("\n✅ All contracts deployed successfully!\n");

  // Summary
  console.log("=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`VitalChainCore:         ${VitalChainCoreAddress}`);
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
      VitalChainCore: VitalChainCoreAddress,
      PatientRecords: patientRecordsAddress,
      AccessControlManager: accessControlAddress,
      AuditLog: auditLogAddress,
      EmergencyAccess: emergencyAccessAddress,
      InsuranceClaims: insuranceClaimsAddress,
    },
  };

  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentData, null, 2),
  );

  console.log(
    `\n📁 Deployment data saved to deployments/${hre.network.name}.json`,
  );

  // Copy ABIs for frontend
  const frontendContractsDir = path.join(
    __dirname,
    "../../frontend/src/contracts",
  );
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const contractNames = [
    "VitalChainCore",
    "PatientRecords",
    "AccessControlManager",
    "AuditLog",
    "EmergencyAccess",
    "InsuranceClaims",
  ];

  for (const name of contractNames) {
    const artifactPath = path.join(
      __dirname,
      `../artifacts/contracts/${name}.sol/${name}.json`,
    );
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      fs.writeFileSync(
        path.join(frontendContractsDir, `${name}.json`),
        JSON.stringify({ abi: artifact.abi }, null, 2),
      );
    }
  }

  // Create addresses file for frontend
  fs.writeFileSync(
    path.join(frontendContractsDir, "addresses.json"),
    JSON.stringify(deploymentData.contracts, null, 2),
  );

  console.log(
    "📁 Contract ABIs and addresses copied to frontend/src/contracts/",
  );

  return deploymentData;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
