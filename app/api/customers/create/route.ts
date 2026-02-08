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
    const { customer_name, email, phone, address, city } = body;

    if (!customer_name) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(
      'INSERT INTO customers (shop_id, customer_name, email, phone, address, city) VALUES (?, ?, ?, ?, ?, ?)',
      [user.shopId, customer_name, email, phone, address, city]
    );

    return NextResponse.json(
      {
        message: 'Customer created successfully',
        customerId: result.insertId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
