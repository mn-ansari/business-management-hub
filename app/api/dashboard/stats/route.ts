import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Dashboard Stats API - Request received');
    console.log('🔍 Dashboard Stats API - Cookie header:', request.headers.get('cookie'));
    
    const user = getUserFromRequest(request);
    console.log('🔍 Dashboard Stats API - User:', user);

    if (!user) {
      console.log('❌ Dashboard Stats API - No user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If JWT shopId is 0, check database for current shopId (handles onboarding transition)
    let shopId = user.shopId;
    if (!shopId || shopId === 0) {
      console.log('ℹ️ Dashboard Stats API - shopId is 0 in JWT, checking database...');
      const [users]: any = await pool.query(
        'SELECT shop_id FROM users WHERE id = ?',
        [user.userId]
      );
      if (users.length > 0 && users[0].shop_id) {
        shopId = users[0].shop_id;
        console.log('✅ Dashboard Stats API - Found shopId in database:', shopId);
      }
    }

    if (!shopId || shopId === 0) {
      console.log('❌ Dashboard Stats API - No shop found for user');
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 403 }
      );
    }

    console.log('✅ Dashboard Stats API - User authorized, shopId:', shopId);

    // Get total products
    const [productCount]: any = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE shop_id = ? AND is_active = 1',
      [shopId]
    );

    // Get low stock products
    const [lowStockCount]: any = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE shop_id = ? AND is_active = 1 AND current_stock < min_stock_level',
      [shopId]
    );

    // Get today's sales
    const [todaySales]: any = await pool.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE shop_id = ? AND DATE(sale_date) = CURDATE()',
      [shopId]
    );

    // Get month sales
    const [monthSales]: any = await pool.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE shop_id = ? AND MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())',
      [shopId]
    );

    // Get total customers
    const [customerCount]: any = await pool.query(
      'SELECT COUNT(*) as count FROM customers WHERE shop_id = ?',
      [shopId]
    );

    console.log('✅ Dashboard Stats API - Data fetched successfully');
    return NextResponse.json({
      totalProducts: productCount[0].count,
      lowStockProducts: lowStockCount[0].count,
      todaySales: parseFloat(todaySales[0].total),
      monthSales: parseFloat(monthSales[0].total),
      totalCustomers: customerCount[0].count
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
