import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const fmtAmt = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";
const LIMIT  = 20;

export default function ExpenseRecords() {
  const navigate = useNavigate();
  const [days,       setDays]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [expanded,   setExpanded]   = useState(null);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [dayDetails, setDayDetails] = useState({});
  const [dayLoading, setDayLoading] = useState({});

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/admin/supplier-payments/days").then(d => {
      if (d.success) {
        const allDays = d.data || [];
        setGrandTotal(d.overall?.totalReleased || allDays.reduce((s, day) => s + (day.totalReleased || 0), 0));
        const paid = allDays.filter(day => (day.totalReleased || 0) > 0).sort((a, b) => b.date.localeCompare(a.date));
        setTotal(paid.length);
        setTotalPages(Math.ceil(paid.length / LIMIT));
        setDays(paid);
      }
    }).finally(() => setLoading(false));
  }, []);

  const loadDayDetail = (date) => {
    if (dayDetails[date] || dayLoading[date]) return;
    setDayLoading(prev => ({ ...prev, [date]: true }));
    apiFetch(`/api/admin/supplier-payments/days/${date}/bulk-orders`).then(d => {
      if (d.success) setDayDetails(prev => ({ ...prev, [date]: d }));
    }).finally(() => setDayLoading(prev => ({ ...prev, [date]: false })));
  };

  const handleExpand = (date) => {
    if (expanded === date) { setExpanded(null); return; }
    setExpanded(date);
    loadDayDetail(date);
  };

  const getSuppliers = (date) => {
    const data = dayDetails[date];
    if (!data) return [];
    const map = {};
    (data.data || []).forEach(bulk => {
      const key = bulk.supplierBranchId || bulk.supplierName || "unknown";
      if (!map[key]) map[key] = { key, date, supplierName: bulk.supplierName, supplierCompany: bulk.supplierCompany, supplierBank: bulk.supplierBank, totalReleased: 0, bulkCount: 0, invoiceCount: 0 };
      const rel = (bulk.buyerOrders || []).filter(bo => bo.status === "released");
      if (!rel.length) return;
      map[key].totalReleased += bulk.totalReleased || 0;
      map[key].bulkCount++;
      map[key].invoiceCount += rel.length;
    });
    return Object.values(map).filter(s => s.bulkCount > 0);
  };

  const filtered  = days.filter(d => !search || d.dateLabel?.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-bold text-brand-dark m-0">Expense Records</h1>
          <p className="text-[11px] text-brand-muted mt-[2px]">Payments released to suppliers · {total} days · latest first</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by date…"
          className="px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all w-[220px]" />
      </div>

      {/* Banner */}
      <div className="bg-brand-primary rounded-[16px] px-5 py-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white/70 m-0 mb-1">Total Paid to Suppliers</p>
          <p className="text-[22px] font-extrabold text-white m-0">{fmtAmt(grandTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/70 m-0 mb-1">{total} days with payments</p>
          <p className="text-[11px] text-white/70 m-0">All time</p>
        </div>
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-[16px] p-10 text-center">
          <p className="text-brand-muted text-[13px] m-0">No expense records found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {paginated.map((day, idx) => {
            const isExp   = expanded === day.date;
            const num     = ((page - 1) * LIMIT) + idx + 1;
            const isFirst = num === 1;
            const suppliers = getSuppliers(day.date);

            return (
              <div key={day.date} className={`bg-white border rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all
                ${isExp ? "border-brand-primary" : "border-brand-border"}`}>

                {/* Day Row */}
                <div onClick={() => handleExpand(day.date)}
                  className={`flex items-center gap-3 px-4 py-[14px] cursor-pointer transition-colors flex-wrap
                    ${isExp ? "bg-brand-lighter" : "bg-white hover:bg-brand-lighter"}`}>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${isFirst ? "bg-brand-primary" : "bg-brand-lighter"}`}>
                    <span className={`text-[10px] font-bold ${isFirst ? "text-white" : "text-brand-gray"}`}>
                      {isFirst ? "NEW" : num}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-brand-dark m-0 mb-[2px]">{day.dateLabel}</p>
                    <p className="text-[10px] text-brand-muted m-0">
                      {day.totalBulkOrders} bulk order{day.totalBulkOrders !== 1 ? "s" : ""}
                      {isExp && suppliers.length > 0 && ` · ${suppliers.length} supplier${suppliers.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>

                  {day.totalPending > 0 && (
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Still pending</p>
                      <p className="text-[12px] font-semibold text-amber-600 m-0">{fmtAmt(day.totalPending)}</p>
                    </div>
                  )}

                  <div className="text-right shrink-0 min-w-[110px]">
                    <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Released</p>
                    <p className="text-[15px] font-extrabold text-brand-dark m-0">{fmtAmt(day.totalReleased)}</p>
                  </div>

                  <span className={`text-brand-muted text-[12px] shrink-0 transition-transform ${isExp ? "rotate-90" : ""}`}>›</span>
                </div>

                {/* Expanded — Suppliers */}
                {isExp && (
                  <div className="border-t border-brand-border">
                    {dayLoading[day.date] ? (
                      <div className="flex justify-center py-5"><Loader /></div>
                    ) : suppliers.length === 0 ? (
                      <p className="px-4 py-4 text-[12px] text-brand-muted m-0">No released payments</p>
                    ) : (
                      <>
                        {suppliers.map((sup, i) => (
                          <div key={sup.key}
                            onClick={() => navigate(`/payments/expense/${day.date}/${encodeURIComponent(sup.key)}`)}
                            className={`flex items-center justify-between px-4 py-[12px] cursor-pointer transition-colors hover:bg-brand-lighter
                              ${i < suppliers.length - 1 ? "border-b border-brand-border" : ""}`}>
                            <div>
                              <p className="text-[12px] font-semibold text-brand-dark m-0 mb-[2px]">{sup.supplierName || "—"}</p>
                              <p className="text-[10px] text-brand-muted m-0">
                                {sup.supplierCompany || "—"} · {sup.bulkCount} bulk order{sup.bulkCount !== 1 ? "s" : ""} · {sup.invoiceCount} invoice{sup.invoiceCount !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-[10px] text-brand-muted m-0 mb-[2px]">Released</p>
                                <p className="text-[13px] font-bold text-brand-dark m-0">{fmtAmt(Math.round(sup.totalReleased * 100) / 100)}</p>
                              </div>
                              <span className="text-brand-muted text-[12px]">›</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end px-4 py-3 border-t border-brand-border bg-brand-lighter">
                          <p className="text-[11px] text-brand-muted m-0">
                            Day total: <span className="font-bold text-brand-dark">{fmtAmt(dayDetails[day.date]?.dayTotal?.totalReleased)}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <span className="text-[11px] text-brand-muted">{((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="w-7 h-7 rounded-[6px] border border-brand-border bg-white text-brand-gray text-[12px] cursor-pointer disabled:opacity-40">‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-[6px] border text-[12px] cursor-pointer
                  ${page===p ? "bg-brand-primary text-white border-brand-primary" : "border-brand-border bg-white text-brand-gray"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="w-7 h-7 rounded-[6px] border border-brand-border bg-white text-brand-gray text-[12px] cursor-pointer disabled:opacity-40">›</button>
          </div>
        </div>
      )}
    </div>
  );
}