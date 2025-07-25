import Phaser from 'phaser';

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

    // Ingredient slots as drop zones
    this.ingredientSlots = [];
    const slotSpacing = 50;
    for (let i = 0; i < 3; i++) {
      const slot = scene.add.rectangle(-slotSpacing + i * slotSpacing, -30, 40, 40, 0xeeeeee)
        .setStrokeStyle(1, 0x999999)
        .setOrigin(0.5)
        .setInteractive({ dropZone: true });
      slot.item = null;
      slot.text = null;
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
        dropZone.x + this.x,
        dropZone.y + this.y + 22,
        gameObject.itemData.name || gameObject.itemData.key,
        { fontSize: '12px', color: '#222', backgroundColor: '#fff8', padding: { left: 2, right: 2, top: 1, bottom: 1 } }
      ).setOrigin(0.5);
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
    // For drag-and-drop, just update slot.item and slot.text
    this.ingredientSlots.forEach((slot, index) => {
      slot.item = items[index] || null;
      if (slot.text) slot.text.destroy();
      if (slot.item) {
        slot.text = this.scene.add.text(
          slot.x + this.x,
          slot.y + this.y + 22,
          slot.item.name || slot.item.key,
          {
            fontSize: '12px',
            color: '#222',
            backgroundColor: '#fff8',
            padding: { left: 2, right: 2, top: 1, bottom: 1 }
          }
        ).setOrigin(0.5);
      } else {
        slot.text = null;
      }
    });
  }

  craftSomething() {
    const ingredients = this.ingredientSlots.map(s => s.item);
    if (ingredients.every(item => item)) {
      // Call your crafting logic
      if (this.scene.tryCraft) {
        const result = this.scene.tryCraft(ingredients, this.scene.inventoryManager);
        if (result.success) {
          this.outputSlot.setFillStyle(0xccffcc);
          if (this.outputText) this.outputText.destroy();
          this.outputText = this.scene.add.text(
            this.x,
            this.y + 30,
            `Crafted: ${result.result.name || result.result.key}`,
            { fontSize: '14px', color: '#228B22', backgroundColor: '#fff8', padding: { left: 4, right: 4, top: 2, bottom: 2 } }
          ).setOrigin(0.5);
        } else {
          this.outputSlot.setFillStyle(0xffcccc);
          if (this.outputText) this.outputText.destroy();
          this.outputText = this.scene.add.text(
            this.x,
            this.y + 30,
            result.message,
            { fontSize: '14px', color: '#a33', backgroundColor: '#fff8', padding: { left: 4, right: 4, top: 2, bottom: 2 } }
          ).setOrigin(0.5);
        }
      } else {
        console.log('Crafting with:', ingredients.map(i => i.name || i.key).join(', '));
      }
    } else {
      if (this.outputText) this.outputText.destroy();
      this.outputSlot.setFillStyle(0xffcccc);
      this.outputText = this.scene.add.text(
        this.x,
        this.y + 30,
        { fontSize: '14px', color: '#a33', backgroundColor: '#fff8', padding: { left: 4, right: 4, top: 2, bottom: 2 } }
      ).setOrigin(0.5);
    }
  }
}

export default CraftUI;
