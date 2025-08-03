import Phaser from 'phaser';
import recipieData from '../recipieData';

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
    const slotSpacing = 50;
    for (let i = 0; i < 3; i++) {
      const slot = scene.add.rectangle(-slotSpacing + i * slotSpacing, -30, 40, 40, 0xeeeeee)
        .setStrokeStyle(1, 0x999999)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      slot.item = null;
      slot.text = null;
      // On click, open inventory in select mode
      slot.on('pointerdown', () => {
        // Launch inventory in select mode, pass callback
        scene.scene.launch('OpenInventory', {
          mode: 'selectItemForCraft',
          onSelect: (item) => {
            slot.item = item;
            // Remove previous text if any
            if (slot.text) slot.text.destroy();
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
          }
        });
      });
      this.ingredientSlots.push(slot);
      this.add(slot);
    }

    // Output slot
    this.outputSlot = scene.add.rectangle(0, 30, 40, 40, 0xfff5cc)
      .setStrokeStyle(1, 0xccaa66)
      .setOrigin(0.5);
    this.add(this.outputSlot);

    // Craft button
    this.craftButton = scene.add.text(0, 90, 'Craft!', {
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
    // For drag-and-drop, just update slot.item and show imageKey as text
    this.ingredientSlots.forEach((slot, index) => {
      slot.item = items[index] || null;
      if (slot.text) slot.text.destroy();
      if (slot.image) slot.image.destroy();
      if (slot.item && slot.item.imageKey) {
        slot.text = this.scene.add.text(
          slot.x + this.x,
          slot.y + this.y + 10,
          slot.item.imageKey,
          {
            fontSize: '12px',
            color: '#222',
            backgroundColor: '#fff8',
            padding: { left: 2, right: 2, top: 1, bottom: 1 }
          }
        ).setOrigin(0.5);
        this.add(slot.text);
        slot.image = null;
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
        this.outputSlot.setFillStyle(0xccffcc);
        if (this.outputText) this.outputText.destroy();
        if (this.outputImage) this.outputImage.destroy();
        if (match.result.imageKey) {
          this.outputText = this.scene.add.text(
            this.outputSlot.x,
            this.outputSlot.y + 10,
            match.result.imageKey,
            { fontSize: '14px', color: '#228B22', backgroundColor: '#fff8', padding: { left: 4, right: 4, top: 2, bottom: 2 } }
          ).setOrigin(0.5);
          this.outputText.setInteractive({ useHandCursor: true, pixelPerfect: true, pointerEvents: true });
          this.outputText.input.alwaysEnabled = true;
          this.add(this.outputText);
          // Add click handler to add to inventory and call recievedItem, only once per craft
          let added = false;
          this.outputText.on('pointerdown', (pointer, localX, localY, event) => {
            alert('Crafted item clicked!');
            if (added) {
              alert('Already added to inventory.');
              return;
            }
            added = true;
            if (this.scene.inventoryManager && this.scene.inventoryManager.addItem) {
              alert('Adding to inventory: ' + JSON.stringify(match.result));
              this.scene.inventoryManager.addItem(match.result);
            }
            if (typeof this.scene.recievedItem === 'function') {
              alert('Calling recievedItem function.');
              this.scene.recievedItem(match.result);
            } else if (this.scene.scene && typeof this.scene.scene.launch === 'function') {
              alert('Launching RecievedItem overlay.');
              this.scene.scene.launch('RecievedItem', { item: match.result });
            }
            if (event && event.stopPropagation) event.stopPropagation();
          });
        }
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
