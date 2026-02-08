'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Product {
  id?: number;
  product_name: string;
  product_code: string;
  description: string;
  category: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    product_name: '',
    product_code: '',
    description: '',
    category: '',
    unit: 'pcs',
    purchase_price: 0,
    selling_price: 0,
    current_stock: 0,
    min_stock_level: 10,
    max_stock_level: 1000
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProduct ? '/api/products/update' : '/api/products/create';
      const method = 'POST';
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct ? { ...formData, id: editingProduct.id } : formData)
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product added!');
        setShowModal(false);
        resetForm();
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch('/api/products/delete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        toast.success('Product deleted!');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      product_code: '',
      description: '',
      category: '',
      unit: 'pcs',
      purchase_price: 0,
      selling_price: 0,
      current_stock: 0,
      min_stock_level: 10,
      max_stock_level: 1000
    });
    setEditingProduct(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary"
        >
          ➕ Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="card bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Product Name</th>
              <th className="text-left py-3 px-4">Code</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-right py-3 px-4">Stock</th>
              <th className="text-right py-3 px-4">Purchase Price</th>
              <th className="text-right py-3 px-4">Selling Price</th>
              <th className="text-center py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No products found. Add your first product to get started.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{product.product_name}</td>
                  <td className="py-3 px-4">{product.product_code}</td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className={`py-3 px-4 text-right ${product.current_stock < product.min_stock_level ? 'text-red-600 font-semibold' : ''}`}>
                    {product.current_stock} {product.unit}
                  </td>
                  <td className="py-3 px-4 text-right">Rs {product.purchase_price}</td>
                  <td className="py-3 px-4 text-right">Rs {product.selling_price}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-primary-600 hover:text-primary-800 mr-3"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => product.id && handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Code
                  </label>
                  <input
                    type="text"
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilogram</option>
                    <option value="g">Gram</option>
                    <option value="l">Liter</option>
                    <option value="ml">Milliliter</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    name="current_stock"
                    value={formData.current_stock}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    name="min_stock_level"
                    value={formData.min_stock_level}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Stock Level
                  </label>
                  <input
                    type="number"
                    name="max_stock_level"
                    value={formData.max_stock_level}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
