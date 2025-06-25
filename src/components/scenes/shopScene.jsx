class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  preload() {
    this.load.image('shopBackground', 'assets/background/shop/shop.png');
   this.load.image("item1", "assets/plants/seeds.png")
    this.load.image("item2", "assets/plants/foxglove.png");
  }

  create() {
    this.add.image(400, 300, 'shopBackground');

    const items = [
      { key: 'item1', x: 200, y: 200 },
      { key: 'item2', x: 400, y: 200 },
    ];

    items.forEach(item => {
      this.add.image(item.x, item.y, item.key).setInteractive();
    });

    this.input.on('gameobjectdown', (pointer, gameObject) => {
      console.log(`Item clicked: ${gameObject.texture.key}`);
    });
  }
}