import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE  = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

export default function BranchCatalog() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [items,    setItems]    = useState([]);
  const [branch,   setBranch]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

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

  return (
    <div style={S.container}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={S.title}>Catalog — {branch?.managerName || "..."}</h2>
          <p style={S.subtitle}>{items.length} items in catalog</p>
        </div>
 
      </div>

      {/* Table card */}
      <div style={S.tableWrap}>
        {/* Search */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by item, category, country..."
            style={S.input}
          />
        </div>

        {loading ? (
          <p style={{ padding: "40px", textAlign: "center", color: "#888" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: "40px", textAlign: "center", color: "#888" }}>No items found</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                {["Item", "Category", "Country", "Price / Unit", "Listed", "Available Today"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} style={S.tr}>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {item.platformItemId?.image
                        ? <img src={item.platformItemId.image} alt="" style={{ width: "34px", height: "34px", borderRadius: "8px", objectFit: "cover" }} />
                        : <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#9ca3af" }}>IMG</div>}
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "600", margin: 0, color: "#1a1a2e" }}>{item.platformItemId?.name}</p>
                        <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{item.platformItemId?.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...S.td, color: "#555" }}>{item.categoryId?.name || "—"}</td>
                  <td style={{ ...S.td, color: "#555" }}>{item.countryId?.name || "—"}</td>
                  <td style={{ ...S.td, fontWeight: "700", color: "#1a1a2e" }}>{item.pricePerUnit} QAR</td>
                  <td style={S.td}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: item.isListed ? "#f0fdf4" : "#f9fafb", color: item.isListed ? "#16a34a" : "#6b7280" }}>
                      {item.isListed ? "Listed" : "Hidden"}
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: item.isAvailableToday ? "#f0fdf4" : "#f9fafb", color: item.isAvailableToday ? "#16a34a" : "#6b7280" }}>
                      {item.isAvailableToday ? "Available" : "Unavailable"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer count */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>Showing {filtered.length} of {items.length} items</p>
        </div>
      </div>
    </div>
  );
}

const S = {
  container: { maxWidth: "1500px", padding:'10px', margin: "0 auto", },
  title:      { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" },
  subtitle:   { fontSize: "14px", color: "#888", margin: 0 },
  tableWrap:  { background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" },
  input:      { width: "100%", maxWidth: "400px", padding: "9px 14px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" },
  th:         { padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#888", fontWeight: "600", whiteSpace: "nowrap" },
  tr:         { borderBottom: "1px solid #f0f0f0" },
  td:         { padding: "12px 16px", fontSize: "13px", color: "#1a1a2e", verticalAlign: "middle" },
  outlineBtn: { padding: "8px 16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "#1a1a2e" },
};
