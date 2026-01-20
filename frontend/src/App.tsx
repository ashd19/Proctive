import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import PatientDashboard from "./pages/patient/PatientDashboard"
import PatientRecords from "./pages/patient/PatientRecords"
import PatientAccess from "./pages/patient/PatientAccess"
import PatientClaims from "./pages/patient/PatientClaims"
import PatientAuditLog from "./pages/patient/PatientAuditLog"
import DoctorDashboard from "./pages/doctor/DoctorDashboard"
import DoctorPatients from "./pages/doctor/DoctorPatients"
import DoctorEmergency from "./pages/doctor/DoctorEmergency"
import InsuranceDashboard from "./pages/insurance/InsuranceDashboard"
import InsuranceClaimsPage from "./pages/insurance/InsuranceClaimsPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AddPdf from "./pages/addPdf/AddPdf"
import { useWalletStore } from "./store/walletStore"
import { Session } from "@supabase/supabase-js"
import { supabase } from "./lib/supabaseClient"
import Auth from "./pages/Auth/Auth"
import LandingPage from "./pages/LandingPage"
import HospitalsPage from "./pages/HospitalsPage"
import TrustVisualizerPage from "./pages/TrustVisualizer/TrustVisualizerPage"
import XrayVisualizerPage from "./pages/XrayVisualizer/XrayVisualizerPage"
import AddImage from "./pages/patient/AddImage"

function App() {
  const { checkConnection } = useWalletStore();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const getRedirectPath = (session: Session) => {
    const role = session.user.user_metadata?.role;

    switch (role) {
      case "doctor":
        return "/doctor";
      case "insurance":
        return "/insurance";
      case "admin":
        return "/admin";
      default:
        return "/patient";
    }
  };

  return (
    <Routes>
      {/* Public / Auth */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/hospitals" element={<HospitalsPage/>}/>
      <Route path="/trust-demo" element={<TrustVisualizerPage/>}/>
      <Route path="/xray-demo" element={<XrayVisualizerPage/>}/>

      {/* Patient Routes */}
      <Route
        path="/patient"
        element={<ProtectedRoute requiredRole="patient" />}
      >
        <Route index element={<PatientDashboard />} />
        <Route path="records" element={<PatientRecords />} />
        <Route path="access" element={<PatientAccess />} />
        <Route path="claims" element={<PatientClaims />} />
        <Route path="audit" element={<PatientAuditLog />} />
        <Route path="addpdf" element={<AddPdf />} />
        <Route path="addimage" element={<AddImage />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor" />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="emergency" element={<DoctorEmergency />} />
        {/* <Route path="maps" element={<HospitalsPage />} /> */}
      </Route>

      {/* Insurance Routes */}
      <Route
        path="/insurance"
        element={<ProtectedRoute requiredRole="insurance" />}
      >
        <Route index element={<InsuranceDashboard />} />
        <Route path="claims" element={<InsuranceClaimsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
