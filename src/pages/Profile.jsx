import { useState, useEffect } from "react";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../components/Loader";

export default function Profile() {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get("/admin/auth/me");
        setAdmin(res.data.data);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setSaving(true);
    try {
      await API.put("/admin/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      toast.success("Password changed ✅");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const roleBg =
    admin?.role === "superadmin" ? "bg-purple-600" :
    admin?.role === "admin"      ? "bg-blue-600"   : "bg-green-600";

  const card  = "bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] md:rounded-[20px] shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4 md:mb-5";
  // text-[16px] on mobile stops iOS Safari from auto-zooming on focus
  const input = "w-full px-4 py-[12px] border border-brand-border rounded-[10px] text-[16px] sm:text-[14px] bg-white outline-none focus:border-brand-primary transition-all";
  const label = "block text-[13px] font-semibold text-brand-dark mb-2";

  return (
    <div className="max-w-[600px] mx-auto">
      <Toaster />

      {/* Profile Card */}
      <div className={`${card} p-5 sm:p-8 text-center`}>
        <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full bg-brand-gradient text-white text-[28px] sm:text-[32px] font-bold flex items-center justify-center mx-auto mb-4 shadow-[0_6px_16px_rgba(241,90,33,0.30)]">
          {admin?.name?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-[19px] sm:text-[22px] font-extrabold text-brand-dark m-0 mb-2 break-words">{admin?.name}</h2>
        <span className={`inline-block px-[14px] py-1 rounded-[20px] text-white text-[12px] font-semibold ${roleBg}`}>
          {admin?.role?.toUpperCase()}
        </span>

        <div className="mt-6 text-left">
          {[
            ["Email",        admin?.email, "text-brand-dark"],
            ["Status",       admin?.isActive ? "Active" : "Inactive", admin?.isActive ? "text-green-700" : "text-red-600"],
            ["Member Since", new Date(admin?.createdAt).toLocaleDateString(), "text-brand-dark"],
          ].map(([lbl, val, cls]) => (
            <div key={lbl} className="flex items-center justify-between gap-3 py-3 border-b border-brand-border last:border-0">
              <span className="text-[13px] sm:text-[14px] text-brand-muted shrink-0">{lbl}</span>
              <span className={`text-[13px] sm:text-[14px] font-semibold text-right break-all ${cls}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className={`${card} p-5 sm:p-8`}>
        <h3 className="text-[16px] sm:text-[18px] font-bold text-brand-dark m-0 mb-5 sm:mb-6">Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="mb-4">
            <label className={label}>Current Password</label>
            <input
              className={input}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.currentPassword}
              onChange={e => setForm({ ...form, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className={label}>New Password</label>
            <input
              className={input}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="mb-5">
            <label className={label}>Confirm New Password</label>
            <input
              className={input}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-[13px] bg-brand-gradient text-white border-none rounded-[10px] text-[15px] font-bold cursor-pointer shadow-[0_4px_14px_rgba(241,90,33,0.30)] disabled:opacity-70 disabled:cursor-default transition-opacity"
          >
            {saving ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
