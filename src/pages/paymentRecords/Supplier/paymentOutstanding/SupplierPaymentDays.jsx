import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../../components/Loader";
import StatCard from "../../../../components/StatCard";
import SupplierPayModal from "./SupplierPayModal";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, ...opts }).then(r => r.json());

const cacheSet = (k, d) => localStorage.setItem(k, JSON.stringify({ ts: Date.now(), data: d }));
const cacheGet = (k) => { try { const r = JSON.parse(localStorage.getItem(k)); return r ? { data: r.data, stale: Date.now() - r.ts > 3 * 60 * 1000 } : null; } catch { return null; } };
const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function SupplierPaymentDays() {
  const [tab, setTab] = useState("days"); // "days" | "suppliers"

  return (
    <div className="max-w-[1500px]">
      <div className="mb-4">
        <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Supplier Payments</h1>
        <p className="text-[11px] text-brand-muted mt-[2px]">60-day payment window · Daily wise records</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[{ v: "days", l: "Daily Records" }, { v: "suppliers", l: "Supplier Records" }].map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={`px-4 py-[8px] rounded-[8px] text-[12px] font-semibold border cursor-pointer transition-all
              ${tab === t.v ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-gray border-brand-border"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === "days" ? <DaysTab /> : <SuppliersTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  Tab 1 — Daily Records
// ═══════════════════════════════════════════════════════
function DaysTab() {
  const navigate = useNavigate();
  const [days,       setDays]       = useState([]);
  const [overall,    setOverall]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [payModal, setPayModal] = useState(null);
  const [payNote,  setPayNote]  = useState("");
  const [payRef,   setPayRef]   = useState("");
  const [paying,   setPaying]   = useState(false);

  const loadDays = (bg = false) => {
    const key    = "supplierPaymentDays";
    const cached = cacheGet(key);
    if (!bg && cached) { setDays(cached.data.days); setOverall(cached.data.overall || {}); setLoading(false); if (!cached.stale) return; setRefreshing(true); }
    else if (!bg) { if (!cached) setLoading(true); else setRefreshing(true); }
    else setRefreshing(true);
    apiFetch("/api/admin/supplier-payments/days")
      .then(d => { if (!d.success) return; setDays(d.data); setOverall(d.overall || {}); cacheSet(key, { days: d.data, overall: d.overall }); })
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { loadDays(); }, []);

  const handlePay = async () => {
    if (!payModal) return;
    setPaying(true);
    const body = { note: payNote || null, transactionRef: payRef || null };
    if (payModal.bulkOrderId) body.bulkOrderId = payModal.bulkOrderId;
    else                      body.date        = payModal.date;
    const d = await apiFetch("/api/admin/supplier-payments/pay", { method: "POST", body: JSON.stringify(body) });
    setPaying(false);
    if (d.success) {
      setPayModal(null); setPayNote(""); setPayRef("");
      Object.keys(localStorage).filter(k => k.startsWith("supplierPay")).forEach(k => localStorage.removeItem(k));
      loadDays(true);
    } else alert(d.message || "Payment failed");
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <StatCard value={fmtAmt(overall.totalAmount)}   label="Total Earned"   />
        <StatCard value={fmtAmt(overall.totalPending)}  label="Total Pending"  />
        <StatCard value={fmtAmt(overall.totalReleased)} label="Total Released" />
        <StatCard value={overall.overdueDays ?? 0}       label="Overdue Days"   />
      </div>

      <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <p className="text-[14px] font-bold text-brand-dark m-0">Daily Payment Records</p>
            <p className="text-[11px] text-brand-muted mt-[2px] flex items-center gap-2 m-0">
              {days.length} days · Click a row to see bulk orders
              {refreshing && <span className="text-brand-primary font-semibold">● syncing…</span>}
            </p>
          </div>
          <button onClick={() => loadDays(true)} disabled={refreshing} className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer disabled:opacity-60">
            ↻ Refresh
          </button>
        </div>

        {days.length === 0 ? (
          <p className="text-center py-10 text-brand-muted text-[12px]">No supplier payment records yet</p>
        ) : (
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "580px" }}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FFEDD5]">
                  {["Date", "Bulk Orders", "Total Earned", "Paid", "Pending", "Deadline", "Days Left", "Actions"].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(d => {
                  const urgent  = d.daysLeft >= 0 && d.daysLeft <= 7 && !d.fullyPaid;
                  const overdue = d.isOverdue && !d.fullyPaid;
                  return (
                    <tr key={d.date} onClick={() => navigate(`/payments/Supplier/Outstanding/${d.date}`)}
                      className={`border-b border-[#fdf0ea] cursor-pointer transition-colors
                        ${overdue ? "bg-red-50 hover:bg-red-100" : urgent ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-[rgba(241,90,33,0.05)]"}`}>
                      <td className="px-4 py-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-brand-dark">{d.dateLabel}</span>
                          {overdue && <span className="text-[9px] bg-red-100 text-red-600 px-2 py-[1px] rounded-[10px] font-bold">OVERDUE</span>}
                          {urgent && !overdue && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-[1px] rounded-[10px] font-bold">URGENT</span>}
                        </div>
                      </td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">{d.totalBulkOrders}</td>
                      <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{fmtAmt(d.totalAmount)}</td>
                      <td className="px-4 py-[10px] text-[12px] text-green-700 font-semibold">{fmtAmt(d.totalReleased)}</td>
                      <td className="px-4 py-[10px]">
                        {d.fullyPaid
                          ? <span className="text-[12px] text-green-700 font-semibold">✓ Paid</span>
                          : <span className="text-[12px] font-semibold text-amber-600">{fmtAmt(d.totalPending)}</span>}
                      </td>
                      <td className="px-4 py-[10px] text-[11px] text-brand-gray">{fmtDate(d.deadline)}</td>
                      <td className="px-4 py-[10px]">
                        <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
                          ${overdue     ? "bg-red-50 text-red-600 border-red-200"
                          : d.fullyPaid ? "bg-green-50 text-green-700 border-green-200"
                          : urgent      ? "bg-amber-50 text-amber-700 border-amber-200"
                          :               "bg-gray-50 text-gray-500 border-gray-200"}`}>
                          {d.fullyPaid ? "Paid" : overdue ? `${Math.abs(d.daysLeft)}d overdue` : `${d.daysLeft}d left`}
                        </span>
                      </td>
                      <td className="px-4 py-[10px]" onClick={e => e.stopPropagation()}>
                        {!d.fullyPaid && (
                          <button onClick={() => setPayModal({ date: d.date, label: `All orders on ${d.dateLabel}`, amount: d.totalPending })}
                            className="px-3 py-[4px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer whitespace-nowrap">
                            Pay All
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center px-4 md:px-6 py-3 border-t border-brand-border">
          <span className="text-[11px] text-brand-muted">Showing {days.length} days</span>
        </div>
      </div>

      <SupplierPayModal payModal={payModal} setPayModal={setPayModal} payNote={payNote} setPayNote={setPayNote}
        payRef={payRef} setPayRef={setPayRef} paying={paying} onConfirm={handlePay} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  Tab 2 — Supplier Records (lifetime, per supplier)
// ═══════════════════════════════════════════════════════
function SuppliersTab() {
  const navigate = useNavigate();
  const [suppliers,  setSuppliers]  = useState([]);
  const [supLoading, setSupLoading] = useState(true);

  useEffect(() => {
    setSupLoading(true);
    apiFetch("/api/admin/supplier-payments/suppliers")
      .then(d => { if (d.success) setSuppliers(d.data); })
      .finally(() => setSupLoading(false));
  }, []);

  if (supLoading) return <Loader />;

  return (
    <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
      <div className="px-4 md:px-6 pt-4 pb-3">
        <p className="text-[14px] font-bold text-brand-dark m-0">Supplier Payment Records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#FFEDD5]">
              {["Supplier", "Company", "Total Earned", "Released", "Pending", "Bank", "Invoices"].map(h => (
                <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-10 text-brand-muted text-[12px]">No supplier records</td></tr>
            ) : suppliers.map(s => (
              <tr key={s.branchId} onClick={() => navigate(`/suppliers/${s.branchId}/profile`)}
                className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors cursor-pointer">
                <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{s.supplierName}</td>
                <td className="px-4 py-[10px] text-[12px] text-brand-gray">{s.companyName}</td>
                <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{fmtAmt(s.totalEarned)}</td>
                <td className="px-4 py-[10px] text-[12px] text-green-700 font-semibold">{fmtAmt(s.totalReleased)}</td>
                <td className="px-4 py-[10px]">
                  {s.totalPending > 0
                    ? <span className="text-[12px] font-semibold text-amber-600">{fmtAmt(s.totalPending)}</span>
                    : <span className="text-[12px] text-green-700 font-semibold">✓ All Paid</span>}
                </td>
                <td className="px-4 py-[10px] text-[11px] text-brand-gray">
                  {s.bankDetails?.bankName || "—"} · {s.bankDetails?.accountNumber || "—"}
                </td>
                <td className="px-4 py-[10px]">
                  <span className="text-[10px] bg-brand-lighter text-brand-gray px-2 py-[2px] rounded-[10px]">
                    {s.invoiceCount} invoices
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center px-4 md:px-6 py-3 border-t border-brand-border">
        <span className="text-[11px] text-brand-muted">Showing {suppliers.length} suppliers</span>
      </div>
    </div>
  );
}
