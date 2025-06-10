import { useEffect, useRef } from "react";
import Phaser from "phaser";
import StartScene from "./scenes/startScene";

function GameCanvas() {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) {
            console.error("Canvas ref is null");
            return;
        }

        const config = {
            type: Phaser.WEBGL,
            width: window.innerWidth,
            height: window.innerHeight,
            canvas: canvasRef.current,
            scene: [StartScene]
        };

        gameRef.current = new Phaser.Game(config);

        const handleResize = () => {
            if (gameRef.current) {
                gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener("resize", handleResize);
    }, []);

    return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100vh", background: "#111" }} />;
}

export default GameCanvas;
