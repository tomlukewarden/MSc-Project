import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

function GameCanvas() {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) {
            console.error("Canvas ref is null");
            return;
        }

        const createGame = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            const config = {
                type: Phaser.WEBGL,
                width,
                height,
                canvas: canvasRef.current,
                scene: {
                    preload() {
                        this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
                    },
                    create() {
                        this.add.image(width / 2, height / 2, 'sky');
                    }
                }
            };

            gameRef.current = new Phaser.Game(config);
        };

        createGame();

        const handleResize = () => {
            if (gameRef.current) {
                gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);

    }, []);

    return (
        <canvas
            id="gameCanvas"
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: '100vh', background: '#111' }}
        />
    );
}

export default GameCanvas;
