'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Role } from '@/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, rolesRes] = await Promise.all([
        fetch('/api/employees', { credentials: 'include' }),
        fetch('/api/roles', { credentials: 'include' })
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    if (!editingEmployee && !formData.password) {
      toast.error('Password is required for new employees');
      return;
    }

    try {
      const url = editingEmployee 
        ? `/api/employees/${editingEmployee.id}` 
        : '/api/employees/create';
      const method = editingEmployee ? 'PUT' : 'POST';

      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        role_id: formData.role_id ? parseInt(formData.role_id) : null,
        ...(formData.password && { password: formData.password })
      };

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save employee');

      toast.success(editingEmployee ? 'Employee updated' : 'Employee created');
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee');
    }
  };

  const handleDelete = async (empId: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

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

  const handleEdit = (employee: User) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      email: employee.email,
      password: '',
      role_id: employee.role_id?.toString() || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role_id: ''
    });
    setEditingEmployee(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">👨‍💼 Employee Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            + Add Employee
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="input-field"
                placeholder="Employee name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="employee@example.com"
                required
              />
            </div>

            {!editingEmployee && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="Set password"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Role
              </label>
              <select
                value={formData.role_id}
                onChange={e => setFormData({ ...formData, role_id: e.target.value })}
                className="input-field"
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      ) : (
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
                    No employees yet. Add one to get started!
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-gray-900">{emp.full_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {emp.role_id 
                          ? roles.find(r => r.id === emp.role_id)?.role_name 
                          : emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="text-primary-600 hover:text-primary-700 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id!)}
                        className="text-red-600 hover:text-red-700"
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
