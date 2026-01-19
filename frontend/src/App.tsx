import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
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

function App() {
  const { checkConnection } = useWalletStore()

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Patient Routes */}
      <Route path="/patient" element={
        <ProtectedRoute requiredRole="patient">
          <Layout role="patient" />
        </ProtectedRoute>
      }>
        <Route index element={<PatientDashboard />} />
        <Route path="records" element={<PatientRecords />} />
        <Route path="access" element={<PatientAccess />} />
        <Route path="claims" element={<PatientClaims />} />
        <Route path="audit" element={<PatientAuditLog />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute requiredRole="doctor">
          <Layout role="doctor" />
        </ProtectedRoute>
      }>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="emergency" element={<DoctorEmergency />} />
      </Route>

      {/* Insurance Routes */}
      <Route path="/insurance" element={
        <ProtectedRoute requiredRole="insurance">
          <Layout role="insurance" />
        </ProtectedRoute>
      }>
        <Route index element={<InsuranceDashboard />} />
        <Route path="claims" element={<InsuranceClaimsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <Layout role="admin" />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
