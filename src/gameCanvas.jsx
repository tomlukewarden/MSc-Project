import { useEffect, useRef } from "react";
import Phaser from "phaser";

import HUDScene from "./components/scenes/UIOverlayScenes/hud";
import OpenJournal from "./components/scenes/UIOverlayScenes/openJournal";
import GreenhouseScene from "./components/scenes/coreGameScenes/greenhouseScene";
import WeeCairScene from "./components/scenes/coreGameScenes/weeCairScene";
import StartScene from "./components/scenes/flowControl/startScene";
import ShopScene from "./components/scenes/coreGameScenes/shopScene";
// import Menu from "./scenes/menuScene";
import OpenInventory from "./components/scenes/UIOverlayScenes/openInventory";
import OpenSettings from "./components/scenes/UIOverlayScenes/openSettings";
import WallGardenScene from "./components/scenes/coreGameScenes/wallGardenScene";
import ShardGardenScene from "./components/scenes/coreGameScenes/shardGardenScene";
import MiddleGardenScene from "./components/scenes/coreGameScenes/middleGardenScene";
import MiniGameScene from "./components/scenes/flowControl/minigameScene";
import ControlScene from "./components/scenes/UIOverlayScenes/controlsScene";
import EndGameScene from "./components/scenes/flowControl/endgame";
import PersonalGarden from "./components/scenes/coreGameScenes/personalGarden";
import NewGameScene from "./components/scenes/flowControl/newGameScene";
import DayEndScene from "./components/scenes/UIOverlayScenes/dayOverlay";
import XOGameScene from "./minigames/x-and-o/x-and-o";
import OpenSeedPouch from "./components/scenes/UIOverlayScenes/openSeedPouch";
import FishGameScene from "./minigames/fish/fish";
import FishTutorialScene from "./minigames/fish/fishTutorialScene";
import XOTutorialScene from "./minigames/x-and-o/x-oTutorial";
import LoaderScene from "./components/scenes/flowControl/loaderScene";
import IntroScene from "./components/scenes/coreGameScenes/introScene";
import MovementTutorial from "./tutorials/movementTutorial";
import FarmingTutorial from "./tutorials/farmingTutorial";
import ForagingTutorial from "./tutorials/foragingTutorial";
import CraftingTutorial from "./tutorials/craftingTutorial";
import Tutorial from "./tutorials/tutorial";
import CreditsScene from "./components/scenes/coreGameScenes/creditsScene";
import FlowerCatchTutorial from "./minigames/flower-catch/flowerCatchTutorial";
import FlowerCatchGame from "./minigames/flower-catch/flowerCatchGame";

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
