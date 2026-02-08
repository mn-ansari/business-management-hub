-- Make sure role_id column exists in users table
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `role_id` INT NULL,
ADD FOREIGN KEY IF NOT EXISTS `fk_users_role_id` (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL;

-- Delete existing permissions to ensure clean setup
DELETE FROM `permissions` WHERE `permission_key` IN (
  'view_dashboard', 'view_stats', 'view_products', 'view_inventory', 'create_product', 
  'edit_product', 'delete_product', 'manage_stock', 'edit_inventory',
  'view_sales', 'create_sale', 'edit_sale', 'delete_sale', 
  'view_reports', 'view_customers', 'create_customer', 'edit_customer', 'delete_customer', 
  'manage_employees', 'create_employee', 'edit_employee', 'delete_employee',
  'manage_roles', 'create_role', 'edit_role', 'delete_role', 'manage_permissions', 
  'manage_shop', 'edit_shop', 'manage_billing', 'view_settings'
);

-- Insert all tab-based permissions and their features

-- ===== DASHBOARD TAB =====
INSERT INTO `permissions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('view_dashboard', 'View Dashboard', 'Access to Dashboard tab', 'Tabs');

-- ===== PRODUCTS TAB =====
INSERT INTO `permissions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('view_products', 'View Products', 'Access to Products tab', 'Tabs'),
('create_product', 'Add Products', 'Create new products', 'Products'),
('edit_product', 'Edit Products', 'Modify existing products', 'Products'),
('delete_product', 'Delete Products', 'Remove products', 'Products');

-- ===== INVENTORY TAB =====
INSERT INTO `permissions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('view_inventory', 'View Inventory', 'Access to Inventory tab', 'Tabs'),
('edit_inventory', 'Edit Inventory', 'Modify inventory records', 'Inventory'),
('manage_stock', 'Manage Stock Levels', 'Update stock quantities', 'Inventory');

-- ===== SALES TAB =====
INSERT INTO `permissions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('view_sales', 'View Sales', 'Access to Sales tab', 'Tabs'),
('create_sale', 'Add Sales', 'Create new sales/invoices', 'Sales'),
('edit_sale', 'Edit Sales', 'Modify sales records', 'Sales'),
('delete_sale', 'Delete Sales', 'Remove sales records', 'Sales');

-- ===== CUSTOMERS TAB =====
INSERT INTO `permissions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('view_customers', 'View Customers', 'Access to Customers tab', 'Tabs'),
('create_customer', 'Add Customers', 'Create new customers', 'Customers'),
('edit_customer', 'Edit Customers', 'Modify customer information', 'Customers'),
('delete_customer', 'Delete Customers', 'Remove customers', 'Customers');

-- ===== REPORTS TAB =====
INSERT INTO `permissions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('view_reports', 'View Reports', 'Access to Reports tab', 'Tabs');

-- ===== EMPLOYEES TAB (ADMIN ONLY) =====
INSERT INTO `permissions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('manage_employees', 'View Employees', 'Access to Employees tab - Admin only', 'Tabs'),
('create_employee', 'Add Employees', 'Create new employees - Admin only', 'Employees'),
('edit_employee', 'Edit Employees', 'Modify employee information - Admin only', 'Employees'),
('delete_employee', 'Delete Employees', 'Remove employees - Admin only', 'Employees');

-- ===== ROLE MANAGEMENT TAB (ADMIN ONLY) =====
INSERT INTO `permissions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('manage_roles', 'View Roles', 'Access to Role Management tab - Admin only', 'Tabs'),
('create_role', 'Create Roles', 'Create new roles - Admin only', 'Roles'),
('edit_role', 'Edit Roles', 'Modify role settings - Admin only', 'Roles'),
('delete_role', 'Delete Roles', 'Remove roles - Admin only', 'Roles'),
('manage_permissions', 'Manage Permissions', 'Assign permissions to roles - Admin only', 'Roles');

-- ===== SETTINGS TAB (ADMIN ONLY) =====
INSERT INTO `permissions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('manage_shop', 'View Settings', 'Access to Settings tab - Admin only', 'Tabs'),
('edit_shop', 'Edit Shop Settings', 'Modify shop information - Admin only', 'Settings'),
('manage_billing', 'Manage Billing', 'Handle billing and subscription - Admin only', 'Settings');

-- Verification queries
SELECT 'Total Permissions Inserted' as status, COUNT(*) as count FROM permissions
UNION ALL
SELECT 'Tab Permissions:', COUNT(*) FROM permissions WHERE category = 'Tabs'
UNION ALL
SELECT 'Feature Permissions:', COUNT(*) FROM permissions WHERE category != 'Tabs';

-- View permission breakdown by category
SELECT CONCAT('Category: ', category) as status, COUNT(*) as count FROM permissions GROUP BY category ORDER BY category;

