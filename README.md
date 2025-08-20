# MSc Project - The Botanist

Welcome to **The Botanist**, an MSc project by Thomas Warden with art by Emma Formosa.

## Overview

**The Botanist** is a narrative-driven, 2D adventure game built with [Phaser 3](https://phaser.io/). Explore lush environments, interact with whimsical characters, collect rare plants through engaging minigames, and uncover the mysteries of the forest. The project demonstrates advanced scene management, dialogue systems, inventory, interactive minigames, and dynamic UI in a modern JavaScript game framework.

## Features

- **Rich Dialogue System:** Branching conversations with fairies, bees, butterflies, and woodland creatures.
- **Interactive Minigames:** Win plants through Tic-Tac-Toe and fishing challenges.
- **Dynamic Inventory & Shop:** Collect, buy, and use unique items and plants with persistent storage.
- **Plant Journal:** Track discovered plants with detailed information and beautiful artwork.
- **Scene Navigation:** Seamlessly move between locations like Wee Cair, Wall Garden, Shop, and Greenhouse.
- **Time System:** Day/night cycle affects gameplay and NPC interactions.
- **Bush Exploration:** Search bushes for hidden plants and trigger minigame challenges.
- **Custom UI:** Option boxes, popups, HUD, and responsive dialogue systems.
- **Earthy Visuals:** Hand-crafted art and atmospheric backgrounds with layered depth.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [npm](https://www.npmjs.com/) 

### Installation

1. Clone the repository:
    ```bash
    git clone git@github.com:tomlukewarden/MSc-Project.git
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Open your browser and go to [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

## Project Structure

```
src/
  components/
    scenes/           # Core game scenes
  dialogue/           # Dialogue system and UI helpers
  npc/               # Character interactions
  minigames/         # Interactive game challenges
  utils/          
public/
  assets/     
  index.html         # Entry point
package.json         # Dependencies and scripts
```

## Gameplay

### Core Mechanics

- **Exploration:** Navigate between different garden areas and discover hidden secrets
- **Plant Collection:** Search bushes to find rare plants guarded by playful animals
- **Minigame Challenges:** Win plants by succeeding in skill-based minigames
- **Character Interactions:** Engage with various NPCs through branching dialogue
- **Inventory Management:** Organize collected plants and items in your personal journal
- **Shopping:** Trade items and purchase new plants from the garden shop

### Minigames

- **Tic-Tac-Toe:** Outsmart the computer to win plant rewards
- **Fishing:** (Coming soon) Test your timing and patience

### Plant Discovery

Plants are hidden throughout the garden in interactive bushes. When you find one:
1. A cheeky animal appears trying to steal it
2. Choose to play a minigame to win the plant
3. Success adds the plant to your journal
4. Failure lets you try again at the same bush

## Controls

- **WASD**: Move your character around the garden
- **Mouse**: Interact with NPCs, bushes, shop items, and UI elements
- **Click**: Advance dialogue, select options, and play minigames
- **ESC**: Access pause menu

## Save System

The game automatically saves your progress including:
- Collected plants and inventory items
- Discovered bush locations
- Dialogue progression with NPCs
- Shop transactions
- Time of day

## Technical Features

- **Phaser 3 Scene Management:** Efficient scene loading and transitions
- **Component-Based Architecture:** Modular and maintainable code structure
- **Local Storage Persistence:** Progress saved between sessions
- **Dynamic Asset Loading:** Efficient memory management
- **Responsive Design:** Adapts to different screen sizes
- **Error Handling:** Robust fallbacks for missing assets

## Development

### Adding New Plants

1. Add plant data to `src/data/plantData.js`
2. Place plant artwork in `public/assets/plants/`
3. Configure bush locations in scene files
4. Test minigame integration

### Creating New Minigames

1. Create minigame folder in `src/minigames/`
2. Implement tutorial and game scenes
3. Add to `minigameScene.jsx` launcher
4. Include assets in `public/assets/minigame/`

## Credits

- **Programming & Game Design:** Thomas Warden
- **Art & Visual Design:** Emma Formosa
- **Framework:** [Phaser 3](https://phaser.io/)
- **Special Thanks:** Academic supervisors and playtesters

## License

This project is for academic purposes as part of an MSc degree. For other uses, please contact the author.

---

**Explore, discover, and become the ultimate botanist!** 🌱

*Happy gardening!*
