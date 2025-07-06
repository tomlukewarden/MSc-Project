import Phaser from "phaser";

class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: "MapScene" });
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Fun background: gradient sky and flat ground
    const graphics = this.add.graphics();
    // Sky gradient
    graphics.fillGradientStyle(0x7ecfff, 0x7ecfff, 0xb3e6ff, 0xb3e6ff, 1);
    graphics.fillRect(0, 0, width, height);

    // Flat green ground
    graphics.fillStyle(0x7ed957, 1);
    graphics.fillRect(0, height * 0.7, width, height * 0.3);

    // Sun
    graphics.fillStyle(0xfff57c, 1);
    graphics.fillCircle(width * 0.85, height * 0.18, 60);

    // Title
    this.add.text(width / 2, 80, "🌼 Garden Map 🌼", {
      fontFamily: "Comic Sans MS, Comic Sans, cursive, Georgia",
      fontSize: "48px",
      color: "#fff",
      fontStyle: "bold",
      stroke: "#ffb347",
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: "#333", blur: 6, fill: true }
    }).setOrigin(0.5).setDepth(1);

    // Example locations as fun squares
    const locations = [
      { name: "🌱 Greenhouse", scene: "GreenhouseScene", y: height / 2 - 100 },
      { name: "🏡 Wee Cair", scene: "WeeCairScene", y: height / 2 - 30 },
      { name: "🌳 Wall Garden", scene: "WallGardenScene", y: height / 2 + 40 },
      { name: "💎 Shard Garden", scene: "ShardGardenScene", y: height / 2 + 110 },
      { name: "🌸 Final Garden", scene: "FinalGardenScene", y: height / 2 + 180 },
      { name: "🛒 Shop", scene: "ShopScene", y: height / 2 + 250 }
    ];

    locations.forEach((loc, idx) => {
      // Draw a square for each location
      const squareSize = 48;
      graphics.fillStyle(0xffffff, 0.8);
      graphics.fillRect(width / 2 - 160, loc.y - squareSize / 2, squareSize, squareSize);

      // Draw a line from square to button
      graphics.lineStyle(4, 0x3388cc, 0.7);
      graphics.beginPath();
      graphics.moveTo(width / 2 - 160 + squareSize, loc.y);
      graphics.lineTo(width / 2 - 30, loc.y);
      graphics.strokePath();

      // Button
      const btn = this.add.text(width / 2, loc.y, loc.name, {
        fontFamily: "Comic Sans MS, Comic Sans, cursive, Georgia",
        fontSize: "32px",
        color: "#fff",
        backgroundColor: "#3388cc",
        fontStyle: "bold",
        padding: { left: 32, right: 32, top: 12, bottom: 12 }
      })
        .setOrigin(0.5)
        .setDepth(2)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => btn.setStyle({ backgroundColor: "#225588", color: "#ffeb3b" }))
        .on("pointerout", () => btn.setStyle({ backgroundColor: "#3388cc", color: "#fff" }))
        .on("pointerdown", () => {
          this.sound.play && this.sound.play("click", { volume: 0.5 });
          this.scene.start(loc.scene);
        });
    });

    // Back button with a fun style
    const backBtn = this.add.text(width / 2, height - 60, "⬅️ Back", {
      fontFamily: "Comic Sans MS, Comic Sans, cursive, Georgia",
      fontSize: "28px",
      color: "#fff",
      backgroundColor: "#ffb347",
      fontStyle: "bold",
      padding: { left: 28, right: 28, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setDepth(2)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#ff9800", color: "#fff" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#ffb347", color: "#fff" }))
      .on("pointerdown", () => {
        this.sound.play && this.sound.play("click", { volume: 0.5 });
        this.scene.start("MainMenuScene");
      });
  }
}

export default MapScene;