import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) setError(error.message)
    setLoading(false)
  }

  const signUp = async () => {
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role, 
        },
      },
    })

    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Welcome
        </h1>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
          disabled={loading}
        />

        {/* ✅ Role Selector */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
          className="w-full mb-4 px-3 py-2 border rounded"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="insurance">Insurance</option>
        </select>

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded mb-2 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>

        <button
          onClick={signUp}
          disabled={loading}
          className="w-full border py-2 rounded disabled:opacity-50"
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}
