'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Employee {
  id: number;
  email: string;
  full_name: string;
  role: string;
  role_id: number | null;
  created_at: string;
}

interface Role {
  id: number;
  role_name: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      } else {
        toast.error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      } else {
        toast.error('Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Error fetching roles');
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeFormData.full_name.trim() || !employeeFormData.email.trim() || !employeeFormData.password.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...employeeFormData,
          role_id: selectedRole
        })
      });

      if (res.ok) {
        toast.success('Employee created successfully');
        setEmployeeFormData({ full_name: '', email: '', password: '' });
        setSelectedRole(null);
        setShowAddEmployee(false);
        fetchEmployees();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Error creating employee');
    }
  };

  const handleUpdateEmployeeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const res = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: selectedRole
        })
      });

      if (res.ok) {
        toast.success('Employee role updated successfully');
        setShowRoleModal(false);
        setSelectedEmployee(null);
        setSelectedRole(null);
        fetchEmployees();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error updating role');
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Error deleting employee');
    }
  };

  const openRoleModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedRole(employee.role_id);
    setShowRoleModal(true);
  };

  const getRoleName = (roleId: number | null) => {
    if (!roleId) return '-';
    const role = roles.find(r => r.id === roleId);
    return role?.role_name || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your team members and assign roles</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/roles"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Manage Roles
          </Link>
          <button
            onClick={() => setShowAddEmployee(!showAddEmployee)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {showAddEmployee ? 'Cancel' : '+ Add Employee'}
          </button>
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddEmployee && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Employee</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={employeeFormData.full_name}
                  onChange={(e) => setEmployeeFormData({
                    ...employeeFormData,
                    full_name: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={employeeFormData.email}
                  onChange={(e) => setEmployeeFormData({
                    ...employeeFormData,
                    email: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={employeeFormData.password}
                  onChange={(e) => setEmployeeFormData({
                    ...employeeFormData,
                    password: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Role (Optional)
                </label>
                <select
                  value={selectedRole || ''}
                  onChange={(e) => setSelectedRole(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">No Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Add Employee
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddEmployee(false);
                  setEmployeeFormData({ full_name: '', email: '', password: '' });
                  setSelectedRole(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Role to {selectedEmployee.full_name}
            </h2>

            <form onSubmit={handleUpdateEmployeeRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  value={selectedRole || ''}
                  onChange={(e) => setSelectedRole(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">No Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Update Role
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedEmployee(null);
                    setSelectedRole(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Team Members</h2>
        </div>
        {employees.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No employees found. Add your first employee to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{emp.full_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {getRoleName(emp.role_id) || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(emp.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openRoleModal(emp)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Assign Role
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
