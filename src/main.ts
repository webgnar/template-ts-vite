import { Color, DisplayMode, Engine, FadeInOut, SolverStrategy, vec } from "excalibur";
import { loader } from "./resources";
import { MyLevel } from "./level";

// Goal is to keep main.ts small and just enough to configure the engine

const game = new Engine({
  width: 800, // Logical width and height in game pixels
  height: 600,
  displayMode: DisplayMode.FitScreenAndFill, // Display mode tells excalibur how to fill the window
  pixelArt: false, // Disabled to prevent pixel snapping jitter
  antialiasing: true, // Smooth rendering
  scenes: {
    start: MyLevel
  },
  physics: {
    solver: SolverStrategy.Arcade, // Best for platformers - prevents overlap
    gravity: vec(0, 1200), // Strong downward pull for snappy jumps
    substep: 2 // Balance between performance and stability
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