import { Navigate, Outlet } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

interface Props {
  requiredRole: string
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setAllowed(false)
        setLoading(false)
        return
      }

      const role = session.user.user_metadata?.role

      setAllowed(role === requiredRole)
      setLoading(false)
    }

    check()
  }, [requiredRole])

  if (loading) return <div className="p-6">Checking access…</div>

  if (!allowed) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
