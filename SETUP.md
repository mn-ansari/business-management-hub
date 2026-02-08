# Business Management Hub - Setup Instructions

## Quick Setup Guide

### Step 1: Install Dependencies
Open PowerShell in the project directory and run:
```powershell
npm install
```

### Step 2: Setup Database
1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Click on "SQL" tab
4. Copy and paste the contents of `database/schema.sql`
5. Click "Go" to execute

Alternatively, use MySQL command line:
```bash
mysql -u root -p < "database/schema.sql"
```

### Step 3: Configure Environment
The `.env.local` file is already created. Update if needed:
- DB_HOST=localhost
- DB_USER=root
- DB_PASSWORD= (leave empty for XAMPP default)
- DB_NAME=business_management_hub
- JWT_SECRET=your-secret-key-change-in-production

### Step 4: Run Development Server
```powershell
npm run dev
```

### Step 5: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## First Time Use

1. **Homepage** → Click "Get Started"
2. **Sign Up** → Create your account
3. **Onboarding - Role Setup** → Create user roles for your team (NEW!)
   - Choose predefined roles: Manager, Salesperson, Delivery Man, Employee
   - Or create custom roles with specific permissions
   - Skip if you want to set up later
4. **Onboarding - Basic Info** → Enter your shop details
5. **Onboarding - Address** → Complete address information
6. **Dashboard** → Start managing your business!

## Role Management System

### New Onboarding Step
During first login, admins will see a **Role Setup** step where they can:
- Create predefined roles (Manager, Salesperson, Delivery Man, Employee)
- Create custom roles with tailored permissions
- Assign granular permissions from 24 available options

### Manage Roles After Setup
Go to **Dashboard → Settings → User Roles Management** to:
- View all created roles
- Edit role names and permissions
- Create additional roles
- Delete custom roles

### Manage Employees
Go to **Dashboard → Settings → Employee Management** to:
- Add new employees with email and password
- Assign roles to employees
- Edit employee information
- Delete employees from the system

For detailed information, see `ROLE_MANAGEMENT_GUIDE.md`

## Role Management Features

### Predefined Roles
- **Manager** - Full access to most operations except employee management
- **Salesperson** - Sales and customer focused access
- **Delivery Man** - Limited access for delivery operations
- **Employee** - Basic access to inventory and customers

### Available Permissions (24 total)
- Dashboard: View Dashboard, View Statistics
- Products: View, Create, Edit, Delete, Manage Stock
- Sales: View, Create, Edit, Delete, View Reports
- Customers: View, Create, Edit, Delete
- Administration: Manage Employees, Manage Roles, Manage Permissions
- Settings: Manage Shop, View Settings

## Default Features Available

✅ User Authentication (Login/Signup)
✅ Shop Onboarding
✅ Dashboard with Analytics
✅ Product Management (Add/Edit/Delete)
✅ Inventory Tracking with Stock Alerts
✅ Sales & Invoice Creation
✅ PDF Invoice Export
✅ Customer Management
✅ Reports with Charts
✅ Shop Settings

## Troubleshooting

### Issue: Database Connection Failed
**Solution**: 
- Ensure MySQL is running in XAMPP
- Check database name is `business_management_hub`
- Verify credentials in `.env.local`

### Issue: Port 3000 Already in Use
**Solution**: 
```powershell
npm run dev -- -p 3001
```

### Issue: Module Not Found
**Solution**: 
```powershell
npm install
```

### Issue: Can't Import Schema
**Solution**: 
- Create database manually: `CREATE DATABASE business_management_hub;`
- Use phpMyAdmin to import `schema.sql`

## Building for Production

```powershell
# Build the application
npm run build

# Start production server
npm start
```

## Security Checklist for Production

- [ ] Change JWT_SECRET to a random secure string
- [ ] Update database password
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Enable CORS properly
- [ ] Regular backups
- [ ] Update dependencies regularly

## Need Help?

The application is designed to be user-friendly with:
- Intuitive navigation
- Clear labels and instructions
- Form validation
- Success/error notifications
- Responsive design

---

**Happy Business Management!** 🚀
