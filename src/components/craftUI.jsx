import Phaser from 'phaser';

class CraftUI extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this); // add to the scene display list

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

    for (let i = 0; i < 3; i++) {
      const slot = scene.add.rectangle(-slotSpacing + i * slotSpacing, -30, 40, 40, 0xeeeeee)
        .setStrokeStyle(1, 0x999999)
        .setOrigin(0.5);
      slot.setInteractive({ useHandCursor: true });
      this.ingredientSlots.push(slot);
      this.add(slot);
    }

    // Output slot
    this.outputSlot = scene.add.rectangle(0, 30, 40, 40, 0xfff5cc)
      .setStrokeStyle(1, 0xccaa66)
      .setOrigin(0.5);
    this.add(this.outputSlot);

    // Craft Button
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
  }

  setIngredients(items) {
    this.ingredientSlots.forEach((slot, index) => {
      slot.item = items[index] || null;
    
    });
  }

  craftSomething() {
    const ingredients = this.ingredientSlots.map(s => s.item);
    if (ingredients.every(item => item)) {
      console.log('Crafting with:', ingredients);
    } else {
      console.log('Missing ingredients...');
    }
  }
}

export default CraftUI;
