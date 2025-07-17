

export const recipes = [
  {
    ingredients: ['garlicPlant', 'thymePlant'],
    result: { key: 'healingPotion', name: 'Healing Potion' }
  },
  {
    ingredients: ['foxglovePlant', 'marigoldPlant'],
    result: { key: 'manaPotion', name: 'Mana Potion' }
  },
  
];

export function tryCraft(selectedItems, inventoryManager) {
  // Get keys of selected items
  const selectedKeys = selectedItems.map(item => item?.key).filter(Boolean);
  // Find a recipe that matches (order-insensitive)
  const match = recipes.find(recipe => {
    if (recipe.ingredients.length !== selectedKeys.length) return false;
    // Check if every ingredient is present
    const keysCopy = [...selectedKeys];
    return recipe.ingredients.every(ing => {
      const idx = keysCopy.indexOf(ing);
      if (idx !== -1) {
        keysCopy.splice(idx, 1);
        return true;
      }
      return false;
    });
  });
  if (!match) {
    return { success: false, message: 'No matching recipe.' };
  }
  // Remove ingredients from inventory
  match.ingredients.forEach(ing => {
    inventoryManager.removeItemByKey && inventoryManager.removeItemByKey(ing);
  });
  // Add result to inventory
  inventoryManager.addItem && inventoryManager.addItem(match.result);
  return { success: true, result: match.result };
}
