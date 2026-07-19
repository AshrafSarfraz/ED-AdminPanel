// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Loader from "../../components/Loader";
// import StatCard from "../../components/StatCard";

// const BASE     = "https://el-distibutor-backend.onrender.com";
// const token    = () => localStorage.getItem("adminToken");
// const apiFetch = (path) =>
//   fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

// const fmtAmt  = (n) => `QAR ${Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2 })}`;
// const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";

// export default function AdminPaymentDashboard() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [stats,   setStats]   = useState({
//     totalRevenue: 0, totalExpense: 0, totalCommission: 0,
//     totalBuyerDue: 0, totalSupplierDue: 0,
//     urgentBuyers: 0, urgentSuppliers: 0, pendingReceipts: 0,
//   });
//   const [recentReceipts,     setRecentReceipts]     = useState([]);
//   const [urgentSupplierDays, setUrgentSupplierDays] = useState([]);

//   useEffect(() => {
//     Promise.all([
//       apiFetch("/api/payments/admin/receipts?limit=1000"),
//       apiFetch("/api/admin/buyer-payments"),              // buyer outstanding
//       apiFetch("/api/admin/supplier-payments/days"),      // supplier outstanding + expense
//       apiFetch("/api/payments/admin/receipts?status=pending&limit=5"),
//     ]).then(([allReceipts, buyers, days, pendingRec]) => {

//       const approved   = (allReceipts.data || []).filter(r => r.status === "approved");
//       const revenue    = approved.reduce((s, r) => s + (r.totalAmount || 0), 0);

//       // expense aur supplier outstanding dono /days se niklo
//       const expense    = days.overall?.totalReleased || 0;
//       const supDue     = days.overall?.totalPending  || 0;

//       const commission = revenue - expense;
//       const buyerDue   = (buyers.data || []).reduce((s, b) => s + (b.totalDue || 0), 0);
//       const urgBuyers  = (buyers.data || []).filter(b => b.totalDue > 0);

//       // Urgent supplier days (pending > 0)
//       const supDays = (days.data || []).filter(d => (d.totalPending || 0) > 0);

//       setStats({
//         totalRevenue: revenue, totalExpense: expense, totalCommission: commission,
//         totalBuyerDue: buyerDue, totalSupplierDue: supDue,
//         urgentBuyers: urgBuyers.length,
//         urgentSuppliers: supDays.length,
//         pendingReceipts: (allReceipts.data || []).filter(r => r.status === "pending").length,
//       });
//       setRecentReceipts(pendingRec.data || []);
//       setUrgentSupplierDays(supDays.slice(0, 5));
//     }).finally(() => setLoading(false));
//   }, []);

//   if (loading) return <Loader />;

//   return (
//     <div className="max-w-[1500px]">

//       {/* Header */}
//       <div className="mb-4">
//         <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Payment Overview</h1>
//         <p className="text-[11px] text-brand-muted mt-[2px]">Complete financial dashboard</p>
//       </div>

//       {/* Row 1 — Revenue / Expense / Commission */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-3">
//         <StatCard value={fmtAmt(stats.totalRevenue)}    label="Total Revenue"   sub="Collected from buyers"       icon="coins"    onClick={() => navigate("/payments/revenue")}    />
//         <StatCard value={fmtAmt(stats.totalExpense)}    label="Total Expense"   sub="Paid to suppliers"           icon="transfer" onClick={() => navigate("/payments/expense")}    />
//         <StatCard value={fmtAmt(stats.totalCommission)} label="Net Commission"  sub="Our earnings (3% per order)" icon="trending" onClick={() => navigate("/payments/commission")} />
//       </div>

//       {/* Row 2 — Buyer / Supplier Outstanding */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
//         <StatCard
//           value={fmtAmt(stats.totalBuyerDue)}
//           label="Buyer Outstanding"
//           sub={stats.pendingReceipts > 0 ? `${stats.pendingReceipts} receipts to review` : `${stats.urgentBuyers} buyers with pending dues`}
//           icon="users"
//           onClick={() => navigate("/payments/buyers")}
//         />
//         <StatCard
//           value={fmtAmt(stats.totalSupplierDue)}
//           label="Supplier Outstanding"
//           sub={`${stats.urgentSuppliers} days with pending payments`}
//           icon="handshake"
//           onClick={() => navigate("/payments/Supplier/Outstanding")}
//         />
//       </div>

//       {/* Bottom 2 Panels */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//         {/* Pending Receipts */}
//         <div className="bg-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
//           <div className="flex items-center justify-between mb-4">
//             <p className="text-[13px] font-bold text-brand-dark m-0">Pending Receipts to Review</p>
//             <button onClick={() => navigate("/payments/receipts")}
//               className="text-[11px] text-brand-primary font-semibold bg-transparent border-none cursor-pointer p-0">
//               View all →
//             </button>
//           </div>
//           {recentReceipts.length === 0 ? (
//             <p className="text-center text-brand-muted text-[12px] py-5">No pending receipts</p>
//           ) : recentReceipts.map(r => (
//             <div key={r._id} onClick={() => navigate(`/payments/receipts/${r._id}`)}
//               className="flex items-center justify-between py-[10px] border-b border-brand-border last:border-0 cursor-pointer hover:bg-[rgba(241,90,33,0.04)] transition-colors rounded-[6px] px-1">
//               <div>
//                 <p className="text-[12px] font-semibold text-brand-dark m-0">{r.buyerBranchId?.managerName || "—"}</p>
//                 <p className="text-[10px] text-brand-muted m-0">{r.buyerBranchId?.companyName} · {fmtDate(r.createdAt)}</p>
//               </div>
//               <span className="text-[12px] font-bold text-brand-primary">{fmtAmt(r.totalAmount)}</span>
//             </div>
//           ))}
//         </div>

//         {/* Suppliers Awaiting Payment */}
//         <div className="bg-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
//           <div className="flex items-center justify-between mb-4">
//             <p className="text-[13px] font-bold text-brand-dark m-0">Suppliers Awaiting Payment</p>
//             <button onClick={() => navigate("/payments/Supplier/Outstanding")}
//               className="text-[11px] text-brand-primary font-semibold bg-transparent border-none cursor-pointer p-0">
//               Pay now →
//             </button>
//           </div>
//           {urgentSupplierDays.length === 0 ? (
//             <p className="text-center text-brand-muted text-[12px] py-5">All suppliers paid ✅</p>
//           ) : urgentSupplierDays.map(d => (
//             <div key={d.date}
//               onClick={() => navigate("/payments/Supplier/Outstanding")}
//               className="flex items-center justify-between py-[10px] border-b border-brand-border last:border-0 cursor-pointer hover:bg-[rgba(241,90,33,0.04)] transition-colors rounded-[6px] px-1">
//               <div>
//                 <p className="text-[12px] font-semibold text-brand-dark m-0">{d.dateLabel}</p>
//                 <p className="text-[10px] text-brand-muted m-0">{d.totalBulkOrders} bulk orders · {d.daysLeft}d left</p>
//               </div>
//               <span className="text-[12px] font-bold text-amber-600">{fmtAmt(d.totalPending)}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }




import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import StatCard from "../../components/StatCard";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt  = (n) => `QAR ${Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";

export default function AdminPaymentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState({
    totalRevenue: 0, totalExpense: 0, totalCommission: 0, totalRecovered: 0,
    totalBuyerDue: 0, totalSupplierDue: 0,
    urgentBuyers: 0, urgentSuppliers: 0, pendingReceipts: 0,
  });
  const [recentReceipts,     setRecentReceipts]     = useState([]);
  const [urgentSupplierDays, setUrgentSupplierDays] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/payments/admin/receipts?limit=1000"),
      apiFetch("/api/admin/buyer-payments"),              // buyer outstanding
      apiFetch("/api/admin/supplier-payments/days"),      // supplier outstanding + expense
      apiFetch("/api/payments/admin/receipts?status=pending&limit=5"),
      apiFetch("/api/admin/rider-earnings/recovered"),    // settled debts riders paid back to us
    ]).then(([allReceipts, buyers, days, pendingRec, recovered]) => {

      const approved   = (allReceipts.data || []).filter(r => r.status === "approved");
      const revenue    = approved.reduce((s, r) => s + (r.totalAmount || 0), 0);

      // expense aur supplier outstanding dono /days se niklo
      const expense       = days.overall?.totalReleased || 0;
      const supDue        = days.overall?.totalPending  || 0;
      const totalRecovered = recovered?.totalRecovered || 0;

      // Rider se recover hua paisa bhi Net Commission mein add hota hai — warna jab
      // rider-guilty case mein supplier ko humne pehle hi pay kar diya ho lekin buyer
      // se paisa na aaya ho, dashboard hamesha thoda "loss mein" dikhta rehta jab tak
      // rider apna debt settle na kare.
      const commission = revenue - expense + totalRecovered;
      const buyerDue   = (buyers.data || []).reduce((s, b) => s + (b.totalDue || 0), 0);
      const urgBuyers  = (buyers.data || []).filter(b => b.totalDue > 0);

      // Urgent supplier days (pending > 0)
      const supDays = (days.data || []).filter(d => (d.totalPending || 0) > 0);

      setStats({
        totalRevenue: revenue, totalExpense: expense, totalCommission: commission, totalRecovered,
        totalBuyerDue: buyerDue, totalSupplierDue: supDue,
        urgentBuyers: urgBuyers.length,
        urgentSuppliers: supDays.length,
        pendingReceipts: (allReceipts.data || []).filter(r => r.status === "pending").length,
      });
      setRecentReceipts(pendingRec.data || []);
      setUrgentSupplierDays(supDays.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Payment Overview</h1>
        <p className="text-[11px] text-brand-muted mt-[2px]">Complete financial dashboard</p>
      </div>

      {/* Row 1 — Revenue / Expense / Recovered / Commission */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-3">
        <StatCard value={fmtAmt(stats.totalRevenue)}    label="Total Revenue"   sub="Collected from buyers"       icon="coins"    onClick={() => navigate("/payments/revenue")}    />
        <StatCard value={fmtAmt(stats.totalExpense)}    label="Total Expense"   sub="Paid to suppliers"           icon="transfer" onClick={() => navigate("/payments/expense")}    />
        <StatCard value={fmtAmt(stats.totalRecovered)}  label="Recovered from Riders" sub="Rider-guilty debts settled" icon="check"  onClick={() => navigate("/payments/rider-earnings/debts")} />
        <StatCard value={fmtAmt(stats.totalCommission)} label="Net Commission"  sub="Revenue − Expense + Recovered" icon="trending" onClick={() => navigate("/payments/commission")} />
      </div>

      {/* Row 2 — Buyer / Supplier Outstanding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
        <StatCard
          value={fmtAmt(stats.totalBuyerDue)}
          label="Buyer Outstanding"
          sub={stats.pendingReceipts > 0 ? `${stats.pendingReceipts} receipts to review` : `${stats.urgentBuyers} buyers with pending dues`}
          icon="users"
          onClick={() => navigate("/payments/buyers")}
        />
        <StatCard
          value={fmtAmt(stats.totalSupplierDue)}
          label="Supplier Outstanding"
          sub={`${stats.urgentSuppliers} days with pending payments`}
          icon="handshake"
          onClick={() => navigate("/payments/Supplier/Outstanding")}
        />
      </div>

      {/* Bottom 2 Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Pending Receipts */}
        <div className="bg-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-bold text-brand-dark m-0">Pending Receipts to Review</p>
            <button onClick={() => navigate("/payments/ReceiptsApprovalList")}
              className="text-[11px] text-brand-primary font-semibold bg-transparent border-none cursor-pointer p-0">
              View all →
            </button>
          </div>
          {recentReceipts.length === 0 ? (
            <p className="text-center text-brand-muted text-[12px] py-5">No pending receipts</p>
          ) : recentReceipts.map(r => (
            <div key={r._id} onClick={() => navigate(`/payments/receipts/${r._id}`)}
              className="flex items-center justify-between py-[10px] border-b border-brand-border last:border-0 cursor-pointer hover:bg-[rgba(241,90,33,0.04)] transition-colors rounded-[6px] px-1">
              <div>
                <p className="text-[12px] font-semibold text-brand-dark m-0">{r.buyerBranchId?.managerName || "—"}</p>
                <p className="text-[10px] text-brand-muted m-0">{r.buyerBranchId?.companyName} · {fmtDate(r.createdAt)}</p>
              </div>
              <span className="text-[12px] font-bold text-brand-primary">{fmtAmt(r.totalAmount)}</span>
            </div>
          ))}
        </div>

        {/* Suppliers Awaiting Payment */}
        <div className="bg-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-bold text-brand-dark m-0">Suppliers Awaiting Payment</p>
            <button onClick={() => navigate("/payments/Supplier/Outstanding")}
              className="text-[11px] text-brand-primary font-semibold bg-transparent border-none cursor-pointer p-0">
              Pay now →
            </button>
          </div>
          {urgentSupplierDays.length === 0 ? (
            <p className="text-center text-brand-muted text-[12px] py-5">All suppliers paid ✅</p>
          ) : urgentSupplierDays.map(d => (
            <div key={d.date}
              onClick={() => navigate("/payments/Supplier/Outstanding")}
              className="flex items-center justify-between py-[10px] border-b border-brand-border last:border-0 cursor-pointer hover:bg-[rgba(241,90,33,0.04)] transition-colors rounded-[6px] px-1">
              <div>
                <p className="text-[12px] font-semibold text-brand-dark m-0">{d.dateLabel}</p>
                <p className="text-[10px] text-brand-muted m-0">{d.totalBulkOrders} bulk orders · {d.daysLeft}d left</p>
              </div>
              <span className="text-[12px] font-bold text-amber-600">{fmtAmt(d.totalPending)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
