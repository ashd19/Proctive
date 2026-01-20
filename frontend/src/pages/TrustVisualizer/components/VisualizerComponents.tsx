import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Check, Shield, FileText, Lock, Database } from 'lucide-react';
import React from 'react';

// --- Types ---
export type EntityStatus = 'idle' | 'active' | 'processing' | 'success' | 'error' | 'disabled';

interface EntityNodeProps {
  icon: LucideIcon;
  label: string;
  subLabel?: string;
  status: EntityStatus;
  isSource?: boolean;
  isTarget?: boolean;
  color?: string;
  onClick?: () => void;
}

// --- Components ---

export const EntityNode = ({ 
  icon: Icon, 
  label, 
  subLabel, 
  status, 
  color = "blue",
  onClick 
}: EntityNodeProps) => {
  
  const getStatusColor = () => {
    switch (status) {
      case 'active': return `ring-${color}-500 shadow-lg shadow-${color}-500/20 bg-white`;
      case 'processing': return `ring-${color}-400 ring-offset-2 animate-pulse bg-white`;
      case 'success': return 'ring-green-500 bg-green-50';
      case 'error': return 'ring-red-500 bg-red-50';
      case 'disabled': return 'opacity-50 grayscale bg-gray-50';
      default: return 'bg-white hover:shadow-md';
    }
  };

  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 w-40 h-40 z-10
        ${status !== 'disabled' ? 'cursor-pointer' : 'cursor-default'}
        ${getStatusColor()}
        border-slate-200
      `}
    >
      <div className={`
        p-4 rounded-full mb-3 transition-colors duration-300
        ${status === 'active' || status === 'processing' ? `bg-${color}-100 text-${color}-600` : 'bg-slate-100 text-slate-500'}
        ${status === 'success' ? 'bg-green-100 text-green-600' : ''}
      `}>
        <Icon size={32} />
      </div>
      
      <h3 className="font-bold text-slate-800 text-sm text-center font-display">{label}</h3>
      {subLabel && <p className="text-xs text-slate-500 text-center mt-1">{subLabel}</p>}

      {status === 'success' && (
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-sm"
        >
          <Check size={12} strokeWidth={3} />
        </motion.div>
      )}
    </motion.div>
  );
};

export const ConnectionLine = ({ active, color = "blue" }: { active: boolean, color?: string }) => {
  return (
    <div className="flex-1 h-[2px] bg-slate-200 relative mx-4 overflow-hidden rounded-full">
      {active && (
        <motion.div
          layoutId="connection-beam"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-${color}-500 to-transparent opacity-50 w-1/2`}
        />
      )}
    </div>
  );
};

export const DataPacket = ({ icon: Icon = FileText, color = "blue" }: { icon?: LucideIcon, color?: string }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={`absolute z-20 p-2 rounded-lg bg-${color}-500 text-white shadow-lg shadow-${color}-500/30`}
    >
      <Icon size={20} />
    </motion.div>
  );
};

export const BlockchainLayer = ({ isActive, logs }: { isActive: boolean, logs: string[] }) => {
  return (
    <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-8 relative w-full">
       <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-50 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
         <Shield size={14} /> Trust Layer (Blockchain)
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Smart Contract Representation */}
          <div className={`p-6 rounded-xl border-2 transition-all duration-500 ${isActive ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                <Database size={20} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
              </div>
              <div>
                 <h4 className="font-bold text-slate-900 text-sm">VitalChain Smart Contract</h4>
                 <p className="text-xs text-slate-500">Immutable Access Control Registry</p>
              </div>
            </div>
            
            <div className="space-y-2">
               <div className="flex items-center justify-between text-xs px-3 py-2 bg-white rounded border border-slate-100">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-mono font-bold ${isActive ? 'text-green-600' : 'text-slate-400'}`}>
                    {isActive ? 'VERIFYING BLOCK...' : 'IDLE'}
                  </span>
               </div>
               <div className="flex items-center justify-between text-xs px-3 py-2 bg-white rounded border border-slate-100">
                  <span className="text-slate-500">Contract Address</span>
                  <span className="font-mono text-slate-400">0x71C...9A2F</span>
               </div>
            </div>
          </div>

          {/* Live Ledger / Audit Log */}
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs overflow-hidden flex flex-col h-60 shadow-inner">
            <div className="flex items-center justify-between mb-2 text-slate-500 border-b border-slate-900 pb-2">
               <span>LIVE AUDIT LOG</span>
               <div className="flex gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
                 <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2">
              <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                  <motion.div
                    key={logs.length - i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-emerald-400 break-all"
                  >
                    <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </motion.div>
                ))}
                {logs.length === 0 && <span className="text-slate-600 italic">Waiting for transactions...</span>}
              </AnimatePresence>
            </div>
          </div>
       </div>
    </div>
  );
};
