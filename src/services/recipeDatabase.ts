import initSqlJs, { Database } from 'sql.js';
import { Ingredient, PurchaseItem, Recipe, RecipeLineItem } from '../types';

let db: Database | null = null;

// Initialize the database
export async function initializeDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`
  });

  db = new SQL.Database();

  // Create tables
  createTables(db);
  
  // Insert sample data for "Panko Coated Prawns with Coconut and Coriander Yogurt"
  insertSampleData(db);

  return db;
}

function createTables(database: Database) {
  // Ingredients table
  database.run(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      baseUnit TEXT NOT NULL CHECK(baseUnit IN ('g', 'ml', 'each')),
      yieldPercent REAL DEFAULT 1.0,
      category TEXT
    )
  `);

  // Purchase items table
  database.run(`
    CREATE TABLE IF NOT EXISTS purchase_items (
      id TEXT PRIMARY KEY,
      ingredientId TEXT NOT NULL,
      ingredientName TEXT NOT NULL,
      supplierName TEXT NOT NULL,
      purchasePrice INTEGER NOT NULL,
      purchaseQuantity REAL NOT NULL,
      purchaseUnit TEXT NOT NULL,
      costPerBaseUnit REAL NOT NULL,
      lastUpdated TEXT NOT NULL,
      FOREIGN KEY (ingredientId) REFERENCES ingredients(id)
    )
  `);

  // Recipes table
  database.run(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      isSubRecipe INTEGER DEFAULT 0,
      yieldQuantity REAL NOT NULL,
      yieldUnit TEXT NOT NULL,
      prepTime INTEGER,
      cookTime INTEGER,
      instructions TEXT,
      totalCost REAL DEFAULT 0,
      costPerPortion REAL DEFAULT 0,
      imageUrl TEXT,
      createdDate TEXT NOT NULL,
      lastUpdated TEXT NOT NULL
    )
  `);

  // Recipe line items table
  database.run(`
    CREATE TABLE IF NOT EXISTS recipe_line_items (
      id TEXT PRIMARY KEY,
      recipeId TEXT NOT NULL,
      itemId TEXT NOT NULL,
      itemType TEXT NOT NULL CHECK(itemType IN ('ingredient', 'recipe')),
      itemName TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      cost REAL DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (recipeId) REFERENCES recipes(id)
    )
  `);

  // Unit conversions table
  database.run(`
    CREATE TABLE IF NOT EXISTS unit_conversions (
      id TEXT PRIMARY KEY,
      ingredientId TEXT NOT NULL,
      unitName TEXT NOT NULL,
      toBaseUnitFactor REAL NOT NULL,
      description TEXT,
      FOREIGN KEY (ingredientId) REFERENCES ingredients(id)
    )
  `);
}

function insertSampleData(database: Database) {
  const now = new Date().toISOString();

  // Insert ingredients with their purchase information
  const ingredients = [
    { id: '1', name: 'Raw King Prawns', baseUnit: 'g', yieldPercent: 1.0, category: 'Seafood' },
    { id: '2', name: 'Panko Breadcrumbs', baseUnit: 'g', yieldPercent: 1.0, category: 'Dry Goods' },
    { id: '3', name: 'Desiccated Coconut', baseUnit: 'g', yieldPercent: 1.0, category: 'Dry Goods' },
    { id: '4', name: 'Plain Flour', baseUnit: 'g', yieldPercent: 1.0, category: 'Dry Goods' },
    { id: '5', name: 'Large Eggs', baseUnit: 'each', yieldPercent: 1.0, category: 'Dairy & Eggs' },
    { id: '6', name: 'Coconut Yogurt', baseUnit: 'g', yieldPercent: 1.0, category: 'Dairy & Eggs' },
    { id: '7', name: 'Fresh Coriander', baseUnit: 'g', yieldPercent: 0.8, category: 'Fresh Herbs' },
    { id: '8', name: 'Lime', baseUnit: 'each', yieldPercent: 0.5, category: 'Fresh Produce' },
    { id: '9', name: 'Vegetable Oil', baseUnit: 'ml', yieldPercent: 1.0, category: 'Oils' },
    { id: '10', name: 'Table Salt', baseUnit: 'g', yieldPercent: 1.0, category: 'Seasonings' },
    { id: '11', name: 'Black Pepper', baseUnit: 'g', yieldPercent: 1.0, category: 'Seasonings' },
  ];

  ingredients.forEach(ing => {
    database.run(
      'INSERT INTO ingredients (id, name, baseUnit, yieldPercent, category) VALUES (?, ?, ?, ?, ?)',
      [ing.id, ing.name, ing.baseUnit, ing.yieldPercent, ing.category]
    );
  });

  // Insert purchase items (converting prices to pence)
  const purchaseItems = [
    { id: 'p1', ingredientId: '1', name: 'Raw King Prawns', supplier: 'London Seafood Suppliers', price: 1900, qty: 1000, unit: 'g', costPerG: 1.9 },
    { id: 'p2', ingredientId: '2', name: 'Panko Breadcrumbs', supplier: 'Asian Foods Ltd', price: 195, qty: 150, unit: 'g', costPerG: 1.3 },
    { id: 'p3', ingredientId: '3', name: 'Desiccated Coconut', supplier: 'Asian Foods Ltd', price: 200, qty: 200, unit: 'g', costPerG: 1.0 },
    { id: 'p4', ingredientId: '4', name: 'Plain Flour', supplier: 'Dry Goods Wholesale', price: 75, qty: 1500, unit: 'g', costPerG: 0.05 },
    { id: 'p5', ingredientId: '5', name: 'Large Eggs', supplier: 'Farm Fresh Supplies', price: 179, qty: 6, unit: 'each', costPerG: 29.83 },
    { id: 'p6', ingredientId: '6', name: 'Coconut Yogurt', supplier: 'Dairy Alternatives Co', price: 275, qty: 350, unit: 'g', costPerG: 0.786 },
    { id: 'p7', ingredientId: '7', name: 'Fresh Coriander', supplier: 'Fresh Herbs Direct', price: 52, qty: 30, unit: 'g', costPerG: 1.733 },
    { id: 'p8', ingredientId: '8', name: 'Lime', supplier: 'Fresh Produce Ltd', price: 24, qty: 1, unit: 'each', costPerG: 24 },
    { id: 'p9', ingredientId: '9', name: 'Vegetable Oil', supplier: 'Cooking Essentials', price: 149, qty: 1000, unit: 'ml', costPerG: 0.149 },
    { id: 'p10', ingredientId: '10', name: 'Table Salt', supplier: 'Seasonings Direct', price: 65, qty: 750, unit: 'g', costPerG: 0.087 },
    { id: 'p11', ingredientId: '11', name: 'Black Pepper', supplier: 'Seasonings Direct', price: 285, qty: 50, unit: 'g', costPerG: 5.7 },
  ];

  purchaseItems.forEach(item => {
    database.run(
      'INSERT INTO purchase_items (id, ingredientId, ingredientName, supplierName, purchasePrice, purchaseQuantity, purchaseUnit, costPerBaseUnit, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.ingredientId, item.name, item.supplier, item.price, item.qty, item.unit, item.costPerG, now]
    );
  });

  // Insert sub-recipe: Coconut & Coriander Yogurt
  database.run(
    `INSERT INTO recipes (id, name, description, isSubRecipe, yieldQuantity, yieldUnit, prepTime, cookTime, instructions, totalCost, costPerPortion, createdDate, lastUpdated) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'sub-recipe-1',
      'Coconut & Coriander Yogurt',
      'A refreshing dipping sauce with coconut yogurt, fresh coriander, and lime',
      1,
      170,
      'g',
      5,
      0,
      '1. Finely chop the fresh coriander.\n2. In a bowl, combine coconut yogurt and chopped coriander.\n3. Squeeze in lime juice.\n4. Season with salt and black pepper.\n5. Mix well and refrigerate until needed.\n6. Let flavours blend for at least 10 minutes before serving.',
      0,
      0,
      now,
      now
    ]
  );

  // Insert recipe line items for sub-recipe (yogurt)
  const yogurtItems = [
    { id: 'yli1', recipeId: 'sub-recipe-1', itemId: '6', type: 'ingredient', name: 'Coconut Yogurt', qty: 150, unit: 'g', cost: 0 },
    { id: 'yli2', recipeId: 'sub-recipe-1', itemId: '7', type: 'ingredient', name: 'Fresh Coriander', qty: 15, unit: 'g', cost: 0 },
    { id: 'yli3', recipeId: 'sub-recipe-1', itemId: '8', type: 'ingredient', name: 'Lime', qty: 0.5, unit: 'each', cost: 0 },
    { id: 'yli4', recipeId: 'sub-recipe-1', itemId: '10', type: 'ingredient', name: 'Table Salt', qty: 1, unit: 'g', cost: 0 },
    { id: 'yli5', recipeId: 'sub-recipe-1', itemId: '11', type: 'ingredient', name: 'Black Pepper', qty: 1, unit: 'g', cost: 0 },
  ];

  yogurtItems.forEach(item => {
    database.run(
      'INSERT INTO recipe_line_items (id, recipeId, itemId, itemType, itemName, quantity, unit, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.recipeId, item.itemId, item.type, item.name, item.qty, item.unit, item.cost]
    );
  });

  // Insert main recipe: Panko Coated Prawns
  database.run(
    `INSERT INTO recipes (id, name, description, isSubRecipe, yieldQuantity, yieldUnit, prepTime, cookTime, instructions, totalCost, costPerPortion, createdDate, lastUpdated) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'main-recipe-1',
      'Panko Coated Prawns with Coconut & Coriander Yogurt',
      'Crispy panko-coated prawns with a touch of coconut, served with a zesty coriander yogurt dip',
      0,
      4,
      'portions',
      15,
      10,
      '1. Set up three bowls: flour in first, beaten eggs in second, panko mixed with coconut in third.\n2. Season flour with salt and pepper.\n3. Pat prawns dry with paper towels.\n4. Coat each prawn: first in flour, then egg, finally in panko-coconut mixture.\n5. Press coating firmly onto prawns.\n6. Heat vegetable oil to 180°C (350°F) in a deep pan.\n7. Fry prawns in batches for 2-3 minutes until golden and crispy.\n8. Drain on paper towels.\n9. Serve hot with coconut & coriander yogurt on the side.',
      0,
      0,
      now,
      now
    ]
  );

  // Insert recipe line items for main recipe (prawns)
  const prawnItems = [
    { id: 'pli1', recipeId: 'main-recipe-1', itemId: '1', type: 'ingredient', name: 'Raw King Prawns', qty: 300, unit: 'g', cost: 0 },
    { id: 'pli2', recipeId: 'main-recipe-1', itemId: '4', type: 'ingredient', name: 'Plain Flour', qty: 50, unit: 'g', cost: 0 },
    { id: 'pli3', recipeId: 'main-recipe-1', itemId: '5', type: 'ingredient', name: 'Large Eggs', qty: 2, unit: 'each', cost: 0 },
    { id: 'pli4', recipeId: 'main-recipe-1', itemId: '2', type: 'ingredient', name: 'Panko Breadcrumbs', qty: 75, unit: 'g', cost: 0 },
    { id: 'pli5', recipeId: 'main-recipe-1', itemId: '3', type: 'ingredient', name: 'Desiccated Coconut', qty: 50, unit: 'g', cost: 0 },
    { id: 'pli6', recipeId: 'main-recipe-1', itemId: '10', type: 'ingredient', name: 'Table Salt', qty: 2, unit: 'g', cost: 0 },
    { id: 'pli7', recipeId: 'main-recipe-1', itemId: '11', type: 'ingredient', name: 'Black Pepper', qty: 1, unit: 'g', cost: 0 },
    { id: 'pli8', recipeId: 'main-recipe-1', itemId: '9', type: 'ingredient', name: 'Vegetable Oil', qty: 500, unit: 'ml', cost: 0 },
    { id: 'pli9', recipeId: 'main-recipe-1', itemId: 'sub-recipe-1', type: 'recipe', name: 'Coconut & Coriander Yogurt', qty: 1, unit: 'batch', cost: 0 },
  ];

  prawnItems.forEach(item => {
    database.run(
      'INSERT INTO recipe_line_items (id, recipeId, itemId, itemType, itemName, quantity, unit, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.recipeId, item.itemId, item.type, item.name, item.qty, item.unit, item.cost]
    );
  });

  // Calculate and update costs
  updateRecipeCosts(database);
}

// Calculate costs for all recipes
function updateRecipeCosts(database: Database) {
  // First, calculate sub-recipe costs
  const subRecipes = database.exec('SELECT id FROM recipes WHERE isSubRecipe = 1');
  
  if (subRecipes.length > 0 && subRecipes[0].values.length > 0) {
    subRecipes[0].values.forEach((row) => {
      const recipeId = row[0] as string;
      const cost = calculateRecipeCost(database, recipeId);
      
      database.run('UPDATE recipes SET totalCost = ? WHERE id = ?', [cost, recipeId]);
    });
  }

  // Then calculate main recipe costs
  const mainRecipes = database.exec('SELECT id, yieldQuantity FROM recipes WHERE isSubRecipe = 0');
  
  if (mainRecipes.length > 0 && mainRecipes[0].values.length > 0) {
    mainRecipes[0].values.forEach((row) => {
      const recipeId = row[0] as string;
      const yieldQuantity = row[1] as number;
      const cost = calculateRecipeCost(database, recipeId);
      const costPerPortion = cost / yieldQuantity;
      
      database.run('UPDATE recipes SET totalCost = ?, costPerPortion = ? WHERE id = ?', 
        [cost, costPerPortion, recipeId]);
    });
  }
}

function calculateRecipeCost(database: Database, recipeId: string): number {
  let totalCost = 0;

  const items = database.exec(
    'SELECT itemId, itemType, quantity, unit FROM recipe_line_items WHERE recipeId = ?',
    [recipeId]
  );

  if (items.length === 0 || items[0].values.length === 0) return 0;

  items[0].values.forEach((row) => {
    const itemId = row[0] as string;
    const itemType = row[1] as string;
    const quantity = row[2] as number;
    const unit = row[3] as string;

    let itemCost = 0;

    if (itemType === 'ingredient') {
      // Get cost per base unit from purchase_items
      const purchaseInfo = database.exec(
        'SELECT costPerBaseUnit FROM purchase_items WHERE ingredientId = ?',
        [itemId]
      );

      if (purchaseInfo.length > 0 && purchaseInfo[0].values.length > 0) {
        const costPerBaseUnit = purchaseInfo[0].values[0][0] as number;
        
        // Get ingredient base unit
        const ingredientInfo = database.exec(
          'SELECT baseUnit FROM ingredients WHERE id = ?',
          [itemId]
        );

        if (ingredientInfo.length > 0 && ingredientInfo[0].values.length > 0) {
          const baseUnit = ingredientInfo[0].values[0][0] as string;

          // If unit matches base unit, direct calculation
          if (unit === baseUnit) {
            itemCost = quantity * costPerBaseUnit;
          } else {
            // For now, assume direct conversion (in production, use unit_conversions table)
            itemCost = quantity * costPerBaseUnit;
          }
        }
      }
    } else if (itemType === 'recipe') {
      // Get sub-recipe total cost
      const subRecipeInfo = database.exec(
        'SELECT totalCost FROM recipes WHERE id = ?',
        [itemId]
      );

      if (subRecipeInfo.length > 0 && subRecipeInfo[0].values.length > 0) {
        const subRecipeCost = subRecipeInfo[0].values[0][0] as number;
        itemCost = subRecipeCost * quantity;
      }
    }

    totalCost += itemCost;

    // Update the line item cost
    database.run(
      'UPDATE recipe_line_items SET cost = ? WHERE recipeId = ? AND itemId = ?',
      [itemCost, recipeId, itemId]
    );
  });

  return totalCost;
}

// Export functions for CRUD operations

export async function getAllRecipes(): Promise<Recipe[]> {
  const database = await initializeDatabase();
  const result = database.exec('SELECT * FROM recipes ORDER BY isSubRecipe ASC, name ASC');
  
  if (result.length === 0 || result[0].values.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0] as string,
    name: row[1] as string,
    description: row[2] as string,
    isSubRecipe: Boolean(row[3]),
    yieldQuantity: row[4] as number,
    yieldUnit: row[5] as string,
    prepTime: row[6] as number || undefined,
    cookTime: row[7] as number || undefined,
    instructions: row[8] as string || undefined,
    totalCost: row[9] as number,
    costPerPortion: row[10] as number,
    imageUrl: row[11] as string || undefined,
    createdDate: new Date(row[12] as string),
    lastUpdated: new Date(row[13] as string),
  }));
}

export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  const database = await initializeDatabase();
  const result = database.exec('SELECT * FROM recipes WHERE id = ?', [recipeId]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;

  const row = result[0].values[0];
  return {
    id: row[0] as string,
    name: row[1] as string,
    description: row[2] as string,
    isSubRecipe: Boolean(row[3]),
    yieldQuantity: row[4] as number,
    yieldUnit: row[5] as string,
    prepTime: row[6] as number || undefined,
    cookTime: row[7] as number || undefined,
    instructions: row[8] as string || undefined,
    totalCost: row[9] as number,
    costPerPortion: row[10] as number,
    imageUrl: row[11] as string || undefined,
    createdDate: new Date(row[12] as string),
    lastUpdated: new Date(row[13] as string),
  };
}

export async function getRecipeLineItems(recipeId: string): Promise<RecipeLineItem[]> {
  const database = await initializeDatabase();
  const result = database.exec('SELECT * FROM recipe_line_items WHERE recipeId = ?', [recipeId]);
  
  if (result.length === 0 || result[0].values.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0] as string,
    recipeId: row[1] as string,
    itemId: row[2] as string,
    itemType: row[3] as 'ingredient' | 'recipe',
    itemName: row[4] as string,
    quantity: row[5] as number,
    unit: row[6] as string,
    cost: row[7] as number,
    notes: row[8] as string || undefined,
  }));
}

export async function getAllIngredients(): Promise<Ingredient[]> {
  const database = await initializeDatabase();
  const result = database.exec('SELECT * FROM ingredients ORDER BY name ASC');
  
  if (result.length === 0 || result[0].values.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0] as string,
    name: row[1] as string,
    baseUnit: row[2] as 'g' | 'ml' | 'each',
    yieldPercent: row[3] as number,
    category: row[4] as string || undefined,
  }));
}

export async function getAllPurchaseItems(): Promise<PurchaseItem[]> {
  const database = await initializeDatabase();
  const result = database.exec('SELECT * FROM purchase_items ORDER BY ingredientName ASC');
  
  if (result.length === 0 || result[0].values.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0] as string,
    ingredientId: row[1] as string,
    ingredientName: row[2] as string,
    supplierName: row[3] as string,
    purchasePrice: row[4] as number,
    purchaseQuantity: row[5] as number,
    purchaseUnit: row[6] as string,
    costPerBaseUnit: row[7] as number,
    lastUpdated: new Date(row[8] as string),
  }));
}

export async function recalculateRecipeCosts(): Promise<void> {
  const database = await initializeDatabase();
  updateRecipeCosts(database);
}

// Update recipe
export async function updateRecipe(recipe: Partial<Recipe> & { id: string }): Promise<void> {
  const database = await initializeDatabase();
  const now = new Date().toISOString();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (recipe.name !== undefined) {
    updates.push('name = ?');
    values.push(recipe.name);
  }
  if (recipe.description !== undefined) {
    updates.push('description = ?');
    values.push(recipe.description);
  }
  if (recipe.isSubRecipe !== undefined) {
    updates.push('isSubRecipe = ?');
    values.push(recipe.isSubRecipe ? 1 : 0);
  }
  if (recipe.yieldQuantity !== undefined) {
    updates.push('yieldQuantity = ?');
    values.push(recipe.yieldQuantity);
  }
  if (recipe.yieldUnit !== undefined) {
    updates.push('yieldUnit = ?');
    values.push(recipe.yieldUnit);
  }
  if (recipe.prepTime !== undefined) {
    updates.push('prepTime = ?');
    values.push(recipe.prepTime);
  }
  if (recipe.cookTime !== undefined) {
    updates.push('cookTime = ?');
    values.push(recipe.cookTime);
  }
  if (recipe.instructions !== undefined) {
    updates.push('instructions = ?');
    values.push(recipe.instructions);
  }
  
  updates.push('lastUpdated = ?');
  values.push(now);
  values.push(recipe.id);
  
  database.run(
    `UPDATE recipes SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  // Recalculate costs
  updateRecipeCosts(database);
}

// Update recipe line item
export async function updateRecipeLineItem(
  lineItemId: string,
  updates: Partial<RecipeLineItem>
): Promise<void> {
  const database = await initializeDatabase();
  
  const updateFields: string[] = [];
  const values: any[] = [];
  
  if (updates.itemId !== undefined) {
    updateFields.push('itemId = ?');
    values.push(updates.itemId);
  }
  if (updates.itemType !== undefined) {
    updateFields.push('itemType = ?');
    values.push(updates.itemType);
  }
  if (updates.itemName !== undefined) {
    updateFields.push('itemName = ?');
    values.push(updates.itemName);
  }
  if (updates.quantity !== undefined) {
    updateFields.push('quantity = ?');
    values.push(updates.quantity);
  }
  if (updates.unit !== undefined) {
    updateFields.push('unit = ?');
    values.push(updates.unit);
  }
  if (updates.notes !== undefined) {
    updateFields.push('notes = ?');
    values.push(updates.notes);
  }
  
  if (updateFields.length === 0) return;
  
  values.push(lineItemId);
  
  database.run(
    `UPDATE recipe_line_items SET ${updateFields.join(', ')} WHERE id = ?`,
    values
  );
  
  // Recalculate costs
  updateRecipeCosts(database);
}

// Add recipe line item
export async function addRecipeLineItem(lineItem: Omit<RecipeLineItem, 'id' | 'cost'>): Promise<string> {
  const database = await initializeDatabase();
  const id = `li-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  database.run(
    'INSERT INTO recipe_line_items (id, recipeId, itemId, itemType, itemName, quantity, unit, cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      lineItem.recipeId,
      lineItem.itemId,
      lineItem.itemType,
      lineItem.itemName,
      lineItem.quantity,
      lineItem.unit,
      0,
      lineItem.notes || null,
    ]
  );
  
  // Recalculate costs
  updateRecipeCosts(database);
  
  return id;
}

// Delete recipe line item
export async function deleteRecipeLineItem(lineItemId: string): Promise<void> {
  const database = await initializeDatabase();
  
  // Get recipeId before deleting
  const result = database.exec('SELECT recipeId FROM recipe_line_items WHERE id = ?', [lineItemId]);
  const recipeId = result.length > 0 && result[0].values.length > 0 
    ? result[0].values[0][0] as string 
    : null;
  
  database.run('DELETE FROM recipe_line_items WHERE id = ?', [lineItemId]);
  
  // Recalculate costs
  if (recipeId) {
    updateRecipeCosts(database);
  }
}

// Update purchase item
export async function updatePurchaseItem(
  purchaseItemId: string,
  updates: Partial<PurchaseItem>
): Promise<void> {
  const database = await initializeDatabase();
  const now = new Date().toISOString();
  
  const updateFields: string[] = [];
  const values: any[] = [];
  
  if (updates.supplierName !== undefined) {
    updateFields.push('supplierName = ?');
    values.push(updates.supplierName);
  }
  if (updates.purchasePrice !== undefined) {
    updateFields.push('purchasePrice = ?');
    values.push(updates.purchasePrice);
  }
  if (updates.purchaseQuantity !== undefined) {
    updateFields.push('purchaseQuantity = ?');
    values.push(updates.purchaseQuantity);
  }
  if (updates.purchaseUnit !== undefined) {
    updateFields.push('purchaseUnit = ?');
    values.push(updates.purchaseUnit);
  }
  
  // Recalculate costPerBaseUnit if price or quantity changed
  if (updates.purchasePrice !== undefined || updates.purchaseQuantity !== undefined) {
    // Get ingredient base unit
    const purchaseItem = database.exec('SELECT ingredientId, purchasePrice, purchaseQuantity, purchaseUnit FROM purchase_items WHERE id = ?', [purchaseItemId]);
    if (purchaseItem.length > 0 && purchaseItem[0].values.length > 0) {
      const row = purchaseItem[0].values[0];
      const ingredientId = row[0] as string;
      const price = updates.purchasePrice !== undefined ? updates.purchasePrice : row[1] as number;
      const qty = updates.purchaseQuantity !== undefined ? updates.purchaseQuantity : row[2] as number;
      const unit = updates.purchaseUnit !== undefined ? updates.purchaseUnit : row[3] as string;
      
      // Get ingredient base unit
      const ingredient = database.exec('SELECT baseUnit FROM ingredients WHERE id = ?', [ingredientId]);
      if (ingredient.length > 0 && ingredient[0].values.length > 0) {
        const baseUnit = ingredient[0].values[0][0] as string;
        
        // Convert purchase quantity to base unit
        let qtyInBaseUnit = qty;
        if (unit === 'kg' && baseUnit === 'g') {
          qtyInBaseUnit = qty * 1000;
        } else if (unit === 'l' && baseUnit === 'ml') {
          qtyInBaseUnit = qty * 1000;
        }
        
        const costPerBaseUnit = price / qtyInBaseUnit;
        updateFields.push('costPerBaseUnit = ?');
        values.push(costPerBaseUnit);
      }
    }
  }
  
  updateFields.push('lastUpdated = ?');
  values.push(now);
  values.push(purchaseItemId);
  
  database.run(
    `UPDATE purchase_items SET ${updateFields.join(', ')} WHERE id = ?`,
    values
  );
  
  // Recalculate all recipe costs since prices changed
  updateRecipeCosts(database);
}

