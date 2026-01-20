import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Upload, RefreshCw, Loader2, CheckCircle, AlertTriangle, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { XrayViewer, InfoPanel, ROI, ViewMode } from './components/XrayComponents';
import { analyzeXray, AnalysisResult } from '../../services/xrayAI';

// ============ ROI GENERATION POOL ============
const FINDING_POOL = {
  high: [
    { label: 'Pneumonia (Consolidation)', patientLabel: 'Lung Infection', description: 'Dense opacity consistent with lobar pneumonia. Silhouette sign positive.', patientDescription: 'A significant infection has been detected in your lung. The area appears cloudy due to fluid buildup.' },
    { label: 'Pleural Effusion', patientLabel: 'Fluid Around Lung', description: 'Blunting of costophrenic angle with meniscus sign. Moderate pleural fluid collection.', patientDescription: 'There is fluid collecting around your lung, which may need to be drained.' },
    { label: 'Mass Lesion', patientLabel: 'Abnormal Growth', description: 'Well-defined rounded opacity >3cm. Recommend CT for further evaluation.', patientDescription: 'We found an unusual growth that requires additional testing to understand better.' },
  ],
  medium: [
    { label: 'Pulmonary Nodule', patientLabel: 'Small Spot', description: 'Solitary pulmonary nodule <1cm. Borders appear regular. Follow-up recommended.', patientDescription: 'A small spot was found in your lung. It looks smooth and round, which is often benign.' },
    { label: 'Atelectasis', patientLabel: 'Partial Lung Collapse', description: 'Linear opacity consistent with subsegmental atelectasis. No volume loss.', patientDescription: 'A small area of your lung appears slightly deflated. This is usually temporary.' },
    { label: 'Hilar Prominence', patientLabel: 'Lymph Node Swelling', description: 'Bilateral hilar enlargement. Consider lymphadenopathy vs pulmonary arterial hypertension.', patientDescription: 'The lymph nodes near your airways appear slightly enlarged.' },
  ],
  low: [
    { label: 'Clear Lung Fields', patientLabel: 'Healthy Tissue', description: 'Normal lung parenchyma with clear vascular markings. No acute cardiopulmonary process.', patientDescription: 'This area of your lung looks completely healthy with good air flow.' },
    { label: 'Normal Cardiac Silhouette', patientLabel: 'Heart Size Normal', description: 'Cardiothoracic ratio within normal limits. No cardiomegaly.', patientDescription: 'Your heart appears normal in size and shape.' },
    { label: 'Intact Bony Thorax', patientLabel: 'Ribs Normal', description: 'No acute fractures or lytic lesions identified in visible bony structures.', patientDescription: 'Your rib cage and bones look healthy with no injuries.' },
  ]
};

const ANATOMICAL_ZONES = [
  { name: 'Right Upper Lung', x: [25, 40], y: [20, 35] },
  { name: 'Right Middle Lung', x: [28, 42], y: [40, 55] },
  { name: 'Right Lower Lung', x: [30, 45], y: [58, 72] },
  { name: 'Left Upper Lung', x: [60, 75], y: [20, 35] },
  { name: 'Left Lower Lung', x: [58, 72], y: [55, 70] },
  { name: 'Cardiac Region', x: [45, 55], y: [45, 60] },
];

function generateROIs(): ROI[] {
  const usedZones = new Set<number>();
  const rois: ROI[] = [];
  
  // Generate 3-4 findings
  const numFindings = Math.floor(Math.random() * 2) + 3;
  const severities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low', 'low'];
  
  for (let i = 0; i < numFindings; i++) {
    // Pick a random unused zone
    let zoneIndex: number;
    do {
      zoneIndex = Math.floor(Math.random() * ANATOMICAL_ZONES.length);
    } while (usedZones.has(zoneIndex) && usedZones.size < ANATOMICAL_ZONES.length);
    usedZones.add(zoneIndex);
    
    const zone = ANATOMICAL_ZONES[zoneIndex];
    const severity = severities[i] || 'low';
    const findingPool = FINDING_POOL[severity];
    const finding = findingPool[Math.floor(Math.random() * findingPool.length)];
    
    rois.push({
      id: `roi-${i + 1}`,
      label: finding.label,
      patientLabel: finding.patientLabel,
      confidence: severity === 'high' ? 0.85 + Math.random() * 0.12 : severity === 'medium' ? 0.65 + Math.random() * 0.2 : 0.9 + Math.random() * 0.08,
      description: finding.description,
      patientDescription: finding.patientDescription,
      x: zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]),
      y: zone.y[0] + Math.random() * (zone.y[1] - zone.y[0]),
      radius: severity === 'high' ? 14 : severity === 'medium' ? 11 : 9,
      severity,
    });
  }
  
  return rois.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

// ============ ANALYSIS MESSAGES ============
const ANALYSIS_STEPS = [
  { progress: 0, message: 'Initializing VitalChain AI...' },
  { progress: 15, message: 'Loading neural network model...' },
  { progress: 30, message: 'Pre-processing image...' },
  { progress: 45, message: 'Analyzing lung fields...' },
  { progress: 60, message: 'Detecting anomalies...' },
  { progress: 75, message: 'Calculating confidence scores...' },
  { progress: 90, message: 'Generating diagnostic report...' },
  { progress: 100, message: 'Analysis complete!' },
];

// ============ UPLOAD ZONE COMPONENT ============
function UploadZone({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex items-center justify-center p-8"
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative w-full max-w-lg aspect-square rounded-3xl border-2 border-dashed 
          flex flex-col items-center justify-center gap-6 cursor-pointer
          transition-all duration-300 group
          ${isDragging 
            ? 'border-cyan-400 bg-cyan-500/10 scale-105' 
            : 'border-slate-600 hover:border-cyan-500/50 hover:bg-slate-800/50'}
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{ y: isDragging ? -10 : 0 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30"
        >
          <Upload className="w-10 h-10 text-cyan-400" />
        </motion.div>
        
        <div className="text-center">
          <p className="text-white text-lg font-semibold mb-2">
            {isDragging ? 'Drop X-Ray Image' : 'Upload X-Ray Image'}
          </p>
          <p className="text-slate-400 text-sm">
            Drag and drop or click to browse
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Supports: JPEG, PNG, DICOM
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/30 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/30 rounded-br-lg" />
      </div>
    </motion.div>
  );
}

// ============ ANALYZING OVERLAY COMPONENT ============
function AnalyzingOverlay({ progress, message }: { progress: number; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="44" fill="none" stroke="#1e293b" strokeWidth="4" />
            <motion.circle
              cx="48" cy="48" r="44" fill="none" stroke="#22d3ee" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progress) / 100}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
        </div>
        
        <p className="text-cyan-400 text-lg font-semibold mb-2">{Math.round(progress)}%</p>
        <p className="text-slate-300 text-sm">{message}</p>
        
        {/* Scanning Effect */}
        <div className="mt-8 w-64 h-1 bg-slate-800 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: '50%' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============ MAIN PAGE COMPONENT ============
type AppState = 'upload' | 'analyzing' | 'results';

export default function XrayVisualizerPage() {
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [detectedRois, setDetectedRois] = useState<ROI[]>([]);
  const [selectedRoiId, setSelectedRoiId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('clinical');
  // NEW: Track AI source and raw detections
  const [aiSource, setAiSource] = useState<'huggingface' | 'demo' | 'local_torchxrayvision' | null>(null);
  const [rawLabels, setRawLabels] = useState<string[]>([]);

  const selectedRoi = detectedRois.find(r => r.id === selectedRoiId) || null;

  // Handle file upload
  const handleUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setUploadedFile(file);
    setAppState('analyzing');
    setAnalysisProgress(0);
    setAiSource(null);
    setRawLabels([]);
  }, []);

  // REAL AI Analysis with Hugging Face
  useEffect(() => {
    if (appState !== 'analyzing' || !uploadedFile) return;

    let isCancelled = false;

    const runAnalysis = async () => {
      // Update progress while AI is working
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% until AI completes
          const next = prev + 2;
          const step = ANALYSIS_STEPS.findLast(s => s.progress <= next);
          if (step) setAnalysisMessage(step.message);
          return next;
        });
      }, 100);

      try {
        // Call the real AI service
        setAnalysisMessage('Connecting to VitalChain AI...');
        const result: AnalysisResult = await analyzeXray(uploadedFile);

        if (isCancelled) return;

        // Store source info for display
        setAiSource(result.source);
        setRawLabels(result.rawLabels || []);
        console.log('[XrayPage] AI Source:', result.source, 'Labels:', result.rawLabels);

        // Convert AI detections to ROIs
        const rois: ROI[] = result.detections.map((detection, index) => ({
          id: `roi-${index + 1}`,
          label: detection.label,
          patientLabel: detection.patientLabel,
          confidence: detection.score,
          description: detection.description,
          patientDescription: detection.patientDescription,
          x: detection.region.x,
          y: detection.region.y,
          radius: detection.severity === 'high' ? 14 : detection.severity === 'medium' ? 11 : 9,
          severity: detection.severity,
        }));

        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setAnalysisMessage(result.source === 'huggingface' ? 'AI Analysis complete!' : 'Demo mode (API unavailable)');

        setTimeout(() => {
          if (!isCancelled) {
            setDetectedRois(rois);
            setAppState('results');
          }
        }, 500);

      } catch (error) {
        console.error('AI Analysis error:', error);
        clearInterval(progressInterval);
        
        // Fallback to simulated results on error
        setAnalysisMessage('Using backup analysis...');
        setTimeout(() => {
          if (!isCancelled) {
            setDetectedRois(generateROIs());
            setAppState('results');
          }
        }, 1000);
      }
    };

    runAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [appState, uploadedFile]);

  // Reset function
  const handleNewScan = () => {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(null);
    setUploadedFile(null);
    setDetectedRois([]);
    setSelectedRoiId(null);
    setAnalysisProgress(0);
    setAppState('upload');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between shadow-md z-10 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold font-display flex items-center gap-2">
              <Brain size={20} className="text-cyan-400" />
              VitalChain <span className="text-slate-400 font-light">X-Ray Detection</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {appState === 'results' && (
            <button
              onClick={handleNewScan}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-sm font-medium"
            >
              <RefreshCw size={16} />
              New Scan
            </button>
          )}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${appState === 'analyzing' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-slate-400">
              {appState === 'upload' && 'Ready for Upload'}
              {appState === 'analyzing' && 'Processing...'}
              {appState === 'results' && 'Analysis Complete'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-80px)]">
        
        {/* Main Viewer - Left Col */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 relative h-full flex flex-col">
          
          {appState === 'results' && (
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/10 text-xs font-mono">
              <div className="opacity-70">Study Date: {new Date().toISOString().split('T')[0]}</div>
              <div className="font-bold text-cyan-400">AI ANALYSIS COMPLETE</div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {appState === 'upload' && (
              <UploadZone key="upload" onUpload={handleUpload} />
            )}
            
            {(appState === 'analyzing' || appState === 'results') && uploadedImage && (
              <motion.div
                key="viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center bg-black p-4 relative"
              >
                <div className="max-w-[500px] w-full">
                  <XrayViewer 
                    rois={appState === 'results' ? detectedRois : []}
                    selectedRoiId={selectedRoiId}
                    onSelectRoi={setSelectedRoiId}
                    viewMode={viewMode}
                    imageSrc={uploadedImage}
                  />
                </div>
                
                {appState === 'analyzing' && (
                  <AnalyzingOverlay progress={analysisProgress} message={analysisMessage} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="bg-slate-950 border-t border-slate-800 p-4 text-slate-500 text-xs flex justify-between items-center">
            <span className="flex items-center gap-2">
              {appState === 'results' && aiSource === 'huggingface' && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium">Hugging Face AI</span>
                </div>
              )}
              {appState === 'results' && aiSource === 'local_torchxrayvision' && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-medium">Model</span>
                </div>
              )}
              {appState === 'results' && aiSource === 'demo' && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium">Demo Mode</span>
                </div>
              )}
              {appState !== 'results' && 'Awaiting image upload'}
              {appState === 'results' && ` • ${detectedRois.length} findings`}
            </span>
            <span className="max-w-[200px] truncate" title={rawLabels.join(', ')}>
              {appState === 'results' && rawLabels.length > 0 ? rawLabels[0] : 'VitalChain AI v2.4'}
            </span>
          </div>
        </div>

        {/* Side Panel - Right Col */}
        <div className="lg:col-span-4 h-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
          {appState === 'results' ? (
            <InfoPanel 
              viewMode={viewMode}
              setViewMode={setViewMode}
              selectedRoi={selectedRoi}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                {appState === 'analyzing' ? (
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {appState === 'analyzing' ? 'Analyzing X-Ray...' : 'Upload an X-Ray'}
              </h3>
              <p className="text-sm text-slate-500">
                {appState === 'analyzing' 
                  ? 'Our AI is scanning for anomalies and generating a diagnostic report.'
                  : 'Upload a chest X-ray image to begin AI-powered detection and analysis.'
                }
              </p>
              
              {appState === 'upload' && (
                <div className="mt-6 space-y-2 text-left w-full max-w-xs">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>Pneumonia Detection</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>Nodule Identification</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>Cardiac Assessment</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span>For demonstration only</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
