'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Permission } from '@/types';

export default function MyPrivilegesPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get user info with permissions
      const userRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserInfo(userData);
        setUserPermissions(userData.permissions || []);
      }

      // Get all permissions
      const permsRes = await fetch('/api/permissions', { credentials: 'include' });
      if (permsRes.ok) {
        const permsData = await permsRes.json();
        setPermissions(permsData.permissions || []);
        setPermissionGroups(permsData.grouped || {});
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load privileges');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading your privileges...</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Unable to load user information</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">👤 My Privileges</h1>
        <p className="text-gray-600 mt-2">View your assigned permissions and access level</p>
      </div>

      {/* User Info Card */}
      <div className="card space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 font-medium">Name</p>
            <p className="text-lg font-semibold text-gray-900">{userInfo.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Email</p>
            <p className="text-lg font-semibold text-gray-900">{userInfo.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Role</p>
            <p className="text-lg font-semibold">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                {userInfo.role_name || userInfo.role}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Permissions</p>
            <p className="text-lg font-semibold text-gray-900">{userPermissions.length}</p>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Assigned Permissions</h2>
        
        {Object.entries(permissionGroups).map(([category, perms]: [string, any]) => {
          const categoryPermissions = perms.filter((p: any) => userPermissions.includes(p.id));
          
          return (
            <div key={category} className="card">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                <p className="text-sm text-gray-600">
                  {categoryPermissions.length} of {perms.length} permissions
                </p>
              </div>

              <div className="space-y-3">
                {categoryPermissions.length > 0 ? (
                  categoryPermissions.map((perm: Permission) => (
                    <div 
                      key={perm.id} 
                      className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="text-green-600 text-xl mt-1">✓</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{perm.permission_name}</p>
                        <p className="text-sm text-gray-600">{perm.description || perm.permission_key}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No permissions in this category</p>
                )}
              </div>

              {/* Denied Permissions */}
              {perms.filter((p: any) => !userPermissions.includes(p.id)).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-600 font-medium mb-2">Permissions you don't have:</p>
                  <div className="space-y-2">
                    {perms
                      .filter((p: any) => !userPermissions.includes(p.id))
                      .map((perm: Permission) => (
                        <div 
                          key={perm.id} 
                          className="text-sm text-gray-500 line-through"
                        >
                          {perm.permission_name}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Access Summary */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">📋 Access Summary</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• You have access to <strong>{userPermissions.length}</strong> features</p>
          <p>• Your role is <strong>{userInfo.role_name || userInfo.role}</strong></p>
          <p>• Contact your administrator to request additional permissions</p>
          <p>• Your role permissions may be updated by your administrator at any time</p>
        </div>
      </div>
    </div>
  );
}
