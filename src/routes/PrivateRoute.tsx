import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return isLoggedIn ? <Outlet /> : <Navigate to="/signin" replace />;
}
