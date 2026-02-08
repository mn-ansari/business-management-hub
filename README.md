# Business Management Hub - SaaS Platform

A complete business management solution for small shops to manage sales, customers, inventory, and generate professional invoices.

## 🌟 Features

- **User Authentication** - Secure login and signup system
- **Multi-tenant Architecture** - Each shop has its own data isolated from others
- **Shop Onboarding** - Easy setup wizard for new shops
- **Product Management** - Full CRUD operations for products
- **Inventory Tracking** - Real-time stock monitoring with low stock alerts
- **Sales & Invoicing** - Create sales, manage invoices, and export PDFs
- **Customer Management** - Track customers and purchase history
- **Analytics & Reports** - Visual reports with Chart.js showing business insights
- **Role-based Access** - Admin and Manager roles with different permissions
- **PDF Export** - Generate professional invoices in PDF format

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MySQL
- **Charts**: Chart.js, react-chartjs-2
- **PDF Generation**: jsPDF, jspdf-autotable
- **Authentication**: JWT, bcryptjs
- **Notifications**: react-hot-toast

## 📋 Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- MySQL (via XAMPP or standalone)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Database Setup

1. Start your XAMPP MySQL server
2. Open phpMyAdmin or MySQL command line
3. Import the database schema:

```bash
# In MySQL, run:
source "c:/xampp/htdocs/bytes/business management hub/database/schema.sql"
```

Or manually create the database by executing the `database/schema.sql` file.

### 2. Environment Configuration

The `.env.local` file is already created with default settings:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=business_management_hub
JWT_SECRET=your-secret-key-change-this-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Change the `JWT_SECRET` to a secure random string in production!

### 3. Install Dependencies

```bash
cd "c:\xampp\htdocs\bytes\business management hub"
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### First Time Setup

1. **Visit the Homepage** - Go to `http://localhost:3000`
2. **Sign Up** - Click "Get Started" and create your account
3. **Shop Onboarding** - Fill in your shop details (name, address, business type, etc.)
4. **Access Dashboard** - You'll be redirected to your management dashboard

### Managing Your Business

#### Dashboard
- View key metrics: total products, low stock alerts, today's sales, customers
- Quick actions for common tasks
- Recent activity overview

#### Products
- Add new products with details (name, code, price, stock levels)
- Edit existing products
- Delete products (soft delete)
- Set minimum and maximum stock levels

#### Inventory
- View all products with current stock levels
- Filter by "All Products" or "Low Stock" items
- Visual stock status indicators (Good/Medium/Low)
- See total inventory value

#### Sales
- Create new sales with multiple products
- Select customer (optional)
- Apply tax and discounts
- Multiple payment methods (Cash, Card, UPI, Bank Transfer)
- Download invoice as PDF

#### Customers
- Add new customers
- Track customer information
- View total purchases per customer

#### Reports
- Monthly and yearly sales trends
- Sales by category (Doughnut chart)
- Top selling products (Bar chart)
- Product performance table
- Key statistics: total sales, orders, average order value

#### Settings
- Update shop information
- Change contact details
- Modify business settings

## 🔐 User Roles

### Admin
- Full access to all features
- Can manage products, sales, inventory, customers
- Access to reports and analytics
- Can modify shop settings

### Manager (Future Enhancement)
- Limited access to daily operations
- Can create sales and manage inventory
- Cannot modify shop settings

## 📊 Database Schema

The application uses a multi-tenant database architecture:

- **users** - User accounts with roles
- **shops** - Shop information (multi-tenant)
- **products** - Product catalog per shop
- **customers** - Customer database per shop
- **sales** - Sales records with invoice details
- **sale_items** - Individual items in each sale
- **stock_movements** - Inventory movement history

## 🎨 Customization

### Changing Colors
Edit `tailwind.config.js` to customize the primary color scheme.

### Adding Features
The modular structure makes it easy to add new features:
- Add new pages in `app/dashboard/`
- Create API routes in `app/api/`
- Add navigation items in `components/Sidebar.tsx`

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MySQL is running in XAMPP
- Check database credentials in `.env.local`
- Verify database exists: `SHOW DATABASES;`

### Port Already in Use
If port 3000 is occupied:
```bash
npm run dev -- -p 3001
```

### Missing Dependencies
```bash
npm install
```

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use strong passwords
- Enable HTTPS in production
- Set secure cookies in production
- Regular database backups recommended

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
Works with any Node.js hosting:
- Netlify
- AWS
- DigitalOcean
- Heroku

## 📝 Future Enhancements

- [ ] Email notifications for low stock
- [ ] Bulk product import/export
- [ ] Barcode scanner integration
- [ ] Mobile responsive improvements
- [ ] Manager role implementation
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Expense tracking
- [ ] Supplier management
- [ ] Purchase orders

## 🤝 Contributing

This is a portfolio/freelance project template. Feel free to customize for your clients!

## 📄 License

MIT License - Free to use for personal and commercial projects

## 👨‍💻 Developer

Built with ❤️ for small businesses

---

### Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Project Structure

```
business-management-hub/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── onboarding/       # Shop setup
│   └── page.tsx          # Homepage
├── components/           # Reusable components
├── lib/                  # Utilities
├── types/                # TypeScript types
├── database/             # SQL schema
└── public/               # Static assets
```

## 🎯 Perfect For

- Bakeries
- Grocery Stores
- Retail Shops
- Cafes & Restaurants
- Hardware Stores
- Medical Stores
- Electronics Shops
- Any small business needing inventory management

---

**Need help?** This system is designed to be intuitive and user-friendly. The interface guides you through each process step by step.
