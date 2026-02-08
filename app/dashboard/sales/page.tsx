'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Sale {
  id: number;
  invoice_number: string;
  customer_name: string;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
}

interface Product {
  id: number;
  product_name: string;
  selling_price: number;
  current_stock: number;
}

interface SaleItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [shopInfo, setShopInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    sale_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    payment_status: 'paid',
    discount_amount: 0,
    tax_amount: 0,
    notes: ''
  });

  const [items, setItems] = useState<SaleItem[]>([
    { product_id: 0, product_name: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchShopInfo();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSales(data.sales);
      }
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to load products');
    }
  };

  const fetchShopInfo = async () => {
    try {
      const response = await fetch('/api/shops/info', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setShopInfo(data.shop);
      }
    } catch (error) {
      console.error('Failed to load shop info');
    }
  };

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product_id: productId,
        product_name: product.product_name,
        unit_price: product.selling_price,
        total_price: newItems[index].quantity * product.selling_price
      };
      setItems(newItems);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].total_price = quantity * newItems[index].unit_price;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_id: 0, product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + formData.tax_amount - formData.discount_amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.some(item => !item.product_id)) {
      toast.error('Please select products for all items');
      return;
    }

    try {
      const response = await fetch('/api/sales/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subtotal: calculateSubtotal(),
          total_amount: calculateTotal(),
          items
        })
      });

      if (response.ok) {
        toast.success('Sale recorded successfully!');
        setShowModal(false);
        resetForm();
        fetchSales();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create sale');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      sale_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      payment_status: 'paid',
      discount_amount: 0,
      tax_amount: 0,
      notes: ''
    });
    setItems([{ product_id: 0, product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const downloadPDF = async (sale: Sale) => {
    try {
      const response = await fetch(`/api/sales/${sale.id}`);
      const data = await response.json();
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text(shopInfo?.shop_name || 'Business Hub', 14, 20);
      doc.setFontSize(10);
      doc.text(shopInfo?.address || '', 14, 27);
      doc.text(`${shopInfo?.city}, ${shopInfo?.state} ${shopInfo?.zip_code}`, 14, 32);
      doc.text(`Phone: ${shopInfo?.phone || ''}`, 14, 37);
      
      // Invoice Details
      doc.setFontSize(16);
      doc.text('INVOICE', 14, 50);
      doc.setFontSize(10);
      doc.text(`Invoice #: ${sale.invoice_number}`, 14, 57);
      doc.text(`Date: ${new Date(sale.sale_date).toLocaleDateString()}`, 14, 62);
      doc.text(`Customer: ${sale.customer_name || 'Walk-in Customer'}`, 14, 67);
      
      // Items Table
      const tableData = data.items.map((item: any) => [
        item.product_name,
        item.quantity,
        `Rs ${item.unit_price.toFixed(2)}`,
        `Rs ${item.total_price.toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: 75,
        head: [['Product', 'Quantity', 'Price', 'Total']],
        body: tableData,
      });
      
      // Totals
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text(`Subtotal: Rs ${data.sale.subtotal.toFixed(2)}`, 150, finalY);
      doc.text(`Tax: Rs ${data.sale.tax_amount.toFixed(2)}`, 150, finalY + 7);
      doc.text(`Discount: Rs ${data.sale.discount_amount.toFixed(2)}`, 150, finalY + 14);
      doc.setFontSize(12);
      doc.text(`Total: Rs ${data.sale.total_amount.toFixed(2)}`, 150, finalY + 21);
      
      doc.save(`invoice-${sale.invoice_number}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sales & Invoices</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          ➕ New Sale
        </button>
      </div>

      {/* Sales Table */}
      <div className="card bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Invoice #</th>
              <th className="text-left py-3 px-4">Customer</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-right py-3 px-4">Amount</th>
              <th className="text-center py-3 px-4">Payment</th>
              <th className="text-center py-3 px-4">Status</th>
              <th className="text-center py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No sales recorded yet. Create your first sale to get started.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{sale.invoice_number}</td>
                  <td className="py-3 px-4">{sale.customer_name || 'Walk-in'}</td>
                  <td className="py-3 px-4">{new Date(sale.sale_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right font-semibold">₹{sale.total_amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center capitalize">{sale.payment_method}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      sale.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {sale.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => downloadPDF(sale)}
                      className="text-primary-600 hover:text-primary-800"
                      title="Download PDF"
                    >
                      📄
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">New Sale</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    className="input-field"
                    placeholder="Walk-in Customer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Date *
                  </label>
                  <input
                    type="date"
                    value={formData.sale_date}
                    onChange={(e) => setFormData({...formData, sale_date: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    className="input-field"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Items</h3>
                {items.map((item, index) => (
                  <div key={index} className="grid md:grid-cols-5 gap-4 mb-3">
                    <div className="md:col-span-2">
                      <select
                        value={item.product_id}
                        onChange={(e) => handleProductChange(index, parseInt(e.target.value))}
                        className="input-field"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.product_name} (Stock: {p.current_stock})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                        className="input-field"
                        placeholder="Qty"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.unit_price}
                        className="input-field"
                        placeholder="Price"
                        readOnly
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.total_price}
                        className="input-field"
                        placeholder="Total"
                        readOnly
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  + Add Item
                </button>
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.tax_amount}
                      onChange={(e) => setFormData({...formData, tax_amount: parseFloat(e.target.value) || 0})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({...formData, discount_amount: parseFloat(e.target.value) || 0})}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax:</span>
                    <span>₹{formData.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Discount:</span>
                    <span>-₹{formData.discount_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
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
                  Complete Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
