import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔷 Role GET - Fetching role:', params.id);
    const user = getUserFromRequest(request);
    if (!user) {
      console.log('❌ Role GET - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleId = parseInt(params.id);
    console.log('👤 Role GET - User shopId:', user.shopId, 'RoleId:', roleId);

    // First get the role details
    const [roleData]: any = await pool.query(
      `SELECT * FROM roles 
       WHERE id = ? AND (shop_id IS NULL OR shop_id = ?)`,
      [roleId, user.shopId]
    );

    if (roleData.length === 0) {
      console.log('❌ Role GET - Role not found for roleId:', roleId, 'shopId:', user.shopId);
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const roleInfo = roleData[0];
    console.log('✅ Role GET - Role found:', roleInfo.role_name);

    // Get permissions assigned to this role
    const [permissions]: any = await pool.query(
      `SELECT p.id, p.permission_key, p.permission_name, p.category, p.description
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [roleId]
    );

    console.log('✅ Role GET - Found', permissions.length, 'permissions');

    const response = {
      ...roleInfo,
      permissions: permissions.map((p: any) => ({
        id: p.id,
        permission_key: p.permission_key,
        permission_name: p.permission_name,
        category: p.category,
        description: p.description
      }))
    };

    console.log('📤 Role GET - Sending response with', response.permissions.length, 'permissions');
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Role GET - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔵 Role PUT - Request received');
    const user = getUserFromRequest(request);
    if (!user) {
      console.log('❌ Role PUT - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleId = parseInt(params.id);
    const body = await request.json();
    const { role_name, description, permissions = [] } = body;

    console.log('🔵 Role PUT - Updating role:', roleId);

    // Verify role belongs to user's shop (or is an onboarding role with shop_id IS NULL)
    const [existingRole]: any = await pool.query(
      'SELECT id FROM roles WHERE id = ? AND (shop_id IS NULL OR shop_id = ?)',
      [roleId, user.shopId]
    );

    if (existingRole.length === 0) {
      console.log('❌ Role PUT - Role not found');
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update role
    if (role_name || description) {
      await pool.query(
        'UPDATE roles SET role_name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [role_name || existingRole[0].role_name, description || null, roleId]
      );
      console.log('✅ Role PUT - Role updated');
    }

    // Update permissions if provided
    if (permissions.length >= 0) {
      // Remove existing permissions
      await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
      console.log('✅ Role PUT - Old permissions deleted');

      // Add new permissions
      for (const permissionId of permissions) {
        await pool.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [roleId, permissionId]
        );
      }
      console.log('✅ Role PUT - New permissions added:', permissions.length);
    }

    return NextResponse.json({
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('❌ Role PUT - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔴 Role DELETE - Request received');
    const user = getUserFromRequest(request);
    if (!user) {
      console.log('❌ Role DELETE - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleId = parseInt(params.id);

    // Verify role belongs to user's shop (or is an onboarding role with shop_id IS NULL)
    const [role]: any = await pool.query(
      'SELECT id, is_system FROM roles WHERE id = ? AND (shop_id IS NULL OR shop_id = ?)',
      [roleId, user.shopId]
    );

    if (role.length === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role[0].is_system) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      );
    }

    // Delete role (cascade will remove permissions)
    await pool.query('DELETE FROM roles WHERE id = ?', [roleId]);

    return NextResponse.json({
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('❌ Role DELETE - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
