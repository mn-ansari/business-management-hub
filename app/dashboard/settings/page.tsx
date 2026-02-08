'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    business_type: '',
    tax_id: '',
    currency: 'PKR'
  });

  useEffect(() => {
    fetchShopInfo();
  }, []);

  const fetchShopInfo = async () => {
    try {
      const response = await fetch('/api/shops/info', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setShopInfo(data.shop);
        setFormData({
          shop_name: data.shop.shop_name || '',
          owner_name: data.shop.owner_name || '',
          email: data.shop.email || '',
          phone: data.shop.phone || '',
          address: data.shop.address || '',
          city: data.shop.city || '',
          state: data.shop.state || '',
          zip_code: data.shop.zip_code || '',
          country: data.shop.country || '',
          business_type: data.shop.business_type || '',
          tax_id: data.shop.tax_id || '',
          currency: data.shop.currency || 'PKR'
        });
      }
    } catch (error) {
      toast.error('Failed to load shop settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/shops/update', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Settings updated successfully!');
        fetchShopInfo();
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings & Management</h1>

      {/* Management Options Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card hover:shadow-lg transition cursor-pointer" onClick={() => router.push('/dashboard/settings/employees_pro')}>
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-lg font-semibold mb-2">Employee Management Pro</h3>
          <p className="text-sm text-gray-600">Generate credentials, manage employees, and edit privileges</p>
          <button className="mt-4 text-primary-600 font-medium text-sm hover:text-primary-700">
            Manage →
          </button>
        </div>

        <div className="card hover:shadow-lg transition cursor-pointer" onClick={() => router.push('/dashboard/settings/employees')}>
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold mb-2">Employee Directory</h3>
          <p className="text-sm text-gray-600">View and manage all employees in your store</p>
          <button className="mt-4 text-primary-600 font-medium text-sm hover:text-primary-700">
            View →
          </button>
        </div>
      </div>

      <div className="card bg-white max-w-4xl">
        <h2 className="text-xl font-semibold mb-6">Shop Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name *
              </label>
              <input
                type="text"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name *
              </label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select type</option>
                <option value="Bakery">Bakery</option>
                <option value="Grocery">Grocery Store</option>
                <option value="Cafe">Cafe/Restaurant</option>
                <option value="Retail">Retail Shop</option>
                <option value="Hardware">Hardware Store</option>
                <option value="Medical">Medical Store</option>
                <option value="Electronics">Electronics Shop</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID / GST Number
              </label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="input-field"
            >
              <option value="PKR">PKR (Rs)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* User Role Info */}
      <div className="card bg-white max-w-4xl mt-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Role:</span> Admin</p>
          <p className="text-sm text-gray-600">
            As an admin, you have full access to all features including products, sales, inventory, and settings.
          </p>
        </div>
      </div>
    </div>
  );
}
