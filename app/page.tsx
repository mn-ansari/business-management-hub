import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                🏪 Business Hub
              </h1>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Manage Your Business
            <span className="block text-primary-600">With Ease & Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Complete solution for small shops to manage sales, inventory, customers, 
            and generate professional invoices - all in one place.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-8 py-3">
            Start Free Trial
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
            <p className="text-gray-600">
              Track products, stock levels, and get alerts when inventory is low
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Sales & Invoicing</h3>
            <p className="text-gray-600">
              Create professional invoices and track all your sales in real-time
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">
              Visual reports and insights to help you make better business decisions
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Customer Management</h3>
            <p className="text-gray-600">
              Keep track of your customers and their purchase history
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">PDF Export</h3>
            <p className="text-gray-600">
              Generate and download professional PDF invoices instantly
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
            <p className="text-gray-600">
              Admin and manager roles with different permission levels
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 card bg-primary-600 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Join hundreds of shop owners who trust Business Hub
          </p>
          <Link href="/signup" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg inline-block transition-colors">
            Create Your Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
