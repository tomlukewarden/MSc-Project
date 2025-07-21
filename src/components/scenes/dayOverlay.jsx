import globalTimeManager from "../../day/timeManager";

class DayEndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DayEndScene' });
  }

  init(data) {
    // Pass in the day number from the calling scene (e.g., this.scene.launch("DayEndScene", { day: 3 }))
    this.currentDay = data.day || 1;
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // Dimmed overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);

    // Title
    this.add.text(width / 2, height * 0.35, `Day ${this.currentDay} Complete`, {
      font: '32px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Message
    this.add.text(width / 2, height * 0.5, `Are you ready for the next day?`, {
      font: '24px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Subtext
    this.add.text(width / 2, height * 0.6, `Press any key or click to continue...`, {
      font: '18px Arial',
      fill: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // Continue on input
    this.input.keyboard.once('keydown', () => this.nextDay());
    this.input.once('pointerdown', () => this.nextDay());
  }

  nextDay() {
    this.scene.stop();
    // Resume the garden scene and emit dayEnded event
    this.scene.get("PersonalGarden").events.emit("dayEnded", this.currentDay);
    this.events.emit("dayEnded", this.currentDay); // Optional: emit an event if something needs to listen
  }
}

export default DayEndScene;
