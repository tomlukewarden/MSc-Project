import { inventoryManager } from "../components/scenes/UIOverlayScenes/openInventory"; 

export function receivedItem(scene, itemKey, itemName, options = {}) {
  console.log("receivedItem called", itemKey, itemName);
  if (!itemKey || !itemName) {
    console.warn("receivedItem called without itemKey or itemName");
    return;
  }
  const { width, height } = scene.sys.game.config;
  const scale = options.scale || 0.1;
  const borderPadding = options.borderPadding || 20;
  const borderColor = options.borderColor || 0x88cc88;
  const textColor = options.textColor || "#ffffff";

  if (!scene.textures.exists(itemKey)) {
    console.warn("Texture not loaded for itemKey:", itemKey);
  }

  const itemTexture = scene.textures.get(itemKey).getSourceImage();
  const itemWidth = itemTexture.width * scale;
  const itemHeight = itemTexture.height * scale;

  const container = scene.add.container(width / 2, height / 2).setDepth(103);

  const border = scene.add
    .rectangle(0, 0, itemWidth + borderPadding, itemHeight + borderPadding, 0xffffff)
    .setStrokeStyle(2, borderColor);

  const itemImage = scene.add
    .image(0, 0, itemKey)
    .setScale(scale);

  const topLabel = scene.add
    .text(0, -(itemHeight / 2) - borderPadding / 2 - 20, "You Received:", {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: textColor,
      align: "center"
    })
    .setOrigin(0.5);

  const bottomLabel = scene.add
    .text(0, itemHeight / 2 + borderPadding / 2 + 12, itemName, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: textColor,
      align: "center"
    })
    .setOrigin(0.5);

  container.add([border, itemImage, topLabel, bottomLabel]);
  console.log(`Received item: ${itemKey}`);

  if (scene.sound && scene.sound.play) {
    scene.sound.play("sparkle", { volume: 0.7 });
  }

  // --- Add to inventory unless coin or seed ---
  const isCoin = itemKey.toLowerCase() === "coin" || itemName.toLowerCase() === "coin";
  const isSeed = itemKey.toLowerCase().includes("seed") || itemName.toLowerCase().includes("seed");
  if (inventoryManager && !isCoin && !isSeed) {
    let saveKey = itemKey;
    let saveName = itemName;
    if (typeof itemKey === "string") {
      if (/\.[Pp][Nn][Gg]$/.test(itemKey)) {
        const baseName = itemKey.replace(/\.[Pp][Nn][Gg]$/, "");
        saveKey = baseName.toLowerCase() + "Plant";
        saveName = baseName.toLowerCase();
      } else if (/^(spring|summer|autumn|winter)$/i.test(itemKey)) {
        const season = itemKey.charAt(0).toUpperCase() + itemKey.slice(1).toLowerCase();
        saveKey = season + "Shard";
      }
    }
    inventoryManager.addItem({
      name: saveName,
      color: borderColor,
      key: saveKey
    });
  }

  scene.time.delayedCall(3000, () => {
    scene.tweens.add({
      targets: container,
      alpha: 0,
      duration: 500,
      onComplete: () => container.destroy(true)
    });
  });
}