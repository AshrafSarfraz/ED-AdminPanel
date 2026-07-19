import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import Loader from "../../components/Loader";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    ...opts,
  }).then(r => r.json());

const CACHE_TTL = 2 * 60 * 1000;
const cacheSet  = (k, d) => localStorage.setItem(k, JSON.stringify({ ts: Date.now(), data: d }));
const cacheGet  = (k) => { try { const r = JSON.parse(localStorage.getItem(k)); if (!r) return null; return { data: r.data, stale: Date.now() - r.ts > CACHE_TTL }; } catch { return null; } };

const STATUS_CFG = {
  pending:          { label: "Pending",     bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  in_bidding:       { label: "In Bidding",  bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  won:              { label: "Won",         bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  packed:           { label: "Packed",      bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  ready_for_pickup: { label: "Ready",       bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  delivered:        { label: "Delivered",   bg: "bg-green-50",  text: "text-green-800",  border: "border-green-300"  },
  cancelled:        { label: "Cancelled",   bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200"    },
  returned:         { label: "Returned",    bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200"   },
  return_requested: { label: "Return Req.", bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
};

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_TABS = [
  { key: "all",              label: "All"        },
  { key: "pending",          label: "Pending"    },
  { key: "in_bidding",       label: "In Bidding" },
  { key: "won",              label: "Won"        },
  { key: "packed",           label: "Packed"     },
  { key: "ready_for_pickup", label: "Ready"      },
  { key: "delivered",        label: "Delivered"  },
  { key: "cancelled",        label: "Cancelled"  },
];

export default function AdminOrders() {
  const navigate     = useNavigate();
  const [orders,     setOrders]     = useState([]);
  const [summary,    setSummary]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status,     setStatus]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [date,       setDate]       = useState("");
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [cancelModal,  setCancelModal]  = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling,   setCancelling]   = useState(false);
  const abortRef = useRef(null);

  const load = (bg = false) => {
    const key    = `adminOrders_${status}_${date}_${page}`;
    const cached = cacheGet(key);
    if (!bg && cached) {
      setOrders(cached.data.orders); setTotal(cached.data.total);
      setPages(cached.data.pages);   setSummary(cached.data.summary || {});
      setLoading(false);
      if (!cached.stale) return;
      setRefreshing(true);
    } else if (!bg) { if (!cached) setLoading(true); else setRefreshing(true); }
    else setRefreshing(true);

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let q = `page=${page}&limit=20`;
    if (status !== "all") q += `&status=${status}`;
    if (date)             q += `&date=${date}`;

    apiFetch(`/api/admin/orders?${q}`)
      .then(d => {
        if (ctrl.signal.aborted || !d.success) return;
        setOrders(d.data); setTotal(d.total); setPages(d.pages); setSummary(d.summary || {});
        cacheSet(key, { orders: d.data, total: d.total, pages: d.pages, summary: d.summary });
      })
      .finally(() => { if (!ctrl.signal.aborted) { setLoading(false); setRefreshing(false); } });
  };

  useEffect(() => { load(); return () => abortRef.current?.abort(); }, [status, date, page]);
  useEffect(() => { setPage(1); }, [status, date]);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    const d = await apiFetch(`/api/admin/orders/${cancelModal.orderId}/cancel`, {
      method: "PUT", body: JSON.stringify({ reason: cancelReason }),
    });
    setCancelling(false);
    if (d.success) {
      setCancelModal(null); setCancelReason("");
      Object.keys(localStorage).filter(k => k.startsWith("adminOrders_")).forEach(k => localStorage.removeItem(k));
      load(true);
    } else alert(d.message || "Cancel failed");
  };

  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.buyerName?.toLowerCase().includes(q) ||
           o.companyName?.toLowerCase().includes(q) ||
           o.item?.toLowerCase().includes(q) ||
           o.invoiceNumber?.toLowerCase().includes(q) ||
           o._id?.toString().slice(-8).toUpperCase().includes(search.toUpperCase());
  });

  const nonCancellable = ["delivered", "returned", "cancelled"];

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Stat Cards */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <StatCard icon="cart"    value={summary.totalAll  ?? "—"} label="Total Orders"  active={status === "all"}       onClick={() => setStatus("all")}       />
        <StatCard icon="clock"   value={summary.pending   ?? "—"} label="Pending"       active={status === "pending"}   onClick={() => setStatus("pending")}   />
        <StatCard icon="check"   value={summary.delivered ?? "—"} label="Delivered"     active={status === "delivered"} onClick={() => setStatus("delivered")} />
        <StatCard icon="xcircle" value={summary.cancelled ?? "—"} label="Cancelled"     active={status === "cancelled"} onClick={() => setStatus("cancelled")} />
      </div> */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <StatCard   value={summary.totalAll  ?? "—"} label="Total Orders"  active={status === "all"}       onClick={() => setStatus("all")}       />
        <StatCard   value={summary.pending   ?? "—"} label="Pending"       active={status === "pending"}   onClick={() => setStatus("pending")}   />
        <StatCard   value={summary.delivered ?? "—"} label="Delivered"     active={status === "delivered"} onClick={() => setStatus("delivered")} />
        <StatCard  value={summary.cancelled ?? "—"} label="Cancelled"     active={status === "cancelled"} onClick={() => setStatus("cancelled")} />
      </div>


      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Orders</h1>
            <p className="text-[11px] text-brand-muted mt-[2px] flex items-center gap-2">
              {total} total
              {refreshing && <span className="text-brand-primary font-semibold">● syncing…</span>}
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-[7px] border border-brand-border rounded-[8px] text-[11px] outline-none bg-white focus:border-brand-primary transition-all"
            />
            {date && (
              <button onClick={() => setDate("")}
                className="px-3 py-[7px] bg-gray-100 text-brand-gray border-none rounded-[8px] text-[11px] cursor-pointer">✕</button>
            )}
            <button onClick={() => load(true)} disabled={refreshing}
              className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer disabled:opacity-60">
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 pb-3">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search buyer, company, item, order ref…"
            className="w-full px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex overflow-x-auto border-b border-brand-border px-4 md:px-6 gap-1">
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => setStatus(t.key)}
              className={`px-3 py-[10px] border-none whitespace-nowrap text-[12px] cursor-pointer bg-transparent transition-all
                ${status === t.key ? "font-bold text-brand-primary border-b-2 border-brand-primary" : "text-brand-muted font-medium"}`}>
              {t.label}
              {summary[t.key] != null && t.key !== "all" && (
                <span className="ml-1 text-[10px] text-brand-muted">({summary[t.key]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "580px" }}>
          {filteredOrders.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[12px]">No orders found</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FFEDD5]">
                  {["Bulk Id", "Invoice No", "Item", "Qty", "Bid Date", "Winning Price", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const cfg       = STATUS_CFG[o.status] || { label: o.status, bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
                  const canCancel = !nonCancellable.includes(o.status);
                  return (
                    <tr key={o._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                      <td className="px-4 py-[10px]">
                        <span className="font-mono text-[10px] text-brand-muted">{o._id?.toString().slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-[10px] text-[11px] font-semibold text-brand-dark">{o.invoiceNumber}</td>
                      <td className="px-4 py-[10px]">
                        <div className="flex items-center gap-2">
                          {o.image
                            ? <img src={o.image} alt={o.item} className="w-7 h-7 rounded-[6px] object-cover shrink-0" />
                            : <div className="w-7 h-7 rounded-[6px] bg-brand-lighter shrink-0" />
                          }
                          <div>
                            <p className="text-[12px] font-semibold text-brand-dark m-0">{o.item}</p>
                            <p className="text-[10px] text-brand-muted m-0">{o.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">
                        {o.quantity} <span className="text-brand-muted text-[10px]">{o.unit}</span>
                      </td>
                      <td className="px-4 py-[10px] text-[11px] text-brand-gray">{fmtDate(o.bidDate)}</td>
                      <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">
                        {o.winningPrice != null ? `QAR ${o.winningPrice}` : <span className="text-brand-muted">—</span>}
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-[10px]">
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/bidding/${o.bulkOrderId}`)} disabled={!o.bulkOrderId}
                            className="px-3 py-[4px] bg-blue-50 text-blue-700 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer disabled:opacity-30">
                            View
                          </button>
                          {canCancel && (
                            <button onClick={() => setCancelModal({ orderId: o._id, invoiceNumber: o.invoiceNumber })}
                              className="px-3 py-[4px] bg-red-50 text-red-600 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-brand-border flex-wrap gap-3">
          <span className="text-[11px] text-brand-muted">
            Showing {(page-1)*20+1}–{Math.min(page*20, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="w-7 h-7 rounded-[6px] border border-brand-border bg-white text-brand-gray text-[12px] cursor-pointer disabled:opacity-40">‹</button>
            {Array.from({ length: Math.min(pages,5) }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-[6px] border text-[12px] cursor-pointer
                  ${page===p ? "bg-brand-primary text-white border-brand-primary" : "border-brand-border bg-white text-brand-gray"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
              className="w-7 h-7 rounded-[6px] border border-brand-border bg-white text-brand-gray text-[12px] cursor-pointer disabled:opacity-40">›</button>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] px-4">
          <div className="bg-white rounded-[20px] p-8 w-full max-w-[440px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h3 className="text-[16px] font-bold text-brand-dark m-0 mb-2">Cancel Order</h3>
            <p className="text-[12px] text-brand-gray mb-4">
              Are you sure you want to cancel <strong>{cancelModal.invoiceNumber}</strong>?
            </p>
            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 border border-brand-border rounded-[8px] text-[12px] outline-none resize-vertical min-h-[80px] focus:border-brand-primary transition-all"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => { setCancelModal(null); setCancelReason(""); }}
                className="px-4 py-2 bg-gray-100 text-brand-gray border-none rounded-[8px] text-[12px] cursor-pointer">
                Go Back
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-[8px] text-[12px] font-bold cursor-pointer disabled:opacity-60">
                {cancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}