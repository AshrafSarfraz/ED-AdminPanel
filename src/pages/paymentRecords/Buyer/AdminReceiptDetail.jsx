// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// const BASE  = "https://el-distibutor-backend.onrender.com";
// const token = () => localStorage.getItem("adminToken");

// const apiFetch = (path, opts = {}) =>
//   fetch(`${BASE}${path}`, {
//     ...opts,
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
//   }).then(r => r.json());

// const fmtAmt  = (n) => `QAR ${Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2 })}`;
// const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// export default function AdminReceiptDetail() {
//   const { receiptId } = useParams();
//   const navigate      = useNavigate();

//   const [receipt,    setReceipt]    = useState(null);
//   const [loading,    setLoading]    = useState(true);
//   const [adminNote,  setAdminNote]  = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [imgOpen,    setImgOpen]    = useState(false);

//   const load = async () => {
//     // Get all receipts and find this one (no single receipt endpoint)
//     const data = await apiFetch(`/api/payments/admin/receipts?limit=100`);
//     if (data.success) {
//       const found = data.data.find(r => r._id === receiptId);
//       if (found) setReceipt(found);
//     }
//     setLoading(false);
//   };

//   useEffect(() => { load(); }, [receiptId]);

//   const handleApprove = async () => {
//     if (!confirm("Approve this payment receipt?")) return;
//     setSubmitting(true);
//     const data = await apiFetch(`/api/payments/admin/receipts/${receiptId}/approve`, {
//       method: "PUT",
//       body:   JSON.stringify({ adminNote: adminNote || null }),
//     });
//     if (data.success) {
//       alert(`✅ Approved! ${data.data.suppliersReleased} supplier invoices released.`);
//       navigate("/payments");
//     } else {
//       alert("Error: " + data.message);
//     }
//     setSubmitting(false);
//   };

//   const handleReject = async () => {
//     if (!adminNote.trim()) { alert("Please enter rejection reason."); return; }
//     if (!confirm("Reject this payment receipt?")) return;
//     setSubmitting(true);
//     const data = await apiFetch(`/api/payments/admin/receipts/${receiptId}/reject`, {
//       method: "PUT",
//       body:   JSON.stringify({ adminNote }),
//     });
//     if (data.success) {
//       alert("Receipt rejected.");
//       navigate("/payments");
//     } else {
//       alert("Error: " + data.message);
//     }
//     setSubmitting(false);
//   };

//   if (loading) return <p style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Loading...</p>;
//   if (!receipt) return <p style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Receipt not found</p>;

//   const isPending  = receipt.status === "pending";
//   const STATUS_CFG = {
//     pending:  { label: "Pending",  bg: "#fffbeb", color: "#d97706" },
//     approved: { label: "Approved", bg: "#f0fdf4", color: "#16a34a" },
//     rejected: { label: "Rejected", bg: "#fef2f2", color: "#dc2626" },
//   };
//   const cfg = STATUS_CFG[receipt.status] || STATUS_CFG.pending;

//   return (
//     <div style={{ maxWidth: "800px", margin: "0 auto" }}>
//       {/* Back */}
//       <button onClick={() => navigate("/payments")}
//         style={{ marginBottom: "20px", padding: "6px 14px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
//         ← Back
//       </button>

//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
//         <div>
//           <h1 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>Receipt Detail</h1>
//           <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Submitted {fmtDate(receipt.createdAt)}</p>
//         </div>
//         <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: cfg.bg, color: cfg.color }}>
//           {cfg.label}
//         </span>
//       </div>

//       {/* Buyer Info */}
//       <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
//         <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "12px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Buyer Info</p>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
//           {[
//             ["Manager",  receipt.buyerBranchId?.managerName],
//             ["Company",  receipt.buyerBranchId?.companyName || receipt.buyerCompanyId?.brandName],
//             ["Email",    receipt.buyerBranchId?.email],
//             ["Phone",    receipt.buyerBranchId?.phone],
//           ].map(([label, val]) => (
//             <div key={label}>
//               <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px" }}>{label}</p>
//               <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>{val || "—"}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Payment Info */}
//       <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
//         <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "12px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Info</p>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
//           <span style={{ fontSize: "14px", color: "#6b7280" }}>Total Amount</span>
//           <span style={{ fontSize: "22px", fontWeight: "700", color: "#111827" }}>{fmtAmt(receipt.totalAmount)}</span>
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
//           <span>Invoices covered</span>
//           <span>{receipt.invoiceIds?.length || 0}</span>
//         </div>
//         {receipt.note && (
//           <div style={{ marginTop: "12px", padding: "10px 14px", background: "#f9fafb", borderRadius: "8px", fontSize: "13px", color: "#374151" }}>
//             <span style={{ fontWeight: "500" }}>Note: </span>{receipt.note}
//           </div>
//         )}
//       </div>

//       {/* Invoices list */}
//       <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
//         <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "12px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Invoices</p>
//         {receipt.invoiceIds?.map((inv, i) => (
//           <div key={inv._id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < receipt.invoiceIds.length - 1 ? "1px solid #f3f4f6" : "none" }}>
//             <div>
//               <p style={{ fontSize: "13px", fontWeight: "500", margin: 0 }}>{inv.invoiceNumber || `Invoice ${i + 1}`}</p>
//               <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{inv.paymentStatus || "—"}</p>
//             </div>
//             <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>{fmtAmt(inv.grandTotal || inv.amountDue)}</span>
//           </div>
//         ))}
//       </div>

//       {/* Receipt Image */}
//       {receipt.receiptImage && (
//         <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
//           <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "12px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Receipt Image</p>
//           <img
//             src={receipt.receiptImage}
//             alt="receipt"
//             onClick={() => setImgOpen(true)}
//             style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "10px", cursor: "pointer", border: "1px solid #e5e7eb" }}
//           />
//           <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>Click to enlarge</p>
//         </div>
//       )}

//       {/* Lightbox */}
//       {imgOpen && (
//         <div onClick={() => setImgOpen(false)}
//           style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
//           <img src={receipt.receiptImage} alt="receipt" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "12px", objectFit: "contain" }} />
//         </div>
//       )}

//       {/* Admin Note */}
//       {isPending && (
//         <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
//           <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin Note</p>
//           <textarea
//             value={adminNote}
//             onChange={e => setAdminNote(e.target.value)}
//             placeholder="Add a note (required for rejection)..."
//             style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", resize: "vertical", minHeight: "80px", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
//           />
//         </div>
//       )}

//       {/* Rejected note */}
//       {receipt.status === "rejected" && receipt.adminNote && (
//         <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
//           <p style={{ fontSize: "12px", color: "#dc2626", fontWeight: "600", margin: "0 0 4px" }}>Rejection Reason</p>
//           <p style={{ fontSize: "13px", color: "#7f1d1d", margin: 0 }}>{receipt.adminNote}</p>
//         </div>
//       )}

//       {/* Approved info */}
//       {receipt.status === "approved" && (
//         <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
//           <p style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600", margin: "0 0 4px" }}>✅ Approved on {fmtDate(receipt.approvedAt)}</p>
//           <p style={{ fontSize: "12px", color: "#15803d", margin: 0 }}>{receipt.suppliersReleased} supplier invoices released · {fmtAmt(receipt.totalReleased)} released</p>
//           {receipt.adminNote && <p style={{ fontSize: "12px", color: "#15803d", margin: "4px 0 0" }}>Note: {receipt.adminNote}</p>}
//         </div>
//       )}

//       {/* Action Buttons */}
//       {isPending && (
//         <div style={{ display: "flex", gap: "12px" }}>
//           <button
//             onClick={handleApprove}
//             disabled={submitting}
//             style={{ flex: 1, padding: "12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
//           >
//             {submitting ? "Processing..." : "✅ Approve Payment"}
//           </button>
//           <button
//             onClick={handleReject}
//             disabled={submitting}
//             style={{ flex: 1, padding: "12px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
//           >
//             {submitting ? "Processing..." : "❌ Reject"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, ...opts }).then(r => r.json());

const fmtAmt  = (n) => `QAR ${Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_CFG = {
  pending:  { label: "Pending",  bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  approved: { label: "Approved", bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  rejected: { label: "Rejected", bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200"    },
};

export default function ReceiptDetail() {
  const { receiptId } = useParams();
  const navigate      = useNavigate();
  const [receipt,    setReceipt]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [adminNote,  setAdminNote]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imgOpen,    setImgOpen]    = useState(false);

  const load = async () => {
    const data = await apiFetch(`/api/payments/admin/receipts?limit=1000`);
    if (data.success) { const found = data.data.find(r => r._id === receiptId); if (found) setReceipt(found); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [receiptId]);

  const handleApprove = async () => {
    if (!window.confirm("Approve this payment receipt? Supplier invoices will be released.")) return;
    setSubmitting(true);
    const data = await apiFetch(`/api/payments/admin/receipts/${receiptId}/approve`, { method: "PUT", body: JSON.stringify({ adminNote: adminNote || null }) });
    setSubmitting(false);
    if (data.success) { alert(`✅ Approved! ${data.data.suppliersReleased} supplier invoice(s) released.`); navigate("/payments/receipts"); }
    else alert("Error: " + data.message);
  };

  const handleReject = async () => {
    if (!adminNote.trim()) { alert("Please enter a rejection reason."); return; }
    if (!window.confirm("Reject this receipt?")) return;
    setSubmitting(true);
    const data = await apiFetch(`/api/payments/admin/receipts/${receiptId}/reject`, { method: "PUT", body: JSON.stringify({ adminNote }) });
    setSubmitting(false);
    if (data.success) { alert("Receipt rejected."); navigate("/payments/receipts"); }
    else alert("Error: " + data.message);
  };

  if (loading) return <Loader />;
  if (!receipt) return <div className="flex items-center justify-center h-[60vh] text-brand-muted text-[13px]">Receipt not found</div>;

  const isPending = receipt.status === "pending";
  const cfg = STATUS_CFG[receipt.status] || STATUS_CFG.pending;

  return (
    <div className="max-w-[800px]">

      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Receipt Detail</h1>
          <p className="text-[11px] text-brand-muted mt-[2px]">Submitted {fmtDate(receipt.createdAt)}</p>
        </div>
        <span className={`px-3 py-[4px] rounded-[20px] text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {cfg.label}
        </span>
      </div>

      {/* Buyer + Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-white border border-brand-border rounded-[16px] p-4">
          <p className="text-[10px] text-brand-muted font-bold uppercase m-0 mb-3">Buyer Info</p>
          {[
            ["Manager", receipt.buyerBranchId?.managerName],
            ["Company", receipt.buyerBranchId?.companyName || receipt.buyerCompanyId?.brandName],
            ["Email",   receipt.buyerBranchId?.email],
            ["Phone",   receipt.buyerBranchId?.phone],
          ].map(([l, v]) => (
            <div key={l} className="mb-2 last:mb-0">
              <p className="text-[10px] text-brand-muted m-0 mb-[2px]">{l}</p>
              <p className="text-[13px] font-semibold text-brand-dark m-0">{v || "—"}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-brand-border rounded-[16px] p-4">
          <p className="text-[10px] text-brand-muted font-bold uppercase m-0 mb-3">Payment Info</p>
          <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-3">
            <span className="text-[12px] text-brand-gray">Total Amount</span>
            <span className="text-[20px] font-extrabold text-green-700">{fmtAmt(receipt.totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-brand-gray">Invoices covered</span>
            <span className="text-[12px] font-semibold text-brand-dark">{receipt.invoiceIds?.length || 0}</span>
          </div>
          {receipt.note && (
            <div className="mt-3 px-3 py-2 bg-brand-lighter rounded-[8px] text-[11px] text-brand-gray">
              <span className="font-semibold text-brand-dark">Note: </span>{receipt.note}
            </div>
          )}
          {receipt.status === "approved" && (
            <div className="mt-3 px-3 py-2 bg-green-50 rounded-[8px] text-[11px] text-green-700">
              ✅ Approved {fmtDate(receipt.approvedAt)} · {receipt.suppliersReleased} supplier(s) released · {fmtAmt(receipt.totalReleased)}
            </div>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white border border-brand-border rounded-[16px] p-4 mb-3">
        <p className="text-[10px] text-brand-muted font-bold uppercase m-0 mb-3">Invoices Covered</p>
        {(receipt.invoiceIds || []).map((inv, i) => (
          <div key={inv._id || i} className="flex items-center justify-between py-[9px] border-b border-brand-border last:border-0">
            <div>
              <p className="text-[12px] font-semibold text-brand-dark m-0">{inv.invoiceNumber || `Invoice ${i + 1}`}</p>
              <p className="text-[10px] text-brand-muted m-0">{inv.paymentStatus}</p>
            </div>
            <span className="text-[13px] font-bold text-brand-dark">{fmtAmt(inv.grandTotal || inv.amountDue)}</span>
          </div>
        ))}
      </div>

      {/* Receipt Image */}
      {receipt.receiptImage && (
        <div className="bg-white border border-brand-border rounded-[16px] p-4 mb-3">
          <p className="text-[10px] text-brand-muted font-bold uppercase m-0 mb-3">Payment Receipt Image</p>
          <img src={receipt.receiptImage} alt="receipt" onClick={() => setImgOpen(true)}
            className="w-full max-h-[280px] object-cover rounded-[10px] cursor-zoom-in border border-brand-border" />
          <p className="text-[10px] text-brand-muted mt-2 m-0">Click to enlarge</p>
        </div>
      )}

      {/* Rejection reason */}
      {receipt.status === "rejected" && receipt.adminNote && (
        <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 mb-3">
          <p className="text-[11px] font-bold text-red-600 m-0 mb-2">Rejection Reason</p>
          <p className="text-[12px] text-red-800 m-0">{receipt.adminNote}</p>
        </div>
      )}

      {/* Admin Note + Actions */}
      {isPending && (
        <div className="bg-white border border-brand-border rounded-[16px] p-4 mb-3">
          <p className="text-[10px] text-brand-muted font-bold uppercase m-0 mb-3">Admin Decision</p>
          <textarea
            value={adminNote} onChange={e => setAdminNote(e.target.value)}
            placeholder="Note (required for rejection, optional for approval)..."
            className="w-full px-3 py-[9px] border border-brand-border rounded-[8px] text-[12px] outline-none resize-vertical min-h-[80px] focus:border-brand-primary transition-all mb-3"
          />
          <div className="flex gap-3">
            <button onClick={handleApprove} disabled={submitting}
              className="flex-1 py-[10px] bg-green-600 text-white border-none rounded-[10px] text-[13px] font-bold cursor-pointer disabled:opacity-60">
              {submitting ? "Processing…" : "✅ Approve Payment"}
            </button>
            <button onClick={handleReject} disabled={submitting}
              className="flex-1 py-[10px] bg-red-50 text-red-600 border border-red-200 rounded-[10px] text-[13px] font-bold cursor-pointer disabled:opacity-60">
              {submitting ? "Processing…" : "❌ Reject"}
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {imgOpen && (
        <div onClick={() => setImgOpen(false)} className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center cursor-zoom-out">
          <img src={receipt.receiptImage} alt="receipt" className="max-w-[90vw] max-h-[90vh] rounded-[12px] object-contain" />
        </div>
      )}
    </div>
  );
}