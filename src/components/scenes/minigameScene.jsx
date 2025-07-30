class MiniGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MiniGameScene' });
  }

  preload() {}

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor("#b3e6ff");


    const minigames = ["XOTutorialScene"];
    // Pick a random minigame
    const chosenMinigame = minigames[Math.floor(Math.random() * minigames.length)];

    // Get the onWin callback from parent scene data
    const parentOnWin = this.scene.settings.data && this.scene.settings.data.onWin;

    // Pass parentOnWin to the tutorial scene, and forward it to the game scene
    this.scene.launch(chosenMinigame, {
      onWin: () => {
        // When minigame signals win, call parent onWin and resume previous scene
        if (typeof parentOnWin === "function") parentOnWin();
        this.scene.stop(chosenMinigame);
        this.scene.stop();
        // Find the most recent scene that is not XOGameScene or MiniGameScene
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