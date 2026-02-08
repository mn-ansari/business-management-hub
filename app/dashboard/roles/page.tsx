'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Role {
  id: number;
  role_name: string;
  description: string;
  permission_count: number;
  permissions?: any[];
}

interface Permission {
  id: number;
  permission_key: string;
  permission_name: string;
  category: string;
  description?: string;
}

interface TabPermission {
  value: string;
  label: string;
  icon: string;
  href: string;
  adminOnly: boolean;
  description: string;
  features?: Array<{
    key: string;
    name: string;
    icon: string;
  }>;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [tabPermissions, setTabPermissions] = useState<TabPermission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<{[key: string]: Permission[]}>({});
  const [loading, setLoading] = useState(true);
  const [showAddRole, setShowAddRole] = useState(false);
  const [showAssignPermissions, setShowAssignPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedTabs, setExpandedTabs] = useState<string[]>([]);
  const [roleFormData, setRoleFormData] = useState({
    role_name: '',
    description: '',
  });

  // Fetch roles and permissions
  useEffect(() => {
    console.log('🔵 Roles page mounted - fetching data...');
    fetchRoles();
    fetchPermissions();
    fetchTabPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      console.log('📡 Fetching roles from /api/roles...');
      const res = await fetch('/api/roles', {
        credentials: 'include'
      });
      console.log('✅ Roles response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Roles fetched:', data);
        setRoles(data);
      } else {
        const error = await res.text();
        console.error('❌ Roles fetch error:', res.status, error);
        toast.error('Failed to fetch roles');
      }
    } catch (error) {
      console.error('❌ Error fetching roles:', error);
      toast.error('Error fetching roles');
    }
  };

  const fetchPermissions = async () => {
    try {
      console.log('📡 Fetching permissions from /api/permissions...');
      const res = await fetch('/api/permissions', {
        credentials: 'include'
      });
      console.log('✅ Permissions response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Permissions fetched - Total:', data.permissions?.length || 0);
        console.log('📦 Grouped categories:', Object.keys(data.grouped || {}));
        console.log('📋 Full permissions data:', data);
        setPermissions(data.permissions || []);
        setGroupedPermissions(data.grouped || {});
      } else {
        const error = await res.text();
        console.error('❌ Permissions fetch error:', res.status, error);
        toast.error('Failed to fetch permissions');
      }
    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
      toast.error('Error fetching permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabPermissions = async () => {
    try {
      console.log('📡 Fetching tab permissions from /api/permissions/by-tabs...');
      const res = await fetch('/api/permissions/by-tabs', {
        credentials: 'include'
      });
      console.log('✅ Tab permissions response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Tab permissions fetched:', data.tab_permissions);
        setTabPermissions(data.tab_permissions || []);
      } else {
        const error = await res.text();
        console.error('❌ Tab permissions fetch error:', res.status, error);
      }
    } catch (error) {
      console.error('❌ Error fetching tab permissions:', error);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.role_name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      console.log('🔵 Creating role with permissions:', selectedPermissions);
      
      // Convert permission keys to IDs
      const permissionIds = permissions
        .filter(p => selectedPermissions.includes(p.permission_key))
        .map(p => p.id);
      
      console.log('📝 Permission IDs to add:', permissionIds);

      const res = await fetch('/api/roles', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...roleFormData,
          permissions: permissionIds
        })
      });

      if (res.ok) {
        toast.success('Role created successfully');
        setRoleFormData({ role_name: '', description: '' });
        setSelectedPermissions([]);
        setShowAddRole(false);
        fetchRoles();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Error creating role');
    }
  };

  const handleAssignPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    console.log('🔵 Updating permissions for role:', selectedRole.id);
    console.log('📝 Selected permission keys:', selectedPermissions);

    try {
      // Convert permission keys to IDs
      const permissionIds = permissions
        .filter(p => selectedPermissions.includes(p.permission_key))
        .map(p => p.id);
      
      console.log('📝 Permission IDs to update:', permissionIds);

      const res = await fetch(`/api/roles/${selectedRole.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: permissionIds
        })
      });

      console.log('✅ Update response status:', res.status);

      if (res.ok) {
        toast.success('Permissions updated successfully');
        setShowAssignPermissions(false);
        setSelectedRole(null);
        setSelectedPermissions([]);
        fetchRoles();
      } else {
        const error = await res.json();
        console.error('❌ Update error:', error);
        toast.error(error.error || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('❌ Error updating permissions:', error);
      toast.error('Error updating permissions: ' + (error as Error).message);
    }
  };

  const openAssignPermissions = async (role: Role) => {
    console.log('🔵 Opening assign permissions for role:', role);
    setSelectedRole(role);
    try {
      console.log('📡 Fetching role details from /api/roles/' + role.id);
      const res = await fetch(`/api/roles/${role.id}`, {
        credentials: 'include'
      });
      console.log('✅ Role fetch response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Role fetch error - Status:', res.status, 'Response:', errorText);
        toast.error(`Failed to fetch role: ${res.status}`);
        setShowAssignPermissions(false);
        setSelectedRole(null);
        return;
      }

      const roleData = await res.json();
      console.log('✅ Role data fetched:', roleData);
      
      if (roleData.permissions && Array.isArray(roleData.permissions)) {
        // Extract permission keys from the fetched permissions
        const permKeys = roleData.permissions
          .filter((p: any) => p && p.permission_key)
          .map((p: any) => p.permission_key);
        console.log('✅ Permission keys extracted:', permKeys, 'Total:', permKeys.length);
        setSelectedPermissions(permKeys);
      } else {
        console.log('ℹ️ No permissions array in response, setting empty');
        setSelectedPermissions([]);
      }
      setShowAssignPermissions(true);
      console.log('✅ Modal opened successfully');
    } catch (error) {
      console.error('❌ Error fetching role details:', error);
      toast.error('Error fetching role details: ' + (error as Error).message);
      setShowAssignPermissions(false);
      setSelectedRole(null);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    const confirmDelete = confirm(`Are you sure you want to delete the role "${role.role_name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    console.log('🗑️ Deleting role:', role.id);
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      console.log('✅ Delete response status:', res.status);

      if (res.ok) {
        toast.success('Role deleted successfully');
        fetchRoles();
      } else {
        const error = await res.json();
        console.error('❌ Delete error:', error);
        toast.error(error.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('❌ Error deleting role:', error);
      toast.error('Error deleting role: ' + (error as Error).message);
    }
  };

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionKey)
        ? prev.filter(p => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const toggleExpandTab = (tabValue: string) => {
    setExpandedTabs(prev =>
      prev.includes(tabValue)
        ? prev.filter(t => t !== tabValue)
        : [...prev, tabValue]
    );
  };

  const toggleTabWithFeatures = (tabValue: string, features?: Array<{key: string; name: string; icon: string}>) => {
    const isExpanded = expandedTabs.includes(tabValue);
    const isSelected = selectedPermissions.includes(tabValue);
    
    if (!isExpanded && features && features.length > 0) {
      // Expand the tab to show features
      toggleExpandTab(tabValue);
    } else if (isExpanded) {
      // If already expanded, just close it
      toggleExpandTab(tabValue);
    } else {
      // If no features, just toggle the permission
      togglePermission(tabValue);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-gray-600">Loading roles and permissions...</p>
        <p className="text-xs text-gray-400">Check browser console for details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Role Management</h1>
          <p className="text-gray-600 mt-1">Create and manage user roles with permissions</p>
        </div>
        <button
          onClick={() => setShowAddRole(!showAddRole)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {showAddRole ? 'Cancel' : '+ New Role'}
        </button>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
        <p>💡 Open browser console (F12) to see detailed debug logs</p>
        <p>📊 Loaded: {roles.length} roles, {permissions.length} permissions</p>
      </div>

      {/* Add Role Form */}
      {showAddRole && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Role</h2>
          <form onSubmit={handleAddRole} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Sales Manager"
                value={roleFormData.role_name}
                onChange={(e) => setRoleFormData({
                  ...roleFormData,
                  role_name: e.target.value
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Role description..."
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({
                  ...roleFormData,
                  description: e.target.value
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">🔐 Select Tab Access for This Role</h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                {tabPermissions.length === 0 ? (
                  <p className="text-gray-500 text-sm">Loading tabs...</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {tabPermissions.map(tab => (
                      <div key={tab.value}>
                        {/* Main Tab Checkbox */}
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(tab.value)}
                            onChange={() => {
                              togglePermission(tab.value);
                              if (!expandedTabs.includes(tab.value) && tab.features && tab.features.length > 0) {
                                toggleExpandTab(tab.value);
                              }
                            }}
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{tab.icon}</span>
                              <div className="font-medium text-gray-900">{tab.label}</div>
                              {tab.adminOnly && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Admin</span>
                              )}
                              {tab.features && tab.features.length > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleExpandTab(tab.value);
                                  }}
                                  className="ml-auto text-xs text-gray-600 hover:text-gray-900"
                                >
                                  {expandedTabs.includes(tab.value) ? '▼' : '▶'}
                                </button>
                              )}
                            </div>
                            {tab.description && (
                              <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                            )}
                          </div>
                        </label>
                        
                        {/* Feature Sub-Permissions */}
                        {expandedTabs.includes(tab.value) && tab.features && tab.features.length > 0 && (
                          <div className="ml-2 mt-2 space-y-2 pl-3 border-l-2 border-primary-200">
                            {tab.features.map(feature => (
                              <label key={feature.key} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100 hover:border-primary-200 cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(feature.key)}
                                  onChange={() => togglePermission(feature.key)}
                                  className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <div className="flex-1 text-sm">
                                  <div className="flex items-center gap-1">
                                    <span>{feature.icon}</span>
                                    <span className="text-gray-700">{feature.name}</span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Create Role
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddRole(false);
                  setRoleFormData({ role_name: '', description: '' });
                  setSelectedPermissions([]);
                  setExpandedTabs([]);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Permissions Modal */}
      {showAssignPermissions && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Permissions to {selectedRole.role_name}
            </h2>

            <form onSubmit={handleAssignPermissions} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">🔐 Select Tab Access</h4>
                {tabPermissions.length === 0 ? (
                  <p className="text-gray-500">Loading tabs...</p>
                ) : (
                  <div className="space-y-3">
                    {tabPermissions.map(tab => (
                      <div key={tab.value}>
                        {/* Main Tab Checkbox */}
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(tab.value)}
                            onChange={() => {
                              togglePermission(tab.value);
                              if (!expandedTabs.includes(tab.value) && tab.features && tab.features.length > 0) {
                                toggleExpandTab(tab.value);
                              }
                            }}
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{tab.icon}</span>
                              <div className="font-medium text-gray-900">{tab.label}</div>
                              {tab.adminOnly && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Admin</span>
                              )}
                              {tab.features && tab.features.length > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleExpandTab(tab.value);
                                  }}
                                  className="ml-auto text-xs text-gray-600 hover:text-gray-900"
                                >
                                  {expandedTabs.includes(tab.value) ? '▼' : '▶'}
                                </button>
                              )}
                            </div>
                            {tab.description && (
                              <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                            )}
                          </div>
                        </label>
                        
                        {/* Feature Sub-Permissions */}
                        {expandedTabs.includes(tab.value) && tab.features && tab.features.length > 0 && (
                          <div className="ml-2 mt-2 space-y-2 pl-3 border-l-2 border-primary-200">
                            {tab.features.map(feature => (
                              <label key={feature.key} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100 hover:border-primary-200 cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(feature.key)}
                                  onChange={() => togglePermission(feature.key)}
                                  className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <div className="flex-1 text-sm">
                                  <div className="flex items-center gap-1">
                                    <span>{feature.icon}</span>
                                    <span className="text-gray-700">{feature.name}</span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Update Permissions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignPermissions(false);
                    setSelectedRole(null);
                    setSelectedPermissions([]);
                    setExpandedTabs([]);
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

      {/* Roles List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Existing Roles</h2>
        </div>
        {roles.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No roles found. Create your first role to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Permissions</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{role.role_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{role.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {role.permission_count} permissions
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openAssignPermissions(role)}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          Edit Permissions
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
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
