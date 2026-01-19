import { Navigate, useLocation } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore'
import { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isConnected, role, address } = useWalletStore()
  const location = useLocation()

  if (!isConnected || !address) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}
