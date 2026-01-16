import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { setAccessToken } from "../api/token";
import authApi from "../api/auth.Api";

interface User {
  userId: number;
  email: string;
  fullName: string;
  role: string[];
  permissions: string[];
  department?: string;
  profileImageUrl: string;
}

interface AuthResponse {
  userId: number;
  email: string;
  fullName: string;
  department?: string;
  roles: string[];
  permissions: string[];
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  profileImageUrl: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (roleCode: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // =======================
  // INITIAL SESSION CHECK
  // =======================
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await authApi.post<AuthResponse>("/api/auth/refresh");
        setAccessToken(res.data.accessToken);
        setUser({
          userId: res.data.userId,
          email: res.data.email,
          fullName: res.data.fullName,
          department: res.data.department,
          role: res.data.roles,
          permissions: res.data.permissions,
          profileImageUrl: res.data.profileImageUrl,
        });
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  // =======================
  // LOGIN
  // =======================
  async function login(email: string, password: string) {
    const res = await authApi.post<AuthResponse>("/api/auth/login", {
      email,
      password,
    });

    setAccessToken(res.data.accessToken);
    setUser({
      userId: res.data.userId,
      email: res.data.email,
      fullName: res.data.fullName,
      department: res.data.department,
      role: res.data.roles,
      permissions: res.data.permissions,
      profileImageUrl: res.data.profileImageUrl,
    });
  }

  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permissionName);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.some((permission) =>
      user.permissions.includes(permission)
    );
  };

  const hasRole = (roleCode: string): boolean => {
    if (!user) return false;
    return user.role.includes(roleCode);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.some((role) => user.role.includes(role));
  };

  // =======================
  // LOGOUT
  // =======================
  async function logout() {
    await authApi.post("/api/auth/logout");
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
