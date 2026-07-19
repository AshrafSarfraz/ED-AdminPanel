// import { useState, useEffect } from "react";

// const BASE = "https://el-distibutor-backend.onrender.com";
// const token = () => localStorage.getItem("adminToken");

// const apiFetch = (path, opts = {}) =>
//   fetch(`${BASE}${path}`, {
//     ...opts,
//     headers: { 
//       "Content-Type": "application/json", 
//       Authorization: `Bearer ${token()}`, 
//       ...(opts.headers || {}) 
//     },
//   }).then(r => r.json());

// const StatusBadge = ({ status }) => {
//   const map = {
//     "New Request": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
//     "Approved":    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
//     "Rejected":    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
//   };
//   const s = map[status] || { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" };
//   return (
//     <span style={{ ...styles.badge, background: s.bg, color: s.color, borderColor: s.border }}>
//       {status}
//     </span>
//   );
// };

// export default function Partners() {
//   const [partners, setPartners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [syncing, setSyncing] = useState(false);
//   const [filter, setFilter] = useState("All");
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState(null);
//   const [updating, setUpdating] = useState(null);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // ✅ STEP 1: Cache se data nikalo
//   useEffect(() => {
//     const cached = localStorage.getItem("partnersCache");
//     if (cached) {
//       try {
//         const data = JSON.parse(cached);
//         setPartners(data.partners || []);
//         setTotalPages(data.totalPages || 1);
//         setLoading(false);
//       } catch (e) {
//         console.error("Cache error:", e);
//       }
//     }
//   }, []);

//   // ✅ STEP 2: API se fresh data fetch karo (Background)
//   const load = async (pg = 1, st = filter) => {
//     try {
//       setSyncing(true);
//       const q = st !== "All" ? `&status=${encodeURIComponent(st)}` : "";
//       const data = await apiFetch(`/api/becomePartner?page=${pg}&limit=20${q}`);
      
//       if (data.success) {
//         setPartners(data.data);
//         setTotalPages(data.pages || 1);

//         // Cache save karo
//         localStorage.setItem("partnersCache", JSON.stringify({
//           partners: data.data,
//           totalPages: data.pages || 1,
//         }));

//         if (loading) setLoading(false);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       if (loading && !localStorage.getItem("partnersCache")) {
//         setLoading(false);
//       }
//     } finally {
//       setSyncing(false);
//     }
//   };

//   // ✅ STEP 3: Component mount par fetch karo
//   useEffect(() => {
//     load(1, filter);
//     // Har 30 seconds mein refresh
//     const interval = setInterval(() => load(page, filter), 30000);
//     return () => clearInterval(interval);
//   }, [filter]);

//   // ✅ SEARCH FILTER - Brand name, email, phone se search karo
//   const filteredPartners = partners.filter(p => {
//     const searchLower = search.toLowerCase();
//     return (
//       p.brandName.toLowerCase().includes(searchLower) ||
//       p.email.toLowerCase().includes(searchLower) ||
//       p.phone.includes(search) ||
//       p.firstName.toLowerCase().includes(searchLower) ||
//       p.lastName.toLowerCase().includes(searchLower)
//     );
//   });

//   const changeStatus = async (id, status) => {
//     setUpdating(id);
//     const data = await apiFetch(`/api/becomePartner/${id}/status`, { 
//       method: "PATCH", 
//       body: JSON.stringify({ status }) 
//     });
//     if (data.success) {
//       setPartners(ps => ps.map(p => p._id === id ? { ...p, status } : p));
//       if (selected?._id === id) setSelected(s => ({ ...s, status }));
//       // Cache update karo
//       localStorage.setItem("partnersCache", JSON.stringify({
//         partners: partners.map(p => p._id === id ? { ...p, status } : p),
//         totalPages,
//       }));
//     }
//     setUpdating(null);
//   };

//   const del = async (id) => {
//     if (!confirm("Delete this partner request?")) return;
//     await apiFetch(`/api/becomePartner/${id}`, { method: "DELETE" });
//     const updated = partners.filter(p => p._id !== id);
//     setPartners(updated);
//     if (selected?._id === id) setSelected(null);
//     // Cache update karo
//     localStorage.setItem("partnersCache", JSON.stringify({
//       partners: updated,
//       totalPages,
//     }));
//   };

//   const filters = ["All", "New Request", "Approved", "Rejected"];

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.title}>Partner requests</h1>
//           <p style={styles.subtitle}>
//             Manage become-a-partner applications
//             {syncing && <span style={styles.syncingBadge}>↻ Syncing...</span>}
//           </p>
//         </div>
//         <div style={styles.filterBar}>
//           {filters.map(f => (
//             <button
//               key={f}
//               onClick={() => { setFilter(f); setPage(1); }}
//               style={{
//                 ...styles.filterBtn,
//                 background: filter === f ? "#F15A21 " : "transparent",
//                 color: filter === f ? "#fff" : "#000",
//                 boxShadow: filter === f ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
//               }}
//             >
//               {f}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div style={styles.searchContainer}>
//         <input
//           type="text"
//           placeholder="Search by brand name, email, phone, or contact person..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={styles.searchInput}
//         />
//       </div>


//       {/* Detail Panel */}
//       {selected && (
//         <div style={styles.detailPanel}>
//           <div style={styles.detailHeader}>
//             <div>
//               <h2 style={styles.detailTitle}>{selected.brandName}</h2>
//               <StatusBadge status={selected.status} />
//             </div>
//             <button 
//               onClick={() => setSelected(null)} 
//               style={styles.closeBtn}
//             >
//               ✕
//             </button>
//           </div>
//           <div style={styles.detailGrid}>
//             {[
//               ["Full name", `${selected.firstName} ${selected.lastName}`],
//               ["Email", selected.email],
//               ["Phone", selected.phone],
//               ["Role", selected.roleInBusiness],
//               ["Business type", selected.businessType],
//               ["Account type", selected.accountType],
//               ["Branches", selected.numberOfBranches],
//               ["License #", selected.tradeLicenseNumber],
//               ["Submitted", new Date(selected.createdAt).toLocaleDateString()],
//             ].map(([label, val]) => (
//               <div key={label}>
//                 <p style={styles.detailLabel}>{label}</p>
//                 <p style={styles.detailValue}>{val}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       <div style={styles.tableContainer} className="hide-scrollbar">
//         {loading ? (
//           <p style={styles.loadingText}>Loading...</p>
//         ) : filteredPartners.length === 0 ? (
//           <p style={styles.emptyText}>{search ? "No requests found matching your search" : "No requests found"}</p>
//         ) : (
//           <table style={styles.table}>
//             <thead>
//               <tr style={styles.tableHead}>
//                 {["Brand", "Contact", "Type", "Account", "Status", "Actions"].map(h => (
//                   <th key={h} style={styles.th}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredPartners.map(p => (
//                 <tr
//                   key={p._id}
//                   onClick={() => setSelected(selected?._id === p._id ? null : p)}
//                   style={{
//                     ...styles.tableRow,
//                     background: selected?._id === p._id ? "#f0f9ff" : "transparent",
//                   }}
//                 >
//                   <td style={styles.td}>
//                     <p style={styles.brandName}>{p.brandName}</p>
//                     <p style={styles.licenseText}>{p.tradeLicenseNumber}</p>
//                   </td>
//                   <td style={styles.td}>
//                     <p style={styles.contactName}>{p.firstName} {p.lastName}</p>
//                     <p style={styles.emailText}>{p.email}</p>
//                   </td>
//                   <td style={styles.td}>{p.businessType}</td>
//                   <td style={styles.td}>{p.accountType}</td>
//                   <td style={styles.td}>
//                     <StatusBadge status={p.status} />
//                   </td>
//                   <td style={styles.td}>
//                     <div style={styles.actions} onClick={e => e.stopPropagation()}>
//                       {p.status !== "Approved" && (
//                         <button
//                           disabled={updating === p._id}
//                           onClick={() => changeStatus(p._id, "Approved")}
//                           style={{
//                             ...styles.approveBtn,
//                             opacity: updating === p._id ? 0.5 : 1,
//                           }}
//                         >
//                           Approve
//                         </button>
//                       )}
//                       {p.status !== "Rejected" && (
//                         <button
//                           disabled={updating === p._id}
//                           onClick={() => changeStatus(p._id, "Rejected")}
//                           style={{
//                             ...styles.rejectBtn,
//                             opacity: updating === p._id ? 0.5 : 1,
//                           }}
//                         >
//                           Reject
//                         </button>
//                       )}
//                       <button
//                         onClick={() => del(p._id)}
//                         style={styles.deleteBtn}
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && filteredPartners.length > 0 && (
//           <div style={styles.pagination}>
//             <button 
//               disabled={page <= 1} 
//               onClick={() => { setPage(p => p - 1); load(page - 1); }} 
//               style={{
//                 ...styles.paginationBtn,
//                 opacity: page <= 1 ? 0.4 : 1,
//                 cursor: page <= 1 ? "not-allowed" : "pointer",
//               }}
//             >
//               Previous
//             </button>
//             <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
//             <button 
//               disabled={page >= totalPages} 
//               onClick={() => { setPage(p => p + 1); load(page + 1); }} 
//               style={{
//                 ...styles.paginationBtn,
//                 opacity: page >= totalPages ? 0.4 : 1,
//                 cursor: page >= totalPages ? "not-allowed" : "pointer",
//               }}
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// }

// const styles = {
//   container: { maxWidth: "1500px", padding:'10px', margin: "0 auto", },
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "16px",
//     flexWrap: "wrap",
//     gap: "12px",
//     flexShrink: 0,
//   },
//   title: {
//     fontSize: "20px",
//     fontWeight: "600",
//     margin: 0,
//   },
//   subtitle: {
//     fontSize: "13px",
//     color: "#6b7280",
//     marginTop: "4px",
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//   },
//   syncingBadge: {
//     fontSize: "12px",
//     color: "#f97316",
//     fontWeight: "600",
//   },
//   filterBar: {
//     display: "flex",
//     gap: "4px",
//     background: "#fff",
//     padding: "10px",
//     borderRadius: "10px",
//   },
//   filterBtn: {
//     padding: "6px 12px",
//     border: "none",
//     borderRadius: "4px",
//     fontSize: "14px",
//     cursor: "pointer",
//     fontWeight: "500",
//     transition: "all 0.2s",
//   },
//   searchContainer: {
//     position: "relative",
//     marginBottom: "12px",
//     flexShrink: 0,
//   },
//   searchInput: {
//     width: "100%",
//     padding: "10px 10px 10px 10px",
//     border: "1px solid #ccc",
//     borderRadius: "8px",
//     fontSize: "12px",
//     outline: "none",
//     boxSizing: "border-box",
//     transition: "border-color 0.2s",
//   },

//   tableContainer: {
//     background: "#fff",
//     border: "1px solid #e5e7eb",
//     borderRadius: "14px",
//     overflow: "hidden",
//     overflowY: "auto",
//     flex: 1,
//     minHeight: 0,
//   },
//   loadingText: {
//     textAlign: "center",
//     padding: "40px",
//     color: "#9ca3af",
//     fontSize: "14px",
//     margin: 0,
//   },
//   emptyText: {
//     textAlign: "center",
//     padding: "40px",
//     color: "#9ca3af",
//     fontSize: "14px",
//     margin: 0,
//   },
//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//   },
//   tableHead: {
//     borderBottom: "1px solid #F15A21",
//     background: "#F15A21",
//   },
//   th: {
//     padding: "12px 16px",
//     textAlign: "left",
//     fontSize: "12px",
//     color: "#fff",
//     fontWeight: "500",
//   },
//   tableRow: {
//     borderBottom: "1px solid #f9fafb",
//     cursor: "pointer",
//     transition: "background-color 0.2s",
//   },
//   td: {
//     padding: "12px 16px",
//     fontSize: "13px",
//     color: "#6b7280",
//   },
//   brandName: {
//     fontSize: "14px",
//     fontWeight: "500",
//     margin: 0,
//     color: "#111827",
//   },
//   licenseText: {
//     fontSize: "12px",
//     color: "#9ca3af",
//     margin: 0,
//   },
//   contactName: {
//     fontSize: "13px",
//     margin: 0,
//     color: "#111827",
//   },
//   emailText: {
//     fontSize: "12px",
//     color: "#9ca3af",
//     margin: 0,
//   },
//   badge: {
//     padding: "2px 10px",
//     borderRadius: "20px",
//     fontSize: "12px",
//     border: "1px solid",
//   },
//   actions: {
//     display: "flex",
//     gap: "6px",
//   },
//   approveBtn: {
//     padding: "4px 10px",
//     border: "1px solid #bbf7d0",
//     borderRadius: "6px",
//     fontSize: "12px",
//     cursor: "pointer",
//     background: "#f0fdf4",
//     color: "#16a34a",
//   },
//   rejectBtn: {
//     padding: "4px 10px",
//     border: "1px solid #fecaca",
//     borderRadius: "6px",
//     fontSize: "12px",
//     cursor: "pointer",
//     background: "#fef2f2",
//     color: "#dc2626",
//   },
//   deleteBtn: {
//     padding: "4px 10px",
//     border: "1px solid #e5e7eb",
//     borderRadius: "6px",
//     fontSize: "12px",
//     cursor: "pointer",
//     background: "#fff",
//     color: "#6b7280",
//   },
//   pagination: {
//     padding: "12px 16px",
//     borderTop: "1px solid #f3f4f6",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   paginationBtn: {
//     padding: "6px 12px",
//     border: "1px solid #e5e7eb",
//     borderRadius: "8px",
//     fontSize: "12px",
//     cursor: "pointer",
//     background: "#fff",
//   },
//   pageInfo: {
//     fontSize: "12px",
//     color: "#9ca3af",
//   },
//   detailPanel: {
//     marginBottom: "20px",
//     background: "#fff",
//     border: "1px solid #e5e7eb",
//     borderRadius: "14px",
//     padding: "20px",
//     flexShrink: 0,
//     maxHeight: "40vh",
//     overflowY: "auto",
    

//   },
//   detailHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: "16px",
//   },
//   detailTitle: {
//     fontSize: "16px",
//     fontWeight: "600",
//     margin: "0 0 4px",
//   },
//   closeBtn: {
//     background: "none",
//     border: "none",
//     fontSize: "18px",
//     color: "#9ca3af",
//     cursor: "pointer",
//   },
//   detailGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(3, 1fr)",
//     gap: "16px",
//   },
//   detailLabel: {
//     fontSize: "11px",
//     color: "#9ca3af",
//     margin: "0 0 2px",
//   },
//   detailValue: {
//     fontSize: "13px",
//     fontWeight: "500",
//     margin: 0,
//     color: "#111827",
//   },
// };



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
    <span className={`px-3 py-[3px] rounded-[20px] text-[12px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {status}
    </span>
  );
};

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

  return (
    <div className="max-w-[1500px] mx-auto">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard icon="handshake" value={totalCount.toLocaleString()}    label="Total Requests" active={filter === "All"}         onClick={() => { setFilter("All");         setPage(1); }} />
        <StatCard icon="bell"      value={newCount.toLocaleString()}      label="New Requests"   active={filter === "New Request"} onClick={() => { setFilter("New Request"); setPage(1); }} />
        <StatCard icon="check"     value={approvedCount.toLocaleString()} label="Approved"       active={filter === "Approved"}    onClick={() => { setFilter("Approved");    setPage(1); }} />
        <StatCard icon="xcircle"   value={rejectedCount.toLocaleString()} label="Rejected"       active={filter === "Rejected"}    onClick={() => { setFilter("Rejected");    setPage(1); }} />
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-5 pb-4">
          <div>
            <h1 className="text-[17px] md:text-[19px] font-bold text-brand-dark m-0">Partner Requests</h1>
            <p className="text-[12px] text-brand-muted mt-1 flex items-center gap-2">
              Manage become-a-partner applications
              {syncing && <span className="text-brand-primary font-semibold">↻ Syncing...</span>}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 pb-4">
          <input
            type="text"
            placeholder="Search by brand name, email, phone, or contact person..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-[10px] border border-brand-border rounded-[10px] text-[13px] outline-none bg-white focus:border-brand-primary transition-all"
          />
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="mx-4 md:mx-6 mb-4 bg-white border border-brand-border rounded-[14px] p-5 max-h-[40vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-bold text-brand-dark m-0 mb-1">{selected.brandName}</h2>
                <StatusBadge status={selected.status} />
              </div>
              <button onClick={() => setSelected(null)} className="bg-transparent border-none text-[18px] text-brand-muted cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ["Full name",     `${selected.firstName} ${selected.lastName}`],
                ["Email",         selected.email],
                ["Phone",         selected.phone],
                ["Role",          selected.roleInBusiness],
                ["Business type", selected.businessType],
                ["Account type",  selected.accountType],
                ["Branches",      selected.numberOfBranches],
                ["License #",     selected.tradeLicenseNumber],
                ["Submitted",     new Date(selected.createdAt).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[11px] text-brand-muted m-0 mb-[2px]">{label}</p>
                  <p className="text-[13px] font-semibold text-brand-dark m-0">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredPartners.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[14px]">
              {search ? "No requests found matching your search" : "No requests found"}
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["Brand", "Contact", "Type", "Account", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-[13px] text-left text-[12px] text-[#7c3a1e] font-bold tracking-wide">
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
          )}

          {/* Pagination */}
          {totalPages > 1 && filteredPartners.length > 0 && (
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-brand-border">
              <button
                disabled={page <= 1}
                onClick={() => { setPage(p => p - 1); load(page - 1); }}
                className="px-3 py-[6px] border border-brand-border rounded-[8px] text-[12px] bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[12px] text-brand-muted">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => { setPage(p => p + 1); load(page + 1); }}
                className="px-3 py-[6px] border border-brand-border rounded-[8px] text-[12px] bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center px-4 md:px-6 py-4 border-t border-brand-border">
          <span className="text-[12px] text-brand-muted">
            Showing {filteredPartners.length} of {partners.length} requests
          </span>
        </div>

      </div>
    </div>
  );
}