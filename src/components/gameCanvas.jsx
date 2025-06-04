
import Phaser from "phaser";

function GameCanvas() {
const config = {
        type: Phaser.WEBGL,
        width: sizes.width,
        height: sizes.height,
        canvas: gameCanvas
    };


    const game = new Phaser.Game(config);
}

export default GameCanvas;
