# 🚨 Emergency Access Protocol - Complete Implementation & Testing Guide

## Overview

The Emergency Access Protocol allows authorized doctors to bypass standard patient consent in life-threatening situations. All emergency access events are permanently logged on the blockchain for audit and review.

---

## ✅ Implementation Status

### Smart Contracts (✅ Complete)

**EmergencyAccess.sol** - Fully implemented with:

- ✅ Emergency session lifecycle management
- ✅ Role-based access control (EMERGENCY_ROLE)
- ✅ Automatic flagging after threshold
- ✅ Cooldown period enforcement
- ✅ Audit trail generation
- ✅ Patient/hospital review system
- ✅ Session status tracking (ACTIVE → COMPLETED → FLAGGED → REVIEWED → APPROVED/REJECTED)

**Key Features:**

- Maximum session duration (default: 4 hours)
- Cooldown period between sessions (default: 24 hours)
- Auto-flag after threshold (default: 5 sessions)
- Complete event emissions for tracking
- Integration with AuditLog, PatientRecords, and AccessControlManager

### Frontend (✅ Complete)

**Service Layer:**

- `/frontend/src/services/emergencyAccessService.ts` - Full API integration

**UI Components:**

- `/frontend/src/pages/doctor/DoctorEmergency.tsx` - Basic emergency access UI
- `/frontend/src/pages/doctor/DoctorEmergencyNew.tsx` - Advanced emergency session management

**Features:**

- Start/end emergency sessions with justification
- View active and historical sessions
- Access patient records during emergency
- Session statistics dashboard
- Flagging and review capabilities

---

## 🏗️ Architecture

### Smart Contract Integration

```
EmergencyAccess.sol
├── VitalChainCore (Role management)
├── PatientRecords (Record verification)
├── AccessControlManager (Permission validation)
└── AuditLog (Emergency event logging)
```

### Session Lifecycle

```
START SESSION
    ↓
ACTIVE (Doctor can access records)
    ↓
END SESSION → COMPLETED
    ↓ (Optional)
FLAG FOR REVIEW → FLAGGED
    ↓
HOSPITAL/ADMIN REVIEW → APPROVED/REJECTED
```

---

## 🧪 How to Test

### Prerequisites

1. **Blockchain node running:**

   ```bash
   cd blockchain
   npx hardhat node
   ```

2. **Contracts deployed:**

   ```bash
   cd blockchain
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Test entities registered:**
   ```bash
   cd blockchain
   npx hardhat run scripts/registerTestEntities.js --network localhost
   ```

### Automated Testing

Run the comprehensive test script:

```bash
cd blockchain
npx hardhat run scripts/testEmergencyAccess.js --network localhost
```

**This test demonstrates:**

1. ✅ Entity registration (patient, doctor, hospital)
2. ✅ Emergency role assignment to doctor
3. ✅ Medical record creation
4. ✅ Starting emergency session with justification
5. ✅ Accessing records during emergency
6. ✅ Audit log generation
7. ✅ Ending emergency session with diagnosis
8. ✅ Patient flagging capability
9. ✅ Hospital administrative review

**Expected Output:**

```
🚨 Testing Emergency Access Protocol
============================================================
📋 Test Accounts:
  Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  Patient:  0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  Doctor:   0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  Hospital: 0x90F79bf6EB2c4f870365E785982E1f101E93b906

1️⃣  Checking entity registrations...
   ✅ Patient registered
   ✅ Doctor has DOCTOR_ROLE
   ✅ Hospital has HOSPITAL_ROLE

2️⃣  Granting EMERGENCY_ROLE to doctor...
   ✅ Emergency role granted

3️⃣  Creating medical record...
   ✅ Record created with ID: 1

4️⃣  Emergency Access Configuration:
   Max Session Duration: 4 hours
   Cooldown Period: 24 hours
   Requires Justification: true
   Auto-Flag Threshold: 5 sessions

5️⃣  Starting emergency access session...
   ✅ Emergency session started with ID: 1

6️⃣  Accessing patient record during emergency...
   ✅ Record 1 accessed during emergency

7️⃣  Session Details:
   Session ID: 1
   Doctor: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
   Patient: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   Reason: Patient suffered cardiac arrest...
   Records Accessed: 1
   Status: Active

8️⃣  Checking audit logs...
   ✅ Found 1 emergency access audit log(s)

9️⃣  Ending emergency session...
   ✅ Emergency session ended

🔟 Final Session Status:
   Status: Completed
   Duration: 2 seconds
   Diagnosis: Cardiac arrest successfully treated...

1️⃣1️⃣  Testing session flagging (by patient)...
   ✅ Session flagged for review

1️⃣2️⃣  Testing session review (by hospital admin)...
   ✅ Session reviewed and approved

============================================================
✅ Emergency Access Protocol Test Complete!
```

---

## 🖥️ Frontend Testing

### 1. Start Frontend

```bash
cd frontend
npm run dev
```

### 2. Test as Doctor

#### A. Request Emergency Access

1. Navigate to `/doctor/emergency`
2. Click "Request Emergency Access" button
3. Fill in:
   - **Patient Address:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - **Reason:** "Patient collapsed in ER with cardiac arrest. Immediate access to medical history required."
4. Submit request

#### B. Start Emergency Session

1. Click "Start Emergency Session"
2. Enter:
   - **Patient Address**
   - **Justification** (detailed reason)
   - **Your Name**
   - **Hospital Name**
3. Confirm transaction

#### C. Access Records During Emergency

1. While session is active, navigate to patient records
2. Records will be accessible without consent
3. Each access is logged in the audit trail

#### D. End Emergency Session

1. Return to Emergency Access page
2. Click "End Session"
3. Enter diagnosis/outcome
4. Confirm transaction

### 3. Test as Patient

1. Navigate to `/patient/audit`
2. View emergency access events
3. Flag suspicious sessions for review
4. See complete audit trail

### 4. Test as Hospital Admin

1. Navigate to emergency access review panel
2. View flagged sessions
3. Review justification and records accessed
4. Approve or reject with notes

---

## 📊 Key Smart Contract Functions

### For Doctors

```solidity
// Start emergency session
function startEmergencySession(
    address _patient,
    string memory _reason,
    string memory _doctorName,
    string memory _hospitalName
) external returns (uint256 sessionId)

// Access record during emergency
function accessRecordInEmergency(
    uint256 _recordId,
    string memory _ipAddressHash,
    string memory _deviceInfoHash
) external

// End emergency session
function endEmergencySession(
    string memory _diagnosis
) external
```

### For Patients/Hospitals

```solidity
// Flag session for review
function flagSession(
    uint256 _sessionId,
    string memory _reason
) external

// Review flagged session (hospital/admin only)
function reviewSession(
    uint256 _sessionId,
    bool _approved,
    string memory _notes
) external
```

### View Functions

```solidity
// Get session details
function getSession(uint256 _sessionId) external view returns (...)

// Get doctor's active session
function getActiveSession(address _doctor) external view returns (uint256)

// Get patient's emergency sessions
function getPatientEmergencySessionIds(address _patient) external view returns (uint256[])

// Get flagged sessions
function getFlaggedSessionIds() external view returns (uint256[])

// Check if session is active
function isSessionActive(address _doctor) external view returns (bool)
```

---

## 🔐 Security Features

### 1. Role-Based Access Control

- Only doctors with `EMERGENCY_ROLE` can start sessions
- Role must be granted by admin/hospital

### 2. Cooldown Period

- Prevents abuse by enforcing 24-hour cooldown between emergency accesses
- Same doctor cannot repeatedly access same patient

### 3. Session Expiration

- Sessions automatically expire after max duration (4 hours)
- Prevents indefinite emergency access

### 4. Automatic Flagging

- After 5 emergency sessions, doctor is auto-flagged
- Triggers administrative review

### 5. Complete Audit Trail

- All accesses logged with:
  - Timestamp
  - Justification
  - Records accessed
  - IP address hash
  - Device info hash

### 6. Patient Review Rights

- Patients can flag any emergency session
- Hospital admins review flagged sessions
- Approval/rejection permanently recorded

---

## 📝 Event Emissions

All events are emitted for frontend tracking:

```solidity
event EmergencySessionStarted(
    uint256 indexed sessionId,
    address indexed doctor,
    address indexed patient,
    string reason,
    uint256 timestamp
)

event EmergencyRecordAccessed(
    uint256 indexed sessionId,
    address indexed doctor,
    address indexed patient,
    uint256 recordId,
    uint256 timestamp
)

event EmergencySessionEnded(
    uint256 indexed sessionId,
    address indexed doctor,
    address indexed patient,
    uint256 duration,
    uint256 recordsAccessed
)

event EmergencySessionFlagged(
    uint256 indexed sessionId,
    address indexed flaggedBy,
    string reason,
    uint256 timestamp
)

event EmergencySessionReviewed(
    uint256 indexed sessionId,
    address indexed reviewedBy,
    EmergencyStatus newStatus,
    string notes,
    uint256 timestamp
)
```

---

## 🎯 Testing Scenarios

### Scenario 1: Life-Threatening Emergency (Valid Use)

**Situation:** Patient arrives unconscious after accident

1. Doctor starts emergency session with reason: "Patient unconscious after motor vehicle accident. Unknown medical history. Need to check for allergies and pre-existing conditions."
2. Doctor accesses medical history
3. Doctor views allergy information
4. Treatment administered safely
5. Session ended with diagnosis
6. **Result:** ✅ Appropriate use, should be approved if reviewed

### Scenario 2: Abuse Prevention (Invalid Use)

**Situation:** Doctor repeatedly uses emergency access on same patient

1. Doctor starts emergency session
2. System checks last access time
3. **Result:** ❌ Rejected due to cooldown period

### Scenario 3: Auto-Flagging

**Situation:** Doctor uses emergency access frequently

1. Doctor completes 5th emergency session
2. System auto-flags for review
3. Hospital admin receives notification
4. Admin reviews all 5 sessions
5. **Result:** Appropriate action taken (approval/rejection)

### Scenario 4: Patient Review

**Situation:** Patient questions emergency access

1. Patient views audit log
2. Patient flags session with reason: "I was not unconscious, this access was unnecessary"
3. Hospital admin investigates
4. Admin interviews staff and reviews
5. **Result:** Session rejected, disciplinary action if needed

---

## 🛠️ Configuration

Update emergency access settings (hospital/admin only):

```solidity
function updateConfig(
    uint256 _maxSessionDuration,     // e.g., 4 hours = 14400 seconds
    uint256 _cooldownPeriod,         // e.g., 24 hours = 86400 seconds
    bool _requiresJustification,     // true/false
    uint256 _autoFlagThreshold       // e.g., 5 sessions
) external
```

**Recommended Settings:**

- Max Session Duration: 4 hours (14400 seconds)
- Cooldown Period: 24 hours (86400 seconds)
- Requires Justification: true
- Auto-Flag Threshold: 5 sessions

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **Total Emergency Sessions**

   - Active, completed, flagged

2. **Doctor Statistics**

   - Sessions per doctor
   - Auto-flagged doctors
   - Average session duration

3. **Patient Impact**

   - Patients accessed via emergency
   - Patient-initiated flags

4. **Review Outcomes**
   - Approval rate
   - Rejection rate
   - Average review time

### Query Functions

```typescript
// Get all doctor's sessions
const sessions = await emergencyAccess.getDoctorEmergencySessionIds(
  doctorAddress,
);

// Get patient's emergency history
const patientSessions = await emergencyAccess.getPatientEmergencySessionIds(
  patientAddress,
);

// Get flagged sessions
const flagged = await emergencyAccess.getFlaggedSessionIds();
```

---

## ✅ Testing Checklist

- [ ] Doctor can start emergency session with valid justification
- [ ] Doctor cannot start multiple sessions simultaneously
- [ ] Cooldown period is enforced
- [ ] Records can be accessed during active session
- [ ] Session expires after max duration
- [ ] Session can be ended with diagnosis
- [ ] Audit logs are generated for each access
- [ ] Auto-flagging triggers after threshold
- [ ] Patient can flag sessions
- [ ] Hospital admin can review flagged sessions
- [ ] Review decisions are permanently recorded
- [ ] Events are properly emitted
- [ ] Configuration can be updated by admin

---

## 🚀 Quick Start Commands

```bash
# Terminal 1: Start blockchain
cd blockchain
npx hardhat node

# Terminal 2: Deploy contracts
cd blockchain
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Register test entities
cd blockchain
npx hardhat run scripts/registerTestEntities.js --network localhost

# Terminal 4: Test emergency access
cd blockchain
npx hardhat run scripts/testEmergencyAccess.js --network localhost

# Terminal 5: Start frontend
cd frontend
npm run dev
```

---

## 📚 Additional Resources

- **Contract Source:** `/blockchain/contracts/EmergencyAccess.sol`
- **Test Script:** `/blockchain/scripts/testEmergencyAccess.js`
- **Frontend Service:** `/frontend/src/services/emergencyAccessService.ts`
- **Doctor UI:** `/frontend/src/pages/doctor/DoctorEmergencyNew.tsx`
- **Audit Guide:** `/mds/EMERGENCY_ACCESS_GUIDE.md`

---

## 🎓 Best Practices

1. **Always provide detailed justification** - Vague reasons may be flagged
2. **End sessions promptly** - Don't leave sessions open longer than needed
3. **Document diagnosis** - Helps with review process
4. **Review audit logs regularly** - Both doctors and patients should monitor
5. **Report suspicious activity** - Flag any questionable emergency access
6. **Train staff properly** - Ensure all emergency staff understand protocol

---

## ⚠️ Important Notes

- Emergency access should **ONLY** be used in genuine life-threatening situations
- All emergency accesses are **permanently recorded** on the blockchain
- Abuse of emergency access may result in **loss of privileges** and legal action
- Patients retain the right to **review and flag** any emergency access
- Hospital administrators are responsible for **prompt review** of flagged sessions

---

## 🐛 Troubleshooting

### "No emergency access rights"

- Ensure doctor has EMERGENCY_ROLE granted
- Check role assignment with VitalChainCore

### "Already has active session"

- End current session before starting new one
- Check active session with `getActiveSession()`

### "Cooldown period not elapsed"

- Wait 24 hours before accessing same patient again
- Check last access time

### "Session expired"

- Session exceeded 4-hour limit
- Start new session if still needed

### "Not authorized to flag"

- Only patient, hospital, or admin can flag
- Verify user role

---

## ✅ Completion Status

**Smart Contracts:** ✅ 100% Complete
**Backend Integration:** ✅ 100% Complete
**Frontend UI:** ✅ 100% Complete
**Testing Scripts:** ✅ 100% Complete
**Documentation:** ✅ 100% Complete

**The Emergency Access Protocol is fully implemented and ready for use!**
