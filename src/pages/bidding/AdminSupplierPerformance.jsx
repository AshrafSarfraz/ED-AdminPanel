
import { useState, useEffect } from "react";
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

const initials  = (name = "") => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const rateColor = (r) => r >= 70 ? "text-green-700" : r >= 40 ? "text-amber-700" : "text-red-600";

export default function AdminSupplierPerformance() {
  const navigate    = useNavigate();
  const [suppliers,  setSuppliers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [sort,       setSort]       = useState("wins");

  const loadSuppliers = (background = false) => {
    const CACHE_KEY = "supplierPerformance";
    const cached    = cacheGet(CACHE_KEY);
    if (!background && cached) { setSuppliers(cached.data); setLoading(false); if (!cached.stale) return; setRefreshing(true); }
    else if (!background) setLoading(true);
    else setRefreshing(true);

    apiFetch("/api/admin/bulk-orders?limit=1000").then(d => {
      if (!d.success) return;
      const supMap = {};
      d.data.forEach(o => {
        if (!o.winner) return;
        const key = o.winner.branchId || o.winner.name;
        if (!supMap[key]) supMap[key] = { branchId: o.winner.branchId, managerName: o.winner.name, companyName: o.winner.companyName, wins: 0, total: 0, lost: 0, missed: 0 };
        supMap[key].total++;
        if (o.status === "awarded")   supMap[key].wins++;
        else if (o.status === "bidding")   supMap[key].lost++;
        else if (o.status === "cancelled") supMap[key].missed++;
      });
      const result = Object.values(supMap);
      setSuppliers(result);
      cacheSet(CACHE_KEY, result);
    }).finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { loadSuppliers(); }, []);

  const filtered = suppliers
    .filter(s => s.managerName?.toLowerCase().includes(search.toLowerCase()) || s.companyName?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "wins")  return b.wins - a.wins;
      if (sort === "rate")  return (b.wins/(b.total||1)) - (a.wins/(a.total||1));
      if (sort === "total") return b.total - a.total;
      if (sort === "name")  return (a.managerName||"").localeCompare(b.managerName||"");
      return 0;
    });

  const maxWins   = Math.max(...filtered.map(s => s.wins), 1);
  const totalWins = filtered.reduce((s, x) => s + x.wins, 0);
  const avgRate   = filtered.length ? Math.round(filtered.reduce((s, x) => s + (x.wins / (x.total || 1) * 100), 0) / filtered.length) : 0;
  const top       = filtered[0];

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px]">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <StatCard value={filtered.length}                         label="Total Suppliers"  />
        <StatCard value={totalWins}                               label="Total Wins"       />
        <StatCard value={avgRate + "%"}                           label="Avg Win Rate"     />
        <StatCard value={top?.managerName?.split(" ")[0] || "—"} label="Top Winner"       sub={top ? top.wins + " wins" : ""} />
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-4 pb-3">
          <div>
            <p className="text-[14px] font-bold text-brand-dark m-0">All Suppliers</p>
            <p className="text-[11px] text-brand-muted mt-[2px] flex items-center gap-2 m-0">
              {filtered.length} suppliers
              {refreshing && <span className="text-brand-primary font-semibold">● syncing…</span>}
            </p>
          </div>
          <button onClick={() => loadSuppliers(true)} disabled={refreshing}
            className="px-4 py-[7px] bg-white border border-brand-border rounded-[8px] text-[11px] font-semibold text-brand-gray cursor-pointer disabled:opacity-60">
            ↻ Refresh
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex gap-3 px-4 md:px-6 pb-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier or company..."
            className="flex-1 min-w-[200px] px-3 py-[8px] border border-brand-border rounded-[10px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all" />
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-[8px] border border-brand-border rounded-[8px] text-[12px] outline-none bg-white focus:border-brand-primary transition-all cursor-pointer">
            <option value="wins">Sort by wins</option>
            <option value="rate">Sort by win rate</option>
            <option value="total">Sort by total bids</option>
            <option value="name">Sort by name</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#FFEDD5]">
                {["#", "Supplier", "Company", "Wins", "Win Rate", "Total Bids", "Lost", "Missed", ""].map(h => (
                  <th key={h} className="px-4 py-[10px] text-left text-[11px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-10 text-brand-muted text-[12px]">No suppliers found</td></tr>
              ) : filtered.map((s, i) => {
                const rate = Math.round(s.wins / (s.total || 1) * 100);
                const pct  = Math.round(s.wins / maxWins * 100);
                return (
                  <tr key={s.branchId} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                    <td className={`px-4 py-[10px] text-[11px] font-bold ${i === 0 ? "text-amber-600" : i === 1 ? "text-gray-500" : i === 2 ? "text-orange-700" : "text-brand-muted"}`}>
                      {i + 1}
                    </td>
                    <td className="px-4 py-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-lighter text-brand-dark text-[10px] font-bold flex items-center justify-center shrink-0">
                          {initials(s.managerName)}
                        </div>
                        <span className="text-[12px] font-semibold text-brand-dark">{s.managerName || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-gray">{s.companyName || "—"}</td>
                    <td className="px-4 py-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-[6px] bg-brand-lighter rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[12px] font-bold text-brand-primary">{s.wins}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-[10px] text-[12px] font-bold ${rateColor(rate)}`}>{rate}%</td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-dark font-semibold">{s.total}</td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-muted">{s.lost}</td>
                    <td className="px-4 py-[10px] text-[12px] text-brand-muted">{s.missed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center px-4 md:px-6 py-3 border-t border-brand-border">
          <span className="text-[11px] text-brand-muted">Showing {filtered.length} suppliers</span>
        </div>
      </div>
    </div>
  );
}