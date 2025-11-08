import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';
import styles from './styles/Analytics.module.css';

const Analytics: React.FC = () => {
  const { products } = useStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Prepare data for charts
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.category === product.category);
    if (existing) {
      existing.value += product.currentStock * product.unitPrice;
      existing.quantity += product.currentStock;
    } else {
      acc.push({
        category: product.category,
        value: product.currentStock * product.unitPrice,
        quantity: product.currentStock,
      });
    }
    return acc;
  }, [] as Array<{ category: string; value: number; quantity: number }>);

  const stockTrendData = [
    { month: 'Jan', stock: 4200, value: 52000 },
    { month: 'Feb', stock: 3800, value: 48000 },
    { month: 'Mar', stock: 4500, value: 56000 },
    { month: 'Apr', stock: 4100, value: 51000 },
    { month: 'May', stock: 4800, value: 59000 },
    { month: 'Jun', stock: 5200, value: 64000 },
  ];

  const supplierData = [
    { name: 'Food Supplies Ltd', orders: 45, value: 25000 },
    { name: 'Mediterranean Imports', orders: 32, value: 18500 },
    { name: 'Asian Foods Inc', orders: 28, value: 15200 },
    { name: 'Local Produce Co', orders: 22, value: 12800 },
    { name: 'Beverage Distributors', orders: 18, value: 9500 },
  ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const totalStockValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
  const avgStockLevel = products.reduce((sum, p) => sum + p.currentStock, 0) / products.length;
  const stockTurnover = 4.2; // Mock data
  const lowStockPercentage = (products.filter(p => p.currentStock <= p.minStockLevel).length / products.length) * 100;

  return (
    <div className={`${styles.analytics} fade-in`}>
      <div className={styles.analyticsHeader}>
        <div>
          <h2>Analytics & Insights</h2>
          <p>Track performance and trends</p>
        </div>
        <div className={styles.timeRangeSelector}>
          <button
            className={timeRange === 'week' ? styles.active : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? styles.active : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={timeRange === 'quarter' ? styles.active : ''}
            onClick={() => setTimeRange('quarter')}
          >
            Quarter
          </button>
          <button
            className={timeRange === 'year' ? styles.active : ''}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#dbeafe' }}>
            <DollarSign size={24} color="#2563eb" />
          </div>
          <div className={styles.kpiContent}>
            <p className={styles.kpiLabel}>Total Stock Value</p>
            <h3 className={styles.kpiValue}>£{totalStockValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</h3>
            <div className={`${styles.kpiTrend} ${styles.positive}`}>
              <TrendingUp size={14} />
              <span>+12.5% vs last period</span>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#d1fae5' }}>
            <TrendingUp size={24} color="#10b981" />
          </div>
          <div className={styles.kpiContent}>
            <p className={styles.kpiLabel}>Stock Turnover Rate</p>
            <h3 className={styles.kpiValue}>{stockTurnover}x</h3>
            <div className={`${styles.kpiTrend} ${styles.positive}`}>
              <TrendingUp size={14} />
              <span>+0.3 vs last period</span>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#fef3c7' }}>
            <Calendar size={24} color="#f59e0b" />
          </div>
          <div className={styles.kpiContent}>
            <p className={styles.kpiLabel}>Avg Stock Level</p>
            <h3 className={styles.kpiValue}>{avgStockLevel.toFixed(0)} units</h3>
            <div className={`${styles.kpiTrend} ${styles.negative}`}>
              <TrendingDown size={14} />
              <span>-5.2% vs last period</span>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#fee2e2' }}>
            <TrendingDown size={24} color="#dc2626" />
          </div>
          <div className={styles.kpiContent}>
            <p className={styles.kpiLabel}>Low Stock Items</p>
            <h3 className={styles.kpiValue}>{lowStockPercentage.toFixed(1)}%</h3>
            <div className={`${styles.kpiTrend} ${styles.negative}`}>
              <TrendingUp size={14} />
              <span>+2.1% vs last period</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Stock Value by Category</h3>
            <p>Distribution of inventory value</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.category}: £${entry.value.toFixed(0)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `£${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Stock Trend Over Time</h3>
            <p>Monthly stock levels and value</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#2563eb" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="stock"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', r: 5 }}
                name="Stock Units"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                name="Stock Value (£)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
          <div className={styles.chartHeader}>
            <h3>Top Suppliers Performance</h3>
            <p>Orders and value by supplier</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplierData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#2563eb" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#2563eb" name="Number of Orders" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="value" fill="#10b981" name="Total Value (£)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Stock Quantity by Category</h3>
            <p>Total units in stock</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis type="category" dataKey="category" stroke="#6b7280" width={120} />
              <Tooltip />
              <Bar dataKey="quantity" name="Quantity" radius={[0, 8, 8, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.insightsSection}>
        <h3>Key Insights & Recommendations</h3>
        <div className={styles.insightsGrid}>
          <div className={`${styles.insightCard} ${styles.success}`}>
            <div className={styles.insightIcon}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.insightContent}>
              <h4>Stock Value Growing</h4>
              <p>Your total stock value has increased by 12.5% this period. Consider reviewing your purchasing strategy to maintain optimal levels.</p>
            </div>
          </div>

          <div className={`${styles.insightCard} ${styles.warning}`}>
            <div className={styles.insightIcon}>
              <TrendingDown size={24} />
            </div>
            <div className={styles.insightContent}>
              <h4>Low Stock Increasing</h4>
              <p>The percentage of low-stock items has risen. Generate an order report to restock critical items before they run out.</p>
            </div>
          </div>

          <div className={`${styles.insightCard} ${styles.info}`}>
            <div className={styles.insightIcon}>
              <DollarSign size={24} />
            </div>
            <div className={styles.insightContent}>
              <h4>Supplier Optimization</h4>
              <p>Food Supplies Ltd represents 35% of your orders. Consider negotiating bulk discounts for better pricing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

