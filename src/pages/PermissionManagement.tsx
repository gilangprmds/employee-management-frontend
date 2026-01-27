import React, { useState, useEffect } from "react";
// Menggunakan React Icons (Feather Icons)
import { 
  FiEdit2, 
  FiPlus, 
  FiCheckCircle, 
  FiXCircle, 
  FiEye, 
  FiEyeOff, 
  FiShield,
  FiFilter,
  FiX
} from "react-icons/fi";
// import { useAuth } from "../context/AuthContext";
import PermissionGuard from "../components/permission/PermissionGuard";
import permissionApi from "../api/permissionApi";
import { Permission } from "../api/roleTypes";

// Constants
const RESOURCES = [
  "USER", "EMPLOYEE", "ROLE", "PERMISSION", "DEPARTMENT",
  "SALARY", "LEAVE_REQUEST", "ATTENDANCE", "PAYROLL",
  "DOCUMENT", "SYSTEM_CONFIG", "AUDIT_LOG"
];

const ACTIONS = [
  "CREATE", "READ", "UPDATE", "DELETE",
  "APPROVE", "REJECT", "EXPORT", "IMPORT",
  "DOWNLOAD", "UPLOAD", "ASSIGN", "REVOKE"
];

const SCOPES = ["ALL", "SELF", "TEAM", "DEPARTMENT", "COMPANY"];
const CATEGORIES = ["HR", "PAYROLL", "ATTENDANCE", "RECRUITMENT", "TRAINING", "SYSTEM"];

const PermissionManagement: React.FC = () => {
  // const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  // UI States
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  
  // Logic States
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [filter, setFilter] = useState({
    resource: "",
    category: "",
    active: "all",
  });

  const [formData, setFormData] = useState({
    resource: "",
    action: "",
    scope: "ALL",
    description: "",
    isSensitive: false,
    isActive: true,
    category: "",
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const res = await permissionApi.getAll();
      setPermissions(res.data.content);
    } catch (error) {
      showSnackbar("Failed to load permissions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      resource: RESOURCES[0], // Default value
      action: ACTIONS[0],   // Default value
      scope: "ALL",
      description: "",
      isSensitive: false,
      isActive: true,
      category: "",
    });
    setEditingPermission(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (permission: Permission) => {
    setFormData({
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope || "ALL",
      description: permission.description || "",
      isSensitive: permission.isSensitive || false,
      isActive: permission.active !== false,
      category: permission.category || "",
    });
    setEditingPermission(permission);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingPermission) {
        await permissionApi.update(
          editingPermission.id,
          formData.description,
          formData.isActive,
          formData.isSensitive
        );
        showSnackbar("Permission updated successfully", "success");
      } else {
        await permissionApi.create(
          formData.resource,
          formData.action,
          formData.scope
        );
        showSnackbar("Permission created successfully", "success");
      }
      setOpenDialog(false);
      loadPermissions();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || "Failed to save permission", "error");
    }
  };

  const handleToggleActive = async (permissionId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await permissionApi.deactivate(permissionId);
        showSnackbar("Permission deactivated", "success");
      } else {
        await permissionApi.activate(permissionId);
        showSnackbar("Permission activated", "success");
      }
      loadPermissions();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || "Failed to update permission", "error");
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar(prev => ({ ...prev, open: false })), 4000);
  };

  // Filter Logic
  const filteredPermissions = permissions.filter(permission => {
    if (filter.resource && permission.resource !== filter.resource) return false;
    if (filter.category && permission.category !== filter.category) return false;
    if (filter.active === "active" && !permission.active) return false;
    if (filter.active === "inactive" && permission.active) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading permissions...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiShield className="text-blue-600" /> Permission Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure granular access controls for resources</p>
        </div>
        <PermissionGuard requiredPermissions={["permission:read:all"]}>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
          >
            <FiPlus /> Create Permission
          </button>
        </PermissionGuard>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold text-sm">
          <FiFilter /> Filter List
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Resource</label>
            <select
              value={filter.resource}
              onChange={(e) => setFilter({ ...filter, resource: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">All Resources</option>
              {RESOURCES.map((res) => <option key={res} value={res}>{res}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={filter.active}
              onChange={(e) => setFilter({ ...filter, active: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wide">
                <th className="px-6 py-4">Permission Name</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Sensitive</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 italic">
                    No permissions found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{permission.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{permission.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        {permission.resource}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 rounded">
                        {permission.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {permission.scope && permission.scope !== "ALL" ? (
                         <span className="inline-block px-2 py-1 text-xs font-medium border border-gray-300 text-gray-600 rounded">
                           {permission.scope}
                         </span>
                      ) : (
                        <span className="text-xs text-gray-400">All</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {permission.category && (
                         <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-50 text-purple-600 rounded">
                           {permission.category}
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {permission.isSensitive ? (
                        <FiEyeOff className="mx-auto text-amber-500 w-4 h-4" title="Sensitive" />
                      ) : (
                        <FiEye className="mx-auto text-gray-300 w-4 h-4" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {permission.active ? (
                          <>
                            <FiCheckCircle className="text-green-500 w-4 h-4" />
                            <span className="text-xs font-medium text-green-700">Active</span>
                          </>
                        ) : (
                          <>
                            <FiXCircle className="text-red-500 w-4 h-4" />
                            <span className="text-xs font-medium text-red-700">Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PermissionGuard requiredPermissions={["permission:read:all"]}>
                          <button
                            onClick={() => handleToggleActive(permission.id, permission.active !== false)}
                            className={`p-1.5 rounded-full transition ${permission.active ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                            title={permission.active ? "Deactivate" : "Activate"}
                          >
                            {permission.active ? <FiXCircle size={16} /> : <FiCheckCircle size={16} />}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(permission)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenDialog(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPermission ? "Edit Permission" : "Create Permission"}
              </h2>
              <button onClick={() => setOpenDialog(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource <span className="text-red-500">*</span></label>
                <select
                  value={formData.resource}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                  disabled={!!editingPermission}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="" disabled>Select Resource</option>
                  {RESOURCES.map((res) => <option key={res} value={res}>{res}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action <span className="text-red-500">*</span></label>
                <select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  disabled={!!editingPermission}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="" disabled>Select Action</option>
                  {ACTIONS.map((act) => <option key={act} value={act}>{act}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    disabled={!!editingPermission}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                  >
                    {SCOPES.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">No Category</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <div className="flex items-center gap-2">
                     <FiEyeOff className="text-gray-500" />
                     <span className="text-sm font-medium text-gray-700">Sensitive Permission</span>
                   </div>
                   <button 
                    onClick={() => setFormData({ ...formData, isSensitive: !formData.isSensitive })}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${formData.isSensitive ? 'bg-amber-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.isSensitive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <div className="flex items-center gap-2">
                     <FiCheckCircle className="text-gray-500" />
                     <span className="text-sm font-medium text-gray-700">Status Active</span>
                   </div>
                   <button 
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => setOpenDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                {editingPermission ? "Update Permission" : "Create Permission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-bounce-in ${
          snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {snackbar.severity === 'success' ? <FiCheckCircle /> : <FiXCircle />}
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;