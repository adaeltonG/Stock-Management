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
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';
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
  } = useStore();

  const [showPricesModal, setShowPricesModal] = useState(false);

  useEffect(() => {
    // Load all recipe data on component mount
    const loadData = async () => {
      await Promise.all([
        fetchRecipes(),
        fetchIngredients(),
        fetchPurchaseItems(),
      ]);
    };
    loadData();
  }, [fetchRecipes, fetchIngredients, fetchPurchaseItems]);

  // Format price in pence to pounds
  const formatPrice = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  // Format price with 4 decimal places for accuracy
  const formatPriceDetailed = (pence: number) => {
    return `£${(pence / 100).toFixed(4)}`;
  };

  const handleRecipeSelect = async (recipeId: string) => {
    if (selectedRecipe?.id === recipeId) {
      selectRecipe(null);
      setShowPricesModal(false);
    } else {
      await selectRecipe(recipeId);
      setShowPricesModal(true);
    }
  };

  const mainRecipes = recipes.filter(r => !r.isSubRecipe);
  const subRecipes = recipes.filter(r => r.isSubRecipe);

  // Calculate profit margins (example: assuming 35% food cost target)
  const calculateSuggestedPrice = (costPerPortion: number) => {
    const targetFoodCostPercentage = 0.35; // 35%
    return costPerPortion / targetFoodCostPercentage;
  };

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
                        <div className={styles.recipeBadge}>Main</div>
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
                          <span className={styles.costLabel}>Total Cost:</span>
                          <span className={styles.costValue}>{formatPrice(recipe.totalCost)}</span>
                        </div>
                        <div className={styles.costItem}>
                          <span className={styles.costLabel}>Per Portion:</span>
                          <span className={styles.costValueHighlight}>
                            {formatPrice(recipe.costPerPortion)}
                          </span>
                        </div>
                        <div className={styles.costItem}>
                          <span className={styles.costLabel}>Suggested Price:</span>
                          <span className={styles.costValueSuggested}>
                            {formatPrice(calculateSuggestedPrice(recipe.costPerPortion))}
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
                          <div className={`${styles.recipeBadge} ${styles.badgeSub}`}>
                            Component
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

