
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const CACHE_TTL = 3 * 60 * 1000;
const cacheSet  = (k, d) => localStorage.setItem(k, JSON.stringify({ ts: Date.now(), data: d }));
const cacheGet  = (k) => { try { const r = JSON.parse(localStorage.getItem(k)); if (!r) return null; return { data: r.data, stale: Date.now() - r.ts > CACHE_TTL }; } catch { return null; } };
const fmtAmt    = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const fmtDate   = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_CFG = {
  bidding:   { label: "Live",      bg: "bg-blue-50",  text: "text-blue-700",  border: "border-blue-200"  },
  awarded:   { label: "Awarded",   bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  ready:     { label: "Ready",     bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  cancelled: { label: "Cancelled", bg: "bg-red-50",   text: "text-red-600",   border: "border-red-200"   },
};

const BID_STATUS_CFG = {
  won:     { bg: "bg-green-50",  text: "text-green-700" },
  lost:    { bg: "bg-red-50",    text: "text-red-600"   },
  ignored: { bg: "bg-gray-100",  text: "text-gray-500"  },
  missed:  { bg: "bg-amber-50",  text: "text-amber-700" },
  pending: { bg: "bg-blue-50",   text: "text-blue-700"  },
};

const PAYMENT_STATUS_CFG = {
  paid:    { bg: "bg-green-50", text: "text-green-700" },
  partial: { bg: "bg-amber-50", text: "text-amber-700" },
  unpaid:  { bg: "bg-gray-50",  text: "text-gray-500"  },
  overdue: { bg: "bg-red-50",   text: "text-red-600"   },
};

export default function BiddingDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDetail = (background = false) => {
    const key    = `biddingDetail_${id}`;
    const cached = cacheGet(key);
    if (!background && cached) { setData(cached.data); setLoading(false); if (!cached.stale) return; setRefreshing(true); }
    else if (!background) setLoading(true);
    else setRefreshing(true);
    apiFetch(`/api/admin/bulk-orders/${id}`)
      .then(d => { if (d.success) { setData(d.data); cacheSet(key, d.data); } })
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { loadDetail(); }, [id]);

  if (loading) return <Loader />;
  if (!data)   return <div className="flex items-center justify-center h-[60vh] text-brand-muted">Not found</div>;

  const cfg = STATUS_CFG[data.status] || { label: data.status, bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };

  const sortedBids = [...(data.bids || [])].sort((a, b) => {
    if (a.isWinner && !b.isWinner) return -1;
    if (!a.isWinner && b.isWinner) return 1;
    return (a.pricePerUnit ?? Infinity) - (b.pricePerUnit ?? Infinity);
  });

  const lowestBid  = sortedBids[0]?.pricePerUnit;
  const highestBid = sortedBids[sortedBids.length - 1]?.pricePerUnit;

  // Total revenue — sirf real invoice grandTotal ka sum, koi client-side % estimate nahi
  const totalQty     = data.buyerOrders.reduce((s, o) => s + (o.quantity || 0), 0);
  const invoicedOrders = data.buyerOrders.filter(o => o.grandTotal != null);
  const totalRevenue = invoicedOrders.reduce((s, o) => s + (o.grandTotal || 0), 0);

  return (
    <div className="max-w-[1500px]">

      {/* Header Card */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          {data.image
            ? <img src={data.image} alt={data.item} className="w-14 h-14 rounded-[12px] object-cover shrink-0" />
            : <div className="w-14 h-14 rounded-[12px] bg-brand-lighter shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-[15px] font-bold text-brand-dark m-0">{data.item} — {data.country}</h2>
              <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{cfg.label}</span>
              {data.isLate   && <span className="px-2 py-[2px] rounded-[20px] text-[10px] bg-red-50 text-red-600 border border-red-200">⚠ Late</span>}
              {refreshing    && <span className="text-[10px] text-brand-primary font-semibold">● syncing…</span>}
            </div>
            <p className="text-[11px] text-brand-muted m-0">
              {data.totalQuantity?.toLocaleString()} {data.unit} · Bid date: {fmtDate(data.bidDate)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-brand-muted m-0 mb-1">Winning Price</p>
            <p className="text-[20px] font-extrabold text-brand-primary m-0">
              {data.winningPrice != null ? `QAR ${data.winningPrice}` : "—"}
            </p>
            <p className="text-[10px] text-brand-muted m-0">per {data.unit}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          ["Total Buyers", data.totalBuyers],
          ["Total Bids",   data.totalBids],
          ["Price Range",  data.minPrice != null ? `${data.minPrice} – ${data.maxPrice}` : "—"],
          ["Retry Count",  data.retryCount],
        ].map(([label, value]) => (
          <div key={label} className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] p-4 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
            <p className="text-[11px] text-brand-muted m-0 mb-1">{label}</p>
            <p className="text-[18px] font-extrabold text-brand-primary m-0">{value}</p>
          </div>
        ))}
      </div>

      {/* Winner */}
      {data.winner && (
        <div className="bg-brand-primary rounded-[10px] p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[11px] text-white font-bold uppercase m-0">Winner</p>
          </div>
          <div className="flex gap-6 flex-wrap">
            {[["Name", data.winner.name], ["Company", data.winner.companyName], ["Email", data.winner.email], ["Phone", data.winner.phone]].map(([l, v]) => (
              <div key={l}>
                <p className="text-[10px] text-white/80 m-0 mb-[2px]">{l}</p>
                <p className="text-[12px] font-semibold text-white m-0">{v || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Supplier Bids */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-brand-border flex-wrap gap-2">
          <div>
            <p className="text-[13px] font-bold text-brand-dark m-0">All Supplier Bids ({data.totalBids})</p>
            <p className="text-[11px] text-brand-muted m-0 mt-[2px]">
              {sortedBids.length > 0 && data.winningPrice != null
                ? `Winning: QAR ${data.winningPrice} · Range: QAR ${lowestBid} – QAR ${highestBid}`
                : "No bids placed"}
            </p>
          </div>
          <span className="text-[10px] bg-white border border-brand-border text-brand-muted px-3 py-[4px] rounded-[20px]">
            Sorted: winner first, then by price ↑
          </span>
        </div>

        {sortedBids.length === 0 ? (
          <p className="text-center py-8 text-brand-muted text-[12px]">No bids placed</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["#", "Supplier", "Company", "Bid Price", "vs Winning", "Status"].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedBids.map((bid, i) => {
                  const bc   = BID_STATUS_CFG[bid.status] || { bg: "bg-gray-100", text: "text-gray-600" };
                  const diff = (bid.pricePerUnit != null && data.winningPrice != null) ? bid.pricePerUnit - data.winningPrice : null;
                  return (
                    <tr key={i} className={`border-b border-[#fdf0ea] transition-colors
                      ${bid.isWinner ? "bg-brand-primary" : "hover:bg-[rgba(241,90,33,0.05)]"}`}>
                      <td className={`px-4 py-[10px] text-[11px] font-bold ${bid.isWinner ? "text-white" : "text-brand-muted"}`}>
                        {i + 1}
                      </td>
                      <td className={`px-4 py-[10px] text-[12px] ${bid.isWinner ? "font-bold text-white" : "font-semibold text-brand-dark"}`}>
                        {bid.supplierName || "—"}
                      </td>
                      <td className={`px-4 py-[10px] text-[12px] ${bid.isWinner ? "text-white/80" : "text-brand-gray"}`}>
                        {bid.companyName || "—"}
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className={`text-[12px] font-bold ${bid.isWinner ? "text-white" : "text-brand-dark"}`}>
                          {bid.pricePerUnit != null ? `QAR ${bid.pricePerUnit}` : "—"}
                        </span>
                        <span className={`text-[10px] ml-1 ${bid.isWinner ? "text-white/70" : "text-brand-muted"}`}>
                          / {data.unit}
                        </span>
                      </td>
                      <td className="px-4 py-[10px]">
                        {diff === null
                          ? <span className={bid.isWinner ? "text-white/80 text-[11px]" : "text-[11px] text-brand-muted"}>—</span>
                          : diff === 0
                          ? <span className="text-[11px] text-white font-semibold">Winner</span>
                          : <span className="text-[11px] text-red-500 font-semibold">+QAR {diff.toFixed(2)}</span>}
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold capitalize
                          ${bid.isWinner ? "bg-white/20 text-white" : `${bc.bg} ${bc.text}`}`}>
                          {bid.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buyer Orders — real invoice amounts (grandTotal), koi client-side % estimate nahi */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-brand-border flex-wrap gap-2">
          <p className="text-[13px] font-bold text-brand-dark m-0">Buyer Orders ({data.totalBuyers})</p>
        </div>

        {data.buyerOrders.length === 0 ? (
          <p className="text-center py-8 text-brand-muted text-[12px]">No buyer orders</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["Invoice No", "Buyer", "Company", "Quantity", "Winning Price", "Invoice Amount", "Payment", "Status"].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.buyerOrders.map((o, i) => {
                  const pc = PAYMENT_STATUS_CFG[o.paymentStatus] || { bg: "bg-gray-50", text: "text-gray-500" };
                  return (
                    <tr key={i} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                      <td className="px-4 py-[10px] text-[11px] font-semibold text-brand-dark">{o.invoiceNumber || "—"}</td>
                      <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{o.buyerName || "—"}</td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-gray">{o.companyName || "—"}</td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">{o.quantity} {data.unit}</td>
                      <td className="px-4 py-[10px] text-[11px] text-brand-gray">
                        {data.winningPrice != null ? `QAR ${data.winningPrice} / ${data.unit}` : "—"}
                      </td>
                      <td className="px-4 py-[10px]">
                        {o.grandTotal != null
                          ? <span className="text-[12px] font-bold text-brand-dark">{fmtAmt(o.grandTotal)}</span>
                          : <span className="text-[11px] text-brand-muted">Invoice pending</span>}
                      </td>
                      <td className="px-4 py-[10px]">
                        {o.paymentStatus
                          ? <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold capitalize ${pc.bg} ${pc.text}`}>{o.paymentStatus}</span>
                          : <span className="text-[11px] text-brand-muted">—</span>}
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className="px-2 py-[2px] rounded-[20px] text-[10px] font-semibold bg-gray-50 text-gray-500 capitalize">
                          {o.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Total Row — real revenue sum, not an estimate */}
        {data.buyerOrders.length > 0 && (
          <div className="flex justify-end gap-8 px-4 md:px-6 py-3 border-t border-brand-border bg-brand-lighter flex-wrap">
            <div className="text-right">
              <p className="text-[10px] text-brand-muted m-0 mb-1">Total Quantity</p>
              <p className="text-[14px] font-extrabold text-brand-dark m-0">{totalQty.toLocaleString()} {data.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-brand-muted m-0 mb-1">
                Total Invoiced Revenue {invoicedOrders.length < data.buyerOrders.length && `(${invoicedOrders.length}/${data.buyerOrders.length} invoiced)`}
              </p>
              <p className="text-[14px] font-extrabold text-brand-primary m-0">{fmtAmt(totalRevenue)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
