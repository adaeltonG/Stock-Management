import React, { useEffect, useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  DollarSign,
  Users, 
  ShoppingCart, 
  RefreshCw,
  TrendingUp,
  Package,
  X,
  Edit,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Recipe, RecipeLineItem, PurchaseItem } from '../types';
import styles from './styles/RecipeBuilder.module.css';

const RecipeBuilder: React.FC = () => {
  const {
    recipes,
    ingredients,
    purchaseItems,
    selectedRecipe,
    recipeLineItems,
    isLoading,
    fetchRecipes,
    fetchIngredients,
    fetchPurchaseItems,
    selectRecipe,
    refreshRecipeCosts,
    updateRecipe,
    updateRecipeLineItem,
    addRecipeLineItem,
    deleteRecipeLineItem,
    updatePurchaseItem,
  } = useStore();

  const [showPricesModal, setShowPricesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editTab, setEditTab] = useState<'details' | 'ingredients' | 'prices'>('details');
  const [mainIngredientsCosts, setMainIngredientsCosts] = useState<Record<string, number>>({});
  
  // Form states
  const [recipeForm, setRecipeForm] = useState<Partial<Recipe>>({});
  const [editingLineItems, setEditingLineItems] = useState<RecipeLineItem[]>([]);
  const [editingPurchaseItems, setEditingPurchaseItems] = useState<PurchaseItem[]>([]);

  // Format price in pence to pounds
  const formatPrice = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  // Format price with 4 decimal places for accuracy
  const formatPriceDetailed = (pence: number) => {
    return `£${(pence / 100).toFixed(4)}`;
  };

  // Calculate main ingredients cost (excluding sub-recipes) for a recipe
  const calculateMainIngredientsCost = async (recipeId: string): Promise<number> => {
    try {
      const { getRecipeLineItems } = await import('../services/recipeDatabase');
      const lineItems = await getRecipeLineItems(recipeId);
      
      // Sum only ingredient costs (exclude sub-recipes)
      return lineItems
        .filter(item => item.itemType === 'ingredient')
        .reduce((sum, item) => sum + item.cost, 0);
    } catch (error) {
      console.error('Error calculating main ingredients cost:', error);
      return 0;
    }
  };

  const handleRecipeSelect = async (recipeId: string) => {
    if (selectedRecipe?.id === recipeId) {
      selectRecipe(null);
      setShowPricesModal(false);
    } else {
      // Recalculate costs to ensure sub-recipes are included
      await refreshRecipeCosts();
      await selectRecipe(recipeId);
      setShowPricesModal(true);
    }
  };

  const handleEditRecipe = async (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRecipe(recipe);
    setRecipeForm({
      name: recipe.name,
      description: recipe.description,
      yieldQuantity: recipe.yieldQuantity,
      yieldUnit: recipe.yieldUnit,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      instructions: recipe.instructions,
    });
    
    // Load line items for this recipe
    const { getRecipeLineItems } = await import('../services/recipeDatabase');
    const lineItems = await getRecipeLineItems(recipe.id);
    setEditingLineItems(lineItems);
    
    // Load purchase items for ingredients in this recipe
    const ingredientIds = lineItems
      .filter(item => item.itemType === 'ingredient')
      .map(item => item.itemId);
    const relevantPurchaseItems = purchaseItems.filter(item => 
      ingredientIds.includes(item.ingredientId)
    );
    setEditingPurchaseItems(relevantPurchaseItems);
    
    setShowEditModal(true);
    setEditTab('details');
  };

  const handleSaveRecipe = async () => {
    if (!editingRecipe) return;
    
    await updateRecipe({
      id: editingRecipe.id,
      ...recipeForm,
    });
    
    setShowEditModal(false);
    setEditingRecipe(null);
  };

  const handleSaveLineItem = async (lineItem: RecipeLineItem) => {
    await updateRecipeLineItem(lineItem.id, {
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      itemName: lineItem.itemName,
    });
    
    // Refresh line items
    const { getRecipeLineItems } = await import('../services/recipeDatabase');
    const updated = await getRecipeLineItems(editingRecipe!.id);
    setEditingLineItems(updated);
  };

  const handleAddLineItem = async () => {
    if (!editingRecipe) return;
    
    // Simple add - in production, you'd have a form to select ingredient/recipe
    const newItem: Omit<RecipeLineItem, 'id' | 'cost'> = {
      recipeId: editingRecipe.id,
      itemId: ingredients[0]?.id || '',
      itemType: 'ingredient',
      itemName: ingredients[0]?.name || 'New Ingredient',
      quantity: 1,
      unit: ingredients[0]?.baseUnit || 'g',
    };
    
    await addRecipeLineItem(newItem);
    
    // Refresh line items
    const { getRecipeLineItems } = await import('../services/recipeDatabase');
    const updated = await getRecipeLineItems(editingRecipe.id);
    setEditingLineItems(updated);
  };

  const handleDeleteLineItem = async (lineItemId: string) => {
    await deleteRecipeLineItem(lineItemId);
    
    // Refresh line items
    if (editingRecipe) {
      const { getRecipeLineItems } = await import('../services/recipeDatabase');
      const updated = await getRecipeLineItems(editingRecipe.id);
      setEditingLineItems(updated);
    }
  };

  const handleSavePurchaseItem = async (purchaseItem: PurchaseItem) => {
    await updatePurchaseItem(purchaseItem.id, {
      purchasePrice: purchaseItem.purchasePrice,
      purchaseQuantity: purchaseItem.purchaseQuantity,
      purchaseUnit: purchaseItem.purchaseUnit,
      supplierName: purchaseItem.supplierName,
    });
    
    // Refresh purchase items
    await fetchPurchaseItems();
    const ingredientIds = editingLineItems
      .filter(item => item.itemType === 'ingredient')
      .map(item => item.itemId);
    const relevantPurchaseItems = purchaseItems.filter(item => 
      ingredientIds.includes(item.ingredientId)
    );
    setEditingPurchaseItems(relevantPurchaseItems);
  };

  const mainRecipes = recipes.filter(r => !r.isSubRecipe);
  const subRecipes = recipes.filter(r => r.isSubRecipe);

  useEffect(() => {
    // Load all recipe data on component mount
    const loadData = async () => {
      await Promise.all([
        fetchRecipes(),
        fetchIngredients(),
        fetchPurchaseItems(),
      ]);
      // Recalculate costs to ensure sub-recipes are included
      await refreshRecipeCosts();
      
      // Calculate main ingredients costs (excluding sub-recipes) for main recipes
      // Use recipes from store after refresh
      const currentRecipes = useStore.getState().recipes;
      const costs: Record<string, number> = {};
      for (const recipe of currentRecipes.filter(r => !r.isSubRecipe)) {
        const mainCost = await calculateMainIngredientsCost(recipe.id);
        costs[recipe.id] = mainCost;
      }
      setMainIngredientsCosts(costs);
    };
    loadData();
  }, [fetchRecipes, fetchIngredients, fetchPurchaseItems, refreshRecipeCosts]);

  // Also update main ingredients costs when recipes change
  useEffect(() => {
    const updateMainCosts = async () => {
      if (recipes.length > 0) {
        const costs: Record<string, number> = {};
        for (const recipe of recipes.filter(r => !r.isSubRecipe)) {
          const mainCost = await calculateMainIngredientsCost(recipe.id);
          costs[recipe.id] = mainCost;
        }
        setMainIngredientsCosts(costs);
      }
    };
    updateMainCosts();
  }, [recipes]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <ChefHat size={32} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Recipe Cost Calculator</h1>
            <p className={styles.subtitle}>
              Manage recipes, calculate costs, and optimize your menu pricing
            </p>
          </div>
        </div>
        <button 
          className={styles.btnRefresh}
          onClick={refreshRecipeCosts}
          disabled={isLoading}
        >
          <RefreshCw size={18} className={isLoading ? styles.spinning : ''} />
          <span>Recalculate Costs</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
            <ChefHat size={24} color="#2563eb" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Total Recipes</div>
            <div className={styles.statValue}>{recipes.length}</div>
            <div className={styles.statMeta}>
              {mainRecipes.length} main, {subRecipes.length} sub-recipes
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
            <Package size={24} color="#10b981" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Ingredients</div>
            <div className={styles.statValue}>{ingredients.length}</div>
            <div className={styles.statMeta}>
              {purchaseItems.length} purchase items tracked
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
            <DollarSign size={24} color="#f59e0b" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Avg. Recipe Cost</div>
            <div className={styles.statValue}>
              {mainRecipes.length > 0
                ? formatPrice(
                    mainRecipes.reduce((sum, r) => sum + r.totalCost, 0) / mainRecipes.length
                  )
                : '£0.00'}
            </div>
            <div className={styles.statMeta}>Based on {mainRecipes.length} recipes</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fce7f3' }}>
            <TrendingUp size={24} color="#ec4899" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Profit Potential</div>
            <div className={styles.statValue}>65%</div>
            <div className={styles.statMeta}>Target margin at 35% food cost</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Recipes List */}
        <div className={styles.recipesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recipes</h2>
          </div>

          {isLoading && recipes.length === 0 ? (
            <div className={styles.loadingState}>
              <RefreshCw size={32} className={styles.spinning} />
              <p>Loading recipes...</p>
            </div>
          ) : (
            <>
              {/* Main Recipes */}
              <div className={styles.recipeGroup}>
                <h3 className={styles.groupTitle}>Main Recipes</h3>
                <div className={styles.recipesList}>
                  {mainRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className={`${styles.recipeCard} ${
                        selectedRecipe?.id === recipe.id ? styles.selected : ''
                      }`}
                      onClick={() => handleRecipeSelect(recipe.id)}
                    >
                      <div className={styles.recipeHeader}>
                        <div className={styles.recipeTitle}>{recipe.name}</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className={styles.btnEdit}
                            onClick={(e) => handleEditRecipe(recipe, e)}
                            title="Edit Recipe"
                          >
                            <Edit size={16} />
                          </button>
                          <div className={styles.recipeBadge}>Main</div>
                        </div>
                      </div>
                      <p className={styles.recipeDescription}>{recipe.description}</p>
                      
                      <div className={styles.recipeMetrics}>
                        <div className={styles.metric}>
                          <Users size={16} />
                          <span>{recipe.yieldQuantity} {recipe.yieldUnit}</span>
                        </div>
                        {recipe.prepTime && (
                          <div className={styles.metric}>
                            <Clock size={16} />
                            <span>{recipe.prepTime + (recipe.cookTime || 0)} min</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.recipeCosts}>
                        <div className={styles.costItem}>
                          <span className={styles.costLabel}>Total Cost (main only):</span>
                          <span className={styles.costValue}>
                            {formatPrice(mainIngredientsCosts[recipe.id] || 0)}
                          </span>
                        </div>
                        <div className={styles.costItem}>
                          <span className={styles.costLabel}>Per Portion (main only):</span>
                          <span className={styles.costValueHighlight}>
                            {formatPrice((mainIngredientsCosts[recipe.id] || 0) / recipe.yieldQuantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub Recipes */}
              {subRecipes.length > 0 && (
                <div className={styles.recipeGroup}>
                  <h3 className={styles.groupTitle}>Sub-Recipes / Components</h3>
                  <div className={styles.recipesList}>
                    {subRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className={`${styles.recipeCard} ${styles.subRecipe} ${
                          selectedRecipe?.id === recipe.id ? styles.selected : ''
                        }`}
                        onClick={() => handleRecipeSelect(recipe.id)}
                      >
                        <div className={styles.recipeHeader}>
                          <div className={styles.recipeTitle}>{recipe.name}</div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              className={styles.btnEdit}
                              onClick={(e) => handleEditRecipe(recipe, e)}
                              title="Edit Recipe"
                            >
                              <Edit size={16} />
                            </button>
                            <div className={`${styles.recipeBadge} ${styles.badgeSub}`}>
                              Component
                            </div>
                          </div>
                        </div>
                        <p className={styles.recipeDescription}>{recipe.description}</p>
                        
                        <div className={styles.recipeMetrics}>
                          <div className={styles.metric}>
                            <Package size={16} />
                            <span>Yields {recipe.yieldQuantity} {recipe.yieldUnit}</span>
                          </div>
                        </div>

                        <div className={styles.recipeCosts}>
                          <div className={styles.costItem}>
                            <span className={styles.costLabel}>Total Cost:</span>
                            <span className={styles.costValue}>{formatPrice(recipe.totalCost)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>


        {/* Edit Recipe Modal */}
        {showEditModal && editingRecipe && (
          <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  <Edit size={24} />
                  Edit Recipe: {editingRecipe.name}
                </h2>
                <button 
                  className={styles.modalCloseBtn}
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Tabs */}
              <div className={styles.editTabs}>
                <button
                  className={`${styles.editTab} ${editTab === 'details' ? styles.editTabActive : ''}`}
                  onClick={() => setEditTab('details')}
                >
                  Recipe Details
                </button>
                <button
                  className={`${styles.editTab} ${editTab === 'ingredients' ? styles.editTabActive : ''}`}
                  onClick={() => setEditTab('ingredients')}
                >
                  Ingredients
                </button>
                <button
                  className={`${styles.editTab} ${editTab === 'prices' ? styles.editTabActive : ''}`}
                  onClick={() => setEditTab('prices')}
                >
                  Purchase Prices
                </button>
              </div>

              <div className={styles.modalBody}>
                {editTab === 'details' && (
                  <div className={styles.editForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Recipe Name</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={recipeForm.name || ''}
                        onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Description</label>
                      <textarea
                        className={styles.formTextarea}
                        value={recipeForm.description || ''}
                        onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Yield Quantity</label>
                        <input
                          type="number"
                          className={styles.formInput}
                          value={recipeForm.yieldQuantity || ''}
                          onChange={(e) => setRecipeForm({ ...recipeForm, yieldQuantity: parseFloat(e.target.value) })}
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Yield Unit</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={recipeForm.yieldUnit || ''}
                          onChange={(e) => setRecipeForm({ ...recipeForm, yieldUnit: e.target.value })}
                          placeholder="portions, liters, etc."
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Prep Time (minutes)</label>
                        <input
                          type="number"
                          className={styles.formInput}
                          value={recipeForm.prepTime || ''}
                          onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: parseInt(e.target.value) || undefined })}
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Cook Time (minutes)</label>
                        <input
                          type="number"
                          className={styles.formInput}
                          value={recipeForm.cookTime || ''}
                          onChange={(e) => setRecipeForm({ ...recipeForm, cookTime: parseInt(e.target.value) || undefined })}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Instructions</label>
                      <textarea
                        className={styles.formTextarea}
                        value={recipeForm.instructions || ''}
                        onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })}
                        rows={6}
                      />
                    </div>
                    
                    <button className={styles.btnSave} onClick={handleSaveRecipe}>
                      <Save size={18} />
                      Save Changes
                    </button>
                  </div>
                )}

                {editTab === 'ingredients' && (
                  <div className={styles.editForm}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 className={styles.sectionSubtitle}>Recipe Ingredients</h3>
                      <button className={styles.btnAdd} onClick={handleAddLineItem}>
                        <Plus size={16} />
                        Add Ingredient
                      </button>
                    </div>
                    
                    <div className={styles.table}>
                      <div className={styles.tableHeader}>
                        <div className={styles.tableCell}>Ingredient</div>
                        <div className={styles.tableCell}>Quantity</div>
                        <div className={styles.tableCell}>Unit</div>
                        <div className={styles.tableCell}>Cost</div>
                        <div className={styles.tableCell}>Actions</div>
                      </div>
                      <div className={styles.tableBody}>
                        {editingLineItems.map((item) => (
                          <div key={item.id} className={styles.tableRow}>
                            <div className={styles.tableCell}>
                              <input
                                type="text"
                                className={styles.formInputInline}
                                value={item.itemName}
                                onChange={(e) => {
                                  const updated = editingLineItems.map(li => 
                                    li.id === item.id ? { ...li, itemName: e.target.value } : li
                                  );
                                  setEditingLineItems(updated);
                                }}
                                onBlur={() => handleSaveLineItem({ ...item, itemName: editingLineItems.find(li => li.id === item.id)?.itemName || item.itemName })}
                              />
                            </div>
                            <div className={styles.tableCell}>
                              <input
                                type="number"
                                className={styles.formInputInline}
                                value={item.quantity}
                                onChange={(e) => {
                                  const updated = editingLineItems.map(li => 
                                    li.id === item.id ? { ...li, quantity: parseFloat(e.target.value) || 0 } : li
                                  );
                                  setEditingLineItems(updated);
                                }}
                                onBlur={() => handleSaveLineItem({ ...item, quantity: editingLineItems.find(li => li.id === item.id)?.quantity || item.quantity })}
                              />
                            </div>
                            <div className={styles.tableCell}>
                              <input
                                type="text"
                                className={styles.formInputInline}
                                value={item.unit}
                                onChange={(e) => {
                                  const updated = editingLineItems.map(li => 
                                    li.id === item.id ? { ...li, unit: e.target.value } : li
                                  );
                                  setEditingLineItems(updated);
                                }}
                                onBlur={() => handleSaveLineItem({ ...item, unit: editingLineItems.find(li => li.id === item.id)?.unit || item.unit })}
                              />
                            </div>
                            <div className={styles.tableCell}>
                              {formatPrice(item.cost)}
                            </div>
                            <div className={styles.tableCell}>
                              <button
                                className={styles.btnDelete}
                                onClick={() => handleDeleteLineItem(item.id)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {editTab === 'prices' && (
                  <div className={styles.editForm}>
                    <h3 className={styles.sectionSubtitle} style={{ marginBottom: '20px' }}>Purchase Prices</h3>
                    
                    <div className={styles.pricesList}>
                      {editingPurchaseItems.map((item) => (
                        <div key={item.id} className={styles.priceItem}>
                          <div className={styles.priceItemHeader}>
                            <span className={styles.priceItemName}>{item.ingredientName}</span>
                          </div>
                          <div className={styles.priceItemDetails}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Supplier</label>
                              <input
                                type="text"
                                className={styles.formInput}
                                value={item.supplierName}
                                onChange={(e) => {
                                  const updated = editingPurchaseItems.map(pi => 
                                    pi.id === item.id ? { ...pi, supplierName: e.target.value } : pi
                                  );
                                  setEditingPurchaseItems(updated);
                                }}
                                onBlur={() => handleSavePurchaseItem({ ...item, supplierName: editingPurchaseItems.find(pi => pi.id === item.id)?.supplierName || item.supplierName })}
                              />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Purchase Price (pence)</label>
                                <input
                                  type="number"
                                  className={styles.formInput}
                                  value={item.purchasePrice}
                                  onChange={(e) => {
                                    const updated = editingPurchaseItems.map(pi => 
                                      pi.id === item.id ? { ...pi, purchasePrice: parseInt(e.target.value) || 0 } : pi
                                    );
                                    setEditingPurchaseItems(updated);
                                  }}
                                  onBlur={() => handleSavePurchaseItem({ ...item, purchasePrice: editingPurchaseItems.find(pi => pi.id === item.id)?.purchasePrice || item.purchasePrice })}
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Quantity</label>
                                <input
                                  type="number"
                                  className={styles.formInput}
                                  value={item.purchaseQuantity}
                                  onChange={(e) => {
                                    const updated = editingPurchaseItems.map(pi => 
                                      pi.id === item.id ? { ...pi, purchaseQuantity: parseFloat(e.target.value) || 0 } : pi
                                    );
                                    setEditingPurchaseItems(updated);
                                  }}
                                  onBlur={() => handleSavePurchaseItem({ ...item, purchaseQuantity: editingPurchaseItems.find(pi => pi.id === item.id)?.purchaseQuantity || item.purchaseQuantity })}
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Unit</label>
                                <input
                                  type="text"
                                  className={styles.formInput}
                                  value={item.purchaseUnit}
                                  onChange={(e) => {
                                    const updated = editingPurchaseItems.map(pi => 
                                      pi.id === item.id ? { ...pi, purchaseUnit: e.target.value } : pi
                                    );
                                    setEditingPurchaseItems(updated);
                                  }}
                                  onBlur={() => handleSavePurchaseItem({ ...item, purchaseUnit: editingPurchaseItems.find(pi => pi.id === item.id)?.purchaseUnit || item.purchaseUnit })}
                                />
                              </div>
                            </div>
                            <div className={styles.priceDetail}>
                              <span className={styles.priceDetailLabel}>Cost per {ingredients.find(ing => ing.id === item.ingredientId)?.baseUnit || 'unit'}:</span>
                              <span className={styles.priceDetailValue}>
                                {formatPriceDetailed(item.costPerBaseUnit)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ingredient Prices Modal */}
        {showPricesModal && (
          <div className={styles.modalOverlay} onClick={() => setShowPricesModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  <ShoppingCart size={24} />
                  Ingredient Purchase Prices
                </h2>
                <button 
                  className={styles.modalCloseBtn}
                  onClick={() => setShowPricesModal(false)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.pricesList}>
                  {(() => {
                    // Filter to show only ingredients used in this recipe
                    const recipeIngredientIds = recipeLineItems
                      .filter(item => item.itemType === 'ingredient')
                      .map(item => item.itemId);
                    
                    const filteredPurchaseItems = purchaseItems.filter(item => 
                      recipeIngredientIds.includes(item.ingredientId)
                    );

                    return filteredPurchaseItems.length > 0 ? (
                      filteredPurchaseItems.map((item) => (
                        <div key={item.id} className={styles.priceItem}>
                          <div className={styles.priceItemHeader}>
                            <span className={styles.priceItemName}>{item.ingredientName}</span>
                            <span className={styles.priceItemSupplier}>{item.supplierName}</span>
                          </div>
                          <div className={styles.priceItemDetails}>
                            <div className={styles.priceDetail}>
                              <span className={styles.priceDetailLabel}>Purchase:</span>
                              <span className={styles.priceDetailValue}>
                                {formatPrice(item.purchasePrice)} / {item.purchaseQuantity}{item.purchaseUnit}
                              </span>
                            </div>
                            <div className={styles.priceDetail}>
                              <span className={styles.priceDetailLabel}>Cost per unit:</span>
                              <span className={styles.priceDetailValue}>
                                {formatPriceDetailed(item.costPerBaseUnit)} / {
                                  ingredients.find(ing => ing.id === item.ingredientId)?.baseUnit || 'unit'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.loadingState}>
                        <p>Loading ingredient prices...</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeBuilder;

