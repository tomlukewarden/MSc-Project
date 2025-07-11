import Phaser from "phaser";

class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: "MapScene" });
  }

  preload() {
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Dark semi-transparent background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0).setInteractive();

    // Panel background
    const panel = this.add.rectangle(width / 2, height / 2, 500, 600, 0xffffff, 0.95)
      .setStrokeStyle(4, 0x6b9b5d)
      .setDepth(1)
      .setOrigin(0.5);

    // Title
    this.add.text(width / 2, height / 2 - 260, "🌼 Garden Map 🌼", {
      fontFamily: "Georgia",
      fontSize: "38px",
      color: "#4b6043",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(1);

    const locations = [
      { name: " Greenhouse", scene: "GreenhouseScene" },
      { name: " Wall Garden", scene: "WallGardenScene" },
      { name: " Shard Garden", scene: "ShardGardenScene" },
      { name: " Middle Garden", scene: "MiddleGardenScene" },
      { name: " Shop", scene: "ShopScene" }
    ];

    const startY = height / 2 - 180;

    locations.forEach((loc, i) => {
      const btn = this.add.text(width / 2, startY + i * 60, loc.name, {
        fontFamily: "Comic Sans MS, cursive",
        fontSize: "28px",
        backgroundColor: "#a9d7aa",
        color: "#2c3e50",
        padding: { x: 20, y: 8 }
      })
        .setOrigin(0.5)
        .setDepth(1)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => btn.setStyle({ backgroundColor: "#c7f4c9" }))
        .on("pointerout", () => btn.setStyle({ backgroundColor: "#a9d7aa" }))
        .on("pointerdown", () => {
          this.scene.stop("MapScene");
          this.scene.start(loc.scene);
        });
    });

    // Close map on ESC
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.stop("MapScene");
    });

    panel.setInteractive(); 
    this.input.on("gameobjectdown", (pointer, gameObject) => {
      if (gameObject === panel) return;
      this.scene.stop("MapScene");
    });

    const activeScenes = this.scene.manager.getScenes(true);
    const currentScene = activeScenes.find(s => s.scene && s.scene.key !== "MapScene" && s.scene.isActive());
    if (currentScene && currentScene.scene && currentScene.scene.key === "WeeCairScene") {
      if (window.alert) window.alert("The map cannot be accessed from Wee Cair!");
      this.scene.stop("MapScene");
      return;
    }
  }
}

export default MapScene;
