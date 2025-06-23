
export function createTextBox(scene, text, options = {}) {
    const { width, height } = scene.scale;
    const boxWidth = options.width || width * 0.6;
    const boxHeight = options.height || height * 0.16;
    const boxY = options.y || height - boxHeight / 2 - height * 0.04;
    const fontSize = options.fontSize || Math.round(height * 0.03);
    const depth = 105;


    const box = scene.add.rectangle(width / 2, boxY, boxWidth, boxHeight, 0xffffff, 0.92)
        .setStrokeStyle(3, 0x222222)
        .setDepth(depth);

    let image = null;
const imageMargin = 4;

if (options.imageKey) {
  image = scene.add.image(0, 0, options.imageKey);

  const imageOriginalHeight = image.height;
  const imageOriginalWidth = image.width;

  const maxImageHeight = options.imageMaxHeight || (boxHeight * 0.8);
  const maxImageWidth = boxWidth * 0.3; 

  const heightScale = maxImageHeight / imageOriginalHeight;
  const widthScale = maxImageWidth / imageOriginalWidth;

  const finalScale = Math.min(heightScale, widthScale) * (options.scaleMultiplier || 1);

  image
    .setScale(finalScale)
    .setOrigin(0, 0.5)
    .setDepth(105)
    .setPosition(
      width / 2 - boxWidth / 2 + imageMargin,
      boxY
    );
}

    const textMargin = options.imageKey ? (boxWidth * 0.13) : 24;
    const textObj = scene.add.text(
        width / 2 - boxWidth / 2 + textMargin,
        boxY,
        text,
        {
            font: `${fontSize}px Arial`,
            color: "#222",
            wordWrap: { width: boxWidth - textMargin - 24 },
            align: "left"
        }
    )
    .setOrigin(0, 0.5)
    .setDepth(depth + 2);


    return { box, textObj, image };
}