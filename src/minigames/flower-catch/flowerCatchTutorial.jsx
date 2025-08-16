import Phaser from "phaser";

class FlowerCatchTutorial extends Phaser.Scene {
    constructor() {
        super({ key: "FlowerCatchTutorial" });
    }

    preload() {
        const assetsPath = "/assets/minigame/flower-catch/";
        this.load.image("flower1", assetsPath + "marigold.PNG");
        this.load.image("flower2", assetsPath + "jasmine.PNG");
        this.load.image("seedBag", assetsPath + "garlicSeeds.png");
        this.load.image("crate", assetsPath + "crate.png");
    }

    create() {
        this.scene.sleep("HUDScene");
        const { width, height } = this.sys.game.config;
        
        // Store callbacks from scene data
        this.onWin = this.scene.settings.data && this.scene.settings.data.onWin;
        this.onLose = this.scene.settings.data && this.scene.settings.data.onLose;
        
        console.log("[FlowerCatchTutorial] Callbacks received:", !!this.onWin, !!this.onLose);
        
        // Background overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x222222, 0.85);
        
        // Title
        this.add.text(width / 2, 80, "Flower Catching Minigame", {
            fontSize: "40px",
            color: "#ffe066",
            fontFamily: "Georgia"
        }).setOrigin(0.5);
        
        // Instructions
        this.add.text(width / 2, 160,
            "Use ← → arrow keys to move your crate.\nCatch falling flowers to earn points.\nAvoid the seed bags - they subtract flowers!\nCatch 10 flowers to win the game!",
            {
                fontSize: "24px",
                color: "#fff",
                fontFamily: "Georgia",
                align: "center"
            }
        ).setOrigin(0.5);
        
        // Crate image and label
        this.add.image(width / 2, 280, "crate").setScale(2);
        this.add.text(width / 2, 320, "Your Crate\n(Move with ← → keys)", {
            fontSize: "18px",
            color: "#66ccff",
            fontFamily: "Georgia",
            align: "center"
        }).setOrigin(0.5);
        
        // Items info with images and labels
        const itemInfo = [
            { key: "flower1", label: "Marigold\n+1 flower", color: "#66ff66" },
            { key: "flower2", label: "Jasmine\n+1 flower", color: "#66ff66" },
            { key: "seedBag", label: "Seed Bag\n-1 flower", color: "#ff6666" }
        ];
        
        itemInfo.forEach((info, i) => {
            const x = width / 2 - 200 + i * 200;
            const y = 420;
            this.add.image(x, y, info.key).setScale(0.08);
            this.add.text(x, y + 60, info.label, {
                fontSize: "18px",
                color: info.color,
                fontFamily: "Georgia",
                align: "center"
            }).setOrigin(0.5);
        });
        
        // Goal reminder
        this.add.text(width / 2, 540, "Goal: Catch 10 flowers to win!", {
            fontSize: "26px",
            color: "#ffff66",
            fontFamily: "Georgia",
            stroke: "#000",
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Start button
        const startBtn = this.add.rectangle(width / 2, height - 80, 260, 70, 0x1976d2, 1)
            .setStrokeStyle(2, 0x333)
            .setInteractive({ useHandCursor: true });
            
        const startText = this.add.text(width / 2, height - 80, "Start Game", {
            fontSize: "32px",
            color: "#fff",
            fontFamily: "Georgia"
        }).setOrigin(0.5);
        
        startBtn.on("pointerdown", () => {
            console.log("[FlowerCatchTutorial] Starting FlowerCatchGame with callbacks:", !!this.onWin, !!this.onLose);
            this.scene.start("FlowerCatchGame", { 
                onWin: this.onWin, 
                onLose: this.onLose 
            });
        });
    }
}

export default FlowerCatchTutorial;