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
      id,
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

    if (!id || !product_name || !selling_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE products SET
        product_name = ?, product_code = ?, description = ?, category = ?, unit = ?,
        purchase_price = ?, selling_price = ?, current_stock = ?, 
        min_stock_level = ?, max_stock_level = ?
      WHERE id = ? AND shop_id = ?`,
      [
        product_name, product_code, description, category, unit,
        purchase_price, selling_price, current_stock,
        min_stock_level, max_stock_level, id, user.shopId
      ]
    );

    return NextResponse.json({
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
