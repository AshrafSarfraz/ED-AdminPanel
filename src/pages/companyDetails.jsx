


import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const BASE  = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
  }).then(r => r.json());

const Badge = ({ status, map }) => {
  const s = map[status] || map.default;
  return (
    <span className={`px-3 py-[3px] rounded-[20px] text-[12px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {status}
    </span>
  );
};

const docsMap = {
  pending:   { bg: "bg-gray-50",   text: "text-gray-500",  border: "border-gray-200"  },
  submitted: { bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200"  },
  approved:  { bg: "bg-green-50",  text: "text-green-700", border: "border-green-200" },
  rejected:  { bg: "bg-red-50",    text: "text-red-600",   border: "border-red-200"   },
  default:   { bg: "bg-gray-50",   text: "text-gray-500",  border: "border-gray-200"  },
};

const statusMap = {
  approved: { bg: "bg-green-50",  text: "text-green-700", border: "border-green-200" },
  pending:  { bg: "bg-amber-50",  text: "text-amber-600", border: "border-amber-200" },
  rejected: { bg: "bg-red-50",    text: "text-red-600",   border: "border-red-200"   },
  default:  { bg: "bg-gray-50",   text: "text-gray-500",  border: "border-gray-200"  },
};

const typeMap = {
  Supplier: { bg: "bg-green-50",  text: "text-green-700", border: "border-green-200" },
  Buyer:    { bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200"  },
  default:  { bg: "bg-gray-50",   text: "text-gray-500",  border: "border-gray-200"  },
};

const activeMap = {
  Active:   { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  Inactive: { bg: "bg-gray-50",  text: "text-gray-500",  border: "border-gray-200"  },
  default:  { bg: "bg-gray-50",  text: "text-gray-500",  border: "border-gray-200"  },
};

export default function CompanyDetail() {
  const { id }                          = useParams();
  const navigate                        = useNavigate();
  const [company,      setCompany]      = useState(null);
  const [branches,     setBranches]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [rejectModal,  setRejectModal]  = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [msg,          setMsg]          = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/company/admin/companies/${id}`),
      apiFetch(`/api/company/admin/companies/${id}/branches`),
    ]).then(([cRes, bRes]) => {
      if (cRes.success) setCompany(cRes.data);
      if (bRes.success) setBranches(bRes.data);
      setLoading(false);
    });
  }, [id]);

  const approveDocuments = async () => {
    setSaving(true); setMsg("");
    try {
      const data = await apiFetch(`/api/company/admin/companies/${id}/approve-documents`, {
        method: "PUT", body: JSON.stringify({ action: "approve" }),
      });
      if (data.success) {
        setCompany(c => ({ ...c, documentsStatus: "approved", tradeLicenseStatus: "approved", qidStatus: "approved" }));
        setMsg("success:Documents approved successfully!");
      } else setMsg("error:" + (data.message || "Error"));
    } catch { setMsg("error:Server error"); }
    setSaving(false);
  };

  const rejectDocuments = async () => {
    if (!rejectReason.trim()) return setMsg("error:Please enter rejection reason");
    setSaving(true); setMsg("");
    try {
      const data = await apiFetch(`/api/company/admin/companies/${id}/approve-documents`, {
        method: "PUT", body: JSON.stringify({ action: "reject", reason: rejectReason }),
      });
      if (data.success) {
        setCompany(c => ({ ...c, documentsStatus: "rejected", tradeLicenseStatus: "rejected", qidStatus: "rejected" }));
        setRejectModal(false); setRejectReason("");
        setMsg("error:Documents rejected.");
      } else setMsg("error:" + (data.message || "Error"));
    } catch { setMsg("error:Server error"); }
    setSaving(false);
  };

  const approveBranch = async (branchId, action, reason = "") => {
    const data = await apiFetch(`/api/branch/admin/branches/${branchId}/approve`, {
      method: "PUT", body: JSON.stringify({ action, reason }),
    });
    if (data.success) {
      setBranches(bs => bs.map(b =>
        b._id === branchId ? { ...b, status: action === "approve" ? "approved" : "rejected" } : b
      ));
    }
  };

  const deleteBranch = async (branchId) => {
    if (!confirm("Delete this branch?")) return;
    await apiFetch(`/api/branch/admin/branches/${branchId}`, { method: "DELETE" });
    setBranches(bs => bs.filter(b => b._id !== branchId));
  };

  const toggleBranch = async (branchId) => {
    const data = await apiFetch(`/api/branch/admin/branches/${branchId}/toggle`, { method: "PUT" });
    if (data.success) setBranches(bs => bs.map(b => b._id === branchId ? { ...b, isActive: !b.isActive } : b));
  };

  if (loading) return <Loader />;
  if (!company) return <div className="flex items-center justify-center h-[60vh] text-brand-muted">Company not found</div>;

  const msgType = msg.startsWith("success:") ? "success" : "error";
  const msgText = msg.replace(/^(success:|error:)/, "");

  return (
    <div className="max-w-[1500px] ">

      {/* Message */}
      {msg && (
        <div className={`px-4 py-3 rounded-[10px] mb-4 text-[13px] font-semibold
          ${msgType === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
          {msgText}
        </div>
      )}

      {/* Company Header Card */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 md:p-6 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-5">
        <div className="flex items-start gap-4 flex-wrap">
          {company.companyLogo
            ? <img src={company.companyLogo} alt="" className="w-16 h-16 rounded-[12px] object-cover shrink-0" />
            : <div className="w-16 h-16 rounded-[12px] bg-brand-gradient text-white flex items-center justify-center text-[24px] font-bold shrink-0 shadow-[0_3px_8px_rgba(241,90,33,0.25)]">
                {company.brandName?.charAt(0)}
              </div>
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-[20px] md:text-[22px] font-extrabold text-brand-dark m-0">{company.brandName}</h1>
              <Badge status={company.accountType} map={typeMap} />
              <Badge status={company.documentsStatus} map={docsMap} />
              <Badge status={company.isActive ? "Active" : "Inactive"} map={activeMap} />
            </div>
            <p className="text-[13px] text-brand-muted m-0">{company.email} • {company.phone}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-brand-border">
          {[
            ["Contact Person", `${company.firstName} ${company.lastName}`],
            ["Role",            company.roleInBusiness],
            ["Business Type",   company.businessType],
            ["Trade License",   company.tradeLicenseNumber],
            ["No. of Branches", company.numberOfBranches],
            ["Joined",          new Date(company.createdAt).toLocaleDateString()],
            ["Password Changed", company.isPasswordChanged ? "Yes" : "No"],
            ["Account Type",    company.accountType],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-[11px] text-brand-muted m-0 mb-[3px]">{label}</p>
              <p className="text-[13px] font-semibold text-brand-dark m-0">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Card */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 md:p-6 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-5">
        <h2 className="text-[15px] font-bold text-brand-dark m-0 mb-5">Documents</h2>

        <div className="flex gap-4 flex-wrap mb-5">

          {/* Trade License */}
          <div className="flex-1 min-w-[180px] bg-brand-white border border-brand-border rounded-[12px] p-4">
            <p className="text-[11px] text-brand-muted m-0 mb-3 font-semibold uppercase tracking-wide">Trade License</p>
            {company.tradeLicenseImage
              ? <a href={company.tradeLicenseImage} target="_blank" rel="noreferrer"
                   className="block px-3 py-2 bg-blue-50 text-blue-700 rounded-[8px] text-[12px] text-center no-underline mb-2 font-semibold">
                  View Document →
                </a>
              : <p className="text-[12px] text-brand-muted mb-2">Not uploaded</p>
            }
            {company.tradeLicenseExpiry && (
              <p className="text-[11px] text-brand-muted my-1">Expiry: {new Date(company.tradeLicenseExpiry).toLocaleDateString()}</p>
            )}
            <Badge status={company.tradeLicenseStatus || "pending"} map={docsMap} />
          </div>

          {/* QID */}
          <div className="flex-1 min-w-[180px] bg-brand-white border border-brand-border rounded-[12px] p-4">
            <p className="text-[11px] text-brand-muted m-0 mb-3 font-semibold uppercase tracking-wide">QID (Contact Person)</p>
            {company.qidImage
              ? <a href={company.qidImage} target="_blank" rel="noreferrer"
                   className="block px-3 py-2 bg-blue-50 text-blue-700 rounded-[8px] text-[12px] text-center no-underline mb-2 font-semibold">
                  View Document →
                </a>
              : <p className="text-[12px] text-brand-muted mb-2">Not uploaded</p>
            }
            {company.qidExpiry && (
              <p className="text-[11px] text-brand-muted my-1">Expiry: {new Date(company.qidExpiry).toLocaleDateString()}</p>
            )}
            <Badge status={company.qidStatus || "pending"} map={docsMap} />
          </div>

          {/* Logo */}
          <div className="flex-1 min-w-[180px] bg-brand-white border border-brand-border rounded-[12px] p-4">
            <p className="text-[11px] text-brand-muted m-0 mb-3 font-semibold uppercase tracking-wide">Company Logo</p>
            {company.companyLogo
              ? <img src={company.companyLogo} alt="logo" className="w-[60px] h-[60px] rounded-[8px] object-cover" />
              : <p className="text-[12px] text-brand-muted">Not uploaded</p>
            }
          </div>
        </div>

        {/* Doc Action Buttons */}
        {company.documentsStatus === "submitted" && (
          <div className="flex gap-3 flex-wrap">
            <button disabled={saving} onClick={approveDocuments}
              className="px-5 py-2 bg-green-50 text-green-700 border border-green-200 rounded-[8px] text-[13px] font-semibold cursor-pointer ">
              {saving ? "Processing..." : "Approve Documents"}
            </button>
            <button disabled={saving} onClick={() => { setRejectModal(true); setMsg(""); }}
              className="px-5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-[8px] text-[13px] font-semibold cursor-pointer ">
              Reject Documents
            </button>
          </div>
        )}
        {company.documentsStatus === "approved" && (
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-green-700 font-semibold text-[13px] m-0">Documents Approved — Company can add branches</p>
            <button disabled={saving} onClick={() => { setRejectModal(true); setMsg(""); }}
              className="px-4 py-[6px] bg-red-50 text-red-600 border border-red-200 rounded-[8px] text-[12px] font-semibold cursor-pointer">
              Reject
            </button>
          </div>
        )}
        {company.documentsStatus === "rejected" && (
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-red-600 font-semibold text-[13px] m-0">Documents Rejected</p>
            <button disabled={saving} onClick={approveDocuments}
              className="px-4 py-[6px] bg-green-50 text-green-700 border border-green-200 rounded-[8px] text-[12px] font-semibold cursor-pointer ">
              Re-approve
            </button>
          </div>
        )}
        {company.documentsStatus === "pending" && (
          <p className="text-amber-600 text-[13px] font-semibold m-0">Company has not uploaded documents yet</p>
        )}
      </div>

      {/* Branches Card */}
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 md:p-6 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-5">
        <h2 className="text-[15px] font-bold text-brand-dark m-0 mb-5">Branches ({branches.length})</h2>

        {branches.length === 0 ? (
          <p className="text-brand-muted text-[14px]">No branches added yet</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FFEDD5]">
                    {["Manager", "Email", "Phone", "Type", "Status", "Active", "Step", "Actions"].map(h => (
                      <th key={h} className="px-3 py-[11px] text-left text-[12px] text-[#7c3a1e] font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {branches.map(b => (
                    <tr key={b._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                      <td className="px-3 py-[12px] text-[13px] font-semibold text-brand-dark">{b.managerName}</td>
                      <td className="px-3 py-[12px] text-[12px] text-brand-muted">{b.email}</td>
                      <td className="px-3 py-[12px] text-[12px] text-brand-muted">{b.phone}</td>
                      <td className="px-3 py-[12px]"><Badge status={b.accountType} map={typeMap} /></td>
                      <td className="px-3 py-[12px]"><Badge status={b.status} map={statusMap} /></td>
                      <td className="px-3 py-[12px]"><Badge status={b.isActive ? "Active" : "Inactive"} map={activeMap} /></td>
                      <td className="px-3 py-[12px] text-[12px] text-brand-muted">Step {b.registrationStep}/3</td>
                      <td className="px-3 py-[12px]">
                        <div className="flex gap-[5px] flex-wrap">
                          {b.status === "pending" && (
                            <>
                              <button onClick={() => approveBranch(b._id, "approve")}
                                className="px-2 py-[4px] bg-green-50 text-green-700 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                                Approve
                              </button>
                              <button onClick={() => { const r = prompt("Rejection reason?"); if (r) approveBranch(b._id, "reject", r); }}
                                className="px-2 py-[4px] bg-red-50 text-red-600 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                                Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => navigate(`/branches/${b._id}/detail`)}
                            className="px-2 py-[4px] bg-blue-50 text-blue-700 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                            View
                          </button>
                          <button onClick={() => toggleBranch(b._id)}
                            className="px-2 py-[4px] bg-brand-gradient text-white border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                            {b.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => deleteBranch(b._id)}
                            className="px-2 py-[4px] bg-red-50 text-red-600 border-none rounded-[6px] text-[11px] font-semibold cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {branches.map(b => (
                <div key={b._id} className="bg-brand-white border border-brand-border rounded-[12px] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[14px] font-bold text-brand-dark m-0">{b.managerName}</p>
                      <p className="text-[12px] text-brand-muted m-0 mt-[2px]">{b.email}</p>
                      <p className="text-[12px] text-brand-muted m-0">{b.phone}</p>
                    </div>
                    <span className="text-[11px] text-brand-muted">Step {b.registrationStep}/3</span>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <Badge status={b.accountType} map={typeMap} />
                    <Badge status={b.status} map={statusMap} />
                    <Badge status={b.isActive ? "Active" : "Inactive"} map={activeMap} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {b.status === "pending" && (
                      <>
                        <button onClick={() => approveBranch(b._id, "approve")}
                          className="px-3 py-[5px] bg-green-50 text-green-700 border-none rounded-[7px] text-[12px] font-semibold cursor-pointer">
                          Approve
                        </button>
                        <button onClick={() => { const r = prompt("Rejection reason?"); if (r) approveBranch(b._id, "reject", r); }}
                          className="px-3 py-[5px] bg-red-50 text-red-600 border-none rounded-[7px] text-[12px] font-semibold cursor-pointer">
                          Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => navigate(`/branches/${b._id}/detail`)}
                      className="px-3 py-[5px] bg-blue-50 text-blue-700 border-none rounded-[7px] text-[12px] font-semibold cursor-pointer">
                      View
                    </button>
                    <button onClick={() => toggleBranch(b._id)}
                      className="px-3 py-[5px] bg-brand-gradient text-white border-none rounded-[7px] text-[12px] font-semibold cursor-pointer">
                      {b.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => deleteBranch(b._id)}
                      className="px-3 py-[5px] bg-red-50 text-red-600 border-none rounded-[7px] text-[12px] font-semibold cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] px-4">
          <div className="bg-white rounded-[16px] p-6 w-full max-w-[440px] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-brand-dark m-0">Reject Documents</h3>
              <button onClick={() => setRejectModal(false)} className="bg-transparent border-none text-[18px] text-brand-muted cursor-pointer">✕</button>
            </div>
            <p className="text-[13px] text-brand-muted mb-3">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Trade license image is blurry, please re-upload..."
              className="w-full h-[100px] px-3 py-[10px] border border-brand-border rounded-[8px] text-[13px] resize-none outline-none focus:border-brand-primary transition-all"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => { setRejectModal(false); setRejectReason(""); }}
                className="px-4 py-2 bg-gray-100 text-brand-gray border-none rounded-[8px] text-[13px] cursor-pointer">
                Cancel
              </button>
              <button disabled={saving} onClick={rejectDocuments}
                className="px-4 py-2 bg-red-600 text-white border-none rounded-[8px] text-[13px] font-semibold cursor-pointer ">
                {saving ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}