const hre = require("hardhat");

async function main() {
  console.log("\n🔐 Granting Emergency Role\n");
  console.log("=".repeat(60));

  // Get the deployed contract addresses
  const vitalChainCoreAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Get signers
  const [deployer] = await hre.ethers.getSigners();

  console.log(`Deployer/Admin: ${deployer.address}`);
  console.log();

  // Get contract instance
  const VitalChainCore = await hre.ethers.getContractFactory(
    "contracts/VitalChainCore.sol:VitalChainCore",
  );
  const vitalChainCore = await VitalChainCore.attach(vitalChainCoreAddress);

  // Get the EMERGENCY_ROLE
  const EMERGENCY_ROLE = await vitalChainCore.EMERGENCY_ROLE();
  console.log(`EMERGENCY_ROLE: ${EMERGENCY_ROLE}`);
  console.log();

  // Doctor address to grant role to
  const doctorAddress =
    process.argv[2] || "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

  console.log(`Granting EMERGENCY_ROLE to: ${doctorAddress}`);

  // Check if already has role
  const hasRole = await vitalChainCore.hasRole(EMERGENCY_ROLE, doctorAddress);

  if (hasRole) {
    console.log("✅ Address already has EMERGENCY_ROLE");
  } else {
    console.log("Granting role...");
    const tx = await vitalChainCore.grantRole(EMERGENCY_ROLE, doctorAddress);
    await tx.wait();
    console.log("✅ EMERGENCY_ROLE granted successfully");

    // Verify
    const verified = await vitalChainCore.hasRole(
      EMERGENCY_ROLE,
      doctorAddress,
    );
    console.log(
      `Verification: ${verified ? "✅ Role confirmed" : "❌ Role not found"}`,
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
