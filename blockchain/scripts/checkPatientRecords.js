const hre = require("hardhat");

async function main() {
  console.log("Checking patient records...\n");

  const patientRecords = await hre.ethers.getContractAt(
    "PatientRecords",
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  );

  const accounts = await hre.ethers.getSigners();
  
  const patients = [
    { name: "Deployer", address: accounts[0].address },
    { name: "Account 1", address: accounts[1].address },
    { name: "Account 2", address: accounts[2].address },
  ];

  console.log("Patient Addresses:");
  patients.forEach(p => console.log(`  ${p.name}: ${p.address}`));
  console.log();

  for (const patient of patients) {
    console.log(`\nRecords for ${patient.name} (${patient.address}):`);
    try {
      const recordIds = await patientRecords.getPatientRecordIds(patient.address);
      console.log(`  Record IDs: [${recordIds.join(", ")}]`);
      console.log(`  Total records: ${recordIds.length}`);

      for (const recordId of recordIds) {
        try {
          const record = await patientRecords.getRecord(recordId);
          console.log(`\n  ✅ Record ID ${recordId}:`);
          console.log(`    Title: ${record.metadata.title}`);
          console.log(`    Description: ${record.metadata.description}`);
          console.log(`    Hospital: ${record.metadata.hospitalName || 'N/A'}`);
          console.log(`    Doctor: ${record.metadata.doctorName || 'N/A'}`);
          console.log(`    Created: ${new Date(Number(record.createdAt) * 1000).toLocaleString()}`);
        } catch (err) {
          console.log(`    ❌ Error getting record: ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`  ❌ No records or error: ${err.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
