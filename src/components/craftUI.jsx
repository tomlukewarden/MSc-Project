import Phaser from 'phaser';
import recipieData from '../recipieData';
import { receivedItem } from './recievedItem';

class CraftUI extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;

    // Background
    this.bg = scene.add.rectangle(0, 0, 300, 200, 0xffffff, 0.9)
      .setStrokeStyle(2, 0xaaaaaa)
      .setOrigin(0.5);
    this.add(this.bg);

    // Title
    this.title = scene.add.text(0, -80, 'Potion Crafting', {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#333',
    }).setOrigin(0.5);
    this.add(this.title);

    // Ingredient slots as drop zones or click-to-select
    this.ingredientSlots = [];
    const slotSpacing = 70;
    for (let i = 0; i < 3; i++) {
      const slot = scene.add.rectangle(-slotSpacing + i * slotSpacing, -30, 64, 64, 0xeeeeee)
        .setStrokeStyle(2, 0x999999)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      slot.item = null;
      slot.text = null;
      slot.image = null;
      // On click, open inventory in select mode
      slot.on('pointerdown', () => {
        // Launch inventory in select mode, pass callback
        scene.scene.launch('OpenInventory', {
          mode: 'selectItemForCraft',
          onSelect: (item) => {
            slot.item = item;
            // Remove previous text/image if any
            if (slot.text) slot.text.destroy();
            if (slot.image) slot.image.destroy();
            if (item.imageKey) {
              slot.image = scene.add.image(
                slot.x,
                slot.y,
                item.imageKey
              ).setScale(0.22).setOrigin(0.5);
              this.add(slot.image);
              slot.text = null;
            } else {
              slot.text = scene.add.text(
                slot.x,
                slot.y + 22,
                item.name || item.key,
                {
                  fontSize: '12px',
                  color: '#222',
                  backgroundColor: '#fff8',
                  padding: { left: 2, right: 2, top: 1, bottom: 1 }
                }
              ).setOrigin(0.5);
              this.add(slot.text);
              slot.image = null;
            }
          }
        });
      });
      this.ingredientSlots.push(slot);
      this.add(slot);
    }

    // Output slot
    this.outputSlot = scene.add.rectangle(0, 30, 64, 64, 0xfff5cc)
      .setStrokeStyle(2, 0xccaa66)
      .setOrigin(0.5);
    this.add(this.outputSlot);

    // Craft button
    this.craftButton = scene.add.text(-50, 90, 'Craft!', {
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

    this.add(this.craftButton);

    // Add Take Item button beside Craft button
    this.takeItemBtnMain = scene.add.text(50, 90, 'Take Item', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      backgroundColor: '#aaa',
      color: '#444',
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.add(this.takeItemBtnMain);
    this.takeItemBtnMain.setAlpha(0.5);
    this.takeItemBtnMain.disableInteractive();
    this._takeItemBtnMainTaken = false;
    this.takeItemBtnMain.on('pointerdown', () => {
      alert('[DEBUG] Take Item button pressed');
      if (this._takeItemBtnMainTaken) {
        alert('[DEBUG] Already taken, ignoring.');
        return;
      }
      if (!this.lastCraftedResult) {
        alert('[DEBUG] No crafted result available.');
        return;
      }
      this._takeItemBtnMainTaken = true;
      alert('[DEBUG] Adding item to inventory: ' + JSON.stringify(this.lastCraftedResult));
      if (this.scene.inventoryManager && this.scene.inventoryManager.addItem) {
        this.scene.inventoryManager.addItem(this.lastCraftedResult);
        alert('[DEBUG] Added to inventoryManager.');
      } else {
        alert('[DEBUG] inventoryManager or addItem missing.');
      }
      if (typeof receivedItem === 'function') {
        let itemKey = this.lastCraftedResult.key || this.lastCraftedResult.itemKey;
        let itemName = this.lastCraftedResult.name || this.lastCraftedResult.itemName;
        // Fallback: if itemName is missing, use itemKey
        if (!itemName) itemName = itemKey;
        alert('[DEBUG] Calling imported receivedItem with: ' + itemKey + ', ' + itemName);
        receivedItem(this.scene, itemKey, itemName);
      } else {
        alert('[DEBUG] No receivedItem or scene.launch available.');
      }
      this.takeItemBtnMain.setText('Taken!');
      this.takeItemBtnMain.setStyle({ backgroundColor: '#aaa', color: '#444' });
      this.takeItemBtnMain.setAlpha(0.5);
      this.takeItemBtnMain.disableInteractive();
    });

    // Inventory (set externally or use fallback)
    this.inventory = scene.inventory || [];
    this.inventorySprites = [];

    // Show inventory items as draggable images
    this.showInventoryDraggables();

    // Drag events
    scene.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setAlpha(0.5);
    });
    scene.input.on('dragend', (pointer, gameObject) => {
      gameObject.setAlpha(1);
    });
    scene.input.on('drop', (pointer, gameObject, dropZone) => {
      // Assign item to slot
      dropZone.item = gameObject.itemData;
      // Move sprite to slot
      gameObject.x = dropZone.x + this.x;
      gameObject.y = dropZone.y + this.y;
      // Remove previous text if any
      if (dropZone.text) dropZone.text.destroy();
      dropZone.text = scene.add.text(
        dropZone.x,
        dropZone.y + 22,
        gameObject.itemData.name || gameObject.itemData.key,
        { fontSize: '12px', color: '#222', backgroundColor: '#fff8', padding: { left: 2, right: 2, top: 1, bottom: 1 } }
      ).setOrigin(0.5);
      this.add(dropZone.text);
    });
  }

  showInventoryDraggables() {
    // Remove previous sprites
    if (this.inventorySprites) this.inventorySprites.forEach(spr => spr.destroy());
    this.inventorySprites = [];
    // Show each inventory item as a draggable image
    this.inventory.forEach((item, i) => {
      const spr = this.scene.add.image(this.x - 120 + i * 48, this.y + 80, item.imageKey || 'coin')
        .setScale(0.18)
        .setInteractive({ draggable: true, useHandCursor: true });
      spr.itemData = item;
      this.inventorySprites.push(spr);
    });
  }

  setIngredients(items) {
    // For drag-and-drop, just update slot.item and show image in box if available
    this.ingredientSlots.forEach((slot, index) => {
      slot.item = items[index] || null;
      if (slot.text) slot.text.destroy();
      if (slot.image) slot.image.destroy();
      if (slot.item && slot.item.imageKey) {
        slot.image = this.scene.add.image(
          slot.x + this.x,
          slot.y + this.y,
          slot.item.imageKey
        ).setScale(0.22).setOrigin(0.5);
        this.add(slot.image);
        slot.text = null;
      } else {
        slot.text = null;
        slot.image = null;
      }
    });
  }

  craftSomething() {
    const ingredients = this.ingredientSlots.map(s => s.item);
    alert('Crafting triggered! Ingredients: ' + JSON.stringify(ingredients.map(i => i && i.key)));
    if (ingredients.every(item => item)) {
      alert('All ingredient slots filled.');
      const selectedOrder = ingredients.map(item => item && item.key);
      alert('Selected order: ' + JSON.stringify(selectedOrder));
      const match = recipieData.find(recipe => {
        if (!recipe.order) return false;
        const orderMatch = recipe.order.length === selectedOrder.length && recipe.order.every((key, idx) => key === selectedOrder[idx]);
        if (orderMatch) alert('Found matching recipe: ' + JSON.stringify(recipe));
        return orderMatch;
      });
      if (match) {
        // Remove used ingredients from inventory
        if (this.scene.inventoryManager && typeof this.scene.inventoryManager.removeItemByKey === 'function') {
          selectedOrder.forEach(key => {
            this.scene.inventoryManager.removeItemByKey(key);
          });
        }
        // Clear ingredient slots
        this.ingredientSlots.forEach(slot => {
          slot.item = null;
          if (slot.text) slot.text.destroy();
          if (slot.image) slot.image.destroy();
          slot.text = null;
          slot.image = null;
        });
        this.outputSlot.setFillStyle(0xccffcc);
        if (this.outputText) this.outputText.destroy();
        if (this.outputImage) this.outputImage.destroy();
        // Show crafted item name as text in output slot
        this.outputText = this.scene.add.text(
          this.outputSlot.x,
          this.outputSlot.y + 30,
          match.result.name || match.result.key,
          { fontSize: '16px', color: '#228B22', backgroundColor: '#fff8', padding: { left: 6, right: 6, top: 3, bottom: 3 } }
        ).setOrigin(0.5);
        this.add(this.outputText);
        // Store last crafted result for main Take Item button, ensure key and name are present
        this.lastCraftedResult = {
          ...match.result,
          key: match.result.key || selectedOrder[0],
          name: match.result.name || match.result.itemName || ''
        };
        // Enable and reset Take Item button
        this._takeItemBtnMainTaken = false;
        this.takeItemBtnMain.setText('Take Item');
        this.takeItemBtnMain.setStyle({ backgroundColor: '#228B22', color: '#fff' });
        this.takeItemBtnMain.setAlpha(1);
        this.takeItemBtnMain.setInteractive({ useHandCursor: true });
      } else {
        alert('No matching recipe found for order: ' + JSON.stringify(selectedOrder));
        this.outputSlot.setFillStyle(0xffcccc);
        if (this.outputText) this.outputText.destroy();
        if (this.outputImage) this.outputImage.destroy();
        this.outputText = this.scene.add.text(
          this.outputSlot.x,
          this.outputSlot.y + 30,
          'No matching recipe.',
          { fontSize: '14px', color: '#a33', backgroundColor: '#fff8', padding: { left: 4, right: 4, top: 2, bottom: 2 } }
        ).setOrigin(0.5);
        this.add(this.outputText);
      }
    } else {
      alert('Not all ingredient slots are filled!');
      if (this.outputText) this.outputText.destroy();
      if (this.outputImage) this.outputImage.destroy();
      this.outputSlot.setFillStyle(0xffcccc);
      this.outputText = this.scene.add.text(
        this.outputSlot.x,
        this.outputSlot.y + 30,
        'Select all ingredients!',
        { fontSize: '14px', color: '#a33', backgroundColor: '#fff8', padding: { left: 4, right: 4, top: 2, bottom: 2 } }
      ).setOrigin(0.5);
      this.add(this.outputText);
    }
  }
}

export default CraftUI;
