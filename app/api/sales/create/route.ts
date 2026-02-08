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
      customer_name,
      sale_date,
      subtotal,
      tax_amount,
      discount_amount,
      total_amount,
      payment_method,
      payment_status,
      notes,
      items
    } = body;

    if (!sale_date || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Create sale
      const [saleResult]: any = await connection.query(
        `INSERT INTO sales (
          shop_id, invoice_number, customer_name, sale_date,
          subtotal, tax_amount, discount_amount, total_amount,
          payment_method, payment_status, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.shopId, invoiceNumber, customer_name, sale_date,
          subtotal, tax_amount, discount_amount, total_amount,
          payment_method, payment_status, notes, user.userId
        ]
      );

      const saleId = saleResult.insertId;

      // Create sale items and update stock
      for (const item of items) {
        await connection.query(
          `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [saleId, item.product_id, item.product_name, item.quantity, item.unit_price, item.total_price]
        );

        // Update product stock
        await connection.query(
          'UPDATE products SET current_stock = current_stock - ? WHERE id = ? AND shop_id = ?',
          [item.quantity, item.product_id, user.shopId]
        );

        // Record stock movement
        await connection.query(
          `INSERT INTO stock_movements (shop_id, product_id, movement_type, quantity, reference_type, reference_id, created_by)
           VALUES (?, ?, 'out', ?, 'sale', ?, ?)`,
          [user.shopId, item.product_id, item.quantity, saleId, user.userId]
        );
      }

      await connection.commit();

      return NextResponse.json(
        {
          message: 'Sale created successfully',
          saleId,
          invoiceNumber
        },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Sale creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
