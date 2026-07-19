// 📁 pages/payments/AdminReceiptDetail.jsx
// Route: /payments/receipts/:receiptId
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, ...opts }).then(r => r.json());

const fmtAmt  = (n) => `QAR ${Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function   ReceiptDetail() {
  const { receiptId } = useParams();
  const navigate      = useNavigate();
  const [receipt,    setReceipt]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [adminNote,  setAdminNote]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imgOpen,    setImgOpen]    = useState(false);

  const load = async () => {
    const data = await apiFetch(`/api/payments/admin/receipts?limit=1000`);
    if (data.success) {
      const found = data.data.find(r => r._id === receiptId);
      if (found) setReceipt(found);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [receiptId]);

  const handleApprove = async () => {
    if (!window.confirm("Approve this payment receipt? Supplier invoices will be released.")) return;
    setSubmitting(true);
    const data = await apiFetch(`/api/payments/admin/receipts/${receiptId}/approve`, {
      method: "PUT", body: JSON.stringify({ adminNote: adminNote || null }),
    });
    setSubmitting(false);
    if (data.success) {
      alert(`✅ Approved! ${data.data.suppliersReleased} supplier invoice(s) released.`);
      navigate("/payments/receipts");
    } else alert("Error: " + data.message);
  };

  const handleReject = async () => {
    if (!adminNote.trim()) { alert("Please enter a rejection reason."); return; }
    if (!window.confirm("Reject this receipt?")) return;
    setSubmitting(true);
    const data = await apiFetch(`/api/payments/admin/receipts/${receiptId}/reject`, {
      method: "PUT", body: JSON.stringify({ adminNote }),
    });
    setSubmitting(false);
    if (data.success) { alert("Receipt rejected."); navigate("/payments/receipts"); }
    else alert("Error: " + data.message);
  };

  if (loading) return <Loader />;
  if (!receipt) return <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>Receipt not found</div>;

  const isPending = receipt.status === "pending";
  const STATUS_CFG = {
    pending:  { label: "Pending",  bg: "#fffbeb", color: "#d97706" },
    approved: { label: "Approved", bg: "#f0fdf4", color: "#16a34a" },
    rejected: { label: "Rejected", bg: "#fef2f2", color: "#dc2626" },
  };
  const cfg = STATUS_CFG[receipt.status] || STATUS_CFG.pending;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h2 style={S.title}>Receipt Detail</h2>
          <p style={S.sub}>Submitted {fmtDate(receipt.createdAt)}</p>
        </div>
        <span style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        {/* Buyer Info */}
        <InfoCard title="Buyer Info">
          {[
            ["Manager",  receipt.buyerBranchId?.managerName],
            ["Company",  receipt.buyerBranchId?.companyName || receipt.buyerCompanyId?.brandName],
            ["Email",    receipt.buyerBranchId?.email],
            ["Phone",    receipt.buyerBranchId?.phone],
          ].map(([l, v]) => (
            <div key={l} style={{ marginBottom: "10px" }}>
              <p style={{ fontSize: "11px", color: "#888", margin: "0 0 2px" }}>{l}</p>
              <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>{v || "—"}</p>
            </div>
          ))}
        </InfoCard>

        {/* Payment Info */}
        <InfoCard title="Payment Info">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>Total Amount</span>
            <span style={{ fontSize: "24px", fontWeight: "700", color: "#16a34a" }}>{fmtAmt(receipt.totalAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#888", marginBottom: "8px" }}>
            <span>Invoices covered</span><span style={{ fontWeight: "600", color: "#1a1a2e" }}>{receipt.invoiceIds?.length || 0}</span>
          </div>
          {receipt.note && (
            <div style={{ marginTop: "12px", padding: "10px 14px", background: "#f8f9fa", borderRadius: "8px", fontSize: "13px" }}>
              <span style={{ fontWeight: "500" }}>Note: </span>{receipt.note}
            </div>
          )}
          {receipt.status === "approved" && (
            <div style={{ marginTop: "12px", padding: "10px 14px", background: "#f0fdf4", borderRadius: "8px", fontSize: "12px", color: "#16a34a" }}>
              ✅ Approved {fmtDate(receipt.approvedAt)} · {receipt.suppliersReleased} supplier(s) released · {fmtAmt(receipt.totalReleased)}
            </div>
          )}
        </InfoCard>
      </div>

      {/* Invoices */}
      <InfoCard title="Invoices Covered" style={{ marginBottom: "16px" }}>
        {(receipt.invoiceIds || []).map((inv, i) => (
          <div key={inv._id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < receipt.invoiceIds.length - 1 ? "1px solid #f0f0f0" : "none" }}>
            <div>
              <p style={{ margin: 0, fontWeight: "500", fontSize: "13px" }}>{inv.invoiceNumber || `Invoice ${i + 1}`}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{inv.paymentStatus}</p>
            </div>
            <span style={{ fontWeight: "700", fontSize: "14px" }}>{fmtAmt(inv.grandTotal || inv.amountDue)}</span>
          </div>
        ))}
      </InfoCard>

      {/* Receipt Image */}
      {receipt.receiptImage && (
        <InfoCard title="Payment Receipt Image" style={{ marginBottom: "16px" }}>
          <img src={receipt.receiptImage} alt="receipt" onClick={() => setImgOpen(true)}
            style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "10px", cursor: "zoom-in", border: "1px solid #e5e7eb" }} />
          <p style={{ fontSize: "11px", color: "#aaa", marginTop: "6px" }}>Click to enlarge</p>
        </InfoCard>
      )}

      {/* Rejection note display */}
      {receipt.status === "rejected" && receipt.adminNote && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "#dc2626", fontWeight: "700", margin: "0 0 4px" }}>Rejection Reason</p>
          <p style={{ fontSize: "13px", color: "#7f1d1d", margin: 0 }}>{receipt.adminNote}</p>
        </div>
      )}

      {/* Admin actions */}
      {isPending && (
        <InfoCard title="Admin Decision">
          <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
            placeholder="Note (required for rejection, optional for approval)..."
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", resize: "vertical", minHeight: "80px", boxSizing: "border-box", outline: "none", fontFamily: "inherit", marginBottom: "14px" }} />
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleApprove} disabled={submitting}
              style={{ flex: 1, padding: "12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Processing…" : "✅ Approve Payment"}
            </button>
            <button onClick={handleReject} disabled={submitting}
              style={{ flex: 1, padding: "12px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Processing…" : "❌ Reject"}
            </button>
          </div>
        </InfoCard>
      )}

      {/* Lightbox */}
      {imgOpen && (
        <div onClick={() => setImgOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <img src={receipt.receiptImage} alt="receipt" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "12px", objectFit: "contain" }} />
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, children, style: extraStyle }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "16px", ...extraStyle }}>
      <p style={{ fontSize: "11px", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 14px" }}>{title}</p>
      {children}
    </div>
  );
}

function Loader() { return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><div style={{ width: "32px", height: "32px", border: "3px solid #f0f0f0", borderTop: "3px solid #F15A21", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>; }

const S = {
  page: { maxWidth: "1300px", padding:20, margin: "0 auto", padding: "10px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "4px 0" },
  sub: { fontSize: "13px", color: "#888", margin: 0 },
  backBtn: { background: "none", border: "none", color: "#888", fontSize: "12px", cursor: "pointer", padding: "0 0 12px", display: "block" },
};
