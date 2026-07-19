// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const BASE    = "https://el-distibutor-backend.onrender.com";
// const token   = () => localStorage.getItem("adminToken");
// const apiFetch = (path) =>
//   fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

// // ─── Cache helpers ──────────────────────────────────────────────────────────
// const CACHE_TTL = 5 * 60 * 1000;
// const cacheSet  = (key, data) => localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
// const cacheGet  = (key) => {
//   try {
//     const raw = localStorage.getItem(key);
//     if (!raw) return null;
//     const { ts, data } = JSON.parse(raw);
//     return { data, stale: Date.now() - ts > CACHE_TTL };
//   } catch { return null; }
// };

// const initials  = (name = "") => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
// const rateColor = (r) => r >= 70 ? "#16a34a" : r >= 40 ? "#d97706" : "#dc2626";

// export default function AdminSupplierPerformance() {
//   const navigate   = useNavigate();
//   const [suppliers, setSuppliers] = useState([]);
//   const [loading,   setLoading]   = useState(true);
//   const [refreshing,setRefreshing]= useState(false);
//   const [search,    setSearch]    = useState("");
//   const [sort,      setSort]      = useState("wins");

//   const loadSuppliers = (background = false) => {
//     const CACHE_KEY = "supplierPerformance";
//     const cached    = cacheGet(CACHE_KEY);

//     if (!background && cached) {
//       setSuppliers(cached.data);
//       setLoading(false);
//       if (!cached.stale) return;
//       setRefreshing(true);
//     } else if (!background) {
//       setLoading(true);
//     } else {
//       setRefreshing(true);
//     }

//     apiFetch("/api/admin/bulk-orders?limit=1000").then(d => {
//       if (!d.success) return;
//       const supMap = {};
//       d.data.forEach(o => {
//         if (!o.winner) return;
//         const key = o.winner.branchId || o.winner.name;
//         if (!supMap[key]) supMap[key] = {
//           branchId:    o.winner.branchId,
//           managerName: o.winner.name,
//           companyName: o.winner.companyName,
//           wins: 0, total: 0, lost: 0, missed: 0,
//         };
//         supMap[key].total++;
//         if (o.status === "awarded")   supMap[key].wins++;
//         else if (o.status === "bidding")   supMap[key].lost++;
//         else if (o.status === "cancelled") supMap[key].missed++;
//       });
//       const result = Object.values(supMap);
//       setSuppliers(result);
//       cacheSet(CACHE_KEY, result);
//     }).finally(() => { setLoading(false); setRefreshing(false); });
//   };

//   useEffect(() => { loadSuppliers(); }, []);

//   const filtered = suppliers
//     .filter(s =>
//       s.managerName?.toLowerCase().includes(search.toLowerCase()) ||
//       s.companyName?.toLowerCase().includes(search.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sort === "wins")  return b.wins - a.wins;
//       if (sort === "rate")  return (b.wins/(b.total||1)) - (a.wins/(a.total||1));
//       if (sort === "total") return b.total - a.total;
//       if (sort === "name")  return (a.managerName||"").localeCompare(b.managerName||"");
//       return 0;
//     });

//   const maxWins   = Math.max(...filtered.map(s => s.wins), 1);
//   const totalWins = filtered.reduce((s, x) => s + x.wins, 0);
//   const avgRate   = filtered.length
//     ? Math.round(filtered.reduce((s, x) => s + (x.wins / (x.total || 1) * 100), 0) / filtered.length)
//     : 0;
//   const top = filtered[0];

//   return (
//     <div style={S.container}>

//       {/* Header */}
//       <div style={S.pageHeader}>
//         <div>
//           <h2 style={S.title}>Supplier Performance</h2>
//           <p style={S.subtitle}>All suppliers ranked by bidding wins — most to least</p>
//         </div>
//         <button onClick={() => loadSuppliers(true)} disabled={refreshing} style={{
//           ...S.outlineBtn,
//           display: "flex", alignItems: "center", gap: "6px",
//           opacity: refreshing ? 0.6 : 1,
//         }}>
//           <span style={{ display: "inline-block", animation: refreshing ? "spin 1s linear infinite" : "none" }}>↻</span>
//           {refreshing ? "Refreshing…" : "Refresh"}
//         </button>
//       </div>

//       {/* Summary cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
//         {[
//           { label: "Total suppliers", value: filtered.length,                         sub: "who participated"    },
//           { label: "Total wins",      value: totalWins,                               sub: "across all auctions" },
//           { label: "Avg win rate",    value: avgRate + "%",                           sub: "per supplier"        },
//           { label: "Top winner",      value: top?.managerName?.split(" ")[0] || "—", sub: top ? top.wins + " wins" : "" },
//         ].map(c => (
//           <div key={c.label} style={S.card}>
//             <p style={{ fontSize: "12px", color: "#888", margin: "0 0 6px" }}>{c.label}</p>
//             <p style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 2px" }}>{c.value}</p>
//             <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>{c.sub}</p>
//           </div>
//         ))}
//       </div>

//       {/* Table card */}
//       <div style={{ ...S.tableWrap, padding: "20px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
//           <div>
//             <p style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 2px" }}>All Suppliers</p>
//             <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
//               {filtered.length} suppliers
//               {refreshing && <span style={{ marginLeft: "8px", fontSize: "11px", color: "#F15A21" }}>● syncing…</span>}
//             </p>
//           </div>
//         </div>

//         {/* Search + sort */}
//         <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
//           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier or company..."
//             style={S.input} />
//           <select value={sort} onChange={e => setSort(e.target.value)}
//             style={{ ...S.input, flex: "none", width: "auto", cursor: "pointer" }}>
//             <option value="wins">Sort by wins</option>
//             <option value="rate">Sort by win rate</option>
//             <option value="total">Sort by total bids</option>
//             <option value="name">Sort by name</option>
//           </select>
//         </div>

//         {/* Table */}
//         {loading ? (
//           <div style={{ textAlign: "center", padding: "60px 40px" }}>
//             <div style={S.spinner} />
//             <p style={{ color: "#888", marginTop: "12px", fontSize: "13px" }}>Loading suppliers…</p>
//           </div>
//         ) : (
//           <table style={S.table}>
//             <thead>
//               <tr style={S.thead}>
//                 {["#", "Supplier", "Company", "Wins", "Win Rate", "Total Bids", "Lost", "Missed", ""].map(h => (
//                   <th key={h} style={S.th}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((s, i) => {
//                 const rate = Math.round(s.wins / (s.total || 1) * 100);
//                 const pct  = Math.round(s.wins / maxWins * 100);
//                 return (
//                   <tr key={s.branchId} style={S.tr}>
//                     <td style={{ ...S.td, fontWeight: "600", color: i < 3 ? ["#d97706","#6b7280","#92400e"][i] : "#888" }}>
//                       {i + 1}
//                     </td>
//                     <td style={S.td}>
//                       <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                         <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#1a1a2e", flexShrink: 0 }}>
//                           {initials(s.managerName)}
//                         </div>
//                         <span style={{ fontWeight: "500", color: "#1a1a2e" }}>{s.managerName || "—"}</span>
//                       </div>
//                     </td>
//                     <td style={{ ...S.td, color: "#555" }}>{s.companyName || "—"}</td>
//                     <td style={S.td}>
//                       <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                         <div style={{ width: "80px", height: "6px", background: "#f0f0f0", borderRadius: "3px", overflow: "hidden" }}>
//                           <div style={{ width: pct + "%", height: "6px", background: "#F15A21", borderRadius: "3px" }} />
//                         </div>
//                         <span style={{ fontWeight: "600", color: "#F15A21" }}>{s.wins}</span>
//                       </div>
//                     </td>
//                     <td style={{ ...S.td, fontWeight: "600", color: rateColor(rate) }}>{rate}%</td>
//                     <td style={{ ...S.td, fontWeight: "500" }}>{s.total}</td>
//                     <td style={{ ...S.td, color: "#888" }}>{s.lost}</td>
//                     <td style={{ ...S.td, color: "#888" }}>{s.missed}</td>
//                     <td style={S.td}>
//                       <button onClick={() => navigate(`/bidding/suppliers/${s.branchId}`)} style={S.primaryBtn}>View</button>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {filtered.length === 0 && (
//                 <tr><td colSpan="9" style={{ padding: "40px", textAlign: "center", color: "#888", fontSize: "13px" }}>No suppliers found</td></tr>
//               )}
//             </tbody>
//           </table>
//         )}

//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #f0f0f0", marginTop: "4px" }}>
//           <p style={{ fontSize: "12px", color: "#888", background: "#f8f9fa", padding: "4px 12px", borderRadius: "20px", border: "1px solid #e5e7eb" }}>
//             Showing 1–{Math.min(filtered.length, 20)} of {filtered.length}
//           </p>
//           <div style={{ display: "flex", gap: "4px" }}>
//             {["‹","1","2","3","›"].map((p, i) => (
//               <button key={i} style={S.pageBtn(p === "1")}>{p}</button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );
// }

// const S = {
//   container:  { maxWidth: "1500px", padding: "10px", margin: "0 auto" },
//   pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
//   title:      { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" },
//   subtitle:   { fontSize: "14px", color: "#888", margin: 0 },
//   card:       { background: "#fff", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
//   tableWrap:  { background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" },
//   table:      { width: "100%", borderCollapse: "collapse" },
//   thead:      { background: "#f8f9fa" },
//   th:         { padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#888", whiteSpace: "nowrap" },
//   tr:         { borderBottom: "1px solid #f0f0f0" },
//   td:         { padding: "14px 16px", fontSize: "14px", color: "#1a1a2e", verticalAlign: "middle" },
//   input:      { flex: 1, padding: "9px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" },
//   primaryBtn: { padding: "8px 18px", background: "#F15A21", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
//   outlineBtn: { padding: "7px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "500", color: "#444" },
//   spinner:    { width: "32px", height: "32px", border: "3px solid #f0f0f0", borderTop: "3px solid #F15A21", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" },
//   pageBtn: (active) => ({ width: "30px", height: "30px", borderRadius: "6px", border: "1px solid #e5e7eb", background: active ? "#F15A21" : "#fff", color: active ? "#fff" : "#6b7280", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }),
// };

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import Loader from "../../components/Loader";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const CACHE_TTL = 5 * 60 * 1000;
const cacheSet  = (k, d) => localStorage.setItem(k, JSON.stringify({ ts: Date.now(), data: d }));
const cacheGet  = (k) => { try { const r = JSON.parse(localStorage.getItem(k)); if (!r) return null; return { data: r.data, stale: Date.now() - r.ts > CACHE_TTL }; } catch { return null; } };

const initials  = (name = "") => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const rateColor = (r) => r >= 70 ? "text-green-700" : r >= 40 ? "text-amber-700" : "text-red-600";

export default function AdminSupplierPerformance() {
  const navigate    = useNavigate();
  const [suppliers,  setSuppliers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [sort,       setSort]       = useState("wins");

  const loadSuppliers = (background = false) => {
    const CACHE_KEY = "supplierPerformance";
    const cached    = cacheGet(CACHE_KEY);
    if (!background && cached) { setSuppliers(cached.data); setLoading(false); if (!cached.stale) return; setRefreshing(true); }
    else if (!background) setLoading(true);
    else setRefreshing(true);

    apiFetch("/api/admin/bulk-orders?limit=1000").then(d => {
      if (!d.success) return;
      const supMap = {};
      d.data.forEach(o => {
        if (!o.winner) return;
        const key = o.winner.branchId || o.winner.name;
        if (!supMap[key]) supMap[key] = { branchId: o.winner.branchId, managerName: o.winner.name, companyName: o.winner.companyName, wins: 0, total: 0, lost: 0, missed: 0 };
        supMap[key].total++;
        if (o.status === "awarded")   supMap[key].wins++;
        else if (o.status === "bidding")   supMap[key].lost++;
        else if (o.status === "cancelled") supMap[key].missed++;
      });
      const result = Object.values(supMap);
      setSuppliers(result);
      cacheSet(CACHE_KEY, result);
    }).finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { loadSuppliers(); }, []);

  const filtered = suppliers
    .filter(s => s.managerName?.toLowerCase().includes(search.toLowerCase()) || s.companyName?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "wins")  return b.wins - a.wins;
      if (sort === "rate")  return (b.wins/(b.total||1)) - (a.wins/(a.total||1));
      if (sort === "total") return b.total - a.total;
      if (sort === "name")  return (a.managerName||"").localeCompare(b.managerName||"");
      return 0;
    });

  const maxWins   = Math.max(...filtered.map(s => s.wins), 1);
  const totalWins = filtered.reduce((s, x) => s + x.wins, 0);
  const avgRate   = filtered.length ? Math.round(filtered.reduce((s, x) => s + (x.wins / (x.total || 1) * 100), 0) / filtered.length) : 0;
  const top       = filtered[0];

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <StatCard value={filtered.length}                         label="Total Suppliers"  />
        <StatCard value={totalWins}                               label="Total Wins"       />
        <StatCard value={avgRate + "%"}                           label="Avg Win Rate"     />
        <StatCard value={top?.managerName?.split(" ")[0] || "—"} label="Top Winner"       sub={top ? top.wins + " wins" : ""} />
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <p className="text-[14px] font-bold text-brand-dark m-0">All Suppliers</p>
            <p className="text-[11px] text-brand-muted mt-[2px] flex items-center gap-2 m-0">
              {filtered.length} suppliers
              {refreshing && <span className="text-brand-primary font-semibold">● syncing…</span>}
            </p>
          </div>
          <button onClick={() => loadSuppliers(true)} disabled={refreshing}
            className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer disabled:opacity-60">
            ↻ Refresh
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex gap-3 px-4 md:px-6 pb-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier or company..."
            className="flex-1 min-w-[200px] px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all" />
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-[8px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all cursor-pointer">
            <option value="wins">Sort by wins</option>
            <option value="rate">Sort by win rate</option>
            <option value="total">Sort by total bids</option>
            <option value="name">Sort by name</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#FFEDD5]">
                {["#", "Supplier", "Company", "Wins", "Win Rate", "Total Bids", "Lost", "Missed", ""].map(h => (
                  <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-10 text-brand-muted text-[12px]">No suppliers found</td></tr>
              ) : filtered.map((s, i) => {
                const rate = Math.round(s.wins / (s.total || 1) * 100);
                const pct  = Math.round(s.wins / maxWins * 100);
                return (
                  <tr key={s.branchId} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                    <td className={`px-4 py-[10px] text-[11px] font-bold ${i === 0 ? "text-amber-600" : i === 1 ? "text-gray-500" : i === 2 ? "text-orange-700" : "text-brand-muted"}`}>
                      {i + 1}
                    </td>
                    <td className="px-4 py-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-lighter text-brand-dark text-[10px] font-bold flex items-center justify-center shrink-0">
                          {initials(s.managerName)}
                        </div>
                        <span className="text-[12px] font-semibold text-brand-dark">{s.managerName || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-gray">{s.companyName || "—"}</td>
                    <td className="px-4 py-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-[6px] bg-brand-lighter rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[12px] font-bold text-brand-primary">{s.wins}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-[10px] text-[12px] font-bold ${rateColor(rate)}`}>{rate}%</td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-dark font-semibold">{s.total}</td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-muted">{s.lost}</td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-muted">{s.missed}</td>
                    <td className="px-4 py-[10px]">
                      <button onClick={() => navigate(`/bidding/suppliers/${s.branchId}`)}
                        className="px-3 py-[4px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center px-4 md:px-6 py-3 border-t border-brand-border">
          <span className="text-[11px] text-brand-muted">Showing {filtered.length} suppliers</span>
        </div>
      </div>
    </div>
  );
}