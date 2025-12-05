import { Axis, Color, DefaultLoader, Engine, ExcaliburGraphicsContext, Font, Label, LockCameraToActorAxisStrategy, Scene, SceneActivationContext, TextAlign, vec } from "excalibur";
import { Player } from "./player";
import { TerrainManager } from "./terrain";

export class MyLevel extends Scene {
    private player!: Player;
    private terrainManager!: TerrainManager;
    private distanceLabel!: Label;
    private gameOverLabel!: Label;
    private restartLabel!: Label;
    private trickLabel!: Label;
    private trickLabelTimer: number = 0;
    private instructionsLabel!: Label;
    private instructionsTimer: number = 5.0; // Show for 5 seconds
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
            if (this.isGameOver) {
                // Restart game
                this.restartGame(engine);
            } else {
                // Hide instructions on first tap
                if (this.instructionsLabel.graphics.visible) {
                    this.instructionsLabel.graphics.visible = false;
                    this.instructionsTimer = 0;
                }
                this.player.handleInput();
            }
        });

        // Listen for gameover event to show game over screen (once per scene instance)
        engine.once('gameover', (evt: any) => {
            this.showGameOver(evt.distance);
        });

        // Listen for trick events to show trick names
        engine.on('trick', (evt: any) => {
            this.showTrick(evt.trickName);
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

        // Create trick name label (hidden initially)
        this.trickLabel = new Label({
            text: 'TRICK!',
            pos: vec(400, 200),
            font: new Font({
                family: 'Arial',
                size: 36,
                color: Color.Yellow,
                textAlign: TextAlign.Center
            })
        });
        this.trickLabel.z = 150;
        this.trickLabel.graphics.visible = false;
        this.add(this.trickLabel);

        // Create instructions label (visible at start)
        this.instructionsLabel = new Label({
            text: 'TAP TO JUMP\nTap in air for tricks!',
            pos: vec(400, 400),
            font: new Font({
                family: 'Arial',
                size: 28,
                color: Color.White,
                textAlign: TextAlign.Center
            })
        });
        this.instructionsLabel.z = 150;
        this.add(this.instructionsLabel);
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

        // Update trick label timer and position
        if (this.trickLabelTimer > 0) {
            const delta = elapsedMs / 1000;
            this.trickLabelTimer -= delta;
            if (this.trickLabelTimer <= 0) {
                this.trickLabel.graphics.visible = false;
            }
            // Keep trick label centered on camera
            this.trickLabel.pos = vec(this.camera.pos.x, 200);
        }

        // Update instructions timer and position
        if (this.instructionsTimer > 0 && this.instructionsLabel.graphics.visible) {
            const delta = elapsedMs / 1000;
            this.instructionsTimer -= delta;
            if (this.instructionsTimer <= 0) {
                this.instructionsLabel.graphics.visible = false;
            }
            // Keep instructions centered on camera
            this.instructionsLabel.pos = vec(this.camera.pos.x, 400);
        }
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
    }

    private restartGame(engine: Engine) {
        // Simple and reliable: just reload the page
        window.location.reload();
    }

    private showTrick(trickName: string) {
        // Display trick name for 0.8 seconds
        this.trickLabel.text = trickName;
        this.trickLabel.graphics.visible = true;
        this.trickLabelTimer = 0.8; // 800ms
        this.trickLabel.pos = vec(this.camera.pos.x, 200);
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
