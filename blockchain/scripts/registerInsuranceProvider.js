const hre = require("hardhat");

async function main() {
  console.log("🏥 Registering Insurance Provider (Account 5)...\n");

  // Get signers - account 0 is admin, account 5 is the insurance provider
  const signers = await hre.ethers.getSigners();
  const admin = signers[0];
  const insuranceProvider = signers[5];

  console.log("Admin Address:", admin.address);
  console.log("Insurance Provider Address:", insuranceProvider.address);
  console.log(
    "Balance:",
    hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(insuranceProvider.address),
    ),
    "ETH\n",
  );

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

  // Register as insurance provider (admin registers the provider)
  console.log("1️⃣  Registering insurance provider...");
  try {
    // Admin calls the function to register the insurance provider
    const tx = await vitalChainCore.registerInsuranceProvider(
      insuranceProvider.address,
      "Blue Cross Health Insurance",
      "INS-54321",
    );
    await tx.wait();
    console.log(
      "   ✅ Insurance Provider registered:",
      insuranceProvider.address,
    );
    console.log("   📋 Name: Blue Cross Health Insurance");
    console.log("   📋 License: INS-54321");
  } catch (error) {
    if (error.message.includes("Provider already registered")) {
      console.log("   ℹ️  Insurance Provider already registered");
    } else {
      console.error("   ❌ Error:", error.message);
      throw error;
    }
  }

  console.log("\n✨ Registration complete!");
  console.log("\n📝 You can now use this account in MetaMask:");
  console.log("   Address:", insuranceProvider.address);
  console.log(
    "   Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
