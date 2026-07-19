// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../../api/axios";
// import toast, { Toaster } from "react-hot-toast";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState("email"); // "email" or "reset"
//   const navigate = useNavigate();

//   // Check if user is already logged in
//   useEffect(() => {
//     const token = localStorage.getItem("adminToken");
//     if (token) {
//       navigate("/dashboard");
//     }
//   }, [navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await API.post("/admin/auth/forgot-password", { email });
//       toast.success("Reset link sent to your email!");
//       setStep("reset");
//       setTimeout(() => navigate("/"), 3000);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Error sending reset link");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <Toaster />
//       <div style={styles.wrapper}>
//         {/* Left Side - Illustration */}
//         <div style={styles.leftSide}>
//           <img 
//             src="/src/assets/Images/forgetbg.png" 
//             alt="Forgot Password" 
//             style={styles.illustration}
//           />
//         </div>

//         {/* Right Side - Form */}
//         <div style={styles.rightSide}>
//           <div style={styles.formContainer}>
//             {step === "email" ? (
//               <>
//                 <h2 style={styles.formTitle}>Forgot Password?</h2>
//                 <p style={styles.formSubtitle}>
//                   Enter your email address and we'll send you a link to reset
//                   your password
//                 </p>

//                 <form onSubmit={handleSubmit}>
//                   <div style={styles.field}>
//                     <label style={styles.label}>Email Address</label>
//                     <input
//                       style={styles.input}
//                       type="email"
//                       placeholder="admin@example.com"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                     />
//                   </div>

//                   <button
//                     style={{
//                       ...styles.btn,
//                       opacity: loading ? 0.7 : 1,
//                       cursor: loading ? "not-allowed" : "pointer",
//                     }}
//                     type="submit"
//                     disabled={loading}
//                   >
//                     {loading ? "Sending..." : "Send Reset"}
//                   </button>
//                 </form>

//                 <p
//                   style={styles.backLink}
//                   onClick={() => navigate("/")}
//                 >
//                   ← Back to Login
//                 </p>
//               </>
//             ) : (
//               <div style={styles.successMessage}>
//                 <div style={styles.checkIcon}>✓</div>
//                 <h3 style={styles.successTitle}>Email Sent!</h3>
//                 <p style={styles.successText}>
//                   Check your email for instructions to reset your password.
//                   Redirecting to login...
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     minHeight: "100vh",
//     backgroundColor: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "20px",
    
//   },
//   wrapper: {
//     display: "flex",
//     width: "100%",
//     maxWidth: "1150px",
//     height: "550px",
//     borderRadius: "16px",
//     overflow: "hidden",
//     boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
//     backgroundColor: "#fff",
//   },
//   leftSide: {
//     flex: 1,
//     background: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "40px",
//     color: "#fff",
//     position: "relative",
//     overflow: "hidden",
//   },
//   illustration: {
//     width: "100%",
//     height: "100%",
//     objectFit: "cover",
//     position: "absolute",
//     top: 0,
//     left: 0,
//   },
//   welcomeTitle: {
//     fontSize: "28px",
//     fontWeight: "700",
//     margin: "0 0 8px 0",
//     position: "relative",
//     zIndex: 2,
//   },
//   welcomeSubtitle: {
//     fontSize: "14px",
//     fontWeight: "400",
//     margin: 0,
//     opacity: 0.9,
//     position: "relative",
//     zIndex: 2,
//   },
//   rightSide: {
//     flex: 1,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "60px 40px",
//     backgroundColor: "#FFFAF5",
//   },
//   formContainer: {
//     width: "100%",
//     maxWidth: "360px",
//   },
//   formTitle: {
//     fontSize: "24px",
//     fontWeight: "700",
//     color: "#1a1a2e",
//     margin: "0 0 12px 0",
//     textAlign: "center",
//   },
//   formSubtitle: {
//     fontSize: "13px",
//     color: "#666",
//     textAlign: "center",
//     marginBottom: "32px",
//     fontWeight: "400",
//     lineHeight: "1.5",
//   },
//   field: {
//     marginBottom: "20px",
//   },
//   label: {
//     display: "block",
//     fontSize: "13px",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: "8px",
//   },
//   input: {
//     width: "100%",
//     padding: "11px 14px",
//     borderRadius: "8px",
//     border: "1px solid #E5E7EB",
//     fontSize: "14px",
//     fontWeight: "400",
//     outline: "none",
//     boxSizing: "border-box",
//     backgroundColor: "#fff",
//     transition: "border-color 0.3s",
//     fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//   },
//   btn: {
//     width: "100%",
//     padding: "12px",
//     backgroundColor: "#F97316",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     fontSize: "15px",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "background-color 0.3s",
//     fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//   },
//   backLink: {
//     textAlign: "center",
//     marginTop: "20px",
//     color: "#F97316",
//     fontSize: "13px",
//     cursor: "pointer",
//     fontWeight: "500",
//     userSelect: "none",
//     transition: "opacity 0.2s",
//   },
//   successMessage: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     textAlign: "center",
//     padding: "40px 20px",
//   },
//   checkIcon: {
//     width: "80px",
//     height: "80px",
//     borderRadius: "50%",
//     backgroundColor: "#DBEAFE",
//     color: "#F97316",
//     fontSize: "40px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: "20px",
//     fontWeight: "bold",
//   },
//   successTitle: {
//     fontSize: "22px",
//     fontWeight: "700",
//     color: "#1a1a2e",
//     margin: "0 0 12px 0",
//   },
//   successText: {
//     fontSize: "14px",
//     color: "#666",
//     margin: 0,
//     lineHeight: "1.6",
//   },
// };



import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import logo from "../../assets/Images/logo 6.png";
import AuthBg from "../../assets/Images/authbg.png";


export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState("email");
  const navigate              = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/admin/auth/forgot-password", { email });
      toast.success("Reset link sent to your email!");
      setStep("reset");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FC9B3F]">
      <Toaster />

      {/* Left Side - Image + Text */}
      <div className="hidden md:flex flex-1 relative overflow-hidden flex-col">
        <img
          src={AuthBg}
          alt="Forgot Password"
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="relative z-10 px-16 pt-[120px]">
          <h1 className="text-white text-[34px] font-extrabold leading-tight m-0">
            Forgot Password?
          </h1>
          <p className="text-white/80 text-[16px] mt-1 font-bold  max-w-[300px]">
            Enter your email and we'll help you reset your password quickly.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-brand-white min-h-screen md:min-h-0">
        <div className="w-full max-w-[460px] bg-[#FFF7ED] rounded-[24px] px-10 py-14">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src={logo}
              alt="EL Distributor"
              className="w-14 h-14 rounded-[12px] shadow-[0_4px_12px_rgba(241,90,33,0.3)]"
            />
          </div>

          {step === "email" ? (
            <>
              <div className="mb-2">
                <h3 className="text-[18px] font-bold text-brand-dark text-center m-0">Forgot Password?</h3>
                <p className="text-[13px] text-brand-muted text-center mt-1 mb-6 ">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-brand-dark mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-[11px] border border-brand-border rounded-[8px] text-[14px] outline-none bg-white focus:border-brand-primary transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-gradient text-white rounded-[8px] text-[15px] font-bold border-none cursor-pointer disabled:opacity-70 shadow-[0_4px_12px_rgba(241,90,33,0.3)] transition-all"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p
                onClick={() => navigate("/")}
                className="text-center mt-5 text-brand-primary text-[13px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                ← Back to Login
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-20 h-20 rounded-full bg-brand-soft border-2 border-brand-primary flex items-center justify-center mb-5 shadow-[0_4px_16px_rgba(241,90,33,0.2)]">
                <span className="text-brand-primary text-[36px] font-bold">✓</span>
              </div>
              <h3 className="text-[22px] font-extrabold text-brand-dark m-0 mb-3">Email Sent!</h3>
              <p className="text-[14px] text-brand-muted leading-relaxed m-0">
                Check your email for instructions to reset your password. Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
