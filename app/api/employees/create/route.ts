import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Employee Create Endpoint Called ===');
    
    const user = getUserFromRequest(request);
    console.log('User from request:', user);
    
    if (!user) {
      console.log('❌ No user found - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    console.log('✓ User authenticated:', { userId: user.userId, shopId: user.shopId });

    // Verify user is admin by checking if they own the shop
    const [adminCheck]: any = await pool.query(
      'SELECT id FROM users WHERE id = ? AND shop_id = ? LIMIT 1',
      [user.userId, user.shopId]
    );

    console.log('Admin check result:', adminCheck);

    if (adminCheck.length === 0) {
      console.log('❌ User not found in shop - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized - Access denied' }, { status: 401 });
    }

    console.log('✓ User belongs to shop');

    const body = await request.json();
    console.log('Request body:', { ...body, password: '***' });
    
    const { full_name, email, password, role_id } = body;

    if (!full_name || !email || !password) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    console.log('✓ All required fields present');

    // Check if email already exists
    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    console.log('Email check:', existing.length > 0 ? '❌ Email exists' : '✓ Email available');

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    console.log('Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✓ Password hashed');

    console.log('Creating employee in database...');
    // Create employee
    const [result]: any = await pool.query(
      `INSERT INTO users (email, password, full_name, shop_id, role, role_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, full_name, user.shopId, 'employee', role_id || null]
    );

    console.log('✓ Employee created with ID:', result.insertId);

    return NextResponse.json(
      { message: 'Employee created successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
