# Role & Permission Management System

## Overview
The Business Management Hub now includes a comprehensive role-based access control (RBAC) system that allows administrators to create custom user roles and assign granular permissions to control what each team member can access and do.

## Key Features

### 1. **First-Time Setup** 
When you first log in as an admin, you'll see the role setup wizard during onboarding:
- Choose from 4 predefined roles: Manager, Salesperson, Delivery Man, Employee
- Create custom roles tailored to your business needs
- Assign specific permissions to each role

### 2. **Predefined Roles**
The system comes with 4 pre-configured roles:

#### Manager
- Full access to dashboard, products, sales, and customers
- Can view reports and statistics
- Cannot manage other employees or system settings

#### Salesperson
- Can view products and customer list
- Can create sales/invoices
- Can view and contribute to reports
- Limited to sales-related activities

#### Delivery Man
- Limited access focused on deliveries
- Can view dashboard and customer information
- Can access sales records
- Cannot create transactions or manage inventory

#### Employee
- Basic access to inventory and customer information
- Can view dashboard
- Can view product and customer data
- Minimal permissions for day-to-day operations

### 3. **Permission Categories**

#### Dashboard
- View Dashboard - Access main dashboard overview
- View Statistics - View sales charts and analytics

#### Products Management
- View Products - Browse product list
- Create Product - Add new products
- Edit Product - Modify product details
- Delete Product - Remove products
- Manage Stock - Update inventory levels

#### Sales Management
- View Sales - See all sales records and invoices
- Create Sale - Generate new invoices
- Edit Sale - Modify existing sales
- Delete Sale - Remove sales records
- View Reports - Access sales analytics

#### Customers
- View Customers - Browse customer list
- Create Customer - Add new customers
- Edit Customer - Update customer info
- Delete Customer - Remove customers

#### Administration
- Manage Employees - Create and manage staff accounts
- Manage Roles - Create and modify role profiles
- Manage Permissions - Assign permissions to roles

#### Settings
- Manage Shop - Edit shop information
- View Settings - Access configuration areas

## How to Use

### Creating Roles During Onboarding

1. **On First Login:**
   - You'll be taken to the onboarding page
   - First step is "Roles" setup
   - Choose predefined roles or create custom ones
   - Click "Skip for Now" to proceed without setting up roles

2. **Predefined Roles:**
   - Check the boxes for roles you want (Manager, Salesperson, etc.)
   - Click "Create Selected" to add them
   - Or create a custom role by clicking "Create Custom Role"

3. **Custom Roles:**
   - Enter a role name
   - Select permissions from the list grouped by category
   - Click "Create Role"
   - You can create multiple custom roles

### Managing Roles After Setup

Access role management from Dashboard Settings:

#### View All Roles
- **Settings → User Roles Management**
- See all active roles and their permission counts
- View which roles are system roles (cannot be deleted)

#### Edit Existing Role
- Click "Edit" on any role card
- Update role name and description
- Add or remove permissions
- Save changes

#### Create New Role
- Click "+ Create New Role"
- Fill in role details
- Assign permissions by category
- Click "Create Role"

#### Delete Role
- Only custom roles can be deleted
- System roles are protected
- Click "Delete" to remove a role

### Managing Employees

Access employee management from Dashboard Settings:

#### Add New Employee
1. Go to **Settings → Employee Management**
2. Click "+ Add Employee"
3. Enter:
   - Full Name
   - Email Address
   - Password
   - Select a Role (optional)
4. Click "Add Employee"

#### Edit Employee
1. Click "Edit" on the employee row
2. Update employee information
3. Change their assigned role
4. Click "Update Employee"

#### Delete Employee
1. Click "Delete" on the employee row
2. Confirm the deletion
3. Employee will be removed from the system

#### Assign Role to Employee
1. When creating or editing an employee
2. Select a role from the "Assign Role" dropdown
3. The employee will inherit all permissions of that role
4. Changes take effect immediately

## Permission Inheritance

- **Role-Based Access:** Employees inherit all permissions assigned to their role
- **No Manual Override:** Individual permission changes apply to the role, affecting all users with that role
- **Centralized Control:** Manage permissions once; all assigned users get the update

## Security Considerations

1. **Admin Protection:** Only administrators can:
   - Create and delete roles
   - Manage employees
   - Assign permissions

2. **System Roles:** Default roles (Manager, Salesperson, etc.) are protected and cannot be deleted

3. **First Login Flag:** New employees are marked with `is_first_login = true` for potential onboarding flows

4. **Password Security:** All passwords are hashed using bcrypt before storage

## Database Structure

### Tables
- `roles` - Role definitions with shop-specific isolation
- `permissions` - System-wide permission definitions
- `role_permissions` - Junction table linking roles to permissions
- `users` - Updated to support role_id and first login tracking

### Key Relationships
- One Role can have many Permissions (many-to-many)
- One Role can be assigned to many Users
- Roles are shop-specific (multi-tenant)

## API Endpoints

### Roles
- `GET /api/roles` - List all roles for shop
- `POST /api/roles` - Create new role
- `GET /api/roles/[id]` - Get role details
- `PUT /api/roles/[id]` - Update role
- `DELETE /api/roles/[id]` - Delete role

### Permissions
- `GET /api/permissions` - List all permissions grouped by category

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees/create` - Create employee
- `GET /api/employees/[id]` - Get employee details
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee

## Best Practices

1. **Create Clear Roles:** Define roles that match your business structure
2. **Minimize Over-Permissioning:** Only grant necessary permissions
3. **Review Regularly:** Audit role permissions quarterly
4. **Use Descriptive Names:** Make role purposes clear to your team
5. **Document Custom Roles:** Keep notes on custom role purposes

## Troubleshooting

**Issue:** Cannot delete a role
- **Solution:** Only custom roles can be deleted. System roles are protected.

**Issue:** Employee not seeing expected features
- **Solution:** Check their assigned role has the necessary permissions. Update the role if needed.

**Issue:** Need to change multiple employees' roles
- **Solution:** Update the role definition - all assigned employees get the new permissions automatically.

## Future Enhancements

Potential improvements for role management:
- Granular resource-level permissions
- Role templates library
- Audit logs for permission changes
- Temporary role elevation
- Time-based permission expiration
