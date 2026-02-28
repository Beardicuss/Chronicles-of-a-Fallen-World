/**
 * Collision Detection System
 * Handles advanced collision queries and spatial partitioning
 */

import type { RigidBody, AABB, Vector2 } from './types.js';

export interface CollisionQuery {
  point: Vector2;
  radius: number;
  callback: (bodyId: string) => void;
}

export interface SpatialPartitionConfig {
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
}

export class CollisionDetectionSystem {
  private spatialGrid: Map<string, Set<string>>;
  private config: SpatialPartitionConfig;
  private bodies: Map<string, RigidBody>;

  constructor(config: Partial<SpatialPartitionConfig> = {}) {
    this.config = {
      cellSize: config.cellSize ?? 64,
      gridWidth: config.gridWidth ?? 20,
      gridHeight: config.gridHeight ?? 20
    };
    this.spatialGrid = new Map();
    this.bodies = new Map();
    this.initializeGrid();
  }

  /**
   * Initialize spatial grid
   */
  private initializeGrid(): void {
    for (let x = 0; x < this.config.gridWidth; x++) {
      for (let y = 0; y < this.config.gridHeight; y++) {
        const key = this.getCellKey(x, y);
        this.spatialGrid.set(key, new Set());
      }
    }
  }

  /**
   * Get cell key from coordinates
   */
  private getCellKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  /**
   * Get cell coordinates from world position
   */
  private getCellCoordinates(x: number, y: number): { cellX: number; cellY: number } {
    return {
      cellX: Math.floor(x / this.config.cellSize),
      cellY: Math.floor(y / this.config.cellSize)
    };
  }

  /**
   * Register body in spatial partition
   */
  registerBody(body: RigidBody): void {
    this.bodies.set(body.id, body);
    this.updateBodyInGrid(body);
  }

  /**
   * Unregister body from spatial partition
   */
  unregisterBody(bodyId: string): void {
    const body = this.bodies.get(bodyId);
    if (body) {
      this.removeBodyFromGrid(body);
      this.bodies.delete(bodyId);
    }
  }

  /**
   * Update body in spatial grid
   */
  updateBodyInGrid(body: RigidBody): void {
    this.removeBodyFromGrid(body);

    const hw = body.config.width / 2;
    const hh = body.config.height / 2;
    const minCell = this.getCellCoordinates(
      body.position.x - hw,
      body.position.y - hh
    );
    const maxCell = this.getCellCoordinates(
      body.position.x + hw,
      body.position.y + hh
    );

    for (let x = minCell.cellX; x <= maxCell.cellX; x++) {
      for (let y = minCell.cellY; y <= maxCell.cellY; y++) {
        if (x >= 0 && x < this.config.gridWidth && y >= 0 && y < this.config.gridHeight) {
          const key = this.getCellKey(x, y);
          const cell = this.spatialGrid.get(key);
          if (cell) {
            cell.add(body.id);
          }
        }
      }
    }
  }

  /**
   * Remove body from grid
   */
  private removeBodyFromGrid(body: RigidBody): void {
    for (const cell of this.spatialGrid.values()) {
      cell.delete(body.id);
    }
  }

  /**
   * Query bodies near a point
   */
  queryPoint(position: Vector2): string[] {
    const cell = this.getCellCoordinates(position.x, position.y);
    const key = this.getCellKey(cell.cellX, cell.cellY);
    return Array.from(this.spatialGrid.get(key) ?? new Set());
  }

  /**
   * Query bodies in radius
   */
  queryRadius(position: Vector2, radius: number): string[] {
    const results = new Set<string>();
    const minCell = this.getCellCoordinates(position.x - radius, position.y - radius);
    const maxCell = this.getCellCoordinates(position.x + radius, position.y + radius);

    for (let x = minCell.cellX; x <= maxCell.cellX; x++) {
      for (let y = minCell.cellY; y <= maxCell.cellY; y++) {
        if (x >= 0 && x < this.config.gridWidth && y >= 0 && y < this.config.gridHeight) {
          const key = this.getCellKey(x, y);
          const cell = this.spatialGrid.get(key);
          if (cell) {
            for (const bodyId of cell) {
              const body = this.bodies.get(bodyId);
              if (body) {
                const dx = body.position.x - position.x;
                const dy = body.position.y - position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius) {
                  results.add(bodyId);
                }
              }
            }
          }
        }
      }
    }

    return Array.from(results);
  }

  /**
   * Query bodies in AABB
   */
  queryAABB(aabb: AABB): string[] {
    const results = new Set<string>();
    const minCell = this.getCellCoordinates(aabb.minX, aabb.minY);
    const maxCell = this.getCellCoordinates(aabb.maxX, aabb.maxY);

    for (let x = minCell.cellX; x <= maxCell.cellX; x++) {
      for (let y = minCell.cellY; y <= maxCell.cellY; y++) {
        if (x >= 0 && x < this.config.gridWidth && y >= 0 && y < this.config.gridHeight) {
          const key = this.getCellKey(x, y);
          const cell = this.spatialGrid.get(key);
          if (cell) {
            results.forEach(id => results.add(id));
          }
        }
      }
    }

    return Array.from(results);
  }

  /**
   * Check AABB overlap
   */
  checkAABBOverlap(aabb1: AABB, aabb2: AABB): boolean {
    return !(
      aabb1.maxX < aabb2.minX ||
      aabb1.minX > aabb2.maxX ||
      aabb1.maxY < aabb2.minY ||
      aabb1.minY > aabb2.maxY
    );
  }

  /**
   * Check circle overlap
   */
  checkCircleOverlap(
    center1: Vector2,
    radius1: number,
    center2: Vector2,
    radius2: number
  ): boolean {
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= radius1 + radius2;
  }

  /**
   * Get closest body to point
   */
  getClosestBody(position: Vector2, maxDistance: number = Infinity): string | null {
    let closest: string | null = null;
    let closestDist = maxDistance;

    for (const [bodyId, body] of this.bodies) {
      const dx = body.position.x - position.x;
      const dy = body.position.y - position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < closestDist) {
        closestDist = dist;
        closest = bodyId;
      }
    }

    return closest;
  }

  /**
   * Update all bodies in grid
   */
  updateAll(): void {
    for (const body of this.bodies.values()) {
      this.updateBodyInGrid(body);
    }
  }

  /**
   * Clear spatial partition
   */
  clear(): void {
    this.bodies.clear();
    this.spatialGrid.clear();
    this.initializeGrid();
  }

  /**
   * Get grid statistics
   */
  getStats(): {
    bodyCount: number;
    gridSize: number;
  } {
    const occupiedCells = Array.from(this.spatialGrid.values()).filter(
      cell => cell.size > 0
    ).length;

    return {
      bodyCount: this.bodies.size,
      gridSize: occupiedCells
    };
  }
}
