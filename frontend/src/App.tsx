import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientAccess from "./pages/patient/PatientAccess";
import PatientClaims from "./pages/patient/PatientClaims";
import PatientAuditLog from "./pages/patient/PatientAuditLog";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorEmergency from "./pages/doctor/DoctorEmergency";
import InsuranceDashboard from "./pages/insurance/InsuranceDashboard";
import InsuranceClaimsPage from "./pages/insurance/InsuranceClaimsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddPdf from "./pages/addPdf/AddPdf";
import AddImage from "./pages/patient/AddImage";
import ConvertToJson from "./pages/patient/ConvertToJson";
import { useWalletStore } from "./store/walletStore";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabaseClient";
import Auth from "./pages/Auth/Auth";
import LandingPage from "./pages/LandingPage";
import HospitalsMap from "./components/HospitalsMap";
import PatientHealthDashboard from "./pages/doctor/PatientHealthDashboard";

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

      {/* Patient Routes */}
      <Route
        path="/patient"
        element={<ProtectedRoute requiredRole="patient" />}
      >
        <Route element={<Layout role="patient" />}>
          <Route index element={<PatientDashboard />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="access" element={<PatientAccess />} />
          <Route path="claims" element={<PatientClaims />} />
          <Route path="audit" element={<PatientAuditLog />} />
          <Route path="addPdf" element={<AddPdf />} />
          <Route path="addimage" element={<AddImage />} />
          <Route path="convert" element={<ConvertToJson />} />
          <Route path="report_analysis" element={<PatientHealthDashboard />} />
        </Route>
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor" />}>
        <Route element={<Layout role="doctor" />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="emergency" element={<DoctorEmergency />} />
          <Route path="maps" element={<HospitalsMap />} />
          <Route path="report_analysis" element={<PatientHealthDashboard />} />
        </Route>
      </Route>

      {/* Insurance Routes */}
      <Route
        path="/insurance"
        element={<ProtectedRoute requiredRole="insurance" />}
      >
        <Route element={<Layout role="insurance" />}>
          <Route index element={<InsuranceDashboard />} />
          <Route path="claims" element={<InsuranceClaimsPage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<Layout role="admin" />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
