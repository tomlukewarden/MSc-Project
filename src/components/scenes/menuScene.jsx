class Menu extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }

  preload() {}

  create() {
    this.scene.stop("HUDScene");
    const { width, height } = this.sys.game.config;

    // List your available scenes here
    const scenes = [
      { key: "WeeCairScene", label: "Wee Cair" },
        { key: "GreenhouseScene", label: "Greenhouse" },
        { key: "ShopScene", label: "Shop" },
        { key: "StartScene", label: "Start" },
    ];

    this.add.text(width / 2, 80, "Scene Menu", {
      fontFamily: "Georgia",
      fontSize: "32px",
      color: "#ffffff"
    }).setOrigin(0.5);

    scenes.forEach((scene, idx) => {
      const btn = this.add.text(width / 2, 160 + idx * 60, scene.label, {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#88ccff",
        backgroundColor: "#222",
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => btn.setStyle({ backgroundColor: "#444" }))
        .on("pointerout", () => btn.setStyle({ backgroundColor: "#222" }))
        .on("pointerdown", () => {
          this.scene.start(scene.key);
        });
    });
  }
}

export default Menu;