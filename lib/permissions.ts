// Permission keys mapping to menu items and features
export const MENU_PERMISSIONS = {
  dashboard: 'view_dashboard',
  products: 'view_products',
  inventory: 'view_inventory',
  sales: 'view_sales',
  customers: 'view_customers',
  reports: 'view_reports',
  employees: 'manage_employees',
  roles: 'manage_roles',
  settings: 'manage_shop',
} as const;

// Detailed feature permissions for each tab
export const FEATURE_PERMISSIONS = {
  dashboard: [
    { key: 'view_dashboard', name: 'View Dashboard', icon: '👁️' },
  ],
  products: [
    { key: 'view_products', name: 'View Products', icon: '👁️' },
    { key: 'create_product', name: 'Add Products', icon: '➕' },
    { key: 'edit_product', name: 'Edit Products', icon: '✏️' },
    { key: 'delete_product', name: 'Delete Products', icon: '🗑️' },
  ],
  inventory: [
    { key: 'view_inventory', name: 'View Inventory', icon: '👁️' },
    { key: 'edit_inventory', name: 'Edit Inventory', icon: '✏️' },
    { key: 'manage_stock', name: 'Manage Stock Levels', icon: '📊' },
  ],
  sales: [
    { key: 'view_sales', name: 'View Sales', icon: '👁️' },
    { key: 'create_sale', name: 'Add Sales', icon: '➕' },
    { key: 'edit_sale', name: 'Edit Sales', icon: '✏️' },
    { key: 'delete_sale', name: 'Delete Sales', icon: '🗑️' },
  ],
  customers: [
    { key: 'view_customers', name: 'View Customers', icon: '👁️' },
    { key: 'create_customer', name: 'Add Customers', icon: '➕' },
    { key: 'edit_customer', name: 'Edit Customers', icon: '✏️' },
    { key: 'delete_customer', name: 'Delete Customers', icon: '🗑️' },
  ],
  reports: [
    { key: 'view_reports', name: 'View Reports', icon: '👁️' },
  ],
  employees: [
    { key: 'manage_employees', name: 'View Employees', icon: '👁️' },
    { key: 'create_employee', name: 'Add Employees', icon: '➕' },
    { key: 'edit_employee', name: 'Edit Employees', icon: '✏️' },
    { key: 'delete_employee', name: 'Delete Employees', icon: '🗑️' },
  ],
  roles: [
    { key: 'manage_roles', name: 'View Roles', icon: '👁️' },
    { key: 'create_role', name: 'Create Roles', icon: '➕' },
    { key: 'edit_role', name: 'Edit Roles', icon: '✏️' },
    { key: 'delete_role', name: 'Delete Roles', icon: '🗑️' },
    { key: 'manage_permissions', name: 'Manage Permissions', icon: '🔐' },
  ],
  settings: [
    { key: 'manage_shop', name: 'View Settings', icon: '👁️' },
    { key: 'edit_shop', name: 'Edit Shop Settings', icon: '✏️' },
    { key: 'manage_billing', name: 'Manage Billing', icon: '💳' },
  ],
} as const;

export const MENU_ITEMS = [
  { 
    href: '/dashboard', 
    icon: '📊', 
    label: 'Dashboard',
    permission: MENU_PERMISSIONS.dashboard
  },
  { 
    href: '/dashboard/products', 
    icon: '📦', 
    label: 'Products',
    permission: MENU_PERMISSIONS.products
  },
  { 
    href: '/dashboard/inventory', 
    icon: '📋', 
    label: 'Inventory',
    permission: MENU_PERMISSIONS.inventory
  },
  { 
    href: '/dashboard/sales', 
    icon: '💰', 
    label: 'Sales',
    permission: MENU_PERMISSIONS.sales
  },
  { 
    href: '/dashboard/customers', 
    icon: '👥', 
    label: 'Customers',
    permission: MENU_PERMISSIONS.customers
  },
  { 
    href: '/dashboard/reports', 
    icon: '📈', 
    label: 'Reports',
    permission: MENU_PERMISSIONS.reports
  },
  { 
    href: '/dashboard/employees', 
    icon: '👨‍💼', 
    label: 'Employees',
    permission: 'manage_employees',
    adminOnly: true
  },
  { 
    href: '/dashboard/roles', 
    icon: '👔', 
    label: 'Role Management',
    permission: 'manage_roles', // Only admins can manage roles
    adminOnly: true
  },
  { 
    href: '/dashboard/settings', 
    icon: '⚙️', 
    label: 'Settings',
    permission: 'manage_shop',
    adminOnly: true
  },
];
