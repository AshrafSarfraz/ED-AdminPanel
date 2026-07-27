// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// const BASE  = "https://el-distibutor-backend.onrender.com";
// const token = () => localStorage.getItem("adminToken");

// export default function BranchCatalog() {
//   const { id }     = useParams();
//   const navigate   = useNavigate();
//   const [items,    setItems]    = useState([]);
//   const [branch,   setBranch]   = useState(null);
//   const [loading,  setLoading]  = useState(true);
//   const [search,   setSearch]   = useState("");

//   useEffect(() => {
//     fetch(`${BASE}/api/branch/admin/branches/${id}/detail`, {
//       headers: { Authorization: `Bearer ${token()}` },
//     }).then(r => r.json()).then(res => {
//       if (res.success) {
//         setItems(res.data.items);
//         setBranch(res.data.branch);
//       }
//     }).finally(() => setLoading(false));
//   }, [id]);

//   const filtered = items.filter(item =>
//     !search ||
//     item.platformItemId?.name?.toLowerCase().includes(search.toLowerCase()) ||
//     item.categoryId?.name?.toLowerCase().includes(search.toLowerCase()) ||
//     item.countryId?.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div style={S.container}>

//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
//         <div>
//           <h2 style={S.title}>Catalog — {branch?.managerName || "..."}</h2>
//           <p style={S.subtitle}>{items.length} items in catalog</p>
//         </div>
 
//       </div>

//       {/* Table card */}
//       <div style={S.tableWrap}>
//         {/* Search */}
//         <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
//           <input
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             placeholder="Search by item, category, country..."
//             style={S.input}
//           />
//         </div>

//         {loading ? (
//           <p style={{ padding: "40px", textAlign: "center", color: "#888" }}>Loading...</p>
//         ) : filtered.length === 0 ? (
//           <p style={{ padding: "40px", textAlign: "center", color: "#888" }}>No items found</p>
//         ) : (
//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ background: "#f8f9fa" }}>
//                 {["Item", "Category", "Country", "Price / Unit", "Listed", "Available Today"].map(h => (
//                   <th key={h} style={S.th}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map(item => (
//                 <tr key={item._id} style={S.tr}>
//                   <td style={S.td}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                       {item.platformItemId?.image
//                         ? <img src={item.platformItemId.image} alt="" style={{ width: "34px", height: "34px", borderRadius: "8px", objectFit: "cover" }} />
//                         : <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#9ca3af" }}>IMG</div>}
//                       <div>
//                         <p style={{ fontSize: "13px", fontWeight: "600", margin: 0, color: "#1a1a2e" }}>{item.platformItemId?.name}</p>
//                         <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{item.platformItemId?.unit}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td style={{ ...S.td, color: "#555" }}>{item.categoryId?.name || "—"}</td>
//                   <td style={{ ...S.td, color: "#555" }}>{item.countryId?.name || "—"}</td>
//                   <td style={{ ...S.td, fontWeight: "700", color: "#1a1a2e" }}>{item.pricePerUnit} QAR</td>
//                   <td style={S.td}>
//                     <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: item.isListed ? "#f0fdf4" : "#f9fafb", color: item.isListed ? "#16a34a" : "#6b7280" }}>
//                       {item.isListed ? "Listed" : "Hidden"}
//                     </span>
//                   </td>
//                   <td style={S.td}>
//                     <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: item.isAvailableToday ? "#f0fdf4" : "#f9fafb", color: item.isAvailableToday ? "#16a34a" : "#6b7280" }}>
//                       {item.isAvailableToday ? "Available" : "Unavailable"}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}

//         {/* Footer count */}
//         <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0" }}>
//           <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>Showing {filtered.length} of {items.length} items</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// const S = {
//   container: { maxWidth: "1500px", padding:'10px', margin: "0 auto", },
//   title:      { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" },
//   subtitle:   { fontSize: "14px", color: "#888", margin: 0 },
//   tableWrap:  { background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" },
//   input:      { width: "100%", maxWidth: "400px", padding: "9px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" },
//   th:         { padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#888", fontWeight: "600", whiteSpace: "nowrap" },
//   tr:         { borderBottom: "1px solid #f0f0f0" },
//   td:         { padding: "12px 16px", fontSize: "13px", color: "#1a1a2e", verticalAlign: "middle" },
//   outlineBtn: { padding: "8px 16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "#1a1a2e" },
// };


import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader";

const BASE  = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

export default function BranchCatalog() {
  const { id }                = useParams();
  const [items,   setItems]   = useState([]);
  const [branch,  setBranch]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetch(`${BASE}/api/branch/admin/branches/${id}/detail`, {
      headers: { Authorization: `Bearer ${token()}` },
    }).then(r => r.json()).then(res => {
      if (res.success) {
        setItems(res.data.items);
        setBranch(res.data.branch);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const filtered = items.filter(item =>
    !search ||
    item.platformItemId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.categoryId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.countryId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  const isEmpty = filtered.length === 0;

  return (
    <div className="max-w-[1500px] mx-auto">

      {/* Header */}
      <div className="mb-4 md:mb-5">
        <h2 className="text-[17px] md:text-[22px] font-bold text-brand-dark m-0 break-words">
          Catalog — {branch?.managerName || "..."}
        </h2>
        <p className="text-[12px] md:text-[14px] text-brand-muted m-0 mt-1">{items.length} items in catalog</p>
      </div>

      {/* Main Panel */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[16px] md:rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)]">

        {/* Search */}
        <div className="px-4 md:px-6 pt-4 md:pt-5 pb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search item, category, or country..."
            className="w-full md:max-w-[420px] px-4 py-[10px] border border-brand-border rounded-[10px] text-[13px] outline-none bg-white focus:border-brand-primary transition-all"
          />
        </div>

        {isEmpty ? (
          <p className="text-center py-10 px-4 text-brand-muted text-[13px] md:text-[14px]">
            {search ? "No items match your search" : "No items in this catalog yet"}
          </p>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FFEDD5]">
                    {["Item", "Category", "Country", "Price / Unit", "Listed", "Available Today"].map(h => (
                      <th key={h} className="px-4 py-[13px] text-left text-[12px] text-[#7c3a1e] font-bold tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors duration-150">
                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-[10px]">
                          {item.platformItemId?.image
                            ? <img src={item.platformItemId.image} alt="" className="w-[34px] h-[34px] rounded-[8px] object-cover shrink-0" />
                            : <div className="w-[34px] h-[34px] rounded-[8px] bg-brand-lighter flex items-center justify-center text-[9px] text-brand-muted shrink-0">IMG</div>
                          }
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-brand-dark m-0">{item.platformItemId?.name}</p>
                            <p className="text-[11px] text-brand-muted m-0">{item.platformItemId?.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-[14px] text-[13px] text-brand-gray">{item.categoryId?.name || "—"}</td>
                      <td className="px-4 py-[14px] text-[13px] text-brand-gray">{item.countryId?.name || "—"}</td>
                      <td className="px-4 py-[14px] text-[14px] font-bold text-brand-dark whitespace-nowrap">{item.pricePerUnit} QAR</td>
                      <td className="px-4 py-[14px]">
                        <span className={`px-3 py-[3px] rounded-[20px] text-[11px] font-semibold whitespace-nowrap
                          ${item.isListed ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                          {item.isListed ? "Listed" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-[14px]">
                        <span className={`px-3 py-[3px] rounded-[20px] text-[11px] font-semibold whitespace-nowrap
                          ${item.isAvailableToday ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                          {item.isAvailableToday ? "Available" : "Unavailable"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden flex flex-col gap-3 px-4 pb-4">
              {filtered.map(item => (
                <div key={item._id} className="bg-brand-white border border-brand-border rounded-[14px] p-4">

                  <div className="flex items-center gap-3 mb-3">
                    {item.platformItemId?.image
                      ? <img src={item.platformItemId.image} alt="" className="w-11 h-11 rounded-[10px] object-cover shrink-0" />
                      : <div className="w-11 h-11 rounded-[10px] bg-brand-lighter flex items-center justify-center text-[9px] text-brand-muted shrink-0">IMG</div>
                    }
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-brand-dark m-0 truncate">{item.platformItemId?.name}</p>
                      <p className="text-[11.5px] text-brand-muted m-0 truncate">{item.platformItemId?.unit}</p>
                    </div>
                    <p className="text-[14px] font-extrabold text-brand-primary m-0 shrink-0 whitespace-nowrap">
                      {item.pricePerUnit} QAR
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-[10.5px] text-brand-muted m-0 mb-[2px]">Category</p>
                      <p className="text-[12.5px] font-semibold text-brand-dark m-0 truncate">{item.categoryId?.name || "—"}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10.5px] text-brand-muted m-0 mb-[2px]">Country</p>
                      <p className="text-[12.5px] font-semibold text-brand-dark m-0 truncate">{item.countryId?.name || "—"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-3 py-[3px] rounded-[20px] text-[11px] font-semibold
                      ${item.isListed ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                      {item.isListed ? "Listed" : "Hidden"}
                    </span>
                    <span className={`px-3 py-[3px] rounded-[20px] text-[11px] font-semibold
                      ${item.isAvailableToday ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                      {item.isAvailableToday ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-brand-border">
          <p className="text-[11.5px] md:text-[12px] text-brand-muted m-0">
            Showing {filtered.length} of {items.length} items
          </p>
        </div>

      </div>
    </div>
  );
}
