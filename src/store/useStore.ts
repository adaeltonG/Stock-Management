import { create } from 'zustand';
import { User, Site, Product, Invoice, StockTake, DashboardStats } from '../types';

interface AppState {
  // Auth
  user: User | null;
  selectedSite: Site | null;
  sites: Site[];
  isAuthenticated: boolean;
  
  // Data
  products: Product[];
  invoices: Invoice[];
  stockTakes: StockTake[];
  dashboardStats: DashboardStats | null;
  
  // UI State
  currentTab: string;
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  
  // Actions
  login: (username: string, password: string, siteId: string) => Promise<void>;
  logout: () => void;
  setSelectedSite: (site: Site) => void;
  setCurrentTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  fetchProducts: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

// Mock data for demonstration
const mockSites: Site[] = [
  { id: '1', name: 'NBC Universal', location: 'London', code: 'NBC-01' },
  { id: '2', name: 'North Branch', location: 'Manchester', code: 'MAN-01' },
  { id: '3', name: 'South Branch', location: 'Brighton', code: 'BTN-01' },
];

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'BEV-001',
    name: 'Diet Coke',
    description: 'Diet Coca-Cola 330ml can',
    category: 'Soft Drinks',
    unit: 'can',
    currentStock: 85,
    minStockLevel: 100,
    maxStockLevel: 500,
    reorderQuantity: 200,
    unitPrice: 0.85,
    supplier: 'Coca-Cola Beverages',
    lastUpdated: new Date(),
    siteId: '1',
  },
  {
    id: '2',
    sku: 'BEV-002',
    name: 'Regular Coke',
    description: 'Coca-Cola 330ml can',
    category: 'Soft Drinks',
    unit: 'can',
    currentStock: 120,
    minStockLevel: 100,
    maxStockLevel: 500,
    reorderQuantity: 200,
    unitPrice: 0.85,
    supplier: 'Coca-Cola Beverages',
    lastUpdated: new Date(),
    siteId: '1',
  },
  {
    id: '3',
    sku: 'BEV-003',
    name: 'Can of Water 330ml',
    description: 'Still mineral water 330ml can',
    category: 'Water',
    unit: 'can',
    currentStock: 45,
    minStockLevel: 80,
    maxStockLevel: 400,
    reorderQuantity: 150,
    unitPrice: 0.65,
    supplier: 'Beverage Distributors',
    lastUpdated: new Date(),
    siteId: '1',
  },
  {
    id: '4',
    sku: 'ALC-001',
    name: 'Peroni Beer',
    description: 'Peroni Nastro Azzurro 330ml bottle',
    category: 'Alcoholic Beverages',
    unit: 'bottle',
    currentStock: 35,
    minStockLevel: 60,
    maxStockLevel: 300,
    reorderQuantity: 120,
    unitPrice: 2.45,
    supplier: 'Premium Drinks Ltd',
    lastUpdated: new Date(),
    siteId: '1',
  },
  {
    id: '5',
    sku: 'ALC-002',
    name: 'Spy Valley White Wine',
    description: 'Spy Valley Sauvignon Blanc 750ml',
    category: 'Alcoholic Beverages',
    unit: 'bottle',
    currentStock: 18,
    minStockLevel: 25,
    maxStockLevel: 100,
    reorderQuantity: 40,
    unitPrice: 12.99,
    supplier: 'Wine Merchants',
    lastUpdated: new Date(),
    siteId: '1',
  },
  {
    id: '6',
    sku: 'BEV-004',
    name: 'Fentimans 250ml Soft Drink Bottle',
    description: 'Fentimans premium soft drink 250ml',
    category: 'Soft Drinks',
    unit: 'bottle',
    currentStock: 55,
    minStockLevel: 50,
    maxStockLevel: 200,
    reorderQuantity: 80,
    unitPrice: 1.85,
    supplier: 'Premium Drinks Ltd',
    lastUpdated: new Date(),
    siteId: '1',
  },
  {
    id: '7',
    sku: 'SNK-001',
    name: 'Biscuit',
    description: 'Assorted premium biscuits pack',
    category: 'Snacks',
    unit: 'pack',
    currentStock: 92,
    minStockLevel: 60,
    maxStockLevel: 250,
    reorderQuantity: 100,
    unitPrice: 1.25,
    supplier: 'Snack Supplies Co',
    lastUpdated: new Date(),
    siteId: '1',
  },
  {
    id: '8',
    sku: 'ALC-003',
    name: 'Estrela Beer Bottle',
    description: 'Estrela Galicia premium lager 330ml',
    category: 'Alcoholic Beverages',
    unit: 'bottle',
    currentStock: 28,
    minStockLevel: 50,
    maxStockLevel: 250,
    reorderQuantity: 100,
    unitPrice: 2.35,
    supplier: 'Premium Drinks Ltd',
    lastUpdated: new Date(),
    siteId: '1',
  },
  {
    id: '9',
    sku: 'SNK-002',
    name: 'Popcorn',
    description: 'Gourmet popcorn variety pack',
    category: 'Snacks',
    unit: 'pack',
    currentStock: 68,
    minStockLevel: 50,
    maxStockLevel: 200,
    reorderQuantity: 80,
    unitPrice: 1.95,
    supplier: 'Snack Supplies Co',
    lastUpdated: new Date(),
    siteId: '1',
  },
  {
    id: '10',
    sku: 'SNK-003',
    name: 'British Crisps',
    description: 'Premium British crisps selection',
    category: 'Snacks',
    unit: 'pack',
    currentStock: 15,
    minStockLevel: 40,
    maxStockLevel: 200,
    reorderQuantity: 100,
    unitPrice: 1.15,
    supplier: 'Snack Supplies Co',
    lastUpdated: new Date(),
    siteId: '1',
  },
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    supplier: 'Coca-Cola Beverages',
    date: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    status: 'pending',
    totalAmount: 510.00,
    items: [
      { productId: '1', productName: 'Diet Coke', quantity: 200, unitPrice: 0.85, totalPrice: 170.00 },
      { productId: '2', productName: 'Regular Coke', quantity: 400, unitPrice: 0.85, totalPrice: 340.00 },
    ],
    siteId: '1',
  },
];

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  selectedSite: null,
  sites: mockSites,
  isAuthenticated: false,
  products: [],
  invoices: [],
  stockTakes: [],
  dashboardStats: null,
  currentTab: 'dashboard',
  searchQuery: '',
  selectedCategory: 'all',
  isLoading: false,

  // Actions
  login: async (username: string, password: string, siteId: string) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const site = mockSites.find(s => s.id === siteId);
    const user: User = {
      id: '1',
      username,
      email: `${username}@sodexo.com`,
      role: 'admin',
      siteId,
    };
    
    set({
      user,
      selectedSite: site || null,
      isAuthenticated: true,
      isLoading: false,
    });
    
    // Fetch initial data
    get().fetchProducts();
    get().fetchInvoices();
    get().fetchDashboardStats();
  },

  logout: () => {
    set({
      user: null,
      selectedSite: null,
      isAuthenticated: false,
      products: [],
      invoices: [],
      stockTakes: [],
      dashboardStats: null,
    });
  },

  setSelectedSite: (site: Site) => {
    set({ selectedSite: site });
    // Refetch data for new site
    get().fetchProducts();
    get().fetchInvoices();
    get().fetchDashboardStats();
  },

  setCurrentTab: (tab: string) => set({ currentTab: tab }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),

  fetchProducts: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ products: mockProducts, isLoading: false });
  },

  fetchInvoices: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ invoices: mockInvoices, isLoading: false });
  },

  fetchDashboardStats: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const products = mockProducts;
    const lowStockItems = products.filter(p => p.currentStock <= p.minStockLevel).length;
    const stockValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
    
    const stats: DashboardStats = {
      totalProducts: products.length,
      lowStockItems,
      pendingInvoices: mockInvoices.filter(i => i.status === 'pending').length,
      stockValue,
      recentMovements: [],
      topProducts: products
        .sort((a, b) => b.currentStock - a.currentStock)
        .slice(0, 5)
        .map(p => ({ name: p.name, quantity: p.currentStock })),
    };
    
    set({ dashboardStats: stats, isLoading: false });
  },

  updateProduct: async (product: Product) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      products: state.products.map(p => p.id === product.id ? product : p),
      isLoading: false,
    }));
  },

  addProduct: async (product: Omit<Product, 'id'>) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    
    set(state => ({
      products: [...state.products, newProduct],
      isLoading: false,
    }));
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      products: state.products.filter(p => p.id !== id),
      isLoading: false,
    }));
  },
}));

