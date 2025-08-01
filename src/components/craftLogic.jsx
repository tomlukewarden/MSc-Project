import { recipeData } from '../recipieData';
import { receivedItem } from './recievedItem';

export function tryCraft(selectedItems, inventoryManager) {
  const selectedKeys = selectedItems.map(item => item?.key).filter(Boolean);
  // Find a recipe that matches (order-insensitive)
  const match = recipeData.find(recipe => {
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
  receivedItem(this.scene, match.result);
  return { success: true, result: match.result };
}
