import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || !user.shopId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE shop_id = ? ORDER BY customer_name',
      [user.shopId]
    );

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Customers fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
