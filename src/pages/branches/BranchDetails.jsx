import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";


const BASE  = "https://el-distibutor-backend.onrender.com";
const token = () => localStorage.getItem("adminToken");

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) },
  }).then(r => r.json());

const apiUpload = (path, formData) =>
  fetch(`${BASE}${path}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body:    formData,
  }).then(r => r.json());

const fmtAmt = (n) => n != null ? `QAR ${Number(n).toLocaleString("en", { minimumFractionDigits: 2 })}` : "—";

// ─── Upload Documents Section ─────────────────────────────────────────────────
function UploadDocsSection({ branch, onUpdated }) {
  const [contractFile, setContractFile] = useState(null);
  const [pdcFile,      setPdcFile]      = useState(null);
  const [pdcAmount,    setPdcAmount]    = useState(branch.pdcAmount || "");
  const [loading,      setLoading]      = useState("");
  const [msg,          setMsg]          = useState(null);
  const contractRef = useRef();
  const pdcRef      = useRef();

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };

  const uploadContract = async () => {
    if (!contractFile) return flash("err", "Please select a PDF file");
    setLoading("contract");
    const fd = new FormData();
    fd.append("contract", contractFile);
    const res = await apiUpload(`/api/branch/admin/branches/${branch._id}/upload-contract`, fd);
    setLoading("");
    if (res.success) { flash("ok", "Contract uploaded ✓"); setContractFile(null); contractRef.current.value = ""; onUpdated({ contractPdf: res.data.contractPdf }); }
    else flash("err", res.message || "Upload failed");
  };

  const uploadPdc = async () => {
    if (!pdcAmount) return flash("err", "Please enter PDC amount");
    setLoading("pdc");
    const fd = new FormData();
    fd.append("pdcAmount", pdcAmount);
    if (pdcFile) fd.append("pdcImage", pdcFile);
    const res = await apiUpload(`/api/branch/admin/branches/${branch._id}/upload-pdc`, fd);
    setLoading("");
    if (res.success) { flash("ok", "PDC saved ✓"); setPdcFile(null); if (pdcRef.current) pdcRef.current.value = ""; onUpdated({ pdcImage: res.data.pdcImage, pdcAmount: res.data.pdcAmount }); }
    else flash("err", res.message || "Upload failed");
  };

  return (
    <div className="bg-gradient-to-br from-[#FFF1DD] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 md:p-6 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-5">
      <h2 className="text-[15px] font-bold text-brand-dark m-0 mb-4">Documents</h2>

      {msg && (
        <div className={`px-4 py-2 rounded-[8px] text-[12px] font-semibold mb-4
          ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      <div className="flex gap-4 flex-wrap">

        {/* Contract PDF */}
        <div className="flex-1 min-w-[200px] bg-brand-white border border-brand-border rounded-[12px] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-brand-dark m-0">Contract PDF</p>
            <span className={`text-[11px] px-2 py-[2px] rounded-[10px] font-semibold
              ${branch.contractPdf ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
              {branch.contractPdf ? "Uploaded" : "Pending"}
            </span>
          </div>
          {branch.contractPdf
            ? <a href={branch.contractPdf} target="_blank" rel="noreferrer"
                className="block px-3 py-2 bg-blue-50 text-blue-700 rounded-[8px] text-[12px] text-center no-underline mb-3 font-semibold">
                View →
              </a>
            : <p className="text-[11px] text-brand-muted mb-3 m-0">Not uploaded</p>
          }
          <label className="block cursor-pointer mb-2">
            <input ref={contractRef} type="file" accept=".pdf" onChange={e => setContractFile(e.target.files[0])} className="hidden" />
            <span className="block px-3 py-[7px] border border-dashed border-brand-border rounded-[8px] text-[11px] text-brand-gray text-center bg-white cursor-pointer">
              {contractFile ? `📎 ${contractFile.name}` : "Choose PDF"}
            </span>
          </label>
          <button
            onClick={uploadContract}
            disabled={loading === "contract" || !contractFile}
            className="w-full py-[7px] rounded-[8px] text-[12px] font-bold border-none cursor-pointer  bg-brand-gradient text-white"
          >
            {loading === "contract" ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* PDC (Buyer only) */}
        {branch.accountType === "Buyer" && (
          <div className="flex-1 min-w-[200px] bg-brand-white border border-brand-border rounded-[12px] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-brand-dark m-0">PDC Cheque</p>
              <span className={`text-[11px] px-2 py-[2px] rounded-[10px] font-semibold
                ${branch.pdcImage && branch.pdcAmount ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                {branch.pdcImage && branch.pdcAmount ? "Uploaded" : "Pending"}
              </span>
            </div>
            {branch.pdcImage
              ? <a href={branch.pdcImage} target="_blank" rel="noreferrer"
                  className="block px-3 py-2 bg-blue-50 text-blue-700 rounded-[8px] text-[12px] text-center no-underline mb-2 font-semibold">
                  View →
                </a>
              : <p className="text-[11px] text-brand-muted mb-2 m-0">Not uploaded</p>
            }
            {branch.pdcAmount && (
              <p className="text-[11px] text-brand-gray mb-2 m-0">Amount: {branch.pdcAmount} QAR</p>
            )}
            <input
              type="number"
              placeholder="PDC Amount (QAR)"
              value={pdcAmount}
              onChange={e => setPdcAmount(e.target.value)}
              className="w-full px-3 py-[7px] border border-brand-border rounded-[8px] text-[12px] outline-none mb-2 focus:border-brand-primary transition-all"
            />
            <label className="block cursor-pointer mb-2">
              <input ref={pdcRef} type="file" accept="image/*" onChange={e => setPdcFile(e.target.files[0])} className="hidden" />
              <span className="block px-3 py-[7px] border border-dashed border-brand-border rounded-[8px] text-[11px] text-brand-gray text-center bg-white cursor-pointer">
                {pdcFile ? `🖼 ${pdcFile.name}` : "Choose Image"}
              </span>
            </label>
            <button
              onClick={uploadPdc}
              disabled={loading === "pdc"}
              className="w-full py-[7px] rounded-[8px] text-[12px] font-bold border-none cursor-pointer  bg-brand-gradient text-white"
            >
              {loading === "pdc" ? "Saving..." : "Save PDC"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Right sidebar — order/earning/return summary, auto-detects Buyer vs Supplier ──
function StatsRow({ label, value, valueClass = "text-brand-dark" }) {
  return (
    <div className="flex items-center justify-between py-[9px] border-b border-brand-border last:border-0">
      <span className="text-[12px] text-brand-gray">{label}</span>
      <span className={`text-[13px] font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

function BranchStatsSidebar({ branchId, accountType }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = accountType === "Supplier"
      ? `/api/admin/supplier-profile/${branchId}`
      : `/api/admin/buyer-profile/${branchId}`;
    apiFetch(endpoint)
      .then(d => { if (d.success) setProfile(d); })
      .finally(() => setLoading(false));
  }, [branchId, accountType]);

  const Box = ({ title, children }) => (
    <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-4">
      <h3 className="text-[13px] font-bold text-brand-dark m-0 mb-2">{title}</h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        <div className="flex justify-center py-6"><Loader size={26} fullScreen={false} /></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
        <p className="text-[12px] text-brand-muted m-0">No activity yet</p>
      </div>
    );
  }

  // ─── SUPPLIER ────────────────────────────────────────────────────────────
  if (accountType === "Supplier") {
    const { orderSummary, returnSummary, financialSummary, biddingSummary } = profile;
    return (
      <>
        <Box title="Orders">
          <StatsRow label="Total Won Orders"  value={orderSummary.totalWonOrders} />
          <StatsRow label="Delivered"         value={orderSummary.ready} valueClass="text-green-700" />
          <StatsRow label="Awaiting Pack/Ready" value={orderSummary.awarded} valueClass="text-amber-600" />
          <StatsRow label="Cancelled"         value={orderSummary.cancelled} valueClass="text-red-600" />
        </Box>

        <Box title="Returns">
          <StatsRow label="Total Returns"     value={returnSummary.totalReturnsInvolved} />
          <StatsRow label="Pending Response"  value={returnSummary.pending} valueClass="text-amber-600" />
          <StatsRow label="Supplier Guilty"   value={returnSummary.resolvedGuilty} valueClass="text-red-600" />
          <StatsRow label="Rider Guilty (not their fault)" value={returnSummary.resolvedNotGuilty} valueClass="text-green-700" />
        </Box>

        <Box title="Earnings">
          <StatsRow label="Gross Earning"  value={fmtAmt(financialSummary.totalOrderEarning)} />
          <StatsRow label="Penalty"        value={fmtAmt(financialSummary.totalPenalty)} valueClass="text-red-600" />
          <StatsRow label="Net Earned"     value={fmtAmt(financialSummary.totalNetEarned)} valueClass="text-green-700" />
          <StatsRow label="Bill Pending"   value={fmtAmt(financialSummary.totalPending)} valueClass="text-amber-600" />
          <StatsRow label="Already Paid"   value={fmtAmt(financialSummary.totalReleased)} valueClass="text-green-700" />
        </Box>

        <Box title="Bidding">
          <StatsRow label="Total Bids" value={biddingSummary.totalBids} />
          <StatsRow label="Won"        value={biddingSummary.won} valueClass="text-green-700" />
          <StatsRow label="Lost"       value={biddingSummary.lost} valueClass="text-red-600" />
        </Box>
      </>
    );
  }

  // ─── BUYER ───────────────────────────────────────────────────────────────
  const { orderSummary, purchaseSummary, returnSummary } = profile;
  return (
    <>
      <Box title="Orders">
        <StatsRow label="Total Orders" value={orderSummary.totalOrders} />
        <StatsRow label="Delivered"    value={orderSummary.delivered} valueClass="text-green-700" />
        <StatsRow label="Returned"     value={orderSummary.returned} valueClass="text-red-600" />
        <StatsRow label="Cancelled"    value={orderSummary.cancelled} valueClass="text-red-600" />
      </Box>

      <Box title="Purchasing">
        <StatsRow label="Total Purchase Value" value={fmtAmt(purchaseSummary.totalPurchaseValue)} />
        <StatsRow label="Total Paid"           value={fmtAmt(purchaseSummary.totalPaid)} valueClass="text-green-700" />
        <StatsRow label="Bill Pending"         value={fmtAmt(purchaseSummary.totalDue)} valueClass="text-amber-600" />
        <StatsRow label="Invoices"             value={`${purchaseSummary.invoiceCount} (${purchaseSummary.unpaidCount} unpaid)`} />
      </Box>

      <Box title="Returns">
        <StatsRow label="Total Requested"   value={returnSummary.totalReturnsRequested} />
        <StatsRow label="Pending"           value={returnSummary.pending} valueClass="text-amber-600" />
        <StatsRow label="Supplier Guilty"   value={returnSummary.resolvedSupplierGuilty} valueClass="text-red-600" />
        <StatsRow label="Rider Guilty"      value={returnSummary.resolvedRiderGuilty} valueClass="text-amber-600" />
      </Box>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BranchDetail() {
  const { id }             = useParams();
  const navigate           = useNavigate();
  const [data,    setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/branch/admin/branches/${id}/detail`, {
      headers: { Authorization: `Bearer ${token()}` },
    }).then(r => r.json()).then(res => { if (res.success) setData(res.data); }).finally(() => setLoading(false));
  }, [id]);

  const handleDocsUpdated = (patch) => setData(prev => ({ ...prev, branch: { ...prev.branch, ...patch } }));

  if (loading) return <Loader />;
  if (!data)   return <div className="flex items-center justify-center h-[60vh] text-brand-muted">Branch not found</div>;

  const { branch, items, totalItems } = data;

  const InfoGrid = ({ items: infoItems, cols = 4 }) => (
    <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4`}>
      {infoItems.map(([label, val]) => (
        <div key={label}>
          <p className="text-[11px] text-brand-muted m-0 mb-[3px]">{label}</p>
          <p className="text-[13px] font-semibold text-brand-dark m-0">{val || "—"}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-[1600px] grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

      {/* ─── Left: Main content ─── */}
      <div className="min-w-0">

        {/* Header Card */}
        <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 md:p-6 shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-5">
          <div className="flex items-start gap-4 flex-wrap mb-5">
            <div className="w-14 h-14 rounded-[12px] bg-brand-gradient text-white flex items-center justify-center text-[22px] font-bold shrink-0 shadow-[0_3px_8px_rgba(241,90,33,0.25)]">
              {branch.managerName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-[20px] font-extrabold text-brand-dark m-0">{branch.managerName}</h1>
                {[
                  { val: branch.accountType, cls: branch.accountType === "Supplier" ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200" },
                  { val: branch.status,      cls: branch.status === "approved" ? "bg-green-50 text-green-700 border-green-200" : branch.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-red-50 text-red-600 border-red-200" },
                  { val: branch.isActive ? "Active" : "Inactive", cls: branch.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200" },
                  { val: `Step ${branch.registrationStep}/2`, cls: "bg-gray-50 text-gray-500 border-gray-200" },
                ].map((b, i) => (
                  <span key={i} className={`px-3 py-[3px] rounded-[20px] text-[12px] font-semibold border ${b.cls}`}>{b.val}</span>
                ))}
              </div>
              <p className="text-[13px] text-brand-muted m-0">{branch.email} • {branch.phone}</p>
            </div>
          </div>
          <div className="pt-5 border-t border-brand-border">
            <InfoGrid items={[
              ["Branch No",   branch.branchNo],
              ["Company",     branch.companyId?.brandName],
              ["Manager",     branch.managerName],
              ["Joined",      new Date(branch.createdAt).toLocaleDateString()],
              ["Email",       branch.email],
              ["Phone",       branch.phone],
              ["Pwd Changed", branch.isPasswordChanged ? "Yes" : "No"],
              ["Account",     branch.accountType],
            ]} />
          </div>
        </div>

        {/* Documents */}
        <UploadDocsSection branch={branch} onUpdated={handleDocsUpdated} />

        {/* Address + Bank side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
            <h2 className="text-[15px] font-bold text-brand-dark m-0 mb-4">Address</h2>
            {branch.address?.address
              ? <InfoGrid cols={2} items={[["Address", branch.address.address], ["Area", branch.address.area], ["City", branch.address.city], ["Lat/Lng", `${branch.address.lat}, ${branch.address.lng}`]]} />
              : <p className="text-brand-muted text-[13px] m-0">Not added yet</p>
            }
          </div>

          <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] p-5 shadow-[0_4px_20px_rgba(241,90,33,0.06)]">
            <h2 className="text-[15px] font-bold text-brand-dark m-0 mb-4">Bank Details</h2>
            {branch.bankDetails?.accountName
              ? <InfoGrid cols={2} items={[["Account Name", branch.bankDetails.accountName], ["Account No", branch.bankDetails.accountNumber], ["IBAN", branch.bankDetails.iban], ["Bank", branch.bankDetails.bankName]]} />
              : <p className="text-brand-muted text-[13px] m-0">Not added yet</p>
            }
          </div>
        </div>

        {/* Catalog Items */}
        {branch.accountType === "Supplier" && (
          <div className="bg-gradient-to-br from-[#FFF8EF] via-[#FFF8EF] to-white border border-brand-border rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(241,90,33,0.06)] mb-5">
            <div className="flex items-center justify-between p-5 md:p-6 pb-4">
              <div>
                <h2 className="text-[15px] font-bold text-brand-dark m-0">Catalog Items</h2>
                <p className="text-[12px] text-brand-muted m-0 mt-1">{totalItems} total items</p>
              </div>
              {totalItems > 3 && (
                <button
                  onClick={() => navigate(`/branches/${id}/catalog`)}
                  className="px-4 py-2 bg-brand-gradient text-white rounded-[8px] text-[12px] font-bold border-none cursor-pointer shadow-[0_2px_8px_rgba(241,90,33,0.2)]"
                >
                  View All ({totalItems}) →
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-brand-muted text-[13px] px-6 pb-6 m-0">No items added yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#FFEDD5]">
                      {["Item", "Category", "Country", "Price/Unit", "Listed", "Available"].map(h => (
                        <th key={h} className="px-4 py-[13px] text-left text-[12px] text-[#7c3a1e] font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 3).map(item => (
                      <tr key={item._id} className="border-b border-[#fdf0ea] hover:bg-[rgba(241,90,33,0.05)] transition-colors">
                        <td className="px-4 py-[12px]">
                          <div className="flex items-center gap-3">
                            {item.platformItemId?.image
                              ? <img src={item.platformItemId.image} alt="" className="w-8 h-8 rounded-[6px] object-cover" />
                              : <div className="w-8 h-8 rounded-[6px] bg-brand-lighter flex items-center justify-center text-[10px] text-brand-muted">IMG</div>
                            }
                            <div>
                              <p className="text-[13px] font-semibold text-brand-dark m-0">{item.platformItemId?.name}</p>
                              <p className="text-[11px] text-brand-muted m-0">{item.platformItemId?.unit}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-[12px] text-[13px] text-brand-gray">{item.categoryId?.name || "—"}</td>
                        <td className="px-4 py-[12px] text-[13px] text-brand-gray">{item.countryId?.name || "—"}</td>
                        <td className="px-4 py-[12px] text-[14px] font-bold text-brand-dark">{item.pricePerUnit} QAR</td>
                        <td className="px-4 py-[12px]">
                          <span className={`px-2 py-[2px] rounded-[10px] text-[11px] font-semibold ${item.isListed ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                            {item.isListed ? "Listed" : "Hidden"}
                          </span>
                        </td>
                        <td className="px-4 py-[12px]">
                          <span className={`px-2 py-[2px] rounded-[10px] text-[11px] font-semibold ${item.isAvailableToday ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                            {item.isAvailableToday ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Right: Stats sidebar (auto Buyer/Supplier) ─── */}
      <div className="min-w-0">
        <BranchStatsSidebar branchId={id} accountType={branch.accountType} />
      </div>
    </div>
  );
}
