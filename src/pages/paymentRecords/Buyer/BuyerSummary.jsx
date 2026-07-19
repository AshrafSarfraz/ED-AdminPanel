// // 📁 pages/payments/AdminBuyerSummary.jsx
// // Route: /payments/buyers
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const BASE     = "https://el-distibutor-backend.onrender.com";
// const token    = () => localStorage.getItem("adminToken");
// const apiFetch = (path) =>
//   fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

// const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";

// const getDaysInfo = (dueDate) => {
//   if (!dueDate) return null;
//   const diff = Math.ceil((new Date(dueDate) - Date.now()) / (1000 * 60 * 60 * 24));
//   if (diff < 0)   return { label: `${Math.abs(diff)}d overdue`, color: "#991b1b", bg: "#fee2e2" };
//   if (diff === 0) return { label: "Due today",                  color: "#92400e", bg: "#fef3c7" };
//   if (diff <= 7)  return { label: `${diff}d left`,              color: "#c2410c", bg: "#fff7ed" };
//   return            { label: `${diff}d left`,                   color: "#1d4ed8", bg: "#dbeafe" };
// };

// export default function BuyerSummary() {
//   const navigate = useNavigate();
//   const [buyers,  setBuyers]  = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search,  setSearch]  = useState("");
//   const [sort,    setSort]    = useState("due");
//   const [filter,  setFilter]  = useState("pending"); // pending | all

//   useEffect(() => {
//     apiFetch("/api/admin/buyer-payments")
//       .then(d => { if (d.success) setBuyers(d.data || []); })
//       .finally(() => setLoading(false));
//   }, []);

//   const list = buyers
//     .filter(b => filter === "all" ? true : b.totalDue > 0)
//     .filter(b => !search ||
//       (b.managerName || "").toLowerCase().includes(search.toLowerCase()) ||
//       (b.companyName || "").toLowerCase().includes(search.toLowerCase()))
//     .sort((a, b) => {
//       if (sort === "due")  return (b.totalDue || 0) - (a.totalDue || 0);
//       if (sort === "name") return (a.managerName || "").localeCompare(b.managerName || "");
//       return (b.unpaidCount || 0) - (a.unpaidCount || 0);
//     });

//   const totalBilled = buyers.reduce((s, b) => s + (b.totalBilled || 0), 0);
//   const totalPaid   = buyers.reduce((s, b) => s + (b.totalPaid   || 0), 0);
//   const totalDue    = buyers.reduce((s, b) => s + (b.totalDue    || 0), 0);

//   return (
//     <div style={S.page}>

//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
//         <div>
//           <h2 style={S.title}>Buyer Outstanding</h2>
//           <p style={S.sub}>{buyers.length} buyers total · {buyers.filter(b => b.totalDue > 0).length} with pending payments</p>
//         </div>
//         <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyer or company…" style={S.input} />
//       </div>

//       {/* Summary cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
//         <div style={S.statCard}>
//           <p style={S.statLabel}>Total Billed</p>
//           <p style={{ ...S.statValue, color: "#1a1a2e" }}>{fmtAmt(totalBilled)}</p>
//         </div>
//         <div style={S.statCard}>
//           <p style={S.statLabel}>Total Collected</p>
//           <p style={{ ...S.statValue, color: "#16a34a" }}>{fmtAmt(totalPaid)}</p>
//         </div>
//         <div style={S.statCard}>
//           <p style={S.statLabel}>Total Outstanding</p>
//           <p style={{ ...S.statValue, color: totalDue > 0 ? "#dc2626" : "#16a34a" }}>{fmtAmt(totalDue)}</p>
//         </div>
//       </div>

//       {/* Filter + Sort */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
//         <div style={{ display: "flex", gap: "4px" }}>
//           {[["pending","Pending Only"],["all","All Buyers"]].map(([k,l]) => (
//             <button key={k} onClick={() => setFilter(k)} style={{
//               padding: "6px 14px", border: "1px solid #e5e7eb", borderRadius: "20px",
//               fontSize: "12px", cursor: "pointer",
//               background: filter === k ? "#F15A21" : "#fff",
//               color:      filter === k ? "#fff"    : "#555",
//               fontWeight: filter === k ? "700"     : "400",
//             }}>{l}</button>
//           ))}
//         </div>
//         <div style={{ display: "flex", gap: "4px" }}>
//           {[["due","Highest Due"],["unpaid","Most Unpaid"],["name","By Name"]].map(([k,l]) => (
//             <button key={k} onClick={() => setSort(k)} style={{
//               padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: "20px",
//               fontSize: "11px", cursor: "pointer",
//               background: sort === k ? "#f0f0f0" : "#fff",
//               color: "#555", fontWeight: sort === k ? "700" : "400",
//             }}>{l}</button>
//           ))}
//         </div>
//       </div>

//       {/* Cards grid */}
//       {loading ? <Spinner /> : list.length === 0 ? (
//         <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
//           {filter === "pending" ? "All buyers are up to date ✅" : "No buyers found"}
//         </div>
//       ) : (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
//           {list.map(b => {
//             const daysInfo  = getDaysInfo(b.earliestDueDate);
//             const isOverdue = (b.totalDue || 0) > 0 && daysInfo?.color === "#991b1b";
//             const paidPct   = b.totalBilled > 0 ? Math.min(100, Math.round(b.totalPaid / b.totalBilled * 100)) : 0;

//             return (
//               <div key={b.branchId}
//                 onClick={() => navigate(`/payments/buyers/${b.branchId}`)}
//                 style={{
//                   background: "#fff",
//                   border: `1px solid ${isOverdue ? "#fecaca" : "#e5e7eb"}`,
//                   borderRadius: "14px", padding: "18px", cursor: "pointer",
//                   boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
//                 }}
//                 onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
//                 onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}
//               >
//                 {/* Top */}
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
//                   <div>
//                     <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "14px", color: "#1a1a2e" }}>
//                       {b.managerName || "—"}
//                     </p>
//                     <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{b.companyName || "—"}</p>
//                   </div>
//                   {daysInfo && b.totalDue > 0 && (
//                     <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", background: daysInfo.bg, color: daysInfo.color, whiteSpace: "nowrap" }}>
//                       {daysInfo.label}
//                     </span>
//                   )}
//                 </div>

//                 {/* Progress bar */}
//                 <div style={{ marginBottom: "12px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                     <span style={{ fontSize: "10px", color: "#aaa" }}>Paid {paidPct}%</span>
//                     <span style={{ fontSize: "10px", color: "#aaa" }}>{b.invoiceCount} invoices</span>
//                   </div>
//                   <div style={{ height: "5px", background: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
//                     <div style={{ height: "5px", borderRadius: "4px", background: paidPct === 100 ? "#16a34a" : "#F15A21", width: `${paidPct}%` }} />
//                   </div>
//                 </div>

//                 {/* Stats */}
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
//                   <div>
//                     <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#aaa" }}>Outstanding</p>
//                     <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: b.totalDue > 0 ? "#1a1a2e" : "#16a34a" }}>
//                       {b.totalDue > 0 ? fmtAmt(b.totalDue) : "All Paid ✓"}
//                     </p>
//                   </div>
//                   <div style={{ textAlign: "right" }}>
//                     <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>Total billed</p>
//                     <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: "#555" }}>{fmtAmt(b.totalBilled)}</p>
//                     {b.unpaidCount > 0 && (
//                       <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#F15A21", fontWeight: "600" }}>
//                         {b.unpaidCount} unpaid →
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );
// }

// function Spinner() {
//   return <div style={{ textAlign: "center", padding: "60px" }}>
//     <div style={{ width: "28px", height: "28px", border: "3px solid #f0f0f0", borderTop: "3px solid #F15A21", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
//   </div>;
// }

// const S = {
//   page:      { maxWidth: "1500px", margin: "0 auto" },
//   title:     { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "4px 0" },
//   sub:       { fontSize: "13px", color: "#888", margin: 0 },
//   input:     { padding: "9px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", width: "240px" },
//   statCard:  { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px 20px" },
//   statLabel: { margin: "0 0 6px", fontSize: "12px", color: "#888" },
//   statValue: { margin: 0, fontSize: "22px", fontWeight: "700" },
// };


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import StatCard from "../../../components/StatCard";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";

const getDaysInfo = (dueDate) => {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate) - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0)   return { label: `${Math.abs(diff)}d overdue`, bg: "bg-red-50",    text: "text-red-700",    urgent: true  };
  if (diff === 0) return { label: "Due today",                  bg: "bg-amber-50",  text: "text-amber-700",  urgent: true  };
  if (diff <= 7)  return { label: `${diff}d left`,              bg: "bg-orange-50", text: "text-orange-700", urgent: true  };
  return            { label: `${diff}d left`,                   bg: "bg-blue-50",   text: "text-blue-700",   urgent: false };
};

export default function BuyerSummary() {
  const navigate = useNavigate();
  const [buyers,  setBuyers]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [sort,    setSort]    = useState("due");
  const [filter,  setFilter]  = useState("pending");

  useEffect(() => {
    apiFetch("/api/admin/buyer-payments")
      .then(d => { if (d.success) setBuyers(d.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const list = buyers
    .filter(b => filter === "all" ? true : b.totalDue > 0)
    .filter(b => !search ||
      (b.managerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.companyName || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "due")  return (b.totalDue || 0) - (a.totalDue || 0);
      if (sort === "name") return (a.managerName || "").localeCompare(b.managerName || "");
      return (b.unpaidCount || 0) - (a.unpaidCount || 0);
    });

  const totalBilled = buyers.reduce((s, b) => s + (b.totalBilled || 0), 0);
  const totalPaid   = buyers.reduce((s, b) => s + (b.totalPaid   || 0), 0);
  const totalDue    = buyers.reduce((s, b) => s + (b.totalDue    || 0), 0);

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Buyer Outstanding</h1>
          <p className="text-[11px] text-brand-muted mt-[2px]">{buyers.length} buyers total · {buyers.filter(b => b.totalDue > 0).length} with pending payments</p>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search buyer or company…"
          className="px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all w-[220px]"
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
        <StatCard value={fmtAmt(totalBilled)} label="Total Billed"      icon="file"    />
        <StatCard value={fmtAmt(totalPaid)}   label="Total Collected"   icon="coins"   />
        <StatCard value={fmtAmt(totalDue)}    label="Total Outstanding" icon="xcircle" />
      </div>

      {/* Filter + Sort */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2">
          {[["pending","Pending Only"], ["all","All Buyers"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-4 py-[7px] rounded-[20px] text-[12px] font-semibold cursor-pointer border transition-all
                ${filter === k ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-gray border-brand-border"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[["due","Highest Due"], ["unpaid","Most Unpaid"], ["name","By Name"]].map(([k, l]) => (
            <button key={k} onClick={() => setSort(k)}
              className={`px-3 py-[6px] rounded-[20px] text-[11px] font-semibold cursor-pointer border transition-all
                ${sort === k ? "bg-brand-lighter text-brand-dark border-brand-border" : "bg-white text-brand-muted border-brand-border"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {list.length === 0 ? (
        <div className="text-center py-16 text-brand-muted text-[13px]">
          {filter === "pending" ? "All buyers are up to date ✅" : "No buyers found"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map(b => {
            const daysInfo  = getDaysInfo(b.earliestDueDate);
            const isOverdue = (b.totalDue || 0) > 0 && daysInfo?.bg === "bg-red-50";
            const paidPct   = b.totalBilled > 0 ? Math.min(100, Math.round(b.totalPaid / b.totalBilled * 100)) : 0;

            return (
              <div key={b.branchId} onClick={() => navigate(`/payments/buyers/${b.branchId}`)}
                className={`bg-white border rounded-[16px] p-4 cursor-pointer transition-all  hover:border-brand-primary
                  ${isOverdue ? "border-red-200" : "border-brand-border"}`}>

                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[13px] font-bold text-brand-dark m-0 mb-[2px]">{b.managerName || "—"}</p>
                    <p className="text-[11px] text-brand-muted m-0">{b.companyName || "—"}</p>
                  </div>
                  {daysInfo && b.totalDue > 0 && (
                    <span className={`text-[10px] font-semibold px-2 py-[3px] rounded-[20px] shrink-0 ml-2 ${daysInfo.bg} ${daysInfo.text}`}>
                      {daysInfo.label}
                    </span>
                  )}
                </div>

                {/* Profile link */}
                <button onClick={e => { e.stopPropagation(); navigate(`/buyers/${b.branchId}/profile`); }}
                  className="text-[10px] text-brand-primary font-semibold bg-transparent border-none cursor-pointer p-0 mb-3">
                  View Full Profile →
                </button>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-brand-muted">Paid {paidPct}%</span>
                    <span className="text-[10px] text-brand-muted">{b.invoiceCount} invoices</span>
                  </div>
                  <div className="h-[5px] bg-brand-lighter rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${paidPct}%`, background: paidPct === 100 ? "#16a34a" : "#F15A21" }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Outstanding</p>
                    <p className={`text-[17px] font-extrabold m-0 ${b.totalDue > 0 ? "text-brand-dark" : "text-green-700"}`}>
                      {b.totalDue > 0 ? fmtAmt(b.totalDue) : "All Paid ✓"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-brand-muted m-0">Total billed</p>
                    <p className="text-[12px] font-semibold text-brand-gray m-0">{fmtAmt(b.totalBilled)}</p>
                    {b.unpaidCount > 0 && (
                      <p className="text-[11px] text-brand-primary font-semibold m-0 mt-[2px]">{b.unpaidCount} unpaid →</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}