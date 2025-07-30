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
    // Overlay background
    this.add.rectangle(width / 2, height / 2, width, height, 0x222222, 0.85).setDepth(0);
    // Title
    this.add.text(width / 2, 100, "Tic-Tac-Toe Minigame", {
      fontSize: "40px",
      color: "#ffe066",
      fontFamily: "Georgia"
    }).setOrigin(0.5).setDepth(1);
    // Instructions
    this.add.text(width / 2, 170, "Get three in a row to win!\nYou are X, computer is O.", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia",
      align: "center"
    }).setOrigin(0.5).setDepth(1);
    // Board preview
    this.add.image(width / 2, 320, "gameBoard").setDisplaySize(320, 320).setDepth(1);
    // X and O icons
    this.add.image(width / 2 - 80, 320, "xIcon").setDisplaySize(60, 60).setDepth(1);
    this.add.image(width / 2 + 80, 320, "oIcon").setDisplaySize(60, 60).setDepth(1);
    this.add.text(width / 2 - 80, 390, "You (X)", {
      fontSize: "22px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5).setDepth(1);
    this.add.text(width / 2 + 80, 390, "Computer (O)", {
      fontSize: "22px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5).setDepth(1);
    // Start button
    const startBtn = this.add.rectangle(width / 2, height - 120, 260, 70, 0x1976d2, 1)
      .setStrokeStyle(2, 0x333)
      .setInteractive({ useHandCursor: true })
      .setDepth(2);
    const startText = this.add.text(width / 2, height - 120, "Start Game", {
      fontSize: "32px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5).setDepth(2);
    // In XOTutorialScene, when starting XOGameScene, forward the onWin callback
    startBtn.on("pointerdown", () => {
      // Forward onWin from tutorial scene data to XOGameScene
      let onWin = this.scene.settings.data && this.scene.settings.data.onWin;
      // If not found, try to get from parent (MiniGameScene)
      if (!onWin && this.scene.manager.getScene("MiniGameScene")?.scene?.settings?.data?.onWin) {
        onWin = this.scene.manager.getScene("MiniGameScene").scene.settings.data.onWin;
      }
      this.scene.start("XOGameScene", { onWin });
    });
  }
}

export default XOTutorialScene;
