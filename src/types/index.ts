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

// Recipe Builder Types

export interface Ingredient {
  id: string;
  name: string;
  baseUnit: 'g' | 'ml' | 'each';
  yieldPercent: number; // e.g., 0.8 for 80%
  category?: string;
}

export interface PurchaseItem {
  id: string;
  ingredientId: string;
  ingredientName: string;
  supplierName: string;
  purchasePrice: number; // in pence/cents to avoid floats
  purchaseQuantity: number;
  purchaseUnit: string; // 'kg', 'g', 'l', 'ml', 'each'
  costPerBaseUnit: number; // Calculated: price per gram/ml/each
  lastUpdated: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  isSubRecipe: boolean;
  yieldQuantity: number; // e.g., 4 portions
  yieldUnit: string; // 'portions', 'liters', 'servings'
  prepTime?: number; // minutes
  cookTime?: number; // minutes
  instructions?: string;
  totalCost: number; // Calculated
  costPerPortion: number; // Calculated
  imageUrl?: string;
  createdDate: Date;
  lastUpdated: Date;
}

export interface RecipeLineItem {
  id: string;
  recipeId: string;
  itemId: string; // Can be Ingredient.id or Recipe.id (for sub-recipes)
  itemType: 'ingredient' | 'recipe';
  itemName: string;
  quantity: number;
  unit: string; // 'cup', 'tbsp', 'g', 'oz', etc.
  cost: number; // Calculated
  notes?: string;
}

export interface UnitConversion {
  id: string;
  ingredientId: string;
  unitName: string; // 'cup', 'tbsp', 'tsp'
  toBaseUnitFactor: number; // e.g., 120 (if baseUnit is 'g')
  description?: string; // e.g., "1 cup of flour"
}

