export function createOptionBox(scene, promptText, { imageKey, options = [] } = {}) {
  const { width, height } = scene.sys.game.config;

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

  const buttons = options.map((opt) => {
    const btn = scene.add.text(
      text.x,
      currentY,
      opt.label,
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
        opt.onSelect?.();
        container.destroy();
      });

    currentY += btn.height + 8;
    return btn;
  });

  container.add([background, text, ...buttons]);

  return container;
}
