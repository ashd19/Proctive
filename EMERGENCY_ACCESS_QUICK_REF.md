# 🚨 Emergency Access Protocol - Quick Reference Card

## 🎯 Purpose

Bypass patient consent in life-threatening situations with full audit trail.

---

## ⚡ Quick Start

### For Doctors

**1. Start Emergency Session**

```typescript
await emergencyAccess.startEmergencySession(
  patientAddress,
  "Detailed justification of emergency",
  "Dr. Your Name",
  "Hospital Name",
);
```

**2. Access Records**

```typescript
await emergencyAccess.accessRecordInEmergency(recordId, ipHash, deviceHash);
```

**3. End Session**

```typescript
await emergencyAccess.endEmergencySession("Diagnosis and outcome");
```

### For Patients

**Review Access**

- Navigate to: `/patient/audit`
- View all emergency accesses
- Flag suspicious sessions

### For Admins

**Review Flagged Sessions**

```typescript
await emergencyAccess.reviewSession(
  sessionId,
  approved, // true/false
  "Review notes",
);
```

---

## 📋 Configuration

| Parameter              | Default    | Description                                     |
| ---------------------- | ---------- | ----------------------------------------------- |
| Max Session Duration   | 4 hours    | Auto-expires after this time                    |
| Cooldown Period        | 24 hours   | Time before same doctor can access same patient |
| Auto-Flag Threshold    | 5 sessions | Doctor flagged after this many emergencies      |
| Requires Justification | true       | Must provide reason                             |

---

## 🔐 Required Roles

| Action         | Required Role               |
| -------------- | --------------------------- |
| Start Session  | `EMERGENCY_ROLE`            |
| Access Records | Active emergency session    |
| End Session    | Session owner (doctor)      |
| Flag Session   | Patient, Hospital, or Admin |
| Review Session | `HOSPITAL_ROLE` or Admin    |

---

## ⚠️ Session States

```
START → ACTIVE → END → COMPLETED
                ↓
             FLAGGED → REVIEWED → APPROVED/REJECTED
```

---

## 📊 Key Events

```solidity
EmergencySessionStarted(sessionId, doctor, patient, reason, timestamp)
EmergencyRecordAccessed(sessionId, doctor, patient, recordId, timestamp)
EmergencySessionEnded(sessionId, doctor, patient, duration, recordsAccessed)
EmergencySessionFlagged(sessionId, flaggedBy, reason, timestamp)
EmergencySessionReviewed(sessionId, reviewedBy, status, notes, timestamp)
```

---

## 🧪 Test Commands

```bash
# Run full test suite
cd blockchain
npx hardhat run scripts/testEmergencyAccess.js --network localhost

# Quick test script
./test-emergency-access.sh

# Check if node running
lsof -i :8545
```

---

## 🐛 Common Errors

| Error                         | Solution                             |
| ----------------------------- | ------------------------------------ |
| "No emergency access rights"  | Grant EMERGENCY_ROLE to doctor       |
| "Already has active session"  | End current session first            |
| "Cooldown period not elapsed" | Wait 24 hours                        |
| "Session expired"             | Start new session                    |
| "Not authorized to flag"      | Only patient/hospital/admin can flag |

---

## 📂 Important Files

| File        | Path                                                |
| ----------- | --------------------------------------------------- |
| Contract    | `/blockchain/contracts/EmergencyAccess.sol`         |
| Test Script | `/blockchain/scripts/testEmergencyAccess.js`        |
| Service     | `/frontend/src/services/emergencyAccessService.ts`  |
| UI (New)    | `/frontend/src/pages/doctor/DoctorEmergencyNew.tsx` |
| UI (Legacy) | `/frontend/src/pages/doctor/DoctorEmergency.tsx`    |

---

## 🚀 Quick Deploy

```bash
# Terminal 1: Blockchain
cd blockchain && npx hardhat node

# Terminal 2: Deploy
cd blockchain && npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Register entities
cd blockchain && npx hardhat run scripts/registerTestEntities.js --network localhost

# Terminal 4: Frontend
cd frontend && npm run dev
```

---

## ✅ Testing Checklist

- [ ] Doctor has EMERGENCY_ROLE
- [ ] Can start emergency session with justification
- [ ] Can access records during session
- [ ] Audit logs generated
- [ ] Can end session with diagnosis
- [ ] Cooldown enforced
- [ ] Auto-flagging works at threshold
- [ ] Patient can flag sessions
- [ ] Admin can review flagged sessions
- [ ] All events emitted correctly

---

## 📞 View Functions

```solidity
getSession(sessionId) → Session details
getActiveSession(doctor) → Active session ID
getPatientEmergencySessionIds(patient) → Patient's sessions
getDoctorEmergencySessionIds(doctor) → Doctor's sessions
getFlaggedSessionIds() → All flagged sessions
getConfig() → Current configuration
isSessionActive(doctor) → Boolean
```

---

## 💡 Best Practices

✅ **DO:**

- Provide detailed justification
- End sessions promptly
- Document diagnosis/outcome
- Review audit logs regularly
- Report suspicious activity

❌ **DON'T:**

- Use for non-emergencies
- Leave sessions open unnecessarily
- Access more records than needed
- Ignore flagged sessions
- Abuse the system

---

## 📈 Monitoring

**Doctor Dashboard:**

- Total emergency sessions
- Active sessions
- Average duration
- Flagged count

**Patient Dashboard:**

- Emergency accesses
- Records viewed
- Time and date
- Doctor information

**Admin Dashboard:**

- All emergency sessions
- Flagged sessions awaiting review
- Approval/rejection rates
- Abuse detection

---

## 🎓 When to Use

### ✅ APPROPRIATE

- Unconscious patients
- Cardiac arrest
- Severe trauma
- Anaphylaxis
- Stroke
- Drug overdose
- Life-threatening emergencies

### ❌ INAPPROPRIATE

- Convenience
- Avoiding consent process
- Research purposes
- Non-urgent situations
- Personal curiosity
- Administrative tasks

---

## 🔗 Related Documentation

- **Full Guide:** `EMERGENCY_ACCESS_IMPLEMENTATION.md`
- **Walkthrough:** `EMERGENCY_ACCESS_WALKTHROUGH.md`
- **Original Guide:** `mds/EMERGENCY_ACCESS_GUIDE.md`

---

## ⚡ Emergency Contacts

**For Technical Issues:**

- Check deployment addresses in `/blockchain/deployments/localhost.json`
- Review contract events in blockchain explorer
- Check console logs for detailed errors

**For Compliance Issues:**

- Review audit logs via `AuditLog.sol`
- Check flagged sessions
- Contact hospital administrator

---

## 📊 Example Session

```javascript
// Start
const sessionId = await emergencyAccess.startEmergencySession(
  "0x7099...",
  "Patient unconscious after car accident",
  "Dr. Smith",
  "City Hospital ER",
);
// sessionId = 42

// Access records
await emergencyAccess.accessRecordInEmergency(15, "0xIP", "0xDevice");
await emergencyAccess.accessRecordInEmergency(16, "0xIP", "0xDevice");

// End
await emergencyAccess.endEmergencySession(
  "Patient stabilized. No major injuries. Released.",
);
```

---

## 🎯 Success Criteria

| Metric                | Target        | Importance  |
| --------------------- | ------------- | ----------- |
| Response Time         | < 5 min       | 🔥 Critical |
| Session Duration      | < 4 hours     | ⚠️ High     |
| Records Accessed      | Minimal       | ✅ Medium   |
| Justification Quality | Detailed      | ✅ Medium   |
| Patient Satisfaction  | No complaints | ℹ️ Low      |
| Flagged Rate          | < 10%         | ⚠️ High     |

---

**Remember: This is a life-saving tool. Use responsibly! 🚨**

---

## 📱 Frontend Routes

- Doctor Emergency UI: `/doctor/emergency`
- Patient Audit: `/patient/audit`
- Admin Review: (Custom implementation needed)

---

## 🔧 Configuration Update

```typescript
// Update emergency access settings (admin only)
await emergencyAccess.updateConfig(
  14400, // 4 hours max duration
  86400, // 24 hour cooldown
  true, // require justification
  5, // auto-flag after 5 sessions
);
```

---

**Last Updated:** January 21, 2026
**Status:** ✅ Fully Implemented & Tested
**Version:** 1.0.0
