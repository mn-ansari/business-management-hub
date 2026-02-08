'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Permission {
  id: number;
  permission_key: string;
  permission_name: string;
  category: string;
}

interface PermissionGroup {
  [key: string]: Permission[];
}

export default function RoleSetupComponent({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'select' | 'manage'>('select');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup>({});
  const [predefinedRoles, setPredefinedRoles] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [customRoleName, setCustomRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const permResponse = await fetch('/api/permissions', { credentials: 'include' });
      if (!permResponse.ok) throw new Error('Failed to fetch permissions');
      
      const permData = await permResponse.json();
      setPermissions(permData.permissions || []);
      setPermissionGroups(permData.grouped || {});

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load permissions');
      setLoading(false);
    }
  };

  const defaultRoles = [
    {
      name: 'Manager',
      description: 'Full access except employee management',
      defaultPermissions: ['view_dashboard', 'view_stats', 'view_products', 'create_product', 'edit_product', 'view_sales', 'create_sale', 'view_customers', 'view_reports']
    },
    {
      name: 'Salesperson',
      description: 'Can create sales and view reports',
      defaultPermissions: ['view_dashboard', 'view_products', 'view_sales', 'create_sale', 'view_customers', 'create_customer', 'view_reports']
    },
    {
      name: 'Delivery Man',
      description: 'Limited access for deliveries',
      defaultPermissions: ['view_dashboard', 'view_sales', 'view_customers']
    },
    {
      name: 'Employee',
      description: 'Basic access to inventory',
      defaultPermissions: ['view_dashboard', 'view_products', 'view_customers']
    }
  ];

  const toggleRole = (roleName: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const createPredefinedRoles = async () => {
    setCreating(true);
    try {
      console.log('🚀 Creating predefined roles...');
      console.log('📋 Selected roles:', selectedRoles);
      console.log('🔐 Cookie:', document.cookie);
      
      for (const roleName of selectedRoles) {
        const roleConfig = defaultRoles.find(r => r.name === roleName);
        if (!roleConfig) continue;

        const permissionIds = permissions
          .filter(p => roleConfig.defaultPermissions.includes(p.permission_key))
          .map(p => p.id);

        console.log(`📝 Creating role: ${roleName}, Permissions: ${permissionIds.length}`);

        const response = await fetch('/api/roles', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role_name: roleConfig.name,
            description: roleConfig.description,
            permissions: permissionIds
          })
        });

        const data = await response.json();
        console.log(`Response status: ${response.status}`, data);

        if (!response.ok) {
          console.error(`❌ Failed to create ${roleName} role:`, data);
          throw new Error(`Failed to create ${roleName} role: ${data.error || 'Unknown error'}`);
        }
        
        console.log(`✅ ${roleName} role created`);
      }

      toast.success('Predefined roles created successfully!');
      onComplete();
    } catch (error) {
      console.error('❌ Error creating roles:', error);
      toast.error('Failed to create roles: ' + (error as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const createCustomRole = async () => {
    if (!customRoleName.trim()) {
      toast.error('Please enter a role name');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_name: customRoleName,
          description: `Custom role created during setup`,
          permissions: selectedPermissions
        })
      });

      if (!response.ok) throw new Error('Failed to create custom role');

      toast.success('Custom role created successfully!');
      setCustomRoleName('');
      setSelectedPermissions([]);
      setStep('select');
      onComplete();
    } catch (error) {
      console.error('Error creating custom role:', error);
      toast.error('Failed to create role');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Setting Up User Roles</h2>
        <p className="text-gray-600">Loading permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">👥 Set Up User Roles & Permissions</h2>
        <p className="text-gray-600">Create roles for your team members and assign permissions</p>
      </div>

      {step === 'select' ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Predefined Roles</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {defaultRoles.map(role => (
                <div
                  key={role.name}
                  onClick={() => toggleRole(role.name)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedRoles.includes(role.name)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.name)}
                      readOnly
                      className="mt-1"
                    />
                    <div>
                      <h4 className="font-semibold">{role.name}</h4>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep('manage')}
              className="btn-secondary flex-1"
            >
              Create Custom Role
            </button>
            <button
              onClick={createPredefinedRoles}
              disabled={selectedRoles.length === 0 || creating}
              className="btn-primary flex-1"
            >
              {creating ? 'Creating...' : `Create Selected (${selectedRoles.length})`}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name *
            </label>
            <input
              type="text"
              value={customRoleName}
              onChange={e => setCustomRoleName(e.target.value)}
              className="input-field"
              placeholder="e.g., Quality Inspector"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Assign Permissions
            </label>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(permissionGroups).map(([category, perms]: [string, any]) => (
                <div key={category} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-gray-800">{category}</h4>
                  <div className="space-y-2">
                    {perms.map((perm: Permission) => (
                      <label key={perm.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
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
              onClick={() => setStep('select')}
              className="btn-secondary flex-1"
            >
              ← Back
            </button>
            <button
              onClick={createCustomRole}
              disabled={!customRoleName.trim() || selectedPermissions.length === 0 || creating}
              className="btn-primary flex-1"
            >
              {creating ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
