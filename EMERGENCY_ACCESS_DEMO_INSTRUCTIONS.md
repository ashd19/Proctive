# 🚨 Emergency Access Protocol - Demo Instructions

## Quick Setup ✅

The demo environment is already set up! Medical records have been created for the test patient.

## 📋 Demo Data Summary

**Patient with Records:**
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Hardhat Account #1)
- Has 4 medical records:
  1. Complete Medical History (Diabetes, Hypertension, Cholesterol)
  2. ⚠️ CRITICAL: Allergy Information (Penicillin, Aspirin, Sulfa drugs)
  3. Current Medications (Metformin, Lisinopril, Atorvastatin)
  4. Recent Lab Results (Jan 2026)

**Doctor:**
- Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (Hardhat Account #2)
- Has EMERGENCY_ROLE and DOCTOR_ROLE
- Can access patient records during emergencies

## 🎬 How to Demo in the Website

### Step 1: Connect as Doctor
1. Open the website at `http://localhost:5173`
2. Connect MetaMask wallet
3. **Important:** Switch to Hardhat Account #2
   - Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - This is the doctor account with emergency access rights

### Step 2: Navigate to Emergency Access
1. Click on "Doctor" in the navbar
2. Select "Emergency Access" from the dropdown

### Step 3: Start an Emergency Session
1. Click the "Start Emergency Session" button
2. Fill in the form:
   - **Patient Address:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - **Diagnosis/Reason:** `Cardiac emergency - patient unconscious`
   - **Duration:** `120` minutes (2 hours)
3. Click "Start Session"
4. Confirm the transaction in MetaMask

### Step 4: View Patient Records
1. Once the session is active, you'll see it in the "Active Sessions" section
2. Click the "View Patient Records" button
3. You'll see all 4 medical records displayed with:
   - ✅ Record titles
   - ✅ Descriptions
   - ✅ Hospital names
   - ✅ Doctor names
   - ✅ Tags (diagnosis codes)
   - ✅ Creation dates

### Step 5: Close Emergency Session
1. When done, click "Close Session"
2. Add closure notes: `Patient stabilized, transferred to ICU`
3. Confirm the transaction

## 🔑 Hardhat Account Details

### Import these accounts into MetaMask:

**Account 0 - Admin/Deployer:**
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Account 1 - Patient (HAS RECORDS):**
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Account 2 - Doctor (USE THIS FOR DEMO):**
```
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

## 📝 What Records Will Be Displayed

When you click "View Patient Records" in the emergency session, you'll see:

### Record 1: Complete Medical History
- **Hospital:** City General Hospital
- **Doctor:** Dr. Sarah Johnson
- **Tags:** `#chronic`, `#diabetes`, `#hypertension`
- **Description:** Detailed medical history with chronic conditions

### Record 2: ⚠️ CRITICAL: Allergy Information
- **Hospital:** City General Hospital
- **Doctor:** Dr. Sarah Johnson
- **Tags:** `#allergy`, `#critical`, `#emergency`
- **Description:** CRITICAL ALLERGIES - Penicillin, Aspirin, Sulfa drugs

### Record 3: Current Medications
- **Hospital:** City General Hospital
- **Doctor:** Dr. Sarah Johnson
- **Tags:** `#medications`, `#active`
- **Description:** Active prescriptions and dosages

### Record 4: Recent Lab Results (Jan 2026)
- **Hospital:** City General Hospital
- **Doctor:** Dr. Sarah Johnson
- **Tags:** `#labs`, `#results`, `#diabetes`
- **Description:** Latest laboratory test results

## ✅ Expected Behavior

1. **Before Emergency Session:**
   - Doctor CANNOT access patient records
   - Normal consent required

2. **During Emergency Session:**
   - Doctor CAN access all patient records
   - Records displayed immediately
   - No consent needed (emergency bypass)
   - All access logged on blockchain

3. **After Session Closed:**
   - Emergency access revoked
   - Session logged with closure notes
   - Immutable audit trail created

## 🚫 Troubleshooting

### "No emergency access rights"
- Make sure you're connected with Account #2 (doctor)
- Run: `npx hardhat run scripts/setupEmergencyDemo.js` to grant roles

### "Patient not registered"
- The patient (Account #1) is already registered
- Use the exact address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

### "No records showing"
- Verify you started session with the correct patient address
- Check that you're viewing the active session's records
- Records should display automatically when you click "View Patient Records"

### Transaction fails
- Make sure Hardhat node is running: `npx hardhat node`
- Check MetaMask is connected to `Localhost 8545`
- Verify you have enough test ETH

## 🎯 Key Features to Highlight

1. **Instant Access:** No waiting for patient consent in emergencies
2. **Complete Records:** All medical history, allergies, medications visible
3. **Critical Alerts:** Allergy information prominently displayed
4. **Audit Trail:** Every access logged on blockchain
5. **Time-Limited:** Sessions auto-expire after set duration
6. **Accountability:** Requires diagnosis/justification for access

## 📊 Blockchain Verification

To verify the records exist:
```bash
cd blockchain
npx hardhat run scripts/checkPatientRecords.js --network localhost
```

Expected output:
```
Records for Account 1 (0x70997970C51812dc3A010C7d01b50e0d17dc79C8):
  Record IDs: [1, 2, 3, 4]
  Total records: 4
```

## 🎪 Presentation Tips

1. **Show the Problem:** First try to access records normally (denied)
2. **Show the Solution:** Start emergency session (immediate access)
3. **Highlight Safety:** Point out all access is logged
4. **Show Closure:** Demonstrate proper session termination
5. **Show Audit:** View the immutable access logs

---

**You're all set! 🎉**  
Connect as the doctor (Account #2) and start the emergency session with patient `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
