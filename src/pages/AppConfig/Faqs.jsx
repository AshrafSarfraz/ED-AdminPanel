import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import API from "../../api/axios"; // ← tumhara axios instance

const EMPTY = { question: "", answer: "", order: 0 };

export default function Faqs() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState(null);
  const [adding,   setAdding]   = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await API.get("/app-config/faqs/all");
    if (data.success) setItems(data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setError("");
    if (!form.question || !form.answer) { setError("Question and Answer are required"); return; }
    setSaving(true);
    try {
      const { data } = editing
        ? await API.put(`/app-config/faqs/${editing._id}`, form)
        : await API.post("/app-config/faqs", form);
      if (data.success) {
        if (editing) setItems(is => is.map(i => i._id === editing._id ? data.data : i));
        else         setItems(is => [data.data, ...is]);
        cancel();
      } else setError(data.message || "Error saving");
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const toggle = async (id) => {
    const { data } = await API.put(`/app-config/faqs/${id}/toggle`);
    if (data.success) setItems(is => is.map(i => i._id === id ? { ...i, isActive: data.data.isActive } : i));
  };

  const del = async (id) => {
    if (!confirm("Delete this FAQ?")) return;
    await API.delete(`/app-config/faqs/${id}`);
    setItems(is => is.filter(i => i._id !== id));
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer, order: item.order || 0 });
    setAdding(true);
    setError("");
  };
  const cancel = () => { setEditing(null); setForm(EMPTY); setError(""); };

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all";
  const labelCls = "block text-[11px] font-semibold text-brand-dark mb-1";

  const filtered = items.filter(i =>
    i.question.toLowerCase().includes(search.toLowerCase()) ||
    i.answer.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {adding && (
        <div className="bg-gradient-to-br from-[#FFF1DD] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
          <h2 className="text-[14px] font-bold text-brand-dark mb-3">{editing ? "Edit" : "Add"} FAQ</h2>
          {error && <p className="text-red-600 text-[11px] mb-2">{error}</p>}

          <div className="mb-3">
            <label className={labelCls}>Question <span className="text-red-500">*</span></label>
            <input value={form.question} onChange={F("question")} placeholder="e.g. How does the bidding process work?" className={inputCls} />
          </div>
          <div className="mb-3">
            <label className={labelCls}>Answer <span className="text-red-500">*</span></label>
            <textarea value={form.answer} onChange={F("answer")} placeholder="Write the answer here..." rows={4}
              className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all resize-none" />
          </div>
          <div className="mb-4 w-full md:w-1/4">
            <label className={labelCls}>Display Order</label>
            <input type="number" value={form.order} onChange={F("order")} placeholder="0" className={inputCls} />
          </div>

          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="px-4 py-[7px] bg-brand-primary text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer disabled:opacity-60 shadow-[0_4px_12px_rgba(241,90,33,0.3)]">
              {saving ? "Saving..." : editing ? "Update FAQ" : "Add FAQ"}
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
            <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">FAQs</h1>
            <p className="text-[11px] text-brand-muted mt-[2px]">{filtered.length} questions</p>
          </div>
          {!adding && (
            <button onClick={() => { setAdding(true); setEditing(null); setForm(EMPTY); }}
              className="px-4 py-[7px] bg-brand-primary text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(241,90,33,0.3)]">
              + Add FAQ
            </button>
          )}
        </div>

        <div className="px-4 md:px-6 pb-3">
          <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all" />
        </div>

        <div className="px-4 md:px-6 pb-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[12px]">
              {search ? "No FAQs matching your search" : "No FAQs yet"}
            </p>
          ) : filtered.map(item => (
            <div key={item._id} className="border border-brand-border rounded-[12px] overflow-hidden bg-white">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`text-[11px] font-bold px-2 py-[2px] rounded-[20px] shrink-0
                    ${item.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {item.isActive ? "Active" : "Off"}
                  </span>
                  <p className="text-[12px] font-semibold text-brand-dark truncate">{item.question}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <button onClick={e => { e.stopPropagation(); startEdit(item); }}
                    className="px-3 py-[4px] bg-blue-50 text-blue-700 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                    Edit
                  </button>
                  <button onClick={e => { e.stopPropagation(); toggle(item._id); }}
                    className="px-3 py-[4px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                    {item.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={e => { e.stopPropagation(); del(item._id); }}
                    className="px-3 py-[4px] bg-red-50 text-red-600 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                    Delete
                  </button>
                  <span className="text-brand-muted text-[16px]">{expanded === item._id ? "▲" : "▼"}</span>
                </div>
              </div>
              {expanded === item._id && (
                <div className="px-4 pb-3 pt-0 border-t border-brand-border">
                  <p className="text-[12px] text-brand-gray leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center px-4 md:px-6 py-3 border-t border-brand-border">
          <span className="text-[11px] text-brand-muted">Showing {filtered.length} of {items.length} FAQs</span>
        </div>
      </div>
    </div>
  );
}
