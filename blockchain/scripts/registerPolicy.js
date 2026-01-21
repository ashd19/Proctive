const hre = require("hardhat");

async function main() {
  console.log("📋 Registering Insurance Policy...\n");

  // Get signers
  const signers = await hre.ethers.getSigners();
  const patient = signers[0]; // Account 0 (deployer/patient)
  const insuranceProvider = signers[5]; // Account 5 (insurance provider)

  console.log("Patient Address:", patient.address);
  console.log("Insurance Provider Address:", insuranceProvider.address);

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
  const insuranceClaimsAddress = deployment.contracts.InsuranceClaims;

  // Get InsuranceClaims contract
  const InsuranceClaims = await hre.ethers.getContractFactory(
    "InsuranceClaims",
  );
  const insuranceClaims = InsuranceClaims.attach(insuranceClaimsAddress);

  console.log("📝 Connected to InsuranceClaims at:", insuranceClaimsAddress);
  console.log("");

  // Register policy (insurance provider calls this)
  console.log("1️⃣  Registering insurance policy for patient...");
  try {
    const insuranceClaimsAsProvider =
      insuranceClaims.connect(insuranceProvider);

    const policyNumber = "POL-DEFAULT";
    const coverageLimit = hre.ethers.parseEther("100000"); // $100k coverage
    const deductible = hre.ethers.parseEther("1000"); // $1k deductible
    const startDate = Math.floor(Date.now() / 1000) - 86400; // Started yesterday
    const endDate = Math.floor(Date.now() / 1000) + 365 * 86400; // Ends in 1 year
    const coveredProcedures = [
      "Hospitalization",
      "Surgery",
      "Outpatient",
      "Medication",
      "Diagnostic",
    ];

    const tx = await insuranceClaimsAsProvider.registerPolicy(
      policyNumber,
      patient.address,
      coverageLimit,
      deductible,
      startDate,
      endDate,
      coveredProcedures,
    );
    await tx.wait();

    console.log("   ✅ Policy registered:", policyNumber);
    console.log("   📋 Patient:", patient.address);
    console.log("   📋 Insurance Provider:", insuranceProvider.address);
    console.log("   📋 Coverage Limit: $100,000");
    console.log("   📋 Deductible: $1,000");
    console.log("   📋 Valid from now until 1 year");
  } catch (error) {
    if (error.message.includes("Policy already exists")) {
      console.log("   ℹ️  Policy already registered");
    } else {
      console.error("   ❌ Error:", error.message);
      throw error;
    }
  }

  console.log("\n✨ Policy registration complete!");
  console.log(
    "\n📝 Now you can submit claims using policy number: POL-DEFAULT",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
