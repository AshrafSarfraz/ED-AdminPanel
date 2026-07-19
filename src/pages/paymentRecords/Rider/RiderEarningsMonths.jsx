// 📁 pages/Rider/RiderEarningsMonths.jsx
// STANDALONE screen — route: /payments/rider-earnings (main entry, navbar se yahi khulti hai)
// Koi parent isko "import karke tab ke andar" render nahi karta — ye khud ek poori screen hai.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import StatCard from "../../../components/StatCard";
import RiderPayModal from "./RiderPayModal";
import RiderNavTabs from "./RiderNavTabs";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, ...opts }).then(r => r.json());

const fmtAmt = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";

export default function RiderEarningsMonths() {
  const navigate = useNavigate();
  const [months,  setMonths]  = useState([]);
  const [overall, setOverall] = useState({});
  const [loading, setLoading] = useState(true);

  const [payModal, setPayModal] = useState(null);
  const [payNote,  setPayNote]  = useState("");
  const [payRef,   setPayRef]   = useState("");
  const [paying,   setPaying]   = useState(false);

  const loadMonths = () => {
    setLoading(true);
    apiFetch("/api/admin/rider-earnings/months")
      .then(d => { if (d.success) { setMonths(d.data || []); setOverall(d.overall || {}); } })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMonths(); }, []);

  const handlePay = async () => {
    if (!payModal) return;
    setPaying(true);
    const d = await apiFetch("/api/admin/rider-earnings/pay", {
      method: "POST",
      body: JSON.stringify({ month: payModal.month, companyId: payModal.companyId, note: payNote || null, transactionRef: payRef || null }),
    });
    setPaying(false);
    if (d.success) { setPayModal(null); setPayNote(""); setPayRef(""); loadMonths(); }
    else alert(d.message || "Payment failed");
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">
      <div className="mb-4">
        <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Rider Payments</h1>
        <p className="text-[11px] text-brand-muted mt-[2px]">Delivery earnings, return-leg fees, and rider-guilty debts — all in one place</p>
      </div>

      <RiderNavTabs />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard value={fmtAmt(overall.totalEarning)} label="Total Rider Earnings" />
        <StatCard value={fmtAmt(overall.totalDebt)}    label="Total Rider Debt (guilty cases)" />
        <StatCard value={fmtAmt(overall.netPayable)}   label="Net Payable" />
      </div>

      <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        <div className="px-4 md:px-6 pt-4 pb-3">
          <p className="text-[14px] font-bold text-brand-dark m-0">Monthly Rider Earnings</p>
          <p className="text-[11px] text-brand-muted mt-[2px] m-0">
            Per delivery + per return-pickup (supplier guilty) — minus debt from rider-guilty returns
          </p>
        </div>

        {months.length === 0 ? (
          <p className="text-center py-10 text-brand-muted text-[12px]">No rider earning records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["Month", "Rider Company", "Delivery Fee", "Return Leg Fee", "Debt", "Net Payable", "Status", "Action"].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {months.map(row => (
                  <tr key={`${row.month}_${row.companyId}`}
                    onClick={() => navigate(`/payments/rider-earnings/${row.month}/${row.companyId}`)}
                    className="border-b border-[#fdf0ea] cursor-pointer hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                    <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{row.monthLabel}</td>
                    <td className="px-4 py-[10px]">
                      <p className="text-[12px] font-semibold text-brand-dark m-0">{row.company?.name || "—"}</p>
                      <p className="text-[10px] text-brand-muted m-0">{row.company?.email}</p>
                    </td>
                    <td className="px-4 py-[10px] text-[12px] text-green-700 font-semibold">{fmtAmt(row.deliveryEarning)}</td>
                    <td className="px-4 py-[10px] text-[12px] text-blue-600 font-semibold">{fmtAmt(row.returnLegEarning)}</td>
                    <td className="px-4 py-[10px] text-[12px] font-semibold text-red-600">
                      {row.debtAmount > 0 ? `-${fmtAmt(row.debtAmount)}` : "—"}
                    </td>
                    <td className="px-4 py-[10px] text-[13px] font-extrabold text-brand-primary">{fmtAmt(row.netPayable)}</td>
                    <td className="px-4 py-[10px]">
                      <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
                        ${row.settled ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {row.settled ? "Settled" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-[10px]" onClick={e => e.stopPropagation()}>
                      {!row.settled && (
                        <button onClick={() => setPayModal({ month: row.month, companyId: row.companyId, label: `${row.company?.name} — ${row.monthLabel}`, amount: row.netPayable })}
                          className="px-3 py-[4px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer whitespace-nowrap">
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RiderPayModal payModal={payModal} setPayModal={setPayModal} payNote={payNote} setPayNote={setPayNote}
        payRef={payRef} setPayRef={setPayRef} paying={paying} onConfirm={handlePay} />
    </div>
  );
}
