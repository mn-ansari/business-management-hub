import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const [employees]: any = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.role_id, u.created_at
       FROM users u 
       WHERE u.shop_id = ? AND u.id != ?
       ORDER BY u.created_at DESC`,
      [user.shopId, user.userId]
    );

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { full_name, email, password, role_id } = body;

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee
    const [result]: any = await pool.query(
      `INSERT INTO users (email, password, full_name, shop_id, role, role_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, full_name, user.shopId, 'employee', role_id || null]
    );

    return NextResponse.json(
      { message: 'Employee created successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
