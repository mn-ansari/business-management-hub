import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, password } = body;

    // Validate input
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUsers]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result]: any = await pool.query(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, full_name, 'admin']
    );

    const userId = result.insertId;

    // Generate token
    const token = generateToken({
      userId,
      email,
      role: 'admin',
      shopId: 0 // No shop yet
    });

    console.log('✅ Signup - Token generated:', token.substring(0, 20) + '...');

    // Set cookie using Next.js cookies
    const cookieStore = cookies();
    cookieStore.set('token', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    console.log('✅ Signup - Cookie set');

    const response = NextResponse.json(
      { 
        message: 'Account created successfully',
        token: token,
        hasShop: false,
        user: {
          id: userId,
          email,
          full_name,
          role: 'admin'
        }
      },
      { status: 201 }
    );

    console.log('✅ Signup - Response sent, redirecting to onboarding');

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
