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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    const dateCondition = period === 'month'
      ? 'MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())'
      : 'YEAR(sale_date) = YEAR(CURDATE())';

    // Monthly sales trend
    const [monthlySales] = await pool.query(
      `SELECT 
        DATE_FORMAT(sale_date, '%Y-%m') as month,
        SUM(total_amount) as total
      FROM sales
      WHERE shop_id = ? AND ${dateCondition}
      GROUP BY month
      ORDER BY month`,
      [user.shopId]
    );

    // Sales by category
    const [categorySales] = await pool.query(
      `SELECT 
        p.category,
        SUM(si.total_price) as total
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.shop_id = ? AND ${dateCondition}
      GROUP BY p.category
      ORDER BY total DESC`,
      [user.shopId]
    );

    // Top selling products
    const [topProducts] = await pool.query(
      `SELECT 
        si.product_name,
        SUM(si.quantity) as total_quantity,
        SUM(si.total_price) as total_sales
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.shop_id = ? AND ${dateCondition}
      GROUP BY si.product_name
      ORDER BY total_sales DESC
      LIMIT 10`,
      [user.shopId]
    );

    // Monthly statistics
    const [monthlyStats]: any = await pool.query(
      `SELECT 
        SUM(total_amount) as totalSales,
        COUNT(*) as totalOrders,
        AVG(total_amount) as avgOrderValue
      FROM sales
      WHERE shop_id = ? AND ${dateCondition}`,
      [user.shopId]
    );

    return NextResponse.json({
      monthlySales,
      categorySales,
      topProducts,
      monthlyStats: {
        totalSales: parseFloat(monthlyStats[0]?.totalSales || 0),
        totalOrders: parseInt(monthlyStats[0]?.totalOrders || 0),
        avgOrderValue: parseFloat(monthlyStats[0]?.avgOrderValue || 0)
      }
    });
  } catch (error) {
    console.error('Reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
