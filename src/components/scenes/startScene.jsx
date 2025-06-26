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

        // --- Gradient background ---
        const graphics = this.add.graphics();
        const gradient = graphics.createGradientTexture(
            width, height,
            [
                { offset: 0, color: 0x3e2f1c },   
                { offset: 0.4, color: 0x567d46 },
                { offset: 0.7, color: 0xa3b18a },
                { offset: 1, color: 0xd9ae7e }
            ]
        );
        this.add.image(width / 2, height / 2, gradient).setDisplaySize(width, height);

        // --- Logo and Start Button ---
        this.add.image(width / 2, height / 3, "logo").setScale(0.35);
        const startButton = this.add.image(width / 2, height / 1.3, "startButton").setScale(0.3).setInteractive();
        startButton.on("pointerdown", () => {
            console.log("Switching to WeeCair");
            this.scene.stop("StartScene");
            this.scene.start("WeeCairScene");
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

// --- Helper for vertical gradient ---
Phaser.GameObjects.Graphics.prototype.createGradientTexture = function(width, height, stops) {
    const ctx = this.scene.textures.createCanvas('gradient', width, height).getContext();
    const grd = ctx.createLinearGradient(0, 0, 0, height);
    stops.forEach(stop => {
        // Convert hex color to CSS string
        const hex = '#' + stop.color.toString(16).padStart(6, '0');
        grd.addColorStop(stop.offset, hex);
    });
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
    this.scene.textures.get('gradient').refresh();
    return 'gradient';
};

export default StartScene;
