import Phaser from "phaser";

class XOTutorialScene extends Phaser.Scene {
  constructor() {
    super("XOTutorialScene");
  }

  preload() {
    this.load.image("xIcon", "/assets/minigame/xo/xIcon.png");
    this.load.image("oIcon", "/assets/minigame/xo/oIcon.png");
    this.load.image("gameBoard", "/assets/minigame/xo/gameBoard.png");
    this.load.image("xoBackground", "/assets/minigame/xo/xobackground.png");
  }

  create() {
    const { width, height } = this.sys.game.config;
    // Background
    this.add.image(width / 2, height / 2, "xoBackground").setDisplaySize(width, height);
    // Title
    this.add.text(width / 2, 100, "Tic-Tac-Toe Minigame", {
      fontSize: "40px",
      color: "#ffe066",
      fontFamily: "Georgia"
    }).setOrigin(0.5);
    // Instructions
    this.add.text(width / 2, 170, "Get three in a row to win!\nYou are X, computer is O.", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia",
      align: "center"
    }).setOrigin(0.5);
    // Board preview
    this.add.image(width / 2, 320, "gameBoard").setDisplaySize(320, 320);
    // X and O icons
    this.add.image(width / 2 - 80, 320, "xIcon").setDisplaySize(60, 60);
    this.add.image(width / 2 + 80, 320, "oIcon").setDisplaySize(60, 60);
    this.add.text(width / 2 - 80, 390, "You (X)", {
      fontSize: "22px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);
    this.add.text(width / 2 + 80, 390, "Computer (O)", {
      fontSize: "22px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);
    // Start button
    const startBtn = this.add.rectangle(width / 2, height - 120, 260, 70, 0x1976d2, 1)
      .setStrokeStyle(2, 0x333)
      .setInteractive({ useHandCursor: true });
    const startText = this.add.text(width / 2, height - 120, "Start Game", {
      fontSize: "32px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);
    startBtn.on("pointerdown", () => {
      this.scene.start("XOGameScene");
    });
  }
}

export default XOTutorialScene;
