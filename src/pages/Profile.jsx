import { useState, useEffect } from "react";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function Profile() {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving]   = useState(false);

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

  if (loading) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={styles.container}>
      <Toaster />

      {/* Profile Card */}
      <div style={styles.card}>
        <div style={styles.avatar}>
          {admin?.name?.charAt(0).toUpperCase()}
        </div>
        <h2 style={styles.name}>{admin?.name}</h2>
        <span style={{
          ...styles.badge,
          background: admin?.role === "superadmin" ? "#7c3aed" :
                      admin?.role === "admin"      ? "#1d4ed8" : "#059669",
        }}>
          {admin?.role?.toUpperCase()}
        </span>

        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{admin?.email}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Status</span>
            <span style={{ ...styles.infoValue, color: admin?.isActive ? "#16a34a" : "#dc2626" }}>
              {admin?.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Member Since</span>
            <span style={styles.infoValue}>
              {new Date(admin?.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div style={styles.field}>
            <label style={styles.label}>Current Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>New Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button
            style={{ ...styles.btn, opacity: saving ? 0.7 : 1 }}
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth:  "600px",
    margin:    "0 auto",
    padding:   "32px 16px",
  },
  center: {
    display:        "flex",
    justifyContent: "center",
    alignItems:     "center",
    height:         "100vh",
    color:          "#888",
  },
  card: {
    background:   "#fff",
    borderRadius: "12px",
    padding:      "32px",
    boxShadow:    "0 2px 12px rgba(0,0,0,0.08)",
    marginBottom: "24px",
    textAlign:    "center",
  },
  avatar: {
    width:          "80px",
    height:         "80px",
    borderRadius:   "50%",
    background:     "#1a1a2e",
    color:          "#fff",
    fontSize:       "32px",
    fontWeight:     "700",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    margin:         "0 auto 16px",
  },
  name: {
    fontSize:     "22px",
    fontWeight:   "700",
    color:        "#1a1a2e",
    margin:       "0 0 8px",
  },
  badge: {
    display:      "inline-block",
    padding:      "4px 14px",
    borderRadius: "20px",
    color:        "#fff",
    fontSize:     "12px",
    fontWeight:   "600",
  },
  infoGrid: {
    marginTop:  "24px",
    textAlign:  "left",
  },
  infoItem: {
    display:        "flex",
    justifyContent: "space-between",
    padding:        "12px 0",
    borderBottom:   "1px solid #f0f0f0",
  },
  infoLabel: {
    color:      "#888",
    fontSize:   "14px",
  },
  infoValue: {
    color:      "#1a1a2e",
    fontSize:   "14px",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize:     "18px",
    fontWeight:   "700",
    color:        "#1a1a2e",
    marginBottom: "24px",
    textAlign:    "left",
  },
  field: {
    marginBottom: "16px",
    textAlign:    "left",
  },
  label: {
    display:      "block",
    fontSize:     "13px",
    fontWeight:   "600",
    color:        "#444",
    marginBottom: "6px",
  },
  input: {
    width:        "100%",
    padding:      "10px 14px",
    borderRadius: "8px",
    border:       "1px solid #ddd",
    fontSize:     "14px",
    outline:      "none",
    boxSizing:    "border-box",
  },
  btn: {
    width:           "100%",
    padding:         "12px",
    background:      "#1a1a2e",
    color:           "#fff",
    border:          "none",
    borderRadius:    "8px",
    fontSize:        "15px",
    fontWeight:      "600",
    cursor:          "pointer",
    marginTop:       "8px",
  },
};