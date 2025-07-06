export function createOptionBox(scene, promptText, { imageKey, options = [] } = {}) {
  const { width, height } = scene.sys.game.config;

  scene.dialogueActive = true;
  if (typeof scene.updateHUDState === "function") {
    scene.updateHUDState();
  } else if (scene.scene && typeof scene.scene.sleep === "function") {
    scene.scene.sleep("HUDScene");
  }

  const container = scene.add.container(width / 2, height - 100).setDepth(105);

  const background = scene.add.rectangle(0, 0, 380, 100 + options.length * 40, 0x000000, 0.7)
    .setStrokeStyle(2, 0xffffff)
    .setOrigin(0.5);

  const text = scene.add.text(
    -background.width / 2 + 10,
    -background.height / 2 + 10,
    promptText,
    {
      fontFamily: "Georgia",
      fontSize: "16px",
      wordWrap: { width: background.width - 20 },
      color: "#ffffff"
    }
  );

  let currentY = text.y + text.height + 10;

  const optionButtons = options.map((opt) => {
    const btn = scene.add.text(
      text.x,
      currentY,
      opt.label || opt.text || "",
      {
        fontFamily: "Georgia",
        fontSize: "16px",
        backgroundColor: "#444",
        padding: { left: 10, right: 10, top: 4, bottom: 4 },
        color: "#ffffff"
      }
    )
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btn.setStyle({ backgroundColor: "#666" }))
      .on("pointerout", () => btn.setStyle({ backgroundColor: "#444" }))
      .on("pointerdown", () => {
        // Clean up UI and wake HUD
        if (typeof scene.destroyDialogueUI === "function") {
          scene.destroyDialogueUI();
        }
        scene.dialogueActive = false;
        if (typeof scene.updateHUDState === "function") {
          scene.updateHUDState();
        } else if (scene.scene && typeof scene.scene.wake === "function") {
          scene.scene.wake("HUDScene");
        }
        // Support both callback and onSelect
        if (typeof opt.onSelect === "function") opt.onSelect();
        else if (typeof opt.callback === "function") opt.callback();
        container.destroy();
      });

    currentY += btn.height + 8;
    return btn;
  });

  container.add([background, text, ...optionButtons]);

  return {
    box: container,
    textObj: text,
    optionButtons
  };
}