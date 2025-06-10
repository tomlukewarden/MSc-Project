import Phaser from "phaser";

class GreenhouseScene extends Phaser.Scene {
    constructor() {
        super({ key: "GreenhouseScene" });
    }

    preload() {
        this.load.image("greenhouseBackground", "src/assets/backgrounds/greenhouse.png");
        this.load.image("defaultFront", "src/assets/char/default/front-default.png");
        this.load.image("defaultBack", "src/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "src/assets/char/default/left-default.png");
        this.load.image("defaultRight", "src/assets/char/default/right-default.png");
    }

    create() {
        console.log("Entered GreenhouseScene");
        const { width, height } = this.sys.game.config;

        this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(0.225);
        const char = this.add.image(width / 2, height / 2, "defaultFront").setScale(0.06);

        this.input.keyboard.on("keydown", (event) => {
            switch (event.key) {
                case "w":
                    char.setTexture("defaultBack");
                    char.y -= 15;
                    break;
                case "s":
                    char.setTexture("defaultFront");
                    char.y += 15;
                    break;
                case "a":
                    char.setTexture("defaultLeft");
                    char.x -= 15;
                    break;
                case "d":
                    char.setTexture("defaultRight");
                    char.x += 15;
                    break;
                default:
                    break;
            }
        });
    }
}

export default GreenhouseScene;
