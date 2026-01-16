// components/permission/HasPermission.tsx - Hook version
import { useAuth } from "../../context/AuthContext";

export function useHasPermission() {
  const { user } = useAuth();
  
  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permissionName);
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };
  
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  };
  
  const hasRole = (roleCode: string): boolean => {
    if (!user) return false;
    return user.role.includes(roleCode);
  };
  
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.some(role => user.role.includes(role));
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole
  };
}