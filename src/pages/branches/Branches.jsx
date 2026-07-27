// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const BASE  = "https://el-distibutor-backend.onrender.com";
// const token = () => localStorage.getItem("adminToken");

// const apiFetch = (path, opts = {}) =>
//   fetch(`${BASE}${path}`, {
//     ...opts,
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
//   }).then(r => r.json());

// export default function Branches() {
//   const [branches,   setBranches]   = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [syncing,    setSyncing]    = useState(false);
//   const [filter,     setFilter]     = useState("All");
//   const [typeFilter, setTypeFilter] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();

//   // ✅ STEP 1: Cache se data nikalo
//   useEffect(() => {
//     const cached = localStorage.getItem("branchesCache");
//     if (cached) {
//       try {
//         const data = JSON.parse(cached);
//         setBranches(data.branches || []);
//         setLoading(false);
//       } catch (e) {
//         console.error("Cache error:", e);
//       }
//     }
//   }, []);

//   // ✅ STEP 2: API se fresh data fetch karo (Background)
//   const load = async (st = filter, tt = typeFilter) => {
//     try {
//       setSyncing(true);
//       let q = [];
//       if (st !== "All") q.push(`status=${st}`);
//       if (tt !== "All") q.push(`accountType=${tt}`);
      
//       const data = await apiFetch(`/api/branch/admin/branches${q.length ? "?" + q.join("&") : ""}`);
      
//       if (data.success) {
//         setBranches(data.data);

//         // Cache save karo
//         localStorage.setItem("branchesCache", JSON.stringify({
//           branches: data.data,
//         }));

//         if (loading) setLoading(false);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       if (loading && !localStorage.getItem("branchesCache")) {
//         setLoading(false);
//       }
//     } finally {
//       setSyncing(false);
//     }
//   };

//   // ✅ STEP 3: Component mount par fetch karo
//   useEffect(() => {
//     load(filter, typeFilter);
//     // Har 30 seconds mein refresh
//     const interval = setInterval(() => load(filter, typeFilter), 30000);
//     return () => clearInterval(interval);
//   }, [filter, typeFilter]);

//   const approve = async (id, action) => {
//     const reason = action === "reject" ? prompt("Rejection reason?") : "";
//     if (action === "reject" && !reason) return;
//     const data = await apiFetch(`/api/branch/admin/branches/${id}/approve`, {
//       method: "PUT",
//       body:   JSON.stringify({ action, reason }),
//     });
//     if (data.success) {
//       const updated = setBranches(bs => bs.map(b => b._id === id ? { ...b, status: action === "approve" ? "approved" : "rejected" } : b));
//       // Cache update
//       localStorage.setItem("branchesCache", JSON.stringify({ branches: updated }));
//     }
//   };

//   const toggleActive = async (id) => {
//     const data = await apiFetch(`/api/branch/admin/branches/${id}/toggle`, { method: "PUT" });
//     if (data.success) {
//       const updated = branches.map(b => b._id === id ? { ...b, isActive: !b.isActive } : b);
//       setBranches(updated);
//       // Cache update
//       localStorage.setItem("branchesCache", JSON.stringify({ branches: updated }));
//     }
//   };

//   const del = async (id) => {
//     if (!confirm("Delete this branch?")) return;
//     await apiFetch(`/api/branch/admin/branches/${id}`, { method: "DELETE" });
//     const updated = branches.filter(b => b._id !== id);
//     setBranches(updated);
//     // Cache update
//     localStorage.setItem("branchesCache", JSON.stringify({ branches: updated }));
//   };

//   // Doc status badge helper
//   const docStatus = (b) => {
//     const hasContract = !!b.contractPdf;
//     const hasPdc      = b.accountType === "Buyer" ? !!b.pdcImage && !!b.pdcAmount : true;
//     const allDone     = hasContract && hasPdc;
//     if (allDone) return { label: "✓ Done",    bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" };
//     if (!hasContract && !hasPdc)
//                   return { label: "⚠ Pending", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
//     return          { label: "◑ Partial",  bg: "#fffbeb", color: "#d97706", border: "#fde68a" };
//   };

//   const statusFilters = ["All", "pending", "approved", "rejected"];
//   const typeFilters   = ["All", "Supplier", "Buyer"];

//   // Filter branches by search term
//   const filteredBranches = branches.filter(b =>
//     b.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     b.companyName.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div style={styles.container}>

//       {/* Header with Orange Background and Filters */}
//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.title}>Branches</h1>
//           <p style={styles.subtitle}>
//             {filteredBranches.length} branches
//             {syncing && <span style={styles.syncingBadge}>↻ Syncing...</span>}
//           </p>
//         </div>
//         <div style={styles.filterBar}>
//           {statusFilters.map(f => (
//             <button
//               key={f}
//               onClick={() => setFilter(f)}
//               style={{
//                 ...styles.filterBtn,
//                 background: filter === f ? "#fff" : "transparent",
//                 color: filter === f ? "#F15A21" : "#fff",
//                 boxShadow: filter === f ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
//               }}
//             >
//               {f.charAt(0).toUpperCase() + f.slice(1)}
//             </button>
//           ))}
//           <div style={styles.separator}></div>
//           {typeFilters.map(f => (
//             <button
//               key={f}
//               onClick={() => setTypeFilter(f)}
//               style={{
//                 ...styles.filterBtn,
//                 background: typeFilter === f ? "#fff" : "transparent",
//                 color: typeFilter === f ? "#F15A21" : "#fff",
//                 boxShadow: typeFilter === f ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
//               }}
//             >
//               {f}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Search Bar Below Header */}
//       <div style={styles.searchContainer}>
//         <input
//           type="text"
//           placeholder="Search by manager name, email, or company..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={styles.searchInput}
//         />
//       </div>

//       {/* Table with Orange Header */}
//       <div style={styles.tableContainer}>
//         {loading ? (
//           <p style={styles.loadingText}>Loading...</p>
//         ) : filteredBranches.length === 0 ? (
//           <p style={styles.emptyText}>{searchTerm ? "No branches found matching your search" : "No branches found"}</p>
//         ) : (
//           <table style={styles.table}>
//             <thead>
//               <tr style={styles.tableHead}>
//                 {["Manager", "Company", "Type", "Status", "Active", "Step", "Docs", "Actions"].map(h => (
//                   <th key={h} style={styles.th}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredBranches.map(b => {
//                 const ds = docStatus(b);
//                 return (
//                   <tr key={b._id} style={styles.tableRow}>
//                     <td style={styles.td}>
//                       <p style={styles.brandName}>{b.managerName}</p>
//                       <p style={styles.licenseText}>{b.email}</p>
//                     </td>
//                     <td style={styles.td}>
//                       <p style={styles.contactName}>{b.companyName}</p>
//                     </td>
//                     <td style={styles.td}>
//                       <span style={{
//                         padding: "2px 8px",
//                         borderRadius: "10px",
//                         fontSize: "11px",
//                         background: b.accountType === "Supplier" ? "#f0fdf4" : "#eff6ff",
//                         color: b.accountType === "Supplier" ? "#16a34a" : "#1d4ed8"
//                       }}>
//                         {b.accountType}
//                       </span>
//                     </td>
//                     <td style={styles.td}>
//                       <span style={{
//                         padding: "2px 8px",
//                         borderRadius: "10px",
//                         fontSize: "11px",
//                         background: b.status === "approved" ? "#f0fdf4" : b.status === "pending" ? "#fffbeb" : "#fef2f2",
//                         color: b.status === "approved" ? "#16a34a" : b.status === "pending" ? "#d97706" : "#dc2626"
//                       }}>
//                         {b.status}
//                       </span>
//                     </td>
//                     <td style={styles.td}>
//                       <span style={{
//                         padding: "2px 8px",
//                         borderRadius: "10px",
//                         fontSize: "11px",
//                         background: b.isActive ? "#f0fdf4" : "#f9fafb",
//                         color: b.isActive ? "#16a34a" : "#6b7280"
//                       }}>
//                         {b.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                     <td style={styles.td}>
//                       Step {b.registrationStep}/3
//                     </td>

//                     {/* Docs Column */}
//                     <td style={styles.td}>
//                       <button
//                         onClick={() => navigate(`/branches/${b._id}/detail`)}
//                         style={{
//                           padding: "4px 10px",
//                           border: `1px solid ${ds.border}`,
//                           borderRadius: "8px",
//                           fontSize: "11px",
//                           fontWeight: "600",
//                           background: ds.bg,
//                           color: ds.color,
//                           cursor: "pointer",
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         {ds.label}
//                       </button>
//                     </td>

//                     {/* Actions */}
//                     <td style={styles.td}>
//                       <div style={styles.actions}>
//                         {b.status === "pending" && (
//                           <>
//                             <button
//                               onClick={() => approve(b._id, "approve")}
//                               style={styles.approveBtn}
//                             >
//                               Approve
//                             </button>
//                             <button
//                               onClick={() => approve(b._id, "reject")}
//                               style={styles.rejectBtn}
//                             >
//                               Reject
//                             </button>
//                           </>
//                         )}
//                         <button
//                           onClick={() => toggleActive(b._id)}
//                           style={styles.toggleBtn}
//                         >
//                           {b.isActive ? "Deactivate" : "Activate"}
//                         </button>
//                         <button
//                           onClick={() => del(b._id)}
//                           style={styles.deleteBtn}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
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

//     flexWrap: "wrap",
//     gap: "12px",
//     flexShrink: 0,
//     // background: "#F15A21",
//     padding: "16px 0px",
//     borderRadius: "10px",
//   },
//   title: {
//     fontSize: "20px",
//     fontWeight: "600",
//     margin: 0,
//     color: "#000",
//   },
//   subtitle: {
//     fontSize: "13px",
//     color: "#000",
//     marginTop: "4px",
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//   },
//   syncingBadge: {
//     fontSize: "12px",
//     color: "#fef3c7",
//     fontWeight: "600",
//   },
//   filterBar: {
//     display: "flex",
//     gap: "4px",
//     padding: "10px",
//     borderRadius: "8px",
//     alignItems: "center",
//     background:"#F15A21"
//   },
//   filterBtn: {
//     padding: "6px 12px",
//     border: "none",
//     borderRadius: "4px",
//     fontSize: "13px",
//     cursor: "pointer",
//     fontWeight: "500",
//     transition: "all 0.2s",

//   },
//   separator: {
//     width: "1px",
//     height: "20px",
//     background: "rgba(255, 255, 255, 0.3)",
//     margin: "0 4px",
//   },
//   searchContainer: {
//     position: "relative",
//     marginBottom: "12px",
//     flexShrink: 0,
//   },
//   searchInput: {
//     width: "100%",
//     padding: "10px 12px",
//     border: "1px solid #ccc",
//     borderRadius: "8px",
//     fontSize: "13px",
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
//   actions: {
//     display: "flex",
//     gap: "6px",
//     flexWrap: "wrap",
//   },
//   approveBtn: {
//     padding: "4px 8px",
//     background: "#f0fdf4",
//     color: "#16a34a",
//     border: "1px solid #bbf7d0",
//     borderRadius: "6px",
//     fontSize: "11px",
//     cursor: "pointer",
//   },
//   rejectBtn: {
//     padding: "4px 8px",
//     background: "#fef2f2",
//     color: "#dc2626",
//     border: "1px solid #fecaca",
//     borderRadius: "6px",
//     fontSize: "11px",
//     cursor: "pointer",
//   },
//   toggleBtn: {
//     padding: "4px 8px",
//     background: "#fff",
//     border: "1px solid #e5e7eb",
//     borderRadius: "6px",
//     fontSize: "11px",
//     cursor: "pointer",
//   },
//   deleteBtn: {
//     padding: "4px 8px",
//     background: "#fef2f2",
//     color: "#dc2626",
//     border: "1px solid #fecaca",
//     borderRadius: "6px",
//     fontSize: "11px",
//     cursor: "pointer",
//   },
// };







import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import Loader from "../../components/Loader";


const BASE  = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
  }).then(r => r.json());

export default function Branches() {
  const [branches,   setBranches]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [syncing,    setSyncing]    = useState(false);
  const [filter,     setFilter]     = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const cached = localStorage.getItem("branchesCache");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setBranches(data.branches || []);
        setLoading(false);
      } catch (e) { console.error(e); }
    }
  }, []);

  const load = async (st = filter) => {
    try {
      setSyncing(true);
      const q = st !== "All" ? `?status=${st}` : "";
      const data = await apiFetch(`/api/branch/admin/branches${q}`);
      if (data.success) {
        setBranches(data.data);
        localStorage.setItem("branchesCache", JSON.stringify({ branches: data.data }));
        if (loading) setLoading(false);
      }
    } catch (err) {
      console.error(err);
      if (loading && !localStorage.getItem("branchesCache")) setLoading(false);
    } finally { setSyncing(false); }
  };

  useEffect(() => {
    load(filter);
    const interval = setInterval(() => load(filter), 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const approve = async (id, action) => {
    const reason = action === "reject" ? prompt("Rejection reason?") : "";
    if (action === "reject" && !reason) return;
    const data = await apiFetch(`/api/branch/admin/branches/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({ action, reason }),
    });
    if (data.success) {
      const updated = branches.map(b => b._id === id ? { ...b, status: action === "approve" ? "approved" : "rejected" } : b);
      setBranches(updated);
      localStorage.setItem("branchesCache", JSON.stringify({ branches: updated }));
    }
  };

  const toggleActive = async (id) => {
    const data = await apiFetch(`/api/branch/admin/branches/${id}/toggle`, { method: "PUT" });
    if (data.success) {
      const updated = branches.map(b => b._id === id ? { ...b, isActive: !b.isActive } : b);
      setBranches(updated);
      localStorage.setItem("branchesCache", JSON.stringify({ branches: updated }));
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this branch?")) return;
    await apiFetch(`/api/branch/admin/branches/${id}`, { method: "DELETE" });
    const updated = branches.filter(b => b._id !== id);
    setBranches(updated);
    localStorage.setItem("branchesCache", JSON.stringify({ branches: updated }));
  };

  const docStatus = (b) => {
    const hasContract = !!b.contractPdf;
    const hasPdc      = b.accountType === "Buyer" ? !!b.pdcImage && !!b.pdcAmount : true;
    const allDone     = hasContract && hasPdc;
    if (allDone)               return { label: "✓ Done",    bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
    if (!hasContract && !hasPdc) return { label: "⚠ Pending", bg: "bg-red-50",   text: "text-red-600",   border: "border-red-200"   };
    return                           { label: "◑ Partial",  bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" };
  };

  const filteredBranches = branches.filter(b =>
    b.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount    = branches.length;
  const pendingCount  = branches.filter(b => b.status === "pending").length;
  const approvedCount = branches.filter(b => b.status === "approved").length;
  const rejectedCount = branches.filter(b => b.status === "rejected").length;

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px] mx-auto">

      {/* Stat Cards */}
      <div className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard icon="mappin"   value={totalCount.toLocaleString()}    label="Total Branches"  active={filter === "All"}       onClick={() => setFilter("All")}      />
        <StatCard icon="clock"    value={pendingCount.toLocaleString()}  label="Pending"         active={filter === "pending"}   onClick={() => setFilter("pending")}  />
        <StatCard icon="check"    value={approvedCount.toLocaleString()} label="Approved"        active={filter === "approved"}  onClick={() => setFilter("approved")} />
        <StatCard icon="xcircle"  value={rejectedCount.toLocaleString()} label="Rejected"        active={filter === "rejected"}  onClick={() => setFilter("rejected")} />
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-5 pb-4">
          <div>
            <h1 className="text-[17px] md:text-[19px] font-bold text-brand-dark m-0">Branch Requests</h1>
            <p className="text-[12px] text-brand-muted mt-1 flex items-center gap-2">
              {filteredBranches.length} branches
              {syncing && <span className="text-brand-primary font-semibold">Syncing...</span>}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 pb-4">
          <input
            type="text"
            placeholder="Search by manager name, email, or company..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-[10px] border border-brand-border rounded-[10px] text-[13px] outline-none bg-white focus:border-brand-primary transition-all"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredBranches.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[14px]">
              {searchTerm ? "No branches found matching your search" : "No branches found"}
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["Manager", "Company", "Type", "Status", "Active", "Step", "Docs", "Actions"].map(h => (
                    <th key={h} className="px-4 py-[13px] text-left text-[12px] text-[#7c3a1e] font-bold tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map(b => {
                  const ds = docStatus(b);
                  return (
                    <tr key={b._id}
                      className="border-b border-[#fdf0ea] transition-colors duration-150 hover:bg-[rgba(241,90,33,0.05)]"
                    >
                      <td className="px-4 py-[14px]">
                        <p className="text-[14px] font-semibold text-brand-dark m-0">{b.managerName}</p>
                        <p className="text-[12px] text-brand-muted m-0">{b.email}</p>
                      </td>
                      <td className="px-4 py-[14px]">
                        <p className="text-[13px] text-brand-dark m-0">{b.companyName}</p>
                      </td>
                      <td className="px-4 py-[14px]">
                        <span className={`px-2 py-[2px] rounded-[10px] text-[11px] font-semibold
                          ${b.accountType === "Supplier" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                          {b.accountType}
                        </span>
                      </td>
                      <td className="px-4 py-[14px]">
                        <span className={`px-2 py-[2px] rounded-[10px] text-[11px] font-semibold
                          ${b.status === "approved" ? "bg-green-50 text-green-700"
                          : b.status === "pending"  ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-[14px]">
                        <span className={`px-2 py-[2px] rounded-[10px] text-[11px] font-semibold
                          ${b.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {b.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-[14px] text-[13px] text-brand-gray">
                        Step {b.registrationStep}/2
                      </td>
                      <td className="px-4 py-[14px]">
                        <button
                          onClick={() => navigate(`/branches/${b._id}/detail`)}
                          className={`px-3 py-[4px] rounded-[8px] text-[11px] font-semibold border cursor-pointer whitespace-nowrap
                            ${ds.bg} ${ds.text} ${ds.border}`}
                        >
                          {ds.label}
                        </button>
                      </td>
                      <td className="px-4 py-[14px]">
                        <div className="flex gap-[6px] flex-wrap">
                          {b.status === "pending" && (
                            <>
                              <button onClick={() => approve(b._id, "approve")}
                                className="px-2 py-[4px] rounded-[6px] text-[11px] font-semibold bg-green-50 text-green-700 border-none cursor-pointer">
                                Approve
                              </button>
                              <button onClick={() => approve(b._id, "reject")}
                                className="px-2 py-[4px] rounded-[6px] text-[11px] font-semibold bg-red-50 text-red-600 border-none cursor-pointer">
                                Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => toggleActive(b._id)}
                            className="px-2 py-[4px] rounded-[6px] text-[11px] font-semibold bg-brand-primary text-white border-none cursor-pointer">
                            {b.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => del(b._id)}
                            className="px-2 py-[4px] rounded-[6px] text-[11px] font-semibold bg-red-50 text-red-600 border-none cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center px-4 md:px-6 py-4 border-t border-brand-border">
          <span className="text-[12px] text-brand-muted">
            Showing {filteredBranches.length} of {branches.length} branches
          </span>
        </div>

      </div>
    </div>
  );
}