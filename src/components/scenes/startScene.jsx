import Phaser from "phaser";


class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "StartScene" });
    }

    preload() {
        this.load.image("logo", "/assets/backgrounds/start/botanist-logo.png");
        this.load.image("startButton", "/assets/backgrounds/start/start-button.png");
        this.load.image("background", "/assets/backgrounds/start/background.png");
          this.load.audio("theme1", "/assets/music/main-theme-1.mp3");
    }

    create() {
           this.sound.play("theme1", {
      loop: true,
      volume: 0.1
    });
        const { width, height } = this.sys.game.config;

        // Stop HUD and Journal scenes if running
        this.scene.stop("HUDScene");
        this.scene.stop("OpenJournal");

        // --- Background ---
        this.add.image(width / 2, height / 2, "background").setScale(1.5);

        // --- Logo ---
        this.add.image(width / 2, height / 3, "logo").setScale(0.3);

        // --- Start Button ---
        const startButton = this.add.image(width / 2, height / 1.3, "startButton")
            .setScale(0.2)
            .setInteractive();

        startButton.on("pointerdown", () => {
            console.log("Switching to NewGameScene");
            this.scene.stop("StartScene");
            this.scene.start("NewGameScene");
        });

        // --- Text Background Rectangle ---
        const rectWidth = 420;
        const rectHeight = 90;
        const rectY = height / 1.07;
        const rect = this.add.rectangle(width / 2, rectY, rectWidth, rectHeight, 0xffffff, 0.8)
            .setStrokeStyle(2, 0x888888);

        // --- Text ---
        this.add.text(width / 2, height / 1.1, "Click to Start", {
            fontSize: "24px",
            fill: "#000"
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 1.05, "Made by Thomas Warden | Art by Emma Formosa", {
            fontSize: "16px",
            fill: "#000"
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 1.02, "Demo: 1.0.0", {
            fontSize: "16px",
            fill: "#000"
        }).setOrigin(0.5);
    }
}

export default StartScene;
