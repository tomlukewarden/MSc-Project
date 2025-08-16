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
        
        // Store callbacks from scene data
        this.onWin = this.scene.settings.data && this.scene.settings.data.onWin;
        this.onLose = this.scene.settings.data && this.scene.settings.data.onLose;
        
        console.log("[FishTutorialScene] Callbacks received:", !!this.onWin, !!this.onLose);
        
        // Background overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x222222, 0.85);
        
        // Title
        this.add.text(width / 2, 100, "Fishing Minigame", {
            fontSize: "40px",
            color: "#ffe066",
            fontFamily: "Georgia"
        }).setOrigin(0.5);
        
        // Instructions
        this.add.text(width / 2, 200,
            "Use ← → arrow keys to move the fishing line.\nClick anywhere to drop the line and catch fish.\nCatch only the good fish (round or pointy) for points.\nIf you catch a bad fish, the game ends!\nCatch 10 good fish to win!",
            {
                fontSize: "24px",
                color: "#fff",
                fontFamily: "Georgia",
                align: "center"
            }
        ).setOrigin(0.5);
        
        // Fish images and labels
        const fishInfo = [
            { key: "roundFish1", label: "Good Fish\n+10 points" },
            { key: "pointyFish1", label: "Good Fish\n+15 points" },
            { key: "badFish1", label: "Bad Fish\nGame Over!" }
        ];
        
        fishInfo.forEach((info, i) => {
            const x = width / 2 - 180 + i * 180;
            const y = 380;
            this.add.image(x, y, info.key).setScale(0.15);
            this.add.text(x, y + 80, info.label, {
                fontSize: "18px",
                color: info.label.includes("Bad") ? "#ff6666" : "#66ff66",
                fontFamily: "Georgia",
                align: "center"
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
            console.log("[FishTutorialScene] Starting FishGameScene with callbacks:", !!this.onWin, !!this.onLose);
            this.scene.start("FishGameScene", { 
                onWin: this.onWin, 
                onLose: this.onLose 
            });
        });
    }
}

export default FishTutorialScene;
