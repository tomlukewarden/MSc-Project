import Phaser from "phaser";

class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: "MapScene" });
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x222a36).setDepth(0);

    // Title
    this.add.text(width / 2, 80, "Select a Location", {
      fontFamily: "Georgia",
      fontSize: "40px",
      color: "#fff",
      fontStyle: "bold",
      stroke: "#88ccff",
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: "#111", blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(1);

    // Example locations
    const locations = [
      { name: "Greenhouse", scene: "GreenhouseScene", y: height / 2 - 60 },
      { name: "Wee Cair", scene: "WeeCairScene", y: height / 2 },
    ];

    locations.forEach((loc, idx) => {
      const btn = this.add.text(width / 2, loc.y, loc.name, {
        fontFamily: "Georgia",
        fontSize: "32px",
        color: "#fff",
        backgroundColor: "#3388cc",
        fontStyle: "bold",
        padding: { left: 32, right: 32, top: 12, bottom: 12 }
      })
        .setOrigin(0.5)
        .setDepth(2)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => btn.setStyle({ backgroundColor: "#225588" }))
        .on("pointerout", () => btn.setStyle({ backgroundColor: "#3388cc" }))
        .on("pointerdown", () => {
          this.scene.start(loc.scene);
        });
    });

    // Back button
    const backBtn = this.add.text(width / 2, height - 60, "Back", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#fff",
      backgroundColor: "#888",
      fontStyle: "bold",
      padding: { left: 28, right: 28, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setDepth(2)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#444" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#888" }))
      .on("pointerdown", () => {
        this.scene.start("MainMenuScene");
      });
  }
}

export default MapScene;