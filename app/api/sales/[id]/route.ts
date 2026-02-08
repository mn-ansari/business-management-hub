import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user || !user.shopId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const saleId = params.id;

    const [sales]: any = await pool.query(
      'SELECT * FROM sales WHERE id = ? AND shop_id = ?',
      [saleId, user.shopId]
    );

    if (sales.length === 0) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    const [items] = await pool.query(
      'SELECT * FROM sale_items WHERE sale_id = ?',
      [saleId]
    );

    return NextResponse.json({
      sale: sales[0],
      items
    });
  } catch (error) {
    console.error('Sale fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
