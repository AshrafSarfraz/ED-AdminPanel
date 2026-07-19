// 📁 pages/paymentRecords/Buyer/AdminReceiptsList.jsx
// Route: /payments/receipts — sab payment receipts (pending/approved/rejected), filterable
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import StatCard from "../../../components/StatCard";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt  = (n) => `QAR ${Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_CFG = {
  pending:  { label: "Pending",  bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  approved: { label: "Approved", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  rejected: { label: "Rejected", bg: "bg-red-50",   text: "text-red-600",   border: "border-red-200"   },
};

export default function ReceiptsApprovalList() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("pending"); // "pending" | "approved" | "rejected" | "all"
  const [search,   setSearch]   = useState("");

  const load = () => {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    apiFetch(`/api/payments/admin/receipts${q}&limit=200`.replace("?&", "?"))
      .then(d => { if (d.success) setReceipts(d.data || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const filtered = receipts.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.buyerBranchId?.managerName || "").toLowerCase().includes(q)
      || (r.buyerBranchId?.companyName || "").toLowerCase().includes(q);
  });

  const totalAmount = filtered.reduce((s, r) => s + (r.totalAmount || 0), 0);

  return (
    <div className="max-w-[1500px]">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Payment Receipts</h1>
          <p className="text-[11px] text-brand-muted mt-[2px]">{filtered.length} receipts · {fmtAmt(totalAmount)} total</p>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search buyer or company…"
          className="px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all w-[220px]"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[{ v: "pending", l: "Pending" }, { v: "approved", l: "Approved" }, { v: "rejected", l: "Rejected" }, { v: "all", l: "All" }].map(t => (
          <button key={t.v} onClick={() => setFilter(t.v)}
            className={`px-4 py-[8px] rounded-[8px] text-[12px] font-semibold border cursor-pointer transition-all
              ${filter === t.v ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-gray border-brand-border"}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="bg-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        {loading ? <div className="flex justify-center py-12"><Loader /></div>
          : filtered.length === 0 ? <p className="text-center py-12 text-brand-muted text-[13px]">No receipts found</p>
          : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["Date", "Buyer", "Company", "Amount", "Invoices", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const cfg = STATUS_CFG[r.status] || { label: r.status, bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" };
                  return (
                    <tr key={r._id} onClick={() => navigate(`/payments/receipts/${r._id}`)}
                      className="border-b border-[#fdf0ea] cursor-pointer hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                      <td className="px-4 py-[11px] text-[11px] text-brand-gray whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-[11px] text-[12px] font-semibold text-brand-dark">{r.buyerBranchId?.managerName || "—"}</td>
                      <td className="px-4 py-[11px] text-[12px] text-brand-gray">{r.buyerBranchId?.companyName || "—"}</td>
                      <td className="px-4 py-[11px] text-[13px] font-bold text-brand-primary">{fmtAmt(r.totalAmount)}</td>
                      <td className="px-4 py-[11px] text-[11px] text-brand-muted">{r.invoiceIds?.length || 0} invoices</td>
                      <td className="px-4 py-[11px]">
                        <span className={`px-2 py-[3px] rounded-[20px] text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-[11px]">
                        <span className="text-[11px] text-brand-primary font-semibold">View →</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-brand-border">
          <span className="text-[11px] text-brand-muted">Showing {filtered.length} receipts</span>
        </div>
      </div>
    </div>
  );
}
