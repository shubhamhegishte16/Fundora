import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

const LoginFlow = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      const isCreator = email.toLowerCase().includes("creator");
      if (isCreator) {
        localStorage.setItem("creatorToken", "mock-creator-token");
        localStorage.setItem("creator", JSON.stringify({ name: "Mock Creator", email }));
        navigate("/creator-panel");
      } else {
        localStorage.setItem("token", "mock-donor-token");
        localStorage.setItem("user", JSON.stringify({ name: "Mock Donor", email }));
        navigate("/donor-panel");
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-light p-4 font-sans text-brand-text">
      <div className="w-full max-w-5xl bg-card-white rounded-2xl shadow-xl border border-brand-border/60 flex flex-col lg:flex-row overflow-hidden min-h-[600px]">
        
        {/* Left Side Panel (Same style as WelcomePanel) */}
        <div className="relative w-full lg:w-2/5 min-h-[250px] lg:min-h-[600px] bg-dark-green text-white flex flex-col justify-between p-8 lg:p-12 select-none">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -top-[20%] -left-[10%] w-[120%] h-[80%] bg-primary-green opacity-30 transform -rotate-12 rounded-b-[100px]" />
            <div className="absolute top-[30%] -right-[20%] w-[100%] h-[70%] bg-light-green opacity-20 transform rotate-45 rounded-t-[80px]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full w-full grow">
            <span className="text-xl font-extrabold tracking-wider bg-white/10 px-4 py-1.5 rounded-full w-fit">ARISEO</span>
            <div className="my-auto py-12 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-black tracking-widest leading-tight">WELCOME BACK</h1>
              <p className="mt-4 text-xs tracking-wider uppercase text-light-green opacity-60">Empowering creators. Connecting donors.</p>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-3 mt-auto border-t border-white/15 pt-6">
              <span className="text-sm font-medium text-white/80">New to Ariseo?</span>
              <button onClick={() => navigate("/signup")} className="px-8 py-2.5 rounded-full border-2 border-white/60 text-white font-semibold text-sm hover:border-white transition-all cursor-pointer">
                Create Account
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-3/5 min-h-[400px] flex flex-col justify-center p-8 lg:p-16">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Sign In</h2>
              <p className="text-sm text-brand-secondary">Access your dashboard to manage campaigns or donations</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && <div className="p-3 text-xs bg-red-50 text-brand-error rounded-lg border border-red-100">{error}</div>}

              <div>
                <label className="block text-xs font-semibold uppercase text-brand-secondary mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-brand-border rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-brand-secondary mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-brand-border rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-green"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-text">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary-green text-white font-semibold rounded-xl hover:bg-dark-green transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginFlow;
