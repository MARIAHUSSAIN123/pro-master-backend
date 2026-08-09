import { Navigate } from "react-router-dom";

// Wrap any admin route with this so it can't be opened without
// logging in first: <ProtectedRoute><Dashboard /></ProtectedRoute>
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}