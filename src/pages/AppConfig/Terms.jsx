import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import API from "../../api/axios"; // ← tumhara axios instance

export default function Terms() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ content: "", version: "" });
  const [adding,  setAdding]  = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [preview, setPreview] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await API.get("/app-config/terms/all");
    if (data.success) setItems(data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setError("");
    if (!form.content || !form.version) { setError("Content and Version are required"); return; }
    setSaving(true);
    try {
      const { data } = editing
        ? await API.put(`/app-config/terms/${editing._id}`, form)
        : await API.post("/app-config/terms", form);
      if (data.success) {
        if (editing) setItems(is => is.map(i => i._id === editing._id ? data.data : i));
        else load(); // POST deactivates all old — reload full list
        cancel();
      } else setError(data.message || "Error saving");
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({ content: item.content, version: item.version });
    setAdding(true);
    setError("");
    setPreview(null);
  };

  const cancel = () => { setEditing(null); setForm({ content: "", version: "" }); setError(""); setAdding(false); };

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all";
  const labelCls = "block text-[11px] font-semibold text-brand-dark mb-1";

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {adding && (
        <div className="bg-gradient-to-br from-[#FFF1DD] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
          <h2 className="text-[14px] font-bold text-brand-dark mb-1">{editing ? "Edit" : "Add New"} Terms & Conditions</h2>
          {!editing && (
            <p className="text-[11px] text-brand-muted mb-3">
              ⚠️ Adding new T&C will automatically deactivate all previous versions.
            </p>
          )}
          {error && <p className="text-red-600 text-[11px] mb-2">{error}</p>}

          <div className="mb-3 w-full md:w-1/4">
            <label className={labelCls}>Version <span className="text-red-500">*</span></label>
            <input value={form.version} onChange={F("version")} placeholder="e.g. 1.0, 1.1, 2.0" className={inputCls} />
          </div>
          <div className="mb-3">
            <label className={labelCls}>Content <span className="text-red-500">*</span></label>
            <textarea value={form.content} onChange={F("content")} placeholder="Write your Terms & Conditions here..." rows={12}
              className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all resize-y font-mono" />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={save} disabled={saving}
              className="px-4 py-[7px] bg-brand-primary text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer disabled:opacity-60 shadow-[0_4px_12px_rgba(241,90,33,0.3)]">
              {saving ? "Saving..." : editing ? "Update T&C" : "Publish T&C"}
            </button>
            <button onClick={() => setPreview(preview ? null : form.content)}
              className="px-4 py-[7px] bg-white text-brand-primary border border-brand-primary rounded-[8px] text-[12px] font-semibold cursor-pointer">
              {preview ? "Hide Preview" : "Preview"}
            </button>
            <button onClick={cancel}
              className="px-4 py-[7px] bg-gray-100 text-brand-gray border-none rounded-[8px] text-[12px] cursor-pointer">
              Cancel
            </button>
          </div>

          {preview && (
            <div className="mt-4 p-4 bg-white border border-brand-border rounded-[12px]">
              <p className="text-[11px] font-bold text-brand-muted mb-2">PREVIEW</p>
              <pre className="text-[12px] text-brand-dark whitespace-pre-wrap font-sans leading-relaxed">{preview}</pre>
            </div>
          )}
        </div>
      )}

      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Terms & Conditions</h1>
            <p className="text-[11px] text-brand-muted mt-[2px]">{items.length} versions</p>
          </div>
          {!adding && (
            <button onClick={() => setAdding(true)}
              className="px-4 py-[7px] bg-brand-primary text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(241,90,33,0.3)]">
              + New Version
            </button>
          )}
        </div>

        <div className="px-4 md:px-6 pb-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[12px]">No T&C published yet</p>
          ) : items.map(item => (
            <div key={item._id} className="border border-brand-border rounded-[12px] overflow-hidden bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold px-2 py-[2px] rounded-[20px]
                    ${item.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {item.isActive ? "Active" : "Old"}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-brand-dark">Version {item.version}</p>
                    <p className="text-[11px] text-brand-muted">
                      {new Date(item.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPreview(preview === item._id ? null : item._id)}
                    className="px-3 py-[4px] bg-brand-soft text-brand-primary border border-brand-border rounded-[6px] text-[11px] font-semibold cursor-pointer">
                    {preview === item._id ? "Hide" : "View"}
                  </button>
                  <button onClick={() => startEdit(item)}
                    className="px-3 py-[4px] bg-blue-50 text-blue-700 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                    Edit
                  </button>
                </div>
              </div>
              {preview === item._id && (
                <div className="px-4 pb-4 border-t border-brand-border">
                  <pre className="text-[12px] text-brand-gray whitespace-pre-wrap font-sans leading-relaxed mt-3 max-h-[300px] overflow-y-auto">
                    {item.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
