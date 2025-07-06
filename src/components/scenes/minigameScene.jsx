class MiniGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MiniGameScene' });
  }

  preload() {}

  create() {
    const { width, height } = this.sys.game.config;

    // --- Background color ---
    this.cameras.main.setBackgroundColor("#b3e6ff");

    // --- "Win Game" Button ---
    const button = this.add.rectangle(width / 2, height / 2, 200, 60, 0x4caf50, 1)
      .setStrokeStyle(2, 0x2e7d32)
      .setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(width / 2, height / 2, "Win Minigame", {
      fontSize: "28px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);

    button.on("pointerdown", () => {
      // Return to previous scene and signal win
      if (this.scene.settings.data && typeof this.scene.settings.data.onWin === "function") {
        this.scene.settings.data.onWin();
      }
      this.scene.stop();
      this.scene.resume("WallGardenScene");
    });
  }
}

export default MiniGameScene;