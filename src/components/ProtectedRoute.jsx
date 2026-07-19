// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//   const token = localStorage.getItem("adminToken");
//   if (!token) return <Navigate to="/" replace />;
//   return children;
// }



import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  const user = localStorage.getItem("adminUser");

  // Check if token exists and is valid
  if (!token || !user) {
    // Redirect to login if no token
    return <Navigate to="/" replace />;
  }

  // Token exists, render the protected component
  return children;
}
