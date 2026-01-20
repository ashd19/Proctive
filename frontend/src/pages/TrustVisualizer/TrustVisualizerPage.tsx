import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Database, Shield, Stethoscope, ArrowRight, Lock, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { EntityNode, ConnectionLine, DataPacket, BlockchainLayer, EntityStatus } from './components/VisualizerComponents';
import { useNavigate } from 'react-router-dom';

type SimulationState = 'IDLE' | 'UPLOADING' | 'VERIFYING_UPLOAD' | 'UPLOAD_COMPLETE' | 'REQUESTING_ACCESS' | 'VERIFYING_CONSENT' | 'ACCESS_GRANTED' | 'ACCESS_DENIED' | 'EMERGENCY_OVERRIDE';

export default function TrustVisualizerPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<SimulationState>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Entity States
  const [patientStatus, setPatientStatus] = useState<EntityStatus>('idle');
  const [ipfsStatus, setIpfsStatus] = useState<EntityStatus>('idle');
  const [docStatus, setDocStatus] = useState<EntityStatus>('idle');
  const [blockchainActive, setBlockchainActive] = useState(false);

  // Packet Positions
  const [showPacket, setShowPacket] = useState<string | null>(null); // 'patient-to-ipfs', 'ipfs-to-bc', 'doc-to-bc', 'bc-to-doc', 'ipfs-to-doc'

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const resetSimulation = () => {
    setState('IDLE');
    setPatientStatus('idle');
    setIpfsStatus('idle');
    setDocStatus('idle');
    setBlockchainActive(false);
    setShowPacket(null);
    addLog("--- Simulation Reset ---");
  };

  const simulateUpload = async () => {
    if (state !== 'IDLE') return;
    
    // Step 1: Patient Initiates
    setState('UPLOADING');
    setPatientStatus('active');
    addLog("Patient initiates record upload...");
    
    // Packet: Patient -> IPFS
    setShowPacket('patient-to-ipfs');
    await new Promise(r => setTimeout(r, 1500));
    
    // Step 2: Store in IPFS
    setShowPacket(null);
    setPatientStatus('success');
    setIpfsStatus('processing');
    addLog("Encrypting & Storing data off-chain (IPFS)...");
    await new Promise(r => setTimeout(r, 1500));
    
    // Step 3: Verifying on Blockchain
    setState('VERIFYING_UPLOAD');
    setIpfsStatus('active');
    setShowPacket('ipfs-to-bc'); // Hash drops down
    setBlockchainActive(true);
    addLog("Generating Metadata Hash...");
    addLog("Smart Contract: Registering Record Hash (0x8f2...b1a)");
    await new Promise(r => setTimeout(r, 2000));
    
    // Step 4: Complete
    setShowPacket(null);
    setBlockchainActive(false);
    setIpfsStatus('success');
    setState('UPLOAD_COMPLETE');
    addLog("✅ Record Successfully Anchored on Blockchain.");
  };

  const simulateAccess = async () => {
     if (state !== 'IDLE' && state !== 'UPLOAD_COMPLETE') {
         resetSimulation();
     }
     // If we just reset, give it a tick
     if (state !== 'IDLE' && state !== 'UPLOAD_COMPLETE') await new Promise(r => setTimeout(r, 100));

     // Step 1: Doctor Request
     setState('REQUESTING_ACCESS');
     setDocStatus('active');
     addLog("Doctor requesting access to Patient Record...");
     
     // Packet: Doc -> Blockchain
     setShowPacket('doc-to-bc');
     await new Promise(r => setTimeout(r, 1500));

     // Step 2: Blockchain Verification
     setShowPacket(null);
     setState('VERIFYING_CONSENT');
     setBlockchainActive(true);
     setDocStatus('processing');
     addLog("Smart Contract: Verifying Consent Token...");
     await new Promise(r => setTimeout(r, 2000));

     // Step 3: Grant Access
     setBlockchainActive(false);
     setState('ACCESS_GRANTED');
     addLog("✅ Consent Verified. Access Token Issued.");
     addLog("Decrypting data from IPFS...");
     
     // Packet: IPFS -> Doc
     setIpfsStatus('active');
     setShowPacket('ipfs-to-doc');
     await new Promise(r => setTimeout(r, 1500));
     
     setShowPacket(null);
     setIpfsStatus('success');
     setDocStatus('success');
     addLog("Data delivered to Doctor secure interface.");
  };

  const simulateEmergency = async () => {
      resetSimulation();
      await new Promise(r => setTimeout(r, 100));

      setState('EMERGENCY_OVERRIDE');
      setDocStatus('active');
      addLog("⚠️ EMERGENCY ACCESS TRIGGERED");
      addLog("Smart Contract relies on 'Break-Glass' Protocol");
      
      // Fast track
      setShowPacket('doc-to-bc');
      await new Promise(r => setTimeout(r, 800));
      
      setBlockchainActive(true);
      addLog("❗ LOGGING EMERGENCY EVENT TO IMMUTABLE LEDGER");
      addLog("❗ ALERT SENT TO PATIENT & ADMIN");
      await new Promise(r => setTimeout(r, 1000));
      
      setShowPacket(null);
      setBlockchainActive(false);
      setIpfsStatus('processing');
      setShowPacket('ipfs-to-doc');
      addLog("Decrypting critical health data...");
      await new Promise(r => setTimeout(r, 800));
      
      setShowPacket(null);
      setIpfsStatus('success');
      setDocStatus('success'); // Maybe distinct color for emergency?
      addLog("✅ Emergency Data Access Granted.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 font-sans">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="bg-primary-600 text-white p-2 rounded-lg">
               <Shield size={24} />
             </div>
             <h1 className="text-3xl font-display font-bold text-slate-900">VitalChain <span className="text-slate-400 font-light">Trust Layer</span></h1>
           </div>
           <p className="text-slate-500 max-w-xl">
             Interactive visualization of how secure, consent-based medical data exchange works without exposing raw data to the blockchain.
           </p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-slate-600 font-medium px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Exit Demo
        </button>
      </header>

      {/* Main Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Simulation Stage */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col relative overflow-hidden">
           
           {/* Controls */}
           <div className="absolute top-6 right-6 flex flex-col gap-2 z-50">
              <button 
                onClick={resetSimulation}
                disabled={state === 'IDLE'}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} /> RESET
              </button>
           </div>

           {/* Nodes Graph */}
           <div className="flex-1 flex flex-col justify-center">
              
              {/* Top Row: User -> Storage -> Doctor */}
              <div className="flex justify-between items-center relative mb-12 px-8">
                 {/* Connection Lines Layer */}
                 <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 px-20 flex z-0">
                    <ConnectionLine active={showPacket === 'patient-to-ipfs'} />
                    <ConnectionLine active={showPacket === 'ipfs-to-doc'} />
                 </div>

                 <EntityNode 
                   icon={User} 
                   label="Patient" 
                   subLabel="Owns Data & Key" 
                   status={patientStatus} 
                   color="blue"
                 />

                 <EntityNode 
                   icon={FileText} 
                   label="Encrypted Storage" 
                   subLabel="Off-Chain (IPFS)" 
                   status={ipfsStatus} 
                   color="indigo"
                 />
                 
                 <EntityNode 
                   icon={Stethoscope} 
                   label="Doctor" 
                   subLabel="Requester" 
                   status={docStatus} 
                   color="teal"
                 />

                 {/* Animated Packets */}
                 <AnimatePresence>
                   {showPacket === 'patient-to-ipfs' && (
                     <motion.div 
                       className="absolute left-[15%] top-1/2 -translate-y-1/2 z-20"
                       initial={{ x: 0 }} animate={{ x: 250 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                     >
                        <DataPacket icon={FileText} color="blue" />
                     </motion.div>
                   )}
                   {showPacket === 'ipfs-to-doc' && (
                     <motion.div 
                       className="absolute left-[50%] top-1/2 -translate-y-1/2 z-20"
                       initial={{ x: 0 }} animate={{ x: 250 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                     >
                        <DataPacket icon={Lock} color="indigo" />
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              {/* HASH DROP ANIMATION (IPFS -> Blockchain) */}
              <AnimatePresence>
                {(showPacket === 'ipfs-to-bc' || showPacket === 'doc-to-bc') && (
                  <motion.div 
                    initial={{ y: -50, opacity: 0, x: showPacket === 'doc-to-bc' ? 250 : 0 }} 
                    animate={{ y: 100, opacity: 1 }} 
                    exit={{ y: 150, opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute left-1/2 top-1/2 -ml-3 z-30"
                  >
                     <div className="p-2 bg-amber-500 rounded-lg text-white shadow-lg">
                       <Shield size={20} />
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Blockchain Layer */}
              <BlockchainLayer isActive={blockchainActive} logs={logs} />
           </div>
        </div>

        {/* Right Col: Control Panel & Legend */}
        <div className="space-y-6">
           {/* Action Panel */}
           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                Actions
              </h3>
              
              <div className="space-y-3">
                 <button 
                   onClick={simulateUpload}
                   disabled={state !== 'IDLE'}
                   className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                 >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 group-hover:text-blue-600">Upload Health Record</span>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                    </div>
                    <p className="text-xs text-slate-500">Simulate patient encrypting and anchoring new data.</p>
                 </button>

                 <button 
                   onClick={simulateAccess}
                   disabled={state === 'UPLOADING' || state === 'VERIFYING_UPLOAD'}
                   className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                 >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 group-hover:text-teal-600">Request Access</span>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-500" />
                    </div>
                    <p className="text-xs text-slate-500">Simulate a doctor requesting data via smart contract.</p>
                 </button>

                 <button 
                    onClick={simulateEmergency}
                   className="w-full text-left p-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all group mt-6"
                 >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-red-800">Emergency Override</span>
                      <AlertCircle size={16} className="text-red-400 group-hover:text-red-600" />
                    </div>
                    <p className="text-xs text-red-600/80">Break-glass protocol. Bypasses normal consent with high-priority audit logging.</p>
                 </button>
              </div>
           </div>

           {/* Concept Explanation */}
           <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 text-sm leading-relaxed">
             <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <Database size={16} />
               How it works
             </h4>
             <ul className="space-y-3 list-disc pl-4 text-xs">
                <li><strong className="text-white">Data never touches the chain.</strong> Only cryptographic "hashes" (fingerprints) are stored on the blockchain.</li>
                <li><strong className="text-white">Smart Contracts</strong> act as the gatekeeper. They check if a doctor has a valid "token" (consent) before releasing the decryption key.</li>
                <li><strong className="text-white">Everything is auditable.</strong> Every request, whether successful or denied, is permanently recorded.</li>
             </ul>
           </div>
        </div>

      </main>
    </div>
  );
}
