import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user belongs to shop
    const [shopCheck]: any = await pool.query(
      'SELECT id FROM users WHERE id = ? AND shop_id = ? LIMIT 1',
      [user.userId, user.shopId]
    );

    if (shopCheck.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const empId = parseInt(params.id);

    const [employee]: any = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.role_id
       FROM users u
       WHERE u.id = ? AND u.shop_id = ?`,
      [empId, user.shopId]
    );

    if (employee.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user belongs to shop
    const [shopCheck]: any = await pool.query(
      'SELECT id FROM users WHERE id = ? AND shop_id = ? LIMIT 1',
      [user.userId, user.shopId]
    );

    if (shopCheck.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const empId = parseInt(params.id);
    const body = await request.json();
    const { full_name, email, password, role_id } = body;

    // Verify employee belongs to user's shop
    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE id = ? AND shop_id = ?',
      [empId, user.shopId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Update employee
    let updateQuery = 'UPDATE users SET ';
    const updateParams: any[] = [];

    if (full_name) {
      updateQuery += 'full_name = ?, ';
      updateParams.push(full_name);
    }

    if (email) {
      updateQuery += 'email = ?, ';
      updateParams.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += 'password = ?, ';
      updateParams.push(hashedPassword);
    }

    if (role_id !== undefined) {
      updateQuery += 'role_id = ?, ';
      updateParams.push(role_id || null);
    }

    updateQuery += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    updateParams.push(empId);

    await pool.query(updateQuery, updateParams);

    return NextResponse.json({
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user belongs to shop
    const [shopCheck]: any = await pool.query(
      'SELECT id FROM users WHERE id = ? AND shop_id = ? LIMIT 1',
      [user.userId, user.shopId]
    );

    if (shopCheck.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const empId = parseInt(params.id);

    // Verify employee belongs to user's shop
    const [employee]: any = await pool.query(
      'SELECT id FROM users WHERE id = ? AND shop_id = ? AND id != ?',
      [empId, user.shopId, user.userId]
    );

    if (employee.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Delete employee
    await pool.query('DELETE FROM users WHERE id = ?', [empId]);

    return NextResponse.json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
