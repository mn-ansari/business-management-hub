'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  todaySales: number;
  monthSales: number;
  totalCustomers: number;
}

interface MonthlySalesData {
  month: string;
  sales: number;
  target: number;
}

interface CategoryData {
  category: string;
  value: number;
  count: number;
}

interface RevenueTrendData {
  day: number;
  revenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData[]>([]);

  useEffect(() => {
    console.log('Dashboard page loaded');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Dashboard - Fetching data...');
      const cookieStr = document.cookie;
      console.log('🔐 Dashboard - Full cookie:', cookieStr.substring(0, 200));
      
      // Extract token from cookie to decode
      const tokenMatch = cookieStr.match(/token=([^;]+)/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        try {
          // Decode JWT to check shopId
          const parts = token.split('.');
          const payload = JSON.parse(atob(parts[1]));
          console.log('🔑 Dashboard - Token shopId:', payload.shopId);
          console.log('🔑 Dashboard - Token userId:', payload.userId);
        } catch (e) {
          console.log('⚠️ Dashboard - Could not decode token');
        }
      } else {
        console.log('❌ Dashboard - No token found in cookie!');
      }
      
      const [statsRes, shopRes, salesRes, productsRes] = await Promise.all([
        fetch('/api/dashboard/stats', { credentials: 'include' }),
        fetch('/api/shops/info', { credentials: 'include' }),
        fetch('/api/sales', { credentials: 'include' }),
        fetch('/api/products', { credentials: 'include' })
      ]);

      console.log('📊 Dashboard - Stats API:', statsRes.status);
      console.log('📊 Dashboard - Shop API:', shopRes.status);
      console.log('📊 Dashboard - Sales API:', salesRes.status);
      console.log('📊 Dashboard - Products API:', productsRes.status);

      if (statsRes.ok && shopRes.ok) {
        const statsData = await statsRes.json();
        const shopData = await shopRes.json();
        console.log('✅ Dashboard - Data loaded successfully');
        setStats(statsData);
        setShopInfo(shopData.shop);

        // Calculate monthly sales data
        if (salesRes.ok) {
          const salesData = await salesRes.json();
          calculateMonthlySales(salesData.sales || []);
          calculateRevenueTrend(salesData.sales || []);
        } else {
          console.log('⚠️ Dashboard - Sales API failed:', salesRes.status);
          calculateMonthlySales([]);
        }

        // Calculate category distribution
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          calculateCategoryData(productsData.products || []);
        } else {
          console.log('⚠️ Dashboard - Products API failed:', productsRes.status);
        }
      } else {
        console.log('❌ Dashboard - Stats or Shop API failed');
        const statsError = statsRes.ok ? null : await statsRes.json();
        const shopError = shopRes.ok ? null : await shopRes.json();
        console.log('Stats error:', statsError);
        console.log('Shop error:', shopError);
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('❌ Dashboard - Error fetching data:', error);
      toast.error('An error occurred');
      // Set default values if API fails
      calculateMonthlySales([]);
      setCategoryData([
        { category: 'Electronics', value: 0, count: 0 },
        { category: 'Clothing', value: 0, count: 0 },
        { category: 'Food', value: 0, count: 0 },
        { category: 'Others', value: 0, count: 0 },
      ]);
      setRevenueTrend(Array.from({ length: 12 }).map((_, i) => ({ day: i + 1, revenue: 0 })));
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlySales = (sales: any[]) => {
    // Get last 6 months
    const now = new Date();
    const monthlySalesMap: { [key: string]: number } = {};
    const data = [];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' });
      monthlySalesMap[monthKey] = 0;
    }

    // Aggregate sales data by month
    sales.forEach((sale: any) => {
      const date = new Date(sale.sale_date);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' });
      if (monthlySalesMap.hasOwnProperty(monthKey)) {
        monthlySalesMap[monthKey] += sale.total_amount || 0;
      }
    });

    // Build data array with month names
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' });
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      data.push({
        month: monthName,
        sales: monthlySalesMap[monthKey] || 0,
        target: 50000
      });
    }
    setMonthlySales(data);
  };

  const calculateCategoryData = (products: any) => {
    const categories: { [key: string]: { count: number; value: number } } = {};
    
    products.forEach((product: any) => {
      const cat = product.category || 'Others';
      if (!categories[cat]) {
        categories[cat] = { count: 0, value: 0 };
      }
      categories[cat].count += 1;
      categories[cat].value += product.current_stock * product.selling_price;
    });

    const totalCount = Object.values(categories).reduce((sum, cat) => sum + cat.count, 0);
    const catData = Object.entries(categories).map(([name, data]) => ({
      category: name,
      value: totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0,
      count: data.count
    }));

    // Ensure at least 4 categories are shown
    while (catData.length < 4) {
      catData.push({
        category: `Category ${catData.length + 1}`,
        value: 0,
        count: 0
      });
    }

    setCategoryData(catData.slice(0, 4));
  };

  const calculateRevenueTrend = (sales: any) => {
    const trend: { [key: number]: number } = {};
    
    // Initialize all days with 0
    for (let i = 1; i <= 12; i++) {
      trend[i] = 0;
    }

    // Add real sales data by day
    sales.forEach((sale: any) => {
      const date = new Date(sale.sale_date);
      const day = date.getDate();
      if (day <= 12) {
        trend[day] += sale.total_amount || 0;
      }
    });

    const trendData = Array.from({ length: 12 }).map((_, i) => ({
      day: i + 1,
      revenue: trend[i + 1] || 0
    }));

    setRevenueTrend(trendData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-5xl mb-4">📊</div>
          <div className="text-xl text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const monthlySalesMax = Math.max(...monthlySales.map(d => Math.max(d.sales, d.target)), 1);
  const revenueTrendMax = Math.max(...revenueTrend.map(d => d.revenue), 1);
  const categoryTotal = categoryData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-8 bg-gray-900 min-h-screen">
      {/* Header with Breadcrumb */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500 text-sm uppercase tracking-wider">DASHBOARD / SALES</p>
            <h1 className="text-4xl font-bold text-white mt-2">Welcome back!</h1>
            <p className="text-gray-400 mt-2">
              {shopInfo?.shop_name} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <Link href="/dashboard/sales" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 inline-flex items-center gap-2">
              <span>➕</span> New Purchase
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Amount */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Net Amount (Today)</p>
              <p className="text-4xl font-bold text-white mt-2">Rs {stats?.todaySales?.toLocaleString() || 0}</p>
              <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                <span>📈</span> {stats?.todaySales ? '+' : ''}0% from yesterday
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl group-hover:from-blue-600/30 group-hover:to-blue-600/20 transition-all">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        {/* Sales Tax */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Sales Tax (17%)</p>
              <p className="text-4xl font-bold text-white mt-2">Rs {stats?.todaySales ? Math.round(stats.todaySales * 0.17).toLocaleString() : 0}</p>
              <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                <span>📈</span> Calculated tax
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-pink-600/20 to-pink-600/10 rounded-xl group-hover:from-pink-600/30 group-hover:to-pink-600/20 transition-all">
              <span className="text-3xl">🧾</span>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Products</p>
              <p className="text-4xl font-bold text-white mt-2">{stats?.totalProducts || 0}</p>
              <p className="text-purple-400 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span> {stats?.lowStockProducts || 0} low stock
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl group-hover:from-purple-600/30 group-hover:to-purple-600/20 transition-all">
              <span className="text-3xl">📦</span>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Customers</p>
              <p className="text-4xl font-bold text-white mt-2">{stats?.totalCustomers || 0}</p>
              <p className="text-cyan-400 text-sm mt-2 flex items-center gap-1">
                <span>📈</span> {stats?.totalCustomers || 0} registered
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-600/20 to-cyan-600/10 rounded-xl group-hover:from-cyan-600/30 group-hover:to-cyan-600/20 transition-all">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Monthly Sales */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Monthly Sales Trend</h2>
            <p className="text-gray-400 text-sm mt-1">Last 6 months comparison</p>
          </div>
          
          <div className="flex items-end justify-around h-72 gap-2 mb-4">
            {monthlySales.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className="flex gap-1 items-end h-64 w-full">
                  {/* Sales bar */}
                  <div 
                    className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg hover:opacity-80 transition-all cursor-pointer group relative"
                    style={{ height: `${(data.sales / monthlySalesMax) * 100}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-8 left-0 right-0 text-center text-xs font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Rs {(data.sales / 1000).toFixed(1)}K
                    </div>
                  </div>
                  {/* Target bar */}
                  <div 
                    className="flex-1 bg-gradient-to-t from-pink-600 to-pink-400 rounded-t-lg hover:opacity-80 transition-all cursor-pointer group relative"
                    style={{ height: `${(data.target / monthlySalesMax) * 100}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-8 left-0 right-0 text-center text-xs font-bold text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Rs {(data.target / 1000).toFixed(1)}K
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-3 font-semibold">{data.month}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"></div>
              <span className="text-gray-400 text-sm">Actual Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-pink-600 to-pink-400 rounded-full"></div>
              <span className="text-gray-400 text-sm">Target</span>
            </div>
          </div>
        </div>

        {/* Pie Chart - Category Distribution */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Product Categories</h2>
            <p className="text-gray-400 text-sm mt-1">Distribution by category</p>
          </div>

          <div className="flex items-center justify-between">
            {/* Pie representation */}
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 p-1">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats?.totalProducts || 0}</p>
                    <p className="text-gray-400 text-sm">Products</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Legend */}
            <div className="space-y-3">
              {categoryData.map((cat, idx) => {
                const colors = ['bg-gradient-to-r from-purple-600 to-purple-400', 'bg-gradient-to-r from-pink-600 to-pink-400', 'bg-gradient-to-r from-cyan-600 to-cyan-400', 'bg-gradient-to-r from-blue-600 to-blue-400'];
                const percentage = categoryTotal > 0 ? cat.value : 0;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${colors[idx]}`}></div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm font-medium">{cat.category}</p>
                      <p className="text-gray-500 text-xs">{cat.count} items</p>
                    </div>
                    <div className="w-24 h-1 bg-gray-700 rounded-full">
                      <div 
                        className={`h-full rounded-full ${colors[idx]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Revenue Trend */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Revenue Trend</h2>
            <p className="text-gray-400 text-sm mt-1">Daily revenue tracking (First 12 days)</p>
          </div>

          <div className="h-72 flex items-end justify-around mb-4 gap-1">
            {revenueTrend.map((data, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-cyan-600 to-blue-400 rounded-t-lg hover:from-cyan-500 hover:to-blue-300 transition-all cursor-pointer group relative"
                style={{ height: `${revenueTrendMax > 0 ? (data.revenue / revenueTrendMax) * 100 : 5}%`, minHeight: '4px' }}
              >
                <div className="absolute -top-8 left-0 right-0 text-center text-xs font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Rs {data.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-xs text-center">Day 1 - Day 12 of current month</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <p className="text-gray-500 text-xs font-semibold uppercase">Monthly Revenue</p>
            <p className="text-3xl font-bold text-white mt-2">Rs {stats?.monthSales?.toLocaleString() || 0}</p>
            <p className="text-green-400 text-xs mt-2">↑ {stats?.monthSales ? '23%' : '0%'} gain</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <p className="text-gray-500 text-xs font-semibold uppercase">Avg. Product Value</p>
            <p className="text-3xl font-bold text-white mt-2">Rs {stats?.totalProducts ? Math.floor(stats.monthSales / stats.totalProducts) : 0}</p>
            <p className="text-green-400 text-xs mt-2">↑ 5% gain</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <p className="text-gray-500 text-xs font-semibold uppercase">Stock Health</p>
            <p className="text-3xl font-bold text-white mt-2">{stats?.totalProducts && stats?.lowStockProducts ? Math.round(((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100) : 0}%</p>
            <p className="text-green-400 text-xs mt-2">↑ Healthy</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/sales" 
            className="group p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-900/20 hover:to-purple-900/10 transition-all"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💰</div>
            <div className="font-semibold text-white group-hover:text-purple-400">View Sales</div>
            <p className="text-xs text-gray-400 mt-1">Check all transactions</p>
          </Link>
          <Link 
            href="/dashboard/products" 
            className="group p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-pink-500 hover:bg-gradient-to-br hover:from-pink-900/20 hover:to-pink-900/10 transition-all"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
            <div className="font-semibold text-white group-hover:text-pink-400">Manage Products</div>
            <p className="text-xs text-gray-400 mt-1">Add or edit items</p>
          </Link>
          <Link 
            href="/dashboard/reports" 
            className="group p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-cyan-500 hover:bg-gradient-to-br hover:from-cyan-900/20 hover:to-cyan-900/10 transition-all"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
            <div className="font-semibold text-white group-hover:text-cyan-400">View Reports</div>
            <p className="text-xs text-gray-400 mt-1">Analytics & insights</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
