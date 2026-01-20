# 🎬 Emergency Access Protocol - Live Demo Guide

## ✅ Issue Fixed!

The error `getDoctorEmergencyLogs is not a function` has been resolved. The frontend now correctly uses `getDoctorEmergencySessions()` which returns `EmergencySession[]` data.

---

## 🚀 Quick Demo Steps (5 minutes)

### Prerequisites

1. **Start blockchain** (Terminal 1):

```bash
cd /home/ashton/coding/Proctive/blockchain
npx hardhat node
```

2. **Deploy contracts** (Terminal 2):

```bash
cd /home/ashton/coding/Proctive/blockchain
npx hardhat run scripts/deploy.js --network localhost
```

3. **Start backend** (Terminal 3):

```bash
cd /home/ashton/coding/Proctive/backend
npm run dev
```

4. **Start frontend** (Terminal 4):

```bash
cd /home/ashton/coding/Proctive/frontend
npm run dev
```

---

## 📺 Live Demo Flow

### Step 1: Access the Emergency Page (30 sec)

1. Open browser to `http://localhost:5173` (or your frontend port)
2. Connect wallet (MetaMask or your wallet)
3. Navigate to `/doctor/emergency`
4. You should see:
   - Stats showing Active/Completed sessions
   - "Start Emergency Session" button
   - List of previous sessions (if any)

### Step 2: Start Emergency Session (2 min)

Click **"Start Emergency Session"** button:

**Fill in the modal:**

```
Patient Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Your Name: Dr. Sarah Johnson
Hospital/Facility: City General Hospital ER
Emergency Justification: Patient collapsed unconscious in ER. Cardiac arrest suspected. Need immediate access to medical history, allergies, and current medications to safely administer treatment.
```

Click **"Start Session"**

**What you'll see:**

- "Starting emergency session on blockchain..." toast
- Blockchain transaction confirmation
- "✓ Emergency session started!" success message
- Page updates with new active session

### Step 3: View Active Session (1 min)

After starting, you'll see a new session card showing:

- **Session ID** (e.g., #1)
- **Doctor name** and **Hospital**
- **Patient address**
- **Emergency justification** (the reason you entered)
- **Status badge**: "Active" (yellow)
- **Duration**: counting up
- **Records accessed**: 0 (initially)
- **"View Patient Records"** button

### Step 4: Access Patient Records (1 min)

Click **"View Patient Records"** button:

- Shows loading state
- Fetches all patient records
- Displays each record with title and description
- Click again to hide records

**This demonstrates the bypass of consent - you can see records immediately!**

### Step 5: Explain the Audit Trail (30 sec)

**Point out key features:**

- Session is permanently logged on blockchain
- Justification is immutable
- Every record access is tracked
- Status shows if flagged for review
- Patient can review later

---

## 🎯 Key Demo Points to Highlight

### 1. **Immediate Access** ⚡

"In a life-threatening emergency, the doctor doesn't wait for patient approval. Access is granted instantly while the patient is being treated."

### 2. **Complete Accountability** 📋

"Every action is logged: who accessed what, when, and why. The justification is permanently recorded on the blockchain."

### 3. **Safeguards** 🛡️

- Sessions expire after 4 hours
- 24-hour cooldown prevents repeated access
- Auto-flagging after 5 sessions
- Hospital review process

### 4. **Patient Rights** 👤

"Patients can later review all emergency accesses and flag suspicious ones for administrative review."

---

## 📊 Visual Demo Script

### Opening (30 seconds)

> "I'm going to show you how a doctor can access patient records in a life-threatening emergency without waiting for consent, while maintaining complete accountability."

### Demo (3 minutes)

1. **Navigate to Emergency page**

   > "This is the Emergency Access dashboard. Doctors can see all their emergency sessions here."

2. **Click Start Emergency Session**

   > "In a real emergency - cardiac arrest, unconscious patient, etc. - the doctor clicks this button."

3. **Fill out form**

   > "They must provide detailed justification. This becomes a permanent blockchain record."

4. **Submit and show success**

   > "The session starts immediately. No patient approval needed. But everything is logged."

5. **Show session details**

   > "Here's the active session. You can see the justification, timing, and status."

6. **Click View Records**
   > "The doctor can now access all patient records - medications, allergies, history - everything needed to save a life."

### Closing (30 seconds)

> "This balances two critical needs: saving lives in emergencies, and maintaining accountability for patient privacy. Every access is auditable, reviewable, and permanent."

---

## 🎨 What to Show on Screen

**Split-screen recommended:**

- **Left**: Terminal showing blockchain transactions
- **Right**: Browser with frontend UI

**Key screens to capture:**

1. Emergency dashboard (clean slate or with sessions)
2. "Start Emergency Session" modal
3. Blockchain transaction confirmation
4. Active session card
5. Patient records displayed
6. Session stats (Active/Completed counts)

---

## 💡 Advanced Demo (Optional +5 min)

### Show the Blockchain Test

```bash
cd /home/ashton/coding/Proctive
./test-emergency-access.sh
```

**What this demonstrates:**

- Automated testing of the protocol
- Role assignment (EMERGENCY_ROLE)
- Session lifecycle
- Audit log generation
- Flagging mechanism
- Administrative review

**Talking points while test runs:**

```
✅ Emergency role granted → "Only authorized doctors can use this"
✅ Session started → "Immediate access granted"
✅ Records accessed → "Every access logged"
✅ Audit logs generated → "Immutable blockchain record"
✅ Session flagged → "Automatic review trigger"
✅ Session reviewed → "Hospital oversight"
```

---

## 🐛 If Something Goes Wrong

### Frontend won't load sessions

**Check:**

1. Wallet is connected
2. On correct network (localhost)
3. Backend is running
4. Console for errors

**Fix:**

```bash
# Restart frontend
cd frontend
npm run dev
```

### "Services not initialized" error

**Check:**

1. Contracts are deployed
2. `deployments/localhost.json` exists
3. Contract addresses are correct

**Fix:**

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### No blockchain transactions

**Check:**

1. Hardhat node is running
2. Wallet is on localhost network
3. Wallet has test ETH

**Fix:**

```bash
# Terminal 1
cd blockchain
npx hardhat node

# Keep this running
```

---

## 📝 Demo Checklist

Before presenting:

- [ ] Blockchain node running
- [ ] Contracts deployed
- [ ] Backend running
- [ ] Frontend running
- [ ] Wallet connected
- [ ] Test account has ETH
- [ ] Emergency page loads
- [ ] One test session created (optional)
- [ ] Browser zoom set for visibility
- [ ] Terminal font size increased for viewers

---

## 🎬 Recording Tips

### Screen Recording

```bash
# Option 1: SimpleScreenRecorder (Linux)
simplescreenrecorder

# Option 2: ffmpeg
ffmpeg -video_size 1920x1080 -framerate 30 -f x11grab -i :0.0 -c:v libx264 demo.mp4

# Option 3: OBS Studio (best quality)
obs
```

### Audio Narration

- Use clear, confident voice
- Pause briefly between actions
- Explain what you're clicking before clicking
- Point out key UI elements

### Pacing

- **Slow down!** Wait for UI transitions
- Pause after each major action
- Give viewers time to read text
- Don't rush through forms

---

## 🎯 Target Audience Adjustments

### For Technical Audience

- Show more blockchain details
- Explain smart contract functions
- Demonstrate test suite
- Discuss security measures

### For Business Audience

- Focus on use case
- Emphasize compliance
- Show patient perspective
- Discuss liability protection

### For Medical Audience

- Real-world scenarios
- HIPAA compliance angle
- Life-saving examples
- Patient safety focus

---

## ⏱️ Time Estimates

| Section          | Time | Total |
| ---------------- | ---- | ----- |
| Intro            | 30s  | 0:30  |
| Navigate to page | 20s  | 0:50  |
| Start session    | 1m   | 1:50  |
| View session     | 30s  | 2:20  |
| Access records   | 40s  | 3:00  |
| Explain features | 1m   | 4:00  |
| Q&A buffer       | 1m   | 5:00  |

**Total: 5 minutes**

---

## 🚀 Ready to Demo!

You're all set! The Emergency Access Protocol is fully functional and ready to demonstrate.

**Good luck with your presentation! 🎉**
