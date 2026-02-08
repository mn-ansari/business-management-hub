import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      shopId: user.shop_id || 0
    });

    console.log('✅ Login API - Token generated:', token.substring(0, 20) + '...');
    console.log('✅ User data:', { userId: user.id, email: user.email, shopId: user.shop_id });

    // Set cookie using Next.js cookies
    const cookieStore = cookies();
    cookieStore.set('token', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    console.log('✅ Login API - Cookie set via Next.js cookies()');

    const response = NextResponse.json(
      { 
        message: 'Login successful',
        hasShop: !!user.shop_id,
        token: token, // Also send token in response for debugging
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          shop_id: user.shop_id
        }
      },
      { status: 200 }
    );

    console.log('✅ Login API - Response sent');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
