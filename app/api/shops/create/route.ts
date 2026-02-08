import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    console.log('Shop create API - User from token:', user?.userId);

    if (!user) {
      console.log('Shop create API - No user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      shop_name,
      owner_name,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      business_type,
      tax_id,
      currency
    } = body;

    // Validate required fields
    if (!shop_name || !owner_name || !email || !address || !city || !state || !zip_code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has a shop
    const [existingShops]: any = await pool.query(
      'SELECT id FROM shops WHERE id = (SELECT shop_id FROM users WHERE id = ?)',
      [user.userId]
    );

    if (existingShops.length > 0) {
      return NextResponse.json(
        { error: 'Shop already exists' },
        { status: 400 }
      );
    }

    // Create shop
    const [shopResult]: any = await pool.query(
      `INSERT INTO shops (
        shop_name, owner_name, email, phone, address, city, state, 
        zip_code, country, business_type, tax_id, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shop_name, owner_name, email, phone, address, city, state,
        zip_code, country, business_type, tax_id, currency
      ]
    );

    const shopId = shopResult.insertId;
    console.log('Shop created with ID:', shopId);

    // Update user with shop_id
    await pool.query(
      'UPDATE users SET shop_id = ? WHERE id = ?',
      [shopId, user.userId]
    );

    console.log('User updated with shop_id:', shopId);

    // Generate new token with updated shop_id
    const newToken = generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      shopId: shopId // New shopId instead of 0
    });

    console.log('🔑 New token generated with shopId:', shopId);
    console.log('🔑 Token preview:', newToken.substring(0, 50) + '...');

    const responseData = {
      message: 'Shop created successfully',
      shop: {
        id: shopId,
        shop_name,
        owner_name,
        email
      },
      token: newToken
    };

    console.log('✅ Shop create API - Returning response with token');
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Shop creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
