import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auth ME - User auth check');
    const user = getUserFromRequest(request);

    if (!user) {
      console.log('❌ Auth ME - No user found in token');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('✅ Auth ME - User found, userId:', user.userId);

    // First, fetch basic user details
    const [users]: any = await pool.query(
      `SELECT id, email, full_name, role, shop_id
       FROM users 
       WHERE id = ?`,
      [user.userId]
    );

    if (users.length === 0) {
      console.log('❌ Auth ME - User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = users[0];
    console.log('📝 Auth ME - User shop_id:', userData.shop_id);

    // Fetch role details and permissions
    let roleDetails = { role_name: null, role_id: null, permissions: [], permissionKeys: [] };
    
    // If user is admin, they get all permissions
    if (userData.role === 'admin') {
      console.log('✅ Auth ME - User is admin, granting all permissions');
      const [allPerms]: any = await pool.query(
        `SELECT id, permission_key FROM permissions`
      );
      roleDetails.permissions = allPerms.map((p: any) => p.id);
      roleDetails.permissionKeys = allPerms.map((p: any) => p.permission_key);
    } else {
      // For non-admin users, fetch permissions from their assigned role
      const [userWithRole]: any = await pool.query(
        `SELECT role_id FROM users WHERE id = ?`,
        [user.userId]
      );

      if (userWithRole.length > 0 && userWithRole[0].role_id) {
        const roleId = userWithRole[0].role_id;
        
        // Fetch role details
        const [roles]: any = await pool.query(
          `SELECT id, role_name FROM roles WHERE id = ?`,
          [roleId]
        );

        if (roles.length > 0) {
          roleDetails.role_id = roles[0].id;
          roleDetails.role_name = roles[0].role_name;

          // Fetch permissions for this role
          const [permissions]: any = await pool.query(
            `SELECT p.id, p.permission_key 
             FROM permissions p
             INNER JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = ?`,
            [roleId]
          );

          roleDetails.permissions = permissions.map((p: any) => p.id);
          roleDetails.permissionKeys = permissions.map((p: any) => p.permission_key);
          console.log('✅ Auth ME - Permissions fetched for role:', roleDetails.role_name, 'Permissions:', roleDetails.permissionKeys.length);
        }
      }
    }

    const permissions = roleDetails.permissions;
    const permissionKeys = roleDetails.permissionKeys;

    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      role_id: roleDetails.role_id,
      role_name: roleDetails.role_name,
      shop_id: userData.shop_id,
      permissions,
      permissionKeys,
      authenticated: true
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
