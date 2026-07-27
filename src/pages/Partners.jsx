import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";

const BASE = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
      ...(opts.headers || {}),
    },
  }).then(r => r.json());

const StatusBadge = ({ status }) => {
  const map = {
    "New Request": { bg: "bg-blue-50",  text: "text-blue-700",  border: "border-blue-200"  },
    "Approved":    { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    "Rejected":    { bg: "bg-red-50",   text: "text-red-600",   border: "border-red-200"   },
  };
  const s = map[status] || { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" };
  return (
    <span className={`px-3 py-[3px] rounded-[20px] text-[11px] md:text-[12px] font-semibold border whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}>
      {status}
    </span>
  );
};

const detailRows = (p) => [
  ["Full name",     `${p.firstName} ${p.lastName}`],
  ["Email",         p.email],
  ["Phone",         p.phone],
  ["Role",          p.roleInBusiness],
  ["Business type", p.businessType],
  ["Account type",  p.accountType],
  ["Branches",      p.numberOfBranches],
  ["License #",     p.tradeLicenseNumber],
  ["Submitted",     new Date(p.createdAt).toLocaleDateString()],
];

const DetailGrid = ({ partner }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
    {detailRows(partner).map(([label, val]) => (
      <div key={label} className="min-w-0">
        <p className="text-[10.5px] md:text-[11px] text-brand-muted m-0 mb-[2px]">{label}</p>
        <p className="text-[12.5px] md:text-[13px] font-semibold text-brand-dark m-0 break-words">{val}</p>
      </div>
    ))}
  </div>
);

export default function Partners() {
  const [partners,    setPartners]    = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [syncing,     setSyncing]     = useState(false);
  const [filter,      setFilter]      = useState("All");
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState(null);
  const [updating,    setUpdating]    = useState(null);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  useEffect(() => {
    const cached = localStorage.getItem("partnersCache");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setPartners(data.partners || []);
        setAllPartners(data.partners || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      } catch (e) { console.error(e); }
    }
  }, []);

  const load = async (pg = 1, st = filter) => {
    try {
      setSyncing(true);
      const q = st !== "All" ? `&status=${encodeURIComponent(st)}` : "";
      const data = await apiFetch(`/api/becomePartner?page=${pg}&limit=20${q}`);
      if (data.success) {
        setPartners(data.data);
        setTotalPages(data.pages || 1);
        if (st === "All") {
          setAllPartners(data.data);
          localStorage.setItem("partnersCache", JSON.stringify({ partners: data.data, totalPages: data.pages || 1 }));
        }
        if (loading) setLoading(false);
      }
    } catch (err) {
      console.error(err);
      if (loading && !localStorage.getItem("partnersCache")) setLoading(false);
    } finally { setSyncing(false); }
  };

  useEffect(() => {
    load(1, filter);
    const interval = setInterval(() => load(page, filter), 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const filteredPartners = partners.filter(p => {
    const s = search.toLowerCase();
    return (
      p.brandName.toLowerCase().includes(s) ||
      p.email.toLowerCase().includes(s) ||
      p.phone.includes(search) ||
      p.firstName.toLowerCase().includes(s) ||
      p.lastName.toLowerCase().includes(s)
    );
  });

  const changeStatus = async (id, status) => {
    setUpdating(id);
    const data = await apiFetch(`/api/becomePartner/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (data.success) {
      const updatedAll      = allPartners.map(p => p._id === id ? { ...p, status } : p);
      const updatedFiltered = partners.map(p => p._id === id ? { ...p, status } : p);
      setAllPartners(updatedAll);
      setPartners(updatedFiltered);
      if (selected?._id === id) setSelected(s => ({ ...s, status }));
      localStorage.setItem("partnersCache", JSON.stringify({ partners: updatedAll, totalPages }));
    }
    setUpdating(null);
  };

  const del = async (id) => {
    if (!confirm("Delete this partner request?")) return;
    await apiFetch(`/api/becomePartner/${id}`, { method: "DELETE" });
    const updatedAll      = allPartners.filter(p => p._id !== id);
    const updatedFiltered = partners.filter(p => p._id !== id);
    setAllPartners(updatedAll);
    setPartners(updatedFiltered);
    if (selected?._id === id) setSelected(null);
    localStorage.setItem("partnersCache", JSON.stringify({ partners: updatedAll, totalPages }));
  };

  const totalCount    = allPartners.length;
  const newCount      = allPartners.filter(p => p.status === "New Request").length;
  const approvedCount = allPartners.filter(p => p.status === "Approved").length;
  const rejectedCount = allPartners.filter(p => p.status === "Rejected").length;

  if (loading) return <Loader />;

  const isEmpty = filteredPartners.length === 0;

  return (
    <div className="max-w-[1500px] mx-auto">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
        <StatCard icon="handshake" value={totalCount.toLocaleString()}    label="Total Requests" active={filter === "All"}         onClick={() => { setFilter("All");         setPage(1); }} />
        <StatCard icon="bell"      value={newCount.toLocaleString()}      label="New Requests"   active={filter === "New Request"} onClick={() => { setFilter("New Request"); setPage(1); }} />
        <StatCard icon="check"     value={approvedCount.toLocaleString()} label="Approved"       active={filter === "Approved"}    onClick={() => { setFilter("Approved");    setPage(1); }} />
        <StatCard icon="xcircle"   value={rejectedCount.toLocaleString()} label="Rejected"       active={filter === "Rejected"}    onClick={() => { setFilter("Rejected");    setPage(1); }} />
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] md:rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 md:gap-3 px-4 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4">
          <div>
            <h1 className="text-[16px] md:text-[19px] font-bold text-brand-dark m-0">Partner Requests</h1>
            <p className="text-[11.5px] md:text-[12px] text-brand-muted mt-1 flex items-center gap-2 flex-wrap">
              Manage become-a-partner applications
              {syncing && <span className="text-brand-primary font-semibold">↻ Syncing...</span>}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 pb-4">
          <input
            type="text"
            placeholder="Search brand, email, phone, or contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-[10px] border border-brand-border rounded-[10px] text-[13px] outline-none bg-white focus:border-brand-primary transition-all"
          />
        </div>

        {/* Desktop Detail Panel */}
        {selected && (
          <div className="hidden md:block mx-6 mb-4 bg-white border border-brand-border rounded-[14px] p-5 max-h-[40vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-[16px] font-bold text-brand-dark m-0 mb-1">{selected.brandName}</h2>
                <StatusBadge status={selected.status} />
              </div>
              <button onClick={() => setSelected(null)} className="bg-transparent border-none text-[18px] text-brand-muted cursor-pointer shrink-0">✕</button>
            </div>
            <DetailGrid partner={selected} />
          </div>
        )}

        {isEmpty ? (
          <p className="text-center py-10 px-4 text-brand-muted text-[13px] md:text-[14px]">
            {search ? "No requests match your search" : "No requests yet"}
          </p>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FFEDD5]">
                    {["Brand", "Contact", "Type", "Account", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-[13px] text-left text-[12px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map(p => (
                    <tr
                      key={p._id}
                      onClick={() => setSelected(selected?._id === p._id ? null : p)}
                      className={`border-b border-[#fdf0ea] cursor-pointer transition-colors duration-150
                        ${selected?._id === p._id ? "bg-[#f0f9ff]" : "hover:bg-[rgba(241,90,33,0.05)]"}`}
                    >
                      <td className="px-4 py-[14px]">
                        <p className="text-[14px] font-semibold text-brand-dark m-0">{p.brandName}</p>
                        <p className="text-[12px] text-brand-muted m-0">{p.tradeLicenseNumber}</p>
                      </td>
                      <td className="px-4 py-[14px]">
                        <p className="text-[13px] text-brand-dark m-0">{p.firstName} {p.lastName}</p>
                        <p className="text-[12px] text-brand-muted m-0">{p.email}</p>
                      </td>
                      <td className="px-4 py-[14px] text-[13px] text-brand-gray">{p.businessType}</td>
                      <td className="px-4 py-[14px] text-[13px] text-brand-gray">{p.accountType}</td>
                      <td className="px-4 py-[14px]"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-[14px]">
                        <div className="flex gap-[6px]" onClick={e => e.stopPropagation()}>
                          {p.status !== "Approved" && (
                            <button
                              disabled={updating === p._id}
                              onClick={() => changeStatus(p._id, "Approved")}
                              className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold bg-green-50 text-green-700 border-none cursor-pointer disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {p.status !== "Rejected" && (
                            <button
                              disabled={updating === p._id}
                              onClick={() => changeStatus(p._id, "Rejected")}
                              className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold bg-red-50 text-red-600 border-none cursor-pointer disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => del(p._id)}
                            className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold bg-gray-50 text-brand-gray border-none cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards (tap to expand detail inline) ── */}
            <div className="md:hidden flex flex-col gap-3 px-4 pb-4">
              {filteredPartners.map(p => {
                const open = selected?._id === p._id;
                return (
                  <div
                    key={p._id}
                    className={`bg-brand-white border rounded-[14px] p-4 transition-colors
                      ${open ? "border-brand-primary" : "border-brand-border"}`}
                  >
                    {/* Tap area */}
                    <div onClick={() => setSelected(open ? null : p)} className="cursor-pointer">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-brand-dark m-0 truncate">{p.brandName}</p>
                          <p className="text-[11.5px] text-brand-muted m-0 truncate">{p.tradeLicenseNumber}</p>
                        </div>
                        <span className="text-[13px] text-brand-muted shrink-0 leading-none mt-1">{open ? "▲" : "▼"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="min-w-0">
                          <p className="text-[10.5px] text-brand-muted m-0 mb-[2px]">Contact</p>
                          <p className="text-[12.5px] font-semibold text-brand-dark m-0 truncate">{p.firstName} {p.lastName}</p>
                          <p className="text-[11.5px] text-brand-muted m-0 truncate">{p.email}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10.5px] text-brand-muted m-0 mb-[2px]">Business</p>
                          <p className="text-[12.5px] font-semibold text-brand-dark m-0 truncate">{p.businessType}</p>
                          <p className="text-[11.5px] text-brand-muted m-0 truncate">{p.accountType}</p>
                        </div>
                      </div>

                      <div className="mb-3"><StatusBadge status={p.status} /></div>
                    </div>

                    {/* Expanded detail */}
                    {open && (
                      <div className="pt-3 mb-3 border-t border-brand-border">
                        <DetailGrid partner={p} />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {p.status !== "Approved" && (
                        <button
                          disabled={updating === p._id}
                          onClick={() => changeStatus(p._id, "Approved")}
                          className="flex-1 py-[8px] rounded-[8px] text-[12px] font-semibold bg-green-50 text-green-700 border-none cursor-pointer disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {p.status !== "Rejected" && (
                        <button
                          disabled={updating === p._id}
                          onClick={() => changeStatus(p._id, "Rejected")}
                          className="flex-1 py-[8px] rounded-[8px] text-[12px] font-semibold bg-red-50 text-red-600 border-none cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => del(p._id)}
                        className="flex-1 py-[8px] rounded-[8px] text-[12px] font-semibold bg-gray-100 text-brand-gray border-none cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isEmpty && (
          <div className="flex items-center justify-between gap-2 px-4 md:px-6 py-3 md:py-4 border-t border-brand-border">
            <button
              disabled={page <= 1}
              onClick={() => { setPage(p => p - 1); load(page - 1); }}
              className="px-3 py-[7px] border border-brand-border rounded-[8px] text-[12px] bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-[11.5px] md:text-[12px] text-brand-muted whitespace-nowrap">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => { setPage(p => p + 1); load(page + 1); }}
              className="px-3 py-[7px] border border-brand-border rounded-[8px] text-[12px] bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center px-4 md:px-6 py-3 md:py-4 border-t border-brand-border">
          <span className="text-[11.5px] md:text-[12px] text-brand-muted">
            Showing {filteredPartners.length} of {partners.length} requests
          </span>
        </div>

      </div>
    </div>
  );
}
