import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, GraphicsGroup, Rectangle, Side, vec } from "excalibur";

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

  // Graphics for different states
  private runningGraphic!: Rectangle;
  private jumpingGraphic!: Rectangle;
  private trick1Graphic!: Rectangle;
  private trick2Graphic!: Rectangle;
  private trick3Graphic!: Rectangle;
  private grindGraphic!: Rectangle;

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
      console.log(`Trick ${this.airTrickCount}!`);
    }
  }

  private transitionTo(newState: PlayerState) {
    this.state = newState;
    this.stateTimer = 0;
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

  private updateRunning(delta: number) {
    // Constant forward velocity
    this.vel.x = this.RUN_SPEED;
  }

  private updateJumping(delta: number) {
    // Maintain forward momentum
    this.vel.x = this.RUN_SPEED;

    // Transition to IN_AIR after 100ms
    if (this.stateTimer > 0.1) {
      this.transitionTo(PlayerState.IN_AIR);
    }
  }

  private updateInAir(delta: number) {
    // Maintain forward momentum (gravity handles vertical)
    this.vel.x = this.RUN_SPEED;
  }

  private updateGrinding(delta: number) {
    // Slightly faster on rails
    this.vel.x = this.GRIND_SPEED;
  }

  private updateLanding(delta: number) {
    // Maintain velocity
    this.vel.x = this.RUN_SPEED;

    // Brief landing transition (50ms)
    if (this.stateTimer > 0.05) {
      this.transitionTo(PlayerState.RUNNING);
    }
  }

  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    const otherActor = other.owner as Actor;

    // Only process bottom collisions (landing)
    if (side === Side.Bottom) {
      // Check if rail
      if (otherActor.hasTag('rail')) {
        this.transitionTo(PlayerState.GRINDING);
        this.airTrickCount = 0;
        console.log('Grinding!');
        return;
      }

      // Check if building
      if (otherActor.hasTag('building')) {
        this.transitionTo(PlayerState.LANDING);
        this.airTrickCount = 0;
        console.log('Landed!');
        return;
      }
    }

    // Side collision = game over (for now just log)
    if (side === Side.Left || side === Side.Right) {
      console.log('Hit wall! Game Over!');
    }
  }

  override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    const otherActor = other.owner as Actor;

    // Left the ground/rail
    if (otherActor.hasTag('rail') || otherActor.hasTag('building')) {
      if (this.state === PlayerState.GRINDING || this.state === PlayerState.RUNNING) {
        // Only transition to IN_AIR if we're actually falling
        if (Math.abs(this.vel.y) > 1) {
          this.transitionTo(PlayerState.IN_AIR);
          console.log('In air!');
        }
      }
    }
  }
}
