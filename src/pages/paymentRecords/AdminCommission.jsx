// 📁 pages/paymentRecords/AdminCommission.jsx
// Platform ka commission — sirf commission. % KABHI hardcode nahi karte (settings
// badal sakti hain) — backend se live % aata hai, jo har order ke actual data se
// derive hota hai (isliye purane orders ka % kabhi galat nahi dikhega).
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import StatCard from "../../components/StatCard";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtPct  = (n) => n != null ? `${n}%` : "—";

export default function AdminCommission() {
  const navigate = useNavigate();
  const [records,  setRecords]  = useState([]);
  const [overall,  setOverall]  = useState({});
  const [settings, setSettings] = useState({});
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    apiFetch("/api/admin/commission-records")
      .then(d => {
        if (d.success) {
          setRecords(d.data || []);
          setOverall(d.overall || {});
          setSettings(d.currentSettings || {});
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (o.item || "").toLowerCase().includes(q) || (o.country || "").toLowerCase().includes(q);
  });

  if (loading) return <Loader />;

  // Overall.commissionPct/deliveryFeePct = actual weighted average from real data shown below.
  // currentSettings = live settings (what a NEW order right now would use) — shown as a note
  // if it differs from the historical average (e.g. admin changed % recently).
  const commLabel = `Platform Commission (${fmtPct(overall.commissionPct)})`;
  const settingsChanged =
    settings.platformCommission != null && overall.commissionPct != null &&
    settings.platformCommission !== overall.commissionPct;

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Platform Commission</h1>
          <p className="text-[11px] text-brand-muted mt-[2px]">
            {filtered.length} bulk orders · {fmtPct(overall.commissionPct)} platform fee
          </p>
          {settingsChanged && (
            <p className="text-[10px] text-amber-600 mt-1 m-0">
              ⚠️ Current live setting is {fmtPct(settings.platformCommission)} — figures below reflect the % actually used on each historical order.
            </p>
          )}
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search item or country…"
          className="px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all w-[220px]"
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
        <StatCard value={fmtAmt(overall.totalBuyerPaid)}   label="Total Buyer Payments"  sub="What buyers paid (incl. all fees)" />
        <StatCard value={fmtAmt(overall.totalCommission)}  label={commLabel}             sub="Our actual earnings" />
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        {filtered.length === 0 ? (
          <p className="text-center py-10 text-brand-muted text-[12px]">No commission records</p>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "580px" }}>
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#FFEDD5]">
                    {["Bulk ID", "Item", "Buyers", "Total Qty", "Win Price", "Platform Commission", "Buyer Paid Total", "Bid Date", ""].map(h => (
                      <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.bulkOrderId} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                      <td className="px-4 py-[10px]">
                        <span className="font-mono text-[10px] text-brand-muted">{o.bulkOrderId?.toString().slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-[10px]">
                        <div className="flex items-center gap-2">
                          {o.image
                            ? <img src={o.image} alt="" className="w-7 h-7 rounded-[6px] object-cover shrink-0" />
                            : <div className="w-7 h-7 rounded-[6px] bg-brand-lighter shrink-0" />
                          }
                          <div>
                            <p className="text-[12px] font-semibold text-brand-dark m-0">{o.item}</p>
                            <p className="text-[10px] text-brand-muted m-0">{o.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">{o.buyerCount}</td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">
                        {o.totalQuantity?.toLocaleString()} <span className="text-[10px] text-brand-muted">{o.unit}</span>
                      </td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">QAR {o.winningPrice ?? "—"}</td>
                      <td className="px-4 py-[10px] text-[12px] font-bold text-purple-700">
                        {fmtAmt(o.totalCommission)} <span className="text-[10px] text-brand-muted font-normal">({fmtPct(o.commissionPct)})</span>
                      </td>
                      <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{fmtAmt(o.totalBuyerPaid)}</td>
                      <td className="px-4 py-[10px] text-[11px] text-brand-gray">{fmtDate(o.bidDate || o.createdAt)}</td>
                      <td className="px-4 py-[10px]">
                        <button onClick={() => navigate(`/bidding/${o.bulkOrderId}`)}
                          className="px-3 py-[4px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer totals */}
            <div className="flex justify-end gap-8 px-4 md:px-6 py-3 border-t border-brand-border bg-brand-lighter flex-wrap">
              <div className="text-right">
                <p className="text-[10px] text-brand-muted m-0 mb-1">{commLabel}</p>
                <p className="text-[14px] font-extrabold text-purple-700 m-0">{fmtAmt(overall.totalCommission)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-brand-muted m-0 mb-1">Total Buyer Payments</p>
                <p className="text-[14px] font-extrabold text-brand-dark m-0">{fmtAmt(overall.totalBuyerPaid)}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
