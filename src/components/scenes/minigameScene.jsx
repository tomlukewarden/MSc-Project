class MiniGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MiniGameScene' });
  }

  preload() {}

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor("#b3e6ff");


    const minigames = [ "XOTutorialScene","FishTutorialScene", "FlowerCatchTutorial"]; 
    // Pick a random minigame
    const chosenMinigame = minigames[Math.floor(Math.random() * minigames.length)];

    // Get the onWin callback from parent scene data
    const parentOnWin = this.scene.settings.data && this.scene.settings.data.onWin;

    // Pass parentOnWin to the tutorial scene, and forward it to the game scene
    this.scene.launch(chosenMinigame, {
      onWin: () => {
        // Call parent win callback if provided
        if (typeof parentOnWin === "function") parentOnWin();
        // Stop minigame and this scene
        this.scene.stop(chosenMinigame);
        this.scene.stop();
        // Resume previous scene (if any)
        const allScenes = this.scene.manager.getScenes(true);
        const lastNonMinigame = allScenes.reverse().find(s => s.scene.key !== chosenMinigame && s.scene.key !== this.scene.key);
        if (lastNonMinigame) {
          this.scene.resume(lastNonMinigame.scene.key);
        }
      }
    });
  }
}

export default MiniGameScene;