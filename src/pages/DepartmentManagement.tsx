import React, { useState, useEffect, useCallback } from "react";
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiCheckCircle, 
  FiXCircle, 
  FiUsers, 
  FiX,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiUpload,
  FiUser,
  FiMail,
  FiHome
} from "react-icons/fi";
// import { useAuth } from "../context/AuthContext";
import PermissionGuard from "../components/permission/PermissionGuard";
import departmentApi from "../api/departmentApi";
import { userApi } from "../api/userApi";
import { Department } from "../api/departmentTypes";
import { User } from "../api/userApi";

const DepartmentManagement: React.FC = () => {
//   const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;
  
  // Modal state
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true,
    managerId: '',
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({
    code: '',
    name: '',
    managerId: '',
  });

  // Fetch data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        departmentApi.getAll({ 
          page: currentPage, 
          size: pageSize,
          search: searchTerm || undefined
        }),
        userApi.getAllUsers({ page: 0, size: 100 }) // Get users for manager selection
      ]);
      
      setDepartments(deptRes.content);
      setTotalPages(deptRes.totalPages);
      setTotalElements(deptRes.totalElements);
      
      // Filter only active employees for manager selection
      const activeEmployees = empRes.content.filter(emp => emp.status === "ACTIVE");
      setEmployees(activeEmployees);
    } catch (error) {
      console.error("Error loading data:", error);
      showSnackbar("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter departments by status
  const filteredDepartments = departments.filter(dept => {
    if (statusFilter === "all") return true;
    return statusFilter === "active" ? dept.isActive : !dept.isActive;
  });

  // Modal handlers
  const handleOpenCreate = () => {
    setFormData({ 
      code: '', 
      name: '', 
      description: '', 
      isActive: true, 
      managerId: '' 
    });
    setErrors({ code: '', name: '', managerId: '' });
    setEditingDepartment(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (department: Department) => {
    setFormData({
      code: department.code,
      name: department.name,
      description: department.description || '',
      isActive: department.isActive,
      managerId: department.manager?.id || '',
    });
    setErrors({ code: '', name: '', managerId: '' });
    setEditingDepartment(department);
    setOpenDialog(true);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = { code: '', name: '', managerId: '' };
    let isValid = true;

    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
      isValid = false;
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Code should be uppercase with underscores only';
      isValid = false;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      // Find manager name for display
    //   const selectedManager = employees.find(emp => emp.id === formData.managerId);
    //   const managerData = selectedManager ? {
    //     id: selectedManager.id,
    //     name: selectedManager.fullName,
    //     email: selectedManager.email
    //   } : undefined;

      if (editingDepartment) {
        await departmentApi.update(editingDepartment.id, formData);
        showSnackbar("Department updated successfully", "success");
      } else {
        await departmentApi.create(formData);
        showSnackbar("Department created successfully", "success");
      }
      
      setOpenDialog(false);
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to save department";
      showSnackbar(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async (departmentId: string, departmentCode: string) => {
    // Prevent deletion of essential departments
    const protectedDepartments = ["HR", "IT", "ADMIN", "FINANCE"];
    if (protectedDepartments.includes(departmentCode.toUpperCase())) {
      showSnackbar("Cannot delete protected departments", "error");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;
    
    try {
      await departmentApi.delete(departmentId);
      showSnackbar("Department deleted successfully", "success");
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to delete department";
      showSnackbar(errorMessage, "error");
    }
  };

  // Toggle status handler
  const handleToggleStatus = async (departmentId: string, currentStatus: boolean) => {
    try {
      await departmentApi.toggleStatus(departmentId, !currentStatus);
      showSnackbar(`Department ${!currentStatus ? 'activated' : 'deactivated'} successfully`, "success");
      loadData();
    } catch (error: any) {
      showSnackbar("Failed to update department status", "error");
    }
  };

  // Snackbar helper
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar(prev => ({ ...prev, open: false })), 4000);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  if (loading && currentPage === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Department Management</h1>
            <p className="text-gray-600 mt-2">Manage and organize company departments</p>
          </div>
          
          <PermissionGuard 
          requiredRoles={["ADMIN"]}
        //   requiredPermissions={["department:create:all"]}
          >
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition shadow-sm hover:shadow-md"
            >
              <FiPlus className="w-5 h-5" /> Create Department
            </button>
          </PermissionGuard>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search departments by name or code..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-3">
              <FiFilter className="text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Export/Import buttons */}
            <div className="flex gap-2">
              <PermissionGuard
               requiredRoles={["ADMIN"]}
            //   requiredPermissions={["department:export:all"]}
              >
                <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                  <FiDownload /> Export
                </button>
              </PermissionGuard>
              <PermissionGuard requiredPermissions={["department:import:all"]}>
                <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                  <FiUpload /> Import
                </button>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Departments</p>
              <p className="text-2xl font-bold text-gray-800">{totalElements}</p>
            </div>
            <FiHome className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <FiCheckCircle className="mr-1" /> Active
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Departments</p>
              <p className="text-2xl font-bold text-gray-800">
                {departments.filter(d => d.isActive).length}
              </p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-800">
                {departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0)}
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Employees/Dept</p>
              <p className="text-2xl font-bold text-gray-800">
                {departments.length > 0 
                  ? Math.round(departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0) / departments.length)
                  : 0}
              </p>
            </div>
            <FiUser className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FiHome className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No departments found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? `No results for "${searchTerm}"` : "Get started by creating your first department"}
          </p>
          <PermissionGuard requiredPermissions={["department:create:all"]}>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              <FiPlus /> Create Department
            </button>
          </PermissionGuard>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredDepartments.map((department) => (
              <div key={department.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {department.name}
                        </h3>
                        <button
                          onClick={() => handleToggleStatus(department.id, department.isActive)}
                          className={`p-1 rounded-full ${department.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                          title={department.isActive ? "Deactivate" : "Activate"}
                        >
                          {department.isActive ? <FiCheckCircle /> : <FiXCircle />}
                        </button>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                        {department.code}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-1">
                      <PermissionGuard 
                      requiredPermissions={["department:update:all"]}>
                        <button 
                          onClick={() => handleOpenEdit(department)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard requiredPermissions={["department:delete:all"]}>
                        <button 
                          onClick={() => handleDelete(department.id, department.code)}
                          disabled={["HR", "IT", "ADMIN", "FINANCE"].includes(department.code.toUpperCase())}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[3rem]">
                    {department.description || "No description provided."}
                  </p>

                  {/* Manager Info */}
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-3 flex items-center gap-1">
                      <FiUser size={12} /> Department Manager
                    </p>
                    {department.manager ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {department.manager.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{department.manager.fullName}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FiMail size={10} /> {department.manager.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <p className="text-sm text-amber-700">No manager assigned</p>
                        <p className="text-xs text-amber-600 mt-1">Assign a manager to this department</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUsers className="w-4 h-4" />
                      <span className="text-sm">
                        <span className="font-semibold">{department.employeeCount || 0}</span> employees
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        department.isActive 
                          ? "bg-green-50 text-green-700 border border-green-100" 
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {department.isActive ? "Active" : "Inactive"}
                      </div>
                      {department.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(department.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{(currentPage * pageSize) + 1}</span> to{" "}
              <span className="font-semibold">
                {Math.min((currentPage + 1) * pageSize, totalElements)}
              </span> of{" "}
              <span className="font-semibold">{totalElements}</span> departments
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FiChevronLeft /> Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage <= 2) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => !isSubmitting && setOpenDialog(false)}
          ></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingDepartment ? "Edit Department" : "Create New Department"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingDepartment ? "Update department information" : "Add a new department to the organization"}
                </p>
              </div>
              <button 
                onClick={() => !isSubmitting && setOpenDialog(false)}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Department Code and Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Code *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.code ? 'border-red-300' : 'border-gray-300'
                      } ${editingDepartment ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., HR, IT, SALES"
                      disabled={!!editingDepartment || isSubmitting}
                      required
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Unique identifier for the department (uppercase letters and underscores only)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Human Resources"
                      disabled={isSubmitting}
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the department's purpose and responsibilities..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Manager Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Manager
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    disabled={isSubmitting}
                  >
                    <option value="">Select a manager (optional)</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} - {employee.status || employee.email}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Assign a manager to oversee this department's operations
                  </p>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Department Status</p>
                    <p className="text-sm text-gray-500">
                      {formData.isActive 
                        ? "Active departments are visible to all users" 
                        : "Inactive departments are hidden from most views"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    disabled={isSubmitting}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setOpenDialog(false)}
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editingDepartment ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingDepartment ? "Save Changes" : "Create Department"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      {snackbar.open && (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-bounce-in ${
          snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {snackbar.severity === 'success' ? 
            <FiCheckCircle className="w-5 h-5" /> : 
            <FiXCircle className="w-5 h-5" />
          }
          {snackbar.message}
          <button 
            onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
            className="ml-4 text-white/80 hover:text-white"
          >
            <FiX size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;