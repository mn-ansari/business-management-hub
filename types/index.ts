export interface Shop {
  id?: number;
  shop_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  business_type?: string;
  tax_id?: string;
  currency?: string;
}

export interface User {
  id?: number;
  email: string;
  password?: string;
  full_name: string;
  role: 'admin' | 'manager' | 'salesperson' | 'delivery_man' | 'employee';
  role_id?: number;
  shop_id?: number;
  is_first_login?: boolean;
}

export interface Role {
  id?: number;
  shop_id: number;
  role_name: string;
  description?: string;
  is_system?: boolean;
  permissions?: number[];
}

export interface Permission {
  id?: number;
  permission_key: string;
  permission_name: string;
  description?: string;
  category?: string;
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
}

export interface Product {
  id?: number;
  shop_id: number;
  product_name: string;
  product_code?: string;
  description?: string;
  category?: string;
  unit?: string;
  purchase_price?: number;
  selling_price: number;
  current_stock?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  is_active?: boolean;
}

export interface Customer {
  id?: number;
  shop_id: number;
  customer_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface Sale {
  id?: number;
  shop_id: number;
  invoice_number: string;
  customer_id?: number;
  customer_name?: string;
  sale_date: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  notes?: string;
  items: SaleItem[];
}

export interface SaleItem {
  id?: number;
  sale_id?: number;
  product_id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
