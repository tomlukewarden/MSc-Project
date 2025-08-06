import Phaser from "phaser";

class FishGameScene extends Phaser.Scene {

    constructor() {
        super("FishGameScene");
        this.score = 0;
        this.catches = 0;
        this.maxCatches = 10;
        this.gameOver = false;
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
        const { width, height } = this.sys.game.config;
        // Reset all game state variables
        this.score = 0;
        this.catches = 0;
        this.gameOver = false;
        this.lineDropping = false;
        this.gameStarted = true;
        // Remove any lingering groups or objects
        if (this.fishGroup && this.fishGroup.children) this.fishGroup.clear(true, true);
        if (this.graphics) this.graphics.clear();
        if (this.hookPhysics) this.hookPhysics.destroy();
        if (this.restartGroup && this.restartGroup.children) this.restartGroup.clear(true, true);
        // Get onWin callback from scene data if provided
        if (this.scene.settings && this.scene.settings.data && typeof this.scene.settings.data.onWin === "function") {
            this.onWin = this.scene.settings.data.onWin;
            console.log("[FishGameScene] onWin callback received from scene data.");
        } else {
      
            this.onWin = () => {
                // Example: award coins and close minigame
                if (this.registry) {
                    let coins = this.registry.get('coins') || 0;
                    this.registry.set('coins', coins + 10);
                }
                if (this.scene && typeof this.scene.stop === 'function') {
                    this.scene.stop('FishGameScene');
                    this.scene.stop('MiniGameScene');
                }
                // Optionally show a message or transition
                console.log('[FishGameScene] Default onWin: awarded coins and closed minigame.');
            };
            console.log("[FishGameScene] No onWin callback found in scene data. Using default.");
        }
        this.startFishingGame();
    }

    startFishingGame() {
        const { width, height } = this.sys.game.config;
         this.add.image(width / 2, height / 2, "waterBackground")
            .setDisplaySize(width, height)
            .setDepth(0);
            
        this.scoreText = this.add.text(40, 40, "Score: 0", { fontSize: "32px", color: "#fff", fontFamily: "Georgia" });
        this.catchesText = this.add.text(40, 80, "Catches: 0/10", { fontSize: "24px", color: "#fff", fontFamily: "Georgia" });
        this.lineY = 120;
        this.lineX = width / 2;
        this.lineDropping = false;
        this.graphics = this.add.graphics();
        this.hookRadius = 32;
        this.hookY = this.lineY;
        // Recreate hookPhysics on restart
        if (this.hookPhysics) {
            this.hookPhysics.destroy();
        }
        this.hookPhysics = this.physics.add.sprite(this.lineX, this.lineY, null);
        this.hookPhysics.body.setCircle(this.hookRadius);
        this.hookPhysics.body.setAllowGravity(false);
        this.hookPhysics.body.setImmovable(true);
        this.hookPhysics.setVisible(false);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', () => this.dropLine());
        this.fishGroup = this.physics.add.group();
        this.spawnFishTimer = this.time.addEvent({ delay: 1200, callback: this.spawnFish, callbackScope: this, loop: true });
        // Only create animations if they don't already exist
        if (!this.anims.exists("roundFishAnim")) {
            this.anims.create({
                key: "roundFishAnim",
                frames: [
                    { key: "roundFish1" },
                    { key: "roundFish2" }
                ],
                frameRate: 4,
                repeat: -1
            });
        }
        if (!this.anims.exists("pointyFishAnim")) {
            this.anims.create({
                key: "pointyFishAnim",
                frames: [
                    { key: "pointyFish1" },
                    { key: "pointyFish2" }
                ],
                frameRate: 4,
                repeat: -1
            });
        }
        if (!this.anims.exists("badFishAnim")) {
            this.anims.create({
                key: "badFishAnim",
                frames: [
                    { key: "badFish1" },
                    { key: "badFish2" }
                ],
                frameRate: 4,
                repeat: -1
            });
        }
        this.physics.add.overlap(this.hookPhysics, this.fishGroup, this.catchFish, null, this);
    }

    update() {
        const { width, height } = this.sys.game.config;
        if (this.gameOver || !this.cursors) return;

        if (!this.lineDropping) {
            if (this.cursors.left && this.cursors.left.isDown) {
                this.lineX -= 10;
            } else if (this.cursors.right && this.cursors.right.isDown) {
                this.lineX += 10;
            }
            this.lineX = Phaser.Math.Clamp(this.lineX, 80, width - 80);
            this.lineY = 120;
        }

        if (this.lineDropping) {
            this.lineY += 16;
            if (this.lineY > height - 120) {
                this.resetLine();
            }
        }

        this.graphics.clear();
        this.graphics.lineStyle(10, 0x000000, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(this.lineX, 120);
        this.graphics.lineTo(this.lineX, this.lineY);
        this.graphics.strokePath();
        this.graphics.closePath();
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillCircle(this.lineX, this.lineY + this.hookRadius, this.hookRadius);

        this.hookPhysics.setPosition(this.lineX, this.lineY + this.hookRadius);
        this.hookPhysics.body.updateFromGameObject();

        // Move fish every frame
        this.moveFish();
    }

    dropLine() {
        if (this.lineDropping || this.gameOver) return;
        this.lineDropping = true;
        this.lineY = 60;
    }

    resetLine() {
        this.lineDropping = false;
        this.lineY = 60;
    }

    spawnFish() {
        if (this.gameOver) return;

        const { width, height } = this.sys.game.config;
        const fishTypes = ["roundFish", "pointyFish", "badFish"];
        const type = Phaser.Utils.Array.GetRandom(fishTypes);

        // Clamp y so fish are always visible
        const minY = 120;
        const maxY = height - 80;
        const y = Phaser.Math.Between(minY, maxY);
        const startX = width + 50; // Always spawn off right edge
        const direction = -1; // Always move left
        const speed = Phaser.Math.Between(2, 4); // pixels per frame

        let animKey, texKey;
        if (type === "roundFish") {
            animKey = "roundFishAnim";
            texKey = "roundFish1";
        } else if (type === "pointyFish") {
            animKey = "pointyFishAnim";
            texKey = "pointyFish1";
        } else {
            animKey = "badFishAnim";
            texKey = "badFish1";
        }

        const fish = this.physics.add.sprite(startX, y, texKey);
        fish.setScale(0.09); // Smaller fish
        fish.setData("type", type);
        fish.setData("direction", direction);
        fish.setData("speed", speed);
        fish.anims.play(animKey);
        fish.setCollideWorldBounds(false);
        // fish.flipX removed; use default orientation

        this.fishGroup.add(fish);
    }

    moveFish() {
        const { width } = this.sys.game.config;

        this.fishGroup.children.iterate(fish => {
            if (fish) {
                const direction = fish.getData("direction");
                const speed = fish.getData("speed");

                fish.x += speed * direction;

                // Remove fish once it's fully off-screen
                if ((direction === 1 && fish.x > width + 60) || (direction === -1 && fish.x < -60)) {
                    fish.destroy();
                }
            }
        });
    }

    catchFish(hook, fish) {
        if (this.lineDropping && !this.gameOver) {
            const type = fish.getData("type");
            let points = 0;
            console.log(`[FishGameScene] catchFish called. Type: ${type}, catches: ${this.catches}, score: ${this.score}`);
            if (type === "badFish") {
                this.endGame(false);
                fish.destroy();
                return;
            } else if (type === "roundFish" || type === "pointyFish") {
                points = 10;
            }
            this.score += points;
            this.catches += 1;
            this.scoreText.setText("Score: " + this.score);
            this.catchesText.setText("Catches: " + this.catches + "/" + this.maxCatches);
            fish.destroy();
            this.resetLine();
            if (this.catches >= this.maxCatches) {
                this.endGame(true);
            }
        }
    }

    showRestartButton() {
        const { width, height } = this.sys.game.config;
        // Remove previous restart button if it exists
        if (this.restartGroup) {
            this.restartGroup.clear(true, true);
        }
        this.restartGroup = this.add.group();
        const button = this.add.rectangle(width / 2, height - 80, 220, 60, 0x1976d2, 1)
            .setStrokeStyle(2, 0x333)
            .setInteractive({ useHandCursor: true });
        const buttonText = this.add.text(width / 2, height - 80, "Restart Minigame", {
            fontSize: "26px",
            color: "#fff",
            fontFamily: "Georgia"
        }).setOrigin(0.5);

        this.restartGroup.addMultiple([button, buttonText]);
        button.on("pointerdown", () => {
            this.scene.stop("FishGameScene");
            this.scene.start("FishTutorialScene");
        });
    }
    endGame(win) {
        this.gameOver = true;
        this.spawnFishTimer.remove(false);
        let msg = win ? "You win! Final score: " + this.score : "Game Over! You caught a bad fish.";
        this.add.text(400, 300, msg, { fontSize: "32px", color: "#ffe066", backgroundColor: "#222" }).setOrigin(0.5);
        if (win) {
            console.log("[FishGameScene] WIN detected.");
            if (this.onWin) {
                console.log("[FishGameScene] Calling onWin callback...");
                this.onWin();
            } else {
                console.warn("[FishGameScene] onWin callback is missing!");
            }
            // Stop FishGameScene and MiniGameScene after win
            this.scene.stop("FishGameScene");
            this.scene.stop("MiniGameScene");
        } else {
            this.showRestartButton();
        }
    }
}

export default FishGameScene;
