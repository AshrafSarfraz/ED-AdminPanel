


import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../../components/Loader";
import StatCard from "../../../components/StatCard";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const getDaysInfo = (dueDate) => {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate) - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0)   return { label: `${Math.abs(diff)}d overdue`, bg: "bg-red-50",    text: "text-red-700",    urgent: true  };
  if (diff === 0) return { label: "Due today",                  bg: "bg-amber-50",  text: "text-amber-700",  urgent: true  };
  if (diff <= 7)  return { label: `${diff}d left`,              bg: "bg-orange-50", text: "text-orange-700", urgent: true  };
  return            { label: `${diff}d left`,                   bg: "bg-blue-50",   text: "text-blue-700",   urgent: false };
};

export default function BuyerInvoices() {
  const { branchId } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/admin/buyer-payments/${branchId}`)
      .then(d => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  }, [branchId]);

  if (loading) return <Loader />;

  const buyer          = data?.buyer    || {};
  const invoices       = data?.invoices || [];
  const activeInvoices = invoices.filter(i => i.paymentStatus !== "cancelled");
  const unpaidInvoices = activeInvoices.filter(i => i.paymentStatus !== "paid");
  const paidInvoices   = activeInvoices.filter(i => i.paymentStatus === "paid");
  const totalDue       = unpaidInvoices.reduce((s, i) => s + (i.amountDue || 0), 0);
  const sorted         = [...invoices].sort((a, b) => new Date(b.createdAt || b.bidDate) - new Date(a.createdAt || a.bidDate));

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">{buyer.managerName || "Buyer"}</h1>
        <p className="text-[11px] text-brand-muted mt-[2px]">{buyer.companyName} · {buyer.email}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <StatCard value={fmtAmt(buyer.totalBilled)} label="Total Billed"    />
        <StatCard value={fmtAmt(buyer.totalPaid)}   label="Total Paid"      />
        <StatCard value={fmtAmt(totalDue)}           label="Outstanding"     />
        <StatCard value={paidInvoices.length}        label="Paid Invoices"   sub={`${unpaidInvoices.length} unpaid`} />
      </div>

      {/* Refund banner — agar kisi cancelled invoice ka paisa pehle se liya ja chuka tha */}
      {buyer.totalRefundDue > 0 && (
        <div className="mb-4 px-4 py-3 rounded-[12px] bg-amber-50 border border-amber-200 text-[12px] text-amber-800">
          ⚠️ {fmtAmt(buyer.totalRefundDue)} refund pending is buyer ke liye — returned/cancelled orders ki wajah se.
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-brand-border">
          <p className="text-[13px] font-bold text-brand-dark m-0">All Invoices ({invoices.length})</p>
          <span className="text-[11px] text-brand-muted">Latest first</span>
        </div>

        {invoices.length === 0 ? (
          <p className="text-center py-10 text-brand-muted text-[12px]">No invoices found</p>
        ) : (
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "580px" }}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FFEDD5]">
                  {["Invoice No.", "Item", "Bulk ID", "Qty", "Amount Due", "Due Date", "Status"].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((inv, i) => {
                  const daysInfo    = getDaysInfo(inv.dueDate);
                  const isCancelled = inv.paymentStatus === "cancelled";
                  const isPaid      = inv.paymentStatus === "paid";
                  const isOverdue   = !isPaid && !isCancelled && daysInfo?.urgent;
                  return (
                    <tr key={inv._id || i}
                      className={`border-b border-[#fdf0ea] transition-colors
                        ${isCancelled ? "bg-gray-50/60 opacity-70" : isOverdue ? "bg-red-50/30 hover:bg-red-50" : "hover:bg-[rgba(241,90,33,0.05)]"}`}>
                      <td className="px-4 py-[10px] font-mono text-[11px] font-semibold text-brand-gray">
                        {inv.invoiceNumber || "—"}
                      </td>
                      <td className="px-4 py-[10px]">
                        <p className="text-[12px] font-semibold text-brand-primary m-0">{inv.item || "—"}</p>
                        <p className="text-[10px] text-brand-muted m-0">{inv.country}</p>
                      </td>
                      <td className="px-4 py-[10px]">
                        {inv.bulkOrderId
                          ? <span className="font-mono text-[10px] bg-brand-lighter text-brand-gray px-2 py-[2px] rounded-[4px]">
                              {inv.bulkOrderId.toString().slice(-8).toUpperCase()}
                            </span>
                          : <span className="text-brand-muted">—</span>}
                      </td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">
                        {inv.quantity} <span className="text-[10px] text-brand-muted">{inv.unit}</span>
                      </td>
                      <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">
                        {isCancelled ? "—" : fmtAmt(inv.amountDue)}
                      </td>
                      <td className="px-4 py-[10px]">
                        <p className="text-[11px] text-brand-gray m-0 mb-[3px]">{fmtDate(inv.dueDate)}</p>
                        {!isPaid && !isCancelled && daysInfo && (
                          <span className={`text-[10px] font-semibold px-2 py-[2px] rounded-[8px] ${daysInfo.bg} ${daysInfo.text}`}>
                            {daysInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border
                          ${isCancelled ? "bg-gray-100 text-gray-600 border-gray-200"
                          : isPaid      ? "bg-green-50 text-green-700 border-green-200"
                          : isOverdue   ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                          {isCancelled ? "Returned" : isPaid ? "Paid" : isOverdue ? "Overdue" : "Unpaid"}
                        </span>
                        {isCancelled && inv.refundAmount > 0 && (
                          <p className="text-[10px] text-amber-700 m-0 mt-1">Refund due: {fmtAmt(inv.refundAmount)}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {invoices.length > 0 && (
          <div className="flex justify-end gap-8 px-4 md:px-6 py-3 border-t border-brand-border bg-brand-lighter flex-wrap">
            <div className="text-right">
              <p className="text-[10px] text-brand-muted m-0 mb-1">Total Paid</p>
              <p className="text-[14px] font-extrabold text-green-700 m-0">{fmtAmt(buyer.totalPaid)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-brand-muted m-0 mb-1">Total Outstanding</p>
              <p className={`text-[14px] font-extrabold m-0 ${totalDue > 0 ? "text-red-600" : "text-green-700"}`}>{fmtAmt(totalDue)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}