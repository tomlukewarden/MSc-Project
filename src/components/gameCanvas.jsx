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
import PersonalGarden from "./scenes/personalGarden";
import NewGameScene from "./scenes/newGameScene";
import DayEndScene from "./scenes/dayOverlay";
import XOGameScene from "../minigames/x-and-o/x-and-o";
import OpenSeedPouch from "./openSeedPouch";
import FishGameScene from "../minigames/fish/fish";
import FishTutorialScene from "../minigames/fish/fishTutorialScene";
import XOTutorialScene from "../minigames/x-and-o/x-oTutorial";
import LoaderScene from "./scenes/loaderScene";
import IntroScene from "./scenes/introScene";

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
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 } 
    }
  },
      dom: {
        createContainer: true
      },
  canvas: canvasRef.current,
  scene: [
    Menu,
    StartScene,
    MapScene,
    ShopScene,
    WeeCairScene,
    GreenhouseScene,
    EndGameScene,
    WallGardenScene,
    ShardGardenScene,
    MiddleGardenScene,
    HUDScene,
    OpenJournal,
    OpenInventory,
    OpenSettings,
    chestUI,
    ControlScene,
    MiniGameScene,
    PersonalGarden,
    NewGameScene,
    DayEndScene,
    XOGameScene,
    OpenSeedPouch,
    FishGameScene,
    FishTutorialScene,
    XOTutorialScene,
    LoaderScene,
    IntroScene
  ]
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
