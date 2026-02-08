import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Sales API - Request received');
    const user = getUserFromRequest(request);

    if (!user) {
      console.log('❌ Sales API - No user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If JWT shopId is 0, check database for current shopId (handles onboarding transition)
    let shopId = user.shopId;
    if (!shopId || shopId === 0) {
      console.log('ℹ️ Sales API - shopId is 0 in JWT, checking database...');
      const [users]: any = await pool.query(
        'SELECT shop_id FROM users WHERE id = ?',
        [user.userId]
      );
      if (users.length > 0 && users[0].shop_id) {
        shopId = users[0].shop_id;
        console.log('✅ Sales API - Found shopId in database:', shopId);
      }
    }

    if (!shopId || shopId === 0) {
      console.log('❌ Sales API - No shop found for user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Sales API - User authorized, shopId:', shopId);

    const [sales] = await pool.query(
      'SELECT * FROM sales WHERE shop_id = ? ORDER BY sale_date DESC, created_at DESC LIMIT 100',
      [shopId]
    );

    return NextResponse.json({ sales });
  } catch (error) {
    console.error('Sales fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
