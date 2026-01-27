import React, { useState, useEffect, useMemo } from "react";
// Menggunakan React Icons sebagai pengganti MUI Icons
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiX,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import PermissionGuard from "../components/permission/PermissionGuard";
import roleApi from "../api/roleApi";
import permissionApi from "../api/permissionApi";
import { Role, Permission } from "../api/roleTypes";

const RoleManagement: React.FC = () => {
  // const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  // state untuk active module
  const [activeModule, setActiveModule] = useState<string>("USER");

  // State UI
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // State Form
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        roleApi.getAll(),
        permissionApi.getAll(),
      ]);
      setRoles(rolesRes.data.content);
      setPermissions(permissionsRes.data.content);
    } catch (error) {
      showSnackbar("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({ name: "", code: "", description: "", isActive: true });
    setSelectedPermissions([]);
    setEditingRole(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (role: Role) => {
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || "",
      isActive: role.isActive !== false,
    });
    setSelectedPermissions(role.permissions.map((p) => p.name));
    setEditingRole(role);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const roleData = { ...formData, permissionNames: selectedPermissions };
      if (editingRole) {
        await roleApi.update(editingRole.id, roleData);
        showSnackbar("Role updated successfully", "success");
      } else {
        await roleApi.create(roleData);
        showSnackbar("Role created successfully", "success");
      }
      setOpenDialog(false);
      loadData();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to save role",
        "error"
      );
    }
  };

  const handleDelete = async (roleId: string, roleCode: string) => {
    if (["ADMIN", "EMPLOYEE"].includes(roleCode)) {
      showSnackbar("Cannot delete system roles", "error");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await roleApi.delete(roleId);
      showSnackbar("Role deleted successfully", "success");
      loadData();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to delete role",
        "error"
      );
    }
  };

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((name) => name !== permissionName)
        : [...prev, permissionName]
    );
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
    // Auto hide
    setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
  };

  // Group permissions logic
  // const groupedPermissions = permissions.reduce(
  //   (acc, permission) => {
  //     const category = permission.category || "General";
  //     if (!acc[category]) acc[category] = [];
  //     acc[category].push(permission);
  //     return acc;
  //   },
  //   {} as Record<string, Permission[]>
  // );

  // Fungsi untuk mengelompokkan permission berdasarkan modul
  const permissionsByModule = useMemo(() => {
    return permissions.reduce(
      (acc, permission) => {
        // Ekstrak modul dari permission name (contoh: "user:read:all" -> modul "user")
        const moduleMatch = permission.name.match(/^([^:]+):/);
        const module = moduleMatch ? moduleMatch[1].toUpperCase() : "GENERAL";

        if (!acc[module]) acc[module] = [];
        acc[module].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }, [permissions]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading data...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Managemen Role dan Permission</h1>
          <p className="text-sm text-gray-500">
            Kelola peran pengguna dan hak akses di sistem Anda.
          </p>
        </div>
        <PermissionGuard requiredPermissions={["role:create:all"]}>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
          >
            <FiPlus /> Create Role
          </button>
        </PermissionGuard>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {role.name}
                    {role.isSystem && (
                      <FiLock
                        className="text-gray-400 w-4 h-4"
                        title="System Role"
                      />
                    )}
                  </h3>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                    {role.code}
                  </span>
                </div>
                <div className="flex gap-1">
                  <PermissionGuard requiredPermissions={["role:update:all"]}>
                    <button
                      onClick={() => handleOpenEdit(role)}
                      disabled={role.isSystem}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition disabled:opacity-30"
                    >
                      <FiEdit2 size={16} />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard requiredPermissions={["role:delete:all"]}>
                    <button
                      onClick={() => handleDelete(role.id, role.code)}
                      disabled={role.isSystem}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-30"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </PermissionGuard>
                </div>
              </div>

              <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                {role.description || "No description provided."}
              </p>

              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">
                  Permissions
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions?.slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      className="px-2 py-1 text-xs border border-gray-200 rounded-md text-gray-600 bg-gray-50"
                    >
                      {p.description}
                    </span>
                  ))}
                  {(role.permissions?.length || 0) > 3 && (
                    <span className="px-2 py-1 text-xs border border-gray-200 rounded-md text-gray-500 bg-gray-50">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <FiUsers className="w-4 h-4" />
                <span>{role.userCount || 0} users</span>
              </div>
              <span
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  role.isActive
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {role.isActive ? (
                  <>
                    <FiCheckCircle size={12} /> Active
                  </>
                ) : (
                  <>
                    <FiXCircle size={12} /> Inactive
                  </>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenDialog(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRole ? "Edit Role" : "Create New Role"}
              </h2>
              <button
                onClick={() => setOpenDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 disabled:cursor-not-allowed"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., HR_MANAGER"
                    disabled={!!editingRole}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status Active
                  </label>
                  <button
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${formData.isActive ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.isActive ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Permissions Selection */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Permissions
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Select all permissions
                        setSelectedPermissions(permissions.map((p) => p.name));
                      }}
                      className="text-xs px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      className="text-xs px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Tabs untuk modul */}
                <div className="border-b border-gray-200 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(permissionsByModule).map((module) => (
                      <button
                        key={module}
                        onClick={() => setActiveModule(module)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                          activeModule === module
                            ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {module.replace("_", " ")}
                        <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {permissionsByModule[module].length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permission cards per modul */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissionsByModule[activeModule]?.map((permission) => (
                    <div
                      key={permission.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        selectedPermissions.includes(permission.name)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                      onClick={() => togglePermission(permission.name)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                            checked={selectedPermissions.includes(
                              permission.name
                            )}
                            onChange={() => togglePermission(permission.name)}
                          />
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm">
                              {permission.description}
                            </h4>
                            {/* <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {permission.description || "No description"}
                            </p> */}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            permission.name.includes(":create")
                              ? "bg-green-50 text-green-700"
                              : permission.name.includes(":update")
                                ? "bg-blue-50 text-blue-700"
                                : permission.name.includes(":delete")
                                  ? "bg-red-50 text-red-700"
                                  : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {permission.name.split(":")[1]?.toUpperCase() ||
                            "READ"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Summary by Module:
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(permissionsByModule).map(
                          ([module, modulePerms]) => {
                            const selectedCount = modulePerms.filter((p) =>
                              selectedPermissions.includes(p.name)
                            ).length;
                            return (
                              <div key={module} className="text-xs">
                                <span className="font-medium">{module}:</span>
                                <span
                                  className={`ml-1 px-2 py-0.5 rounded-full ${
                                    selectedCount === modulePerms.length
                                      ? "bg-green-100 text-green-800"
                                      : selectedCount > 0
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {selectedCount}/{modulePerms.length}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <p className="text-sm font-medium text-gray-700">
                        Total Selected:
                        <span className="ml-2 text-lg font-bold text-blue-600">
                          {selectedPermissions.length}/{permissions.length}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setOpenDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                {editingRole ? "Save Changes" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Snackbar / Toast */}
      {snackbar.open && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-bounce-in ${
            snackbar.severity === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {snackbar.severity === "success" ? <FiCheckCircle /> : <FiXCircle />}
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
