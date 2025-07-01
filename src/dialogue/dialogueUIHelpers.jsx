import { createTextBox } from "../dialogue/createTextbox";
import { createOptionBox } from "../dialogue/createOptionBox";

// Helper to show a dialogue box
export function showDialogue(scene, text, optionsConfig = {}) {
  scene.destroyDialogueUI?.();
  const { width, height } = scene.sys.game.config;
  const boxWidth = Math.min(600, width * 0.8);
  const boxHeight = Math.min(180, height * 0.25);

  scene.dialogueBox = createTextBox(scene, text, {
    ...optionsConfig,
    boxWidth,
    boxHeight,
    x: width / 2,
    y: height - boxHeight / 2 - 30
  });
  scene.dialogueActive = true;
  scene.updateHUDState?.();
}

// Helper to show an option box
export function showOption(scene, text, config = {}) {
  scene.destroyDialogueUI?.();
  const { width, height } = scene.sys.game.config;
  const boxWidth = Math.min(600, width * 0.8);
  const boxHeight = Math.min(220, height * 0.3);

  scene.dialogueBox = createOptionBox(scene, text, {
    ...config,
    boxWidth,
    boxHeight,
    x: width / 2,
    y: height - boxHeight / 2 - 30
  });
  scene.dialogueActive = true;
  scene.updateHUDState?.();
}

// Helper to destroy the dialogue UI
export function destroyDialogueUI(scene) {
  if (scene.dialogueBox) {
    scene.dialogueBox.box?.destroy();
    scene.dialogueBox.textObj?.destroy();
    scene.dialogueBox.image?.destroy();
    if (scene.dialogueBox.optionButtons) {
      scene.dialogueBox.optionButtons.forEach((btn) => btn.destroy());
    }
    scene.dialogueBox = null;
  }
}