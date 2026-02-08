'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  product_name: string;
  product_code: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  selling_price: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low'>('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/products', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setLowStockProducts(
          data.products.filter((p: Product) => p.current_stock < p.min_stock_level)
        );
      } else {
        toast.error('Failed to load inventory');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const displayProducts = filter === 'low' ? lowStockProducts : products;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track your product stock levels</p>
      </div>

      {/* Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="card bg-red-50 border-2 border-red-200 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Low Stock Alert!
              </h3>
              <p className="text-red-700 mb-3">
                {lowStockProducts.length} product(s) are running low on stock
              </p>
              <button
                onClick={() => setFilter('low')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                View Low Stock Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-medium ${
            filter === 'all' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All Products ({products.length})
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-6 py-2 rounded-lg font-medium ${
            filter === 'low' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Low Stock ({lowStockProducts.length})
        </button>
      </div>

      {/* Inventory Table */}
      <div className="card bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Product Name</th>
              <th className="text-left py-3 px-4">Code</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-right py-3 px-4">Current Stock</th>
              <th className="text-right py-3 px-4">Min Level</th>
              <th className="text-right py-3 px-4">Max Level</th>
              <th className="text-center py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Value</th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              displayProducts.map((product) => {
                const isLow = product.current_stock < product.min_stock_level;
                const stockPercentage = (product.current_stock / product.max_stock_level) * 100;
                const totalValue = product.current_stock * product.selling_price;

                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{product.product_name}</td>
                    <td className="py-3 px-4">{product.product_code}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                      {product.current_stock} {product.unit}
                    </td>
                    <td className="py-3 px-4 text-right">{product.min_stock_level}</td>
                    <td className="py-3 px-4 text-right">{product.max_stock_level}</td>
                    <td className="py-3 px-4 text-center">
                      {isLow ? (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Low Stock
                        </span>
                      ) : stockPercentage > 80 ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Good
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          Medium
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ₹{totalValue.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inventory Summary */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="card bg-white">
          <h3 className="text-sm text-gray-600 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="card bg-white">
          <h3 className="text-sm text-gray-600 mb-2">Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-600">{lowStockProducts.length}</p>
        </div>
        <div className="card bg-white">
          <h3 className="text-sm text-gray-600 mb-2">Total Inventory Value</h3>
          <p className="text-3xl font-bold text-green-600">
            Rs {products.reduce((sum, p) => sum + (p.current_stock * p.selling_price), 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
