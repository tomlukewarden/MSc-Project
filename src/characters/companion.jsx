export function createCompanion(scene, x, y, scaleFactor, mainChar) {
    // Create the companion sprite
    const companion = scene.physics.add.sprite(x, y, "sit").setScale(1.8);
    companion.setOrigin(0.5, 0.5);
    companion.setCollideWorldBounds(true);

    companion.body.setSize(companion.width * 0.6, companion.height * 0.6);
    companion.body.setOffset(companion.width * 0.2, companion.height * 0.2);

    // Companion properties
    companion.followDistance = 80;
    companion.speed = 180;
    companion.isFollowing = true;
    companion.idleTimer = 0;
    companion.walkAnimTimer = 0;
    companion.walkFrame = 1; // Track which walk frame we're on
    companion.isWalking = false;
    companion.isSitting = false;

    // Follow behavior
    companion.followPlayer = function(player) {
        if (!this.isFollowing || !player) return;

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance > this.followDistance) {
            // Move towards player
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            const velocityX = Math.cos(angle) * this.speed;
            const velocityY = Math.sin(angle) * this.speed;

            this.body.setVelocity(velocityX, velocityY);
            this.walk();

            // Flip sprite based on movement direction
            if (velocityX < 0) {
                this.setFlipX(true);
            } else if (velocityX > 0) {
                this.setFlipX(false);
            }

        } else if (distance < this.followDistance * 0.5) {
            // Too close, move away slightly
            const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
            const velocityX = Math.cos(angle) * this.speed * 0.3;
            const velocityY = Math.sin(angle) * this.speed * 0.3;

            this.body.setVelocity(velocityX, velocityY);
            this.walk();

        } else {
            // Perfect distance, sit and stay
            this.sit();
            this.body.setVelocity(0);
        }
    };

    // Sit behavior
    companion.sit = function() {
        if (this.isSitting) return;

        this.isSitting = true;
        this.isWalking = false;
        this.walkAnimTimer = 0;
        
        // Switch to sit texture
        this.setTexture("sit");

        // Sitting animation - make companion slightly smaller
        scene.tweens.add({
            targets: this,
            scaleY: Math.abs(this.scaleX) * 0.9,
            duration: 300,
            ease: 'Power2'
        });
    };

    // Walk behavior
    companion.walk = function() {
        if (this.isWalking) return;

        this.isWalking = true;
        this.isSitting = false;
        this.walkAnimTimer = 0;
        this.walkFrame = 1;

        // Restore normal scale
        scene.tweens.add({
            targets: this,
            scaleY: Math.abs(this.scaleX),
            duration: 200,
            ease: 'Power2'
        });

        // Start with walk1 texture
        this.setTexture("walk1");
    };

    // Update walking animation by swapping textures
    companion.updateWalkAnimation = function() {
        if (!this.isWalking) return;

        this.walkAnimTimer += scene.game.loop.delta;

        // Swap between walk1 and walk2 every 300ms
        if (this.walkAnimTimer > 300) {
            this.walkAnimTimer = 0;
            
            if (this.walkFrame === 1) {
                this.setTexture("walk2");
                this.walkFrame = 2;
            } else {
                this.setTexture("walk1");
                this.walkFrame = 1;
            }
        }
    };

    // Wag tail behavior (simple texture swap)
    companion.wagTail = function() {
        // Store current state
        const wasWalking = this.isWalking;
        const currentTexture = this.texture.key;
        
        // Simple wag animation - quick texture swaps
        let wagCount = 0;
        const wagInterval = scene.time.addEvent({
            delay: 200, // Swap every 200ms
            callback: () => {
                wagCount++;
                
                // Alternate between walk textures for wagging effect
                if (wagCount % 2 === 0) {
                    this.setTexture("walk1");
                } else {
                    this.setTexture("walk2");
                }
                
                // Stop wagging after 6 swaps (3 wag cycles)
                if (wagCount >= 6) {
                    wagInterval.destroy();
                    
                    // Return to appropriate state
                    if (this.isSitting) {
                        this.setTexture("sit");
                    } else if (wasWalking) {
                        this.setTexture(currentTexture);
                    } else {
                        this.setTexture("sit");
                    }
                }
            },
            repeat: 5 // Repeat 5 times (6 total calls)
        });
    };

    // Random behaviors
    companion.randomBehavior = function() {
        this.idleTimer += scene.game.loop.delta;

        if (this.idleTimer > 4000) { // Every 4 seconds
            this.idleTimer = 0;

            if (this.isSitting && Math.random() < 0.4) { // 40% chance when sitting
                this.wagTail();
            }
        }
    };

    // Make companion interactive
    companion.setInteractive({ useHandCursor: true });

    companion.on('pointerdown', () => {
        // Pet the companion - trigger tail wagging
        companion.wagTail();
        
        // Play bark sound - FIXED
        if (scene.sound && scene.sound.add) {
            const bark = scene.sound.add('dogBark'); // Use the audio key from your preload
            bark.play({ volume: 0.3 });
        }
        
        // Show heart effect
        const heart = scene.add.text(companion.x, companion.y - 40, '❤', {
            fontSize: '20px'
        }).setOrigin(0.5);
        
        scene.tweens.add({
            targets: heart,
            y: heart.y - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => heart.destroy()
        });
    });

    // Update function to be called in scene's update
    companion.updateBehavior = function(mainChar) {
        this.followPlayer(mainChar);
        this.randomBehavior();
        this.updateWalkAnimation(); // Add walking animation update
    };

    return companion;
}

// Utility function to add companion to scene
export function addCompanionToScene(scene, mainChar, x = null, y = null) {
    // Default spawn position near main character
    const spawnX = x !== null ? x : mainChar.x - 50;
    const spawnY = y !== null ? y : mainChar.y + 30;
    
    const companion = createCompanion(scene, spawnX, spawnY, 1, mainChar);
    companion.setDepth(1);

    // Add to scene's update loop
    const originalUpdate = scene.update;
    scene.update = function(time, delta) {
        // Call original update if it exists
        if (originalUpdate) {
            originalUpdate.call(this, time, delta);
        }

        // Update companion behavior
        if (companion && companion.active && mainChar) {
            companion.updateBehavior(mainChar);
        }
    };

    return companion;
}