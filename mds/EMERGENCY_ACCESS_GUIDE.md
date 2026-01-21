# Emergency Access Protocol - Implementation & Testing Guide

## 🚨 Overview

The Emergency Access Protocol allows authorized doctors to bypass standard patient consent in life-threatening situations. All emergency access events are permanently logged on the blockchain for audit and review.

## 📋 Key Features

### 1. **Emergency Session Management**
- Doctors can start emergency sessions with justification
- Sessions have configurable time limits (default: 4 hours)
- Automatic session flagging after threshold (default: 5 sessions)
- Cooldown period between sessions for same patient (default: 24 hours)

### 2. **Audit Trail**
- All emergency accesses are logged with:
  - Patient and doctor information
  - Justification reason
  - Records accessed
  - Timestamp and duration
  - IP address and device info (hashed)

### 3. **Review & Oversight**
- Patients can flag sessions for review
- Hospital admins can approve/reject flagged sessions
- All reviews are permanently recorded

### 4. **Session States**
- **ACTIVE**: Emergency session in progress
- **COMPLETED**: Session ended normally
- **FLAGGED**: Marked for review (auto or manual)
- **REVIEWED**: Under administrative review
- **APPROVED**: Confirmed as appropriate
- **REJECTED**: Deemed inappropriate

## 🏗️ Architecture

### Smart Contracts

**EmergencyAccess.sol**
```solidity
Location: /blockchain/contracts/EmergencyAccess.sol
Key Functions:
- startEmergencySession(patient, reason, doctorName, hospitalName)
- accessRecordInEmergency(recordId, ipHash, deviceHash)
- endEmergencySession(diagnosis)
- flagSession(sessionId, reason)
- reviewSession(sessionId, approved, notes)
```

**Integration Points:**
- VitalChainCore: Role-based access control (EMERGENCY_ROLE)
- PatientRecords: Record verification and access
- AuditLog: Emergency access event logging
- AccessControlManager: Permission validation

### Frontend Services

**EmergencyAccessService**
```typescript
Location: /frontend/src/services/emergencyAccessService.ts
Key Methods:
- startEmergencySession()
- accessRecordInEmergency()
- endEmergencySession()
- getDoctorEmergencySessions()
- getPatientEmergencySessions()
- getFlaggedSessions()
```

**UI Component**
```typescript
Location: /frontend/src/pages/doctor/DoctorEmergencyNew.tsx
Features:
- Start/end emergency sessions
- View active and historical sessions
- Access patient records during emergency
- Session statistics dashboard
```

## 🧪 Testing

### Automated Test Script

Run the comprehensive test suite:

```bash
cd blockchain
npx hardhat run scripts/testEmergencyAccess.js --network localhost
```

**Test Coverage:**
1. ✅ Entity registration (patient, doctor, hospital)
2. ✅ Emergency role assignment
3. ✅ Medical record creation
4. ✅ Emergency session lifecycle
5. ✅ Record access during emergency
6. ✅ Audit log generation
7. ✅ Session flagging
8. ✅ Administrative review

### Manual Testing via UI

#### Prerequisites
1. Ensure blockchain is running:
   ```bash
   cd blockchain
   npx hardhat node
   ```

2. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. Register test entities:
   ```bash
   npx hardhat run scripts/registerTestEntities.js --network localhost
   ```

4. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

#### Test Scenarios

**Scenario 1: Normal Emergency Access**

1. **Login as Doctor** with emergency role
   - Use doctor wallet address from registration

2. **Start Emergency Session**
   - Navigate to "Emergency Access" page
   - Click "Start Emergency Session"
   - Enter patient address
   - Provide detailed justification (e.g., "Cardiac arrest, need medication history")
   - Enter your name and hospital
   - Submit

3. **Access Patient Records**
   - Active session banner should appear
   - Navigate to patient records
   - Access needed medical records
   - Each access is logged automatically

4. **End Session**
   - Click "End Session" in active banner
   - Enter diagnosis/summary
   - Submit

5. **Verify Audit Trail**
   - Check session details shows all accessed records
   - Verify timestamps and duration
   - Confirm status is "Completed"

**Scenario 2: Flagged Session Review**

1. **Patient Flags Session**
   - Login as patient
   - View emergency access history
   - Flag a completed session for review
   - Provide reason

2. **Hospital Admin Reviews**
   - Login as hospital admin
   - Navigate to flagged sessions
   - Review session details
   - Approve or reject with notes

**Scenario 3: Auto-Flagging**

1. **Trigger Auto-Flag Threshold**
   - As doctor, create 5+ emergency sessions
   - 6th session automatically flagged
   - Verify flagged status in UI

**Scenario 4: Cooldown Period**

1. **Test Cooldown Enforcement**
   - Start and end emergency session for patient
   - Immediately try to start another for same patient
   - Should fail with cooldown error
   - Wait 24 hours (or update config for testing)
   - Retry successfully

## 📊 Configuration

Default configuration in contract:
```solidity
maxSessionDuration: 4 hours
cooldownPeriod: 24 hours
requiresJustification: true
autoFlagThreshold: 5 sessions
```

Update configuration (hospital/admin only):
```typescript
await emergencyAccessService.updateConfig(
  14400,  // 4 hours in seconds
  86400,  // 24 hours in seconds
  true,   // require justification
  5       // auto-flag after 5 sessions
)
```

## 🔐 Security Features

### Authorization Checks
- Only doctors with EMERGENCY_ROLE can start sessions
- Session must be active to access records
- Records must belong to session patient
- Cooldown prevents abuse
- Auto-flagging detects suspicious patterns

### Audit Mechanisms
- Immutable blockchain logging
- IP and device tracking (hashed)
- Complete session history
- Patient notification capability
- Administrative oversight

### Privacy Protection
- Encrypted medical records (AES-256)
- IPFS storage for data
- On-chain metadata only
- Access logs for transparency

## 🎯 Use Cases

### Valid Emergency Scenarios
- ✅ Cardiac arrest requiring medication history
- ✅ Severe allergic reaction needing allergy info
- ✅ Unconscious trauma patient
- ✅ Stroke requiring immediate treatment decisions
- ✅ Acute poisoning needing medical background

### Invalid Usage
- ❌ Routine check-ups
- ❌ Administrative data collection
- ❌ Research purposes
- ❌ Curiosity or unauthorized access
- ❌ Non-urgent situations

## 🚀 Integration Example

### Starting Emergency Session (Frontend)

```typescript
import { useServices } from '@/services/useServices'

function EmergencyAccessButton() {
  const { services } = useServices()
  
  const handleEmergency = async () => {
    try {
      const sessionId = await services.emergencyAccess.startEmergencySession(
        patientAddress,
        "Life-threatening emergency: cardiac arrest in ER",
        "Dr. Sarah Johnson",
        "General Hospital ER"
      )
      
      // Session started, can now access records
      await services.emergencyAccess.accessRecordInEmergency(
        recordId,
        hashIpAddress(ipAddress),
        hashDeviceInfo(userAgent)
      )
      
      // After treatment
      await services.emergencyAccess.endEmergencySession(
        "Patient stabilized. Defibrillation successful. ICU transfer."
      )
    } catch (error) {
      console.error('Emergency access failed:', error)
    }
  }
}
```

### Checking Active Sessions

```typescript
// Check if doctor has active session
const activeSessionId = await services.emergencyAccess.getActiveSession(doctorAddress)
if (activeSessionId > 0) {
  const session = await services.emergencyAccess.getSession(activeSessionId)
  console.log('Active emergency session:', session)
}
```

### Retrieving Audit Logs

```typescript
// Get all emergency sessions for a patient
const sessions = await services.emergencyAccess.getPatientEmergencySessions(patientAddress)

// Get emergency access audit logs
const auditLogs = await services.emergencyAccess.getEmergencyAccessLogs(patientAddress)

// Get flagged sessions for review
const flaggedSessions = await services.emergencyAccess.getFlaggedSessions()
```

## 📈 Monitoring & Analytics

### Key Metrics to Track
- Total emergency sessions
- Average session duration
- Records accessed per session
- Flagged vs approved ratio
- Top emergency reasons
- Doctor emergency access patterns

### Dashboard Queries

```typescript
// Get statistics
const doctorSessions = await emergencyAccess.getDoctorEmergencySessions(doctorAddress)
const activeSessions = doctorSessions.filter(s => s.status === EmergencyStatus.ACTIVE)
const completedSessions = doctorSessions.filter(s => s.status === EmergencyStatus.COMPLETED)
const flaggedSessions = doctorSessions.filter(s => s.status === EmergencyStatus.FLAGGED)

console.log({
  total: doctorSessions.length,
  active: activeSessions.length,
  completed: completedSessions.length,
  flagged: flaggedSessions.length,
  flagRate: (flaggedSessions.length / doctorSessions.length * 100).toFixed(2) + '%'
})
```

## 🔧 Troubleshooting

### Common Issues

**"No emergency access rights" Error**
- Solution: Ensure doctor has EMERGENCY_ROLE granted
- Check: `await vitalChainCore.hasRole(EMERGENCY_ROLE, doctorAddress)`

**"Cooldown period not elapsed" Error**
- Solution: Wait 24 hours or update config for testing
- Check: Last access time vs current time

**"Session not active" Error**
- Solution: Start a new emergency session first
- Check: `await emergencyAccess.isSessionActive(doctorAddress)`

**"Session expired" Error**
- Solution: Sessions auto-expire after max duration (4 hours)
- Check: End session before timeout or extend config

## 📝 Compliance Notes

This feature is designed to comply with:
- **HIPAA** emergency access provisions
- **GDPR** vital interests exception (Article 6)
- Medical ethics guidelines for emergency treatment
- Break-the-glass access protocols

**Important:** All jurisdictions may have specific requirements. Consult legal counsel for your implementation.

## 🔄 Future Enhancements

Potential improvements:
- [ ] Multi-signature approval for high-risk access
- [ ] Time-based auto-expiry notifications
- [ ] Integration with hospital emergency systems
- [ ] Real-time alert system for flagged sessions
- [ ] ML-based anomaly detection
- [ ] Patient consent override acknowledgment
- [ ] Geolocation verification
- [ ] Video audit trail option

## 📞 Support

For issues or questions:
1. Check contract deployment addresses in `/frontend/src/contracts/addresses.ts`
2. Verify services initialization in browser console
3. Review transaction logs on blockchain explorer
4. Check Hardhat node terminal for contract events

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
