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
        char.setOrigin(-7, -0.1); // Adjust origin to center the character

        this.input.keyboard.on("keydown", (event) => {
    switch (event.key) {
        case "w":
            this.tweens.add({
                targets: char,
                y: char.y - 50, // Moves up by 50 pixels
                duration: 300, // Smooth movement over 300ms
                ease: "Power2",
            });
            char.setTexture("defaultBack");
            break;
        case "s":
            this.tweens.add({
                targets: char,
                y: char.y + 50,
                duration: 300,
                ease: "Power2",
            });
            char.setTexture("defaultFront");
            break;
        case "a":
            this.tweens.add({
                targets: char,
                x: char.x - 50,
                duration: 300,
                ease: "Power2",
            });
            char.setTexture("defaultLeft");
            break;
        case "d":
            this.tweens.add({
                targets: char,
                x: char.x + 50,
                duration: 300,
                ease: "Power2",
            });
            char.setTexture("defaultRight");
            break;
    }
});

    }
}

export default GreenhouseScene;
