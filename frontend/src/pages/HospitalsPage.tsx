
import HospitalsMap from '../components/HospitalsMap';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HospitalsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-200"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900">Find Care Nearby</h1>
            <p className="text-slate-500">Locate hospitals and medical facilities in your vicinity</p>
          </div>
        </div>
        
        <HospitalsMap />
      </div>
    </div>
  );
};

export default HospitalsPage;
