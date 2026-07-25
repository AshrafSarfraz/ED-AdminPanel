

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
  }).then(r => r.json());

const fmtAmt  = (n) => `QAR ${Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2 })}`;
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_CFG = {
  pending:                  { label: "Pending",           bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  supplier_accepted:        { label: "Supplier Accepted", bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  supplier_rejected:        { label: "Supplier Rejected", bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200"    },
  resolved_cancelled:       { label: "Cancelled",         bg: "bg-gray-50",   text: "text-gray-500",   border: "border-gray-200"   },
  resolved_supplier_guilty: { label: "Supplier Guilty",   bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200"    },
  resolved_rider_guilty:    { label: "Rider Guilty",      bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
};

// ─── Screen 1: Return Orders List ────────────────────────
export function AdminReturnOrders() {
  const navigate  = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);

  const load = () => {
    setLoading(true);
    let q = `page=${page}&limit=20`;
    if (status) q += `&status=${status}`;
    apiFetch(`/api/returns/admin/all?${q}`)
      .then(d => { if (d.success) { setReturns(d.data); setTotal(d.total); setPages(d.pages); } })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status, page]);
  useEffect(() => { setPage(1); }, [status]);

  const filters      = ["", "pending", "supplier_accepted", "supplier_rejected", "resolved_cancelled", "resolved_supplier_guilty", "resolved_rider_guilty"];
  const filterLabels = { "": "All", ...Object.fromEntries(Object.entries(STATUS_CFG).map(([k,v]) => [k, v.label])) };

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Return Orders</h1>
          <p className="text-[11px] text-brand-muted mt-[2px]">{total} total</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto border-b border-brand-border px-4 md:px-6 pt-3 gap-1">
          {filters.map(f => (
            <button key={f} onClick={() => setStatus(f)}
              className={`px-3 py-[10px] border-none whitespace-nowrap text-[12px] cursor-pointer bg-transparent transition-all
                ${status === f ? "font-bold text-brand-primary border-b-2 border-brand-primary" : "text-brand-muted font-medium"}`}>
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
          {returns.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[12px]">No returns found</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FFEDD5]">
                  {["Buyer", "Supplier", "Invoice", "Amount", "Subject", "Submitted", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map(r => {
                  const cfg        = STATUS_CFG[r.status] || { label: r.status, bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
                  const isResolved = r.status.startsWith("resolved_");
                  return (
                    <tr key={r._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                      <td className="px-4 py-[10px]">
                        <p className="text-[12px] font-semibold text-brand-dark m-0">{r.buyerBranchId?.managerName || "—"}</p>
                        <p className="text-[10px] text-brand-muted m-0">{r.buyerBranchId?.companyName}</p>
                      </td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-gray">{r.supplierBranchId?.managerName || "—"}</td>
                      <td className="px-4 py-[10px] text-[11px] text-brand-dark">{r.invoiceId?.invoiceNumber || "—"}</td>
                      <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">{fmtAmt(r.orderGrandTotal)}</td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-gray max-w-[150px] truncate">{r.subject}</td>
                      <td className="px-4 py-[10px] text-[11px] text-brand-gray">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-[10px]">
                        <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-[10px]">
                        <button onClick={() => navigate(`/returns/${r._id}`)}
                          className={`px-3 py-[4px] border-none rounded-[6px] text-[11px] font-semibold cursor-pointer
                            ${isResolved ? "bg-gray-50 text-gray-500" : "bg-blue-50 text-blue-700"}`}>
                          {isResolved ? "View" : "Review"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-brand-border">
            <span className="text-[11px] text-brand-muted">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-4 py-[6px] bg-white border border-brand-border rounded-[8px] text-[11px] cursor-pointer disabled:opacity-40 text-brand-gray">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
                className="px-4 py-[6px] bg-white border border-brand-border rounded-[8px] text-[11px] cursor-pointer disabled:opacity-40 text-brand-gray">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen 2: Return Detail ──────────────────────────────
export function AdminReturnDetail() {
  const { returnId } = useParams();
  const navigate     = useNavigate();
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [note,       setNote]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lightbox,   setLightbox]   = useState(null);

  useEffect(() => {
    apiFetch(`/api/returns/admin/all?limit=100`)
      .then(d => { if (d.success) { const found = d.data.find(r => r._id === returnId); if (found) setData(found); } })
      .finally(() => setLoading(false));
  }, [returnId]);

  const resolve = async (decision) => {
    if (decision !== "cancel" && !note.trim()) { alert("Please add a note"); return; }
    if (!confirm(`Are you sure? Decision: ${decision}`)) return;
    setSubmitting(true);
    const d = await apiFetch(`/api/returns/admin/${returnId}/resolve`, {
      method: "PUT", body: JSON.stringify({ decision, note }),
    });
    if (d.success) { alert("✅ " + d.message); navigate("/returns"); }
    else alert("Error: " + d.message);
    setSubmitting(false);
  };

  if (loading) return <Loader />;
  if (!data)   return <div className="flex items-center justify-center h-[60vh] text-brand-muted text-[13px]">Not found</div>;

  const cfg        = STATUS_CFG[data.status] || { label: data.status, bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
  const isResolved = data.status.startsWith("resolved_");

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Return Request</h1>
          <p className="text-[11px] text-brand-muted mt-[2px]">Submitted {fmtDate(data.createdAt)}</p>
        </div>
        <span className={`px-3 py-[4px] rounded-[20px] text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {cfg.label}
        </span>
      </div>

      {/* Buyer + Supplier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {[
          { label: "Buyer",    d: data.buyerBranchId    },
          { label: "Supplier", d: data.supplierBranchId },
        ].map(({ label, d }) => (
          <div key={label} className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] p-4 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
            <p className="text-[10px] text-brand-muted font-bold uppercase m-0 mb-2">{label}</p>
            <p className="text-[13px] font-semibold text-brand-dark m-0 mb-1">{d?.managerName}</p>
            <p className="text-[11px] text-brand-gray m-0">{d?.companyName}</p>
            <p className="text-[11px] text-brand-gray m-0">{d?.email}</p>
          </div>
        ))}
      </div>

      {/* Order Details */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] p-4 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
        <p className="text-[10px] text-brand-muted font-bold uppercase m-0 mb-3">Order Details</p>
        {[
          ["Invoice",      data.invoiceId?.invoiceNumber],
          ["Order Amount", fmtAmt(data.orderGrandTotal)],
          ["Penalty (2%)", fmtAmt(data.penaltyAmount)],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between py-[7px] border-b border-brand-border last:border-0">
            <span className="text-[12px] text-brand-gray">{label}</span>
            <span className="text-[12px] font-semibold text-brand-dark">{val}</span>
          </div>
        ))}
      </div>

      {/* Return Request */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] p-4 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
        <p className="text-[10px] text-brand-muted font-bold uppercase m-0 mb-3">Return Request</p>
        <p className="text-[13px] font-bold text-brand-dark m-0 mb-2">{data.subject}</p>
        <p className="text-[12px] text-brand-gray m-0 mb-3 leading-relaxed">{data.description}</p>
        {data.images?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {data.images.map((img, i) => (
              <img key={i} src={img} alt={`evidence-${i}`} onClick={() => setLightbox(img)}
                className="w-20 h-20 rounded-[8px] object-cover cursor-zoom-in border border-brand-border" />
            ))}
          </div>
        )}
      </div>

      {/* Supplier Response */}
      {data.supplierNote && (
        <div className={`border rounded-[16px] p-4 mb-4 ${data.status === "supplier_accepted" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <p className={`text-[11px] font-bold m-0 mb-2 ${data.status === "supplier_accepted" ? "text-green-700" : "text-red-600"}`}>
            Supplier Response — {data.status === "supplier_accepted" ? "Accepted ✅" : "Rejected ❌"}
          </p>
          <p className="text-[12px] text-brand-dark m-0">{data.supplierNote}</p>
          <p className="text-[10px] text-brand-muted mt-1 m-0">{fmtDate(data.supplierRespondedAt)}</p>
        </div>
      )}

      {/* Resolution */}
      {isResolved && (
        <div className="bg-green-50 border border-green-200 rounded-[16px] p-4 mb-4">
          <p className="text-[11px] font-bold text-green-700 m-0 mb-2">Resolved — {cfg.label}</p>
          {data.adminNote && <p className="text-[12px] text-brand-dark m-0">{data.adminNote}</p>}
          <p className="text-[10px] text-brand-muted mt-1 m-0">{fmtDate(data.adminResolvedAt)}</p>
          {data.penaltyApplied    && <p className="text-[12px] text-red-600 mt-2 m-0">Penalty: {fmtAmt(data.penaltyAmount)} applied</p>}
          {data.riderDebtRecorded && <p className="text-[12px] text-amber-700 mt-1 m-0">Rider debt: {fmtAmt(data.riderDebtAmount)} recorded</p>}
        </div>
      )}

      {/* Admin Note */}
      {!isResolved && (
        <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] p-4 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
          <p className="text-[10px] text-brand-muted font-bold uppercase m-0 mb-2">Admin Note</p>
          <textarea
            value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add note (required for supplier/rider guilty)..."
            className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none resize-vertical min-h-[80px] bg-white focus:border-brand-primary transition-all"
          />
        </div>
      )}

      {/* Action Buttons */}
      {!isResolved && (
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => resolve("cancel")} disabled={submitting}
            className="flex-1 py-[10px] bg-gray-100 text-brand-gray border border-brand-border rounded-[10px] text-[12px] font-semibold cursor-pointer min-w-[130px] border-none">
            Cancel Return
          </button>
          <button onClick={() => resolve("supplier_guilty")} disabled={submitting}
            className="flex-1 py-[10px] bg-red-50 text-red-600 border border-red-200 rounded-[10px] text-[12px] font-semibold cursor-pointer min-w-[130px]">
            Supplier Guilty
          </button>
          <button onClick={() => resolve("rider_guilty")} disabled={submitting}
            className="flex-1 py-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-[10px] text-[12px] font-semibold cursor-pointer min-w-[130px]">
            Rider Guilty
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center cursor-zoom-out">
          <img src={lightbox} className="max-w-[90vw] max-h-[90vh] rounded-[12px] object-contain" />
        </div>
      )}
    </div>
  );
}

