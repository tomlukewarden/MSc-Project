class ControlScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ControlScene' });
    }

    preload() {
        // Load any assets like custom fonts or background images here if needed
    }

    create() {
        const { width, height } = this.sys.game.canvas;

        // Dimmed background overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

        const controlsText = `
        The Botanist's Guide to Controls:

        Welcome and thank you for playing! Here are the controls to help you navigate the game:

        We really hope you have fun!

        WASD – Move
        E – Open Inventory
        Q – Open Journal
        ESC – Settings
        Click – Interact (NPCs / Icons)

        Press any key or click to continue...
        `;

        this.add.text(width / 2, height / 2, controlsText, {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown', () => this.scene.stop());
        this.input.once('pointerdown', () => this.scene.stop());
    }
}

export default ControlScene;
