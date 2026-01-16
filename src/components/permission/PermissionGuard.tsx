// components/permission/PermissionGuard.tsx
import { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  anyPermission?: string[];
  anyRole?: string[];
  fallback?: ReactNode;
}

export default function PermissionGuard({ 
  children, 
  requiredPermissions = [],
  requiredRoles = [],
  anyPermission = [],
  anyRole = [],
  fallback = null 
}: PermissionGuardProps) {
  const { user } = useAuth();
  
  if (!user) return <>{fallback}</>;
  
  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );
    if (!hasAllPermissions) return <>{fallback}</>;
  }
  
  // Check required roles
  if (requiredRoles.length > 0) {
    const hasAllRoles = requiredRoles.every(role => 
      user.role.includes(role)
    );
    if (!hasAllRoles) return <>{fallback}</>;
  }
  
  // Check any permission
  if (anyPermission.length > 0) {
    const hasAnyPermission = anyPermission.some(permission => 
      user.permissions.includes(permission)
    );
    if (!hasAnyPermission) return <>{fallback}</>;
  }
  
  // Check any role
  if (anyRole.length > 0) {
    const hasAnyRole = anyRole.some(role => 
      user.role.includes(role)
    );
    if (!hasAnyRole) return <>{fallback}</>;
  }
  
  return <>{children}</>;
}