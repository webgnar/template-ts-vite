import { Color, DisplayMode, Engine, FadeInOut, SolverStrategy, vec } from "excalibur";
import { loader } from "./resources";
import { MyLevel } from "./level";

// Goal is to keep main.ts small and just enough to configure the engine

const game = new Engine({
  width: 800, // Logical width and height in game pixels
  height: 600,
  displayMode: DisplayMode.FitScreenAndFill, // Display mode tells excalibur how to fill the window
  pixelArt: true, // pixelArt will turn on the correct settings to render pixel art without jaggies or shimmering artifacts
  scenes: {
    start: MyLevel
  },
  physics: {
    solver: SolverStrategy.Arcade, // Best for platformers - prevents overlap
    gravity: vec(0, 1200), // Strong downward pull for snappy jumps
    substep: 3 // Prevents collision tunneling at high speeds
  },
  fixedUpdateTimestep: 16 // 60fps consistent physics simulation
});

game.start('start', { // name of the start scene 'start'
  loader, // Optional loader (but needed for loading images/sounds)
  inTransition: new FadeInOut({ // Optional in transition
    duration: 1000,
    direction: 'in',
    color: Color.ExcaliburBlue
  })
}).then(() => {
  // Do something after the game starts
});