import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Info, Activity, User, Stethoscope, Scan, Layers, Search } from 'lucide-react';
import React, { useState, useRef } from 'react';

// --- Types ---
export interface ROI {
  id: string;
  label: string;
  patientLabel: string;
  confidence: number;
  description: string;
  patientDescription: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  radius: number; // Size factor
  severity: 'low' | 'medium' | 'high';
}

export type ViewMode = 'patient' | 'clinical';
type FilterMode = 'standard' | 'high-contrast' | 'bone' | 'soft-tissue';

// --- Components ---

interface ViewerProps {
  rois: ROI[];
  selectedRoiId: string | null;
  onSelectRoi: (id: string | null) => void;
  viewMode: ViewMode;
  imageSrc?: string; // Optional prop - use default if not provided
}

// Magnifier Component - Fixed positioning
const Magnifier = ({ 
  src, 
  x, 
  y, 
  containerWidth,
  containerHeight,
  zoom = 2.5, 
  size = 150, 
  isActive 
}: { 
  src: string; 
  x: number; 
  y: number;
  containerWidth: number;
  containerHeight: number;
  zoom?: number; 
  size?: number; 
  isActive: boolean 
}) => {
  if (!isActive || containerWidth === 0 || containerHeight === 0) return null;

  // Calculate the background position to center the zoomed area under the cursor
  // We need to show the area at (x, y) in the center of the magnifier
  const bgWidth = containerWidth * zoom;
  const bgHeight = containerHeight * zoom;
  
  // Position calculation: where in the zoomed background should we show?
  const bgX = -(x * zoom) + size / 2;
  const bgY = -(y * zoom) + size / 2;

  return (
    <div
      className="absolute border-2 border-cyan-400 rounded-full overflow-hidden z-50 pointer-events-none shadow-[0_0_20px_rgba(34,211,238,0.3)]"
      style={{
        width: size,
        height: size,
        left: x - size / 2,
        top: y - size / 2,
        background: '#000'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('${src}')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${bgWidth}px ${bgHeight}px`
        }}
      />
      {/* Reticle crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-[1px] bg-cyan-400/40"></div>
        <div className="absolute h-full w-[1px] bg-cyan-400/40"></div>
        <div className="absolute w-3 h-3 border border-cyan-400/60 rounded-full"></div>
      </div>
    </div>
  );
};

const ScanningLine = () => (
  <motion.div 
    initial={{ top: '-10%', opacity: 0 }}
    animate={{ 
        top: ['-10%', '110%'],
        opacity: [0, 1, 1, 0]
    }}
    transition={{ 
        duration: 3, 
        repeat: Infinity, 
        repeatDelay: 2,
        ease: "easeInOut"
    }}
    className="absolute left-0 right-0 h-12 z-20 pointer-events-none"
    style={{
        background: 'linear-gradient(to bottom, transparent, rgba(34,211,238,0.1) 50%, rgba(34,211,238,0.8) 95%, rgba(100,255,255,1) 100%)'
    }}
  />
);

const MedicalHUD = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-60" xmlns="http://www.w3.org/2000/svg">
     {/* Corners - Tech Style */}
     <path d="M 30 60 V 30 H 60" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
     <circle cx="30" cy="30" r="2" fill="#22d3ee" />
     
     <path d="M 30 calc(100% - 60) V calc(100% - 30) H 60" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
     <circle cx="30" cy="calc(100% - 30)" r="2" fill="#22d3ee" />

     <path d="M calc(100% - 60) 30 H calc(100% - 30) V 60" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
     <circle cx="calc(100% - 30)" cy="30" r="2" fill="#22d3ee" />

     <path d="M calc(100% - 60) calc(100% - 30) H calc(100% - 30) V calc(100% - 60)" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
     <circle cx="calc(100% - 30)" cy="calc(100% - 30)" r="2" fill="#22d3ee" />
     
     {/* Grid Ticks */}
     {Array.from({ length: 11 }).map((_, i) => (
        <rect key={`v-${i}`} x="0" y={`${i * 10}%`} width="6" height="1" fill="#22d3ee" opacity="0.3" />
     ))}
     {Array.from({ length: 11 }).map((_, i) => (
        <rect key={`h-${i}`} x={`${i * 10}%`} y="0" width="1" height="6" fill="#22d3ee" opacity="0.3" />
     ))}

     {/* Data Blocks */}
     <text x="40" y="50%" fill="#22d3ee" className="text-[9px] font-mono tracking-[0.2em] font-bold opacity-80" transform="rotate(-90 40,50%)">SCANNING_PROTOCOL_V4</text>
     <text x="calc(100% - 40)" y="50%" fill="#22d3ee" className="text-[9px] font-mono tracking-[0.2em] font-bold opacity-80" transform="rotate(90 calc(100% - 40),50%)">AI_ASSIST_ENABLED</text>
  </svg>
);

const HeatmapLayer = ({ rois }: { rois: ROI[] }) => (
    <div className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-60">
        {rois.map(roi => (
             roi.severity !== 'low' && (
                 <motion.div
                    key={`heat-${roi.id}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute rounded-full blur-xl"
                    style={{
                        left: `${roi.x}%`,
                        top: `${roi.y}%`,
                        width: '100px',
                        height: '100px',
                        transform: 'translate(-50%, -50%)',
                        background: roi.severity === 'high' 
                           ? 'radial-gradient(circle, rgba(255,50,50,0.6) 0%, transparent 70%)' 
                           : 'radial-gradient(circle, rgba(255,160,0,0.5) 0%, transparent 70%)'
                    }}
                 />
             )
        ))}
    </div>
);

// Default placeholder image
const DEFAULT_XRAY = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Chest_Xray_PA_3-8-2010.png/1024px-Chest_Xray_PA_3-8-2010.png";

export const XrayViewer = ({ rois, selectedRoiId, onSelectRoi, viewMode, imageSrc }: ViewerProps) => {
  const [filter, setFilter] = useState<FilterMode>('standard');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use prop if provided, otherwise use default
  const [imgSrc, setImgSrc] = useState(imageSrc || DEFAULT_XRAY);
  
  // Update imgSrc when prop changes
  React.useEffect(() => {
    if (imageSrc) setImgSrc(imageSrc);
  }, [imageSrc]);

  const handleImgError = () => {
     setImgSrc(DEFAULT_XRAY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    // Update container size for magnifier
    if (rect.width !== containerSize.width || rect.height !== containerSize.height) {
      setContainerSize({ width: rect.width, height: rect.height });
    }
  };

  const getFilterStyle = () => {
    switch (filter) {
      // HDR: Enhanced colors and contrast - NO grayscale
      case 'high-contrast': return 'contrast-[1.4] brightness-[1.1] saturate-[1.3]'; 
      // SKELETAL: Inverted grayscale for bone visualization
      case 'bone': return 'contrast-[1.8] brightness-[0.95] grayscale invert'; 
      // SOFT TISSUE: Slightly muted for tissue differentiation
      case 'soft-tissue': return 'contrast-90 brightness-110 saturate-75 blur-[0.3px]';
      // STANDARD: Original image with slight enhancement - NO grayscale
      default: return 'contrast-[1.1] brightness-[1.05]';
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      {viewMode === 'clinical' && (
        <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl backdrop-blur-xl border border-cyan-500/20 w-fit self-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <button 
               onClick={() => setFilter('standard')}
               className={`p-2 rounded-lg transition-all ${filter === 'standard' ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-slate-400 hover:text-white'}`}
               title="Standard View"
            >
               <Layers size={18} />
            </button>
            <div className="w-[1px] h-6 bg-white/10"></div>
            <button 
               onClick={() => setFilter('high-contrast')}
               className={`px-3 py-1 text-xs font-mono font-bold tracking-wider rounded-lg border transition-all ${filter === 'high-contrast' ? 'bg-cyan-950 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-transparent text-slate-500 hover:text-white'}`}
            >
               HDR
            </button>
            <button 
               onClick={() => setFilter('bone')}
               className={`px-3 py-1 text-xs font-mono font-bold tracking-wider rounded-lg border transition-all ${filter === 'bone' ? 'bg-cyan-950 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-transparent text-slate-500 hover:text-white'}`}
            >
               SKELETAL
            </button>
        </div>
      )}

      {/* Main Viewer */}
      <div 
         ref={containerRef}
         className="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-slate-700/50 group select-none cursor-crosshair"
         onMouseMove={handleMouseMove}
         onMouseEnter={() => setShowMagnifier(true)}
         onMouseLeave={() => setShowMagnifier(false)}
         onMouseDown={() => onSelectRoi(null)} 
      >
        
        {/* Scanning Line */}
        {viewMode === 'clinical' && <ScanningLine />}
        
        {/* AI Heatmap Layer */}
        {viewMode === 'clinical' && <HeatmapLayer rois={rois} />}

        {/* Technical HUD */}
        {viewMode === 'clinical' && <MedicalHUD />}

        {/* Magnifier Lens */}
        {viewMode === 'clinical' && showMagnifier && (
           <Magnifier 
              src={imgSrc} 
              x={mousePos.x} 
              y={mousePos.y} 
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
              isActive={true} 
           />
        )}

        {/* The Image */}
        <motion.div className="w-full h-full"> 
            <img 
              src={imgSrc} 
              alt="Chest Radiography" 
              onError={handleImgError}
              className={`w-full h-full object-contain transition-all duration-500 ${getFilterStyle()}`}
            />
        </motion.div>

        {/* Overlays Layer */}
        <div className="absolute inset-0 z-30 pointer-events-none"> {/* Pass through clicks to underlying markers */}
            {rois.map((roi) => {
                const isSelected = selectedRoiId === roi.id;
                
                return (
                <div
                    key={roi.id}
                    className="absolute pointer-events-auto" // Re-enable clicks
                    style={{ 
                        left: `${roi.x}%`, 
                        top: `${roi.y}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoi(roi.id);
                    }}
                    className="cursor-pointer"
                  >
                     {/* ---------------- CLINICAL MARKER ---------------- */}
                     {viewMode === 'clinical' ? (
                       <div className={`relative group/marker ${isSelected ? 'z-50' : 'z-10'}`}>
                           {/* Target Reticle */}
                           <div className={`
                             transition-all duration-300 relative
                             ${isSelected ? 'w-20 h-20' : 'w-8 h-8 opacity-60 hover:opacity-100'}
                           `}>
                              {/* SVG Overlay Drawing */}
                              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                                 {isSelected ? (
                                    <>
                                      <path d="M 10 30 V 10 H 30" fill="none" stroke="#ef4444" strokeWidth="2" />
                                      <path d="M 10 70 V 90 H 30" fill="none" stroke="#ef4444" strokeWidth="2" />
                                      <path d="M 90 70 V 90 H 70" fill="none" stroke="#ef4444" strokeWidth="2" />
                                      <path d="M 90 30 V 10 H 70" fill="none" stroke="#ef4444" strokeWidth="2" />
                                      <circle cx="50" cy="50" r="2" fill="#ef4444" />
                                    </>
                                 ) : (
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 2" />
                                 )}
                              </svg>
                           </div>

                           {/* Label Tag */}
                           {isSelected && (
                              <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 50 }}
                                className="absolute top-1/2 left-0 w-max"
                              >
                                 <div className="flex items-center">
                                    <div className="w-12 h-[1px] bg-red-500"></div>
                                    <div className="bg-black/80 border border-red-500/50 px-2 py-1 text-[10px] font-mono text-red-400 backdrop-blur-sm">
                                       {roi.label}
                                    </div>
                                 </div>
                              </motion.div>
                           )}
                       </div>
                     ) : (
                      // ---------------- PATIENT MARKER ----------------
                       <div className="group/p-marker relative flex flex-col items-center">
                           <div className={`
                              rounded-full flex items-center justify-center transition-all duration-500
                              ${isSelected ? 'w-16 h-16 bg-white/20 backdrop-blur-md ring-1 ring-white/50' : 'w-6 h-6 bg-blue-400/30 ring-1 ring-blue-400/50 animate-pulse'}
                           `}>
                               {isSelected && <Search className="text-white w-6 h-6" />}
                           </div>
                           
                           {isSelected && (
                               <div className="bg-white/90 text-slate-800 text-xs font-bold px-3 py-1 rounded-full mt-2 shadow-lg">
                                  {roi.patientLabel}
                               </div>
                           )}
                       </div>
                     )}
                  </motion.div>
                </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};


interface InfoPanelProps {
    viewMode: ViewMode;
    setViewMode: (m: ViewMode) => void;
    selectedRoi: ROI | null;
}

export const InfoPanel = ({ viewMode, setViewMode, selectedRoi }: InfoPanelProps) => {
    return (
        <div className="bg-white h-full border-l border-slate-200 flex flex-col shadow-xl">
             {/* Header / Toggle */}
             <div className="p-6 border-b border-slate-100 bg-slate-50">
                 <h2 className="text-xl font-bold font-display text-slate-900 mb-4">Imaging Analysis</h2>
                 
                 <div className="flex bg-slate-200/50 p-1 rounded-xl">
                    <button 
                       onClick={() => setViewMode('patient')}
                       className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'patient' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <User size={16} /> Patient View
                    </button>
                    <button 
                       onClick={() => setViewMode('clinical')}
                       className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'clinical' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Stethoscope size={16} /> Clinical View
                    </button>
                 </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {selectedRoi ? (
                        <motion.div 
                           key="details"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="space-y-6"
                        >
                           <div>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 ${
                                    selectedRoi.severity === 'high' ? 'bg-red-100 text-red-700' : 
                                    selectedRoi.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    <Activity size={12} className="mr-1.5" />
                                    {selectedRoi.severity === 'high' ? 'Attention Required' : 'Observation'}
                                </div>
                                
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                    {viewMode === 'clinical' ? selectedRoi.label : selectedRoi.patientLabel}
                                </h3>
                                
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {viewMode === 'clinical' ? selectedRoi.description : selectedRoi.patientDescription}
                                </p>
                           </div>

                           {/* Confidence Meter (Clinical Only) */}
                           {viewMode === 'clinical' && (
                               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                   <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                       <span>AI PROBABILITY SCORE</span>
                                       <span>{(selectedRoi.confidence * 100).toFixed(1)}%</span>
                                   </div>
                                   <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                       <div 
                                          className={`h-full rounded-full ${selectedRoi.confidence > 0.8 ? 'bg-green-500' : 'bg-amber-500'}`}
                                          style={{ width: `${selectedRoi.confidence * 100}%` }}
                                       ></div>
                                   </div>
                               </div>
                           )}

                           {/* Suggestion */}
                           <div className="border-t border-slate-100 pt-4">
                               <h4 className="font-bold text-slate-700 text-sm mb-3">
                                   {viewMode === 'clinical' ? 'Clinical Correlation' : 'What this means'}
                               </h4>
                               <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                                  <Info size={16} className="inline mr-2 -mt-0.5" />
                                  {viewMode === 'clinical' ? "Correlate with previous pulmonary imaging. Calcification margins suggest benign etiology." : "This finding is stable and likely harmless. No immediate action required."}
                               </div>
                           </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                           key="empty"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex flex-col items-center justify-center h-64 text-center text-slate-400"
                        >
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Scan size={32} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">Select a highlighted region<br/>to view detailed analysis.</p>
                            {viewMode === 'clinical' && (
                                <p className="text-xs text-slate-400 mt-2">Hover to magnify • Click to select</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>
        </div>
    );
};

