import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

function GameCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) {
            console.error("Canvas ref is null");
            return;
        }

        const config = {
            type: Phaser.WEBGL,
            width: 700,
            height: 500,
            canvas: canvasRef.current,
            scene: {
                preload() {
                    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
                },
                create() {
                    console.log("Phaser is running");
                    this.add.image(350, 250, 'sky');
                }
            }
        };

        new Phaser.Game(config); // ✅ Still runs Phaser, no destroy
    }, []);

    return (
        <canvas
            id="gameCanvas"
            ref={canvasRef}
            style={{ display: 'block', width: '700px', height: '500px', background: '#111' }}
        />
    );
}

export default GameCanvas;
