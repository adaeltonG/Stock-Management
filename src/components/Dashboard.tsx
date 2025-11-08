import React, { useEffect } from 'react';
import { Package, AlertTriangle, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import styles from './styles/Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { dashboardStats, products, fetchDashboardStats } = useStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel);

  const statsCards = [
    {
      title: 'Total Products',
      value: dashboardStats?.totalProducts || 0,
      icon: Package,
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      title: 'Low Stock Items',
      value: dashboardStats?.lowStockItems || 0,
      icon: AlertTriangle,
      color: '#dc2626',
      bgColor: '#fee2e2',
    },
    {
      title: 'Pending Invoices',
      value: dashboardStats?.pendingInvoices || 0,
      icon: FileText,
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      title: 'Total Stock Value',
      value: `£${(dashboardStats?.stockValue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: '#10b981',
      bgColor: '#d1fae5',
    },
  ];

  return (
    <div className={`${styles.dashboard} fade-in`}>
      <div className={styles.dashboardHeader}>
        <h2>Admin Dashboard</h2>
        <p>Overview of your stock control system</p>
      </div>

      <div className={styles.statsGrid}>
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={styles.statCard} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.statIcon} style={{ backgroundColor: card.bgColor }}>
                <Icon size={24} color={card.color} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>{card.title}</p>
                <h3 className={styles.statValue}>{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.dashboardContent}>
        <div className={`${styles.dashboardSection} ${styles.lowStockSection}`}>
          <div className={styles.sectionHeader}>
            <h3>
              <AlertTriangle size={20} color="#dc2626" />
              Low Stock Alerts
            </h3>
            <span className={`${styles.badge} ${styles.badgeDanger}`}>{lowStockProducts.length} items</span>
          </div>
          <div className={styles.lowStockList}>
            {lowStockProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <Package size={48} color="#9ca3af" />
                <p>All products are well stocked</p>
              </div>
            ) : (
              lowStockProducts.map((product) => {
                const stockPercentage = (product.currentStock / product.minStockLevel) * 100;
                const isVeryLow = stockPercentage < 50;
                
                return (
                  <div key={product.id} className={styles.lowStockItem}>
                    <div className={styles.itemInfo}>
                      <h4>{product.name}</h4>
                      <p>SKU: {product.sku} • {product.category}</p>
                    </div>
                    <div className={styles.itemStock}>
                      <div className={styles.stockProgress}>
                        <div 
                          className={`${styles.progressBar} ${isVeryLow ? styles.critical : styles.warning}`}
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                      </div>
                      <div className={styles.stockInfo}>
                        <span className={`${styles.stockValue} ${isVeryLow ? styles.critical : styles.warning}`}>
                          {product.currentStock} {product.unit}
                        </span>
                        <span className={styles.stockMin}>Min: {product.minStockLevel}</span>
                      </div>
                    </div>
                    <button className={styles.btnReorder}>
                      <TrendingUp size={16} />
                      Reorder {product.reorderQuantity}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={`${styles.dashboardSection} ${styles.topProductsSection}`}>
          <div className={styles.sectionHeader}>
            <h3>
              <TrendingUp size={20} color="#10b981" />
              Top Products by Stock
            </h3>
          </div>
          <div className={styles.topProductsList}>
            {dashboardStats?.topProducts.map((product, index) => (
              <div key={index} className={styles.topProductItem}>
                <div className={styles.productRank}>{index + 1}</div>
                <div className={styles.productDetails}>
                  <p className={styles.productName}>{product.name}</p>
                  <div className={styles.productBar}>
                    <div 
                      className={styles.productBarFill}
                      style={{ 
                        width: `${(product.quantity / (dashboardStats?.topProducts[0]?.quantity || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                <span className={styles.productQuantity}>{product.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.dashboardSection} ${styles.quickActionsSection}`}>
          <div className={styles.sectionHeader}>
            <h3>Quick Actions</h3>
          </div>
          <div className={styles.quickActionsGrid}>
            <button className={`${styles.actionCard} ${styles.actionPrimary}`}>
              <Package size={24} />
              <span>Generate Order Report</span>
            </button>
            <button className={`${styles.actionCard} ${styles.actionSuccess}`}>
              <FileText size={24} />
              <span>Start Stock Take</span>
            </button>
            <button className={`${styles.actionCard} ${styles.actionInfo}`}>
              <TrendingUp size={24} />
              <span>View Analytics</span>
            </button>
            <button className={`${styles.actionCard} ${styles.actionWarning}`}>
              <AlertTriangle size={24} />
              <span>Review Alerts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
