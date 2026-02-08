'use client';

import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportData {
  monthlySales: any[];
  categorySales: any[];
  topProducts: any[];
  monthlyStats: {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year'>('month');

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/reports?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        toast.error('Failed to load reports');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading reports...</div>;
  }

  if (!reportData) {
    return <div>No data available</div>;
  }

  // Sales Trend Chart Data
  const salesTrendData = {
    labels: reportData.monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Sales',
        data: reportData.monthlySales.map(item => item.total),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Category Sales Chart Data
  const categorySalesData = {
    labels: reportData.categorySales.map(item => item.category || 'Uncategorized'),
    datasets: [
      {
        label: 'Sales by Category',
        data: reportData.categorySales.map(item => item.total),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      }
    ]
  };

  // Top Products Chart Data
  const topProductsData = {
    labels: reportData.topProducts.map(item => item.product_name),
    datasets: [
      {
        label: 'Total Sales',
        data: reportData.topProducts.map(item => item.total_sales),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
        </div>
        
        <div className="flex gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'month' | 'year')}
            className="input-field"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-white">
          <h3 className="text-sm text-gray-600 mb-2">Total Sales ({period === 'month' ? 'Month' : 'Year'})</h3>
          <p className="text-3xl font-bold text-green-600">
            ₹{reportData.monthlyStats.totalSales.toLocaleString()}
          </p>
        </div>
        <div className="card bg-white">
          <h3 className="text-sm text-gray-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-primary-600">
            {reportData.monthlyStats.totalOrders}
          </p>
        </div>
        <div className="card bg-white">
          <h3 className="text-sm text-gray-600 mb-2">Avg Order Value</h3>
          <p className="text-3xl font-bold text-gray-900">
            ₹{reportData.monthlyStats.avgOrderValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="card bg-white">
          <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
          <div style={{ height: '300px' }}>
            <Line data={salesTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card bg-white">
          <h2 className="text-xl font-semibold mb-4">Sales by Category</h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={categorySalesData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card bg-white">
        <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
        <div style={{ height: '400px' }}>
          <Bar data={topProductsData} options={chartOptions} />
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card bg-white mt-8">
        <h2 className="text-xl font-semibold mb-4">Product Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Product Name</th>
                <th className="text-right py-3 px-4">Quantity Sold</th>
                <th className="text-right py-3 px-4">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {reportData.topProducts.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{product.product_name}</td>
                  <td className="py-3 px-4 text-right">{product.total_quantity}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    ₹{parseFloat(product.total_sales).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
