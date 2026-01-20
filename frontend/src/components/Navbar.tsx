import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { Activity, CheckCircle, LogOut, User, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Navbar({
  isConnected,
  handleConnect,
  handleDisconnect,
  isLoading,
  otherThanLanding,
}: {
  isConnected?: boolean;
  handleConnect?: () => void;
  handleDisconnect?: () => void;
  isLoading?: boolean;
  otherThanLanding?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen to auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Unable to logout");
    } else {
      toast.success("Logged Out Successfully");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-medical-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">VitalChain</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href={`${otherThanLanding ? "/" : "#features"}`}
              className="nav-link"
            >
              Features
            </a>
            <a
              href={`${otherThanLanding ? "/" : "#how-it-works"}`}
              className="nav-link"
            >
              How It Works
            </a>
            <a
              href={`${otherThanLanding ? "/" : "#portals"}`}
              className="nav-link"
            >
              Portals
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* 1️⃣ NO SESSION → Login & Signup */}
            {!session && (
              <>
                <Link to="/auth" className="btn-secondary">
                  Login
                </Link>
                <Link to="/auth" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}

            {/* 2️⃣ SESSION EXISTS → EXISTING WALLET LOGIC */}
            {session &&
              (isConnected ? (
                otherThanLanding ? (
                  <div className="relative flex items-center gap-3">
                    <button className="btn-primary flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </button>

                    <button
                      onClick={() => setOpen(!open)}
                      className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <User className="w-5 h-5 text-gray-700" />
                    </button>

                    {open && (
                      <div className="absolute right-0 top-12 w-48 rounded-md bg-white shadow-lg border">
                        <button
                          onClick={() => {
                            handleDisconnect?.();
                            setOpen(false);
                            toast.success("Wallet disconnected");
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 border-b"
                        >
                          <Wallet className="w-4 h-4" />
                          Disconnect Wallet
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative flex items-center gap-2">
                    <button className="btn-primary flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </button>
                    <button
                      onClick={() => {
                        handleDisconnect?.();
                        toast.success("Wallet disconnected");
                      }}
                      className="btn-secondary flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                      <X className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                )
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </button>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
