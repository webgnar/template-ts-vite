import { Actor, CollisionType, Color, Rectangle, vec } from "excalibur";

export class Building extends Actor {
  constructor(x: number, width: number) {
    const height = 100; // Fixed height for flat rooftops
    const y = 500; // Ground level (600px screen height - 100px building height)

    super({
      name: 'Building',
      pos: vec(x, y),
      width: width,
      height: height,
      collisionType: CollisionType.Fixed // Static platform, won't move
    });

    // Add 'building' tag for collision detection
    this.addTag('building');
  }

  onInitialize() {
    // Brown rectangle graphic for placeholder
    const graphic = new Rectangle({
      width: this.width,
      height: this.height,
      color: new Color(139, 69, 19) // Brown (saddle brown)
    });

    this.graphics.use(graphic);
  }
}
