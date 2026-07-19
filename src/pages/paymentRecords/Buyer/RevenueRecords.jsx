// // 📁 pages/payments/AdminRevenueRecords.jsx
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const BASE     = "https://el-distibutor-backend.onrender.com";
// const token    = () => localStorage.getItem("adminToken");
// const apiFetch = (path) =>
//   fetch(`${BASE}${path}`, {
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
//   }).then(r => r.json());

// const fmtAmt      = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
// const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// const LIMIT = 20;

// export default function RevenueRecords() {
//   const navigate = useNavigate();

//   const [receipts,   setReceipts]   = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [search,     setSearch]     = useState("");
//   const [expanded,   setExpanded]   = useState(null);
//   const [page,       setPage]       = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total,      setTotal]      = useState(0);
//   const [grandTotal, setGrandTotal] = useState(0);

//   // Grand total from all approved
//   useEffect(() => {
//     apiFetch("/api/payments/admin/receipts?status=approved&limit=10000").then(d => {
//       if (d.success) setGrandTotal((d.data || []).reduce((s, r) => s + (r.totalAmount || 0), 0));
//     });
//   }, []);

//   useEffect(() => {
//     setLoading(true);
//     apiFetch(`/api/payments/admin/receipts?status=approved&page=${page}&limit=${LIMIT}`)
//       .then(d => {
//         if (d.success) {
//           const sorted = (d.data || []).sort((a, b) =>
//             new Date(b.approvedAt || b.createdAt) - new Date(a.approvedAt || a.createdAt)
//           );
//           setReceipts(sorted);
//           setTotalPages(d.pages || 1);
//           setTotal(d.total || 0);
//         }
//       })
//       .finally(() => setLoading(false));
//   }, [page]);

//   const filtered = receipts.filter(r => {
//     if (!search) return true;
//     const q = search.toLowerCase();
//     return (
//       (r.buyerBranchId?.managerName || "").toLowerCase().includes(q) ||
//       (r.buyerBranchId?.companyName || "").toLowerCase().includes(q) ||
//       (r.buyerBranchId?.email       || "").toLowerCase().includes(q)
//     );
//   });

//   return (
//     <div style={S.page}>
//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
//         <div>
//           <h2 style={S.title}>Revenue Records</h2>
//           <p style={S.sub}>Approved buyer payments · {total} records · latest first</p>
//         </div>
//         <input
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           placeholder="Search buyer or company…"
//           style={S.input}
//         />
//       </div>

//       {/* Summary strip */}
//       <div style={S.strip}>
//         <div>
//           <p style={S.stripLabel}>Total Revenue Collected</p>
//           <p style={S.stripValue}>{fmtAmt(grandTotal)}</p>
//         </div>
//         <div style={{ textAlign: "right" }}>
//           <p style={S.stripLabel}>{total} approved receipts</p>
//           <p style={{ margin: 0, fontSize: "12px", color: "#fff" }}>All time</p>
//         </div>
//       </div>

//       {/* Records */}
//       {loading ? (
//         <div style={{ textAlign: "center", padding: "80px" }}>
//           <Spinner />
//           <p style={{ color: "#aaa", marginTop: "12px", fontSize: "13px" }}>Loading…</p>
//         </div>
//       ) : filtered.length === 0 ? (
//         <div style={{ ...S.card, textAlign: "center", padding: "60px 20px" }}>
//           <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>No revenue records found</p>
//         </div>
//       ) : (
//         <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//           {filtered.map((r, idx) => {
//             const isExp       = expanded === r._id;
//             const invoiceList = r.invoiceIds || [];
//             const num         = ((page - 1) * LIMIT) + idx + 1;
//             const isFirst     = num === 1;

//             return (
//               <div key={r._id} style={{
//                 ...S.card,
//                 padding: 0,
//                 border: `1px solid ${isExp ? "#1a1a2e" : "#e5e7eb"}`,
//                 overflow: "hidden",
//               }}>

//                 {/* Main row */}
//                 <div
//                   onClick={() => setExpanded(isExp ? null : r._id)}
//                   style={{
//                     padding: "16px 20px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "16px",
//                     cursor: "pointer",
//                     background: isExp ? "#f8f9fa" : "#fff",
//                   }}
//                   onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = "#fafafa"; }}
//                   onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = isExp ? "#f8f9fa" : "#fff"; }}
//                 >
//                   {/* Number */}
//                   <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isFirst ? "#1a1a2e" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                     <span style={{ fontSize: isFirst ? "9px" : "12px", fontWeight: "700", color: isFirst ? "#fff" : "#888" }}>
//                       {isFirst ? "NEW" : num}
//                     </span>
//                   </div>

//                   {/* Buyer */}
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
//                       <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#1a1a2e" }}>
//                         {r.buyerBranchId?.managerName || "—"}
//                       </p>
//                       <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
//                         {r.buyerBranchId?.companyName || r.buyerCompanyId?.brandName || "—"}
//                       </p>
//                     </div>
//                     <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>
//                       {r.buyerBranchId?.email} · {invoiceList.length} invoice{invoiceList.length !== 1 ? "s" : ""}
//                     </p>
//                   </div>

//                   {/* Approved date */}
//                   <div style={{ textAlign: "right", flexShrink: 0 }}>
//                     <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#aaa" }}>Approved</p>
//                     <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>{fmtDate(r.approvedAt || r.createdAt)}</p>
//                   </div>

//                   {/* Supplier status */}
//                   <div style={{ flexShrink: 0 }}>
//                     <span style={{
//                       fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px",
//                       background: (r.suppliersReleased || 0) > 0 ? "#f0fdf4" : "#fef3c7",
//                       color:      (r.suppliersReleased || 0) > 0 ? "#16a34a" : "#d97706",
//                     }}>
//                       {(r.suppliersReleased || 0) > 0 ? `${r.suppliersReleased} supplier paid` : "Supplier pending"}
//                     </span>
//                   </div>

//                   {/* Amount */}
//                   <div style={{ textAlign: "right", flexShrink: 0, minWidth: "130px" }}>
//                     <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#aaa" }}>Received</p>
//                     <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1a2e" }}>
//                       {fmtAmt(r.totalAmount)}
//                     </p>
//                   </div>

//                   {/* Arrow */}
//                   <span style={{ color: "#aaa", fontSize: "14px", flexShrink: 0, transform: isExp ? "rotate(180deg)" : "none" }}>▾</span>
//                 </div>

//                 {/* Expanded section */}
//                 {isExp && (
//                   <div style={{ borderTop: "1px solid #f0f0f0" }}>

//                     {/* Admin note */}
//                     {r.adminNote && (
//                       <div style={{ padding: "10px 20px", background: "#f8f9fa", borderBottom: "1px solid #f0f0f0", fontSize: "12px", color: "#555" }}>
//                         <span style={{ fontWeight: "600", color: "#1a1a2e" }}>Note: </span>{r.adminNote}
//                       </div>
//                     )}

//                     {/* Receipt image */}
//                     {r.receiptImage && (
//                       <div style={{ padding: "12px 20px", background: "#f8f9fa", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "12px" }}>
//                         <img
//                           src={r.receiptImage}
//                           alt="receipt"
//                           onClick={() => window.open(r.receiptImage, "_blank")}
//                           style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px", cursor: "zoom-in", border: "1px solid #e5e7eb" }}
//                         />
//                         <div>
//                           <p style={{ margin: "0 0 2px", fontSize: "12px", fontWeight: "500", color: "#1a1a2e" }}>Payment Receipt</p>
//                           <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>Click to open full size</p>
//                         </div>
//                       </div>
//                     )}

//                     {/* Invoice table */}
//                     {invoiceList.length > 0 ? (
//                       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                         <thead>
//                           <tr style={{ background: "#f8f9fa" }}>
//                             {["Invoice No.", "Status", "Amount"].map(h => (
//                               <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#888" }}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {invoiceList.map((inv, i) => (
//                             <tr key={inv._id || i} style={{ borderTop: "1px solid #f0f0f0" }}>
//                               <td style={{ padding: "10px 20px", fontSize: "13px", color: "#1a1a2e", fontWeight: "500" }}>
//                                 {inv.invoiceNumber || `Invoice ${i + 1}`}
//                               </td>
//                               <td style={{ padding: "10px 20px" }}>
//                                 <span style={{
//                                   padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600",
//                                   background: inv.paymentStatus === "paid" ? "#f0fdf4" : "#f8f9fa",
//                                   color:      inv.paymentStatus === "paid" ? "#16a34a" : "#888",
//                                 }}>
//                                   {inv.paymentStatus || "—"}
//                                 </span>
//                               </td>
//                               <td style={{ padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>
//                                 {fmtAmt(inv.grandTotal || inv.amountDue || inv.amountPaid)}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     ) : (
//                       <p style={{ padding: "14px 20px", fontSize: "13px", color: "#aaa", margin: 0 }}>No invoice details</p>
//                     )}

//                     {/* Footer */}
//                     <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                       <button
//                         onClick={() => navigate(`/payments/receipts/${r._id}`)}
//                         style={S.btn}>
//                         View Full Receipt →
//                       </button>
//                       <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1a1a2e" }}>
//                         Total: {fmtAmt(r.totalAmount)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && !loading && (
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
//           <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
//             {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, total)} of {total}
//           </p>
//           <div style={{ display: "flex", gap: "4px" }}>
//             <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ ...S.pageBtn, opacity: page===1 ? 0.4 : 1 }}>‹</button>
//             {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
//               <button key={p} onClick={() => setPage(p)} style={{ ...S.pageBtn, background: page===p ? "#1a1a2e" : "#fff", color: page===p ? "#fff" : "#444" }}>{p}</button>
//             ))}
//             <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} style={{ ...S.pageBtn, opacity: page===totalPages ? 0.4 : 1 }}>›</button>
//           </div>
//         </div>
//       )}

//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );
// }

// function Spinner() {
//   return <div style={{ width: "30px", height: "30px", border: "3px solid #f0f0f0", borderTop: "3px solid #1a1a2e", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />;
// }

// const S = {
//   page:       { maxWidth: "1500px", padding: "20px", margin: "0 auto" },
//   title:      { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "4px 0" },
//   sub:        { fontSize: "13px", color: "#888", margin: 0 },
//   backBtn:    { background: "none", border: "none", color: "#888", fontSize: "12px", cursor: "pointer", padding: "0 0 12px", display: "block" },
//   input:      { padding: "9px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", width: "240px" },
//   strip:      { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F15A21", border: "1px solid #F15A21", borderRadius: "12px", padding: "18px 24px", marginBottom: "16px" },
//   stripLabel: { margin: "0 0 4px", fontSize: "12px", color: "#fff" },
//   stripValue: { margin: 0, fontSize: "26px", fontWeight: "700", color: "#fff" },
//   card:       { background: "#fff", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
//   btn:        { padding: "7px 16px", background: "#F15A21", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
//   pageBtn:    { width: "32px", height: "32px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", cursor: "pointer", color: "#444" },
// };



import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const LIMIT   = 20;

export default function RevenueRecords() {
  const navigate = useNavigate();
  const [receipts,   setReceipts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [expanded,   setExpanded]   = useState(null);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    apiFetch("/api/payments/admin/receipts?status=approved&limit=10000").then(d => {
      if (d.success) setGrandTotal((d.data || []).reduce((s, r) => s + (r.totalAmount || 0), 0));
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/payments/admin/receipts?status=approved&page=${page}&limit=${LIMIT}`)
      .then(d => {
        if (d.success) {
          const sorted = (d.data || []).sort((a, b) => new Date(b.approvedAt || b.createdAt) - new Date(a.approvedAt || a.createdAt));
          setReceipts(sorted); setTotalPages(d.pages || 1); setTotal(d.total || 0);
        }
      }).finally(() => setLoading(false));
  }, [page]);

  const filtered = receipts.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.buyerBranchId?.managerName || "").toLowerCase().includes(q) ||
           (r.buyerBranchId?.companyName || "").toLowerCase().includes(q) ||
           (r.buyerBranchId?.email       || "").toLowerCase().includes(q);
  });

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Revenue Records</h1>
          <p className="text-[11px] text-brand-muted mt-[2px]">Approved buyer payments · {total} records · latest first</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyer or company…"
          className="px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all w-[220px]" />
      </div>

      {/* Revenue Banner */}
      <div className="bg-brand-primary rounded-[16px] px-5 py-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white/70 m-0 mb-1">Total Revenue Collected</p>
          <p className="text-[22px] font-extrabold text-white m-0">{fmtAmt(grandTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/70 m-0 mb-1">{total} approved receipts</p>
          <p className="text-[11px] text-white/70 m-0">All time</p>
        </div>
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-[16px] p-10 text-center">
          <p className="text-brand-muted text-[13px] m-0">No revenue records found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((r, idx) => {
            const isExp       = expanded === r._id;
            const invoiceList = r.invoiceIds || [];
            const num         = ((page - 1) * LIMIT) + idx + 1;
            const isFirst     = num === 1;

            return (
              <div key={r._id} className={`bg-white border rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all
                ${isExp ? "border-brand-primary" : "border-brand-border"}`}>

                {/* Main Row */}
                <div onClick={() => setExpanded(isExp ? null : r._id)}
                  className={`flex items-center gap-3 px-4 py-[14px] cursor-pointer transition-colors flex-wrap
                    ${isExp ? "bg-brand-lighter" : "bg-white hover:bg-brand-lighter"}`}>

                  {/* Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${isFirst ? "bg-brand-primary" : "bg-brand-lighter"}`}>
                    <span className={`text-[10px] font-bold ${isFirst ? "text-white" : "text-brand-gray"}`}>
                      {isFirst ? "NEW" : num}
                    </span>
                  </div>

                  {/* Buyer */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-[2px] flex-wrap">
                      <p className="text-[13px] font-semibold text-brand-dark m-0">{r.buyerBranchId?.managerName || "—"}</p>
                      <p className="text-[11px] text-brand-muted m-0">{r.buyerBranchId?.companyName || r.buyerCompanyId?.brandName || "—"}</p>
                    </div>
                    <p className="text-[10px] text-brand-muted m-0">
                      {r.buyerBranchId?.email} · {invoiceList.length} invoice{invoiceList.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Approved */}
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Approved</p>
                    <p className="text-[11px] text-brand-gray m-0">{fmtDate(r.approvedAt || r.createdAt)}</p>
                  </div>

                  {/* Supplier status */}
                  <div className="shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-[3px] rounded-[20px]
                      ${(r.suppliersReleased || 0) > 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {(r.suppliersReleased || 0) > 0 ? `${r.suppliersReleased} supplier paid` : "Supplier pending"}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0 min-w-[110px]">
                    <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Received</p>
                    <p className="text-[15px] font-extrabold text-brand-dark m-0">{fmtAmt(r.totalAmount)}</p>
                  </div>

                  <span className={`text-brand-muted text-[12px] shrink-0 transition-transform ${isExp ? "rotate-180" : ""}`}>▾</span>
                </div>

                {/* Expanded */}
                {isExp && (
                  <div className="border-t border-brand-border">
                    {r.adminNote && (
                      <div className="px-4 py-3 bg-brand-lighter border-b border-brand-border text-[11px] text-brand-gray">
                        <span className="font-semibold text-brand-dark">Note: </span>{r.adminNote}
                      </div>
                    )}
                    {r.receiptImage && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-brand-lighter border-b border-brand-border">
                        <img src={r.receiptImage} alt="receipt" onClick={() => window.open(r.receiptImage, "_blank")}
                          className="w-12 h-12 object-cover rounded-[8px] cursor-zoom-in border border-brand-border shrink-0" />
                        <div>
                          <p className="text-[12px] font-semibold text-brand-dark m-0 mb-[2px]">Payment Receipt</p>
                          <p className="text-[10px] text-brand-muted m-0">Click to open full size</p>
                        </div>
                      </div>
                    )}

                    {invoiceList.length > 0 ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#FFEDD5]">
                            {["Invoice No.", "Status", "Amount"].map(h => (
                              <th key={h} className="px-4 py-[9px] text-left text-[11px] text-[#7c3a1e] font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceList.map((inv, i) => (
                            <tr key={inv._id || i} className="border-b border-[#fdf0ea]">
                              <td className="px-4 py-[9px] text-[12px] font-semibold text-brand-dark">{inv.invoiceNumber || `Invoice ${i + 1}`}</td>
                              <td className="px-4 py-[9px]">
                                <span className={`px-2 py-[2px] rounded-[10px] text-[10px] font-semibold
                                  ${inv.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-brand-lighter text-brand-gray"}`}>
                                  {inv.paymentStatus || "—"}
                                </span>
                              </td>
                              <td className="px-4 py-[9px] text-[12px] font-semibold text-brand-dark">
                                {fmtAmt(inv.grandTotal || inv.amountDue || inv.amountPaid)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="px-4 py-3 text-[12px] text-brand-muted m-0">No invoice details</p>
                    )}

                    <div className="flex items-center justify-between px-4 py-3 border-t border-brand-border">
                      <button onClick={() => navigate(`/payments/receipts/${r._id}`)}
                        className="px-4 py-[7px] bg-brand-primary text-white border-none rounded-[8px] text-[12px] font-semibold cursor-pointer">
                        View Full Receipt →
                      </button>
                      <p className="text-[13px] font-extrabold text-brand-dark m-0">Total: {fmtAmt(r.totalAmount)}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <span className="text-[11px] text-brand-muted">
            {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="w-7 h-7 rounded-[6px] border border-brand-border bg-white text-brand-gray text-[12px] cursor-pointer disabled:opacity-40">‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-[6px] border text-[12px] cursor-pointer
                  ${page===p ? "bg-brand-primary text-white border-brand-primary" : "border-brand-border bg-white text-brand-gray"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="w-7 h-7 rounded-[6px] border border-brand-border bg-white text-brand-gray text-[12px] cursor-pointer disabled:opacity-40">›</button>
          </div>
        </div>
      )}
    </div>
  );
}