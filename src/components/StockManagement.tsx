import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Download, Upload, Package, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from '../types';
import styles from './styles/StockManagement.module.css';

const StockManagement: React.FC = () => {
  const { products, fetchProducts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterLowStock, setFilterLowStock] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesLowStock = !filterLowStock || p.currentStock <= p.minStockLevel;
      return matchesSearch && matchesCategory && matchesLowStock;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stock':
          comparison = a.currentStock - b.currentStock;
          break;
        case 'price':
          comparison = a.unitPrice - b.unitPrice;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  return (
    <div className={`${styles.stockManagement} fade-in`}>
      <div className={styles.stockHeader}>
        <div>
          <h2>Stock Management</h2>
          <p>Manage and track your inventory</p>
        </div>
        <button className={styles.btnAdd} onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      <div className={styles.stockControls}>
        <div className={styles.searchBox}>
          <Search size={20} color="#6b7280" />
          <input
            type="text"
            placeholder="Search by name, SKU, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Filter size={18} />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>

          <button
            className={`${styles.filterToggle} ${sortOrder === 'desc' ? styles.active : ''}`}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <button
            className={`${styles.filterToggle} ${filterLowStock ? styles.active : ''}`}
            onClick={() => setFilterLowStock(!filterLowStock)}
          >
            <AlertCircle size={18} />
            Low Stock
          </button>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.btnSecondary}>
            <Download size={18} />
            Export
          </button>
          <button className={styles.btnSecondary}>
            <Upload size={18} />
            Import
          </button>
        </div>
      </div>

      <div className={styles.stockStatsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Products:</span>
          <span className={styles.statValue}>{filteredProducts.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Low Stock:</span>
          <span className={`${styles.statValue} ${styles.warning}`}>
            {filteredProducts.filter(p => p.currentStock <= p.minStockLevel).length}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Value:</span>
          <span className={styles.statValue}>
            £{filteredProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className={styles.productsGrid}>
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Package size={64} color="#9ca3af" />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isLowStock = product.currentStock <= product.minStockLevel;
            const stockPercentage = (product.currentStock / product.maxStockLevel) * 100;

            return (
              <div key={product.id} className={`${styles.productCard} ${isLowStock ? styles.lowStock : ''}`}>
                {isLowStock && (
                  <div className={styles.lowStockBadge}>
                    <AlertCircle size={14} />
                    Low Stock
                  </div>
                )}

                <div className={styles.productHeader}>
                  <div>
                    <h4>{product.name}</h4>
                    <p className={styles.productSku}>SKU: {product.sku}</p>
                  </div>
                  <span className={styles.productCategory}>{product.category}</span>
                </div>

                <p className={styles.productDescription}>{product.description}</p>

                <div className={styles.stockIndicator}>
                  <div className={styles.stockLabel}>
                    <span>Stock Level</span>
                    <span className={`${styles.stockCount} ${isLowStock ? styles.low : ''}`}>
                      {product.currentStock} / {product.maxStockLevel} {product.unit}
                    </span>
                  </div>
                  <div className={styles.stockBar}>
                    <div
                      className={`${styles.stockBarFill} ${isLowStock ? styles.low : ''}`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                  <div className={styles.stockLevels}>
                    <span>Min: {product.minStockLevel}</span>
                    <span>Reorder: {product.reorderQuantity}</span>
                  </div>
                </div>

                <div className={styles.productDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Price:</span>
                    <span className={styles.detailValue}>£{product.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Supplier:</span>
                    <span className={styles.detailValue}>{product.supplier}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Value:</span>
                    <span className={styles.detailValue}>
                      £{(product.currentStock * product.unitPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className={styles.productActions}>
                  <button className={styles.btnEdit} onClick={() => handleEdit(product)}>
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button className={styles.btnDelete}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <ProductModal
          onClose={() => setShowAddModal(false)}
          title="Add New Product"
          styles={styles}
        />
      )}

      {showEditModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          title="Edit Product"
          styles={styles}
        />
      )}
    </div>
  );
};

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
  title: string;
  styles: any;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, title, styles }) => {
  const { addProduct, updateProduct } = useStore();
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    unit: product?.unit || '',
    currentStock: product?.currentStock || 0,
    minStockLevel: product?.minStockLevel || 0,
    maxStockLevel: product?.maxStockLevel || 0,
    reorderQuantity: product?.reorderQuantity || 0,
    unitPrice: product?.unitPrice || 0,
    supplier: product?.supplier || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      await updateProduct({ ...product, ...formData, lastUpdated: new Date() });
    } else {
      await addProduct({ ...formData, lastUpdated: new Date(), siteId: '1' });
    }
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} scale-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.productForm}>
          <div className={styles.formRow}>
            <div className="form-group">
              <label>SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Unit *</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. bottle, pack, kg"
                required
              />
            </div>
            <div className="form-group">
              <label>Supplier *</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Current Stock *</label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Min Stock Level *</label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Max Stock Level *</label>
              <input
                type="number"
                value={formData.maxStockLevel}
                onChange={(e) => setFormData({ ...formData, maxStockLevel: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reorder Quantity *</label>
              <input
                type="number"
                value={formData.reorderQuantity}
                onChange={(e) => setFormData({ ...formData, reorderQuantity: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Unit Price (£) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnSubmit}>
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockManagement;

