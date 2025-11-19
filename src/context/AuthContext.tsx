import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../api/axios";

// ==============================
// 🧩 Type Definitions
// ==============================

// Tipe User sesuai kebutuhan aplikasi kamu
export interface User {
  username: string;
  roles?: string[];
}

// Response login API
interface LoginResponse {
  accessToken: string;
  user: User;
}

// Response refresh API
interface RefreshResponse {
  accessToken: string;
  user: User;
}

// Context Value Type
interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isLoggedIn: boolean;
}

// Props untuk Provider
interface AuthProviderProps {
  children: ReactNode;
}

// ==============================
// 🔥 Create Context
// ==============================
const AuthContext = createContext<AuthContextValue | null>(null);

// ==============================
// 🔥 Auth Provider Component
// ==============================
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Axios interceptor (updated when token changes)
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [accessToken]);

  // AUTO LOGIN (refresh session)
  useEffect(() => {
    async function refreshSession() {
      try {
        const res = await api.post<RefreshResponse>("/auth/refresh");
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }

    refreshSession();
  }, []);

  // LOGIN FUNCTION
  async function login(username: string, password: string) {
    const res = await api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });

    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  }

  // LOGOUT FUNCTION
  async function logout() {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        loading,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==============================
// 🔥 Custom Hook
// ==============================
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return context;
}
