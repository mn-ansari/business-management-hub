# Role Management System - Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐  ┌─────────────┐ │
│  │   Onboarding     │    │  Role Management │  │  Employee   │ │
│  │   (Step 0)       │    │  Dashboard Page  │  │  Dashboard  │ │
│  │ Role Setup       │    │  Settings        │  │  Settings   │ │
│  └──────────────────┘    └──────────────────┘  └─────────────┘ │
│                                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Layer     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼──────┐      ┌──────▼──────┐      ┌─────▼─────┐
    │ Roles    │      │Permissions  │      │ Employees │
    │ API      │      │ API         │      │ API       │
    │ (6 EP)   │      │ (1 EP)      │      │ (4 EP)    │
    └───┬──────┘      └───┬────────┘       └─────┬─────┘
        │                  │                      │
        └──────────────────┼──────────────────────┘
                           │
                  ┌────────▼────────┐
                  │  Authentication │
                  │  & Authorization│
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼──────┐     ┌─────▼─────┐    ┌─────▼──────┐
    │ Database │     │  bcrypt   │    │   JWT      │
    │  MySQL   │     │  Password │    │  Token     │
    │          │     │  Hashing  │    │            │
    └──────────┘     └───────────┘    └────────────┘
```

## Data Flow Diagram

### User Registration & First Login Flow

```
┌──────────────┐
│   New User   │
│   Registers  │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│   Create Account    │
│   (Email, Password) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   First Login       │
│   Redirect to       │
│   Onboarding       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   Onboarding Step 0             │
│   ROLE SETUP (NEW!)             │
│   [Admin sees role wizard]       │
└──────┬──────────────────────────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────────┐        ┌───────────────────┐
│  Select Predefined│        │  Create Custom    │
│  Roles (4 options)         │  Role             │
└──────┬───────────┘        └─────┬─────────────┘
       │                           │
       └──────────────┬────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │ Create Roles in  │
            │ Database         │
            │ + Role-Perms     │
            │   Links          │
            └──────┬───────────┘
                   │
                   ▼
            ┌──────────────────┐
            │ Next: Shop Info  │
            │ (Step 1)         │
            └──────────────────┘
```

### Role Permission Assignment Flow

```
┌──────────────────────────────────┐
│  Admin wants to create role      │
└──────────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Settings →           │
    │ User Roles Management│
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Click: Create New    │
    │ Role                 │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Enter:               │
    │ - Role Name          │
    │ - Description        │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Select Permissions   │
    │ (Grouped by Category)│
    │                      │
    │ Dashboard (2)        │
    │ Products (5)         │
    │ Sales (5)            │
    │ Customers (4)        │
    │ Admin (3)            │
    │ Settings (2)         │
    │ Total: 24            │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Save Role:           │
    │ 1. Create roles row  │
    │ 2. Create perms rows │
    │ 3. Link via junction │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Role ready for       │
    │ employee assignment  │
    └──────────────────────┘
```

### Employee Assignment Flow

```
┌──────────────────────────────────┐
│  Admin creates new employee      │
└──────────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Settings →           │
    │ Employee Management  │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Click: + Add Employee│
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Enter:               │
    │ - Full Name          │
    │ - Email              │
    │ - Password           │
    │ - Select Role        │
    │   (Dropdown)         │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Validate:            │
    │ - Email unique?      │
    │ - Password strong?   │
    │ - Role exists?       │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Hash password with   │
    │ bcrypt               │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Store in database:   │
    │ users table          │
    │ - email              │
    │ - hashed_password    │
    │ - full_name          │
    │ - role_id (FK)       │
    │ - is_first_login=true│
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Employee can login   │
    │ with inherited       │
    │ role permissions     │
    └──────────────────────┘
```

## Database Schema Relationships

```
┌─────────────────────────┐
│       SHOPS             │
├─────────────────────────┤
│ id (PK)                 │
│ shop_name               │
│ owner_name              │
│ ...                     │
└────────────┬────────────┘
             │
             │ 1:M
             │
    ┌────────▼──────────────────┐
    │       USERS                │
    ├────────────────────────────┤
    │ id (PK)                    │
    │ email                      │
    │ password (hashed)          │
    │ full_name                  │
    │ role_id (FK) ──────┐       │
    │ shop_id (FK) ─┐    │       │
    │ is_first_login│    │       │
    │ role (ENUM)   │    │       │
    └────────────────┼────┼──────┘
                     │    │
                     │    │ 1:M (new)
                     │    │
            ┌────────▼────▼────────────────┐
            │       ROLES                  │
            ├──────────────────────────────┤
            │ id (PK)                      │
            │ shop_id (FK, unique)         │
            │ role_name                    │
            │ description                  │
            │ is_system (Boolean)          │
            │ created_at                   │
            └────────┬─────────────────────┘
                     │
                     │ M:M via junction
                     │
            ┌────────▼────────────────────┐
            │  ROLE_PERMISSIONS (NEW)     │
            ├──────────────────────────────┤
            │ id (PK)                      │
            │ role_id (FK)         ──┐     │
            │ permission_id (FK) ──┐│     │
            └────────────────────────┼┼────┘
                                     ││
                    ┌────────────────┘│
                    │                 │
            ┌───────▼───────────────────┐
            │  PERMISSIONS (NEW)        │
            ├───────────────────────────┤
            │ id (PK)                   │
            │ permission_key (UNIQUE)   │
            │ permission_name           │
            │ description               │
            │ category                  │
            └───────────────────────────┘
```

## Permission Category Structure

```
PERMISSIONS (24 Total)
│
├── DASHBOARD (2)
│   ├── view_dashboard
│   └── view_stats
│
├── PRODUCTS (5)
│   ├── view_products
│   ├── create_product
│   ├── edit_product
│   ├── delete_product
│   └── manage_stock
│
├── SALES (5)
│   ├── view_sales
│   ├── create_sale
│   ├── edit_sale
│   ├── delete_sale
│   └── view_reports
│
├── CUSTOMERS (4)
│   ├── view_customers
│   ├── create_customer
│   ├── edit_customer
│   └── delete_customer
│
├── ADMINISTRATION (3)
│   ├── manage_employees
│   ├── manage_roles
│   └── manage_permissions
│
└── SETTINGS (2)
    ├── manage_shop
    └── view_settings
```

## Multi-Tenant Isolation

```
┌─────────────────────────────────────────────────────────┐
│                    System Database                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │                SHOP A                            │  │
│  │                                                  │  │
│  │  USERS              ROLES                        │  │
│  │  ├─ Admin (ID:1)    ├─ Manager (ID:11)           │  │
│  │  ├─ Emp1 (ID:2)     └─ Salesperson (ID:12)       │  │
│  │  └─ Emp2 (ID:3)                                  │  │
│  │                     PERMISSIONS                  │  │
│  │                     └─ Shared pool (24)          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │                SHOP B                            │  │
│  │                                                  │  │
│  │  USERS              ROLES                        │  │
│  │  ├─ Admin (ID:4)    ├─ Manager (ID:20)           │  │
│  │  ├─ Emp3 (ID:5)     ├─ Salesperson (ID:21)       │  │
│  │  ├─ Emp4 (ID:6)     └─ DeliveryMan (ID:22)       │  │
│  │  └─ Emp5 (ID:7)                                  │  │
│  │                     PERMISSIONS                  │  │
│  │                     └─ Shared pool (24)          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Notes:                                                  │
│  • Each shop has isolated user accounts                 │
│  • Each shop manages own roles                          │
│  • Permissions are system-wide but                      │
│    role assignments are per-shop                        │
│  • Users can only see data within their shop            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## API Request Flow

```
┌─────────────┐
│ Client App  │
└──────┬──────┘
       │ HTTP Request
       │ + JWT Token
       ▼
┌─────────────────────────────┐
│ API Route Handler           │
├─────────────────────────────┤
│ 1. Extract token            │
│ 2. Verify JWT               │
│ 3. Get user info            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Authorization Check         │
├─────────────────────────────┤
│ 1. Is user authenticated?   │
│ 2. Is user admin?           │
│ 3. Does user own resource?  │
└──────┬──────────────────────┘
       │
       ├─── No ──────────────────► 401/403 Error
       │
       │ Yes
       ▼
┌─────────────────────────────┐
│ Database Query              │
├─────────────────────────────┤
│ 1. Execute operation        │
│ 2. Validate constraints     │
│ 3. Maintain data integrity  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Response to Client          │
├─────────────────────────────┤
│ 1. Success or error         │
│ 2. Data if applicable       │
│ 3. Status code              │
└─────────────────────────────┘
```

## Predefined Role Capabilities Matrix

```
Permission              │ Manager │ Sales │ Delivery │ Employee
────────────────────────┼─────────┼───────┼──────────┼──────────
VIEW DASHBOARD          │   ✓     │   ✓   │    ✓     │    ✓
VIEW STATS              │   ✓     │   ✓   │    ✗     │    ✗
VIEW PRODUCTS           │   ✓     │   ✓   │    ✗     │    ✓
CREATE PRODUCT          │   ✓     │   ✗   │    ✗     │    ✗
EDIT PRODUCT            │   ✓     │   ✗   │    ✗     │    ✗
DELETE PRODUCT          │   ✓     │   ✗   │    ✗     │    ✗
MANAGE STOCK            │   ✓     │   ✗   │    ✗     │    ✗
VIEW SALES              │   ✓     │   ✓   │    ✓     │    ✗
CREATE SALE             │   ✓     │   ✓   │    ✗     │    ✗
EDIT SALE               │   ✓     │   ✓   │    ✗     │    ✗
DELETE SALE             │   ✓     │   ✗   │    ✗     │    ✗
VIEW REPORTS            │   ✓     │   ✓   │    ✗     │    ✗
VIEW CUSTOMERS          │   ✓     │   ✓   │    ✓     │    ✓
CREATE CUSTOMER         │   ✓     │   ✓   │    ✗     │    ✗
EDIT CUSTOMER           │   ✓     │   ✓   │    ✗     │    ✗
DELETE CUSTOMER         │   ✓     │   ✗   │    ✗     │    ✗
MANAGE EMPLOYEES        │   ✗     │   ✗   │    ✗     │    ✗
MANAGE ROLES            │   ✗     │   ✗   │    ✗     │    ✗
MANAGE PERMISSIONS      │   ✗     │   ✗   │    ✗     │    ✗
MANAGE SHOP             │   ✗     │   ✗   │    ✗     │    ✗
VIEW SETTINGS           │   ✗     │   ✗   │    ✗     │    ✗
```

## Security Layers

```
┌──────────────────────────────────────────────────────┐
│ Layer 1: Authentication                              │
│ ├─ JWT Token validation                              │
│ ├─ Token expiry check (7 days)                       │
│ └─ Cookie-based session                              │
├──────────────────────────────────────────────────────┤
│ Layer 2: Authorization                               │
│ ├─ Admin-only endpoint checks                        │
│ ├─ Shop ownership verification                       │
│ └─ Resource ownership validation                     │
├──────────────────────────────────────────────────────┤
│ Layer 3: Data Protection                             │
│ ├─ Password hashing (bcrypt)                         │
│ ├─ SQL injection prevention (parameterized queries)  │
│ └─ Shop-level data isolation                         │
├──────────────────────────────────────────────────────┤
│ Layer 4: Business Logic                              │
│ ├─ System role immutability                          │
│ ├─ Email uniqueness validation                       │
│ └─ Cascade delete safety                             │
└──────────────────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ Scalable role management
- ✅ Secure multi-tenant isolation
- ✅ Clear permission boundaries
- ✅ Future extensibility
- ✅ Admin control and flexibility
