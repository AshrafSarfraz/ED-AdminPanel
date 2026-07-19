import { useState } from "react";

const BASE = "https://el-distibutor-backend.onrender.com";

export default function BecomePartner() {
  const [form, setForm] = useState({
    brandName: "", firstName: "", lastName: "",
    businessType: "", accountType: "", numberOfBranches: 1,
    roleInBusiness: "", tradeLicenseNumber: "", email: "", phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    const req = ["brandName","businessType","accountType","tradeLicenseNumber",
                 "firstName","lastName","roleInBusiness","email","phone"];
    for (const k of req) {
      if (!form[k]) { setError("Please fill all required fields."); return; }
    }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/becomePartner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setDone(true);
      else setError(data.message || "Submission failed.");
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  };

  // ── Shared inline style fragments (mirrors the Companies.jsx convention) ──
  const inputStyle = {
    width: "100%",
    height: "38px",
    padding: "0 12px",
    border: "1px solid #f0ddd5",
    borderRadius: "10px",
    fontSize: "13px",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    color: "#111827",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    cursor: "pointer",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "500",
    color: "#9ca3af",
    marginBottom: "5px",
  };

  const sectionLabelStyle = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#F15A21",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #fdf0ea",
  };

  if (done) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFF1DD 0%, #FFF8EF 25%, #FFFFFF 55%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{
        background: "#fff",
        border: "1.5px solid #f5dfc7",
        borderRadius: "20px",
        padding: "44px 36px",
        textAlign: "center",
        maxWidth: "420px",
        width: "100%",
        boxShadow: "0 4px 20px rgba(241,90,33,0.08)",
      }}>
        <div style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F15A21, #ff7a3d)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px",
          boxShadow: "0 6px 14px rgba(241,90,33,0.30)",
        }}>
          <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>Request submitted!</h2>
        <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>
          We've sent a confirmation to your email. Our team will review your application and get back to you soon.
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFF1DD 0%, #FFF8EF 25%, #FFFFFF 55%)", padding: "40px 16px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 6px" }}>Become a Partner</h1>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>Submit your details and we'll review your application.</p>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "13px",
            color: "#dc2626",
            marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        <div style={{
          background: "#fff",
          border: "1.5px solid #f5dfc7",
          borderRadius: "20px",
          padding: "26px",
          boxShadow: "0 4px 20px rgba(241,90,33,0.06)",
        }}>

          {/* Business Info */}
          <div style={{ marginBottom: "22px" }}>
            <p style={sectionLabelStyle}>Business information</p>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Brand name <span style={{ color: "#F15A21" }}>*</span></label>
              <input style={inputStyle} value={form.brandName} onChange={e=>set("brandName",e.target.value)} placeholder="Your brand name" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label style={labelStyle}>Business type <span style={{ color: "#F15A21" }}>*</span></label>
                <select style={selectStyle} value={form.businessType} onChange={e=>set("businessType",e.target.value)}>
                  <option value="">Select</option>
                  <option value="Shop">Shop</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Distributor">Distributor</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Account type <span style={{ color: "#F15A21" }}>*</span></label>
                <select style={selectStyle} value={form.accountType} onChange={e=>set("accountType",e.target.value)}>
                  <option value="">Select</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Buyer">Buyer</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Trade license # <span style={{ color: "#F15A21" }}>*</span></label>
                <input style={inputStyle} value={form.tradeLicenseNumber} onChange={e=>set("tradeLicenseNumber",e.target.value)} placeholder="License number" />
              </div>
              <div>
                <label style={labelStyle}>Number of branches</label>
                <input style={inputStyle} type="number" min="1" value={form.numberOfBranches} onChange={e=>set("numberOfBranches",parseInt(e.target.value)||1)} />
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div style={{ marginBottom: "22px" }}>
            <p style={sectionLabelStyle}>Contact person</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label style={labelStyle}>First name <span style={{ color: "#F15A21" }}>*</span></label>
                <input style={inputStyle} value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="First name" />
              </div>
              <div>
                <label style={labelStyle}>Last name <span style={{ color: "#F15A21" }}>*</span></label>
                <input style={inputStyle} value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="Last name" />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Role in business <span style={{ color: "#F15A21" }}>*</span></label>
              <select style={selectStyle} value={form.roleInBusiness} onChange={e=>set("roleInBusiness",e.target.value)}>
                <option value="">Select role</option>
                <option value="Owner / Partner">Owner / Partner</option>
                <option value="Manager">Manager</option>
                <option value="Legal Representative">Legal Representative</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Email <span style={{ color: "#F15A21" }}>*</span></label>
                <input style={inputStyle} type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@company.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone <span style={{ color: "#F15A21" }}>*</span></label>
                <input style={inputStyle} type="tel" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+971 XX XXX XXXX" />
              </div>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              height: "42px",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: loading ? "default" : "pointer",
              color: "#fff",
              background: "linear-gradient(135deg, #F15A21, #ff7a3d)",
              boxShadow: "0 4px 14px rgba(241,90,33,0.30)",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "Submitting..." : "Submit partnership request"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "11.5px", color: "#9ca3af", marginTop: "16px" }}>
          By submitting, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}



// import { useState } from "react";

// const BASE = "https://el-distibutor-backend.onrender.com";

// export default function BecomePartner() {
//   const [form, setForm] = useState({
//     brandName: "", firstName: "", lastName: "",
//     businessType: "", accountType: "", numberOfBranches: 1,
//     roleInBusiness: "", tradeLicenseNumber: "", email: "", phone: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError]   = useState("");
//   const [done, setDone]     = useState(false);

//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

//   const submit = async () => {
//     setError("");
//     const req = ["brandName","businessType","accountType","tradeLicenseNumber",
//                  "firstName","lastName","roleInBusiness","email","phone"];
//     for (const k of req) {
//       if (!form[k]) { setError("Please fill all required fields."); return; }
//     }
//     setLoading(true);
//     try {
//       const res  = await fetch(`${BASE}/api/becomePartner`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       const data = await res.json();
//       if (data.success) setDone(true);
//       else setError(data.message || "Submission failed.");
//     } catch { setError("Connection error. Please try again."); }
//     setLoading(false);
//   };

//   const inp = "w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400";
//   const sel = inp + " appearance-none cursor-pointer";
//   const lbl = "block text-xs font-medium text-gray-500 mb-1";

//   if (done) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-md w-full">
//         <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
//           <svg width="24" height="24" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
//           </svg>
//         </div>
//         <h2 className="text-lg font-medium text-gray-900 mb-2">Request submitted!</h2>
//         <p className="text-sm text-gray-500">We've sent a confirmation to your email. Our team will review your application and get back to you soon.</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-2xl font-medium text-gray-900 mb-1">Become a Partner</h1>
//           <p className="text-sm text-gray-500">Submit your details and we'll review your application.</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
//             {error}
//           </div>
//         )}

//         <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
//           {/* Business Info */}
//           <div>
//             <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
//               Business information
//             </p>
//             <div className="mb-3">
//               <label className={lbl}>Brand name <span className="text-red-400">*</span></label>
//               <input className={inp} value={form.brandName} onChange={e=>set("brandName",e.target.value)} placeholder="Your brand name" />
//             </div>
//             <div className="grid grid-cols-2 gap-3 mb-3">
//               <div>
//                 <label className={lbl}>Business type <span className="text-red-400">*</span></label>
//                 <select className={sel} value={form.businessType} onChange={e=>set("businessType",e.target.value)}>
//                   <option value="">Select</option>
//                   <option value="Shop">Shop</option>
//                   <option value="Restaurant">Restaurant</option>
//                   <option value="Distributor">Distributor</option>
//                 </select>
//               </div>
//               <div>
//                 <label className={lbl}>Account type <span className="text-red-400">*</span></label>
//                 <select className={sel} value={form.accountType} onChange={e=>set("accountType",e.target.value)}>
//                   <option value="">Select</option>
//                   <option value="Supplier">Supplier</option>
//                   <option value="Buyer">Buyer</option>
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className={lbl}>Trade license # <span className="text-red-400">*</span></label>
//                 <input className={inp} value={form.tradeLicenseNumber} onChange={e=>set("tradeLicenseNumber",e.target.value)} placeholder="License number" />
//               </div>
//               <div>
//                 <label className={lbl}>Number of branches</label>
//                 <input className={inp} type="number" min="1" value={form.numberOfBranches} onChange={e=>set("numberOfBranches",parseInt(e.target.value)||1)} />
//               </div>
//             </div>
//           </div>

//           {/* Contact Person */}
//           <div>
//             <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
//               Contact person
//             </p>
//             <div className="grid grid-cols-2 gap-3 mb-3">
//               <div>
//                 <label className={lbl}>First name <span className="text-red-400">*</span></label>
//                 <input className={inp} value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="First name" />
//               </div>
//               <div>
//                 <label className={lbl}>Last name <span className="text-red-400">*</span></label>
//                 <input className={inp} value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="Last name" />
//               </div>
//             </div>
//             <div className="mb-3">
//               <label className={lbl}>Role in business <span className="text-red-400">*</span></label>
//               <select className={sel} value={form.roleInBusiness} onChange={e=>set("roleInBusiness",e.target.value)}>
//                 <option value="">Select role</option>
//                 <option value="Owner / Partner">Owner / Partner</option>
//                 <option value="Manager">Manager</option>
//                 <option value="Legal Representative">Legal Representative</option>
//               </select>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className={lbl}>Email <span className="text-red-400">*</span></label>
//                 <input className={inp} type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@company.com" />
//               </div>
//               <div>
//                 <label className={lbl}>Phone <span className="text-red-400">*</span></label>
//                 <input className={inp} type="tel" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+971 XX XXX XXXX" />
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={submit}
//             disabled={loading}
//             className="w-full h-10 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
//           >
//             {loading ? "Submitting..." : "Submit partnership request"}
//           </button>
//         </div>

//         <p className="text-center text-xs text-gray-400 mt-4">
//           By submitting, you agree to our terms of service and privacy policy.
//         </p>
//       </div>
//     </div>
//   );
// }
