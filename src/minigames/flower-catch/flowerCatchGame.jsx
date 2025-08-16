import Phaser from "phaser";

class FlowerCatchGame extends Phaser.Scene {
    constructor() {
        super({ key: "FlowerCatchGame" });
        this.flowersNeeded = 10;
        this.flowersCaught = 0;
        this.gameOver = false;
        this.crateSpeed = 400;
        this.fallSpeed = 200;
    }

    preload() {
        const assetsPath = "/assets/minigame/flower-catch/";
        this.load.image("flower1", assetsPath + "marigold.PNG");
        this.load.image("flower2", assetsPath + "jasmine.PNG");
        this.load.image("seedBag", assetsPath + "garlicSeeds.png");
        this.load.image("crate", assetsPath + "crate.png");
        this.load.image("gameBackground", "/assets/minigame/xo/xobackground.png");
    }

    create() {
        this.scene.sleep("HUDScene");
        
        // Reset game state
        this.resetGameState();
        
        const { width, height } = this.sys.game.config;
        
        // Get callbacks from scene data
        if (this.scene.settings && this.scene.settings.data) {
            if (typeof this.scene.settings.data.onWin === "function") {
                this.onWin = this.scene.settings.data.onWin;
                console.log("[FlowerCatchGame] onWin callback received from scene data.");
            }
            if (typeof this.scene.settings.data.onLose === "function") {
                this.onLose = this.scene.settings.data.onLose;
                console.log("[FlowerCatchGame] onLose callback received from scene data.");
            }
        } else {
            console.log("[FlowerCatchGame] No callbacks found in scene data.");
        }
        
        // Background
        this.add.image(width / 2, height / 2, "gameBackground").setDisplaySize(width, height);
        
        // Create player crate
        this.crate = this.add.image(width / 2, height - 80, "crate").setScale(2);
        
        // UI Elements
        this.flowerText = this.add.text(20, 20, `Flowers: ${this.flowersCaught}/${this.flowersNeeded}`, {
            fontSize: "24px",
            color: "#fff",
            fontFamily: "Georgia",
            stroke: "#000",
            strokeThickness: 2
        });
        
        this.instructionText = this.add.text(width / 2, 60, "Use ← → arrows to move the crate", {
            fontSize: "20px",
            color: "#fff",
            fontFamily: "Georgia",
            stroke: "#000",
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Game objects
        this.fallingItems = this.add.group();
        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Start spawning items
        this.itemSpawnTimer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnItem,
            callbackScope: this,
            loop: true
        });
        
        console.log("[FlowerCatchGame] Game started");
    }

    resetGameState() {
        this.flowersCaught = 0;
        this.gameOver = false;
        console.log("[FlowerCatchGame] Game state reset");
    }

    update() {
        if (this.gameOver) return;
        
        const { width } = this.sys.game.config;
        
        // Move crate with arrow keys
        if (this.cursors.left.isDown && this.crate.x > 60) {
            this.crate.x -= this.crateSpeed * this.game.loop.delta / 1000;
        }
        if (this.cursors.right.isDown && this.crate.x < width - 60) {
            this.crate.x += this.crateSpeed * this.game.loop.delta / 1000;
        }
        
        // Move falling items and check collisions
        this.fallingItems.children.entries.forEach(item => {
            item.y += this.fallSpeed * this.game.loop.delta / 1000;
            
            // Check collision with crate
            if (Phaser.Geom.Rectangle.Overlaps(this.crate.getBounds(), item.getBounds())) {
                this.catchItem(item);
            }
            
            // Remove items that fall off screen
            if (item.y > this.sys.game.config.height + 50) {
                item.destroy();
            }
        });
    }

    spawnItem() {
        if (this.gameOver) return;
        
        const { width } = this.sys.game.config;
        
        // 70% chance for flowers, 30% chance for seed bags
        const isFlower = Math.random() < 0.7;
        let itemKey;
        
        if (isFlower) {
            itemKey = Math.random() < 0.5 ? "flower1" : "flower2";
        } else {
            itemKey = "seedBag";
        }
        
        const x = 60 + Math.random() * (width - 120);
        const item = this.add.image(x, -50, itemKey).setScale(0.08);
        item.itemType = isFlower ? "flower" : "seedBag";
        
        this.fallingItems.add(item);
        
        console.log(`[FlowerCatchGame] Spawned ${item.itemType}`);
    }

    catchItem(item) {
        const itemType = item.itemType;
        
        if (itemType === "flower") {
            this.flowersCaught++;
            
            // Show +1 text
            const plusText = this.add.text(item.x, item.y, "+1", {
                fontSize: "24px",
                color: "#00ff00",
                fontFamily: "Georgia",
                stroke: "#000",
                strokeThickness: 2
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: plusText,
                y: plusText.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => plusText.destroy()
            });
            
            // Check win condition
            if (this.flowersCaught >= this.flowersNeeded) {
                this.gameWin();
            }
            
        } else if (itemType === "seedBag") {
            this.flowersCaught = Math.max(0, this.flowersCaught - 1);
            
            // Show -1 text
            const minusText = this.add.text(item.x, item.y, "-1", {
                fontSize: "24px",
                color: "#ff0000",
                fontFamily: "Georgia",
                stroke: "#000",
                strokeThickness: 2
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: minusText,
                y: minusText.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => minusText.destroy()
            });
        }
        
        // Update UI
        this.flowerText.setText(`Flowers: ${this.flowersCaught}/${this.flowersNeeded}`);
        
        // Remove caught item
        item.destroy();
        
        console.log(`[FlowerCatchGame] Caught ${itemType}, flowers: ${this.flowersCaught}`);
    }

    gameWin() {
        this.gameOver = true;
        this.itemSpawnTimer.destroy();
        
        const { width, height } = this.sys.game.config;
        
        const winText = this.add.text(width / 2, height / 2, `You Win!\nCaught ${this.flowersNeeded} flowers!`, {
            fontSize: "32px",
            color: "#00ff00",
            fontFamily: "Georgia",
            align: "center",
            stroke: "#000",
            strokeThickness: 3
        }).setOrigin(0.5);
        
        console.log("[FlowerCatchGame] Player won!");
        
        // Call onWin callback after delay
        if (this.onWin) {
            console.log("[FlowerCatchGame] Calling onWin callback...");
            this.time.delayedCall(2000, () => {
                this.onWin();
                this.scene.stop();
            });
        } else {
            console.warn("[FlowerCatchGame] onWin callback is missing!");
            this.time.delayedCall(2000, () => {
                this.scene.stop();
            });
        }
    }
}

export default FlowerCatchGame;