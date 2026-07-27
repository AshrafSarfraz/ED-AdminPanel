// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import StatCard from "../components/StatCard";
// import Loader from "../components/Loader";

// const BASE  = "https://el-distibutor-backend.onrender.com";
// const token = () => localStorage.getItem("adminToken");

// const apiFetch = (path, opts = {}) =>
//   fetch(`${BASE}${path}`, {
//     ...opts,
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
//   }).then(r => r.json());

// const DocsBadge = ({ status }) => {
//   const map = {
//     pending:   { bg: "bg-gray-50",   text: "text-gray-500",  border: "border-gray-200", label: "Pending"   },
//     submitted: { bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200", label: "Submitted" },
//     approved:  { bg: "bg-green-50",  text: "text-green-700", border: "border-green-200",label: "Approved"  },
//     rejected:  { bg: "bg-red-50",    text: "text-red-600",   border: "border-red-200",  label: "Rejected"  },
//   };
//   const s = map[status] || map.pending;
//   return (
//     <span className={`px-3 py-[3px] rounded-[20px] text-[12px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
//       {s.label}
//     </span>
//   );
// };

// const ActiveBadge = ({ isActive }) => (
//   <span className={`px-3 py-[3px] rounded-[20px] text-[12px] font-semibold border
//     ${isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
//     {isActive ? "Active" : "Inactive"}
//   </span>
// );

// export default function Companies() {
//   const [companies,  setCompanies]  = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [syncing,    setSyncing]    = useState(false);
//   const [filter,     setFilter]     = useState("All");
//   const [typeFilter, setTypeFilter] = useState("All");
//   const [activeOnly, setActiveOnly] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const cached = localStorage.getItem("companiesCache");
//     if (cached) {
//       try { const d = JSON.parse(cached); setCompanies(d.companies || []); setLoading(false); }
//       catch (e) { console.error(e); }
//     }
//   }, []);

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

//   const selectAll      = () => { setTypeFilter("All");      setActiveOnly(false); };
//   const selectActive   = () => { setActiveOnly(prev => !prev); };
//   const selectSupplier = () => { setTypeFilter(prev => prev === "Supplier" ? "All" : "Supplier"); setActiveOnly(false); };
//   const selectBuyer    = () => { setTypeFilter(prev => prev === "Buyer"    ? "All" : "Buyer");    setActiveOnly(false); };

//   const filteredCompanies = companies
//     .filter(c => (activeOnly ? c.isActive : true))
//     .filter(c => (typeFilter !== "All" ? c.accountType === typeFilter : true))
//     .filter(c => (filter !== "All" ? c.documentsStatus === filter : true))
//     .filter(c =>
//       c.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//   const totalCount    = companies.length;
//   const activeCount   = companies.filter(c => c.isActive).length;
//   const supplierCount = companies.filter(c => c.accountType === "Supplier").length;
//   const buyerCount    = companies.filter(c => c.accountType === "Buyer").length;

//   const isAllSelected      = typeFilter === "All" && !activeOnly;
//   const isSupplierSelected = typeFilter === "Supplier";
//   const isBuyerSelected    = typeFilter === "Buyer";

//   if (loading) return <Loader />;

//   return (
//     <div className="max-w-[1500px] ">

//       {/* Stat Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
//         <StatCard icon="building"  value={totalCount.toLocaleString()}    label="Total Companies"  active={isAllSelected}      onClick={selectAll}      />
//         <StatCard icon="check"     value={activeCount.toLocaleString()}   label="Active Companies" active={activeOnly}          onClick={selectActive}   />
//         <StatCard icon="trending"  value={supplierCount.toLocaleString()} label="Supplier"         active={isSupplierSelected}  onClick={selectSupplier} />
//         <StatCard icon="users"     value={buyerCount.toLocaleString()}    label="Buyer"            active={isBuyerSelected}     onClick={selectBuyer}    />
//       </div>

//       {/* Main Panel */}
//       <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

//         {/* Header */}
//         <div className="flex items-center justify-between flex-wrap gap-3 px-4 md:px-6 pt-5 pb-4">
//           <div>
//             <h1 className="text-[17px] md:text-[19px] font-bold text-brand-dark m-0">Companies Management</h1>
//             <p className="text-[12px] text-brand-muted mt-1">Monitor all registered companies and their branch operations</p>
//           </div>
//           {syncing && <span className="text-[12px] text-brand-primary font-semibold">↻ Syncing...</span>}
//         </div>

//         {/* Search */}
//         <div className="px-4 md:px-6 pb-4">
//           <input
//             type="text"
//             placeholder="Search by brand name, email, phone, or contact person..."
//             value={searchTerm}
//             onChange={e => setSearchTerm(e.target.value)}
//             className="w-full px-4 py-[10px] border border-brand-border rounded-[10px] text-[13px] outline-none bg-white focus:border-brand-primary transition-all"
//           />
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           {filteredCompanies.length === 0 ? (
//             <p className="text-center py-10 text-brand-muted text-[14px]">
//               {searchTerm ? "No companies found matching your search" : "No companies found"}
//             </p>
//           ) : (
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-[#FFEDD5]">
//                   {["Company", "Contact", "Type", "Account", "Docs", "Active", "Actions"].map(h => (
//                     <th key={h} className="px-4 py-[13px] text-left text-[12px] text-[#7c3a1e] font-bold tracking-wide">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCompanies.map(c => (
//                   <tr key={c._id}
//                     className="border-b border-[#fdf0ea] transition-colors duration-150 hover:bg-[rgba(241,90,33,0.05)]"
//                   >
//                     <td className="px-4 py-[14px] text-[13px] text-brand-gray">
//                       <div className="flex items-center gap-[10px]">
//                         {c.companyLogo
//                           ? <img src={c.companyLogo} alt="" className="w-[38px] h-[38px] rounded-[10px] object-cover" />
//                           : <div className="w-[38px] h-[38px] rounded-[10px] bg-brand-primary text-white flex items-center justify-center text-[15px] font-bold shadow-[0_3px_8px_rgba(241,90,33,0.25)]">
//                               {c.brandName?.charAt(0)}
//                             </div>
//                         }
//                         <div>
//                           <p className="text-[14px] font-semibold text-brand-dark m-0">{c.brandName}</p>
//                           <p className="text-[12px] text-brand-muted m-0">{c.email}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-[14px] text-[13px]">
//                       <p className="text-[13px] text-brand-dark m-0">{c.firstName} {c.lastName}</p>
//                       <p className="text-[12px] text-brand-muted m-0">{c.phone}</p>
//                     </td>
//                     <td className="px-4 py-[14px]">
//                       <span className="px-3 py-[3px] rounded-[8px] text-[12px] font-semibold bg-gray-100 text-gray-700">
//                         {c.businessType}
//                       </span>
//                     </td>
//                     <td className="px-4 py-[14px] text-[13px] text-brand-gray">{c.accountType}</td>
//                     <td className="px-4 py-[14px]"><DocsBadge status={c.documentsStatus} /></td>
//                     <td className="px-4 py-[14px]"><ActiveBadge isActive={c.isActive} /></td>
//                     <td className="px-4 py-[14px]">
//                       <div className="flex gap-[6px]">
//                         <button onClick={() => navigate(`/companies/${c._id}`)}
//                           className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold bg-blue-50 text-blue-700 border-none cursor-pointer">
//                           View
//                         </button>
//                         <button onClick={() => toggle(c._id)}
//                           className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold text-white border-none cursor-pointer bg-brand-primary shadow-[0_2px_8px_rgba(241,90,33,0.3)]">
//                           {c.isActive ? "Deactivate" : "Activate"}
//                         </button>
//                         <button onClick={() => del(c._id)}
//                           className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold bg-red-50 text-red-600 border-none cursor-pointer">
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-brand-border">
//           <span className="text-[12px] text-brand-muted">
//             Showing {filteredCompanies.length} of {companies.length} companies
//           </span>
//         </div>

//       </div>
//     </div>
//   );
// }


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
    <span className={`px-3 py-[3px] rounded-[20px] text-[11px] md:text-[12px] font-semibold border whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
};

const ActiveBadge = ({ isActive }) => (
  <span className={`px-3 py-[3px] rounded-[20px] text-[11px] md:text-[12px] font-semibold border whitespace-nowrap
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

  const isEmpty = filteredCompanies.length === 0;

  return (
    <div className="max-w-[1500px]">

      {/* Stat Cards */}
      <div className="  grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
        <StatCard icon="building"  value={totalCount.toLocaleString()}    label="Total Companies"  active={isAllSelected}      onClick={selectAll}      />
        <StatCard icon="check"     value={activeCount.toLocaleString()}   label="Active Companies" active={activeOnly}          onClick={selectActive}   />
        <StatCard icon="trending"  value={supplierCount.toLocaleString()} label="Supplier"         active={isSupplierSelected}  onClick={selectSupplier} />
        <StatCard icon="users"     value={buyerCount.toLocaleString()}    label="Buyer"            active={isBuyerSelected}     onClick={selectBuyer}    />
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] md:rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Header */}
        <div className="flex items-start md:items-center justify-between flex-wrap gap-2 md:gap-3 px-4 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4">
          <div className="min-w-0">
            <h1 className="text-[16px] md:text-[19px] font-bold text-brand-dark m-0">Companies Management</h1>
            <p className="text-[11.5px] md:text-[12px] text-brand-muted mt-1">Monitor all registered companies and their branch operations</p>
          </div>
          {syncing && <span className="text-[11px] md:text-[12px] text-brand-primary font-semibold shrink-0">↻ Syncing...</span>}
        </div>

        {/* Search */}
        <div className="px-4 md:px-6 pb-4">
          <input
            type="text"
            placeholder="Search brand, email, or contact person..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-[10px] border border-brand-border rounded-[10px] text-[13px] outline-none bg-white focus:border-brand-primary transition-all"
          />
        </div>

        {isEmpty ? (
          <p className="text-center py-10 px-4 text-brand-muted text-[13px] md:text-[14px]">
            {searchTerm ? "No companies match your search" : "No companies yet"}
          </p>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FFEDD5]">
                    {["Company", "Contact", "Type", "Account", "Docs", "Active", "Actions"].map(h => (
                      <th key={h} className="px-4 py-[13px] text-left text-[12px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">
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
                            ? <img src={c.companyLogo} alt="" className="w-[38px] h-[38px] rounded-[10px] object-cover shrink-0" />
                            : <div className="w-[38px] h-[38px] rounded-[10px] bg-brand-primary text-white flex items-center justify-center text-[15px] font-bold shrink-0 shadow-[0_3px_8px_rgba(241,90,33,0.25)]">
                                {c.brandName?.charAt(0)}
                              </div>
                          }
                          <div className="min-w-0">
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
                        <span className="px-3 py-[3px] rounded-[8px] text-[12px] font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">
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
                            className="px-3 py-[5px] rounded-[7px] text-[12px] font-semibold text-white border-none cursor-pointer bg-brand-primary shadow-[0_2px_8px_rgba(241,90,33,0.3)] whitespace-nowrap">
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
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden flex flex-col gap-3 px-4 pb-4">
              {filteredCompanies.map(c => (
                <div key={c._id} className="bg-brand-white border border-brand-border rounded-[14px] p-4">

                  {/* Brand row */}
                  <div className="flex items-center gap-3 mb-3">
                    {c.companyLogo
                      ? <img src={c.companyLogo} alt="" className="w-11 h-11 rounded-[10px] object-cover shrink-0" />
                      : <div className="w-11 h-11 rounded-[10px] bg-brand-primary text-white flex items-center justify-center text-[17px] font-bold shrink-0 shadow-[0_3px_8px_rgba(241,90,33,0.25)]">
                          {c.brandName?.charAt(0)}
                        </div>
                    }
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-brand-dark m-0 truncate">{c.brandName}</p>
                      <p className="text-[11.5px] text-brand-muted m-0 truncate">{c.email}</p>
                    </div>
                  </div>

                  {/* Contact + type */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-[10.5px] text-brand-muted m-0 mb-[2px]">Contact</p>
                      <p className="text-[12.5px] font-semibold text-brand-dark m-0 truncate">{c.firstName} {c.lastName}</p>
                      <p className="text-[11.5px] text-brand-muted m-0 truncate">{c.phone}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10.5px] text-brand-muted m-0 mb-[2px]">Business</p>
                      <p className="text-[12.5px] font-semibold text-brand-dark m-0 truncate">{c.businessType}</p>
                      <p className="text-[11.5px] text-brand-muted m-0 truncate">{c.accountType}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    <DocsBadge status={c.documentsStatus} />
                    <ActiveBadge isActive={c.isActive} />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/companies/${c._id}`)}
                      className="flex-1 py-[8px] rounded-[8px] text-[12px] font-semibold bg-blue-50 text-blue-700 border-none cursor-pointer">
                      View
                    </button>
                    <button onClick={() => toggle(c._id)}
                      className="flex-1 py-[8px] rounded-[8px] text-[12px] font-semibold text-white border-none cursor-pointer bg-brand-primary shadow-[0_2px_8px_rgba(241,90,33,0.3)]">
                      {c.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => del(c._id)}
                      className="flex-1 py-[8px] rounded-[8px] text-[12px] font-semibold bg-red-50 text-red-600 border-none cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-t border-brand-border">
          <span className="text-[11.5px] md:text-[12px] text-brand-muted">
            Showing {filteredCompanies.length} of {companies.length} companies
          </span>
        </div>

      </div>
    </div>
  );
}
