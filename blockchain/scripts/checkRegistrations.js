const hre = require("hardhat");

async function main() {
  const fs = require("fs");
  const path = require("path");

  const deploymentPath = path.join(__dirname, "../deployments/localhost.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const vitalChainCoreAddress = deployment.contracts.VitalChainCore;
  const VitalChainCore = await hre.ethers.getContractFactory(
    "contracts/VitalChainCore.sol:VitalChainCore",
  );
  const vitalChainCore = VitalChainCore.attach(vitalChainCoreAddress);

  console.log("Checking registrations...\n");

  const patientAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const doctorAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

  const isPatient = await vitalChainCore.isRegisteredPatient(patientAddress);
  const isDoctor = await vitalChainCore.isActiveDoctor(doctorAddress);

  console.log(`Patient ${patientAddress}:`);
  console.log(`  Registered: ${isPatient}`);
  console.log();
  console.log(`Doctor ${doctorAddress}:`);
  console.log(`  Registered: ${isDoctor}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
