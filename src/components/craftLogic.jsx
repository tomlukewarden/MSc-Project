import { recipeData } from '../recipieData';
import { receivedItem } from './recievedItem';

export function tryCraft(selectedItems, inventoryManager) {
  // Build selected order array
  const selectedOrder = selectedItems.map(item => item && item.key);
  // Find a recipe that matches by order and ingredient amounts
  const match = recipeData.find(recipe => {
    if (!recipe.order) return false;
    // Must match order exactly
    if (recipe.order.length !== selectedOrder.length) return false;
    for (let i = 0; i < recipe.order.length; i++) {
      if (recipe.order[i] !== selectedOrder[i]) return false;
    }
    // Check ingredient amounts
    const selectedCount = {};
    selectedOrder.forEach(key => {
      selectedCount[key] = (selectedCount[key] || 0) + 1;
    });
    return recipe.ingredients.every(ing => selectedCount[ing.key] === ing.amount);
  });
  if (!match) {
    return { success: false, message: 'No matching recipe.' };
  }
  // Remove correct amount of each ingredient from inventory
  match.ingredients.forEach(ing => {
    for (let i = 0; i < ing.amount; i++) {
      inventoryManager.removeItemByKey && inventoryManager.removeItemByKey(ing.key);
    }
  });
  // Add result to inventory
  inventoryManager.addItem && inventoryManager.addItem(match.result);
  receivedItem && receivedItem(inventoryManager, match.result.key, match.result.name || match.result.key);
  return { success: true, result: match.result };
}
