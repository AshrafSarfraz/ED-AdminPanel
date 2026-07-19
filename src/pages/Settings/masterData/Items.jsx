import { useState, useEffect } from "react";
import Loader from "../../../components/Loader";

const BASE = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
  }).then(r => r.json());

const UNIT_OPTIONS = {
  weight: ["50g", "100g", "250g", "330g", "500g", "750g", "kg", "2kg", "5kg", "10kg", "20kg", "50kg"],
  volume: ["50ml", "100ml", "250ml", "330ml", "500ml", "750ml", "L", "1.5L", "2L", "5L"],
  count:  ["pcs","2pcs","3pcs","4pcs","5pcs","6pcs","10pcs","12pcs"],
};

const EMPTY = { baseName: "", name: "", categoryId: "", brandId: "", unitType: "", unit: "" };

export default function Items() {
  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands,     setBrands]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filterCat,  setFilterCat]  = useState("");
  const [adding,     setAdding]     = useState(true);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [image,      setImage]      = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/api/items/all"),
      apiFetch("/api/categories/all"),
      apiFetch("/api/brands/all"),
    ]).then(([iData, cData, bData]) => {
      if (iData.success) setItems(iData.data);
      if (cData.success) setCategories(cData.data);
      if (bData.success) setBrands(bData.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const q = filterCat ? `?categoryId=${filterCat}` : "";
    apiFetch(`/api/items/all${q}`).then(data => { if (data.success) setItems(data.data); });
  }, [filterCat]);

  useEffect(() => {
    if (editing) return;
    const brand = brands.find(b => b._id === form.brandId)?.name || "";
    const parts = [brand, form.baseName, form.unit].filter(Boolean);
    setForm(f => ({ ...f, name: parts.join(" ") }));
  }, [form.baseName, form.brandId, form.unit]);

  const save = async () => {
    setError("");
    if (!form.name || !form.categoryId || !form.unitType || !form.unit) {
      setError("Name, category, unit type and unit are required"); return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append("name",       form.name);
    fd.append("categoryId", form.categoryId);
    fd.append("unitType",   form.unitType);
    fd.append("unit",       form.unit);
    if (form.brandId) fd.append("brandId", form.brandId);
    if (image)        fd.append("image", image);

    const url    = editing ? `/api/items/${editing._id}` : "/api/items";
    const method = editing ? "PUT" : "POST";
    const res    = await fetch(`${BASE}${url}`, { method, headers: { Authorization: `Bearer ${token()}` }, body: fd });
    const data   = await res.json();
    if (data.success) {
      if (editing) setItems(is => is.map(i => i._id === editing._id ? data.data : i));
      else         setItems(is => [data.data, ...is]);
      cancel();
    } else setError(data.message || "Error saving");
    setSaving(false);
  };

  const toggle = async (id) => {
    const data = await apiFetch(`/api/items/${id}/toggle`, { method: "PUT" });
    if (data.success) setItems(is => is.map(i => i._id === id ? { ...i, isActive: !i.isActive } : i));
  };

  const del = async (id) => {
    if (!confirm("Delete this item?")) return;
    await apiFetch(`/api/items/${id}`, { method: "DELETE" });
    setItems(is => is.filter(i => i._id !== id));
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({
      baseName:   item.name,
      name:       item.name,
      categoryId: item.categoryId?._id || item.categoryId,
      brandId:    item.brandId?._id || item.brandId || "",
      unitType:   item.unitType || "",
      unit:       item.unit,
    });
    setAdding(true); setError("");
  };

  const cancel = () => { setEditing(null); setForm({ name: "", code: "" }); setError(""); };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.categoryId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.brandId?.name    || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Add/Edit Form */}
      {adding && (
        <div className="bg-gradient-to-br from-[#FFF1DD] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
          <h2 className="text-[14px] font-bold text-brand-dark m-0 mb-3">{editing ? "Edit" : "Add"} Item</h2>
          {error && <p className="text-red-600 text-[11px] mb-2">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">

            {/* Product Base Name */}
            <div>
              <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.baseName}
                onChange={e => setForm(f => ({ ...f, baseName: e.target.value }))}
                placeholder="e.g. Water, Tissue 2ply 150sheets"
                className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all"
              />
              {form.name && (
                <p className="text-[10px] mt-1 text-brand-muted">
                  Saved as: <span className="font-semibold text-brand-primary">"{form.name}"</span>
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-brand-dark mb-1">Category <span className="text-red-500">*</span></label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all"
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                Brand <span className="text-[10px] text-brand-muted font-normal">(optional)</span>
              </label>
              <select
                value={form.brandId}
                onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}
                className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all"
              >
                <option value="">No brand</option>
                {brands.filter(b => b.isActive).map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            {/* Unit Type */}
            <div>
              <label className="block text-[11px] font-semibold text-brand-dark mb-1">Unit Type <span className="text-red-500">*</span></label>
              <select
                value={form.unitType}
                onChange={e => setForm(f => ({ ...f, unitType: e.target.value, unit: "" }))}
                className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all"
              >
                <option value="">Select type</option>
                <option value="weight">Weight (g / kg)</option>
                <option value="volume">Volume (ml / L)</option>
                <option value="count">Count (pcs)</option>
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-[11px] font-semibold text-brand-dark mb-1">Unit <span className="text-red-500">*</span></label>
              <select
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                disabled={!form.unitType}
                className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select unit</option>
                {form.unitType && UNIT_OPTIONS[form.unitType].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Image */}
            <div>
              <label className="block text-[11px] font-semibold text-brand-dark mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files[0])}
                className="w-full text-[11px] px-3 py-[9px] border border-dashed border-brand-border rounded-[8px] bg-white cursor-pointer"
              />
              {image && <p className="text-[10px] text-green-600 mt-1">✅ {image.name}</p>}
            </div>

          </div>

          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="px-4 py-[7px] bg-brand-primary text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer disabled:opacity-60 shadow-[0_4px_12px_rgba(241,90,33,0.3)]">
              {saving ? "Saving..." : editing ? "Update" : "Add Item"}
            </button>
            <button onClick={cancel}
              className="px-4 py-[7px] bg-gray-100 text-brand-gray border-none rounded-[8px] text-[12px] cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Platform Items</h1>
            <p className="text-[11px] text-brand-muted mt-[2px]">{filtered.length} items</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="px-3 py-[7px] border border-brand-border rounded-[8px] text-[11px] outline-none bg-white focus:border-brand-primary transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {!adding && (
              <button
                onClick={() => setAdding(true)}
                className="px-4 py-[7px] bg-brand-primary text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer shadow-[0_4px_12px_rgba(241,90,33,0.3)]"
              >
                + Add Item
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 pb-3">
          <input
            type="text"
            placeholder="Search by name, category or brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "630px" }}>
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[12px]">
              {search ? "No items found matching your search" : "No items yet"}
            </p>
          ) : (
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FFEDD5]">
                  <th className="w-[30%] px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Item</th>
                  <th className="w-[15%] px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Category</th>
                  <th className="w-[12%] px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Brand</th>
                  <th className="w-[7%]  px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Type</th>
                  <th className="w-[7%]  px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Unit</th>
                  <th className="w-[7%]  px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Status</th>
                  <th className="w-[22%] px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">

                    <td className="px-4 py-[10px]">
                      <div className="flex items-center gap-2">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-7 h-7 rounded-[6px] object-cover shrink-0" />
                          : <div className="w-7 h-7 rounded-[6px] bg-brand-lighter flex items-center justify-center text-[9px] text-brand-muted shrink-0">IMG</div>
                        }
                        <span className="text-[12px] font-semibold text-brand-dark truncate">{item.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-[10px] text-[11px] text-brand-gray">{item.categoryId?.name || "—"}</td>
                    <td className="px-4 py-[10px] text-[11px] text-brand-gray">{item.brandId?.name || "—"}</td>

                    <td className="px-4 py-[10px]">
                      <span className={`px-2 py-[2px] rounded-[8px] text-[10px] font-semibold
                        ${item.unitType === "weight" ? "bg-amber-50 text-amber-700"
                        : item.unitType === "volume" ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"}`}>
                        {item.unitType || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-[10px] text-[11px] font-semibold text-brand-dark">{item.unit}</td>

                    <td className="px-4 py-[10px]">
                      <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
                        ${item.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-[10px]">
                      <div className="flex gap-2 flex-wrap">
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

        {/* Footer */}
        <div className="flex items-center px-4 md:px-6 py-3 border-t border-brand-border">
          <span className="text-[11px] text-brand-muted">Showing {filtered.length} of {items.length} items</span>
        </div>
      </div>
    </div>
  );
}