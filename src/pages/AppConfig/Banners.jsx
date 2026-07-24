import { useState, useEffect } from "react";
import Loader from "../../components/Loader";

const BASE  = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
  }).then(r => r.json());

const EMPTY = { tag: "", title: "", subtitle: "", emoji: "", bg: "#F15A21", waNumber: "", waText: "", order: 0 };

export default function Banners() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [adding,  setAdding]  = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const load = async () => {
    setLoading(true);
    const data = await apiFetch("/api/admin/banner");
    if (data.success) setItems(data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setError("");
    if (!form.tag || !form.title || !form.bg || !form.waNumber || !form.waText) {
      setError("Tag, Title, BG Color, WhatsApp Number and WhatsApp Text are required");
      return;
    }
    setSaving(true);
    const url    = editing ? `/api/admin/banner/${editing._id}` : "/api/admin/banner";
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
    const data = await apiFetch(`/api/admin/banner/${id}/toggle`, { method: "PUT" });
    if (data.success) setItems(is => is.map(i => i._id === id ? { ...i, isActive: data.data.isActive } : i));
  };

  const del = async (id) => {
    if (!confirm("Delete this banner?")) return;
    await apiFetch(`/api/admin/banner/${id}`, { method: "DELETE" });
    setItems(is => is.filter(i => i._id !== id));
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({ tag: item.tag, title: item.title, subtitle: item.subtitle || "", emoji: item.emoji || "", bg: item.bg, waNumber: item.waNumber, waText: item.waText, order: item.order || 0 });
    setAdding(true);
    setError("");
  };
  const cancel = () => { setEditing(null); setForm(EMPTY); setError(""); };

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all";
  const labelCls = "block text-[11px] font-semibold text-brand-dark mb-1";

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {adding && (
        <div className="bg-gradient-to-br from-[#FFF1DD] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
          <h2 className="text-[14px] font-bold text-brand-dark mb-3">{editing ? "Edit" : "Add"} Banner</h2>
          {error && <p className="text-red-600 text-[11px] mb-2">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelCls}>Tag <span className="text-red-500">*</span></label>
              <input value={form.tag} onChange={F("tag")} placeholder="e.g. Sponsored" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Emoji</label>
              <input value={form.emoji} onChange={F("emoji")} placeholder="e.g. 🥕" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Title <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={F("title")} placeholder="e.g. Boost Your Business" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Subtitle</label>
              <input value={form.subtitle} onChange={F("subtitle")} placeholder="e.g. Reach 10,000+ buyers" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Background Color <span className="text-red-500">*</span></label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.bg} onChange={F("bg")} className="h-[38px] w-[48px] rounded-[6px] border border-brand-border cursor-pointer p-[2px]" />
                <input value={form.bg} onChange={F("bg")} placeholder="#F15A21" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Display Order</label>
              <input type="number" value={form.order} onChange={F("order")} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp Number <span className="text-red-500">*</span></label>
              <input value={form.waNumber} onChange={F("waNumber")} placeholder="e.g. 97477876146" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp Pre-filled Text <span className="text-red-500">*</span></label>
              <input value={form.waText} onChange={F("waText")} placeholder="Hello, I would like more info..." className={inputCls} />
            </div>
          </div>

          {/* Preview */}
          <div className="mb-4">
            <label className={labelCls}>Preview</label>
            <div className="rounded-[16px] p-4 flex items-center justify-between overflow-hidden relative max-w-[340px]"
              style={{ backgroundColor: form.bg }}>
              <div className="absolute top-[-20px] right-[-10px] w-[80px] h-[80px] rounded-full bg-white opacity-10" />
              <div className="absolute bottom-[-25px] right-[40px] w-[60px] h-[60px] rounded-full bg-white opacity-[0.07]" />
              <div className="relative z-10">
                <p className="text-[10px] text-white opacity-70 mb-1">{form.tag || "Tag"}</p>
                <p className="text-[14px] font-bold text-white leading-tight">{form.title || "Banner Title"}</p>
                {form.subtitle && <p className="text-[10px] text-white opacity-85 mt-1">{form.subtitle}</p>}
              </div>
              <span className="text-[40px] relative z-10">{form.emoji || "🎁"}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="px-4 py-[7px] bg-brand-gradient text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer disabled:opacity-60 shadow-[0_4px_12px_rgba(241,90,33,0.3)]">
              {saving ? "Saving..." : editing ? "Update Banner" : "Add Banner"}
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
            <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">App Banners</h1>
            <p className="text-[11px] text-brand-muted mt-[2px]">{items.length} banners</p>
          </div>
          {!adding && (
            <button onClick={() => { setAdding(true); setEditing(null); setForm(EMPTY); }}
              className="px-4 py-[7px] bg-brand-primary text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(241,90,33,0.3)]">
              + Add Banner
            </button>
          )}
        </div>

        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
          {items.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[12px]">No banners yet</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FFEDD5]">
                  <th className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold">Preview</th>
                  <th className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold">Tag / Title</th>
                  <th className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold">WhatsApp</th>
                  <th className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold">Order</th>
                  <th className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold">Status</th>
                  <th className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                    <td className="px-4 py-[10px]">
                      <div className="w-[60px] h-[36px] rounded-[8px] flex items-center justify-center text-[18px]"
                        style={{ backgroundColor: item.bg }}>
                        {item.emoji}
                      </div>
                    </td>
                    <td className="px-4 py-[10px]">
                      <p className="text-[11px] text-brand-muted">{item.tag}</p>
                      <p className="text-[12px] font-semibold text-brand-dark">{item.title}</p>
                    </td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-gray">{item.waNumber}</td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-gray">{item.order}</td>
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
          <span className="text-[11px] text-brand-muted">Showing {items.length} banners</span>
        </div>
      </div>
    </div>
  );
}
