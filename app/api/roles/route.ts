import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Roles API - GET request received');
    const user = getUserFromRequest(request);
    console.log('🔍 Roles API - User from request:', user);
    
    if (!user) {
      console.log('❌ Roles API - No user found (Unauthorized)');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Roles API - User authenticated, shopId:', user.shopId);

    let query: string;
    let params: any[];

    if (user.shopId && user.shopId !== 0) {
      console.log('ℹ️ Roles API - Post-onboarding scenario: fetching roles for shop_id =', user.shopId);
      query = `SELECT r.*, COUNT(rp.id) as permission_count 
               FROM roles r 
               LEFT JOIN role_permissions rp ON r.id = rp.role_id 
               WHERE r.shop_id = ? 
               GROUP BY r.id 
               ORDER BY r.created_at DESC`;
      params = [user.shopId];
    } else {
      console.log('ℹ️ Roles API - Onboarding scenario: fetching global roles (shop_id IS NULL)');
      query = `SELECT r.*, COUNT(rp.id) as permission_count 
               FROM roles r 
               LEFT JOIN role_permissions rp ON r.id = rp.role_id 
               WHERE r.shop_id IS NULL 
               GROUP BY r.id 
               ORDER BY r.created_at DESC`;
      params = [];
    }

    const [roles]: any = await pool.query(query, params);

    console.log('✅ Roles API - Found', roles.length, 'roles');
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Roles POST - Creating new role');
    
    const user = getUserFromRequest(request);
    console.log('👤 User:', user);
    
    if (!user) {
      console.log('❌ No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: During onboarding, shopId will be 0, so we need to handle that
    if (!user.shopId || user.shopId === 0) {
      console.log('⚠️ No shop assigned yet (onboarding), allowing role creation with shopId = null');
    }

    const body = await request.json();
    const { role_name, description, permissions = [] } = body;

    console.log('📝 Role data:', { role_name, description, permissions: permissions.length });

    if (!role_name) {
      console.log('❌ Role name missing');
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check if role already exists - handle both onboarding (shopId 0) and post-onboarding
    let existingQuery: string;
    let existingParams: any[];
    
    if (user.shopId && user.shopId !== 0) {
      existingQuery = 'SELECT id FROM roles WHERE shop_id = ? AND role_name = ?';
      existingParams = [user.shopId, role_name];
    } else {
      // During onboarding, just check for this role by name only
      existingQuery = 'SELECT id FROM roles WHERE role_name = ? AND shop_id IS NULL';
      existingParams = [role_name];
    }

    const [existing]: any = await pool.query(existingQuery, existingParams);
    
    if (existing.length > 0) {
      console.log('⚠️ Role already exists');
      return NextResponse.json(
        { error: 'Role already exists' },
        { status: 409 }
      );
    }

    // Create role - use shopId if available, otherwise NULL for onboarding
    const shopIdForInsert = (user.shopId && user.shopId !== 0) ? user.shopId : null;
    console.log('📝 Inserting role with shopId:', shopIdForInsert);

    const [result]: any = await pool.query(
      'INSERT INTO roles (shop_id, role_name, description) VALUES (?, ?, ?)',
      [shopIdForInsert, role_name, description || null]
    );

    const roleId = result.insertId;
    console.log('✅ Role created with ID:', roleId);

    // Assign permissions if provided
    if (permissions.length > 0) {
      console.log('🔐 Assigning', permissions.length, 'permissions to role');
      for (const permissionId of permissions) {
        await pool.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [roleId, permissionId]
        );
      }
      console.log('✅ Permissions assigned');
    }

    // Fetch the created role with permissions
    const [createdRole]: any = await pool.query(
      `SELECT r.*, 
              GROUP_CONCAT(rp.permission_id) as permission_ids
       FROM roles r 
       LEFT JOIN role_permissions rp ON r.id = rp.role_id 
       WHERE r.id = ? 
       GROUP BY r.id`,
      [roleId]
    );

    console.log('✅ Role created successfully:', createdRole[0]?.role_name);

    return NextResponse.json(
      {
        message: 'Role created successfully',
        role: createdRole[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating role:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
