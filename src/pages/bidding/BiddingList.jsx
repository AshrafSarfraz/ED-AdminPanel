

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import Loader from "../../components/Loader";

const BASE     = "https://el-distibutor-backend.onrender.com";
const token    = () => localStorage.getItem("adminToken");
const apiFetch = (path) =>
  fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` } }).then(r => r.json());

const CACHE_TTL = 5 * 60 * 1000;
const cacheSet  = (k, d) => localStorage.setItem(k, JSON.stringify({ ts: Date.now(), data: d }));
const cacheGet  = (k) => { try { const r = JSON.parse(localStorage.getItem(k)); if (!r) return null; return { data: r.data, stale: Date.now() - r.ts > CACHE_TTL }; } catch { return null; } };

const STATUS_CFG = {
  bidding:   { label: "Live",      bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200"  },
  awarded:   { label: "Awarded",   bg: "bg-green-50",  text: "text-green-700", border: "border-green-200" },
  ready:     { label: "Ready",     bg: "bg-green-50",  text: "text-green-700", border: "border-green-200" },
  cancelled: { label: "Cancelled", bg: "bg-red-50",    text: "text-red-600",   border: "border-red-200"   },
};

const BAR_COLORS = ["#16a34a", "#1d4ed8", "#9333ea", "#d97706"];
const initials   = (name = "") => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const LS_FILTERS = "biddingList_filters";
const saveFilters = (f) => localStorage.setItem(LS_FILTERS, JSON.stringify(f));
const loadFilters = () => { try { return JSON.parse(localStorage.getItem(LS_FILTERS)) || {}; } catch { return {}; } };

export default function BiddingList() {
  const navigate = useNavigate();
  const saved    = loadFilters();

  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [status,       setStatus]       = useState(saved.status || "all");
  const [search,       setSearch]       = useState(saved.search || "");
  const [date,         setDate]         = useState(saved.date   || "");
  const [page,         setPage]         = useState(saved.page   || 1);
  const [total,        setTotal]        = useState(0);
  const [pages,        setPages]        = useState(1);
  const [stats,        setStats]        = useState({ total: 0, awarded: 0, bidding: 0, cancelled: 0, ready: 0 });
  const [topSuppliers, setTopSuppliers] = useState([]);
  const abortRef = useRef(null);

  useEffect(() => { saveFilters({ status, search, date, page }); }, [status, search, date, page]);

  const load = (background = false) => {
    if (!background) {
      const pageKey  = `biddingPage_${status}_${date}_${page}`;
      const statsKey = "biddingStats";
      const cached   = cacheGet(pageKey);
      const cStats   = cacheGet(statsKey);
  
      if (cached) {
        setOrders(cached.data.orders);
        setTotal(cached.data.total);
        setPages(cached.data.pages);
        setLoading(false);
        if (!cached.stale) {
          // Page cache fresh hai — stats bhi check karo
          if (cStats && !cStats.stale) {
            setStats(cStats.data.stats);
            setTopSuppliers(cStats.data.topSuppliers);
            return; // sab fresh — kuch nahi karna
          }
          // Stats stale — sirf stats refresh karo
          setRefreshing(true);
        } else {
          setRefreshing(true);
        }
      } else {
        setLoading(true); // no cache — full loader
      }
  
      // Stats cache se load karo chahe stale ho
      if (cStats) {
        setStats(cStats.data.stats);
        setTopSuppliers(cStats.data.topSuppliers);
      }
  
    } else {
      setRefreshing(true);
    }
  
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
  
    let q = `page=${page}&limit=10`;
    if (status !== "all") q += `&status=${status}`;
    if (date)             q += `&date=${date}`;
  
    Promise.all([
      apiFetch(`/api/admin/bulk-orders?${q}`),
      apiFetch("/api/admin/bulk-orders?limit=1000"),
    ]).then(([paged, all]) => {
      if (ctrl.signal.aborted) return;
  
      if (paged.success) {
        setOrders(paged.data);
        setTotal(paged.total);
        setPages(paged.pages);
        cacheSet(`biddingPage_${status}_${date}_${page}`, {
          orders: paged.data,
          total:  paged.total,
          pages:  paged.pages,
        });
      }
  
      if (all.success) {
        const newStats = {
          total:     all.data.length,
          awarded:   all.data.filter(o => o.status === "awarded").length,
          bidding:   all.data.filter(o => o.status === "bidding").length,
          cancelled: all.data.filter(o => o.status === "cancelled").length,
          ready:     all.data.filter(o => o.status === "ready").length,
        };
        const supMap = {};
        all.data.forEach(o => {
          if (!o.winner) return;
          const key = o.winner.name;
          if (!supMap[key]) supMap[key] = { name: o.winner.name, wins: 0 };
          supMap[key].wins++;
        });
        const newTop = Object.values(supMap).sort((a, b) => b.wins - a.wins).slice(0, 4);
  
        setStats(newStats);
        setTopSuppliers(newTop);
        cacheSet("biddingStats", { stats: newStats, topSuppliers: newTop });
      }
    }).finally(() => {
      if (!ctrl.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    });
  };
  useEffect(() => {
    // Har baar status/date/page change pe stats cache bhi invalidate karo
    localStorage.removeItem("biddingStats");
    load();
    return () => abortRef.current?.abort();
  }, [status, date, page]);
  useEffect(() => { setPage(1); }, [status, date]);

  const maxWins = Math.max(...topSuppliers.map(s => s.wins), 1);

  const filteredOrders = orders.filter(o =>
    !search ||
    o.item?.toLowerCase().includes(search.toLowerCase()) ||
    o.winner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { label: `All (${stats.total})`,         key: "all"       },
    { label: `Finalized (${stats.awarded})`, key: "awarded"   },
    { label: `Completed (${stats.ready})`,   key: "ready"     },
  ];

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Stat Cards */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-3 md:gap-4 mb-4">
        <StatCard value={stats.total}     label="Total Bids"      active={status === "all"}       onClick={() => setStatus("all")}       />
        <StatCard value={stats.awarded}   label="Awarded"         active={status === "awarded"}   onClick={() => setStatus("awarded")}   />
        <StatCard value={stats.bidding}   label="Live Bidding"    active={status === "bidding"}   onClick={() => setStatus("bidding")}   />
        <StatCard value={stats.cancelled} label="Cancelled"       active={status === "cancelled"} onClick={() => setStatus("cancelled")} />
        <StatCard value={stats.ready}     label="Ready"           active={status === "ready"}     onClick={() => setStatus("ready")}     />
      </div>

      {/* Top Winning Suppliers */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-4 md:p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[14px] font-bold text-brand-dark m-0">Top Winning Suppliers</p>
            <p className="text-[11px] text-brand-muted mt-[2px] m-0">By number of auctions won</p>
          </div>
          <button onClick={() => navigate("/bidding/suppliers")}
            className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer">
            View all
          </button>
        </div>
        {topSuppliers.length === 0 ? (
          <p className="text-[12px] text-brand-muted">No data yet</p>
        ) : topSuppliers.map((s, i) => (
          <div key={s.name} className="flex items-center gap-3 mb-3 last:mb-0">
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {initials(s.name)}
            </div>
            <p className="text-[12px] font-semibold text-brand-dark m-0 w-[130px] shrink-0 truncate">{s.name}</p>
            <div className="flex-1 h-2 bg-brand-lighter rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(s.wins / maxWins * 100)}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
            </div>
            <p className="text-[12px] font-bold m-0 w-[60px] text-right" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>{s.wins} wins</p>
          </div>
        ))}
      </div>

      {/* All Bidding Results */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <p className="text-[14px] font-bold text-brand-dark m-0">All Bidding Results</p>
            <p className="text-[11px] text-brand-muted mt-[2px] flex items-center gap-2 m-0">
              {total} orders
              {refreshing && <span className="text-brand-primary font-semibold">● syncing…</span>}
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-[7px] border border-brand-border rounded-[8px] text-[11px] outline-none bg-white focus:border-brand-primary transition-all" />
            {date && <button onClick={() => setDate("")} className="px-3 py-[7px] bg-gray-100 text-brand-gray border-none rounded-[8px] text-[11px] cursor-pointer">✕</button>}
            <button onClick={() => load(true)} disabled={refreshing}
              className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer disabled:opacity-60">
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 pb-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bids..."
            className="w-full px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all" />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-brand-border px-4 md:px-6 gap-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setStatus(t.key)}
              className={`px-3 py-[10px] border-none whitespace-nowrap text-[12px] cursor-pointer bg-transparent transition-all
                ${status === t.key ? "font-bold text-brand-primary border-b-2 border-brand-primary" : "text-brand-muted font-medium"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
          {filteredOrders.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[12px]">No orders found</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#FFEDD5]">
                  {["Bulk ID", "Product", "Supplier", "Buyers", "Quantity", "Price Range", "Winning Price", "Status", "Action"].map(h => (
                    <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const cfg = STATUS_CFG[o.status] || { label: o.status, bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
                  return (
                    <tr key={o._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                      <td className="px-4 py-[10px]">
                        <span className="font-mono text-[10px] text-brand-muted">{o._id?.toString().slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-[10px]">
                        <div className="flex items-center gap-2">
                          {o.image
                            ? <img src={o.image} alt={o.item} className="w-7 h-7 rounded-[6px] object-cover shrink-0" />
                            : <div className="w-7 h-7 rounded-[6px] bg-brand-lighter shrink-0" />
                          }
                          <span className="text-[12px] font-semibold text-brand-dark">{o.item}</span>
                        </div>
                      </td>
                      <td className="px-4 py-[10px] text-[12px] font-semibold text-brand-dark">
                        {o.winner ? o.winner.name : <span className="text-brand-muted">—</span>}
                      </td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">{o.buyerCount}</td>
                      <td className="px-4 py-[10px] text-[12px] text-brand-dark">
                        {o.totalQuantity?.toLocaleString()} <span className="text-brand-muted text-[10px]">units</span>
                      </td>
                      <td className="px-4 py-[10px] text-[11px] text-brand-gray">
                        {o.minPrice != null ? `${o.minPrice} - ${o.maxPrice}` : "—"}
                      </td>
                      <td className="px-4 py-[10px] text-[12px] font-bold text-brand-dark">
                        {o.winningPrice != null ? `QAR ${o.winningPrice}` : "—"}
                      </td>
                      <td className="px-4 py-[10px]">
                        <span className={`px-2 py-[2px] rounded-[20px] text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-[10px]">
                        <button onClick={() => navigate(`/bidding/${o._id}`)}
                          className="px-3 py-[4px] bg-brand-primary text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                          View
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
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-brand-border flex-wrap gap-3">
          <span className="text-[11px] text-brand-muted">
            Showing {(page-1)*10+1}–{Math.min(page*10, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="w-7 h-7 rounded-[6px] border border-brand-border bg-white text-brand-gray text-[12px] cursor-pointer disabled:opacity-40">‹</button>
            {Array.from({ length: Math.min(pages,3) }, (_,i) => i+1).map(p => (
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
    </div>
  );
}