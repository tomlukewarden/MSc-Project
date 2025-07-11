import { useEffect, useRef } from "react";
import Phaser from "phaser";

import HUDScene from "./hud";
import OpenJournal from "./openJournal";
import GreenhouseScene from "./scenes/greenhouseScene";
import WeeCairScene from "./scenes/weeCairScene";
import StartScene from "./scenes/startScene";
import ShopScene from "./scenes/shopScene";
import Menu from "./scenes/menuScene";
import OpenInventory from "./openInventory";
import OpenSettings from "./openSettings";
import MapScene from "./scenes/mapScene";
import WallGardenScene from "./scenes/wallGardenScene";
import ShardGardenScene from "./scenes/shardGardenScene";
import MiddleGardenScene from "./scenes/middleGardenScene";
import chestUI from "./chestUI";
import MiniGameScene from "./scenes/minigameScene";
import ControlScene from "./scenes/controlsScene";
import EndGameScene from "./scenes/endgame";

function GameCanvas() {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || gameRef.current) {
            return;
        }

        const config = {
            type: Phaser.WEBGL,
            width: 1280,
            height: 720,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                parent: "game-container",
                width: 1280,
                height: 720
            },
            canvas: canvasRef.current,
            scene: [ StartScene, Menu, MapScene,ShopScene, WeeCairScene, GreenhouseScene, EndGameScene, WallGardenScene, ShardGardenScene, MiddleGardenScene, HUDScene, OpenJournal, OpenInventory, OpenSettings, chestUI, ControlScene, MiniGameScene],
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
