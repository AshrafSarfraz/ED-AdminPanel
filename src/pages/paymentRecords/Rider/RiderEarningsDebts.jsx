// 📁 pages/Rider/RiderEarningsDebts.jsx
// STANDALONE screen — route: /payments/rider-earnings/debts
// All riders ke saare rider_guilty debts, item detail ke saath, individually settle bhi ho sakte hain
import { useState, useEffect } from "react";
import Loader from "../../../components/Loader";
import StatCard from "../../../components/StatCard";
import RiderNavTabs from "./RiderNavTabs";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, ...opts }).then(r => r.json());

const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function RiderEarningsDebts() {
  const [data,       setData]       = useState({ summary: [], data: [] });
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("unsettled");
  const [settling,   setSettling]   = useState(null);
  const [note,       setNote]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const q = filter === "all" ? "" : `?settled=${filter === "settled"}`;
    const d = await apiFetch(`/api/admin/rider-earnings/debts${q}`);
    if (d.success) setData(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const handleSettle = async () => {
    setSubmitting(true);
    const d = await apiFetch(`/api/admin/rider-earnings/debts/${settling._id}/settle`, {
      method: "PUT",
      body: JSON.stringify({ note: note || null }),
    });
    setSubmitting(false);
    if (d.success) { setSettling(null); setNote(""); load(); }
    else alert(d.message || "Failed");
  };

  const totalOwed      = data.summary.reduce((s, c) => s + (c.totalOwed || 0), 0);
  const totalUnsettled = data.data.filter(d => !d.settled).reduce((s, d) => s + d.netOwed, 0);

  if (loading && data.data.length === 0) return <Loader />;

  return (
    <div className="max-w-[1500px]">
      <div className="mb-4">
        <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Rider Payments</h1>
        <p className="text-[11px] text-brand-muted ">Delivery earnings, return-leg fees, and rider-guilty debts — all in one place</p>
      </div>

      <RiderNavTabs />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatCard value={fmtAmt(totalOwed)}      label="Total Owed by Riders" />
        <StatCard value={fmtAmt(totalUnsettled)} label="Unsettled" />
        <StatCard value={data.summary.length}    label="Rider Companies" />
      </div>

      {/* Company Summary */}
      {data.summary.length > 0 && (
        <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-brand-border">
            <p className="text-[13px] font-bold text-brand-dark m-0">By Rider Company</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["Company", "Total Orders", "Unsettled", "Settled", "Total Owed"].map(h => (
                    <th key={h} className="px-4 py-[9px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.summary.map((s, i) => (
                  <tr key={i} className="border-b border-[#fdf0ea]">
                    <td className="px-4 py-[10px]">
                      <p className="text-[12px] font-semibold text-brand-dark m-0">{s.company?.name}</p>
                      <p className="text-[10px] text-brand-muted m-0">{s.company?.email}</p>
                    </td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-dark">{s.orderCount}</td>
                    <td className="px-4 py-[10px]"><span className="text-[12px] font-semibold text-red-600">{s.unsettled}</span></td>
                    <td className="px-4 py-[10px]"><span className="text-[12px] font-semibold text-green-700">{s.settled}</span></td>
                    <td className="px-4 py-[10px] text-[12px] font-bold text-brand-primary">{fmtAmt(s.totalOwed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[{ label: "Unsettled", value: "unsettled" }, { label: "Settled", value: "settled" }, { label: "All", value: "all" }].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-[7px] rounded-[8px] text-[12px] font-semibold border cursor-pointer transition-all
              ${filter === f.value ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-gray border-brand-border"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Debts Table — Item column (naam/image/qty) aur exact order amount */}
      <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        {loading ? <div className="flex justify-center py-12"><Loader /></div>
          : data.data.length === 0 ? <p className="text-center py-12 text-brand-muted text-[13px]">No rider debts found</p>
          : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["Date", "Rider Company", "Item", "Invoice", "Qty", "Order Amount", "Owed", "Status", "Action"].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.map(d => (
                  <tr key={d._id} className={`border-b border-[#fdf0ea] transition-colors ${!d.settled ? "hover:bg-[rgba(241,90,33,0.04)]" : "bg-green-50"}`}>
                    <td className="px-4 py-[11px] text-[11px] text-brand-gray whitespace-nowrap">{fmtDate(d.createdAt)}</td>
                    <td className="px-4 py-[11px]">
                      <p className="text-[12px] font-semibold text-brand-dark m-0">{d.deliveryCompanyId?.name || "—"}</p>
                      <p className="text-[10px] text-brand-muted m-0">{d.deliveryCompanyId?.email}</p>
                    </td>
                    <td className="px-4 py-[11px]">
                      <div className="flex items-center gap-2">
                        {d.itemImage
                          ? <img src={d.itemImage} alt="" className="w-7 h-7 rounded-[6px] object-cover shrink-0" />
                          : <div className="w-7 h-7 rounded-[6px] bg-brand-lighter shrink-0" />
                        }
                        <div>
                          <p className="text-[12px] font-semibold text-brand-dark m-0">{d.item || "—"}</p>
                          <p className="text-[10px] text-brand-muted m-0">{d.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-[11px] text-[11px] font-mono text-brand-muted">{d.invoiceNumber || "—"}</td>
                    <td className="px-4 py-[11px] text-[12px] text-brand-dark">
                      {d.quantity ?? "—"} <span className="text-[10px] text-brand-muted">{d.unit}</span>
                    </td>
                    <td className="px-4 py-[11px] text-[12px] text-brand-dark">
                      {fmtAmt(d.grandTotal)}
                      {d.orderAmount != null && d.orderAmount !== d.grandTotal && (
                        <span className="block text-[10px] text-brand-muted">raw: {fmtAmt(d.orderAmount)}</span>
                      )}
                    </td>
                    <td className="px-4 py-[11px] text-[13px] font-bold text-red-600">-{fmtAmt(d.netOwed)}</td>
                    <td className="px-4 py-[11px]">
                      <span className={`px-2 py-[3px] rounded-[20px] text-[10px] font-semibold border
                        ${d.settled ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                        {d.settled ? `Settled ${fmtDate(d.settledAt)}` : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-[11px]">
                      {!d.settled && (
                        <button onClick={() => { setSettling(d); setNote(""); }}
                          className="px-3 py-[5px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                          Settle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-brand-border">
          <span className="text-[11px] text-brand-muted">{data.data.length} records</span>
        </div>
      </div>

      {/* Settle Modal */}
      {settling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] px-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h3 className="text-[16px] font-bold text-brand-dark m-0 mb-1">Settle Rider Debt</h3>
            <p className="text-[12px] text-brand-gray mb-1">{settling.deliveryCompanyId?.name}</p>
            {settling.item && (
              <p className="text-[11px] text-brand-gray mb-2">{settling.item} · Qty {settling.quantity} {settling.unit}</p>
            )}
            <p className="text-[22px] font-extrabold text-brand-primary mb-4">{fmtAmt(settling.netOwed)}</p>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Settlement note (optional)..."
              className="w-full px-3 py-2 border border-brand-border rounded-[8px] text-[12px] outline-none focus:border-brand-primary resize-none mb-4"
              rows={3} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSettling(null)}
                className="px-4 py-2 bg-gray-100 text-brand-gray border-none rounded-[8px] text-[12px] cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSettle} disabled={submitting}
                className="px-4 py-2 bg-brand-primary text-white border-none rounded-[8px] text-[12px] font-bold cursor-pointer disabled:opacity-60">
                {submitting ? "Processing…" : "Mark Settled"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
