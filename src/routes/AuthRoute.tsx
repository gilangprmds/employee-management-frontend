import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AuthRouteProps {
  children: ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  // Jika user sudah login → redirect ke home
  return isLoggedIn ? <Navigate to="/" replace /> : children;
}
