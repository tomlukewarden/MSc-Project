import Phaser from "phaser";
import GreenhouseScene from "./greenhouseScene";

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "StartScene" });
    }

    preload() {
        this.load.image("logo", "src/assets/backgrounds/botanist-logo.png");
        this.load.image("startButton", "src/assets/backgrounds/start-button.png");
    }


    create() {
        const { width, height } = this.sys.game.config;
        this.cameras.main.setBackgroundColor("#b36f4b");

      this.add.image(width / 2, height / 3, "logo").setScale(0.35);
      const startButton = this.add.image(width / 2, height / 1.3, "startButton").setScale(0.3).setInteractive();
      startButton.on("pointerdown", () => {
        this.scene.stop("StartScene");
          this.scene.start("GreenhouseScene");
    
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
