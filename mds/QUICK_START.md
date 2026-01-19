# 🚀 VitalChain - Quick Start Guide

## Prerequisites
- Node.js v16+
- MetaMask browser extension
- Terminal access

## Step 1: Start Blockchain (Terminal 1)
```bash
cd /home/ashton/rubix/blockchain
npx hardhat node
```
✅ Keep this running - local blockchain at localhost:8545

## Step 2: Start Frontend (Terminal 2)
```bash
cd /home/ashton/rubix/frontend
npm run dev
```
✅ Frontend at http://localhost:3001

## Step 3: Configure MetaMask
1. Open MetaMask
2. Add Network:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency**: ETH
3. Import test account (use any private key from Hardhat console)

## Step 4: Test the Application

### Landing Page Tests
1. Open http://localhost:3001
2. Click "Connect Wallet"
3. Try all test buttons:
   - ✅ **Test Sign Message** - Signs with MetaMask
   - ✅ **Test Transaction** - Sends 0.001 ETH
   - ✅ **Test IPFS Upload** - Uploads to Pinata
   - ✅ **Test File Upload** - File to IPFS

### Patient Flow
1. Connect wallet → Select "Patient" role
2. **Upload Record** (Records page):
   ```
   Title: Annual Checkup 2026
   Description: Routine physical examination
   Type: General
   Upload → Encrypts → IPFS → Blockchain ✅
   ```
3. **View Record** - Click "View" to decrypt
4. **Check Audit Log** - See your access logged
5. **Submit Claim** (Claims page):
   ```
   Amount: $500
   Diagnosis: Routine checkup
   Link records → Submit ✅
   ```

### Doctor Flow
1. Connect with different MetaMask account
2. Select "Doctor" role
3. **Request Access** (Patients page):
   ```
   Patient Address: [paste patient address]
   Purpose: Medical consultation
   Duration: 30 days
   Request ✅
   ```
4. Patient must approve (switch to patient account)
5. **View Patient Records** - After approval
6. **Emergency Access** - For life-threatening cases

### Insurance Flow
1. Connect with another account
2. Select "Insurance" role  
3. **Review Claims** - See submitted claims
4. **Approve Claim**:
   ```
   Review → Approve → Enter amount → Confirm ✅
   ```
5. Patient sees approved claim

## Smart Contract Addresses
```
VitalChainCore: 0x5FbDB2315678afecb367f032d93F642f64180aa3
PatientRecords: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
AccessControl: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
AuditLog: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
EmergencyAccess: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
InsuranceClaims: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
```

## Features Working
✅ MetaMask signing & transactions
✅ IPFS upload/download (Pinata)
✅ AES-256 encryption/decryption  
✅ Blockchain read/write operations
✅ Access control & consent
✅ Audit logging
✅ Emergency access
✅ Insurance claims

## Troubleshooting

### "Nonce too high" error
Reset MetaMask: Settings → Advanced → Reset Account

### TypeScript errors in VS Code
Restart TS Server: Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"

### MetaMask not connecting
- Check network is Hardhat Local (Chain ID: 31337)
- Ensure Hardhat node is running
- Try disconnecting and reconnecting

### IPFS upload fails
- Check internet connection (Pinata is cloud service)
- Verify API key in [ipfs.ts](frontend/src/services/ipfs.ts): 49ead6420aacfa844d00

## Project Status: ✅ COMPLETE

All 6 features from problem statement implemented and working!
