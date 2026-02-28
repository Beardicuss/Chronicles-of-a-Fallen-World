/**
 * Integration Guide
 * Helper functions for integrating game engine
 */

import { PhysicsEngine } from '../constants/physics/PhysicsEngine.js';
import { CollisionDetectionSystem } from '../constants/physics/CollisionDetectionSystem.js';
import { WebViewErrorHandler } from '../constants/errorHandling/WebViewErrorHandler.js';
import { SaveSlotManager } from '../constants/saveSystem/SaveSlotManager.js';
import type { PhysicsConfig } from '../constants/physics/types.js';

export interface GameEngineConfig {
  physics?: Partial<PhysicsConfig>;
  errorHandler?: {
    maxLogs?: number;
  };
  saveSystem?: {
    autoBackup?: boolean;
  };
}

/**
 * Create a complete game engine setup
 */
export async function initializeGameEngine(config: GameEngineConfig = {}): Promise<{
  physics: PhysicsEngine;
  collision: CollisionDetectionSystem;
  errorHandler: WebViewErrorHandler;
  saveManager: SaveSlotManager;
}> {
  // Initialize physics
  const physics = new PhysicsEngine(config.physics);

  // Initialize collision detection
  const collision = new CollisionDetectionSystem();

  // Initialize error handler
  const errorHandler = new WebViewErrorHandler(config.errorHandler?.maxLogs ?? 100);
  await errorHandler.initialize();

  // Initialize save system
  const saveManager = new SaveSlotManager(config.saveSystem?.autoBackup ?? true);
  await saveManager.initialize();

  console.info('[GameEngine] Fully initialized');

  return {
    physics,
    collision,
    errorHandler,
    saveManager
  };
}

/**
 * Create physics engine only
 */
export function createPhysicsEngine(
  config?: Partial<PhysicsConfig>
): PhysicsEngine {
  return new PhysicsEngine(config);
}

/**
 * Create collision detection system only
 */
export function createCollisionSystem(): CollisionDetectionSystem {
  return new CollisionDetectionSystem();
}

/**
 * Create error handler only
 */
export async function createErrorHandler(maxLogs?: number): Promise<WebViewErrorHandler> {
  const handler = new WebViewErrorHandler(maxLogs);
  await handler.initialize();
  return handler;
}

/**
 * Create save manager only
 */
export async function createSaveManager(autoBackup?: boolean): Promise<SaveSlotManager> {
  const manager = new SaveSlotManager(autoBackup);
  await manager.initialize();
  return manager;
}
