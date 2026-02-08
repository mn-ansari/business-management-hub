import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Products API - Request received');
    const user = getUserFromRequest(request);

    if (!user) {
      console.log('❌ Products API - No user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If JWT shopId is 0, check database for current shopId (handles onboarding transition)
    let shopId = user.shopId;
    if (!shopId || shopId === 0) {
      console.log('ℹ️ Products API - shopId is 0 in JWT, checking database...');
      const [users]: any = await pool.query(
        'SELECT shop_id FROM users WHERE id = ?',
        [user.userId]
      );
      if (users.length > 0 && users[0].shop_id) {
        shopId = users[0].shop_id;
        console.log('✅ Products API - Found shopId in database:', shopId);
      }
    }

    if (!shopId || shopId === 0) {
      console.log('❌ Products API - No shop found for user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Products API - User authorized, shopId:', shopId);

    const [products] = await pool.query(
      'SELECT * FROM products WHERE shop_id = ? AND is_active = 1 ORDER BY product_name',
      [shopId]
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
