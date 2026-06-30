import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields.");

    setIsLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      if (data.success) {
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Server error. Please ensure the backend is running.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7F9F8] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8 lg:p-12">
        <div className="mb-8 text-center">
          <span className="text-xl font-extrabold tracking-wider bg-dark-green text-white px-4 py-1.5 rounded-full inline-block mb-6">
            FUNDORA ADMIN
          </span>
          <h2 className="text-2xl font-extrabold mb-2">Admin Sign In</h2>
          <p className="text-sm text-gray-500">Restricted access — authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Here"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary-green"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-dark-green text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
  );
};

export default AdminLogin;