-- Business Management Hub Database Schema
-- Multi-tenant SaaS architecture

CREATE DATABASE IF NOT EXISTS business_management_hub;
USE business_management_hub;

-- Roles table (Role profiles: Manager, Salesperson, Delivery Man, Employee, etc.)
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_shop_roles (shop_id),
    UNIQUE KEY unique_shop_role (shop_id, role_name)
);

-- Permissions table
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    permission_key VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

-- Role Permissions junction table
CREATE TABLE role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Users table (Shop owners, managers)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT,
    role ENUM('admin', 'manager', 'salesperson', 'delivery_man', 'employee') DEFAULT 'admin',
    shop_id INT,
    is_first_login BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_shop_id (shop_id),
    INDEX idx_role_id (role_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Shops table (Multi-tenant)
CREATE TABLE shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    business_type VARCHAR(100),
    tax_id VARCHAR(100),
    logo_url VARCHAR(500),
    currency VARCHAR(10) DEFAULT 'PKR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_shop_name (shop_name)
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100),
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'pcs',
    purchase_price DECIMAL(10, 2) DEFAULT 0.00,
    selling_price DECIMAL(10, 2) NOT NULL,
    current_stock INT DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_shop_products (shop_id, product_name),
    INDEX idx_product_code (product_code)
);

-- Customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    total_purchases DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_shop_customers (shop_id, customer_name)
);

-- Sales/Invoices table
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT,
    customer_name VARCHAR(255),
    sale_date DATE NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'bank_transfer', 'other') DEFAULT 'cash',
    payment_status ENUM('paid', 'pending', 'partial') DEFAULT 'paid',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_shop_sales (shop_id, sale_date),
    INDEX idx_invoice (invoice_number)
);

-- Sale items/details
CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_sale_items (sale_id)
);

-- Stock movements/history
CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    product_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_stock_movements (shop_id, product_id, created_at)
);

-- Add foreign key to users table
ALTER TABLE users
ADD FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;

-- Insert default permissions
INSERT IGNORE INTO permissions (permission_key, permission_name, description, category) VALUES
-- Dashboard Permissions
('view_dashboard', 'View Dashboard', 'Access to main dashboard and overview', 'Dashboard'),
('view_stats', 'View Statistics', 'View sales statistics and reports', 'Dashboard'),

-- Product Management
('view_products', 'View Products', 'View product list and details', 'Products'),
('create_product', 'Create Product', 'Add new products to inventory', 'Products'),
('edit_product', 'Edit Product', 'Modify existing products', 'Products'),
('delete_product', 'Delete Product', 'Remove products from inventory', 'Products'),
('manage_stock', 'Manage Stock', 'Update stock levels', 'Products'),

-- Sales Management
('view_sales', 'View Sales', 'View sales records and invoices', 'Sales'),
('create_sale', 'Create Sale', 'Create new sales/invoices', 'Sales'),
('edit_sale', 'Edit Sale', 'Modify sales records', 'Sales'),
('delete_sale', 'Delete Sale', 'Delete sales records', 'Sales'),
('view_reports', 'View Reports', 'Access sales reports and analytics', 'Sales'),

-- Customer Management
('view_customers', 'View Customers', 'View customer list and details', 'Customers'),
('create_customer', 'Create Customer', 'Add new customers', 'Customers'),
('edit_customer', 'Edit Customer', 'Modify customer information', 'Customers'),
('delete_customer', 'Delete Customer', 'Remove customers', 'Customers'),

-- Employee Management
('manage_employees', 'Manage Employees', 'Create and manage employee accounts', 'Administration'),
('manage_roles', 'Manage Roles', 'Create and manage user roles/profiles', 'Administration'),
('manage_permissions', 'Manage Permissions', 'Assign permissions to roles', 'Administration'),

-- Shop Management
('manage_shop', 'Manage Shop', 'Edit shop information and settings', 'Settings'),
('view_settings', 'View Settings', 'Access shop settings', 'Settings');
