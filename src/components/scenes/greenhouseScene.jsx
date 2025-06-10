import Phaser from "phaser";

class GreenhouseScene extends Phaser.Scene {
constructor(){
    super ({ key: "GreenhouseScene" });
}

preload(){

    this.load.image("greenhouseBackground", "src/assets/backgrounds/greenhouse.png");
    this.load.image("defaultFront", "src/assets/char/default/front-default.png");
}

create(){
    console.log("Entered GreenhouseScene");
    const { width, height } = this.sys.game.config;

    this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(0.225);
   const char = this.add.image(width / 2, height / 2, "defaultFront").setScale(0.06);
    this.input.keyboard.on("keydown", (event) => {
        switch (event.key) {
            case "w":
                char.y -= 10;
                break;
            case "s":
                char.y += 10;
                break;
            case "a":
                char.x -= 10;
                break;
            case "d":
                char.x += 10;
                break;
            default:
                break;
        }
    }
    );


}

}

export default GreenhouseScene;