import Phaser from "phaser";

class GreenhouseScene extends Phaser.Scene {
constructor(){
    super ({ key: "GreenhouseScene" });
}

preload(){

    this.load.image("greenhouseBackground", "src/assets/backgrounds/greenhouse.png");
}

create(){
    console.log("Entered GreenhouseScene");
    const { width, height } = this.sys.game.config;

    this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(0.225);
}

}

export default GreenhouseScene;