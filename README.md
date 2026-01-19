# VitalChain - Secure Patient Health Data Exchange

A decentralized blockchain-based platform for secure medical record sharing with patient-controlled access, insurance claim automation, and emergency access protocols.

![VitalChain Architecture](https://via.placeholder.com/800x400?text=VitalChain+Architecture)

## 🌟 Features

### Patient-Controlled Access
- **Consent Management**: Patients have full control over who can access their medical records
- **Time-Limited Access**: Grant access for specific durations (7 days to 1 year)
- **Revocable Permissions**: Revoke access at any time with immediate effect
- **Granular Control**: Approve or deny individual access requests

### Secure Medical Records
- **IPFS Storage**: Medical records stored on decentralized IPFS network
- **AES-256 Encryption**: End-to-end encryption with patient-controlled keys
- **Blockchain Metadata**: Record metadata and access logs on blockchain
- **Multi-format Support**: Lab results, imaging, prescriptions, and more

### Emergency Access Protocol
- **Life-Saving Override**: Doctors can access records in emergencies without prior consent
- **Automatic Logging**: All emergency accesses permanently logged
- **Time-Limited Sessions**: 24-hour emergency session duration
- **Mandatory Review**: Hospital compliance must review all emergency accesses

### Insurance Claim Automation
- **Smart Contract Claims**: Submit and process claims on-chain
- **Auto-Approval**: Claims under threshold auto-approved with verified documentation
- **Document Verification**: IPFS-stored supporting documents
- **Transparent Processing**: Full audit trail of claim decisions

### Tamper-Evident Audit Logs
- **Immutable Records**: All access events permanently recorded on blockchain
- **Emergency Access Tracking**: Special logging for emergency overrides
- **Flagging System**: Mark suspicious activities for review
- **Export Capabilities**: Download audit logs for compliance

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│   │ Patient │ │ Doctor  │ │Insurance│ │  Admin  │ │ Landing │  │
│   │ Portal  │ │ Portal  │ │ Portal  │ │ Portal  │ │  Page   │  │
│   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘  │
│        └───────────┴───────────┴───────────┴───────────┘        │
│                              │                                   │
│                     ┌────────┴────────┐                         │
│                     │  Ethers.js v6   │                         │
│                     └────────┬────────┘                         │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Ethereum Blockchain                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ VitalChainCore │ │PatientRecords│ │ AccessControlManager     │ │
│  │  (Roles &    │ │  (IPFS +     │ │  (Consent & Permissions) │ │
│  │Registration) │ │  Metadata)   │ │                          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  AuditLog    │ │EmergencyAccess│ │   InsuranceClaims       │ │
│  │  (Access     │ │  (Override    │ │   (Policy & Claims      │ │
│  │   Logging)   │ │   Protocol)   │ │    Processing)          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         IPFS Network                             │
│              (Encrypted Medical Records Storage)                 │
└──────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/VitalChain.git
   cd VitalChain
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```

3. **Start the local blockchain**
   ```bash
   cd blockchain
   npx hardhat node
   ```

4. **Deploy contracts** (in a new terminal)
   ```bash
   cd blockchain
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. **Update contract addresses**
   
   Copy the deployed addresses from the terminal output and update:
   `frontend/src/contracts/addresses.ts`

6. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Configure MetaMask**
   - Add Hardhat Network: RPC URL `http://127.0.0.1:8545`, Chain ID `31337`
   - Import test accounts from Hardhat (private keys shown when starting node)

## 📁 Project Structure

```
VitalChain/
├── blockchain/                 # Smart contracts & deployment
│   ├── contracts/
│   │   ├── VitalChainCore.sol         # Role management & registration
│   │   ├── PatientRecords.sol       # Medical records storage
│   │   ├── AccessControlManager.sol # Consent & permissions
│   │   ├── AuditLog.sol             # Access logging
│   │   ├── EmergencyAccess.sol      # Emergency protocol
│   │   └── InsuranceClaims.sol      # Claims processing
│   ├── scripts/
│   │   └── deploy.js                # Deployment script
│   └── hardhat.config.js
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── contracts/               # ABIs & addresses
│   │   ├── pages/                   # Route pages
│   │   │   ├── patient/             # Patient portal
│   │   │   ├── doctor/              # Doctor portal
│   │   │   ├── insurance/           # Insurance portal
│   │   │   └── admin/               # Admin portal
│   │   ├── services/                # Contract & IPFS services
│   │   ├── store/                   # Zustand state management
│   │   └── types/                   # TypeScript definitions
│   └── package.json
│
└── package.json               # Root workspace config
```

## 🔐 Smart Contracts

### VitalChainCore
Central registry for all healthcare entities (hospitals, doctors, labs, insurance providers) and patients.

### PatientRecords
Manages encrypted medical record storage with IPFS integration. Supports multiple record types:
- Lab Results
- Imaging (X-rays, MRI, CT)
- Prescriptions
- Visit Summaries
- Immunizations
- Surgical Reports

### AccessControlManager
Handles consent-based access control:
- Access requests with purpose
- Time-limited access grants
- Immediate revocation capability

### AuditLog
Tamper-evident logging of all record access:
- Access type tracking
- Emergency access flagging
- Compliance reporting

### EmergencyAccess
Life-saving override protocol:
- 24-hour session limits
- Mandatory justification
- Automatic patient notification

### InsuranceClaims
Automated claim processing:
- Policy management
- Auto-approval under threshold
- On-chain claim status

## 🎨 UI Features

- **Premium Design**: Glassmorphism effects, smooth animations
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark Theme Ready**: Prepared for dark mode implementation
- **Accessibility**: WCAG compliant components
- **Real-time Updates**: Live blockchain event listening

## 🧪 Testing

```bash
# Run contract tests
cd blockchain
npx hardhat test

# Run frontend tests
cd frontend
npm test
```

## 🌐 Deployment

### Sepolia Testnet

1. **Configure environment**
   ```bash
   # Create .env in blockchain folder
   SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_KEY
   PRIVATE_KEY=your_wallet_private_key
   ETHERSCAN_API_KEY=your_etherscan_key
   ```

2. **Deploy to Sepolia**
   ```bash
   cd blockchain
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Verify contracts**
   ```bash
   npx hardhat verify --network sepolia DEPLOYED_ADDRESS
   ```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- Documentation: [docs.VitalChain.io](https://docs.VitalChain.io)
- Email: support@VitalChain.io
- Discord: [VitalChain Community](https://discord.gg/VitalChain)

---

Built with ❤️ for healthcare privacy and security
