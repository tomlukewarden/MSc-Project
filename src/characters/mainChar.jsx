export function createMainChar(scene, width, height, scaleFactor, collisionGroup) {
    // Create the main character sprite
    const char = scene.physics.add.sprite(width / 2, height / 2, "defaultFront").setScale(0.04);
    char.setOrigin(-8, -0.5);
    char.setCollideWorldBounds(true);

    char.body.setSize(char.width * 0.6, char.height * 0.6);
    char.body.setOffset(char.width * 0.2, char.height * 0.2);

    scene.physics.add.collider(char, collisionGroup);

    collisionGroup.getChildren().forEach((solidArea) => {
        solidArea.setVisible(true).setAlpha(0.5);
    });

    const speed = 200;
    let lastDirection = "down"; 
  // Animations
  scene.anims.create({
    key: "walk-up",
    frames: [
      { key: "defaultBack" },
      { key: "defaultBackWalk1" },
      { key: "defaultBackWalk2" }
    ],
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: "walk-down",
    frames: [
      { key: "defaultFront" },
      { key: "defaultFrontWalk1" },
      { key: "defaultFrontWalk2" }
    ],
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: "walk-left",
    frames: [
      { key: "defaultLeftWalk1" },
      { key: "defaultLeftWalk2" }
    ],
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: "walk-right",
    frames: [
      { key: "defaultRightWalk1" },
      { key: "defaultRightWalk2" }
    ],
    frameRate: 8,
    repeat: -1
  });

  // Movement input
  scene.input.keyboard.on("keydown", (event) => {
    const key = event.key.toLowerCase();
    char.setVelocity(0);

    switch (key) {
      case "w":
        char.setVelocityY(-speed);
        char.anims.play("walk-up", true);
        lastDirection = "up";
        break;
      case "s":
        char.setVelocityY(speed);
        char.anims.play("walk-down", true);
        lastDirection = "down";
        break;
      case "a":
        char.setVelocityX(-speed);
        char.anims.play("walk-left", true);
        lastDirection = "left";
        break;
      case "d":
        char.setVelocityX(speed);
        char.anims.play("walk-right", true);
        lastDirection = "right";
        break;
      case "e":
        scene.scene.launch("OpenInventory");
        break;
      case "q":
        scene.scene.launch("OpenJournal");
        break;
      case "escape":
        scene.scene.launch("OpenSettings");
        break;
    }
  });

  scene.input.keyboard.on("keyup", () => {
    char.setVelocity(0);
    char.anims.stop();

    // Reset to idle frame depending on last direction
    switch (lastDirection) {
      case "up":
        char.setTexture("defaultBack");
        break;
      case "down":
        char.setTexture("defaultFront");
        break;
      case "left":
        char.setTexture("defaultLeftWalk1");
        break;
      case "right":
        char.setTexture("defaultRightWalk1");
        break;
    }
  });

  return char;
}
