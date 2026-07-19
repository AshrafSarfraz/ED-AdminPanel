

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../../components/Loader";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function AdminSupplierExpenseDetail() {
  const { date, supplierKey } = useParams();
  const decodedKey = decodeURIComponent(supplierKey);
  const [loading,  setLoading]  = useState(true);
  const [supplier, setSupplier] = useState(null);
  const [bulks,    setBulks]    = useState([]);

  useEffect(() => {
    apiFetch(`/api/admin/supplier-payments/days/${date}/bulk-orders`).then(d => {
      if (!d.success) return;
      const supplierBulks = (d.data || []).filter(bulk => {
        const key = bulk.supplierBranchId || bulk.supplierName || "unknown";
        return key === decodedKey;
      });
      if (supplierBulks.length > 0) {
        const first = supplierBulks[0];
        setSupplier({ name: first.supplierName, company: first.supplierCompany, phone: first.supplierPhone, email: first.supplierEmail, bank: first.supplierBank });
      }
      setBulks(supplierBulks);
    }).finally(() => setLoading(false));
  }, [date, decodedKey]);

  if (loading) return <Loader />;

  const releasedBulks = bulks.filter(b => (b.buyerOrders || []).some(bo => bo.status === "released"));
  const totalReleased = releasedBulks.reduce((s, b) => s + (b.totalReleased || 0), 0);
  const totalInvoices = releasedBulks.reduce((s, b) => s + (b.buyerOrders || []).filter(bo => bo.status === "released").length, 0);

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">{supplier?.name || "Supplier"}</h1>
        <p className="text-[11px] text-brand-muted mt-[2px]">
          {supplier?.company} · {fmtDate(date)} · {releasedBulks.length} bulk order{releasedBulks.length !== 1 ? "s" : ""} · {totalInvoices} invoice{totalInvoices !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Info Strip */}
      <div className="bg-white border border-brand-border rounded-[16px] px-5 py-4 mb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] text-brand-muted m-0 mb-1">Total Released to Supplier</p>
          <p className="text-[22px] font-extrabold text-brand-dark m-0">{fmtAmt(Math.round(totalReleased * 100) / 100)}</p>
        </div>
        {supplier?.bank && (
          <div className="text-right">
            <p className="text-[10px] text-brand-muted m-0 mb-1">Bank Details</p>
            <p className="text-[13px] font-semibold text-brand-dark m-0 mb-[2px]">{supplier.bank.bankName}</p>
            <p className="text-[11px] text-brand-gray m-0">Account: {supplier.bank.accountNumber}</p>
            <p className="text-[11px] text-brand-gray m-0">IBAN: {supplier.bank.iban}</p>
          </div>
        )}
      </div>

      {/* Contact */}
      {(supplier?.phone || supplier?.email) && (
        <div className="bg-white border border-brand-border rounded-[16px] px-4 py-3 mb-4 flex gap-6 flex-wrap">
          {supplier.phone && (
            <div>
              <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Phone</p>
              <p className="text-[12px] font-semibold text-brand-dark m-0">{supplier.phone}</p>
            </div>
          )}
          {supplier.email && (
            <div>
              <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Email</p>
              <p className="text-[12px] font-semibold text-brand-dark m-0">{supplier.email}</p>
            </div>
          )}
        </div>
      )}

      {/* Bulk Orders */}
      {releasedBulks.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-[16px] p-10 text-center">
          <p className="text-brand-muted text-[13px] m-0">No released payments found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {releasedBulks.map((bulk, i) => {
            const relOrders = (bulk.buyerOrders || []).filter(bo => bo.status === "released");
            const bulkTotal = relOrders.reduce((s, bo) => s + (bo.amount || 0), 0);

            return (
              <div key={bulk.bulkOrderId || i} className="bg-white border border-brand-border rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)]">

                {/* Bulk Header */}
                <div className="flex items-center gap-3 px-4 py-4 bg-brand-lighter border-b border-brand-border flex-wrap">
                  {bulk.image
                    ? <img src={bulk.image} alt="" className="w-10 h-10 rounded-[8px] object-cover shrink-0" />
                    : <div className="w-10 h-10 rounded-[8px] bg-brand-border shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-[13px] font-bold text-brand-dark m-0">{bulk.item} — {bulk.country}</p>
                      <span className="text-[10px] font-mono bg-white text-brand-gray px-2 py-[2px] rounded-[4px] border border-brand-border">{bulk.orderRef}</span>
                    </div>
                    <p className="text-[10px] text-brand-muted m-0">
                      {bulk.totalQuantity?.toLocaleString()} {bulk.unit}
                      {bulk.winningPrice && ` · Win price: QAR ${bulk.winningPrice}`}
                      {` · ${relOrders.length} invoice${relOrders.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-brand-muted m-0 mb-1">Released</p>
                    <p className="text-[15px] font-extrabold text-brand-dark m-0">{fmtAmt(Math.round(bulkTotal * 100) / 100)}</p>
                  </div>
                </div>

                {/* Invoice Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#FFEDD5]">
                        {["Invoice No.", "Buyer", "Qty", "Amount", "Status"].map(h => (
                          <th key={h} className="px-4 py-[9px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {relOrders.map((bo, j) => (
                        <tr key={j} className="border-b border-[#fdf0ea] last:border-0 hover:bg-[rgba(241,90,33,0.03)]">
                          <td className="px-4 py-[10px] font-mono text-[11px] font-semibold text-brand-gray">{bo.invoiceNumber || "—"}</td>
                          <td className="px-4 py-[10px] text-[12px] text-brand-gray">{bo.buyerName || "—"}</td>
                          <td className="px-4 py-[10px] text-[12px] text-brand-dark">{bo.quantity} {bulk.unit}</td>
                          <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{fmtAmt(bo.amount)}</td>
                          <td className="px-4 py-[10px]">
                            <span className="px-2 py-[2px] rounded-[20px] text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                              Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal */}
                <div className="flex justify-end px-4 py-3 bg-brand-lighter border-t border-brand-border">
                  <p className="text-[11px] text-brand-muted m-0">
                    Subtotal: <span className="font-bold text-brand-dark">{fmtAmt(Math.round(bulkTotal * 100) / 100)}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grand Total */}
      <div className="mt-4 bg-white border border-brand-border rounded-[16px] px-5 py-4 flex justify-end">
        <div className="text-right">
          <p className="text-[11px] text-brand-muted m-0 mb-1">Total paid to {supplier?.name}</p>
          <p className="text-[20px] font-extrabold text-brand-dark m-0">{fmtAmt(Math.round(totalReleased * 100) / 100)}</p>
        </div>
      </div>
    </div>
  );
}