import { Scene } from "excalibur";
import { Building } from "./building";

export class TerrainManager {
  private scene: Scene;
  private buildings: Building[] = [];
  private rightmostEdge: number = 0;

  // Generation parameters
  private readonly MIN_BUILDING_WIDTH = 200;
  private readonly MAX_BUILDING_WIDTH = 600;
  private readonly MIN_GAP = 100;
  private readonly MAX_GAP = 350; // Validated as jumpable based on physics
  private readonly SPAWN_DISTANCE = 1600; // 2 screen widths ahead
  private readonly DESPAWN_DISTANCE = -800; // 1 screen width behind

  constructor(scene: Scene) {
    this.scene = scene;

    // Generate initial buildings
    this.spawnInitialBuildings();
  }

  private spawnInitialBuildings() {
    // Start with first building at x=0
    this.rightmostEdge = 0;

    // Spawn enough buildings to fill 2 screen widths
    while (this.rightmostEdge < 1600) {
      this.spawnBuilding();
    }
  }

  private spawnBuilding() {
    // Random width for this building
    const width = this.randomRange(this.MIN_BUILDING_WIDTH, this.MAX_BUILDING_WIDTH);

    // Create building at rightmost edge
    const building = new Building(this.rightmostEdge, width);
    this.buildings.push(building);
    this.scene.add(building);

    // Update rightmost edge (add building width + random gap)
    this.rightmostEdge += width;
    const gap = this.randomRange(this.MIN_GAP, this.MAX_GAP);
    this.rightmostEdge += gap;
  }

  private randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  update(cameraX: number) {
    // Spawn new buildings ahead of camera
    while (this.rightmostEdge < cameraX + this.SPAWN_DISTANCE) {
      this.spawnBuilding();
    }

    // Despawn buildings behind camera
    this.buildings = this.buildings.filter(building => {
      const buildingRight = building.pos.x + building.width / 2;

      if (buildingRight < cameraX + this.DESPAWN_DISTANCE) {
        // Remove from scene and mark for despawn
        building.kill();
        return false; // Remove from array
      }

      return true; // Keep in array
    });
  }

  // Get count of active buildings (for debugging)
  getActiveCount(): number {
    return this.buildings.length;
  }
}
