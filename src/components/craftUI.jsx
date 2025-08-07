import Phaser from 'phaser';
import recipieData from '../recipieData';
import { receivedItem } from './recievedItem';
import { inventoryManager } from './inventoryManager';

class CraftUI extends Phaser.Scene {
  constructor() {
    super({ key: 'CraftUI' });
    this.ingredientSlots = [];
    this.inventorySprites = [];
    this._takeItemBtnMainTaken = false;
    this.lastCraftedResult = null;
  }

  preload() {
    this.load.image('craftUIBg', '/assets/ui-items/overlayBg.png');

    if (Array.isArray(recipieData)) {
      recipieData.forEach(recipe => {
        if (recipe.result && recipe.result.imageKey && !this.textures.exists(recipe.result.imageKey)) {
          this.load.image(recipe.result.imageKey, `/assets/item-images/${recipe.result.imageKey}.png`);
        }
      });
    }
    // Optionally preload a default image
    if (!this.textures.exists('coin')) {
      this.load.image('coin', '/assets/item-images/coin.png');
    }
  }

  create() {
    const { width, height } = this.sys.game.config;

    if (this.textures.exists('craftUIBg')) {
      this.add.image(width / 2, height / 2, 'craftUIBg')
        .setDisplaySize(300, 200)
        .setOrigin(0.5);
    } else {
      this.add.rectangle(width / 2, height / 2, 300, 200, 0xffffff, 0.9)
        .setStrokeStyle(2, 0xaaaaaa)
        .setOrigin(0.5);
    }

    // Title
    this.add.text(width / 2, height / 2 - 80, 'Potion Crafting', {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#333',
    }).setOrigin(0.5);

    // X (close) button
    const closeBtn = this.add.text(width / 2 + 135, height / 2 - 90, '✖', {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#a33',
      backgroundColor: '#fff',
      padding: { left: 6, right: 6, top: 2, bottom: 2 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(1001);

    closeBtn.on('pointerover', () => {
      closeBtn.setStyle({ color: '#fff', backgroundColor: '#a33' });
    });
    closeBtn.on('pointerout', () => {
      closeBtn.setStyle({ color: '#a33', backgroundColor: '#fff' });
    });
    closeBtn.on('pointerdown', () => {
      this.scene.stop(); // Close the CraftUI overlay
    });

    // Ingredient slots
    this.ingredientSlots = [];
    const slotSpacing = 70;
    for (let i = 0; i < 3; i++) {
      const slotX = width / 2 - slotSpacing + i * slotSpacing;
      const slotY = height / 2 - 30;
      const slot = this.add.rectangle(slotX, slotY, 64, 64, 0xeeeeee)
        .setStrokeStyle(2, 0x999999)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      slot.item = null;
      slot.text = null;
      slot.image = null;
      slot.index = i; // Track which slot this is

      slot.on('pointerdown', () => {
        // Save reference to the slot being selected
        this.selectedIngredientSlot = slot;
        this.scene.bringToTop('OpenInventory'); // Ensure inventory is on top
        this.scene.launch('OpenInventory', {
          mode: 'selectItemForCraft',
          onSelect: (item) => {
            // DO NOT REMOVE FROM INVENTORY HERE!
            // Just place item in the correct slot
            const targetSlot = this.selectedIngredientSlot;
            targetSlot.item = item;
            if (targetSlot.text) targetSlot.text.destroy();
            if (targetSlot.image) targetSlot.image.destroy();
            if (item.imageKey && this.textures.exists(item.imageKey)) {
              targetSlot.image = this.add.image(slotX, slotY, item.imageKey)
                .setScale(0.18).setOrigin(0.5);
              targetSlot.text = null;
            } else {
              targetSlot.text = this.add.text(
                slotX, slotY + 22,
                item.name || item.key,
                { fontSize: '12px', color: '#222', backgroundColor: '#fff8', padding: { left: 2, right: 2, top: 1, bottom: 1 } }
              ).setOrigin(0.5);
              targetSlot.image = null;
            }
            this.selectedIngredientSlot = null; // Clear selection
          }
        });
      });
      this.ingredientSlots.push(slot);
    }

    // Output slot
    this.outputSlot = this.add.rectangle(width / 2, height / 2 + 30, 64, 64, 0xfff5cc)
      .setStrokeStyle(2, 0xccaa66)
      .setOrigin(0.5);

    // Craft button
    this.craftButton = this.add.text(width / 2 - 50, height / 2 + 90, 'Craft!', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      backgroundColor: '#88cc88',
      color: '#fff',
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.craftButton.on('pointerover', () => {
      this.craftButton.setStyle({ backgroundColor: '#66bb66' });
    });
    this.craftButton.on('pointerout', () => {
      this.craftButton.setStyle({ backgroundColor: '#88cc88' });
    });
    this.craftButton.on('pointerdown', () => {
      this.craftSomething();
    });

    // Take Item button
    this.takeItemBtnMain = this.add.text(width / 2 + 50, height / 2 + 90, 'Take Item', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      backgroundColor: '#aaa',
      color: '#444',
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.takeItemBtnMain.setAlpha(0.5);
    this.takeItemBtnMain.disableInteractive();
    this._takeItemBtnMainTaken = false;
    this.takeItemBtnMain.on('pointerdown', () => {
      if (this._takeItemBtnMainTaken) return;
      if (!this.lastCraftedResult) return;
      this._takeItemBtnMainTaken = true;
      if (inventoryManager && inventoryManager.addItem) {
        inventoryManager.addItem(this.lastCraftedResult);
      }
      if (typeof receivedItem === 'function') {
        let itemKey = this.lastCraftedResult.key || this.lastCraftedResult.itemKey;
        let itemName = this.lastCraftedResult.name || this.lastCraftedResult.itemName;
        if (!itemName) itemName = itemKey;
        receivedItem(this, itemKey, itemName);
      }
      this.takeItemBtnMain.setText('Taken!');
      this.takeItemBtnMain.setStyle({ backgroundColor: '#aaa', color: '#444' });
      this.takeItemBtnMain.setAlpha(0.5);
      this.takeItemBtnMain.disableInteractive();
    });
  }

  craftSomething() {
    const ingredients = this.ingredientSlots.map(s => s.item);
    if (ingredients.every(item => item)) {
      const selectedOrder = ingredients.map(item => item && item.key);
      const match = recipieData.find(recipe => {
        if (!recipe.order) return false;
        return recipe.order.length === selectedOrder.length &&
          recipe.order.every((key, idx) => key === selectedOrder[idx]);
      });
      if (match) {
        alert('Removing these keys from inventory: ' + JSON.stringify(match.order));

        // Remove items from inventory ONLY AFTER CRAFTING
        if (inventoryManager && typeof inventoryManager.removeItemByKey === 'function') {
          match.order.forEach(key => {
            const before = JSON.stringify(inventoryManager.items);
            inventoryManager.removeItemByKey(key);
            const after = JSON.stringify(inventoryManager.items);
            alert(`Tried to remove "${key}".\nBefore: ${before}\nAfter: ${after}`);
          });
        } else {
          alert('inventoryManager or removeItemByKey is not available!');
        }

        // Fetch inventory again and update UI (if you have a method for this)
        if (typeof this.refreshInventoryUI === 'function') {
          this.refreshInventoryUI();
        }
        if (this.scene.isActive('OpenInventory') && this.scene.get('OpenInventory').refreshInventoryUI) {
          this.scene.get('OpenInventory').refreshInventoryUI();
        }

        // Clear ingredient slots and show result
        this.ingredientSlots.forEach((slot, i) => {
          slot.item = null;
          if (slot.text) slot.text.destroy();
          if (slot.image) slot.image.destroy();
          slot.text = null;
          slot.image = null;
        });
        this.outputSlot.setFillStyle(0xccffcc);
        if (this.outputText) this.outputText.destroy();
        if (this.outputImage) this.outputImage.destroy();
        const { width, height } = this.sys.game.config;
        if (match.result.imageKey && this.textures.exists(match.result.imageKey)) {
          this.outputImage = this.add.image(width / 2, height / 2 + 60, match.result.imageKey)
            .setScale(0.18).setOrigin(0.5);
          this.outputText = null;
        } else {
          this.outputText = this.add.text(
            width / 2,
            height / 2 + 60,
            match.result.name || match.result.key,
            { fontSize: '16px', color: '#228B22', backgroundColor: '#fff8', padding: { left: 6, right: 6, top: 3, bottom: 3 } }
          ).setOrigin(0.5);
          this.outputImage = null;
        }
        this.lastCraftedResult = {
          ...match.result,
          key: match.result.key || selectedOrder[0],
          name: match.result.name || match.result.itemName || ''
        };
        this._takeItemBtnMainTaken = false;
        this.takeItemBtnMain.setText('Take Item');
        this.takeItemBtnMain.setStyle({ backgroundColor: '#228B22', color: '#fff' });
        this.takeItemBtnMain.setAlpha(1);
        this.takeItemBtnMain.setInteractive({ useHandCursor: true });
      } else {
        this.outputSlot.setFillStyle(0xffcccc);
        if (this.outputText) this.outputText.destroy();
        if (this.outputImage) this.outputImage.destroy();
        const { width, height } = this.sys.game.config;
        this.outputText = this.add.text(
          width / 2,
          height / 2 + 60,
          'No matching recipe.',
          { fontSize: '14px', color: '#a33', backgroundColor: '#fff8', padding: { left: 4, right: 4, top: 2, bottom: 2 } }
        ).setOrigin(0.5);
      }
    } else {
      if (this.outputText) this.outputText.destroy();
      if (this.outputImage) this.outputImage.destroy();
      const { width, height } = this.sys.game.config;
      this.outputSlot.setFillStyle(0xffcccc);
      this.outputText = this.add.text(
        width / 2,
        height / 2 + 60,
        'Select all ingredients!',
        { fontSize: '14px', color: '#a33', backgroundColor: '#fff8', padding: { left: 4, right: 4, top: 2, bottom: 2 } }
      ).setOrigin(0.5);
    }
  }
}

export default CraftUI;
