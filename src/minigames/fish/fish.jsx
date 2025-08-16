import Phaser from "phaser";

class FishGameScene extends Phaser.Scene {
    constructor() {
        super("FishGameScene");
        this.score = 0;
        this.catches = 0;
        this.maxCatches = 10;
        this.gameOver = false;
        this.lineSpeed = 300;
        this.fishSpeed = 150;
        this.dropSpeed = 400;
        
        // Store callbacks persistently
        this.storedOnWin = null;
        this.storedOnLose = null;
    }

    preload() {
        const assetsPath = "/assets/minigame/fish/";
        this.load.image("waterBackground", assetsPath + "waterBackground.png");
        this.load.image("badFish1", assetsPath + "badFish-1.png");
        this.load.image("badFish2", assetsPath + "badFish-2.png");
        this.load.image("roundFish1", assetsPath + "roundFish-1.png");
        this.load.image("roundFish2", assetsPath + "roundFish-2.png");
        this.load.image("pointyFish1", assetsPath + "pointyFish-1.png");
        this.load.image("pointyFish2", assetsPath + "pointyFish-2.png");
    }

    create() {
        this.scene.sleep("HUDScene");
        
        // Reset game state every time scene is created
        this.resetGameState();
        
        const { width, height } = this.sys.game.config;
        
        // Get callbacks from scene data
        if (this.scene.settings && this.scene.settings.data) {
            if (typeof this.scene.settings.data.onWin === "function") {
                this.onWin = this.scene.settings.data.onWin;
                this.storedOnWin = this.scene.settings.data.onWin; // Store permanently
                console.log("[FishGameScene] onWin callback received and stored");
            }
            if (typeof this.scene.settings.data.onLose === "function") {
                this.onLose = this.scene.settings.data.onLose;
                this.storedOnLose = this.scene.settings.data.onLose; // Store permanently
                console.log("[FishGameScene] onLose callback received and stored");
            }
        } else if (this.storedOnWin || this.storedOnLose) {
            // Restore from stored callbacks (for restarts)
            this.onWin = this.storedOnWin;
            this.onLose = this.storedOnLose;
            console.log("[FishGameScene] Callbacks restored from storage");
        } else {
            console.log("[FishGameScene] No callbacks found in scene data.");
        }
        
        // Background
        this.add.image(width / 2, height / 2, "waterBackground").setDisplaySize(width, height);
        
        // Create fishing line (vertical line from top)
        this.fishingLine = this.add.rectangle(width / 2, 50, 4, 100, 0x8B4513);
        this.fishingLine.setOrigin(0.5, 0);
        
        // Create hook at end of line
        this.hook = this.add.circle(width / 2, 150, 8, 0x666666);
        
        // UI Elements
        this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
            fontSize: "24px",
            color: "#fff",
            fontFamily: "Georgia",
            stroke: "#000",
            strokeThickness: 2
        });
        
        this.catchText = this.add.text(20, 60, `Catches: ${this.catches}/${this.maxCatches}`, {
            fontSize: "24px",
            color: "#fff",
            fontFamily: "Georgia",
            stroke: "#000",
            strokeThickness: 2
        });
        
        this.instructionText = this.add.text(width / 2, height - 50, "Use ← → arrows to move, Click to drop line", {
            fontSize: "20px",
            color: "#fff",
            fontFamily: "Georgia",
            stroke: "#000",
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Game state
        this.lineDropping = false;
        this.fishes = this.add.group();
        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', () => this.dropLine());
        
        // Start spawning fish
        this.fishSpawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnFish,
            callbackScope: this,
            loop: true
        });
        
        console.log("[FishGameScene] Game started");
    }

    resetGameState() {
        this.score = 0;
        this.catches = 0;
        this.gameOver = false;
        this.lineDropping = false;
        
        console.log("[FishGameScene] Game state reset");
    }

    update() {
        if (this.gameOver) return;
        
        const { width } = this.sys.game.config;
        
        // Move fishing line left/right
        if (!this.lineDropping) {
            if (this.cursors.left.isDown && this.fishingLine.x > 50) {
                this.fishingLine.x -= this.lineSpeed * this.game.loop.delta / 1000;
                this.hook.x = this.fishingLine.x;
            }
            if (this.cursors.right.isDown && this.fishingLine.x < width - 50) {
                this.fishingLine.x += this.lineSpeed * this.game.loop.delta / 1000;
                this.hook.x = this.fishingLine.x;
            }
        }
        
        // Drop line animation
        if (this.lineDropping) {
            this.hook.y += this.dropSpeed * this.game.loop.delta / 1000;
            this.fishingLine.displayHeight = this.hook.y - 50;
            
            // Check for fish collisions
            this.fishes.children.entries.forEach(fish => {
                if (Phaser.Geom.Rectangle.Overlaps(this.hook.getBounds(), fish.getBounds())) {
                    this.catchFish(fish);
                }
            });
            
            // Reset line if it goes too far down
            if (this.hook.y > this.sys.game.config.height - 100) {
                this.resetLine();
            }
        }
        
        // Move fish
        this.fishes.children.entries.forEach(fish => {
            fish.x += fish.direction * this.fishSpeed * this.game.loop.delta / 1000;
            
            // Remove fish that go off screen
            if (fish.x < -100 || fish.x > width + 100) {
                fish.destroy();
            }
        });
    }

    dropLine() {
        if (!this.lineDropping && !this.gameOver) {
            this.lineDropping = true;
            console.log("[FishGameScene] Line dropped");
        }
    }

    resetLine() {
        this.lineDropping = false;
        this.hook.y = 150;
        this.fishingLine.displayHeight = 100;
        console.log("[FishGameScene] Line reset");
    }

    spawnFish() {
        if (this.gameOver) return;
        
        const { width, height } = this.sys.game.config;
        
        // Fish types: good fish (round, pointy) and bad fish
        const fishTypes = [
            { key: "roundFish1", type: "good", points: 10 },
            { key: "roundFish2", type: "good", points: 10 },
            { key: "pointyFish1", type: "good", points: 15 },
            { key: "pointyFish2", type: "good", points: 15 },
            { key: "badFish1", type: "bad", points: 0 },
            { key: "badFish2", type: "bad", points: 0 }
        ];
        
        const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        const side = Math.random() < 0.5 ? 'left' : 'right';
        
        const x = side === 'left' ? -50 : width + 50;
        const y = height / 2 + Math.random() * (height / 3);
        
        const fish = this.add.image(x, y, fishType.key);
        fish.setScale(0.08); // Made fish smaller (was 0.15)
        fish.fishType = fishType.type;
        fish.points = fishType.points;
        fish.direction = side === 'left' ? 1 : -1;
        
        // Invert fish horizontally based on direction
        if (fish.direction === 1) {
            // Moving left to right - flip horizontally
            fish.setFlipX(true);
        } else {
            // Moving right to left - keep original orientation
            fish.setFlipX(false);
        }
        
        this.fishes.add(fish);
        
        console.log(`[FishGameScene] Spawned ${fishType.type} fish`);
    }

    catchFish(fish) {
        const fishType = fish.fishType;
        const points = fish.points;
        
        console.log(`[FishGameScene] Caught ${fishType} fish for ${points} points`);
        
        if (fishType === "good") {
            this.score += points;
            this.catches++;
            
            // Show points gained
            const pointsText = this.add.text(fish.x, fish.y, `+${points}`, {
                fontSize: "20px",
                color: "#00ff00",
                fontFamily: "Georgia",
                stroke: "#000",
                strokeThickness: 2
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: pointsText,
                y: pointsText.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => pointsText.destroy()
            });
            
            // Check win condition
            if (this.catches >= this.maxCatches) {
                this.gameWin();
            }
            
        } else {
            // Bad fish caught - game over
            this.gameLose();
        }
        
        // Update UI
        this.scoreText.setText(`Score: ${this.score}`);
        this.catchText.setText(`Catches: ${this.catches}/${this.maxCatches}`);
        
        // Remove fish and reset line
        fish.destroy();
        this.resetLine();
    }

    gameWin() {
        this.gameOver = true;
        this.fishSpawnTimer.destroy();
        
        // Stop line if dropping
        this.lineDropping = false;
        
        // Show win message
        const { width, height } = this.sys.game.config;
        
        const winText = this.add.text(width / 2, height / 2, `You Win!\nCaught ${this.maxCatches} fish!\nFinal Score: ${this.score}`, {
            fontSize: "32px",
            color: "#00ff00",
            fontFamily: "Georgia",
            align: "center",
            stroke: "#000",
            strokeThickness: 3
        }).setOrigin(0.5);
        
        console.log("[FishGameScene] Player won!");
        
        // Call onWin callback after delay
        if (this.onWin) {
            console.log("[FishGameScene] Calling onWin callback...");
            this.time.delayedCall(2000, () => {
                this.onWin();
                this.scene.stop();
            });
        } else {
            console.warn("[FishGameScene] onWin callback is missing!");
            this.time.delayedCall(2000, () => {
                this.scene.stop();
            });
        }
    }

    gameLose() {
        this.gameOver = true;
        this.fishSpawnTimer.destroy();
        
        // Stop line if dropping
        this.lineDropping = false;
        
        // Show lose message
        const { width, height } = this.sys.game.config;
        
        const loseText = this.add.text(width / 2, height / 2, `Game Over!\nYou caught a bad fish!\nFinal Score: ${this.score}`, {
            fontSize: "32px",
            color: "#ff0000",
            font: "Georgia",
            align: "center",
            stroke: "#000",
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Show restart button
        this.showRestartButton();
        
        console.log("[FishGameScene] Player lost!");
        
        // Call onLose callback after delay
        if (this.onLose) {
            console.log("[FishGameScene] Calling onLose callback...");
            this.time.delayedCall(2000, () => {
                this.onLose();
                this.scene.stop();
            });
        } else {
            console.warn("[FishGameScene] onLose callback is missing!");
            this.time.delayedCall(2000, () => {
                this.scene.stop();
            });
        }
    }

    showRestartButton() {
        const { width, height } = this.sys.game.config;
        
        const restartBtn = this.add.rectangle(width / 2, height - 80, 220, 60, 0x1976d2, 1)
            .setStrokeStyle(2, 0x333)
            .setInteractive({ useHandCursor: true });
            
        const restartText = this.add.text(width / 2, height - 80, "Try Again", {
            fontSize: "26px",
            color: "#fff",
            fontFamily: "Georgia"
        }).setOrigin(0.5);
        
        restartBtn.on("pointerdown", () => {
            console.log("[FishGameScene] Restart button clicked - callbacks will be restored from storage");
            this.scene.restart(); // Simple restart - callbacks are stored in class properties
        });
    }
}

export default FishGameScene;