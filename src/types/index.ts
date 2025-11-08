export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  siteId: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  code: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderQuantity: number;
  unitPrice: number;
  supplier: string;
  lastUpdated: Date;
  siteId: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  date: Date;
  dueDate: Date;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  totalAmount: number;
  items: InvoiceItem[];
  siteId: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StockTake {
  id: string;
  date: Date;
  performedBy: string;
  status: 'in-progress' | 'completed' | 'approved';
  items: StockTakeItem[];
  discrepancies: number;
  siteId: string;
}

export interface StockTakeItem {
  productId: string;
  productName: string;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  date: Date;
  reason: string;
  performedBy: string;
  siteId: string;
}

export interface OrderReport {
  id: string;
  generatedDate: Date;
  items: OrderReportItem[];
  totalItems: number;
  estimatedCost: number;
  status: 'draft' | 'submitted' | 'ordered';
  siteId: string;
}

export interface OrderReportItem {
  productId: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  recommendedOrderQuantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  pendingInvoices: number;
  stockValue: number;
  recentMovements: StockMovement[];
  topProducts: Array<{ name: string; quantity: number }>;
}

