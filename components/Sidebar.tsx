'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MENU_ITEMS } from '@/lib/permissions';

interface MenuItem {
  href: string;
  icon: string;
  label: string;
  permission?: string;
  adminOnly?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shopName, setShopName] = useState('Business Hub');
  const [userRole, setUserRole] = useState<string>('employee');
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchUserAndShop = async () => {
      try {
        // Fetch user info with permissions
        const authRes = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          setUserRole(authData.role || 'employee');
          setPermissionKeys(authData.permissionKeys || []);
        }

        // Fetch shop name
        const shopRes = await fetch('/api/shops/info', {
          credentials: 'include'
        });
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          setShopName(shopData.shop?.shop_name || 'Business Hub');
        }
      } catch (error) {
        console.error('Failed to fetch user/shop info:', error);
      }
    };
    fetchUserAndShop();
  }, []);

  useEffect(() => {
    // Filter menu items based on user's permissions and role
    const filtered = MENU_ITEMS.filter(item => {
      // Admin always sees all items
      if (userRole === 'admin') {
        return true;
      }

      // Filter by permission
      if (item.permission && !permissionKeys.includes(item.permission)) {
        return false;
      }

      return true;
    });

    setFilteredMenuItems(filtered);
  }, [userRole, permissionKeys]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = filteredMenuItems;

  return (
    <>
      {/* Modern Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary-600">🏪</div>
              <span className="font-bold text-lg text-gray-900">{shopName}</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl">{sidebarOpen ? '◀' : '▶'}</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-8 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1 h-6 bg-primary-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {sidebarOpen && (
              <span>{loading ? 'Logging out...' : 'Logout'}</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
