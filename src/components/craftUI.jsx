import Phaser from 'phaser';
import recipieData from '../recipieData';
import { receivedItem } from './recievedItem';
import { inventoryManager } from './inventoryManager';

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

    // X (close) button
    this.closeBtn = scene.add.text(135, -90, '✖', {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#a33',
      backgroundColor: '#fff',
      padding: { left: 6, right: 6, top: 2, bottom: 2 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(1001);

    this.closeBtn.on('pointerover', () => {
      this.closeBtn.setStyle({ color: '#fff', backgroundColor: '#a33' });
    });
    this.closeBtn.on('pointerout', () => {
      this.closeBtn.setStyle({ color: '#a33', backgroundColor: '#fff' });
    });
    this.closeBtn.on('pointerdown', () => {
      this.destroy(); // Remove the CraftUI container and all children
    });
    this.add(this.closeBtn);

    // Ingredient slots
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
      slot.on('pointerdown', () => {
        scene.scene.launch('OpenInventory', {
          mode: 'selectItemForCraft',
          onSelect: (item) => {
            // Remove from inventory immediately
            if (typeof inventoryManager.removeItemByKey === 'function') {
              inventoryManager.removeItemByKey(item.key);
              this.showInventoryDraggables(); // Refresh inventory UI
            }
            slot.item = item;
            if (slot.text) slot.text.destroy();
            if (slot.image) slot.image.destroy();
            if (item.imageKey) {
              slot.image = scene.add.image(slot.x, slot.y, item.imageKey)
                .setScale(0.06).setOrigin(0.5);
              this.add(slot.image);
              slot.text = null;
            } else {
              slot.text = scene.add.text(
                slot.x, slot.y + 22,
                item.name || item.key,
                { fontSize: '12px', color: '#222', backgroundColor: '#fff8', padding: { left: 2, right: 2, top: 1, bottom: 1 } }
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

    // Take Item button
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
        receivedItem(this.scene, itemKey, itemName);
      }
      this.takeItemBtnMain.setText('Taken!');
      this.takeItemBtnMain.setStyle({ backgroundColor: '#aaa', color: '#444' });
      this.takeItemBtnMain.setAlpha(0.5);
      this.takeItemBtnMain.disableInteractive();
    });

    // Inventory sprites
    this.inventorySprites = [];
    this.showInventoryDraggables();

    // Drag events
    scene.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setAlpha(0.5);
    });
    scene.input.on('dragend', (pointer, gameObject) => {
      gameObject.setAlpha(1);
    });
    scene.input.on('drop', (pointer, gameObject, dropZone) => {
      dropZone.item = gameObject.itemData;
      gameObject.x = dropZone.x + this.x;
      gameObject.y = dropZone.y + this.y;
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
    if (this.inventorySprites) this.inventorySprites.forEach(spr => spr.destroy());
    this.inventorySprites = [];
    // Always use inventoryManager.items directly
    inventoryManager.items.forEach((item, i) => {
      const spr = this.scene.add.image(this.x - 120 + i * 48, this.y + 80, item.imageKey || 'coin')
        .setScale(0.18)
        .setInteractive({ draggable: true, useHandCursor: true });
      this.add(spr); 
      spr.itemData = item;
      this.inventorySprites.push(spr);
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
        // Remove used ingredients from inventory immediately after crafting
        if (typeof inventoryManager.removeItemByKey === 'function') {
          selectedOrder.forEach(key => {
            inventoryManager.removeItemByKey(key);
          });
        }
        this.showInventoryDraggables(); // Refresh inventory UI

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
        this.outputText = this.scene.add.text(
          this.outputSlot.x,
          this.outputSlot.y + 30,
          match.result.name || match.result.key,
          { fontSize: '16px', color: '#228B22', backgroundColor: '#fff8', padding: { left: 6, right: 6, top: 3, bottom: 3 } }
        ).setOrigin(0.5);
        this.add(this.outputText);
        // Store last crafted result for Take Item button
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
