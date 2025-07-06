import { createMainChar } from "../../characters/mainChar";
class MiddleGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MiddleGardenScene', physics: { default: 'arcade', arcade: { debug: false } } });
  }

  preload() {
   this.load.image('finalGardenBackground', '/assets/backgrounds/finalGarden/background.png');
   this.load.image('folliage1', '/assets/backgrounds/finalGarden/folliage1.png');
   this.load.image('folliage2', '/assets/backgrounds/finalGarden/folliage2.png');
       this.load.image("defaultFront", "/assets/char/default/front-default.png");
    this.load.image("defaultBack", "/assets/char/default/back-default.png");
    this.load.image("defaultLeft", "/assets/char/default/left-default.png");
    this.load.image("defaultRight", "/assets/char/default/right-default.png");
  }

  create() {
    this.scene.launch("HUDScene");
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // Background
    this.add.image(width / 2, height / 2, 'finalGardenBackground').setScale(scaleFactor).setDepth(0);
    // Folliage
    this.add.image(width / 2, height / 2, 'folliage1').setScale(scaleFactor).setDepth(1);
    const folliage2Img = this.add.image(width / 2, height / 2, 'folliage2').setScale(scaleFactor).setDepth(2);

    // --- Collision for folliage2 ---
    const collisionGroup = this.physics.add.staticGroup();
    const folliage2Rect = this.add.rectangle(
      width / 2,
      height / 2,
      folliage2Img.width * scaleFactor,
      folliage2Img.height * scaleFactor,
      0x00ff00, 
      0 // Fully transparent
    ).setDepth(2); 
    this.physics.add.existing(folliage2Rect, true);
    collisionGroup.add(folliage2Rect);

    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
this.mainChar.setDepth(1).setOrigin(0.5, 0.5); // Center origin
  }
    update() {
    const rightEdge = this.sys.game.config.width - 50;
    const leftEdge = 50; 

    if (this.mainChar) {

      console.log("mainChar.x:", this.mainChar.x);

      // Right edge
      if (this.mainChar.x >= rightEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("ShardGardenScene");
        }
      }
      // Left edge
      if (this.mainChar.x <= leftEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("WallGardenScene");
        }
      }
    }
  }
}
export default MiddleGardenScene;