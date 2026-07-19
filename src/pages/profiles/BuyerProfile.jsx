// 📁 pages/profiles/BuyerProfile.jsx
// Buyer ka poora record — total orders, delivered/returned/cancelled breakdown,
// purchase value, paid/due, aur return history — sab ek jagah.
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import StatCard from "../../components/StatCard";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt  = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const RETURN_STATUS_CFG = {
  pending:                  { label: "Pending",           bg: "bg-amber-50", text: "text-amber-700" },
  supplier_accepted:        { label: "Supplier Accepted", bg: "bg-blue-50",  text: "text-blue-700"  },
  supplier_rejected:        { label: "Supplier Rejected", bg: "bg-red-50",   text: "text-red-600"   },
  resolved_cancelled:       { label: "Cancelled",         bg: "bg-gray-50",  text: "text-gray-500"  },
  resolved_supplier_guilty: { label: "Supplier Guilty",   bg: "bg-red-50",   text: "text-red-600"   },
  resolved_rider_guilty:    { label: "Rider Guilty",      bg: "bg-amber-50", text: "text-amber-700" },
};

export default function BuyerProfile() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/admin/buyer-profile/${branchId}`)
      .then(d => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  }, [branchId]);

  if (loading) return <Loader />;
  if (!data) return <div className="flex items-center justify-center h-[60vh] text-brand-muted text-[13px]">Buyer not found</div>;

  const { buyer, orderSummary, purchaseSummary, returnSummary, recentOrders, recentReturns } = data;

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-bold text-brand-dark m-0">{buyer.managerName}</h1>
          <p className="text-[12px] text-brand-muted mt-[2px]">{buyer.companyName} · {buyer.email} · {buyer.phone}</p>
          <p className="text-[11px] text-brand-muted mt-[2px]">Joined {fmtDate(buyer.joinedAt)} · {buyer.company?.brandName}</p>
        </div>
        <button onClick={() => navigate(`/payments/buyers/${branchId}`)}
          className="px-4 py-[8px] bg-brand-primary text-white border-none rounded-[8px] text-[12px] font-semibold cursor-pointer">
          View Invoices →
        </button>
      </div>

      {/* Order Summary */}
      <p className="text-[12px] font-bold text-brand-dark mb-2">Order History</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard value={orderSummary.totalOrders}      label="Total Orders" />
        <StatCard value={orderSummary.delivered}         label="Delivered" />
        <StatCard value={orderSummary.returned}           label="Returned" />
        <StatCard value={orderSummary.cancelled}          label="Cancelled" />
      </div>

      {/* Purchase Summary */}
      <p className="text-[12px] font-bold text-brand-dark mb-2">Purchase & Payments</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard value={fmtAmt(purchaseSummary.totalPurchaseValue)} label="Total Purchase Value" />
        <StatCard value={fmtAmt(purchaseSummary.totalPaid)}          label="Total Paid" />
        <StatCard value={fmtAmt(purchaseSummary.totalDue)}           label="Total Due" />
        <StatCard value={purchaseSummary.invoiceCount}               label="Invoices" sub={`${purchaseSummary.unpaidCount} unpaid`} />
      </div>

      {/* Return Summary */}
      <p className="text-[12px] font-bold text-brand-dark mb-2">Returns</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <StatCard value={returnSummary.totalReturnsRequested} label="Total Requested" />
        <StatCard value={returnSummary.pending}                label="Pending" />
        <StatCard value={returnSummary.resolvedSupplierGuilty} label="Supplier Guilty" />
        <StatCard value={returnSummary.resolvedRiderGuilty}    label="Rider Guilty" />
        <StatCard value={returnSummary.resolvedCancelled}      label="Cancelled" />
      </div>

      {/* Recent Orders + Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-brand-border rounded-[16px] overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-border">
            <p className="text-[13px] font-bold text-brand-dark m-0">Recent Orders</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {recentOrders.length === 0 ? (
              <p className="text-center py-8 text-brand-muted text-[12px]">No orders yet</p>
            ) : recentOrders.map(o => (
              <div key={o._id} className="flex items-center justify-between px-4 py-[10px] border-b border-brand-border last:border-0">
                <div>
                  <p className="text-[12px] font-semibold text-brand-dark m-0">{o.platformItemId?.name || "—"}</p>
                  <p className="text-[10px] text-brand-muted m-0">{o.countryId?.name} · {o.quantity} · {fmtDate(o.createdAt)}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-[2px] rounded-[10px] bg-brand-lighter text-brand-gray">{o.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-[16px] overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-border">
            <p className="text-[13px] font-bold text-brand-dark m-0">Recent Returns</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {recentReturns.length === 0 ? (
              <p className="text-center py-8 text-brand-muted text-[12px]">No returns yet</p>
            ) : recentReturns.map(r => {
              const cfg = RETURN_STATUS_CFG[r.status] || { label: r.status, bg: "bg-gray-50", text: "text-gray-500" };
              return (
                <div key={r._id} className="flex items-center justify-between px-4 py-[10px] border-b border-brand-border last:border-0">
                  <div>
                    <p className="text-[12px] font-semibold text-brand-dark m-0">{r.subject}</p>
                    <p className="text-[10px] text-brand-muted m-0">{r.invoiceId?.invoiceNumber} · {fmtDate(r.createdAt)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-[2px] rounded-[10px] ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
