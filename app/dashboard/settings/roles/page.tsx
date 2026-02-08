'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Role, Permission } from '@/types';

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    permissions: [] as number[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/roles', { credentials: 'include' }),
        fetch('/api/permissions', { credentials: 'include' })
      ]);

      if (!rolesRes.ok || !permsRes.ok) throw new Error('Failed to fetch data');

      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();

      setRoles(rolesData);
      setPermissions(permsData.permissions || []);
      setPermissionGroups(permsData.grouped || {});
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      role_name: role.role_name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role_name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save role');

      toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save role');
    }
  };

  const handleDelete = async (roleId: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete role');

      toast.success('Role deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  const resetForm = () => {
    setFormData({
      role_name: '',
      description: '',
      permissions: []
    });
    setEditingRole(null);
    setShowForm(false);
  };

  const togglePermission = (permId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading roles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">👥 User Roles Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            + Create New Role
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                value={formData.role_name}
                onChange={e => setFormData({ ...formData, role_name: e.target.value })}
                className="input-field"
                placeholder="e.g., Quality Inspector"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="Enter role description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assign Permissions
              </label>
              <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                {Object.entries(permissionGroups).map(([category, perms]: [string, any]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-gray-800 mb-2">{category}</h4>
                    <div className="space-y-2 ml-4">
                      {perms.map((perm: Permission) => (
                        <label key={perm.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id!)}
                            onChange={() => togglePermission(perm.id!)}
                            className="w-4 h-4 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium">{perm.permission_name}</p>
                            <p className="text-xs text-gray-500">{perm.permission_key}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {roles.map(role => (
            <div key={role.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{role.role_name}</h3>
                  {role.description && (
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  )}
                </div>
                {!role.is_system && (
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    ✎ Edit
                  </button>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Permissions:</strong> {role.permissions?.length || 0}
                </p>
                {role.is_system && (
                  <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
                    System Role
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() => handleEdit(role)}
                  className="flex-1 text-primary-600 hover:bg-primary-50 py-2 rounded"
                >
                  View Details
                </button>
                {!role.is_system && (
                  <button
                    onClick={() => handleDelete(role.id!)}
                    className="flex-1 text-red-600 hover:bg-red-50 py-2 rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
