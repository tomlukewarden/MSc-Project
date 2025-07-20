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

    // Ingredient slots
    this.ingredientSlots = [];
    const slotSpacing = 50;
    this.selectedSlot = null;

    for (let i = 0; i < 3; i++) {
      const slot = scene.add.rectangle(-slotSpacing + i * slotSpacing, -30, 40, 40, 0xeeeeee)
        .setStrokeStyle(1, 0x999999)
        .setOrigin(0.5);
      slot.setInteractive({ useHandCursor: true });
      slot.item = null;
      slot.text = null;

      slot.on('pointerdown', () => {
        this.selectedSlot = slot;
        this.showInventorySelection();
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
    this.inventoryTexts = [];
  }

  showInventorySelection() {
    if (this.inventoryTexts) this.inventoryTexts.forEach(txt => txt.destroy());
    this.inventoryTexts = [];

    this.inventory.forEach((item, i) => {
      const alreadyUsed = this.ingredientSlots.some(
        slot => slot.item && slot.item.key === item.key && slot !== this.selectedSlot
      );
      if (alreadyUsed) return;

      const txt = this.scene.add.text(this.x - 120, this.y + 80 + i * 24, item.name || item.key, {
        fontSize: '16px',
        color: '#333',
        backgroundColor: '#e0cda9',
        padding: { left: 6, right: 6, top: 2, bottom: 2 }
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

      txt.on('pointerdown', () => {
        this.selectedSlot.item = item;

        if (this.selectedSlot.text) this.selectedSlot.text.destroy();
        this.selectedSlot.text = this.scene.add.text(
          this.selectedSlot.x + this.x,
          this.selectedSlot.y + this.y,
          item.name || item.key,
          {
            fontSize: '14px',
            color: '#222',
            backgroundColor: '#fff8',
            padding: { left: 2, right: 2, top: 1, bottom: 1 }
          }
        ).setOrigin(0.5);

        this.inventoryTexts.forEach(t => t.destroy());
        this.inventoryTexts = [];
      });

      this.inventoryTexts.push(txt);
    });
  }

  setIngredients(items) {
    this.ingredientSlots.forEach((slot, index) => {
      slot.item = items[index] || null;

      if (slot.text) slot.text.destroy();
      if (slot.item) {
        slot.text = this.scene.add.text(
          slot.x + this.x,
          slot.y + this.y,
          slot.item.name || slot.item.key,
          {
            fontSize: '14px',
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
      console.log('🧪 Crafting with:', ingredients.map(i => i.name || i.key).join(', '));
      // Insert actual crafting logic here
    } else {
      console.log('🚫 Missing ingredients!');
    }
  }
}

export default CraftUI;
