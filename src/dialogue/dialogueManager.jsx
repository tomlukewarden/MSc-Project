
export function createTextBox(scene, text, options = {}) {
    const { width, height } = scene.scale;
    const boxWidth = options.width || width * 0.6;
    const boxHeight = options.height || height * 0.16;
    const boxY = options.y || height - boxHeight / 2 - height * 0.04;
    const fontSize = options.fontSize || Math.round(height * 0.03);
    const depth = options.depth || 100;


    const box = scene.add.rectangle(width / 2, boxY, boxWidth, boxHeight, 0xffffff, 0.92)
        .setStrokeStyle(3, 0x222222)
        .setDepth(depth);

    let image = null;
    const imageMargin = 24;
    if (options.imageKey) {
        image = scene.add.image(
            width / 2 - boxWidth / 2 + imageMargin,
            boxY,
            options.imageKey
        )
        .setOrigin(0, 0.5)
        .setScale(options.imageScale || (boxHeight / 128)) 
        .setDepth(depth + 1);
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