# Sodexo Stock Control System

A modern, fast, and intuitive stock control system built with React, TypeScript, and designed for optimal user experience.

## Features

### 🎯 Core Functionality
- **Stock Management**: Complete inventory tracking with real-time updates
- **Invoice Management**: Track and manage supplier invoices
- **Stock Take**: Comprehensive stock counting and variance reporting
- **Order Reports**: Automated order generation based on minimum stock levels
- **Analytics**: Visual insights with interactive charts and trends
- **Multi-Site Support**: Manage multiple locations from one interface

### 💎 Key Highlights
- **Fast & Responsive**: No page reloads, instant UI updates
- **Advanced Search**: Find products by name, SKU, description, or category
- **Low Stock Warnings**: Automatic alerts when stock falls below minimum levels
- **Beautiful UI**: Clean design with blue/green color scheme and white background
- **Role-Based Access**: Admin, Manager, and Staff user levels

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (for lightning-fast development)
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Custom CSS with modern design patterns

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Default Login
For testing, you can use any username/password and select a site from the dropdown.

## Project Structure

```
sodexo-stock-control/
├── src/
│   ├── components/          # React components
│   │   ├── Login.tsx        # Login page with site selection
│   │   ├── Layout.tsx       # Main layout with navigation
│   │   ├── Dashboard.tsx    # Admin dashboard with KPIs
│   │   ├── StockManagement.tsx  # Product management
│   │   ├── Reports.tsx      # Reports and stock take
│   │   └── Analytics.tsx    # Charts and insights
│   ├── store/              # State management
│   │   └── useStore.ts     # Zustand store
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Type definitions
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Key Features Breakdown

### 📊 Admin Dashboard
- Total products count
- Low stock alerts with visual indicators
- Pending invoices tracker
- Total stock value calculator
- Quick action buttons
- Top products by stock level

### 📦 Stock Management
- **Advanced Search**: Search by name, SKU, or description
- **Filters**: Category, stock level, price sorting
- **Low Stock Filter**: Quickly find items needing reorder
- **Product Cards**: Visual stock level indicators
- **Add/Edit Products**: Full CRUD operations
- **Import/Export**: Bulk operations support

### 📋 Reports
- **Stock Take**: Start new counts, track discrepancies
- **Order Reports**: Auto-generate based on min stock levels
- **Invoice Management**: Track pending, approved, and paid invoices
- **Stock Movements**: Complete audit trail of all transactions

### 📈 Analytics
- **KPI Cards**: Stock value, turnover rate, avg levels
- **Visual Charts**: 
  - Stock value by category (Pie chart)
  - Stock trend over time (Line chart)
  - Supplier performance (Bar chart)
  - Category distribution (Horizontal bar)
- **Insights**: AI-powered recommendations
- **Time Ranges**: Week, month, quarter, year views

## Color Scheme

- **Primary Blue**: `#2563eb` (Buttons, links, primary actions)
- **Success Green**: `#10b981` (Success states, positive trends)
- **Background**: `#ffffff` (Pure white for main background)
- **Text**: `#1a1a1a` (Primary text)
- **Gray**: `#6b7280` (Secondary text)

## Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## Future Enhancements

### Backend Integration
Currently using mock data. To integrate with a real backend:

1. **Update API calls** in `src/store/useStore.ts`
2. **Replace mock data** with actual API endpoints
3. **Add authentication** with JWT tokens
4. **Connect to PostgreSQL** database

### Recommended Backend Stack
- Node.js + Express + TypeScript
- PostgreSQL database
- JWT authentication
- RESTful API or GraphQL

### Database Schema (PostgreSQL)
```sql
-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  location VARCHAR(255),
  code VARCHAR(50)
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku VARCHAR(100) UNIQUE,
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  unit VARCHAR(50),
  current_stock INTEGER,
  min_stock_level INTEGER,
  max_stock_level INTEGER,
  reorder_quantity INTEGER,
  unit_price DECIMAL(10,2),
  supplier VARCHAR(255),
  site_id UUID REFERENCES sites(id),
  last_updated TIMESTAMP
);

-- More tables: invoices, stock_takes, stock_movements, users...
```

## Development Tips

- **Hot Module Replacement**: Changes appear instantly without refresh
- **Type Safety**: TypeScript catches errors before runtime
- **Component Structure**: Each feature is self-contained
- **State Management**: Centralized in Zustand store
- **Responsive Design**: Works on mobile, tablet, and desktop

## Support

For issues or questions, please contact the development team.

## License

© 2024 Sodexo. All rights reserved.

