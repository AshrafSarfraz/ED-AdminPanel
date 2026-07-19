import { useState, useEffect } from "react";
import Loader from "../../../components/Loader";

const BASE = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
  }).then(r => r.json());

export default function Countries() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ name: "", code: "" });
  const [editing, setEditing] = useState(null);
  const [adding,  setAdding]  = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");

  const load = async () => {
    setLoading(true);
    const data = await apiFetch("/api/countries/all");
    if (data.success) setItems(data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setError("");
    if (!form.name) { setError("Country name is required"); return; }
    setSaving(true);
    const url    = editing ? `/api/countries/${editing._id}` : "/api/countries";
    const method = editing ? "PUT" : "POST";
    const data   = await apiFetch(url, { method, body: JSON.stringify(form) });
    if (data.success) {
      if (editing) setItems(is => is.map(i => i._id === editing._id ? data.data : i));
      else         setItems(is => [data.data, ...is]);
      cancel();
    } else setError(data.message || "Error saving");
    setSaving(false);
  };

  const toggle = async (id) => {
    const data = await apiFetch(`/api/countries/${id}/toggle`, { method: "PUT" });
    if (data.success) setItems(is => is.map(i => i._id === id ? { ...i, isActive: data.data.isActive } : i));
  };

  const del = async (id) => {
    if (!confirm("Delete this country?")) return;
    await apiFetch(`/api/countries/${id}`, { method: "DELETE" });
    setItems(is => is.filter(i => i._id !== id));
  };

  const startEdit = (item) => { setEditing(item); setForm({ name: item.name, code: item.code || "" }); setAdding(true); setError(""); };
 const cancel = () => { setEditing(null); setForm({ name: "", code: "" }); setError(""); };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.code || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {adding && (
        <div className="bg-gradient-to-br from-[#FFF1DD] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
          <h2 className="text-[14px] font-bold text-brand-dark m-0 mb-3">{editing ? "Edit" : "Add"} Country</h2>
          {error && <p className="text-red-600 text-[11px] mb-2">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-brand-dark mb-1">Country Name <span className="text-red-500">*</span></label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Qatar"
                className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-brand-dark mb-1">Country Code</label>
              <input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="e.g. QA"
                className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="px-4 py-[7px] bg-brand-primary text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer disabled:opacity-60 shadow-[0_4px_12px_rgba(241,90,33,0.3)]">
              {saving ? "Saving..." : editing ? "Update" : "Add Country"}
            </button>
            <button onClick={cancel}
              className="px-4 py-[7px] bg-gray-100 text-brand-gray border-none rounded-[8px] text-[12px] cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Countries</h1>
            <p className="text-[11px] text-brand-muted mt-[2px]">{filtered.length} countries</p>
          </div>
          {!adding && (
            <button
              onClick={() => { setAdding(true); setEditing(null); setForm({ name: "", code: "" }); }}
              className="px-4 py-[7px] bg-brand-primary text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(241,90,33,0.3)]"
            >
              + Add Country
            </button>
          )}
        </div>

        <div className="px-4 md:px-6 pb-3">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all"
          />
        </div>

        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[12px]">
              {search ? "No countries found matching your search" : "No countries yet"}
            </p>
          ) : (
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FFEDD5]">
                  <th className="w-[30%] px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Name</th>
                  <th className="w-[20%] px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Code</th>
                  <th className="w-[20%] px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Status</th>
                  <th className="w-[30%] px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                    <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{item.name}</td>
                    <td className="px-4 py-[10px] text-[11px] text-brand-gray">{item.code || "—"}</td>
                    <td className="px-4 py-[10px]">
                      <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
                        ${item.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-[10px]">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(item)}
                          className="px-3 py-[4px] bg-blue-50 text-blue-700 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                          Edit
                        </button>
                        <button onClick={() => toggle(item._id)}
                          className="px-3 py-[4px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                          {item.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => del(item._id)}
                          className="px-3 py-[4px] bg-red-50 text-red-600 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center px-4 md:px-6 py-3 border-t border-brand-border">
          <span className="text-[11px] text-brand-muted">Showing {filtered.length} of {items.length} countries</span>
        </div>
      </div>
    </div>
  );
}