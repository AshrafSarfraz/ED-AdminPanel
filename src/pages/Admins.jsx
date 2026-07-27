import { useState, useEffect } from "react";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../components/Loader";

export default function Admins() {
  const [admins,    setAdmins]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ name: "", email: "", role: "admin" });
  const [saving,    setSaving]    = useState(false);

  const me = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const fetchAdmins = async () => {
    try {
      const res = await API.get("/admin/auth/all");
      setAdmins(res.data.data);
    } catch { toast.error("Failed to load admins"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/admin/auth/create", form);
      toast.success("Admin created! Credentials sent to email ✅");
      setShowModal(false);
      setForm({ name: "", email: "", role: "admin" });
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, role) => {
    if (role === "superadmin") return toast.error("Cannot delete SuperAdmin");
    if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/admin/auth/${id}`);
      toast.success("Admin deleted ✅");
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
  };

  const roleClass = (role) => {
    if (role === "superadmin") return "bg-purple-50 text-purple-700 border-purple-200";
    if (role === "admin")      return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-green-50 text-green-700 border-green-200";
  };

  const avatarBg = (role) => {
    if (role === "superadmin") return "bg-purple-600";
    if (role === "admin")      return "bg-blue-600";
    return "bg-green-600";
  };

  if (loading) return <Loader />;

  const canManage = me.role !== "user";

  return (
    <div className="max-w-[1500px] mx-auto ">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4 md:mb-5">
        <div>
          <h1 className="text-[18px] md:text-[22px] font-extrabold text-brand-dark m-0">Admin Users</h1>
          <p className="text-[12px] md:text-[13px] text-brand-muted mt-1">{admins.length} total admins</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 md:px-5 py-2 bg-brand-gradient text-white rounded-[8px] text-[13px] md:text-[14px] font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(241,90,33,0.3)] whitespace-nowrap"
          >
            + Add Admin
          </button>
        )}
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] md:rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* ── Desktop Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FFEDD5]">
                {["Name", "Email", "Role", "Status", "Joined", canManage ? "Action" : null]
                  .filter(Boolean)
                  .map(h => (
                    <th key={h} className="px-4 py-[13px] text-left text-[12px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                  <td className="px-4 py-[14px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 ${avatarBg(a.role)}`}>
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[14px] font-semibold text-brand-dark whitespace-nowrap">{a.name}</span>
                      {a._id === me._id && (
                        <span className="bg-gray-100 text-brand-gray text-[11px] px-2 py-[2px] rounded-[10px]">You</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-[14px] text-[13px] text-brand-gray whitespace-nowrap">{a.email}</td>
                  <td className="px-4 py-[14px]">
                    <span className={`px-3 py-[3px] rounded-[20px] text-[12px] font-semibold border whitespace-nowrap ${roleClass(a.role)}`}>
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-[14px]">
                    <span className={`px-3 py-[3px] rounded-[20px] text-[12px] font-semibold border whitespace-nowrap
                      ${a.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                      {a.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-[14px] text-[13px] text-brand-gray whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  {canManage && (
                    <td className="px-4 py-[14px]">
                      {a.role !== "superadmin" && a._id !== me._id && (
                        <button
                          onClick={() => handleDelete(a._id, a.role)}
                          className="px-3 py-[5px] bg-red-50 text-red-600 border-none rounded-[7px] text-[12px] font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-brand-border">
          <span className="text-[11.5px] md:text-[12px] text-brand-muted">Showing {admins.length} admins</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[1000] p-0 sm:p-4">
          <div className="bg-white rounded-t-[20px] sm:rounded-[20px] p-5 sm:p-8 w-full sm:max-w-[460px] max-h-[92vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h3 className="text-[17px] sm:text-[18px] font-bold text-brand-dark m-0">Add New Admin</h3>
              <button onClick={() => setShowModal(false)} className="bg-transparent border-none text-[18px] text-brand-muted cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-brand-dark mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-[12px] border border-brand-border rounded-[8px] text-[16px] sm:text-[14px] outline-none bg-white focus:border-brand-primary transition-all"
                />
              </div>
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-brand-dark mb-2">Email</label>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-[12px] border border-brand-border rounded-[8px] text-[16px] sm:text-[14px] outline-none bg-white focus:border-brand-primary transition-all"
                />
              </div>
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-brand-dark mb-2">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-[12px] border border-brand-border rounded-[8px] text-[16px] sm:text-[14px] outline-none bg-white focus:border-brand-primary transition-all"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User (Read Only)</option>
                </select>
              </div>

              <p className="text-[12.5px] text-brand-muted mb-5">A random password will be generated and sent to their email.</p>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 sm:flex-none px-5 py-[10px] bg-gray-100 text-brand-gray border-none rounded-[8px] text-[14px] cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 sm:flex-none px-5 py-[10px] bg-brand-gradient text-white border-none rounded-[8px] text-[14px] font-bold cursor-pointer disabled:opacity-70 shadow-[0_4px_12px_rgba(241,90,33,0.3)]">
                  {saving ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
