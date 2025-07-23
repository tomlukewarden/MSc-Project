class MiniGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MiniGameScene' });
  }

  preload() {}

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor("#b3e6ff");

    // List of available minigames (only XOGameScene for now)
    const minigames = ["XOGameScene"];
    // Pick a random minigame
    const chosenMinigame = minigames[Math.floor(Math.random() * minigames.length)];

    const onWin = this.scene.settings.data && this.scene.settings.data.onWin;

    this.scene.launch(chosenMinigame, { onWin: () => {
      // When minigame signals win, call parent onWin and resume main game
      if (typeof onWin === "function") onWin();
      this.scene.stop(chosenMinigame);
      this.scene.stop();
      this.scene.resume("WallGardenScene");
    }});
  }
}

export default MiniGameScene;