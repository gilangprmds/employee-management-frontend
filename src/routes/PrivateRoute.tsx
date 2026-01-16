import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/loader/Spinner";

export default function PrivateRoute() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <Spinner size={150} className="mt-60" label="Memuat..." />;

  return isLoggedIn ? <Outlet /> : <Navigate to="/signin" replace />;
}
