
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
        // Scaled background
        this.add.image(width / 2, height / 2, "waterBackground")
            .setDisplaySize(width, height)
            .setDepth(0);
        this.scoreText = this.add.text(40, 40, "Score: 0", { fontSize: "32px", color: "#fff", fontFamily: "Georgia" });
        this.catchesText = this.add.text(40, 80, "Catches: 0/" + this.maxCatches, { fontSize: "24px", color: "#fff", fontFamily: "Georgia" });

        // Fishing line and hook (drawn)
        this.lineY = 120;
        this.lineX = width / 2;
        this.lineDropping = false;
        this.graphics = this.add.graphics();
        this.hookRadius = 32;
        this.hookY = this.lineY;

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', () => this.dropLine());

        // Fish group
        this.fishGroup = this.physics.add.group();
        this.spawnFishTimer = this.time.addEvent({ delay: 1200, callback: this.spawnFish, callbackScope: this, loop: true });

        // Animations for fish 1/2
        this.anims.create({
            key: "roundFishAnim",
            frames: [
                { key: "roundFish1" },
                { key: "roundFish2" }
            ],
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: "pointyFishAnim",
            frames: [
                { key: "pointyFish1" },
                { key: "pointyFish2" }
            ],
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: "badFishAnim",
            frames: [
                { key: "badFish1" },
                { key: "badFish2" }
            ],
            frameRate: 4,
            repeat: -1
        });

        // Create invisible physics hook for collision
        this.hookPhysics = this.physics.add.sprite(this.lineX, this.lineY, null);
        this.hookPhysics.body.setCircle(this.hookRadius);
        this.hookPhysics.body.setAllowGravity(false);
        this.hookPhysics.body.setImmovable(true);
        this.hookPhysics.setVisible(false);

        // Collision
        this.physics.add.overlap(this.hookPhysics, this.fishGroup, this.catchFish, null, this);
    }

    update() {
        const { width, height } = this.sys.game.config;
        if (this.gameOver) return;
        // Move line left/right
        if (!this.lineDropping) {
            if (this.cursors.left.isDown) {
                this.lineX -= 10;
            } else if (this.cursors.right.isDown) {
                this.lineX += 10;
            }
            this.lineX = Phaser.Math.Clamp(this.lineX, 80, width - 80);
            this.lineY = 120;
        }
        // Drop line
        if (this.lineDropping) {
            this.lineY += 16;
            if (this.lineY > height - 120) {
                this.resetLine();
            }
        }
        // Draw line and hook
        this.graphics.clear();
        this.graphics.lineStyle(10, 0x000000, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(this.lineX, 120);
        this.graphics.lineTo(this.lineX, this.lineY);
        this.graphics.strokePath();
        this.graphics.closePath();
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillCircle(this.lineX, this.lineY + this.hookRadius, this.hookRadius);
        // Move physics hook
        this.hookPhysics.setPosition(this.lineX, this.lineY + this.hookRadius);
        this.hookPhysics.body.updateFromGameObject();
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
        // Randomly choose left or right spawn
        const spawnLeft = Math.random() < 0.5;
        const y = Phaser.Math.Between(height / 2, height - 180);
        const x = spawnLeft ? 80 : width - 80;
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
        const fish = this.physics.add.sprite(x, y, texKey);
        fish.setData("type", type);
        fish.setScale(0.15);
        // Random velocity and direction
        const speed = Phaser.Math.Between(60, 120);
        const direction = spawnLeft ? 1 : -1;
        fish.setVelocityX(speed * direction);
        fish.setBounce(1);
        fish.setCollideWorldBounds(false);
        fish.anims.play(animKey);
        // Randomly flip fish horizontally
        fish.flipX = direction === -1;
        this.fishGroup.add(fish);
        // Remove fish when off screen
        fish.checkWorldBounds = true;
        fish.outOfBoundsKill = true;
        fish.body.onWorldBounds = true;
        fish.body.world.on('worldbounds', function(body) {
            if (body.gameObject === fish) {
                fish.destroy();
            }
        });
    }

    catchFish(hook, fish) {
        if (this.lineDropping && !this.gameOver) {
            const type = fish.getData("type");
            let points = 0;
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

    endGame(win) {
        this.gameOver = true;
        this.spawnFishTimer.remove(false);
        let msg = win ? "You win! Final score: " + this.score : "Game Over! You caught a bad fish.";
        this.add.text(400, 300, msg, { fontSize: "32px", color: "#ffe066", backgroundColor: "#222" }).setOrigin(0.5);
    }
}

export default FishGameScene;