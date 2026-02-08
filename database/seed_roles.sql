-- ============================================
-- SEED DEFAULT ROLES for Business Management Hub
-- ============================================
-- This file creates default roles for shop_id = 1
-- Run this after creating your shop in the application

-- Insert Default Roles
INSERT INTO roles (shop_id, role_name, description, created_at, updated_at) VALUES
(1, 'Manager', 'Full access to all features and settings', NOW(), NOW()),
(1, 'Salesperson', 'Can manage sales, customers, and products', NOW(), NOW()),
(1, 'Delivery Boy', 'Can view and update order status', NOW(), NOW()),
(1, 'Store Assistant', 'Can manage inventory and products', NOW(), NOW());

-- Display created roles
SELECT 'Roles Created Successfully!' as status;
SELECT id, shop_id, role_name, description FROM roles WHERE shop_id = 1;
