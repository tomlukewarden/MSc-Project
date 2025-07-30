import Phaser from "phaser";

class FishTutorialScene extends Phaser.Scene {
    constructor() {
        super("FishTutorialScene");
    }

    preload() {
        const assetsPath = "/assets/minigame/fish/";
        this.load.image("roundFish1", assetsPath + "roundFish-1.png");
        this.load.image("pointyFish1", assetsPath + "pointyFish-1.png");
        this.load.image("badFish1", assetsPath + "badFish-1.png");
    }

    create() {
        const { width, height } = this.sys.game.config;
        // Background overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x222222, 0.85);
        // Title
        this.add.text(width / 2, 100, "Fishing Minigame", {
            fontSize: "40px",
            color: "#ffe066",
            fontFamily: "Georgia"
        }).setOrigin(0.5);
        // Instructions
        this.add.text(width / 2, 170, "Catch as many good fish as you can!\nAvoid the bad fish.", {
            fontSize: "26px",
            color: "#fff",
            fontFamily: "Georgia",
            align: "center"
        }).setOrigin(0.5);
        // Fish images and labels
        const fishInfo = [
            { key: "roundFish1", label: "Good Fish" },
            { key: "pointyFish1", label: "Good Fish" },
            { key: "badFish1", label: "Bad Fish" }
        ];
        fishInfo.forEach((info, i) => {
            const x = width / 2 - 180 + i * 180;
            const y = 260;
            this.add.image(x, y, info.key).setScale(0.13);
            this.add.text(x, y + 60, info.label, {
                fontSize: "22px",
                color: info.label === "Bad Fish" ? "#ff4444" : "#fff",
                fontFamily: "Georgia"
            }).setOrigin(0.5);
        });
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
            this.scene.stop("FishTutorialScene");
            this.scene.start("FishGameScene");
        });
    }
}

export default FishTutorialScene;
