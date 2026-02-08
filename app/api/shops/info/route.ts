import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Shop Info API - Request received');
    console.log('🔍 Shop Info API - Cookie header:', request.headers.get('cookie'));
    
    const user = getUserFromRequest(request);
    console.log('🔍 Shop Info API - User:', user);

    if (!user) {
      console.log('❌ Shop Info API - No user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If JWT shopId is 0, check database for current shopId (handles onboarding transition)
    let shopId = user.shopId;
    if (!shopId || shopId === 0) {
      console.log('ℹ️ Shop Info API - shopId is 0 in JWT, checking database...');
      const [users]: any = await pool.query(
        'SELECT shop_id FROM users WHERE id = ?',
        [user.userId]
      );
      if (users.length > 0 && users[0].shop_id) {
        shopId = users[0].shop_id;
        console.log('✅ Shop Info API - Found shopId in database:', shopId);
      }
    }

    if (!shopId || shopId === 0) {
      console.log('❌ Shop Info API - No shop found for user');
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 403 }
      );
    }

    console.log('✅ Shop Info API - User authorized, shopId:', shopId);

    const [shops]: any = await pool.query(
      'SELECT * FROM shops WHERE id = ?',
      [shopId]
    );

    if (shops.length === 0) {
      console.log('❌ Shop Info API - Shop not found in database');
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    console.log('✅ Shop Info API - Shop found:', shops[0].shop_name);
    return NextResponse.json({ shop: shops[0] });
  } catch (error) {
    console.error('❌ Shop info error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
