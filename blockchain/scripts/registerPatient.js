const hre = require("hardhat");

async function main() {
  console.log("\n👤 Registering Patient\n");
  console.log("=".repeat(60));

  // Get the deployed contract address
  const vitalChainCoreAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Patient address to register (default to deployer if not provided)
  const patientAddress =
    process.argv[2] || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  console.log(`Patient address: ${patientAddress}`);
  console.log();

  // Get contract instance
  const VitalChainCore = await hre.ethers.getContractFactory(
    "contracts/VitalChainCore.sol:VitalChainCore",
  );
  const vitalChainCore = await VitalChainCore.attach(vitalChainCoreAddress);

  // Check if already registered
  const isRegistered = await vitalChainCore.isRegisteredPatient(patientAddress);

  if (isRegistered) {
    console.log("✅ Patient is already registered");
  } else {
    console.log("Registering patient...");

    // Get signer for the patient address
    const patient = await hre.ethers.getSigner(patientAddress);

    const tx = await vitalChainCore.connect(patient).registerPatient();
    await tx.wait();

    console.log("✅ Patient registered successfully");

    // Verify
    const verified = await vitalChainCore.isRegisteredPatient(patientAddress);
    console.log(
      `Verification: ${
        verified ? "✅ Registration confirmed" : "❌ Registration not found"
      }`,
    );
  }

  console.log();
  console.log("=".repeat(60));
  console.log("✅ Done!");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
