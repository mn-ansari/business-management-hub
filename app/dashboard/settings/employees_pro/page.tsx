'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Role, Permission } from '@/types';

interface Employee extends User {
  role_name?: string;
}

export default function AdvancedEmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPrivilegeEditor, setShowPrivilegeEditor] = useState(false);
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: ''
  });

  const [editingPermissions, setEditingPermissions] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, rolesRes, permsRes] = await Promise.all([
        fetch('/api/employees', { credentials: 'include' }),
        fetch('/api/roles', { credentials: 'include' }),
        fetch('/api/permissions', { credentials: 'include' })
      ]);

      console.log('🔍 Employee Load - Roles API Status:', rolesRes.status);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        console.log('✅ Roles loaded:', rolesData.length || rolesData, 'roles');
        setRoles(rolesData);
      } else {
        console.log('❌ Roles API failed:', rolesRes.status);
        const errData = await rolesRes.json();
        console.log('Error:', errData);
      }

      if (permsRes.ok) {
        const permsData = await permsRes.json();
        setPermissions(permsData.permissions || []);
        setPermissionGroups(permsData.grouped || {});
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrivileges = async (employee: Employee) => {
    setSelectedEmployee(employee);
    
    if (employee.role_id) {
      try {
        const response = await fetch(`/api/roles/${employee.role_id}`, { credentials: 'include' });
        if (response.ok) {
          const roleData = await response.json();
          const permIds = roleData.permissions?.map((p: any) => p.id) || [];
          setEditingPermissions(permIds);
        }
      } catch (error) {
        console.error('Error fetching role permissions:', error);
      }
    }
    
    setShowPrivilegeEditor(true);
  };

  const togglePermission = (permId: number) => {
    setEditingPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const savePrivileges = async () => {
    if (!selectedEmployee?.role_id) {
      toast.error('Employee must have a role assigned');
      return;
    }

    try {
      const response = await fetch(`/api/roles/${selectedEmployee.role_id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_name: selectedEmployee.role_name,
          permissions: editingPermissions
        })
      });

      if (!response.ok) throw new Error('Failed to save permissions');

      toast.success('Privileges updated successfully!');
      setShowPrivilegeEditor(false);
      setSelectedEmployee(null);
      fetchData();
    } catch (error) {
      console.error('Error saving privileges:', error);
      toast.error('Failed to save privileges');
    }
  };

  const handleDelete = async (empId: number) => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/employees/${empId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete employee');

      toast.success('Employee deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">👥 Employee Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + Add Employee
        </button>
      </div>

      {/* Manual Add Employee Form */}
      {showForm && (
        <div className="card bg-white border-2 border-blue-300">
          <h2 className="text-xl font-semibold mb-4">➕ Add New Employee</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                placeholder="email@company.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                placeholder="Enter secure password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Role * ({roles.length} available)</label>
              {roles.length === 0 && (
                <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                  ⚠️ No roles found. Please create roles in <strong>Settings → User Roles</strong> first.
                </div>
              )}
              <select
                value={formData.role_id}
                onChange={e => setFormData({ ...formData, role_id: e.target.value })}
                className="input-field"
                required
                disabled={roles.length === 0}
              >
                <option value="">
                  {roles.length === 0 ? 'No roles available' : 'Select a role'}
                </option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!formData.full_name || !formData.email || !formData.password || !formData.role_id) {
                    toast.error('Please fill in all required fields');
                    return;
                  }

                  try {
                    const response = await fetch('/api/employees/create', {
                      method: 'POST',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        full_name: formData.full_name,
                        email: formData.email,
                        password: formData.password,
                        role_id: parseInt(formData.role_id)
                      })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      toast.error(data.error || 'Failed to create employee');
                      return;
                    }

                    toast.success('Employee created successfully!');
                    setShowForm(false);
                    setFormData({ full_name: '', email: '', password: '', role_id: '' });
                    fetchData();
                  } catch (error) {
                    console.error('Error creating employee:', error);
                    toast.error('Failed to create employee');
                  }
                }}
                className="btn-primary flex-1"
              >
                ✓ Create Employee
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ full_name: '', email: '', password: '', role_id: '' });
                }}
                className="btn-secondary flex-1"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privilege Editor Modal */}
      {showPrivilegeEditor && selectedEmployee && (
        <div className="card border-2 border-primary-300">
          <h2 className="text-xl font-semibold mb-4">
            ⚙️ Edit Privileges for {selectedEmployee.full_name}
          </h2>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Current Role: <strong>{selectedEmployee.role_name || selectedEmployee.role}</strong>
            </p>
            <p className="text-sm text-blue-800 mt-1">
              Editing permissions will affect this employee's access
            </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
            {Object.entries(permissionGroups).map(([category, perms]: [string, any]) => (
              <div key={category} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">{category}</h4>
                <div className="space-y-2">
                  {perms.map((perm: Permission) => (
                    <label key={perm.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPermissions.includes(perm.id!)}
                        onChange={() => togglePermission(perm.id!)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{perm.permission_name}</p>
                        <p className="text-xs text-gray-500">{perm.permission_key}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={savePrivileges}
              className="btn-primary flex-1"
            >
              💾 Save Changes
            </button>
            <button
              onClick={() => {
                setShowPrivilegeEditor(false);
                setSelectedEmployee(null);
                setEditingPermissions([]);
              }}
              className="btn-secondary flex-1"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Employees Table */}
      {!showForm && !showPrivilegeEditor && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                    No employees yet
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{emp.full_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {emp.role_name || emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm space-x-2">
                      <button
                        onClick={() => handleEditPrivileges(emp)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Edit Privileges
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id!)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
