import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/loader/Spinner";

interface AuthRouteProps {
  children: ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <Spinner size={150} className="mt-60" label="Memuat..." />;
  }

  // Jika user sudah login → redirect ke home
  return isLoggedIn ? <Navigate to="/" replace /> : children;
}
