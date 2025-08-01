class ChestLogic {
  constructor() {
    this.chest = null;
    this.chestOpen = false;
    this.scene = null; // Make sure this is set from your scene!
  }

  setChest(chest) {
    this.chest = chest;
  }

  openChest(itemsArray) {
    if (this.scene) {
      this.chestOpen = true;
      this.scene.scene.launch("ChestUI", { items: itemsArray });
      console.log(`Chest opened`);
    } else {
      console.log("No scene to open chest.");
    }
  }

  closeChest() {
    if (this.chestOpen) {
      this.chestOpen = false;
      console.log("Chest closed.");
    } else {
      console.log("Chest is already closed.");
    }
  }
}

export default ChestLogic;