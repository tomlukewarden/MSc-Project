import { useEffect, useRef } from "react";
import Phaser from "phaser";

import HUDScene from "./hud";
import OpenJournal from "./openJournal";
import GreenhouseScene from "./scenes/greenhouseScene";
import WeeCairScene from "./scenes/weeCairScene";
import StartScene from "./scenes/startScene";
import ShopScene from "./scenes/shopScene";
// import Menu from "./scenes/menuScene";
import OpenInventory from "./openInventory";
import OpenSettings from "./openSettings";
import WallGardenScene from "./scenes/wallGardenScene";
import ShardGardenScene from "./scenes/shardGardenScene";
import MiddleGardenScene from "./scenes/middleGardenScene";
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
import MovementTutorial from "../tutorials/movementTutorial";
import FarmingTutorial from "../tutorials/farmingTutorial";
import ForagingTutorial from "../tutorials/foragingTutorial";
import CraftingTutorial from "../tutorials/craftingTutorial";
import Tutorial from "../tutorials/tutorial";
import CreditsScene from "./scenes/credits";
import FlowerCatchTutorial from "../minigames/flower-catch/flowerCatchTutorial";
import FlowerCatchGame from "../minigames/flower-catch/flowerCatchGame";

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
    // Menu,
    StartScene,
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
    IntroScene,
    MovementTutorial,
    FarmingTutorial,
    ForagingTutorial,
    CraftingTutorial,
    Tutorial,
    CreditsScene,
    FlowerCatchTutorial,
    FlowerCatchGame
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
