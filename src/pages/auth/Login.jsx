

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/Images/logo 6.png";
import AuthBg from "../../assets/Images/authbg.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/admin/auth/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", JSON.stringify(res.data.data));
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FC9B3F]">
      <Toaster />

      {/* Left Side - Image + Text */}
      <div className="hidden md:flex flex-1 relative overflow-hidden flex-col">
        <img
          src={AuthBg}
          alt="Welcome"
          className="w-full h-full object-cover absolute inset-0"
        />
        {/* Overlay text */}
        <div className="relative z-10 px-16 pt-[120px] ">
          <h1 className="text-white text-[34px] font-extrabold leading-tight m-0">
            Welcome Back 
          </h1>
          <p className="text-white/80 text-[16px] mt-1 font-bold font-height  max-w-[300px]">
            Manage your supply, bidding, and deliveries in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center ounded-[24px]  px-6 py-10 bg-brand-white min-h-screen md:min-h-0">
        <div className="w-full max-w-[460px] bg-[#FFF7ED] rounded-[24px] px-10 py-14">
          {/* Logo */}
          <div className="flex justify-center mb-5">
  <img
    src={logo}
    alt="EL Distributor"
    className="w-14 h-14 rounded-[12px] shadow-[0_4px_12px_rgba(241,90,33,0.3)]"
  />
</div>

          <h2 className="text-[22px] font-extrabold text-brand-dark text-center m-0">
            EL Distributor
          </h2>
          <p className="text-[13px] text-brand-muted text-center mt-1 mb-7">
            Admin Panel
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-brand-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-[11px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-brand-dark mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-[11px] pr-11 border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all"
                />
                <span
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-brand-gray hover:text-brand-primary transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 text-[13px]">
              <label className="flex items-center gap-2 text-brand-gray cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer accent-brand-primary"
                />
                Remember me
              </label>
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-brand-primary font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-gradient text-white rounded-[8px] text-[15px] font-bold border-none cursor-pointer disabled:opacity-70 shadow-[0_4px_12px_rgba(241,90,33,0.3)] transition-all"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
