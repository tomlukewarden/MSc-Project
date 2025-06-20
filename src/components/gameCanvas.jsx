import { useEffect, useRef } from "react";
import Phaser from "phaser";
// 
import HUDScene from "./hud";
import OpenJournal from "./openJournal";
import GreenhouseScene from "./scenes/greenhouseScene";
import WeeCairScene from "./scenes/weeCairScene";
// import StartScene from "./scenes/startScene";

function GameCanvas() {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || gameRef.current) {
            return;
        }

        const config = {
            type: Phaser.WEBGL,
            width: window.innerWidth,
            height: window.innerHeight,
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            canvas: canvasRef.current,
            scene: [  WeeCairScene, GreenhouseScene, HUDScene,OpenJournal],
        };

        gameRef.current = new Phaser.Game(config);

        const handleResize = () => {
            if (gameRef.current) {
                gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            gameRef.current?.destroy(true); 
        };
    }, []); 

    return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100vh", background: "#111" }} />;
}

export default GameCanvas;
