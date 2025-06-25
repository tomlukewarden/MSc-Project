class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  preload() {
    this.load.image('shopBackground', '/assets/backgrounds/shop/shop.jpg');
    this.load.image('item1', '/assets/plants/seeds.png');
    this.load.image('item2', '/assets/plants/foxglove.png');
  }

  create() {
    const { width, height } = this.scale;

    // Main shop background
    this.add.image(width / 2, height / 2, 'shopBackground').setDepth(0).setScale(0.225);

    // Shop items data
    const items = [
      { key: 'item1', name: 'Seeds' },
      { key: 'item2', name: 'Foxglove' },
    ];

    // Layout variables
    const itemAreaX = width - 180; // Right side of the screen
    const itemStartY = 150;
    const itemSpacing = 160;
    const itemBgWidth = 160;
    const itemBgHeight = 120;

    items.forEach((item, idx) => {
      const y = itemStartY + idx * itemSpacing;

      // Background rectangle for each item
      const bg = this.add.rectangle(
        itemAreaX, y, itemBgWidth, itemBgHeight, 0x222233, 1
      )
        .setStrokeStyle(2, 0x88ccff)
        .setDepth(1);

      // Item image
      const img = this.add.image(itemAreaX, y - 20, item.key)
        .setScale(0.7)
        .setDepth(2)
        .setScale(0.09)
        .setInteractive({ useHandCursor: true });

      img.on('pointerover', () => img.setTint(0x88ccff));
      img.on('pointerout', () => img.clearTint());
      img.on('pointerdown', () => {
        console.log(`Item clicked: ${item.name}`);
        // Add purchase logic here
      });

      // Item name below the image
      this.add.text(itemAreaX, y + 40, item.name, {
        fontFamily: "Georgia",
        fontSize: "20px",
        color: "#ffffff"
      })
        .setOrigin(0.5)
        .setDepth(2);
    });

    // Back to Menu button
    const backBtn = this.add.text(width / 2, height - 60, "Back to Menu", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#222",
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#444" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#222" }))
      .on("pointerdown", () => {
        this.scene.start("Menu");
      });
  }
}

export default ShopScene;