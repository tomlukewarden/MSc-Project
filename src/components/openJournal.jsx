import Phaser from "phaser";

class OpenJournal extends Phaser.Scene {
    constructor() {
        super({ key: "OpenJournal", active: true });
    }

    preload() {
        this.load.image("journalBackground", "/assets/ui-items/book.png");
    }

    create() {
        const { width, height } = this.sys.game.config;

        // Add journal background
        const journalBackground = this.add.image(width / 2, height / 2, "journalBackground").setScale(0.5);
        
        // Add journal content (placeholder text)
        this.add.text(width / 2, height / 2, "Journal Content Goes Here", {
            fontSize: "24px",
            fill: "#000"
        }).setOrigin(0.5);

        // Close journal on click
        journalBackground.setInteractive({ useHandCursor: true });
        journalBackground.on("pointerdown", () => {
            console.log("Closing Journal");
            this.scene.stop("OpenJournal"); // Stop the OpenJournal scene
        });
    }
}

export default OpenJournal;