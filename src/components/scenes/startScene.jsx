import Phaser from "phaser";

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

      this.add.image(width / 2, height / 3, "logo").setScale(0.35);
      this.add.image(width / 2, height / 1.3, "startButton").setScale(0.3);
      this.cameras.main.setBackgroundColor("#b36f4b");


    }
}

export default StartScene;
