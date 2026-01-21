const hre = require("hardhat");

async function main() {
  console.log("\n🚨 Testing Emergency Access Protocol\n");
  console.log("=" .repeat(60));

  // Get contract instances
  const vitalChainCoreAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const patientRecordsAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const emergencyAccessAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const auditLogAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const VitalChainCore = await hre.ethers.getContractFactory("contracts/VitalChainCore.sol:VitalChainCore");
  const vitalChainCore = await VitalChainCore.attach(vitalChainCoreAddress);

  const PatientRecords = await hre.ethers.getContractFactory("PatientRecords");
  const patientRecords = await PatientRecords.attach(patientRecordsAddress);

  const EmergencyAccess = await hre.ethers.getContractFactory("EmergencyAccess");
  const emergencyAccess = await EmergencyAccess.attach(emergencyAccessAddress);

  const AuditLog = await hre.ethers.getContractFactory("AuditLog");
  const auditLog = await AuditLog.attach(auditLogAddress);

  // Get signers
  const [deployer, patient, patient2, doctor, hospital] = await hre.ethers.getSigners();

  console.log("📋 Test Accounts:");
  console.log(`  Deployer: ${deployer.address}`);
  console.log(`  Patient:  ${patient.address}`);
  console.log(`  Patient2: ${patient2.address}`);
  console.log(`  Doctor:   ${doctor.address}`);
  console.log(`  Hospital: ${hospital.address}`);
  console.log();

  try {
    // Step 1: Verify entities are registered (skip registration as they should already exist)
    console.log("1️⃣  Checking entity registrations...");
    
    // Use patient2 to avoid cooldown issues
    const isPatient2Registered = await vitalChainCore.isRegisteredPatient(patient2.address);
    console.log(`   Patient2 registered: ${isPatient2Registered ? '✅' : '❌'}`);
    
    if (!isPatient2Registered) {
      console.log("   Registering patient2...");
      const tx1 = await vitalChainCore.connect(patient2).registerPatient();
      await tx1.wait();
      console.log("   ✅ Patient2 registered");
    }
    
    // Check if doctor and hospital exist via role checking
    const DOCTOR_ROLE = await vitalChainCore.DOCTOR_ROLE();
    const HOSPITAL_ROLE = await vitalChainCore.HOSPITAL_ROLE();
    const hasDoctorRole = await vitalChainCore.hasRole(DOCTOR_ROLE, doctor.address);
    const hasHospitalRole = await vitalChainCore.hasRole(HOSPITAL_ROLE, hospital.address);
    
    console.log(`   Doctor has DOCTOR_ROLE: ${hasDoctorRole ? '✅' : '❌'}`);
    console.log(`   Hospital has HOSPITAL_ROLE: ${hasHospitalRole ? '✅' : '❌'}`);
    
    if (!hasDoctorRole) {
      console.log("   Granting DOCTOR_ROLE...");
      const tx2 = await vitalChainCore.connect(deployer).grantRole(DOCTOR_ROLE, doctor.address);
      await tx2.wait();
      console.log("   ✅ Doctor role granted");
    }
    
    if (!hasHospitalRole) {
      console.log("   Granting HOSPITAL_ROLE...");
      const tx3 = await vitalChainCore.connect(deployer).grantRole(HOSPITAL_ROLE, hospital.address);
      await tx3.wait();
      console.log("   ✅ Hospital role granted");
    }
    console.log();

    // Step 2: Grant emergency role to doctor
    console.log("2️⃣  Granting EMERGENCY_ROLE to doctor...");
    const EMERGENCY_ROLE = await vitalChainCore.EMERGENCY_ROLE();
    const hasEmergencyRole = await vitalChainCore.hasRole(EMERGENCY_ROLE, doctor.address);
    
    if (!hasEmergencyRole) {
      const tx = await vitalChainCore.connect(deployer).grantRole(EMERGENCY_ROLE, doctor.address);
      await tx.wait();
      console.log("   ✅ Emergency role granted");
      
      // Verify the role was granted
      const verified = await vitalChainCore.hasRole(EMERGENCY_ROLE, doctor.address);
      console.log(`   Verification: ${verified ? '✅ Role confirmed' : '❌ Role not found'}`);
    } else {
      console.log("   ℹ️  Doctor already has emergency role");
    }
    console.log();

    // Step 3: Create a medical record for patient2
    console.log("3️⃣  Creating medical record for patient2...");
    const createTx = await patientRecords.connect(doctor).createRecord(
      patient2.address,
      0, // General record type
      "QmTestIPFSHash123", // IPFS hash
      "0x1234567890abcdef", // Encrypted key
      "0xabcdef1234567890", // Metadata hash
      "Patient Medical History",
      "Complete medical history and current medications",
      "General Hospital",
      "Dr. Sarah Johnson",
      ["history", "medications"]
    );
    const createReceipt = await createTx.wait();
    
    // Get record ID from event
    const createEvent = createReceipt.logs.find(log => {
      try {
        const parsed = patientRecords.interface.parseLog(log);
        return parsed?.name === "RecordCreated";
      } catch {
        return false;
      }
    });
    const recordId = createEvent ? Number(patientRecords.interface.parseLog(createEvent).args[0]) : 1;
    console.log(`   ✅ Record created with ID: ${recordId}`);
    console.log();

    // Step 4: Get emergency config
    console.log("4️⃣  Emergency Access Configuration:");
    const config = await emergencyAccess.getConfig();
    console.log(`   Max Session Duration: ${Number(config.maxSessionDuration) / 3600} hours`);
    console.log(`   Cooldown Period: ${Number(config.cooldownPeriod) / 3600} hours`);
    console.log(`   Requires Justification: ${config.requiresJustification}`);
    console.log(`   Auto-Flag Threshold: ${config.autoFlagThreshold} sessions`);
    console.log();

    // Step 5: Start emergency session
    console.log("5️⃣  Starting emergency access session...");
    
    // Check if doctor already has an active session
    const existingSessionId = await emergencyAccess.getActiveSession(doctor.address);
    let sessionId;
    
    if (existingSessionId > 0) {
      console.log(`   ℹ️  Doctor already has active session #${existingSessionId}`);
      console.log("   Ending existing session first...");
      try {
        const endTx = await emergencyAccess.connect(doctor).endEmergencySession(
          "Previous test session completed"
        );
        await endTx.wait();
        console.log("   ✅ Previous session ended");
      } catch (e) {
        console.log("   ⚠️  Could not end previous session, continuing...");
      }
    }
    
    const startTx = await emergencyAccess.connect(doctor).startEmergencySession(
      patient2.address,
      "Patient suffered cardiac arrest in ER. Immediate access to medical history required for life-saving treatment.",
      "Dr. Sarah Johnson",
      "General Hospital ER"
    );
    const startReceipt = await startTx.wait();
    
    // Get session ID from event
    const sessionEvent = startReceipt.logs.find(log => {
      try {
        const parsed = emergencyAccess.interface.parseLog(log);
        return parsed?.name === "EmergencySessionStarted";
      } catch {
        return false;
      }
    });
    sessionId = sessionEvent ? Number(emergencyAccess.interface.parseLog(sessionEvent).args[0]) : 1;
    console.log(`   ✅ Emergency session started with ID: ${sessionId}`);
    console.log();

    // Step 6: Access the record during emergency
    console.log("6️⃣  Accessing patient record during emergency...");
    const accessTx = await emergencyAccess.connect(doctor).accessRecordInEmergency(
      recordId,
      "0x192.168.1.1", // IP address hash (simplified)
      "0xChrome/ER-Terminal" // Device info hash (simplified)
    );
    await accessTx.wait();
    console.log(`   ✅ Record ${recordId} accessed during emergency`);
    console.log();

    // Step 7: Get session details
    console.log("7️⃣  Session Details:");
    const session = await emergencyAccess.getSession(sessionId);
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Doctor: ${session.doctor}`);
    console.log(`   Patient: ${session.patient}`);
    console.log(`   Reason: ${session.reason}`);
    console.log(`   Hospital: ${session.hospitalName}`);
    console.log(`   Doctor Name: ${session.doctorName}`);
    console.log(`   Records Accessed: ${session.accessedRecords.length}`);
    console.log(`   Status: ${getStatusName(session.status)}`);
    console.log();

    // Step 8: Check audit logs
    console.log("8️⃣  Checking audit logs...");
    const filter = auditLog.filters.EmergencyAccessLogged();
    const events = await auditLog.queryFilter(filter);
    console.log(`   ✅ Found ${events.length} emergency access audit log(s)`);
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      console.log(`   Last Emergency Access:`);
      console.log(`     Patient: ${lastEvent.args.patient}`);
      console.log(`     Record ID: ${lastEvent.args.recordId}`);
      console.log(`     Doctor: ${lastEvent.args.doctorName}`);
      console.log(`     Hospital: ${lastEvent.args.hospitalName}`);
      console.log(`     Reason: ${lastEvent.args.reason}`);
    }
    console.log();

    // Step 9: End emergency session
    console.log("9️⃣  Ending emergency session...");
    const endTx = await emergencyAccess.connect(doctor).endEmergencySession(
      "Cardiac arrest successfully treated. Patient stabilized with defibrillation and medications. Transferred to ICU."
    );
    await endTx.wait();
    console.log("   ✅ Emergency session ended");
    console.log();

    // Step 10: Get final session status
    console.log("🔟 Final Session Status:");
    const finalSession = await emergencyAccess.getSession(sessionId);
    const duration = Number(finalSession.endTime) - Number(finalSession.startTime);
    console.log(`   Status: ${getStatusName(finalSession.status)}`);
    console.log(`   Duration: ${duration} seconds`);
    console.log(`   Diagnosis: ${finalSession.diagnosis}`);
    console.log();

    // Step 11: Test flagging (optional - by patient)
    console.log("1️⃣1️⃣  Testing session flagging (by patient)...");
    try {
      const flagTx = await emergencyAccess.connect(patient).flagSession(
        sessionId,
        "Patient wants to review this emergency access for verification"
      );
      await flagTx.wait();
      console.log("   ✅ Session flagged for review");
      
      const flaggedSession = await emergencyAccess.getSession(sessionId);
      console.log(`   New Status: ${getStatusName(flaggedSession.status)}`);
    } catch (error) {
      console.log(`   ℹ️  Cannot flag (may already be in final state)`);
    }
    console.log();

    // Step 12: Test review (by hospital)
    console.log("1️⃣2️⃣  Testing session review (by hospital admin)...");
    try {
      const reviewTx = await emergencyAccess.connect(hospital).reviewSession(
        sessionId,
        true, // Approved
        "Emergency access was appropriate given the life-threatening situation. All protocols followed correctly."
      );
      await reviewTx.wait();
      console.log("   ✅ Session reviewed and approved");
      
      const reviewedSession = await emergencyAccess.getSession(sessionId);
      console.log(`   Final Status: ${getStatusName(reviewedSession.status)}`);
    } catch (error) {
      console.log(`   ℹ️  Review may not be applicable for current status`);
    }
    console.log();

    // Summary
    console.log("=" .repeat(60));
    console.log("✅ Emergency Access Protocol Test Complete!");
    console.log();
    console.log("📊 Summary:");
    console.log(`  ✓ Emergency session created: #${sessionId}`);
    console.log(`  ✓ Medical records accessed: ${finalSession.accessedRecords.length}`);
    console.log(`  ✓ Audit logs generated: ${events.length}`);
    console.log(`  ✓ Session properly closed with diagnosis`);
    console.log();
    console.log("🔍 Key Features Demonstrated:");
    console.log("  ✓ Emergency role authorization");
    console.log("  ✓ Bypass of standard consent in emergencies");
    console.log("  ✓ Complete audit trail generation");
    console.log("  ✓ Session lifecycle management");
    console.log("  ✓ Patient/hospital review capability");
    console.log("=" .repeat(60));
    console.log();

  } catch (error) {
    console.error("❌ Error during testing:", error.message);
    throw error;
  }
}

function getStatusName(status) {
  const names = ['Active', 'Completed', 'Flagged', 'Reviewed', 'Approved', 'Rejected'];
  return names[Number(status)] || 'Unknown';
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
