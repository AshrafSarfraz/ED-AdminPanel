// 📁 pages/paymentRecords/Buyer/BuyerDeliveryTracking.jsx
// Reporting-only: buyer-wise delivered order count + the 1% delivery fee already
// charged per order, broken down monthly. No new charge — pure visibility.
import { useState, useEffect } from "react";
import Loader from "../../../components/Loader";
import StatCard from "../../../components/StatCard";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const monthLabel = (mk) => {
  if (!mk) return "—";
  const [y, m] = mk.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

export default function BuyerDeliveryTracking() {
  const [buyers,   setBuyers]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    apiFetch("/api/admin/buyer-payments/delivery-tracking")
      .then(d => { if (d.success) setBuyers(d.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = buyers.filter(b => !search ||
    (b.managerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.companyName || "").toLowerCase().includes(search.toLowerCase()));

  const totalDelivered = buyers.reduce((s, b) => s + (b.totalDeliveredCount || 0), 0);
  const totalFee        = buyers.reduce((s, b) => s + (b.totalDeliveryFee   || 0), 0);

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Buyer Delivery Tracking</h1>
          <p className="text-[11px] text-brand-muted mt-[2px]">
            {buyers.length} buyers · reporting only — the 1% delivery fee is already included in each order's invoice
          </p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyer or company…"
          className="px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all w-[220px]" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard value={totalDelivered}    label="Total Delivered Orders" />
        <StatCard value={fmtAmt(totalFee)}  label="Total Delivery Fee Charged" />
      </div>

      {/* Buyers list */}
      <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        {filtered.length === 0 ? (
          <p className="text-center py-10 text-brand-muted text-[12px]">No delivered orders found</p>
        ) : (
          <div className="flex flex-col">
            {filtered.map(b => {
              const isExp = expanded === b.branchId;
              return (
                <div key={b.branchId} className="border-b border-brand-border last:border-0">
                  <div onClick={() => setExpanded(isExp ? null : b.branchId)}
                    className={`flex items-center justify-between px-4 md:px-6 py-4 cursor-pointer transition-colors flex-wrap gap-3
                      ${isExp ? "bg-brand-lighter" : "hover:bg-brand-lighter"}`}>
                    <div>
                      <p className="text-[13px] font-semibold text-brand-dark m-0">{b.managerName || "—"}</p>
                      <p className="text-[11px] text-brand-muted m-0">{b.companyName} · {b.email}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Delivered Orders</p>
                        <p className="text-[14px] font-bold text-brand-dark m-0">{b.totalDeliveredCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Delivery Fee</p>
                        <p className="text-[14px] font-bold text-brand-primary m-0">{fmtAmt(b.totalDeliveryFee)}</p>
                      </div>
                      <span className={`text-brand-muted text-[12px] transition-transform ${isExp ? "rotate-180" : ""}`}>▾</span>
                    </div>
                  </div>

                  {isExp && (
                    <div className="overflow-x-auto bg-white">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#FFEDD5]">
                            {["Month", "Delivered Orders", "Delivery Fee", "Total Order Value"].map(h => (
                              <th key={h} className="px-4 py-[9px] text-left text-[11px] text-[#7c3a1e] font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(b.months || []).map(m => (
                            <tr key={m.month} className="border-b border-[#fdf0ea]">
                              <td className="px-4 py-[9px] text-[12px] font-semibold text-brand-dark">{monthLabel(m.month)}</td>
                              <td className="px-4 py-[9px] text-[12px] text-brand-dark">{m.deliveredCount}</td>
                              <td className="px-4 py-[9px] text-[12px] font-semibold text-brand-primary">{fmtAmt(m.totalDeliveryFee)}</td>
                              <td className="px-4 py-[9px] text-[12px] text-brand-gray">{fmtAmt(m.totalOrderValue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
