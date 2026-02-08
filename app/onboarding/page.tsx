'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import RoleSetup from '@/components/RoleSetup';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Role Setup, 1: Shop Info, 2: Address
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [skipRoleSetup, setSkipRoleSetup] = useState(false);
  console.log('Onboarding page loaded, step:', step);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        console.log('🔍 Onboarding - Checking auth...');
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        console.log('🔍 Onboarding - Auth response status:', response.status);
        console.log('🔍 Onboarding - Cookie:', document.cookie);
        
        if (!response.ok) {
          console.log('❌ Auth check failed, but allowing onboarding (user can complete shop setup)');
          // Allow onboarding anyway - they just completed signup
          setIsAuthorized(true);
          return;
        }
        
        const data = await response.json();
        console.log('✅ Auth check passed:', data);
        setIsAuthorized(true);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        // Still allow onboarding
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [router]);
  const [formData, setFormData] = useState({
    shop_name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    business_type: '',
    tax_id: '',
    currency: 'PKR'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/shops/create', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('🏪 Shop creation response:', response.status, data);

      if (response.ok) {
        toast.success('Shop setup completed successfully!');
        console.log('✅ Shop created with ID:', data.shop?.id);
        
        // Wait for database to commit, then verify, then redirect
        console.log('⏳ Waiting 500ms for database to sync...');
        setTimeout(async () => {
          try {
            // Call auth/me to verify shop_id is updated
            console.log('🔍 Verifying shop_id was updated in database...');
            const verifyRes = await fetch('/api/auth/me', { credentials: 'include' });
            const userData = await verifyRes.json();
            
            if (verifyRes.ok) {
              console.log('✅ Auth verification successful');
              console.log('✅ User shop_id from database:', userData.shop_id);
              console.log('✅ User ID:', userData.id);
              
              if (userData.shop_id && userData.shop_id > 0) {
                console.log('✅ Shop ID confirmed in database:', userData.shop_id);
              } else {
                console.log('⚠️ Shop ID still 0 or null:', userData.shop_id);
              }
            } else {
              console.log('❌ Auth verification failed:', verifyRes.status, userData);
            }
          } catch (error) {
            console.error('❌ Verification error:', error);
          }
          
          // Regardless, redirect to dashboard
          console.log('🔄 Redirecting to dashboard...');
          window.location.href = '/dashboard?_t=' + Date.now();
        }, 500);
      } else {
        console.error('❌ Shop creation failed:', response.status);
        console.error('Response data:', data);
        toast.error(data.error || 'Failed to create shop');
      }
    } catch (error) {
      console.error('❌ Exception during shop creation:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      {!isAuthorized ? (
        <div className="max-w-3xl mx-auto text-center mt-20">
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      ) : (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏪 Setup Your Shop</h1>
          <p className="text-gray-600 mt-2">Tell us about your business to get started</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center gap-2 md:gap-4 overflow-x-auto pb-4">
            <div className={`flex items-center flex-shrink-0 ${step >= 0 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm md:text-base ${step >= 0 ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium text-xs md:text-sm">Roles</span>
            </div>
            <div className="flex items-center flex-shrink-0">
              <div className={`w-8 md:w-16 h-1 ${step > 0 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            </div>
            <div className={`flex items-center flex-shrink-0 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm md:text-base ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium text-xs md:text-sm">Basic Info</span>
            </div>
            <div className="flex items-center flex-shrink-0">
              <div className={`w-8 md:w-16 h-1 ${step > 1 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            </div>
            <div className={`flex items-center flex-shrink-0 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm md:text-base ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium text-xs md:text-sm">Address</span>
            </div>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {step === 0 && (
              <div className="space-y-4">
                <RoleSetup 
                  onComplete={() => {
                    setSkipRoleSetup(false);
                    setStep(1);
                  }} 
                />
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSkipRoleSetup(true);
                      setStep(1);
                    }}
                    className="btn-secondary"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                
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
                    placeholder="e.g., Sweet Bakery"
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
                    placeholder="Your full name"
                    required
                  />
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
                      placeholder="shop@example.com"
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
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleChange}
                      className="input-field"
                      required
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
                      placeholder="GST/Tax ID"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="btn-secondary"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Shop Address</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    rows={3}
                    placeholder="Complete shop address"
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
                      placeholder="City name"
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
                      placeholder="State name"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="110001"
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
                      placeholder="India"
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

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Creating Shop...' : 'Complete Setup'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      )}
    </div>
  );
}
