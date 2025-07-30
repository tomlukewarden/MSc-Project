class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {}

  create() {
    this.scene.stop("HUDScene");
    const { width, height } = this.sys.game.config;

    // Group scenes for layout
    const mainScenes = [
      { key: "WeeCairScene", label: "Wee Cair" },
      { key: "GreenhouseScene", label: "Greenhouse" },
      { key: "ShopScene", label: "Shop" },
      { key: "StartScene", label: "Start" },
      { key: "MapScene", label: "Map" },
      { key: "WallGardenScene", label: "Wall Garden" },
      { key: "MiddleGardenScene", label: "Middle Garden" },
      { key: "ShardGardenScene", label: "Shard Garden" },
      { key: "PersonalGarden", label: "Personal Garden" },
    ];
    const extraScenes = [
      { key: "EndGameScene", label: "End Game" },
      { key: "XOGameScene", label: "X and O Game" },
      { key: "FishGameScene", label: "Fish Game" },
      { key: "FishTutorialScene", label: "Fish Tutorial" }
    ];

    // Draw panel background
    const panelWidth = 600;
    const panelHeight = 600;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = 40;
    const panel = this.add.graphics();
    panel.fillStyle(0x222244, 0.85);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 32);

    // Title
    this.add.text(width / 2, panelY + 40, "Scene Menu", {
      fontFamily: "Georgia",
      fontSize: "38px",
      color: "#fff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Layout buttons in two columns
    const col1X = width / 2 - 150;
    const col2X = width / 2 + 150;
    const startY = panelY + 110;
    const btnSpacing = 54;
    mainScenes.forEach((scene, idx) => {
      const colX = idx < Math.ceil(mainScenes.length / 2) ? col1X : col2X;
      const rowY = startY + (idx % Math.ceil(mainScenes.length / 2)) * btnSpacing;
      const btn = this.add.text(colX, rowY, scene.label, {
        fontFamily: "Georgia",
        fontSize: "26px",
        color: "#88ccff",
        backgroundColor: "#222",
        padding: { left: 24, right: 24, top: 12, bottom: 12 },
        align: "center"
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => btn.setStyle({ backgroundColor: "#444", color: "#fff" }))
        .on("pointerout", () => btn.setStyle({ backgroundColor: "#222", color: "#88ccff" }))
        .on("pointerdown", () => {
          this.scene.start(scene.key);
        });
    });

    // Extras section
    this.add.text(
      width / 2,
      startY + btnSpacing * (Math.ceil(mainScenes.length / 2) + 1),
      "Extras",
      {
        fontFamily: "Georgia",
        fontSize: "28px",
        color: "#ffecb3",
        fontStyle: "italic"
      }
    ).setOrigin(0.5);

    extraScenes.forEach((scene, idx) => {
      const y = startY + btnSpacing * (Math.ceil(mainScenes.length / 2) + 2 + idx);
      const btn = this.add.text(width / 2, y, scene.label, {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#ffb300",
        backgroundColor: "#333",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
        align: "center"
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => btn.setStyle({ backgroundColor: "#555", color: "#fff" }))
        .on("pointerout", () => btn.setStyle({ backgroundColor: "#333", color: "#ffb300" }))
        .on("pointerdown", () => {
          this.scene.start(scene.key);
        });
    });
  }
}

export default MenuScene;