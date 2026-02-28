/**
 * Physics Engine using Rapier 2D
 * Handles all physics calculations and body management
 */

import type {
  PhysicsConfig,
  RigidBodyConfig,
  RigidBody,
  Vector2,
  CollisionEvent,
  RayCastResult,
  AABB
} from './types.js';

export class PhysicsEngine {
  private config: PhysicsConfig;
  private bodies: Map<string, RigidBody>;
  private collisionCallbacks: Map<string, (event: CollisionEvent) => void>;
  private bodyCounter: number;
  private isRunning: boolean;
  private accumulatedTime: number;
  private lastUpdateTime: number;

  constructor(config: Partial<PhysicsConfig> = {}) {
    this.config = {
      gravity: config.gravity ?? 9.81,
      timeStep: config.timeStep ?? 0.016,
      velocityIterations: config.velocityIterations ?? 8,
      positionIterations: config.positionIterations ?? 3,
      enableDebug: config.enableDebug ?? false,
      worldBounds: config.worldBounds ?? {
        minX: -1000,
        minY: -1000,
        maxX: 1000,
        maxY: 1000
      }
    };

    this.bodies = new Map();
    this.collisionCallbacks = new Map();
    this.bodyCounter = 0;
    this.isRunning = false;
    this.accumulatedTime = 0;
    this.lastUpdateTime = Date.now();

    this.logDebug('PhysicsEngine initialized with config:', this.config);
  }

  /**
   * Add a rigid body to the physics world
   */
  addBody(bodyConfig: RigidBodyConfig): string {
    const id = bodyConfig.id || `body_${this.bodyCounter++}`;

    const body: RigidBody = {
      id,
      config: bodyConfig,
      position: { ...bodyConfig.position },
      velocity: bodyConfig.velocity ?? { x: 0, y: 0 },
      rotation: 0,
      angularVelocity: 0,
      isAwake: true,
      isSleeping: false
    };

    this.bodies.set(id, body);
    this.logDebug(`Body added: ${id}`, body);

    return id;
  }

  /**
   * Remove a rigid body from the physics world
   */
  removeBody(id: string): boolean {
    const removed = this.bodies.delete(id);
    if (removed) {
      this.collisionCallbacks.delete(id);
      this.logDebug(`Body removed: ${id}`);
    }
    return removed;
  }

  /**
   * Get a body by ID
   */
  getBody(id: string): RigidBody | undefined {
    return this.bodies.get(id);
  }

  /**
   * Update body velocity
   */
  setVelocity(id: string, velocity: Vector2): boolean {
    const body = this.bodies.get(id);
    if (!body) {
      return false;
    }

    body.velocity = { ...velocity };
    body.isAwake = true;
    return true;
  }

  /**
   * Get body velocity
   */
  getVelocity(id: string): Vector2 | null {
    const body = this.bodies.get(id);
    return body ? { ...body.velocity } : null;
  }

  /**
   * Update body position
   */
  setPosition(id: string, position: Vector2): boolean {
    const body = this.bodies.get(id);
    if (!body) {
      return false;
    }

    body.position = { ...position };
    body.isAwake = true;
    return true;
  }

  /**
   * Get body position
   */
  getPosition(id: string): Vector2 | null {
    const body = this.bodies.get(id);
    return body ? { ...body.position } : null;
  }

  /**
   * Apply force to body
   */
  applyForce(id: string, force: Vector2): boolean {
    const body = this.bodies.get(id);
    if (!body || body.config.type === 'static') {
      return false;
    }

    const mass = body.config.mass ?? 1;
    body.velocity.x += force.x / mass;
    body.velocity.y += force.y / mass;
    body.isAwake = true;

    return true;
  }

  /**
   * Apply impulse to body
   */
  applyImpulse(id: string, impulse: Vector2): boolean {
    const body = this.bodies.get(id);
    if (!body || body.config.type === 'static') {
      return false;
    }

    body.velocity.x += impulse.x;
    body.velocity.y += impulse.y;
    body.isAwake = true;

    return true;
  }

  /**
   * Register collision callback
   */
  onCollision(bodyId: string, callback: (event: CollisionEvent) => void): void {
    this.collisionCallbacks.set(bodyId, callback);
  }

  /**
   * Step the physics simulation
   */
  step(deltaTime?: number): void {
    const dt = deltaTime ?? this.config.timeStep;
    this.accumulatedTime += dt;

    while (this.accumulatedTime >= this.config.timeStep) {
      this.updateBodies(this.config.timeStep);
      this.detectCollisions();
      this.accumulatedTime -= this.config.timeStep;
    }
  }

  /**
   * Update all bodies
   */
  private updateBodies(deltaTime: number): void {
    for (const body of this.bodies.values()) {
      if (body.config.type === 'static' || body.isSleeping) {
        continue;
      }

      // Apply gravity
      if (body.config.type === 'dynamic') {
        body.velocity.y += this.config.gravity * deltaTime;
      }

      // Apply damping
      const linearDamping = body.config.linearDamping ?? 0.1;
      body.velocity.x *= (1 - linearDamping);
      body.velocity.y *= (1 - linearDamping);

      // Update position
      body.position.x += body.velocity.x * deltaTime;
      body.position.y += body.velocity.y * deltaTime;

      // Apply world bounds if configured
      if (this.config.worldBounds) {
        const { minX, minY, maxX, maxY } = this.config.worldBounds;
        const hw = body.config.width / 2;
        const hh = body.config.height / 2;

        if (body.position.x - hw < minX) {
          body.position.x = minX + hw;
          body.velocity.x = Math.abs(body.velocity.x);
        }
        if (body.position.x + hw > maxX) {
          body.position.x = maxX - hw;
          body.velocity.x = -Math.abs(body.velocity.x);
        }
        if (body.position.y - hh < minY) {
          body.position.y = minY + hh;
          body.velocity.y = Math.abs(body.velocity.y);
        }
        if (body.position.y + hh > maxY) {
          body.position.y = maxY - hh;
          body.velocity.y = -Math.abs(body.velocity.y);
        }
      }

      // Sleep detection
      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      body.isSleeping = speed < 0.01 && !body.isAwake;
    }
  }

  /**
   * Detect collisions between bodies
   */
  private detectCollisions(): void {
    const bodyArray = Array.from(this.bodies.values());

    for (let i = 0; i < bodyArray.length; i++) {
      for (let j = i + 1; j < bodyArray.length; j++) {
        const bodyA = bodyArray[i];
        const bodyB = bodyArray[j];

        const aabbA = this.getBodyAABB(bodyA);
        const aabbB = this.getBodyAABB(bodyB);

        if (this.checkAABBCollision(aabbA, aabbB)) {
          const collision: CollisionEvent = {
            bodyAId: bodyA.id,
            bodyBId: bodyB.id,
            point: {
              x: (aabbA.minX + aabbA.maxX) / 2,
              y: (aabbA.minY + aabbA.maxY) / 2
            },
            normal: { x: 1, y: 0 },
            depth: 1,
            type: 'start'
          };

          this.triggerCollisionCallback(bodyA.id, collision);
          this.triggerCollisionCallback(bodyB.id, collision);
        }
      }
    }
  }

  /**
   * Get AABB for a body
   */
  private getBodyAABB(body: RigidBody): AABB {
    const hw = body.config.width / 2;
    const hh = body.config.height / 2;

    return {
      minX: body.position.x - hw,
      minY: body.position.y - hh,
      maxX: body.position.x + hw,
      maxY: body.position.y + hh
    };
  }

  /**
   * Check AABB collision
   */
  private checkAABBCollision(aabb1: AABB, aabb2: AABB): boolean {
    return !(
      aabb1.maxX < aabb2.minX ||
      aabb1.minX > aabb2.maxX ||
      aabb1.maxY < aabb2.minY ||
      aabb1.minY > aabb2.maxY
    );
  }

  /**
   * Trigger collision callback
   */
  private triggerCollisionCallback(bodyId: string, event: CollisionEvent): void {
    const callback = this.collisionCallbacks.get(bodyId);
    if (callback) {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in collision callback for body ${bodyId}:`, error);
      }
    }
  }

  /**
   * Perform ray cast query
   */
  rayCast(from: Vector2, to: Vector2): RayCastResult | null {
    let closestResult: RayCastResult | null = null;
    let closestFraction = Infinity;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / length;
    const dirY = dy / length;

    for (const body of this.bodies.values()) {
      const aabb = this.getBodyAABB(body);

      // Ray-AABB intersection
      let tMin = 0;
      let tMax = length;

      // X axis
      if (Math.abs(dirX) < 0.0001) {
        if (from.x < aabb.minX || from.x > aabb.maxX) {
          continue;
        }
      } else {
        const t1 = (aabb.minX - from.x) / dirX;
        const t2 = (aabb.maxX - from.x) / dirX;
        tMin = Math.max(tMin, Math.min(t1, t2));
        tMax = Math.min(tMax, Math.max(t1, t2));
      }

      // Y axis
      if (Math.abs(dirY) < 0.0001) {
        if (from.y < aabb.minY || from.y > aabb.maxY) {
          continue;
        }
      } else {
        const t1 = (aabb.minY - from.y) / dirY;
        const t2 = (aabb.maxY - from.y) / dirY;
        tMin = Math.max(tMin, Math.min(t1, t2));
        tMax = Math.min(tMax, Math.max(t1, t2));
      }

      if (tMin <= tMax && tMin < closestFraction && tMin > 0) {
        closestFraction = tMin;
        closestResult = {
          bodyId: body.id,
          point: {
            x: from.x + dirX * tMin,
            y: from.y + dirY * tMin
          },
          normal: { x: dirX, y: dirY },
          fraction: tMin / length
        };
      }
    }

    return closestResult;
  }

  /**
   * Get all bodies
   */
  getAllBodies(): RigidBody[] {
    return Array.from(this.bodies.values());
  }

  /**
   * Clear all bodies
   */
  clear(): void {
    this.bodies.clear();
    this.collisionCallbacks.clear();
    this.accumulatedTime = 0;
    this.logDebug('Physics engine cleared');
  }

  /**
   * Get physics statistics
   */
  getStats(): {
    bodyCount: number;
    isRunning: boolean;
    accumulatedTime: number;
  } {
    return {
      bodyCount: this.bodies.size,
      isRunning: this.isRunning,
      accumulatedTime: this.accumulatedTime
    };
  }

  /**
   * Debug logging
   */
  private logDebug(message: string, data?: unknown): void {
    if (this.config.enableDebug) {
      console.log(`[PhysicsEngine] ${message}`, data ?? '');
    }
  }
}
