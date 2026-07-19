// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";

// const BASE    = "https://el-distibutor-backend.onrender.com";
// const token   = () => localStorage.getItem("adminToken");
// const apiFetch = (path) =>
//   fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

// // ─── Cache helpers ─────────────────────────────────────────────────────────
// const CACHE_TTL = 5 * 60 * 1000; // 5 min — stale after this
// const cacheSet  = (key, data) => localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
// const cacheGet  = (key) => {
//   try {
//     const raw = localStorage.getItem(key);
//     if (!raw) return null;
//     const { ts, data } = JSON.parse(raw);
//     return { data, stale: Date.now() - ts > CACHE_TTL };
//   } catch { return null; }
// };

// const STATUS_CFG = {
//   bidding:   { label: "Live",      bg: "#dbeafe", color: "#1d4ed8" },
//   awarded:   { label: "Awarded",   bg: "#d1fae5", color: "#065f46" },
//   ready:     { label: "Ready",     bg: "#f0fdf4", color: "#16a34a" },
//   cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#dc2626" },
// };
// const initials   = (name = "") => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
// const BAR_COLORS = ["#16a34a", "#1d4ed8", "#9333ea", "#d97706"];

// const LS_FILTERS = "biddingList_filters";
// const saveFilters = (f) => localStorage.setItem(LS_FILTERS, JSON.stringify(f));
// const loadFilters = () => { try { return JSON.parse(localStorage.getItem(LS_FILTERS)) || {}; } catch { return {}; } };

// export default function BiddingList() {
//   const navigate = useNavigate();
//   const saved    = loadFilters();

//   const [orders,       setOrders]       = useState([]);
//   const [loading,      setLoading]      = useState(true);  // true = first ever load
//   const [refreshing,   setRefreshing]   = useState(false); // true = background refresh
//   const [status,       setStatus]       = useState(saved.status || "all");
//   const [search,       setSearch]       = useState(saved.search || "");
//   const [date,         setDate]         = useState(saved.date   || "");
//   const [page,         setPage]         = useState(saved.page   || 1);
//   const [total,        setTotal]        = useState(0);
//   const [pages,        setPages]        = useState(1);
//   const [stats,        setStats]        = useState({ total: 0, awarded: 0, bidding: 0, cancelled: 0, ready: 0 });
//   const [topSuppliers, setTopSuppliers] = useState([]);
//   const abortRef = useRef(null);

//   useEffect(() => { saveFilters({ status, search, date, page }); }, [status, search, date, page]);

//   // ─── Stale-while-revalidate loader ────────────────────────────────────────
//   const load = (background = false) => {
//     if (!background) {
//       // Try to paint from cache first
//       const pageKey  = `biddingPage_${status}_${date}_${page}`;
//       const statsKey = "biddingStats";
//       const cached   = cacheGet(pageKey);
//       const cStats   = cacheGet(statsKey);

//       if (cached) {
//         setOrders(cached.data.orders);
//         setTotal(cached.data.total);
//         setPages(cached.data.pages);
//         setLoading(false);
//         if (!cached.stale) return; // fresh — no need to re-fetch
//       }
//       if (cStats) {
//         setStats(cStats.data.stats);
//         setTopSuppliers(cStats.data.topSuppliers);
//         if (!cStats.stale && cached && !cached.stale) return;
//       }

//       if (!cached) setLoading(true); // no cache at all → show loader
//       else setRefreshing(true);      // stale cache → silent background refresh
//     } else {
//       setRefreshing(true);
//     }

//     // Cancel any in-flight request
//     if (abortRef.current) abortRef.current.abort();
//     const ctrl = new AbortController();
//     abortRef.current = ctrl;

//     const pageKey  = `biddingPage_${status}_${date}_${page}`;
//     const statsKey = "biddingStats";

//     let q = `page=${page}&limit=10`;
//     if (status !== "all") q += `&status=${status}`;
//     if (date)             q += `&date=${date}`;

//     Promise.all([
//       apiFetch(`/api/admin/bulk-orders?${q}`),
//       apiFetch("/api/admin/bulk-orders?limit=1000"),
//     ]).then(([paged, all]) => {
//       if (ctrl.signal.aborted) return;

//       if (paged.success) {
//         setOrders(paged.data);
//         setTotal(paged.total);
//         setPages(paged.pages);
//         cacheSet(pageKey, { orders: paged.data, total: paged.total, pages: paged.pages });
//       }

//       if (all.success) {
//         const newStats = {
//           total:     all.data.length,
//           awarded:   all.data.filter(o => o.status === "awarded").length,
//           bidding:   all.data.filter(o => o.status === "bidding").length,
//           cancelled: all.data.filter(o => o.status === "cancelled").length,
//           ready:     all.data.filter(o => o.status === "ready").length,
//         };
//         const supMap = {};
//         all.data.forEach(o => {
//           if (!o.winner) return;
//           const key = o.winner.name;
//           if (!supMap[key]) supMap[key] = { name: o.winner.name, wins: 0 };
//           supMap[key].wins++;
//         });
//         const newTop = Object.values(supMap).sort((a, b) => b.wins - a.wins).slice(0, 4);
//         setStats(newStats);
//         setTopSuppliers(newTop);
//         cacheSet(statsKey, { stats: newStats, topSuppliers: newTop });
//       }
//     }).finally(() => {
//       if (!ctrl.signal.aborted) {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     });
//   };

//   useEffect(() => { load(); return () => abortRef.current?.abort(); }, [status, date, page]);
//   useEffect(() => { setPage(1); }, [status, date]);

//   // Manual refresh button
//   const handleRefresh = () => load(true);

//   const maxWins = Math.max(...topSuppliers.map(s => s.wins), 1);

//   const statCards = [
//     { label: "Total Bids",     value: stats.total,     key: "all"       },
//     { label: "Successful Bid", value: stats.awarded,   key: "awarded"   },
//     { label: "Lost Bid",       value: stats.bidding,   key: "bidding"   },
//     { label: "Cancelled",      value: stats.cancelled, key: "cancelled" },
//     { label: "Ready",          value: stats.ready,     key: "ready"     },
//   ];

//   const tabs = [
//     { label: `All (${stats.total})`,         key: "all"     },
//     { label: `Finalized (${stats.awarded})`, key: "awarded" },
//     { label: `Completed (${stats.ready})`,   key: "ready"   },
//   ];

//   const filteredOrders = orders.filter(o =>
//     !search ||
//     o.item?.toLowerCase().includes(search.toLowerCase()) ||
//     o.winner?.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div style={S.container}>

//       {/* Page header */}
//       <div style={S.pageHeader}>
//         <div>
//           <h2 style={S.title}>Live Bidding Monitor</h2>
//           <p style={S.subtitle}>{stats.total} total orders</p>
//         </div>
//         <button onClick={handleRefresh} disabled={refreshing} style={{
//           ...S.outlineBtn,
//           display: "flex", alignItems: "center", gap: "6px",
//           opacity: refreshing ? 0.6 : 1,
//         }}>
//           <span style={{ display: "inline-block", animation: refreshing ? "spin 1s linear infinite" : "none" }}>↻</span>
//           {refreshing ? "Refreshing…" : "Refresh"}
//         </button>
//       </div>

//       {/* Stat Cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "12px", marginBottom: "24px" }}>
//         {statCards.map(c => (
//           <div key={c.key} onClick={() => setStatus(c.key)} style={{
//             ...S.card,
//             border: status === c.key ? "2px solid #F15A21" : "1px solid #e5e7eb",
//             cursor: "pointer",
//           }}>
//             <p style={{ fontSize: "26px", fontWeight: "700", color: status === c.key ? "#F15A21" : "#111827", margin: "0 0 4px" }}>{c.value}</p>
//             <p style={{ fontSize: "12px", color: status === c.key ? "#F15A21" : "#888", margin: 0 }}>{c.label}</p>
//           </div>
//         ))}
//       </div>

//       {/* Top Winning Suppliers */}
//       <div style={{ ...S.tableWrap, padding: "20px", marginBottom: "16px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
//           <div>
//             <p style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 2px" }}>Top Winning Suppliers</p>
//             <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>By number of auctions won</p>
//           </div>
//           <button onClick={() => navigate("/bidding/suppliers")} style={S.outlineBtn}>View all</button>
//         </div>

//         {topSuppliers.length === 0 ? (
//           <p style={{ fontSize: "13px", color: "#888" }}>No data yet</p>
//         ) : topSuppliers.map((s, i) => (
//           <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: i < topSuppliers.length - 1 ? "12px" : 0 }}>
//             <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F15A21", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
//               {initials(s.name)}
//             </div>
//             <p style={{ fontSize: "13px", fontWeight: "500", margin: 0, width: "140px", flexShrink: 0, color: "#1a1a2e" }}>{s.name}</p>
//             <div style={{ flex: 1, height: "8px", background: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
//               <div style={{ width: `${Math.round(s.wins / maxWins * 100)}%`, height: "8px", background: BAR_COLORS[i % BAR_COLORS.length], borderRadius: "4px" }} />
//             </div>
//             <p style={{ fontSize: "13px", fontWeight: "600", color: BAR_COLORS[i % BAR_COLORS.length], margin: 0, width: "50px", textAlign: "right" }}>{s.wins} wins</p>
//           </div>
//         ))}
//       </div>

//       {/* All Bidding Results */}
//       <div style={{ ...S.tableWrap, padding: "20px" }}>
//         <div style={{ marginBottom: "14px" }}>
//           <p style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 2px" }}>All Bidding Results</p>
//           <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
//             {total} orders currently in motion
//             {refreshing && <span style={{ marginLeft: "8px", fontSize: "11px", color: "#F15A21" }}>● syncing…</span>}
//           </p>
//         </div>

//         {/* Search + filter */}
//         <div style={{ display: "flex", gap: "8px", marginBottom: "14px", alignItems: "center" }}>
//           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bids..."
//             style={S.input} />
//           <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...S.input, flex: "none", width: "auto" }} />
//           {date && <button onClick={() => setDate("")} style={S.outlineBtn}>✕</button>}
//           <button onClick={() => load(true)} style={S.primaryBtn}>Apply Filters</button>
//         </div>

//         {/* Tabs */}
//         <div style={{ display: "flex", marginBottom: "14px", borderBottom: "1px solid #f0f0f0" }}>
//           {tabs.map(t => (
//             <button key={t.key} onClick={() => setStatus(t.key)} style={{
//               padding: "8px 16px", border: "none",
//               borderBottom: status === t.key ? "2px solid #1a1a2e" : "2px solid transparent",
//               background: "transparent", fontSize: "13px", cursor: "pointer",
//               fontWeight: status === t.key ? "700" : "400",
//               color: status === t.key ? "#1a1a2e" : "#888",
//             }}>{t.label}</button>
//           ))}
//         </div>

//         {/* Table */}
//         {loading ? (
//           <div style={{ textAlign: "center", padding: "60px 40px" }}>
//             <div style={S.spinner} />
//             <p style={{ color: "#888", marginTop: "12px", fontSize: "13px" }}>Loading orders…</p>
//           </div>
//         ) : filteredOrders.length === 0 ? (
//           <p style={{ textAlign: "center", padding: "40px", color: "#888" }}>No orders found</p>
//         ) : (
//           <table style={S.table}>
//             <thead>
//               <tr style={S.thead}>
//                 {["Bulk ID", "Product", "Supplier", "No of Buyers", "Quantity", "Price Range", "Winning Price", "Status", "Action"].map(h => (
//                   <th key={h} style={S.th}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredOrders.map(o => {
//                 const cfg = STATUS_CFG[o.status] || { label: o.status, bg: "#f0f0f0", color: "#374151" };
//                 return (
//                   <tr key={o._id} style={S.tr}>
                    
//                     <td style={{ ...S.td, fontFamily: "monospace", fontSize: "11px" }}>
//                       <span style={{ borderRadius: "6px", color: "#888" }}>
//                         {o._id?.toString().slice(-8).toUpperCase()}
//                       </span>
//                     </td>
//                     <td style={S.td}>
//                       <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                         {o.image
//                           ? <img src={o.image} alt={o.item} style={{ width: "34px", height: "34px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
//                           : <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#f0f0f0", flexShrink: 0 }} />}
//                         <span style={{ fontWeight: "500", color: "#1a1a2e" }}>{o.item}</span>
//                       </div>
//                     </td>
                  
//                     <td style={S.td}>{o.winner ? <span style={{ fontWeight: "500", color: "#1a1a2e" }}>{o.winner.name}</span> : <span style={{ color: "#888" }}>—</span>}</td>
//                     <td style={S.td}>{o.buyerCount}</td>
//                     <td style={S.td}>{o.totalQuantity?.toLocaleString()} <span style={{ color: "#888" }}>units</span></td>
//                     <td style={{ ...S.td, color: "#555" }}>{o.minPrice != null ? `${o.minPrice} - ${o.maxPrice}` : "—"}</td>
//                     <td style={{ ...S.td, fontWeight: "700", color: "#1a1a2e" }}>{o.winningPrice != null ? `QAR ${o.winningPrice}` : "—"}</td>
//                     <td style={S.td}>
//                       <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
//                     </td>
//                     <td style={S.td}>
//                       <button onClick={() => navigate(`/bidding/${o._id}`)} style={S.primaryBtn}>View Details</button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         )}

//         {/* Pagination */}
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid #f0f0f0", marginTop: "4px" }}>
//           <p style={{ fontSize: "12px", color: "#888", background: "#f8f9fa", padding: "4px 12px", borderRadius: "20px", border: "1px solid #e5e7eb" }}>
//             Showing {(page-1)*10+1}–{Math.min(page*10, total)} of {total}
//           </p>
//           <div style={{ display: "flex", gap: "4px" }}>
//             <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={S.pageBtn(false)}>‹</button>
//             {Array.from({ length: Math.min(pages,3) }, (_, i) => i+1).map(p => (
//               <button key={p} onClick={() => setPage(p)} style={S.pageBtn(page===p)}>{p}</button>
//             ))}
//             <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} style={S.pageBtn(false)}>›</button>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//       `}</style>
//     </div>
//   );
// }

// const S = {
//   container:  { maxWidth: "1500px", padding: "10px", margin: "0 auto" },
//   pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
//   title:      { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" },
//   subtitle:   { fontSize: "14px", color: "#888", margin: 0 },
//   card:       { background: "#fff", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
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
//   pageBtn: (active) => ({ width: "30px", height: "30px", borderRadius: "6px", border: "1px solid #e5e7eb", background: active ? "#1a1a2e" : "#fff", color: active ? "#fff" : "#6b7280", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }),
// };



import { useState, useEffect, useRef } from "react";
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

const STATUS_CFG = {
  bidding:   { label: "Live",      bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200"  },
  awarded:   { label: "Awarded",   bg: "bg-green-50",  text: "text-green-700", border: "border-green-200" },
  ready:     { label: "Ready",     bg: "bg-green-50",  text: "text-green-700", border: "border-green-200" },
  cancelled: { label: "Cancelled", bg: "bg-red-50",    text: "text-red-600",   border: "border-red-200"   },
};

const BAR_COLORS = ["#16a34a", "#1d4ed8", "#9333ea", "#d97706"];
const initials   = (name = "") => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const LS_FILTERS = "biddingList_filters";
const saveFilters = (f) => localStorage.setItem(LS_FILTERS, JSON.stringify(f));
const loadFilters = () => { try { return JSON.parse(localStorage.getItem(LS_FILTERS)) || {}; } catch { return {}; } };

export default function BiddingList() {
  const navigate = useNavigate();
  const saved    = loadFilters();

  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [status,       setStatus]       = useState(saved.status || "all");
  const [search,       setSearch]       = useState(saved.search || "");
  const [date,         setDate]         = useState(saved.date   || "");
  const [page,         setPage]         = useState(saved.page   || 1);
  const [total,        setTotal]        = useState(0);
  const [pages,        setPages]        = useState(1);
  const [stats,        setStats]        = useState({ total: 0, awarded: 0, bidding: 0, cancelled: 0, ready: 0 });
  const [topSuppliers, setTopSuppliers] = useState([]);
  const abortRef = useRef(null);

  useEffect(() => { saveFilters({ status, search, date, page }); }, [status, search, date, page]);

  const load = (background = false) => {
    if (!background) {
      const pageKey  = `biddingPage_${status}_${date}_${page}`;
      const statsKey = "biddingStats";
      const cached   = cacheGet(pageKey);
      const cStats   = cacheGet(statsKey);
  
      if (cached) {
        setOrders(cached.data.orders);
        setTotal(cached.data.total);
        setPages(cached.data.pages);
        setLoading(false);
        if (!cached.stale) {
          // Page cache fresh hai — stats bhi check karo
          if (cStats && !cStats.stale) {
            setStats(cStats.data.stats);
            setTopSuppliers(cStats.data.topSuppliers);
            return; // sab fresh — kuch nahi karna
          }
          // Stats stale — sirf stats refresh karo
          setRefreshing(true);
        } else {
          setRefreshing(true);
        }
      } else {
        setLoading(true); // no cache — full loader
      }
  
      // Stats cache se load karo chahe stale ho
      if (cStats) {
        setStats(cStats.data.stats);
        setTopSuppliers(cStats.data.topSuppliers);
      }
  
    } else {
      setRefreshing(true);
    }
  
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
  
    let q = `page=${page}&limit=10`;
    if (status !== "all") q += `&status=${status}`;
    if (date)             q += `&date=${date}`;
  
    Promise.all([
      apiFetch(`/api/admin/bulk-orders?${q}`),
      apiFetch("/api/admin/bulk-orders?limit=1000"),
    ]).then(([paged, all]) => {
      if (ctrl.signal.aborted) return;
  
      if (paged.success) {
        setOrders(paged.data);
        setTotal(paged.total);
        setPages(paged.pages);
        cacheSet(`biddingPage_${status}_${date}_${page}`, {
          orders: paged.data,
          total:  paged.total,
          pages:  paged.pages,
        });
      }
  
      if (all.success) {
        const newStats = {
          total:     all.data.length,
          awarded:   all.data.filter(o => o.status === "awarded").length,
          bidding:   all.data.filter(o => o.status === "bidding").length,
          cancelled: all.data.filter(o => o.status === "cancelled").length,
          ready:     all.data.filter(o => o.status === "ready").length,
        };
        const supMap = {};
        all.data.forEach(o => {
          if (!o.winner) return;
          const key = o.winner.name;
          if (!supMap[key]) supMap[key] = { name: o.winner.name, wins: 0 };
          supMap[key].wins++;
        });
        const newTop = Object.values(supMap).sort((a, b) => b.wins - a.wins).slice(0, 4);
  
        setStats(newStats);
        setTopSuppliers(newTop);
        cacheSet("biddingStats", { stats: newStats, topSuppliers: newTop });
      }
    }).finally(() => {
      if (!ctrl.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    });
  };
  useEffect(() => {
    // Har baar status/date/page change pe stats cache bhi invalidate karo
    localStorage.removeItem("biddingStats");
    load();
    return () => abortRef.current?.abort();
  }, [status, date, page]);
  useEffect(() => { setPage(1); }, [status, date]);

  const maxWins = Math.max(...topSuppliers.map(s => s.wins), 1);

  const filteredOrders = orders.filter(o =>
    !search ||
    o.item?.toLowerCase().includes(search.toLowerCase()) ||
    o.winner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { label: `All (${stats.total})`,         key: "all"       },
    { label: `Finalized (${stats.awarded})`, key: "awarded"   },
    { label: `Completed (${stats.ready})`,   key: "ready"     },
  ];

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-4">
        <StatCard value={stats.total}     label="Total Bids"      active={status === "all"}       onClick={() => setStatus("all")}       />
        <StatCard value={stats.awarded}   label="Awarded"         active={status === "awarded"}   onClick={() => setStatus("awarded")}   />
        <StatCard value={stats.bidding}   label="Live Bidding"    active={status === "bidding"}   onClick={() => setStatus("bidding")}   />
        <StatCard value={stats.cancelled} label="Cancelled"       active={status === "cancelled"} onClick={() => setStatus("cancelled")} />
        <StatCard value={stats.ready}     label="Ready"           active={status === "ready"}     onClick={() => setStatus("ready")}     />
      </div>

      {/* Top Winning Suppliers */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[14px] font-bold text-brand-dark m-0">Top Winning Suppliers</p>
            <p className="text-[11px] text-brand-muted mt-[2px] m-0">By number of auctions won</p>
          </div>
          <button onClick={() => navigate("/bidding/suppliers")}
            className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer">
            View all
          </button>
        </div>
        {topSuppliers.length === 0 ? (
          <p className="text-[12px] text-brand-muted">No data yet</p>
        ) : topSuppliers.map((s, i) => (
          <div key={s.name} className="flex items-center gap-3 mb-3 last:mb-0">
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {initials(s.name)}
            </div>
            <p className="text-[12px] font-semibold text-brand-dark m-0 w-[130px] shrink-0 truncate">{s.name}</p>
            <div className="flex-1 h-2 bg-brand-lighter rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(s.wins / maxWins * 100)}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
            </div>
            <p className="text-[12px] font-bold m-0 w-[60px] text-right" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>{s.wins} wins</p>
          </div>
        ))}
      </div>

      {/* All Bidding Results */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <p className="text-[14px] font-bold text-brand-dark m-0">All Bidding Results</p>
            <p className="text-[11px] text-brand-muted mt-[2px] flex items-center gap-2 m-0">
              {total} orders
              {refreshing && <span className="text-brand-primary font-semibold">● syncing…</span>}
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-[7px] border border-brand-border rounded-[8px] text-[11px] outline-none bg-white focus:border-brand-primary transition-all" />
            {date && <button onClick={() => setDate("")} className="px-3 py-[7px] bg-gray-100 text-brand-gray border-none rounded-[8px] text-[11px] cursor-pointer">✕</button>}
            <button onClick={() => load(true)} disabled={refreshing}
              className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer disabled:opacity-60">
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 pb-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bids..."
            className="w-full px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all" />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-brand-border px-4 md:px-6 gap-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setStatus(t.key)}
              className={`px-3 py-[10px] border-none whitespace-nowrap text-[12px] cursor-pointer bg-transparent transition-all
                ${status === t.key ? "font-bold text-brand-primary border-b-2 border-brand-primary" : "text-brand-muted font-medium"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
          {filteredOrders.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[12px]">No orders found</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FFEDD5]">
                  {["Bulk ID", "Product", "Supplier", "Buyers", "Quantity", "Price Range", "Winning Price", "Status", "Action"].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const cfg = STATUS_CFG[o.status] || { label: o.status, bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
                  return (
                    <tr key={o._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                      <td className="px-4 py-[10px]">
                        <span className="font-mono text-[10px] text-brand-muted">{o._id?.toString().slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-[10px]">
                        <div className="flex items-center gap-2">
                          {o.image
                            ? <img src={o.image} alt={o.item} className="w-7 h-7 rounded-[6px] object-cover shrink-0" />
                            : <div className="w-7 h-7 rounded-[6px] bg-brand-lighter shrink-0" />
                          }
                          <span className="text-[12px] font-semibold text-brand-dark">{o.item}</span>
                        </div>
                      </td>
                      <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">
                        {o.winner ? o.winner.name : <span className="text-brand-muted">—</span>}
                      </td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">{o.buyerCount}</td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">
                        {o.totalQuantity?.toLocaleString()} <span className="text-brand-muted text-[10px]">units</span>
                      </td>
                      <td className="px-4 py-[10px] text-[11px] text-brand-gray">
                        {o.minPrice != null ? `${o.minPrice} - ${o.maxPrice}` : "—"}
                      </td>
                      <td className="px-4 py-[10px] text-[12px] font-bold text-brand-dark">
                        {o.winningPrice != null ? `QAR ${o.winningPrice}` : "—"}
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-[10px]">
                        <button onClick={() => navigate(`/bidding/${o._id}`)}
                          className="px-3 py-[4px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-brand-border flex-wrap gap-3">
          <span className="text-[11px] text-brand-muted">
            Showing {(page-1)*10+1}–{Math.min(page*10, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="w-7 h-7 rounded-[6px] border border-brand-border bg-white text-brand-gray text-[12px] cursor-pointer disabled:opacity-40">‹</button>
            {Array.from({ length: Math.min(pages,3) }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-[6px] border text-[12px] cursor-pointer
                  ${page===p ? "bg-brand-primary text-white border-brand-primary" : "border-brand-border bg-white text-brand-gray"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
              className="w-7 h-7 rounded-[6px] border border-brand-border bg-white text-brand-gray text-[12px] cursor-pointer disabled:opacity-40">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}