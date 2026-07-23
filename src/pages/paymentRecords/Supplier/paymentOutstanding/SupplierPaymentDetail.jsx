

// 📁 pages/paymentRecords/Supplier/SupplierPaymentDetail.jsx
// STANDALONE screen — route: /payments/Supplier/Outstanding/:date
// "Back to Days" ab real navigation hai, state-toggle nahi
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function SupplierPaymentDetail() {
  const { date } = useParams();
  const navigate = useNavigate();

  const [dayData,    setDayData]    = useState(null);
  const [dayLoading, setDayLoading] = useState(true);

  const [payModal, setPayModal] = useState(null);
  const [payNote,  setPayNote]  = useState("");
  const [payRef,   setPayRef]   = useState("");
  const [paying,   setPaying]   = useState(false);

  const loadDayDetail = async () => {
    setDayLoading(true);
    const key    = `supplierPayDay_${date}`;
    const cached = cacheGet(key);
    if (cached) { setDayData(cached.data); setDayLoading(false); if (!cached.stale) return; }
    const d = await apiFetch(`/api/admin/supplier-payments/days/${date}/bulk-orders`);
    if (d.success) { setDayData(d); cacheSet(key, d); }
    setDayLoading(false);
  };

  useEffect(() => { loadDayDetail(); }, [date]);

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
      loadDayDetail();
    } else alert(d.message || "Payment failed");
  };

  if (dayLoading) return <Loader />;

  return (
    <div className="max-w-[1500px]">
      <button onClick={() => navigate("/payments/Supplier/Outstanding")}
        className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer mb-4">
        ← Back to Days
      </button>

      {dayData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
          <StatCard value={dayData.dayTotal?.bulkOrderCount}        label="Bulk Orders"  />
          <StatCard value={fmtAmt(dayData.dayTotal?.totalAmount)}   label="Total Earned" />
          <StatCard value={fmtAmt(dayData.dayTotal?.totalPending)}  label="Pending"      />
          <StatCard value={`${dayData.dayTotal?.daysLeft ?? "—"}d`} label="Days Left"    />
        </div>
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <p className="text-[14px] font-bold text-brand-dark m-0">Bulk Orders — {fmtDate(date)}</p>
          <p className="text-[11px] text-brand-muted m-0 mt-[2px]">
            Deadline: {fmtDate(dayData?.dayTotal?.deadline)} · {dayData?.dayTotal?.daysLeft}d left
          </p>
        </div>
        {dayData?.dayTotal?.totalPending > 0 && (
          <button onClick={() => setPayModal({ date, label: `All orders on ${fmtDate(date)}`, amount: dayData.dayTotal.totalPending })}
            className="px-4 py-[7px] bg-brand-primary text-white border-none rounded-[8px] text-[12px] font-bold cursor-pointer">
            Pay All Day ({fmtAmt(dayData?.dayTotal?.totalPending)})
          </button>
        )}
      </div>

      {(dayData?.data || []).map(bulk => (
        <div key={bulk.bulkOrderId} className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-4">

          {/* Bulk header */}
          <div className="flex items-center gap-4 px-4 md:px-5 py-4 bg-brand-lighter border-b border-brand-border flex-wrap">
            {bulk.image
              ? <img src={bulk.image} alt={bulk.item} className="w-10 h-10 rounded-[8px] object-cover shrink-0" />
              : <div className="w-10 h-10 rounded-[8px] bg-brand-border shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-[13px] font-bold text-brand-dark m-0">{bulk.item} — {bulk.country}</p>
                <span className="text-[10px] font-mono bg-white text-brand-gray px-2 py-[2px] rounded-[4px] border border-brand-border">{bulk.orderRef}</span>
              </div>
              <p className="text-[10px] text-brand-muted m-0">
                {bulk.totalQuantity?.toLocaleString()} {bulk.unit} · Supplier: <span className="font-semibold text-brand-dark">{bulk.supplierName}</span> ({bulk.supplierCompany})
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-brand-muted m-0 mb-1">Total to Pay</p>
              <p className={`text-[15px] font-extrabold m-0 mb-2 ${bulk.fullyPaid ? "text-green-700" : "text-brand-primary"}`}>
                {bulk.fullyPaid ? "✓ Paid" : fmtAmt(bulk.totalPending)}
              </p>
              {!bulk.fullyPaid && (
                <button onClick={() => setPayModal({ bulkOrderId: bulk.bulkOrderId, label: `${bulk.item} — ${bulk.orderRef}`, amount: bulk.totalPending })}
                  className="px-3 py-[5px] bg-brand-primary text-white border-none rounded-[7px] text-[11px] font-semibold cursor-pointer">
                  Pay This Order
                </button>
              )}
            </div>
          </div>

          {/* Bank info */}
          {bulk.supplierBank && (
            <div className="flex items-center gap-5 flex-wrap px-4 md:px-5 py-3 bg-brand-lighter border-b border-brand-border">
              <span className="text-[10px] text-brand-muted font-semibold">Bank Details:</span>
              {[["Bank", bulk.supplierBank.bankName], ["Account", bulk.supplierBank.accountNumber], ["IBAN", bulk.supplierBank.iban], ["Swift", bulk.supplierBank.swiftCode]].map(([l, v]) => (
                <div key={l}>
                  <span className="text-[10px] text-brand-muted">{l}: </span>
                  <span className="text-[10px] font-semibold text-brand-dark">{v || "—"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Buyer orders table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["Invoice", "Buyer", "Qty", "Price/Unit", "Amount", "Deduction", "Net", "Order", "Buyer Payment", "Release"].map(h => (
                    <th key={h} className="px-4 py-[9px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bulk.buyerOrders.map((bo, i) => (
                  <tr key={i} className={`border-b border-[#fdf0ea] transition-colors ${bo.isReturned ? "bg-red-50" : "hover:bg-[rgba(241,90,33,0.05)]"}`}>
                    <td className="px-4 py-[10px] text-[10px] text-brand-muted font-mono">{bo.invoiceNumber}</td>
                    <td className="px-4 py-[10px]">
                      <p className="text-[12px] font-semibold text-brand-dark m-0">{bo.buyerName}</p>
                      <p className="text-[10px] text-brand-muted m-0">{bo.buyerCompany}</p>
                    </td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-dark">{bo.quantity} {bulk.unit}</td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-dark">QAR {bo.pricePerUnit}</td>
                    <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">
                      {bo.isReturned ? <span className="line-through text-brand-muted">Returned</span> : fmtAmt(bo.amount)}
                    </td>
                    <td className="px-4 py-[10px] text-[12px] font-semibold text-red-600">
                      {bo.deduction > 0 ? `-${fmtAmt(bo.deduction)}` : "N/A"}
                    </td>
                    <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">
                      {bo.isReturned ? "N/A" : fmtAmt(bo.netAmount)}
                    </td>
                    <td className="px-4 py-[10px]">
                      <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
                        ${bo.orderStatus === "returned"  ? "bg-red-50 text-red-600 border-red-200"
                        : bo.orderStatus === "delivered" ? "bg-blue-50 text-blue-600 border-blue-200"
                        :                                  "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {bo.orderStatus === "returned" ? "Returned" : bo.orderStatus === "delivered" ? "Delivered" : bo.orderStatus ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-[10px]">
                      {/* Buyer Payment — kya buyer/rider ki taraf se paisa aa gaya (money IN) */}
                      <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
                        ${bo.buyerPaymentStatus === "paid"                ? "bg-green-50 text-green-700 border-green-200"
                        : bo.buyerPaymentStatus === "paid_rider_recovery" ? "bg-blue-50 text-blue-700 border-blue-200"
                        : bo.buyerPaymentStatus === "cancelled"           ? "bg-gray-50 text-gray-500 border-gray-200"
                        :                                                   "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {bo.buyerPaymentLabel}
                      </span>
                    </td>
                    <td className="px-4 py-[10px]">
                      {/* Release — kya HUMNE supplier ko de diya (money OUT) */}
                      {bo.isReturned
                        ? <span className="px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border bg-red-50 text-red-600 border-red-200">Cancelled</span>
                        : <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
                            ${bo.releaseStatus === "released" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            {bo.releaseStatus === "released" ? "Released" : "Pending"}
                          </span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-6 px-4 md:px-5 py-3 border-t border-brand-border bg-brand-lighter flex-wrap">
            <div className="text-right">
              <p className="text-[10px] text-brand-muted m-0 mb-1">Collected from {bulk.buyerCount} buyers</p>
              <p className="text-[13px] font-extrabold text-brand-dark m-0">{fmtAmt(bulk.totalAmount)}</p>
            </div>
            {bulk.totalDeduction > 0 && (
              <div className="text-right">
                <p className="text-[10px] text-brand-muted m-0 mb-1">Return Deduction</p>
                <p className="text-[13px] font-extrabold text-red-600 m-0">-{fmtAmt(bulk.totalDeduction)}</p>
              </div>
            )}
            <div className="text-right">
              <p className="text-[10px] text-brand-muted m-0 mb-1">Net to Pay Supplier</p>
              <p className={`text-[13px] font-extrabold m-0 ${bulk.fullyPaid ? "text-green-700" : "text-brand-primary"}`}>
                {bulk.fullyPaid ? "✓ Fully Paid" : fmtAmt(bulk.netToPaySupplier ?? bulk.totalPending)}
              </p>
            </div>
          </div>
        </div>
      ))}

      <SupplierPayModal payModal={payModal} setPayModal={setPayModal} payNote={payNote} setPayNote={setPayNote}
        payRef={payRef} setPayRef={setPayRef} paying={paying} onConfirm={handlePay} />
    </div>
  );
}
