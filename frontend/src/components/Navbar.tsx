import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { Activity, CheckCircle, LogOut, User, Wallet, Brain, ShieldCheck, MapPin, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore'


export default function Navbar({ otherThanLanding }: { otherThanLanding?: boolean }) {

    const [open, setOpen] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const { connect, isConnected, isLoading } = useWalletStore();
    const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to connect wallet");
    }
  };


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
            navigate('/');     
        }
    }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg backdrop-blur-md shadow-md py-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-medical-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-blue-800 inter-bold tracking-wider">
              VitalChain
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-medium tracking-wide text-lg    ">
            <a
              href={`${otherThanLanding ? "/" : "#features"}`}
              className="nav-anim"
            >
              Features
            </a>
            <a
              href={`${otherThanLanding ? "/" : "#how-it-works"}`}
              className="nav-anim"
            >
              How It Works
            </a>
            <a
              href={`${otherThanLanding ? "/" : "#portals"}`}
              className="nav-anim"
            >
              Portals
            </a>
                        
                        {/* Smart Tools Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 nav-link group-hover:text-primary-600 transition-colors">
                                <span>Smart Tools</span>
                                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                            </button>
                            
                            <div className="absolute top-full right-0 mt-2 w-56 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 delay-150 ease-out">
                                <div className="p-2 bg-white rounded-xl shadow-xl border border-slate-100 ring-1 ring-black/5">
                                    <div className="space-y-1">
                                        <Link to="/patient/xray" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group/item">
                                            <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover/item:bg-blue-100 transition-colors">
                                                <Brain className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-700">AI X-Ray Analysis</div>
                                                <div className="text-xs text-slate-500">Detect anomalies instantly</div>
                                            </div>
                                        </Link>
                                        
                                        <Link to="/patient/trust" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group/item">
                                            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 group-hover/item:bg-emerald-100 transition-colors">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-700">Trust Visualizer</div>
                                                <div className="text-xs text-slate-500">Blockchain verification</div>
                                            </div>
                                        </Link>

                                        <Link to="/patient/hospitals" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group/item">
                                            <div className="p-2 rounded-md bg-red-50 text-red-600 group-hover/item:bg-red-100 transition-colors">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-700">Nearby Hospitals</div>
                                                <div className="text-xs text-slate-500">Find care near you</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
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
            {session && (
              <>
                {isConnected ? (
                  <div className="relative flex items-center gap-3">
                    <button className="btn-primary flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                  </button>
                )}
                <div className="relative">
                  <button
                    onClick={() => setOpen(!open)}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-medical-500 flex items-center justify-center hover:shadow-lg transition-all duration-300 hover:scale-105 shadow-md"
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>
            {/* 2️⃣ SESSION EXISTS → EXISTING WALLET LOGIC */}
            {session && (
              <>
                {isConnected ? (
                  <div className="relative flex items-center gap-3">
                    <button className="btn-primary flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                  </button>
                )}
                <div className="relative">
                  <button
                    onClick={() => setOpen(!open)}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-medical-500 flex items-center justify-center hover:shadow-lg transition-all duration-300 hover:scale-105 shadow-md"
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>

                  {open && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                      />

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-14 w-64 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Info Section */}
                        <div className="bg-gradient-to-br from-primary-500 to-medical-500 px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                {session?.user?.email?.split("@")[0] || "User"}
                              </p>
                              <p className="text-xs text-white/80 truncate">
                                {session?.user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              handleLogout();
                              setOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                              <LogOut className="w-4 h-4 text-red-600" />
                            </div>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
                  {open && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                      />

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-14 w-64 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Info Section */}
                        <div className="bg-gradient-to-br from-primary-500 to-medical-500 px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                {session?.user?.email?.split("@")[0] || "User"}
                              </p>
                              <p className="text-xs text-white/80 truncate">
                                {session?.user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              handleLogout();
                              setOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                              <LogOut className="w-4 h-4 text-red-600" />
                            </div>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

