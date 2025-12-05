import { Actor, Circle, Collider, CollisionContact, CollisionType, Color, EasingFunctions, EmitterType, Engine, GraphicsGroup, ParticleEmitter, Rectangle, Side, vec } from "excalibur";

// Player state machine enum
enum PlayerState {
  RUNNING,   // On ground, auto-running
  JUMPING,   // Initial jump frame (~100ms)
  IN_AIR,    // Airborne, can perform tricks
  GRINDING,  // On rail
  LANDING    // Brief landing transition (~50ms)
}

export class Player extends Actor {
  // Physics constants
  private readonly RUN_SPEED = 350;       // px/s horizontal
  private readonly JUMP_VELOCITY = -450;  // Negative = upward
  private readonly GRAVITY = 1200;        // Matches engine gravity
  private readonly GRIND_SPEED = 400;     // Slightly faster on rails

  // State tracking
  private state: PlayerState = PlayerState.IN_AIR; // Start in air, will land on first building
  private airTrickCount: number = 0;
  private stateTimer: number = 0;
  private isGameOver: boolean = false;

  // Graphics for different states
  private runningGraphic!: Rectangle;
  private jumpingGraphic!: Rectangle;
  private trick1Graphic!: Rectangle;
  private trick2Graphic!: Rectangle;
  private trick3Graphic!: Rectangle;
  private grindGraphic!: Rectangle;

  // Particle emitter for landing effects
  private landingEmitter!: ParticleEmitter;
  private particleTimer: number = 0;

  constructor() {
    super({
      name: 'Player',
      pos: vec(100, 420), // Start further left to give time to land
      width: 40,
      height: 60,
      collisionType: CollisionType.Active // Participates in physics
    });
  }

  override onInitialize(engine: Engine) {
    // Enable gravity
    this.body.useGravity = true;

    // Create placeholder graphics (colored rectangles)
    this.runningGraphic = new Rectangle({
      width: 40,
      height: 60,
      color: Color.Green
    });

    this.jumpingGraphic = new Rectangle({
      width: 40,
      height: 60,
      color: Color.Blue
    });

    this.trick1Graphic = new Rectangle({
      width: 40,
      height: 60,
      color: Color.Yellow
    });

    this.trick2Graphic = new Rectangle({
      width: 40,
      height: 60,
      color: Color.Orange
    });

    this.trick3Graphic = new Rectangle({
      width: 40,
      height: 60,
      color: Color.Red
    });

    this.grindGraphic = new Rectangle({
      width: 40,
      height: 60,
      color: new Color(255, 140, 0) // Dark orange for grinding
    });

    // Start with running graphic
    this.graphics.use(this.runningGraphic);

    // Create particle emitter for landing effects
    this.landingEmitter = new ParticleEmitter({
      pos: vec(0, 30), // Position below player
      emitterType: EmitterType.Circle,
      radius: 5,
      minVel: 50,
      maxVel: 150,
      minAngle: 0,
      maxAngle: Math.PI,
      isEmitting: false,
      emitRate: 100,
      particle: {
        life: 500,
        opacity: 0.8,
        beginColor: Color.fromHex('#D2B48C'), // Tan/dust color
        endColor: Color.fromHex('#D2B48C').darken(0.3),
        startSize: 4,
        endSize: 1,
        acc: vec(0, 300) // Gravity on particles
      }
    });
    this.addChild(this.landingEmitter);
  }

  // Handle input from tap/click
  handleInput() {
    if (this.state === PlayerState.RUNNING || this.state === PlayerState.GRINDING) {
      this.jump();
    } else if (this.state === PlayerState.IN_AIR) {
      this.incrementTrick();
    }
  }

  private jump() {
    this.vel.y = this.JUMP_VELOCITY;
    this.transitionTo(PlayerState.JUMPING);
  }

  private incrementTrick() {
    if (this.airTrickCount < 3) {
      this.airTrickCount++;
      this.updateAnimation();

      // Emit trick event with trick name
      const trickNames = ['OLLIE!', 'KICKFLIP!', 'HEELFLIP!'];
      const trickName = trickNames[this.airTrickCount - 1];
      this.scene?.engine.emit('trick', { trickName });

      // Visual feedback - scale pulse
      this.performTrickAnimation();
    }
  }

  private performTrickAnimation() {
    // Clear any existing scale actions
    this.actions.clearActions();

    // Quick scale pulse: grow to 1.2x then back to 1.0x over 200ms
    this.actions.scaleTo(vec(1.3, 1.3), vec(15, 15)) // Scale up fast
      .scaleTo(vec(1.0, 1.0), vec(10, 10));          // Scale back down
  }

  private transitionTo(newState: PlayerState) {
    this.state = newState;
    this.stateTimer = 0;

    // Set velocity once when entering state
    switch (newState) {
      case PlayerState.RUNNING:
      case PlayerState.JUMPING:
      case PlayerState.IN_AIR:
      case PlayerState.LANDING:
        this.vel.x = this.RUN_SPEED;
        break;
      case PlayerState.GRINDING:
        this.vel.x = this.GRIND_SPEED;
        break;
    }

    this.updateAnimation();
  }

  private updateAnimation() {
    switch (this.state) {
      case PlayerState.RUNNING:
        this.graphics.use(this.runningGraphic);
        break;
      case PlayerState.JUMPING:
        this.graphics.use(this.jumpingGraphic);
        break;
      case PlayerState.IN_AIR:
        // Show trick graphics based on trick count
        if (this.airTrickCount === 0) {
          this.graphics.use(this.jumpingGraphic);
        } else if (this.airTrickCount === 1) {
          this.graphics.use(this.trick1Graphic);
        } else if (this.airTrickCount === 2) {
          this.graphics.use(this.trick2Graphic);
        } else {
          this.graphics.use(this.trick3Graphic);
        }
        break;
      case PlayerState.GRINDING:
        this.graphics.use(this.grindGraphic);
        break;
      case PlayerState.LANDING:
        this.graphics.use(this.runningGraphic);
        break;
    }
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    const delta = elapsedMs / 1000; // Convert to seconds
    this.stateTimer += delta;

    // Update particle timer
    if (this.particleTimer > 0) {
      this.particleTimer -= delta;
      if (this.particleTimer <= 0) {
        this.landingEmitter.isEmitting = false;
      }
    }

    // Check death zone (fell off screen)
    if (this.pos.y > 700 && !this.isGameOver) {
      this.handleGameOver(engine);
      return;
    }

    // Don't update if game over
    if (this.isGameOver) {
      return;
    }

    // Update based on current state
    switch (this.state) {
      case PlayerState.RUNNING:
        this.updateRunning(delta);
        break;
      case PlayerState.JUMPING:
        this.updateJumping(delta);
        break;
      case PlayerState.IN_AIR:
        this.updateInAir(delta);
        break;
      case PlayerState.GRINDING:
        this.updateGrinding(delta);
        break;
      case PlayerState.LANDING:
        this.updateLanding(delta);
        break;
    }
  }

  private handleGameOver(engine: Engine) {
    this.isGameOver = true;
    console.log('Game Over! Distance traveled:', Math.floor(this.pos.x));
    // Emit custom event for scene to handle restart
    engine.emit('gameover', { distance: Math.floor(this.pos.x) });
  }

  private updateRunning(delta: number) {
    // Velocity set in transitionTo, physics handles movement
  }

  private updateJumping(delta: number) {
    // Transition to IN_AIR after 100ms
    if (this.stateTimer > 0.1) {
      this.transitionTo(PlayerState.IN_AIR);
    }
  }

  private updateInAir(delta: number) {
    // Gravity handles vertical, velocity set in transitionTo
  }

  private updateGrinding(delta: number) {
    // Velocity set in transitionTo
  }

  private updateLanding(delta: number) {
    // Brief landing transition (50ms)
    if (this.stateTimer > 0.05) {
      this.transitionTo(PlayerState.RUNNING);
    }
  }

  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    const otherActor = other.owner as Actor;

    // Only process bottom collisions (landing)
    if (side === Side.Bottom) {
      // Trigger landing particles
      this.emitLandingParticles();

      // Check if rail
      if (otherActor.hasTag('rail')) {
        this.transitionTo(PlayerState.GRINDING);
        this.airTrickCount = 0;
        return;
      }

      // Check if building
      if (otherActor.hasTag('building')) {
        this.transitionTo(PlayerState.LANDING);
        this.airTrickCount = 0;
        return;
      }
    }

    // Side collision = game over
    if (side === Side.Left || side === Side.Right) {
      // Could trigger game over here
    }
  }

  private emitLandingParticles() {
    // Emit a burst of particles
    this.landingEmitter.isEmitting = true;
    this.particleTimer = 0.1; // 100ms in seconds
  }

  override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    const otherActor = other.owner as Actor;

    // Left the ground/rail
    if (otherActor.hasTag('rail') || otherActor.hasTag('building')) {
      if (this.state === PlayerState.GRINDING || this.state === PlayerState.RUNNING) {
        // Only transition to IN_AIR if we're actually falling
        if (Math.abs(this.vel.y) > 1) {
          this.transitionTo(PlayerState.IN_AIR);
        }
      }
    }
  }
}
