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
      product_name,
      product_code,
      description,
      category,
      unit,
      purchase_price,
      selling_price,
      current_stock,
      min_stock_level,
      max_stock_level
    } = body;

    if (!product_name || !selling_price) {
      return NextResponse.json(
        { error: 'Product name and selling price are required' },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(
      `INSERT INTO products (
        shop_id, product_name, product_code, description, category, unit,
        purchase_price, selling_price, current_stock, min_stock_level, max_stock_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.shopId, product_name, product_code, description, category, unit,
        purchase_price, selling_price, current_stock, min_stock_level, max_stock_level
      ]
    );

    return NextResponse.json(
      {
        message: 'Product created successfully',
        productId: result.insertId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
