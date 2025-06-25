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

    this.add.image(width / 2, height / 2, 'shopBackground').setDepth(0).setScale(0.225);

    const items = [
      { key: 'item1', x: width / 2 - 100, y: height / 2 },
      { key: 'item2', x: width / 2 + 100, y: height / 2 },
    ];

    items.forEach(item => {
      const img = this.add.image(item.x, item.y, item.key)
        .setInteractive({ useHandCursor: true })
        .setDepth(1)
        .setScale(0.1);

      img.on('pointerover', () => img.setTint(0x88ccff));
      img.on('pointerout', () => img.clearTint());
      img.on('pointerdown', () => {
        console.log(`Item clicked: ${item.key}`);

      });
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