import { Axis, DefaultLoader, Engine, ExcaliburGraphicsContext, LockCameraToActorAxisStrategy, Scene, SceneActivationContext, vec } from "excalibur";
import { Player } from "./player";
import { TerrainManager } from "./terrain";

export class MyLevel extends Scene {
    private player!: Player;
    private terrainManager!: TerrainManager;

    override onInitialize(engine: Engine): void {
        // Create player
        this.player = new Player();
        this.add(this.player);

        // Create terrain manager for procedural generation
        this.terrainManager = new TerrainManager(this);

        // Setup camera to follow player on X-axis only
        const cameraStrategy = new LockCameraToActorAxisStrategy(this.player, Axis.X);
        this.camera.strategy = cameraStrategy;

        // Set initial camera position
        this.camera.pos = vec(400, 300); // Center of 800x600 screen

        // Setup input - tap anywhere to jump or trick
        engine.input.pointers.primary.on('down', () => {
            this.player.handleInput();
        });

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
        // Update terrain generation based on camera position
        this.terrainManager.update(this.camera.pos.x);
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
