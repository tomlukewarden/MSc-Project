import Phaser from "phaser";


class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "StartScene" });
    }

    preload() {
        this.load.image("logo", "/assets/backgrounds/start/botanist-logo.png");
        this.load.image("startButton", "/assets/backgrounds/start/start-button.png");
    }


    create() {
        this.scene.stop("HUDScene");
        this.scene.stop("OpenJournal");
        const { width, height } = this.sys.game.config;
        this.cameras.main.setBackgroundColor("#b36f4b");

      this.add.image(width / 2, height / 3, "logo").setScale(0.35);
      const startButton = this.add.image(width / 2, height / 1.3, "startButton").setScale(0.3).setInteractive();
   startButton.on("pointerdown", () => {
    console.log("Switching to WeeCair");
    this.scene.stop("StartScene"); // Ensure StartScene is stopped
    this.scene.start("WeeCairScene"); // Start the WeeCairScene
});

      this.add.text(width / 2, height / 1.1, "Click to Start", {
          fontSize: "24px",
          fill: "#fff"
      }).setOrigin(0.5);
      this.add.text(width / 2, height / 1.05, "Made by Thomas Warden | Art by Emma Formosa", {
          fontSize: "16px",
          fill: "#fff"
      }).setOrigin(0.5);
      this.add.text(width / 2, height / 1.02, "Demo: 1.0.0", {
          fontSize: "16px",
          fill: "#fff"
      }).setOrigin(0.5);


    }
}

export default StartScene;
