import Phaser from "phaser";

class GreenhouseScene extends Phaser.Scene {
constructor(){
    super ({ key: "GreenhouseScene" });
}

preload(){
    this.load.image("greenhouseBackground", "src/assets/backgrounds/greenhouse.png");
    this.load.image("spriteFront", "src/assets/char/front-default.png");
    this.load.image("spriteBack", "src/assets/char/back-default.png");
    this.load.image("spriteLeft", "src/assets/char/left-default.png");
    this.load.image("spriteRight", "src/assets/char/right-default.png");
}

create(){
    const { width, height } = this.sys.game.config;

    this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(1.5).setFlip(false, true);
}

}

export default GreenhouseScene;