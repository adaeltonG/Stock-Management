import React, { useState } from 'react';
import { FileText, Download, Calendar, CheckCircle, Clock, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import styles from './styles/Reports.module.css';

const Reports: React.FC = () => {
  const { products, invoices } = useStore();
  const [activeReport, setActiveReport] = useState<'stocktake' | 'orders' | 'invoices' | 'movements'>('stocktake');

  const generateOrderReport = () => {
    const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel);
    const totalCost = lowStockProducts.reduce((sum, p) => sum + (p.reorderQuantity * p.unitPrice), 0);
    
    return {
      items: lowStockProducts.map(p => ({
        productId: p.id,
        productName: p.name,
        currentStock: p.currentStock,
        minStockLevel: p.minStockLevel,
        recommendedOrderQuantity: p.reorderQuantity,
        unitPrice: p.unitPrice,
        totalPrice: p.reorderQuantity * p.unitPrice,
        supplier: p.supplier,
      })),
      totalItems: lowStockProducts.length,
      estimatedCost: totalCost,
    };
  };

  const orderReport = generateOrderReport();

  return (
    <div className={`${styles.reports} fade-in`}>
      <div className={styles.reportsHeader}>
        <div>
          <h2>Reports & Analytics</h2>
          <p>Generate and view comprehensive reports</p>
        </div>
      </div>

      <div className={styles.reportTabs}>
        <button
          className={`${styles.reportTab} ${activeReport === 'stocktake' ? styles.active : ''}`}
          onClick={() => setActiveReport('stocktake')}
        >
          <CheckCircle size={18} />
          Stock Take
        </button>
        <button
          className={`${styles.reportTab} ${activeReport === 'orders' ? styles.active : ''}`}
          onClick={() => setActiveReport('orders')}
        >
          <TrendingUp size={18} />
          Order Reports
        </button>
        <button
          className={`${styles.reportTab} ${activeReport === 'invoices' ? styles.active : ''}`}
          onClick={() => setActiveReport('invoices')}
        >
          <FileText size={18} />
          Invoice Management
        </button>
        <button
          className={`${styles.reportTab} ${activeReport === 'movements' ? styles.active : ''}`}
          onClick={() => setActiveReport('movements')}
        >
          <Package size={18} />
          Stock Movements
        </button>
      </div>

      <div className={styles.reportContent}>
        {activeReport === 'stocktake' && <StockTakeReport styles={styles} />}
        {activeReport === 'orders' && <OrderReport report={orderReport} styles={styles} />}
        {activeReport === 'invoices' && <InvoiceManagement invoices={invoices} styles={styles} />}
        {activeReport === 'movements' && <StockMovementsReport styles={styles} />}
      </div>
    </div>
  );
};

const StockTakeReport: React.FC<{ styles: any }> = ({ styles }) => {
  const [showNewStockTake, setShowNewStockTake] = useState(false);

  const mockStockTakes = [
    {
      id: '1',
      date: new Date('2024-01-15'),
      performedBy: 'John Smith',
      status: 'completed' as const,
      itemsCount: 45,
      discrepancies: 3,
    },
    {
      id: '2',
      date: new Date('2024-01-10'),
      performedBy: 'Sarah Johnson',
      status: 'approved' as const,
      itemsCount: 42,
      discrepancies: 1,
    },
  ];

  return (
    <div className={styles.reportSection}>
      <div className={styles.sectionActions}>
        <button className={styles.btnPrimaryAction} onClick={() => setShowNewStockTake(true)}>
          <CheckCircle size={20} />
          Start New Stock Take
        </button>
        <button className={styles.btnSecondaryAction}>
          <Download size={20} />
          Export History
        </button>
      </div>

      <div className={styles.stockTakesList}>
        {mockStockTakes.map((stockTake) => (
          <div key={stockTake.id} className={styles.stockTakeCard}>
            <div className={styles.stockTakeHeader}>
              <div>
                <h4>Stock Take #{stockTake.id}</h4>
                <p className={styles.stockTakeDate}>
                  <Calendar size={14} />
                  {stockTake.date.toLocaleDateString('en-GB')}
                </p>
              </div>
              <span className={`${styles.statusBadge} ${
                stockTake.status === 'completed' ? styles.statusCompleted :
                stockTake.status === 'approved' ? styles.statusApproved :
                styles.statusPending
              }`}>
                {stockTake.status === 'completed' && <CheckCircle size={14} />}
                {stockTake.status === 'approved' && <CheckCircle size={14} />}
                {stockTake.status}
              </span>
            </div>

            <div className={styles.stockTakeDetails}>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Performed By</span>
                <span className={styles.detailValue}>{stockTake.performedBy}</span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Items Counted</span>
                <span className={styles.detailValue}>{stockTake.itemsCount}</span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Discrepancies</span>
                <span className={`detail-value ${stockTake.discrepancies > 0 ? 'warning' : 'success'}`}>
                  {stockTake.discrepancies}
                </span>
              </div>
            </div>

            <div className={styles.stockTakeActions}>
              <button className={styles.btnView}>View Details</button>
              <button className={styles.btnDownload}>
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface OrderReportProps {
  report: {
    items: Array<{
      productName: string;
      currentStock: number;
      minStockLevel: number;
      recommendedOrderQuantity: number;
      unitPrice: number;
      totalPrice: number;
      supplier: string;
    }>;
    totalItems: number;
    estimatedCost: number;
  };
  styles: any;
}

const OrderReport: React.FC<OrderReportProps> = ({ report, styles }) => {
  return (
    <div className={styles.reportSection}>
      <div className={styles.orderSummary}>
        <div className={styles.summaryCard}>
          <AlertTriangle size={32} color="#f59e0b" />
          <div>
            <h3>{report.totalItems}</h3>
            <p>Items Need Reordering</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <TrendingUp size={32} color="#10b981" />
          <div>
            <h3>£{report.estimatedCost.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</h3>
            <p>Estimated Order Cost</p>
          </div>
        </div>
      </div>

      <div className={styles.reportActions}>
        <button className={styles.btnPrimaryAction}>
          <Download size={20} />
          Export Order Report
        </button>
        <button className={styles.btnSuccessAction}>
          <CheckCircle size={20} />
          Submit Orders
        </button>
      </div>

      <div className={styles.orderTable}>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Current Stock</th>
              <th>Min Level</th>
              <th>Order Qty</th>
              <th>Unit Price</th>
              <th>Total Cost</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
            {report.items.map((item, index) => (
              <tr key={index}>
                <td className={styles.productName}>{item.productName}</td>
                <td className={`${styles.stockLevel} ${styles.low}`}>{item.currentStock}</td>
                <td>{item.minStockLevel}</td>
                <td className={styles.orderQty}>{item.recommendedOrderQuantity}</td>
                <td>£{item.unitPrice.toFixed(2)}</td>
                <td className={styles.totalPrice}>£{item.totalPrice.toFixed(2)}</td>
                <td>{item.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface InvoiceManagementProps {
  invoices: any[];
  styles: any;
}

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ invoices, styles }) => {
  return (
    <div className={styles.reportSection}>
      <div className={styles.sectionActions}>
        <button className={styles.btnPrimaryAction}>
          <FileText size={20} />
          Add Invoice
        </button>
      </div>

      <div className={styles.invoicesList}>
        {invoices.map((invoice) => (
          <div key={invoice.id} className={styles.invoiceCard}>
            <div className={styles.invoiceHeader}>
              <div>
                <h4>{invoice.invoiceNumber}</h4>
                <p className={styles.invoiceSupplier}>{invoice.supplier}</p>
              </div>
              <span className={`${styles.statusBadge} ${
                invoice.status === 'pending' ? styles.statusPending :
                invoice.status === 'approved' ? styles.statusApproved :
                invoice.status === 'paid' ? styles.statusPaid :
                styles.statusOverdue
              }`}>
                {invoice.status === 'pending' && <Clock size={14} />}
                {invoice.status === 'approved' && <CheckCircle size={14} />}
                {invoice.status === 'paid' && <CheckCircle size={14} />}
                {invoice.status}
              </span>
            </div>

            <div className={styles.invoiceDetails}>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Invoice Date</span>
                <span className={styles.detailValue}>
                  {new Date(invoice.date).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Due Date</span>
                <span className={styles.detailValue}>
                  {new Date(invoice.dueDate).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Total Amount</span>
                <span className={`${styles.detailValue} ${styles.amount}`}>
                  £{invoice.totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Items</span>
                <span className={styles.detailValue}>{invoice.items.length}</span>
              </div>
            </div>

            <div className={styles.invoiceActions}>
              <button className={styles.btnView}>View Details</button>
              {invoice.status === 'pending' && (
                <button className={styles.btnApprove}>
                  <CheckCircle size={16} />
                  Approve
                </button>
              )}
              <button className={styles.btnDownload}>
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StockMovementsReport: React.FC<{ styles: any }> = ({ styles }) => {
  const mockMovements = [
    {
      id: '1',
      productName: 'Tomato Sauce',
      type: 'in' as const,
      quantity: 100,
      date: new Date('2024-01-15'),
      reason: 'Purchase Order #1234',
      performedBy: 'John Smith',
    },
    {
      id: '2',
      productName: 'Olive Oil',
      type: 'out' as const,
      quantity: 25,
      date: new Date('2024-01-14'),
      reason: 'Kitchen Request',
      performedBy: 'Sarah Johnson',
    },
    {
      id: '3',
      productName: 'Rice Basmati',
      type: 'adjustment' as const,
      quantity: -5,
      date: new Date('2024-01-13'),
      reason: 'Stock Take Correction',
      performedBy: 'Admin',
    },
  ];

  return (
    <div className={styles.reportSection}>
      <div className={styles.sectionActions}>
        <button className={styles.btnSecondaryAction}>
          <Download size={20} />
          Export Movements
        </button>
      </div>

      <div className={styles.movementsTable}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody>
            {mockMovements.map((movement) => (
              <tr key={movement.id}>
                <td>{movement.date.toLocaleDateString('en-GB')}</td>
                <td className={styles.productName}>{movement.productName}</td>
                <td>
                  <span className={`${styles.movementType} ${
                    movement.type === 'in' ? styles.typeIn :
                    movement.type === 'out' ? styles.typeOut :
                    styles.typeAdjustment
                  }`}>
                    {movement.type}
                  </span>
                </td>
                <td className={`${styles.quantity} ${movement.type === 'out' || movement.quantity < 0 ? styles.negative : styles.positive}`}>
                  {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}{Math.abs(movement.quantity)}
                </td>
                <td>{movement.reason}</td>
                <td>{movement.performedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;

