// 📁 pages/paymentRecords/Rider/RiderEarningsDetail.jsx
// Ek month + rider company ka detail — STANDALONE screen (route: /payments/rider-earnings/:month/:companyId)
// "Back to Months" ab real navigation hai (browser back bhi kaam karega), state-toggle nahi
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../../components/Loader";
import StatCard from "../../../components/StatCard";
import RiderPayModal from "./RiderPayModal";
import RiderNavTabs from "./RiderNavTabs";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, ...opts }).then(r => r.json());

const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function RiderEarningsDetail() {
  const { month, companyId } = useParams();
  const navigate = useNavigate();

  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);

  const [payModal, setPayModal] = useState(null);
  const [payNote,  setPayNote]  = useState("");
  const [payRef,   setPayRef]   = useState("");
  const [paying,   setPaying]   = useState(false);

  const loadDetail = async () => {
    setLoading(true);
    const d = await apiFetch(`/api/admin/rider-earnings/${month}/${companyId}`);
    if (d.success) setDetail(d);
    setLoading(false);
  };

  useEffect(() => { loadDetail(); }, [month, companyId]);

  const handlePay = async () => {
    if (!payModal) return;
    setPaying(true);
    const d = await apiFetch("/api/admin/rider-earnings/pay", {
      method: "POST",
      body: JSON.stringify({ month: payModal.month, companyId: payModal.companyId, note: payNote || null, transactionRef: payRef || null }),
    });
    setPaying(false);
    if (d.success) { setPayModal(null); setPayNote(""); setPayRef(""); loadDetail(); }
    else alert(d.message || "Payment failed");
  };

  if (loading) return <Loader />;
  if (!detail) return <div className="flex items-center justify-center h-[60vh] text-brand-muted text-[13px]">Not found</div>;

  return (
    <div className="max-w-[1500px]">
      <div className="mb-4">
        <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Rider Payments</h1>
        <p className="text-[11px] text-brand-muted mt-[2px]">Delivery earnings, return-leg fees, and rider-guilty debts — all in one place</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard value={fmtAmt(detail.summary.totalEarning)} label="Total Earning" />
        <StatCard value={fmtAmt(detail.summary.totalDebt)}    label="Total Debt" />
        <StatCard value={fmtAmt(detail.summary.netPayable)}   label="Net Payable" />
      </div>

      {detail.summary.netPayable !== 0 && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setPayModal({ month: detail.month, companyId: detail.company?._id, label: `${detail.company?.name} — ${detail.monthLabel}`, amount: detail.summary.netPayable })}
            className="px-4 py-[7px] bg-brand-primary text-white border-none rounded-[8px] text-[12px] font-bold cursor-pointer">
            Pay ({fmtAmt(detail.summary.netPayable)})
          </button>
        </div>
      )}

      {/* Earnings table */}
      <div className="bg-white border border-brand-border rounded-[16px] overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-brand-border">
          <p className="text-[13px] font-bold text-brand-dark m-0">Earnings ({detail.earnings.length})</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FFEDD5]">
                {["Invoice", "Item", "Qty", "Price/Unit",  "Reason", "Amount", "Status"].map(h => (
                  <th key={h} className="px-4 py-[9px] text-left text-[11px] text-[#7c3a1e] font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.earnings.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-brand-muted text-[12px]">No earnings this month</td></tr>
              ) : detail.earnings.map(e => (
                <tr key={e._id} className="border-b border-[#fdf0ea]">
                  <td className="px-4 py-[9px] text-[11px] font-mono text-brand-muted">{e.invoiceNumber || e.invoiceId?.invoiceNumber || "—"}</td>
                  <td className="px-4 py-[9px] text-[12px] font-semibold text-brand-dark">{e.item || "—"}</td>
                  <td className="px-4 py-[9px] text-[12px] text-brand-dark">{e.quantity ?? "—"} - {e.unit}</td>
                  <td className="px-4 py-[9px] text-[12px] text-brand-dark">{e.pricePerUnit != null ? `QAR ${e.pricePerUnit}` : "—"}</td>
                  <td className="px-4 py-[9px] text-[12px] text-brand-dark">{e.reason}</td>
                  <td className="px-4 py-[9px] text-[12px] font-semibold text-brand-dark">{fmtAmt(e.earningAmount)}</td>
                  <td className="px-4 py-[9px]">
                    <span className={`text-[10px] font-semibold ${e.settled ? "text-green-700" : "text-amber-600"}`}>
                      {e.settled ? "Settled" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debts table (this month only) */}
      {detail.debts.length > 0 && (
        <div className="bg-white border border-brand-border rounded-[16px] overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-border">
            <p className="text-[13px] font-bold text-red-600 m-0">Debts — Rider Guilty ({detail.debts.length})</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-red-50">
                  {["Invoice", "Item", "Qty", "Price/Unit", "Owed", "Status"].map(h => (
                    <th key={h} className="px-4 py-[9px] text-left text-[11px] text-red-700 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.debts.map(d => (
                  <tr key={d._id} className="border-b border-red-50">
                    <td className="px-4 py-[9px] text-[11px] font-mono text-brand-muted">{d.invoiceNumber || "—"}</td>
                    <td className="px-4 py-[9px] text-[12px] font-semibold text-brand-dark">{d.item || "—"}</td>
                    <td className="px-4 py-[9px] text-[12px] text-brand-dark">{d.quantity ?? "—"}  {d.unit}</td>
                    <td className="px-4 py-[9px] text-[12px] text-brand-dark">{d.pricePerUnit != null ? `QAR ${d.pricePerUnit}` : "—"}</td>
                    <td className="px-4 py-[9px] text-[12px] font-semibold text-red-600">-{fmtAmt(d.netOwed)}</td>
                    <td className="px-4 py-[9px]">
                      <span className={`text-[10px] font-semibold ${d.settled ? "text-green-700" : "text-red-600"}`}>
                        {d.settled ? "Settled" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RiderPayModal payModal={payModal} setPayModal={setPayModal} payNote={payNote} setPayNote={setPayNote}
        payRef={payRef} setPayRef={setPayRef} paying={paying} onConfirm={handlePay} />
    </div>
  );
}
