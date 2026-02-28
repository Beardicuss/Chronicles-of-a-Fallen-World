/**
 * Physics System Type Definitions
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface PhysicsConfig {
  gravity: number;
  timeStep: number;
  velocityIterations: number;
  positionIterations: number;
  enableDebug: boolean;
  worldBounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface RigidBodyConfig {
  id: string;
  type: 'dynamic' | 'static' | 'kinematic';
  position: Vector2;
  velocity?: Vector2;
  mass?: number;
  width: number;
  height: number;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
}

export interface RigidBody {
  id: string;
  config: RigidBodyConfig;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  angularVelocity: number;
  isAwake: boolean;
  isSleeping: boolean;
}

export interface CollisionEvent {
  bodyAId: string;
  bodyBId: string;
  point: Vector2;
  normal: Vector2;
  depth: number;
  type: 'start' | 'persist' | 'end';
}

export interface RayCastResult {
  bodyId: string;
  point: Vector2;
  normal: Vector2;
  fraction: number;
}

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
