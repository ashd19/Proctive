import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import PatientDashboard from './pages/patient/PatientDashboard'
import PatientRecords from './pages/patient/PatientRecords'
import PatientAccess from './pages/patient/PatientAccess'
import PatientClaims from './pages/patient/PatientClaims'
import PatientAuditLog from './pages/patient/PatientAuditLog'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorPatients from './pages/doctor/DoctorPatients'
import DoctorEmergency from './pages/doctor/DoctorEmergency'
import InsuranceDashboard from './pages/insurance/InsuranceDashboard'
import InsuranceClaimsPage from './pages/insurance/InsuranceClaimsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import { useWalletStore } from './store/walletStore'
import AddPdf from './pages/addPdf/AddPdf'

function App() {
  const { checkConnection } = useWalletStore()

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Patient Routes */}
      <Route path="/patient" element={<Layout role="patient" />}>
        <Route index element={<PatientDashboard />} />
        <Route path="records" element={<PatientRecords />} />
        <Route path="access" element={<PatientAccess />} />
        <Route path="claims" element={<PatientClaims />} />
        <Route path="audit" element={<PatientAuditLog />} />
        <Route path="addPdf" element={<AddPdf />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={<Layout role="doctor" />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="emergency" element={<DoctorEmergency />} />
      </Route>

      {/* Insurance Routes */}
      <Route path="/insurance" element={<Layout role="insurance" />}>
        <Route index element={<InsuranceDashboard />} />
        <Route path="claims" element={<InsuranceClaimsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<Layout role="admin" />}>
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
