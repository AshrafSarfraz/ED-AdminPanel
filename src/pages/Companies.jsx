import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";

const BASE  = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
  }).then(r => r.json());

const DocsBadge = ({ status }) => {
  const map = {
    pending:   { bg: "bg-gray-50",   text: "text-gray-500",  border: "border-gray-200", label: "Pending"   },
    submitted: { bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200", label: "Submitted" },
    approved:  { bg: "bg-green-50",  text: "text-green-700", border: "border-green-200",label: "Approved"  },
    rejected:  { bg: "bg-red-50",    text: "text-red-600",   border: "border-red-200",  label: "Rejected"  },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`px-3 py-[3px] rounded-[20px] text-[12px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
};

const ActiveBadge = ({ isActive }) => (
  <span className={`px-3 py-[3px] rounded-[20px] text-[12px] font-semibold border
    ${isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
    {isActive ? "Active" : "Inactive"}
  </span>
);

export default function Companies() {
  const [companies,  setCompanies]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [syncing,    setSyncing]    = useState(false);
  const [filter,     setFilter]     = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const cached = localStorage.getItem("companiesCache");
    if (cached) {
      try { const d = JSON.parse(cached); setCompanies(d.companies || []); setLoading(false); }
      catch (e) { console.error(e); }
    }
  }, []);

  const load = async () => {
    try {
      setSyncing(true);
      const data = await apiFetch(`/api/company/admin/companies`);
      if (data.success) {
        setCompanies(data.data);
        localStorage.setItem("companiesCache", JSON.stringify({ companies: data.data }));
        if (loading) setLoading(false);
      }
    } catch (err) {
      console.error(err);
      if (loading && !localStorage.getItem("companiesCache")) setLoading(false);
    } finally { setSyncing(false); }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  const toggle = async (id) => {
    const data = await apiFetch(`/api/company/admin/companies/${id}/toggle-active`, { method: "PATCH" });
    if (data.success) {
      const updated = companies.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c);
      setCompanies(updated);
      localStorage.setItem("companiesCache", JSON.stringify({ companies: updated }));
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this company?")) return;
    const data = await apiFetch(`/api/company/admin/companies/${id}`, { method: "DELETE" });
    if (data.success) {
      const updated = companies.filter(c => c._id !== id);
      setCompanies(updated);
      localStorage.setItem("companiesCache", JSON.stringify({ companies: updated }));
    }
  };

  const selectAll      = () => { setTypeFilter("All");      setActiveOnly(false); };
  const selectActive   = () => { setActiveOnly(prev => !prev); };
  const selectSupplier = () => { setTypeFilter(prev => prev === "Supplier" ? "All" : "Supplier"); setActiveOnly(false); };
  const selectBuyer    = () => { setTypeFilter(prev => prev === "Buyer"    ? "All" : "Buyer");    setActiveOnly(false); };

  const filteredCompanies = companies
    .filter(c => (activeOnly ? c.isActive : true))
    .filter(c => (typeFilter !== "All" ? c.accountType === typeFilter : true))
    .filter(c => (filter !== "All" ? c.documentsStatus === filter : true))
    .filter(c =>
      c.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalCount    = companies.length;
  const activeCount   = companies.filter(c => c.isActive).length;
  const supplierCount = companies.filter(c => c.accountType === "Supplier").length;
  const buyerCount    = companies.filter(c => c.accountType === "Buyer").length;

  const isAllSelected      = typeFilter === "All" && !activeOnly;
  const isSupplierSelected = typeFilter === "Supplier";
  const isBuyerSelected    = typeFilter === "Buyer";

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1500px] ">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard icon="building"  value={totalCount.toLocaleString()}    label="Total Companies"  active={isAllSelected}      onClick={selectAll}      />
        <StatCard icon="check"     value={activeCount.toLocaleString()}   label="Active Companies" active={activeOnly}          onClick={selectActive}   />
        <StatCard icon="trending"  value={supplierCount.toLocaleString()} label="Supplier"         active={isSupplierSelected}  onClick={selectSupplier} />
        <StatCard icon="users"     value={buyerCount.toLocaleString()}    label="Buyer"            active={isBuyerSelected}     onClick={selectBuyer}    />
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-5 pb-4">
          <div>
            <h1 className="text-[17px] md:text-[19px] font-bold text-brand-dark m-0">Companies Management</h1>
            <p className="text-[12px] text-brand-muted mt-1">Monitor all registered companies and their branch operations</p>
          </div>
          {syncing && <span className="text-[12px] text-brand-primary font-semibold">↻ Syncing...</span>}
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 pb-4">
          <input
            type="text"
            placeholder="Search by brand name, email, phone, or contact person..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-[10px] border border-brand-border rounded-[10px] text-[13px] outline-none bg-white focus:border-brand-primary transition-all"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredCompanies.length === 0 ? (
            <p className="text-center py-10 text-brand-muted text-[14px]">
              {searchTerm ? "No companies found matching your search" : "No companies found"}
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FFEDD5]">
                  {["Company", "Contact", "Type", "Account", "Docs", "Active", "Actions"].map(h => (
                    <th key={h} className="px-4 py-[13px] text-left text-[12px] text-[#7c3a1e] font-bold tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map(c => (
                  <tr key={c._id}
                    className="border-b border-[#fdf0ea] transition-colors duration-150 hover:bg-[rgba(241,90,33,0.05)]"
                  >
                    <td className="px-4 py-[14px] text-[13px] text-brand-gray">
                      <div className="flex items-center gap-[10px]">
                        {c.companyLogo
                          ? <img src={c.companyLogo} alt="" className="w-[38px] h-[38px] rounded-[10px] object-cover" />
                          : <div className="w-[38px] h-[38px] rounded-[10px] bg-brand-primary text-white flex items-center justify-center text-[15px] font-bold shadow-[0_3px_8px_rgba(241,90,33,0.25)]">
                              {c.brandName?.charAt(0)}
                            </div>
                        }
                        <div>
                          <p className="text-[14px] font-semibold text-brand-dark m-0">{c.brandName}</p>
                          <p className="text-[12px] text-brand-muted m-0">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-[14px] text-[13px]">
                      <p className="text-[13px] text-brand-dark m-0">{c.firstName} {c.lastName}</p>
                      <p className="text-[12px] text-brand-muted m-0">{c.phone}</p>
                    </td>
                    <td className="px-4 py-[14px]">
                      <span className="px-3 py-[3px] rounded-[8px] text-[12px] font-semibold bg-gray-100 text-gray-700">
                        {c.businessType}
                      </span>
                    </td>
                    <td className="px-4 py-[14px] text-[13px] text-brand-gray">{c.accountType}</td>
                    <td className="px-4 py-[14px]"><DocsBadge status={c.documentsStatus} /></td>
                    <td className="px-4 py-[14px]"><ActiveBadge isActive={c.isActive} /></td>
                    <td className="px-4 py-[14px]">
                      <div className="flex gap-[6px]">
                        <button onClick={() => navigate(`/companies/${c._id}`)}
                          className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold bg-blue-50 text-blue-700 border-none cursor-pointer">
                          View
                        </button>
                        <button onClick={() => toggle(c._id)}
                          className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold text-white border-none cursor-pointer bg-brand-primary shadow-[0_2px_8px_rgba(241,90,33,0.3)]">
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => del(c._id)}
                          className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold bg-red-50 text-red-600 border-none cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-brand-border">
          <span className="text-[12px] text-brand-muted">
            Showing {filteredCompanies.length} of {companies.length} companies
          </span>
        </div>

      </div>
    </div>
  );
}




// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// import VectorBg       from "../assets/Images/Vectorbg.png";
// import iconCompanies from "../assets/Images/building.png";
// import iconActive    from "../assets/Images/building.png";
// import iconBranches  from "../assets/Images/building.png";
// import iconOrders    from "../assets/Images/building.png";

// const BASE  = "https://el-distibutor-backend.onrender.com";
// const token = () => localStorage.getItem("adminToken");

// const apiFetch = (path, opts = {}) =>
//   fetch(`${BASE}${path}`, {
//     ...opts,
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
//   }).then(r => r.json());

// const DocsBadge = ({ status }) => {
//   const map = {
//     pending:   { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb",  label: "Pending"   },
//     submitted: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe",  label: "Submitted" },
//     approved:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0",  label: "Approved"  },
//     rejected:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca",  label: "Rejected"  },
//   };
//   const s = map[status] || map.pending;
//   return (
//     <span style={{
//       padding: "3px 12px",
//       borderRadius: "20px",
//       fontSize: "12px",
//       fontWeight: "600",
//       border: "1px solid",
//       background: s.bg,
//       color: s.color,
//       borderColor: s.border,
//     }}>
//       {s.label}
//     </span>
//   );
// };

// const ActiveBadge = ({ isActive }) => (
//   <span style={{
//     padding: "3px 12px",
//     borderRadius: "20px",
//     fontSize: "12px",
//     fontWeight: "600",
//     border: "1px solid",
//     background:  isActive ? "#f0fdf4" : "#f9fafb",
//     color:       isActive ? "#16a34a" : "#6b7280",
//     borderColor: isActive ? "#bbf7d0" : "#e5e7eb",
//   }}>
//     {isActive ? "Active" : "Inactive"}
//   </span>
// );

// const StatCard = ({ icon, value, label, sub, subColor = "#16a34a", active, onClick }) => (
//   <div
//     onClick={onClick}
//     style={{
//       position: "relative",
//       background: "linear-gradient(160deg, #fff7f0 0%, #ffffff 65%)",
//       width: "100%",
//       minHeight: "150px",
//       borderRadius: "18px",
//       padding: "22px 22px 18px",
//       boxSizing: "border-box",
//       overflow: "hidden",
//       cursor: "pointer",
//       border: active ? "1.5px solid #F15A21" : "1.5px solid transparent",
//       boxShadow: active ? "0 6px 18px rgba(241,90,33,0.18)" : "0 4px 14px rgba(241,90,33,0.08)",
//       transition: "all 0.15s",
//     }}
//   >
//     {/* decorative arc image */}
//     <img
//       src={VectorBg}
//       alt=""
//       style={{
//         position: "absolute",
//         right: "-6px",
//         bottom: "-6px",
//         width: "95px",
//         height: "95px",
//         objectFit: "contain",
//         opacity: 0.55,
//         pointerEvents: "none",
//       }}
//     />

//     {/* icon circle */}
//     <div style={{
//       position: "relative",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: 'flex-start',
//       marginBottom: "16px",
    
//     }}>
//       <img src={icon} style={{ width: "48px", height: "48px", objectFit: "contain",  }} alt="" />
//     </div>

//     {/* text */}
//     <div style={{ position: "relative", zIndex: 1 }}>
//       <div style={{ fontSize: "28px", fontWeight: "800", color: "#F15A21", lineHeight: 1 }}>{value}</div>
//       <div style={{ fontSize: "13px", color: "#374151", fontWeight: "500", marginTop: "6px" }}>{label}</div>
//       {sub && <div style={{ fontSize: "11px", fontWeight: "600", color: subColor, marginTop: "6px" }}>{sub}</div>}
//     </div>
//   </div>
// );

// export default function Companies() {
//   const [companies,  setCompanies]  = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [syncing,    setSyncing]    = useState(false);
//   const [filter,     setFilter]     = useState("All");       // documentsStatus filter (kept for API query compatibility)
//   const [typeFilter, setTypeFilter] = useState("All");       // accountType filter — driven by stat cards now
//   const [activeOnly, setActiveOnly] = useState(false);       // "Active Companies" card filter
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const cached = localStorage.getItem("companiesCache");
//     if (cached) {
//       try { const d = JSON.parse(cached); setCompanies(d.companies || []); setLoading(false); }
//       catch (e) { console.error(e); }
//     }
//   }, []);

//   // Always fetches the FULL list (no documentsStatus/accountType query params) —
//   // filtering by type/active/docs status happens client-side below, instantly,
//   // off whatever is already cached in localStorage / state. No refetch on filter clicks.
//   const load = async () => {
//     try {
//       setSyncing(true);
//       const data = await apiFetch(`/api/company/admin/companies`);
//       if (data.success) {
//         setCompanies(data.data);
//         localStorage.setItem("companiesCache", JSON.stringify({ companies: data.data }));
//         if (loading) setLoading(false);
//       }
//     } catch (err) {
//       console.error(err);
//       if (loading && !localStorage.getItem("companiesCache")) setLoading(false);
//     } finally { setSyncing(false); }
//   };

//   useEffect(() => {
//     load();
//     const iv = setInterval(load, 30000);
//     return () => clearInterval(iv);
//   }, []);

//   const toggle = async (id) => {
//     const data = await apiFetch(`/api/company/admin/companies/${id}/toggle-active`, { method: "PATCH" });
//     if (data.success) {
//       const updated = companies.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c);
//       setCompanies(updated);
//       localStorage.setItem("companiesCache", JSON.stringify({ companies: updated }));
//     }
//   };

//   const del = async (id) => {
//     if (!confirm("Delete this company?")) return;
//     const data = await apiFetch(`/api/company/admin/companies/${id}`, { method: "DELETE" });
//     if (data.success) {
//       const updated = companies.filter(c => c._id !== id);
//       setCompanies(updated);
//       localStorage.setItem("companiesCache", JSON.stringify({ companies: updated }));
//     }
//   };

//   // ── Stat-card click handlers (these ARE the filters now) ──
//   const selectAll      = () => { setTypeFilter("All");      setActiveOnly(false); };
//   const selectActive   = () => { setActiveOnly(prev => !prev); };
//   const selectSupplier = () => { setTypeFilter(prev => prev === "Supplier" ? "All" : "Supplier"); setActiveOnly(false); };
//   const selectBuyer    = () => { setTypeFilter(prev => prev === "Buyer"    ? "All" : "Buyer");    setActiveOnly(false); };

//   // Apply all filters client-side, instantly, on the already-loaded data — no network wait
//   const filteredCompanies = companies
//     .filter(c => (activeOnly ? c.isActive : true))
//     .filter(c => (typeFilter !== "All" ? c.accountType === typeFilter : true))
//     .filter(c => (filter !== "All" ? c.documentsStatus === filter : true))
//     .filter(c =>
//       c.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//   // ── Stat values — straight counts off the real API data, no derived/dummy numbers ──
//   const totalCount    = companies.length;
//   const activeCount   = companies.filter(c => c.isActive).length;
//   const supplierCount = companies.filter(c => c.accountType === "Supplier").length;
//   const buyerCount    = companies.filter(c => c.accountType === "Buyer").length;

//   const isAllSelected      = typeFilter === "All" && !activeOnly;
//   const isSupplierSelected = typeFilter === "Supplier";
//   const isBuyerSelected    = typeFilter === "Buyer";

//   return (
//     <div style={{ maxWidth: "1500px", padding: "10px", margin: "0 auto", fontFamily: "inherit" }}>

//       {/* ── Stat Cards (clickable filters, live API data) ── */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "22px" }}>
//         <StatCard
//           icon={iconCompanies}
//           value={totalCount.toLocaleString()}
//           label="Total Companies"
//           active={isAllSelected}
//           onClick={selectAll}
//         />
//         <StatCard
//           icon={iconActive}
//           value={activeCount.toLocaleString()}
//           label="Active Companies"
//           active={activeOnly}
//           onClick={selectActive}
//         />
//         <StatCard
//           icon={iconBranches}
//           value={supplierCount.toLocaleString()}
//           label="Supplier"
//           subColor="#F15A21"
//           active={isSupplierSelected}
//           onClick={selectSupplier}
//         />
//         <StatCard
//           icon={iconOrders}
//           value={buyerCount.toLocaleString()}
//           label="Buyer"
//           active={isBuyerSelected}
//           onClick={selectBuyer}
//         />
//       </div>

//       {/* ── Bottom section with gradient background ── */}
//       <div style={{
//         background: "linear-gradient(135deg, #FFF1DD 0%, #FFF8EF 25%, #FFFFFF 55%)",
//         border: "1.5px solid #f5dfc7",
//         borderRadius: "20px",
//         padding: "0",
//         overflow: "hidden",
//         boxShadow: "0 4px 20px rgba(241,90,33,0.06)",
//       }}>

//         {/* Header */}
//         <div style={{ padding: "22px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
//           <div>
//             <h1 style={{ fontSize: "19px", fontWeight: "700", margin: 0, color: "#111827" }}>Companies Management</h1>
//             <p style={{ fontSize: "12.5px", color: "#9ca3af", margin: "4px 0 0" }}>Monitor all registered companies and their branch operations</p>
//           </div>
//           {syncing && <span style={{ fontSize: "12px", color: "#F15A21", fontWeight: "600" }}>↻ Syncing...</span>}
//         </div>

//         {/* Search */}
//         <div style={{ padding: "0 24px 16px" }}>
//           <input
//             type="text"
//             placeholder="Search by brand name, email, phone, or contact person..."
//             value={searchTerm}
//             onChange={e => setSearchTerm(e.target.value)}
//             style={{
//               width: "100%",
//               padding: "10px 14px",
//               border: "1px solid #f0ddd5",
//               borderRadius: "10px",
//               fontSize: "13px",
//               outline: "none",
//               boxSizing: "border-box",
//               background: "#fff",
//             }}
//           />
//         </div>

//         {/* Table */}
//         <div style={{ overflowX: "auto" }}>
//           {loading ? (
//             <p style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>Loading...</p>
//           ) : filteredCompanies.length === 0 ? (
//             <p style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>{searchTerm ? "No companies found matching your search" : "No companies found"}</p>
//           ) : (
//             <table style={{ width: "100%", borderCollapse: "collapse" }}>
//               <thead>
//                 <tr style={{ background: "#FFEDD5" }}>
//                   {["Company", "Contact", "Type", "Account", "Docs", "Active", "Actions"].map(h => (
//                     <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: "12px", color: "#7c3a1e", fontWeight: "700", letterSpacing: "0.2px" }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCompanies.map((c, idx) => (
//                   <tr key={c._id}
//                     style={{
//                       borderBottom: "1px solid #fdf0ea",
//                       background: "transparent",
//                       transition: "background 0.15s",
//                     }}
//                     onMouseEnter={e => e.currentTarget.style.background = "rgba(241,90,33,0.05)"}
//                     onMouseLeave={e => e.currentTarget.style.background = "transparent"}
//                   >
//                     <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6b7280" }}>
//                       <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                         {c.companyLogo
//                           ? <img src={c.companyLogo} alt="" style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover" }} />
//                           : <div style={{
//                               width: "38px",
//                               height: "38px",
//                               borderRadius: "10px",
//                               background: "linear-gradient(135deg, #F15A21, #ff7a3d)",
//                               color: "#fff",
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               fontSize: "15px",
//                               fontWeight: "700",
//                               boxShadow: "0 3px 8px rgba(241,90,33,0.25)",
//                             }}>{c.brandName?.charAt(0)}</div>
//                         }
//                         <div>
//                           <p style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#111827" }}>{c.brandName}</p>
//                           <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{c.email}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6b7280" }}>
//                       <p style={{ fontSize: "13px", margin: 0, color: "#111827" }}>{c.firstName} {c.lastName}</p>
//                       <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{c.phone}</p>
//                     </td>
//                     <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6b7280" }}>
//                       <span style={{
//                         padding: "3px 12px",
//                         borderRadius: "8px",
//                         fontSize: "12px",
//                         fontWeight: "600",
//                         background: "#f3f4f6",
//                         color: "#374151",
//                       }}>
//                         {c.businessType}
//                       </span>
//                     </td>
//                     <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6b7280" }}>{c.accountType}</td>
//                     <td style={{ padding: "14px 16px", fontSize: "13px" }}><DocsBadge status={c.documentsStatus} /></td>
//                     <td style={{ padding: "14px 16px", fontSize: "13px" }}><ActiveBadge isActive={c.isActive} /></td>
//                     <td style={{ padding: "14px 16px", fontSize: "13px" }}>
//                       <div style={{ display: "flex", gap: "6px" }}>
//                         <button onClick={() => navigate(`/companies/${c._id}`)} style={{
//                           padding: "5px 12px", border: "none", borderRadius: "7px", fontSize: "12px",
//                           fontWeight: "600", cursor: "pointer", background: "#eff6ff", color: "#1d4ed8",
//                         }}>View</button>
//                         <button onClick={() => toggle(c._id)} style={{
//                           padding: "5px 12px", border: "none", borderRadius: "7px", fontSize: "12px",
//                           fontWeight: "600", cursor: "pointer",
//                           background: "linear-gradient(135deg, #F15A21, #ff7a3d)", color: "#fff",
//                           boxShadow: "0 2px 8px rgba(241,90,33,0.3)",
//                         }}>{c.isActive ? "Deactivate" : "Activate"}</button>
//                         <button onClick={() => del(c._id)} style={{
//                           padding: "5px 12px", border: "none", borderRadius: "7px", fontSize: "12px",
//                           fontWeight: "600", cursor: "pointer", background: "#fef2f2", color: "#dc2626",
//                         }}>Delete</button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* Footer count */}
//         <div style={{ padding: "16px 24px", borderTop: "1px solid #f0ddd5", background: "transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <span style={{ fontSize: "12.5px", color: "#9ca3af" }}>
//             Showing {filteredCompanies.length} of {companies.length} companies
//           </span>
//         </div>

//       </div>
//     </div>
//   );
// }





// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const BASE  = "https://el-distibutor-backend.onrender.com";
// const token = () => localStorage.getItem("adminToken");

// const apiFetch = (path, opts = {}) =>
//   fetch(`${BASE}${path}`, {
//     ...opts,
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
//   }).then(r => r.json());

// const DocsBadge = ({ status }) => {
//   const map = {
//     pending:   { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb",  label: "Pending"   },
//     submitted: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe",  label: "Submitted" },
//     approved:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0",  label: "Approved"  },
//     rejected:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca",  label: "Rejected"  },
//   };
//   const s = map[status] || map.pending;
//   return (
//     <span style={{ ...styles.badge, background: s.bg, color: s.color, borderColor: s.border }}>
//       {s.label}
//     </span>
//   );
// };

// export default function Companies() {
//   const [companies,    setCompanies]    = useState([]);
//   const [loading,      setLoading]      = useState(true);
//   const [syncing,      setSyncing]      = useState(false);
//   const [filter,       setFilter]       = useState("All");
//   const [typeFilter,   setTypeFilter]   = useState("All");
//   const [searchTerm,   setSearchTerm]   = useState("");
//   const navigate                        = useNavigate();

//   // ✅ STEP 1: Cache se data nikalo
//   useEffect(() => {
//     const cached = localStorage.getItem("companiesCache");
//     if (cached) {
//       try {
//         const data = JSON.parse(cached);
//         setCompanies(data.companies || []);
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
//       if (st !== "All") q.push(`documentsStatus=${st}`);
//       if (tt !== "All") q.push(`accountType=${tt}`);
      
//       const data = await apiFetch(`/api/company/admin/companies${q.length ? "?" + q.join("&") : ""}`);
      
//       if (data.success) {
//         setCompanies(data.data);

//         // Cache save karo
//         localStorage.setItem("companiesCache", JSON.stringify({
//           companies: data.data,
//         }));

//         if (loading) setLoading(false);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       if (loading && !localStorage.getItem("companiesCache")) {
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

//   const toggle = async (id) => {
//     const data = await apiFetch(`/api/company/admin/companies/${id}/toggle-active`, { method: "PATCH" });
//     if (data.success) {
//       const updated = companies.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c);
//       setCompanies(updated);
//       // Cache update
//       localStorage.setItem("companiesCache", JSON.stringify({ companies: updated }));
//     }
//   };

//   const del = async (id) => {
//     if (!confirm("Delete this company?")) return;
//     const data = await apiFetch(`/api/company/admin/companies/${id}`, { method: "DELETE" });
//     if (data.success) {
//       const updated = companies.filter(c => c._id !== id);
//       setCompanies(updated);
//       // Cache update
//       localStorage.setItem("companiesCache", JSON.stringify({ companies: updated }));
//     }
//   };

//   const docFilters  = ["All", "submitted", "approved", "rejected", "pending"];
//   const typeFilters = ["All", "Supplier", "Buyer"];

//   // Filter companies by search term
//   const filteredCompanies = companies.filter(c =>
//     c.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div style={styles.container}>

//       {/* Header with Orange Background and Filters */}
//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.title}>Companies</h1>
//           <p style={styles.subtitle}>
//             {filteredCompanies.length} companies
//             {syncing && <span style={styles.syncingBadge}>↻ Syncing...</span>}
//           </p>
//         </div>
//         <div style={styles.filterBar}>
//           {docFilters.map(f => (
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
//           placeholder="Search by brand name, email, phone, or contact person..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={styles.searchInput}
//         />
//       </div>

//       {/* Table with Orange Header */}
//       <div style={styles.tableContainer}>
//         {loading ? (
//           <p style={styles.loadingText}>Loading...</p>
//         ) : filteredCompanies.length === 0 ? (
//           <p style={styles.emptyText}>{searchTerm ? "No companies found matching your search" : "No companies found"}</p>
//         ) : (
//           <table style={styles.table}>
//             <thead>
//               <tr style={styles.tableHead}>
//                 {["Company", "Contact", "Type", "Account", "Docs", "Active", "Actions"].map(h => (
//                   <th key={h} style={styles.th}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredCompanies.map(c => (
//                 <tr key={c._id} style={styles.tableRow}>
//                   <td style={styles.td}>
//                     <div style={styles.companyCell}>
//                       {c.companyLogo
//                         ? <img src={c.companyLogo} alt="" style={styles.companyLogo} />
//                         : <div style={styles.companyAvatar}>{c.brandName?.charAt(0)}</div>
//                       }
//                       <div>
//                         <p style={styles.brandName}>{c.brandName}</p>
//                         <p style={styles.licenseText}>{c.email}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td style={styles.td}>
//                     <p style={styles.contactName}>{c.firstName} {c.lastName}</p>
//                     <p style={styles.emailText}>{c.phone}</p>
//                   </td>
//                   <td style={styles.td}>{c.businessType}</td>
//                   <td style={styles.td}>{c.accountType}</td>
//                   <td style={styles.td}>
//                     <DocsBadge status={c.documentsStatus} />
//                   </td>
//                   <td style={styles.td}>
//                     <span style={{
//                       ...styles.badge,
//                       background: c.isActive ? "#f0fdf4" : "#f9fafb",
//                       color: c.isActive ? "#16a34a" : "#6b7280",
//                       borderColor: c.isActive ? "#bbf7d0" : "#e5e7eb",
//                     }}>
//                       {c.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </td>
//                   <td style={styles.td}>
//                     <div style={styles.actions}>
//                       <button
//                         onClick={() => navigate(`/companies/${c._id}`)}
//                         style={styles.viewBtn}
//                       >
//                         View
//                       </button>
//                       <button
//                         onClick={() => toggle(c._id)}
//                         style={styles.toggleBtn}
//                       >
//                         {c.isActive ? "Deactivate" : "Activate"}
//                       </button>
//                       <button
//                         onClick={() => del(c._id)}
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
//   companyCell: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//   },
//   companyLogo: {
//     width: "36px",
//     height: "36px",
//     borderRadius: "8px",
//     objectFit: "cover",
//   },
//   companyAvatar: {
//     width: "36px",
//     height: "36px",
//     borderRadius: "8px",
//     background: "#1a1a2e",
//     color: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "15px",
//     fontWeight: "700",
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
//   viewBtn: {
//     padding: "4px 10px",
//     border: "1px solid #bfdbfe",
//     borderRadius: "6px",
//     fontSize: "12px",
//     cursor: "pointer",
//     background: "#eff6ff",
//     color: "#1d4ed8",
//   },
//   toggleBtn: {
//     padding: "4px 10px",
//     border: "1px solid #fbbf24",
//     borderRadius: "6px",
//     fontSize: "12px",
//     cursor: "pointer",
//     background: "#fef3c7",
//     color: "#92400e",
//   },
//   deleteBtn: {
//     padding: "4px 10px",
//     border: "1px solid #fecaca",
//     borderRadius: "6px",
//     fontSize: "12px",
//     cursor: "pointer",
//     background: "#fef2f2",
//     color: "#dc2626",
//   },
// };