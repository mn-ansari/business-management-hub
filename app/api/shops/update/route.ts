import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || !user.shopId) {
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

    await pool.query(
      `UPDATE shops SET
        shop_name = ?, owner_name = ?, email = ?, phone = ?,
        address = ?, city = ?, state = ?, zip_code = ?, country = ?,
        business_type = ?, tax_id = ?, currency = ?
      WHERE id = ?`,
      [
        shop_name, owner_name, email, phone,
        address, city, state, zip_code, country,
        business_type, tax_id, currency, user.shopId
      ]
    );

    return NextResponse.json({
      message: 'Shop updated successfully'
    });
  } catch (error) {
    console.error('Shop update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
