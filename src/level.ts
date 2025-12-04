import { Axis, Color, DefaultLoader, Engine, ExcaliburGraphicsContext, Font, Label, LockCameraToActorAxisStrategy, Scene, SceneActivationContext, TextAlign, vec } from "excalibur";
import { Player } from "./player";
import { TerrainManager } from "./terrain";

export class MyLevel extends Scene {
    private player!: Player;
    private terrainManager!: TerrainManager;
    private distanceLabel!: Label;
    private gameOverLabel!: Label;
    private restartLabel!: Label;
    private isGameOver: boolean = false;

    override onInitialize(engine: Engine): void {
        // Set background to sky blue
        this.backgroundColor = Color.fromHex('#87CEEB');

        // Create player
        this.player = new Player();
        this.add(this.player);

        // Create terrain manager for procedural generation
        this.terrainManager = new TerrainManager(this);

        // Setup camera to follow player on X-axis only
        const cameraStrategy = new LockCameraToActorAxisStrategy(this.player, Axis.X);
        this.camera.strategy = cameraStrategy;

        // Position camera so player is at left 25% of screen (200px from left)
        // Player is at x=100, so camera should be at x=100+300=400 initially
        // But since camera follows player X, it will adjust automatically
        this.camera.pos = vec(this.player.pos.x + 300, 300); // Y fixed at 300

        // Setup input - tap anywhere to jump or trick
        engine.input.pointers.primary.on('down', () => {
            console.log('Click detected! isGameOver:', this.isGameOver);
            if (this.isGameOver) {
                // Restart game
                console.log('Attempting restart...');
                this.restartGame(engine);
            } else {
                this.player.handleInput();
            }
        });

        // Listen for gameover event to show game over screen (once per scene instance)
        engine.once('gameover', (evt: any) => {
            console.log('Gameover event received!');
            this.showGameOver(evt.distance);
        });

        // Create distance counter UI
        this.distanceLabel = new Label({
            text: 'Distance: 0m',
            pos: vec(50, 30),
            font: new Font({
                family: 'Arial',
                size: 24,
                color: Color.White,
                textAlign: TextAlign.Left
            })
        });
        this.distanceLabel.z = 100; // Keep on top
        this.add(this.distanceLabel);

        // Create game over labels (hidden initially)
        this.gameOverLabel = new Label({
            text: 'GAME OVER',
            pos: vec(400, 250),
            font: new Font({
                family: 'Arial',
                size: 48,
                color: Color.White,
                textAlign: TextAlign.Center
            })
        });
        this.gameOverLabel.z = 200;
        this.gameOverLabel.graphics.visible = false;
        this.add(this.gameOverLabel);

        this.restartLabel = new Label({
            text: 'Click to Restart',
            pos: vec(400, 320),
            font: new Font({
                family: 'Arial',
                size: 24,
                color: Color.White,
                textAlign: TextAlign.Center
            })
        });
        this.restartLabel.z = 200;
        this.restartLabel.graphics.visible = false;
        this.add(this.restartLabel);

        console.log('Game initialized! Tap/click anywhere to jump or perform tricks in the air.');
    }

    override onPreLoad(loader: DefaultLoader): void {
        // Add any scene specific resources to load
    }

    override onActivate(context: SceneActivationContext<unknown>): void {
        // Called when Excalibur transitions to this scene
    }

    override onDeactivate(context: SceneActivationContext): void {
        // Called when Excalibur transitions away from this scene
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        // Don't update game if game over
        if (this.isGameOver) {
            return;
        }

        // Manually update camera to follow player on X-axis
        // Player should stay at left 25% of screen (200px from left edge)
        // Camera shows from (camera.x - 400) to (camera.x + 400)
        // So: player.x = camera.x - 400 + 200 => camera.x = player.x + 200
        this.camera.pos.x = this.player.pos.x + 200;

        // Update terrain generation based on camera position
        this.terrainManager.update(this.camera.pos.x);

        // Update distance counter (follow camera and update text)
        const distance = Math.floor(Math.max(0, this.player.pos.x - 100)); // Subtract starting position
        this.distanceLabel.text = `Distance: ${distance}m`;
        this.distanceLabel.pos = vec(this.camera.pos.x - 350, 30); // Keep at top-left of screen
    }

    private showGameOver(distance: number) {
        this.isGameOver = true;

        // Stop player movement
        this.player.vel = vec(0, 0);
        this.player.acc = vec(0, 0);

        // Update game over text with distance
        this.gameOverLabel.text = `GAME OVER\nDistance: ${distance}m`;
        this.gameOverLabel.graphics.visible = true;

        // Show restart instruction
        this.restartLabel.graphics.visible = true;

        // Position labels at center of current camera view
        this.gameOverLabel.pos = vec(this.camera.pos.x, 250);
        this.restartLabel.pos = vec(this.camera.pos.x, 340);

        console.log(`Game Over! Final distance: ${distance}m`);
    }

    private restartGame(engine: Engine) {
        console.log('Restarting game...');
        // Simple and reliable: just reload the page
        window.location.reload();
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        // Called after everything updates in the scene
    }

    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called before Excalibur draws to the screen
    }

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called after Excalibur draws to the screen
    }
}
