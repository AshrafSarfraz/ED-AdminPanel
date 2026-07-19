// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Loader from "../../../components/Loader";
// import StatCard from "../../../components/StatCard";

// const BASE     = "https://el-distibutor-backend.onrender.com";
// const token    = () => localStorage.getItem("adminToken");
// const apiFetch = (path, opts = {}) =>
//   fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, ...opts }).then(r => r.json());

// const cacheSet = (k, d) => localStorage.setItem(k, JSON.stringify({ ts: Date.now(), data: d }));
// const cacheGet = (k) => { try { const r = JSON.parse(localStorage.getItem(k)); return r ? { data: r.data, stale: Date.now() - r.ts > 3 * 60 * 1000 } : null; } catch { return null; } };
// const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
// const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// export default function SupplierOutstanding() {
//   const navigate = useNavigate();
//   const [view,         setView]         = useState("days");
//   const [days,         setDays]         = useState([]);
//   const [overall,      setOverall]      = useState({});
//   const [loading,      setLoading]      = useState(true);
//   const [refreshing,   setRefreshing]   = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [dayData,      setDayData]      = useState(null);
//   const [dayLoading,   setDayLoading]   = useState(false);
//   const [payModal,     setPayModal]     = useState(null);
//   const [payNote,      setPayNote]      = useState("");
//   const [payRef,       setPayRef]       = useState("");
//   const [paying,       setPaying]       = useState(false);
//   const [suppliers,    setSuppliers]    = useState([]);
//   const [supLoading,   setSupLoading]   = useState(false);

//   const loadDays = (bg = false) => {
//     const key    = "supplierPaymentDays";
//     const cached = cacheGet(key);
//     if (!bg && cached) { setDays(cached.data.days); setOverall(cached.data.overall || {}); setLoading(false); if (!cached.stale) return; setRefreshing(true); }
//     else if (!bg) { if (!cached) setLoading(true); else setRefreshing(true); }
//     else setRefreshing(true);
//     apiFetch("/api/admin/supplier-payments/days")
//       .then(d => { if (!d.success) return; setDays(d.data); setOverall(d.overall || {}); cacheSet(key, { days: d.data, overall: d.overall }); })
//       .finally(() => { setLoading(false); setRefreshing(false); });
//   };

//   const loadDayDetail = async (date) => {
//     setSelectedDate(date); setView("detail"); setDayLoading(true);
//     const key    = `supplierPayDay_${date}`;
//     const cached = cacheGet(key);
//     if (cached) { setDayData(cached.data); setDayLoading(false); if (!cached.stale) return; }
//     const d = await apiFetch(`/api/admin/supplier-payments/days/${date}/bulk-orders`);
//     if (d.success) { setDayData(d); cacheSet(key, d); }
//     setDayLoading(false);
//   };

//   const loadSuppliers = async () => {
//     setView("suppliers"); setSupLoading(true);
//     const d = await apiFetch("/api/admin/supplier-payments/suppliers");
//     if (d.success) setSuppliers(d.data);
//     setSupLoading(false);
//   };

//   useEffect(() => { loadDays(); }, []);

//   const handlePay = async () => {
//     if (!payModal) return;
//     setPaying(true);
//     const body = { note: payNote || null, transactionRef: payRef || null };
//     if (payModal.bulkOrderId) body.bulkOrderId = payModal.bulkOrderId;
//     else                      body.date        = payModal.date;
//     const d = await apiFetch("/api/admin/supplier-payments/pay", { method: "POST", body: JSON.stringify(body) });
//     setPaying(false);
//     if (d.success) {
//       setPayModal(null); setPayNote(""); setPayRef("");
//       Object.keys(localStorage).filter(k => k.startsWith("supplierPay")).forEach(k => localStorage.removeItem(k));
//       if (view === "detail" && selectedDate) loadDayDetail(selectedDate);
//       else loadDays(true);
//     } else alert(d.message || "Payment failed");
//   };

//   // ─── Days List ───────────────────────────────────────
//   const DaysList = () => (
//     <div>
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
//         <StatCard value={fmtAmt(overall.totalAmount)}   label="Total Earned"   />
//         <StatCard value={fmtAmt(overall.totalPending)}  label="Total Pending"  />
//         <StatCard value={fmtAmt(overall.totalReleased)} label="Total Released" />
//         <StatCard value={overall.overdueDays ?? 0}       label="Overdue Days"   />
//       </div>

//       <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
//         <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
//           <div>
//             <p className="text-[14px] font-bold text-brand-dark m-0">Daily Payment Records</p>
//             <p className="text-[11px] text-brand-muted mt-[2px] flex items-center gap-2 m-0">
//               {days.length} days · Click a row to see bulk orders
//               {refreshing && <span className="text-brand-primary font-semibold">● syncing…</span>}
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <button onClick={loadSuppliers} className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer">
//               Supplier Records
//             </button>
//             <button onClick={() => loadDays(true)} disabled={refreshing} className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer disabled:opacity-60">
//               ↻ Refresh
//             </button>
//           </div>
//         </div>

//         {loading ? <div className="flex justify-center py-10"><Loader /></div> : days.length === 0 ? (
//           <p className="text-center py-10 text-brand-muted text-[12px]">No supplier payment records yet</p>
//         ) : (
//           <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "580px" }}>
//             <table className="w-full border-collapse">
//               <thead className="sticky top-0 z-10">
//                 <tr className="bg-[#FFEDD5]">
//                   {["Date", "Bulk Orders", "Total Earned", "Paid", "Pending", "Deadline", "Days Left", "Actions"].map(h => (
//                     <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {days.map(d => {
//                   const urgent  = d.daysLeft >= 0 && d.daysLeft <= 7 && !d.fullyPaid;
//                   const overdue = d.isOverdue && !d.fullyPaid;
//                   return (
//                     <tr key={d.date} onClick={() => loadDayDetail(d.date)}
//                       className={`border-b border-[#fdf0ea] cursor-pointer transition-colors
//                         ${overdue ? "bg-red-50 hover:bg-red-100" : urgent ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-[rgba(241,90,33,0.05)]"}`}>
//                       <td className="px-4 py-[10px]">
//                         <div className="flex items-center gap-2">
//                           <span className="text-[12px] font-semibold text-brand-dark">{d.dateLabel}</span>
//                           {overdue && <span className="text-[9px] bg-red-100 text-red-600 px-2 py-[1px] rounded-[10px] font-bold">OVERDUE</span>}
//                           {urgent && !overdue && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-[1px] rounded-[10px] font-bold">URGENT</span>}
//                         </div>
//                       </td>
//                       <td className="px-4 py-[10px] text-[12px] text-brand-dark">{d.totalBulkOrders}</td>
//                       <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{fmtAmt(d.totalAmount)}</td>
//                       <td className="px-4 py-[10px] text-[12px] text-green-700 font-semibold">{fmtAmt(d.totalReleased)}</td>
//                       <td className="px-4 py-[10px]">
//                         {d.fullyPaid
//                           ? <span className="text-[12px] text-green-700 font-semibold">✓ Paid</span>
//                           : <span className="text-[12px] font-semibold text-amber-600">{fmtAmt(d.totalPending)}</span>}
//                       </td>
//                       <td className="px-4 py-[10px] text-[11px] text-brand-gray">{fmtDate(d.deadline)}</td>
//                       <td className="px-4 py-[10px]">
//                         <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
//                           ${overdue     ? "bg-red-50 text-red-600 border-red-200"
//                           : d.fullyPaid ? "bg-green-50 text-green-700 border-green-200"
//                           : urgent      ? "bg-amber-50 text-amber-700 border-amber-200"
//                           :               "bg-gray-50 text-gray-500 border-gray-200"}`}>
//                           {d.fullyPaid ? "Paid" : overdue ? `${Math.abs(d.daysLeft)}d overdue` : `${d.daysLeft}d left`}
//                         </span>
//                       </td>
//                       <td className="px-4 py-[10px]" onClick={e => e.stopPropagation()}>
//                         {!d.fullyPaid && (
//                           <button onClick={() => setPayModal({ date: d.date, label: `All orders on ${d.dateLabel}`, amount: d.totalPending })}
//                             className="px-3 py-[4px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer whitespace-nowrap">
//                             Pay All
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//         <div className="flex items-center px-4 md:px-6 py-3 border-t border-brand-border">
//           <span className="text-[11px] text-brand-muted">Showing {days.length} days</span>
//         </div>
//       </div>
//     </div>
//   );

//   // ─── Day Detail ──────────────────────────────────────
//   const DayDetail = () => (
//     <div>
//       <button onClick={() => setView("days")}
//         className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer mb-4">
//         ← Back to Days
//       </button>

//       {dayData && (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
//           <StatCard value={dayData.dayTotal?.bulkOrderCount}        label="Bulk Orders"  />
//           <StatCard value={fmtAmt(dayData.dayTotal?.totalAmount)}   label="Total Earned" />
//           <StatCard value={fmtAmt(dayData.dayTotal?.totalPending)}  label="Pending"      />
//           <StatCard value={`${dayData.dayTotal?.daysLeft ?? "—"}d`} label="Days Left"    />
//         </div>
//       )}

//       <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
//         <div>
//           <p className="text-[14px] font-bold text-brand-dark m-0">Bulk Orders — {fmtDate(selectedDate)}</p>
//           <p className="text-[11px] text-brand-muted m-0 mt-[2px]">
//             Deadline: {fmtDate(dayData?.dayTotal?.deadline)} · {dayData?.dayTotal?.daysLeft}d left
//           </p>
//         </div>
//         {dayData?.dayTotal?.totalPending > 0 && (
//           <button onClick={() => setPayModal({ date: selectedDate, label: `All orders on ${fmtDate(selectedDate)}`, amount: dayData.dayTotal.totalPending })}
//             className="px-4 py-[7px] bg-brand-primary text-white border-none rounded-[8px] text-[12px] font-bold cursor-pointer">
//             Pay All Day ({fmtAmt(dayData?.dayTotal?.totalPending)})
//           </button>
//         )}
//       </div>

//       {dayLoading ? <div className="flex justify-center py-10"><Loader /></div>
//         : (dayData?.data || []).map(bulk => (
//         <div key={bulk.bulkOrderId} className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-4">

//           {/* Bulk header */}
//           <div className="flex items-center gap-4 px-4 md:px-5 py-4 bg-brand-lighter border-b border-brand-border flex-wrap">
//             {bulk.image
//               ? <img src={bulk.image} alt={bulk.item} className="w-10 h-10 rounded-[8px] object-cover shrink-0" />
//               : <div className="w-10 h-10 rounded-[8px] bg-brand-border shrink-0" />}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2 flex-wrap mb-1">
//                 <p className="text-[13px] font-bold text-brand-dark m-0">{bulk.item} — {bulk.country}</p>
//                 <span className="text-[10px] font-mono bg-white text-brand-gray px-2 py-[2px] rounded-[4px] border border-brand-border">{bulk.orderRef}</span>
//               </div>
//               <p className="text-[10px] text-brand-muted m-0">
//                 {bulk.totalQuantity?.toLocaleString()} {bulk.unit} · Supplier: <span className="font-semibold text-brand-dark">{bulk.supplierName}</span> ({bulk.supplierCompany})
//               </p>
//             </div>
//             <div className="text-right shrink-0">
//               <p className="text-[10px] text-brand-muted m-0 mb-1">Total to Pay</p>
//               <p className={`text-[15px] font-extrabold m-0 mb-2 ${bulk.fullyPaid ? "text-green-700" : "text-brand-primary"}`}>
//                 {bulk.fullyPaid ? "✓ Paid" : fmtAmt(bulk.totalPending)}
//               </p>
//               {!bulk.fullyPaid && (
//                 <button onClick={() => setPayModal({ bulkOrderId: bulk.bulkOrderId, label: `${bulk.item} — ${bulk.orderRef}`, amount: bulk.totalPending })}
//                   className="px-3 py-[5px] bg-brand-primary text-white border-none rounded-[7px] text-[11px] font-semibold cursor-pointer">
//                   Pay This Order
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Bank info */}
//           {bulk.supplierBank && (
//             <div className="flex items-center gap-5 flex-wrap px-4 md:px-5 py-3 bg-brand-lighter border-b border-brand-border">
//               <span className="text-[10px] text-brand-muted font-semibold">Bank Details:</span>
//               {[["Bank", bulk.supplierBank.bankName], ["Account", bulk.supplierBank.accountNumber], ["IBAN", bulk.supplierBank.iban], ["Swift", bulk.supplierBank.swiftCode]].map(([l, v]) => (
//                 <div key={l}>
//                   <span className="text-[10px] text-brand-muted">{l}: </span>
//                   <span className="text-[10px] font-semibold text-brand-dark">{v || "—"}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Buyer orders table */}
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-[#FFEDD5]">
//                   {["Invoice", "Buyer", "Qty", "Price/Unit", "Amount", "Deduction", "Net", "Order", "Payment"].map(h => (
//                     <th key={h} className="px-4 py-[9px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {bulk.buyerOrders.map((bo, i) => (
//                   <tr key={i} className={`border-b border-[#fdf0ea] transition-colors ${bo.isReturned ? "bg-red-50" : "hover:bg-[rgba(241,90,33,0.05)]"}`}>
//                     <td className="px-4 py-[10px] text-[10px] text-brand-muted font-mono">{bo.invoiceNumber}</td>
//                     <td className="px-4 py-[10px]">
//                       <p className="text-[12px] font-semibold text-brand-dark m-0">{bo.buyerName}</p>
//                       <p className="text-[10px] text-brand-muted m-0">{bo.buyerCompany}</p>
//                     </td>
//                     <td className="px-4 py-[10px] text-[12px] text-brand-dark">{bo.quantity} {bulk.unit}</td>
//                     <td className="px-4 py-[10px] text-[12px] text-brand-dark">QAR {bo.pricePerUnit}</td>
//                     <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">
//                       {bo.isReturned ? <span className="line-through text-brand-muted">Returned</span> : fmtAmt(bo.amount)}
//                     </td>
//                     <td className="px-4 py-[10px] text-[12px] font-semibold text-red-600">
//                       {bo.deduction > 0 ? `-${fmtAmt(bo.deduction)}` : "—"}
//                     </td>
//                     <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">
//                       {bo.isReturned ? "—" : fmtAmt(bo.netAmount)}
//                     </td>
//                     <td className="px-4 py-[10px]">
//                       <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
//                         ${bo.orderStatus === "returned"  ? "bg-red-50 text-red-600 border-red-200"
//                         : bo.orderStatus === "delivered" ? "bg-blue-50 text-blue-600 border-blue-200"
//                         :                                  "bg-gray-50 text-gray-500 border-gray-200"}`}>
//                         {bo.orderStatus === "returned" ? "Returned" : bo.orderStatus === "delivered" ? "Delivered" : bo.orderStatus ?? "—"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-[10px]">
//                       {bo.isReturned
//                         ? <span className="px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border bg-red-50 text-red-600 border-red-200">Cancelled</span>
//                         : <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
//                             ${bo.status === "released" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
//                             {bo.status === "released" ? "Paid" : "Pending"}
//                           </span>}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Footer */}
//           <div className="flex justify-end gap-6 px-4 md:px-5 py-3 border-t border-brand-border bg-brand-lighter flex-wrap">
//             <div className="text-right">
//               <p className="text-[10px] text-brand-muted m-0 mb-1">Collected from {bulk.buyerCount} buyers</p>
//               <p className="text-[13px] font-extrabold text-brand-dark m-0">{fmtAmt(bulk.totalAmount)}</p>
//             </div>
//             {bulk.totalDeduction > 0 && (
//               <div className="text-right">
//                 <p className="text-[10px] text-brand-muted m-0 mb-1">Return Deduction</p>
//                 <p className="text-[13px] font-extrabold text-red-600 m-0">-{fmtAmt(bulk.totalDeduction)}</p>
//               </div>
//             )}
//             <div className="text-right">
//               <p className="text-[10px] text-brand-muted m-0 mb-1">Net to Pay Supplier</p>
//               <p className={`text-[13px] font-extrabold m-0 ${bulk.fullyPaid ? "text-green-700" : "text-brand-primary"}`}>
//                 {bulk.fullyPaid ? "✓ Fully Paid" : fmtAmt(bulk.netToPaySupplier ?? bulk.totalPending)}
//               </p>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   // ─── Suppliers View ──────────────────────────────────
//   const SuppliersView = () => (
//     <div>
//       <button onClick={() => setView("days")}
//         className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer mb-4">
//         ← Back to Days
//       </button>
//       <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
//         <div className="px-4 md:px-6 pt-4 pb-3">
//           <p className="text-[14px] font-bold text-brand-dark m-0">Supplier Payment Records</p>
//         </div>
//         {supLoading ? <div className="flex justify-center py-10"><Loader /></div> : (
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-[#FFEDD5]">
//                   {["Supplier", "Company", "Total Earned", "Released", "Pending", "Bank", "Invoices"].map(h => (
//                     <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {suppliers.length === 0 ? (
//                   <tr><td colSpan="7" className="text-center py-10 text-brand-muted text-[12px]">No supplier records</td></tr>
//                 ) : suppliers.map(s => (
//                   <tr key={s.branchId} onClick={() => navigate(`/suppliers/${s.branchId}/profile`)}
//                     className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors cursor-pointer">
//                     <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{s.supplierName}</td>
//                     <td className="px-4 py-[10px] text-[12px] text-brand-gray">{s.companyName}</td>
//                     <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{fmtAmt(s.totalEarned)}</td>
//                     <td className="px-4 py-[10px] text-[12px] text-green-700 font-semibold">{fmtAmt(s.totalReleased)}</td>
//                     <td className="px-4 py-[10px]">
//                       {s.totalPending > 0
//                         ? <span className="text-[12px] font-semibold text-amber-600">{fmtAmt(s.totalPending)}</span>
//                         : <span className="text-[12px] text-green-700 font-semibold">✓ All Paid</span>}
//                     </td>
//                     <td className="px-4 py-[10px] text-[11px] text-brand-gray">
//                       {s.bankDetails?.bankName || "—"} · {s.bankDetails?.accountNumber || "—"}
//                     </td>
//                     <td className="px-4 py-[10px]">
//                       <span className="text-[10px] bg-brand-lighter text-brand-gray px-2 py-[2px] rounded-[10px]">
//                         {s.invoiceCount} invoices
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//         <div className="flex items-center px-4 md:px-6 py-3 border-t border-brand-border">
//           <span className="text-[11px] text-brand-muted">Showing {suppliers.length} suppliers</span>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="max-w-[1500px]">
//       <div className="mb-4">
//         <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Supplier Payments</h1>
//         <p className="text-[11px] text-brand-muted mt-[2px]">60-day payment window · Daily wise records</p>
//       </div>

//       {view === "days"      && <DaysList />}
//       {view === "detail"    && <DayDetail />}
//       {view === "suppliers" && <SuppliersView />}

//       {/* Pay Modal */}
//       {payModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] px-4">
//           <div className="bg-white rounded-[20px] p-6 w-full max-w-[440px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
//             <h3 className="text-[16px] font-bold text-brand-dark m-0 mb-1">Confirm Payment</h3>
//             <p className="text-[12px] text-brand-gray mb-1">{payModal.label}</p>
//             <p className="text-[20px] font-extrabold text-brand-primary mb-4">{fmtAmt(payModal.amount)}</p>
//             <div className="flex flex-col gap-3 mb-4">
//               <input placeholder="Transaction Ref / Cheque No (optional)" value={payRef} onChange={e => setPayRef(e.target.value)}
//                 className="w-full px-4 py-[10px] border border-brand-border rounded-[8px] text-[12px] outline-none focus:border-brand-primary transition-all" />
//               <input placeholder="Note (optional)" value={payNote} onChange={e => setPayNote(e.target.value)}
//                 className="w-full px-4 py-[10px] border border-brand-border rounded-[8px] text-[12px] outline-none focus:border-brand-primary transition-all" />
//             </div>
//             <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-3 mb-4">
//               <p className="text-[11px] text-amber-700 m-0">⚠️ This will mark all pending supplier invoices as released. This action cannot be undone.</p>
//             </div>
//             <div className="flex gap-3 justify-end">
//               <button onClick={() => { setPayModal(null); setPayNote(""); setPayRef(""); }}
//                 className="px-4 py-2 bg-gray-100 text-brand-gray border-none rounded-[8px] text-[12px] cursor-pointer">
//                 Cancel
//               </button>
//               <button onClick={handlePay} disabled={paying}
//                 className="px-4 py-2 bg-brand-primary text-white border-none rounded-[8px] text-[12px] font-bold cursor-pointer disabled:opacity-60">
//                 {paying ? "Processing…" : "Confirm Payment"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
