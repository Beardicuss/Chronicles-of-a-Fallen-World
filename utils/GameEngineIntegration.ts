/**
 * Game Engine Integration Utilities
 * Canvas and rendering integration helpers
 */

import { PhysicsEngine } from '../constants/physics/PhysicsEngine.js';
import { CollisionDetectionSystem } from '../constants/physics/CollisionDetectionSystem.js';
import type { RigidBody } from '../constants/physics/types.js';

/**
 * Render bodies on canvas
 */
export function renderBodiesToCanvas(
  context: CanvasRenderingContext2D,
  physics: PhysicsEngine,
  options: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    showIds?: boolean;
  } = {}
): void {
  const {
    fillColor = 'rgba(100, 100, 200, 0.5)',
    strokeColor = '#0066ff',
    strokeWidth = 2,
    showIds = false
  } = options;

  const bodies = physics.getAllBodies();

  for (const body of bodies) {
    const x = body.position.x;
    const y = body.position.y;
    const w = body.config.width;
    const h = body.config.height;

    // Draw rectangle
    context.fillStyle = fillColor;
    context.fillRect(x - w / 2, y - h / 2, w, h);

    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWidth;
    context.strokeRect(x - w / 2, y - h / 2, w, h);

    // Draw ID if enabled
    if (showIds) {
      context.fillStyle = '#fff';
      context.font = '12px monospace';
      context.fillText(body.id, x - w / 2 + 5, y - h / 2 + 15);
    }

    // Draw velocity vector
    if (Math.abs(body.velocity.x) > 0.1 || Math.abs(body.velocity.y) > 0.1) {
      context.strokeStyle = '#ff6b6b';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + body.velocity.x * 5, y + body.velocity.y * 5);
      context.stroke();
    }
  }
}

/**
 * Create a canvas rendering loop
 */
export function createRenderingLoop(
  canvas: HTMLCanvasElement,
  physics: PhysicsEngine,
  onRender?: (context: CanvasRenderingContext2D) => void
): () => void {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  let animationFrameId: number | null = null;
  let lastTime = Date.now();

  const render = (): void => {
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    // Step physics
    physics.step(deltaTime);

    // Clear canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Render bodies
    renderBodiesToCanvas(context, physics);

    // Custom render callback
    if (onRender) {
      onRender(context);
    }

    animationFrameId = requestAnimationFrame(render);
  };

  // Start rendering
  animationFrameId = requestAnimationFrame(render);

  // Return stop function
  return () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };
}

/**
 * Setup mouse interaction
 */
export function setupMouseInteraction(
  canvas: HTMLCanvasElement,
  physics: PhysicsEngine
): {
  getMousePosition: () => { x: number; y: number };
  onMouseDown: (callback: (x: number, y: number) => void) => void;
  onMouseMove: (callback: (x: number, y: number) => void) => void;
  onMouseUp: (callback: (x: number, y: number) => void) => void;
} {
  const rect = canvas.getBoundingClientRect();

  let mouseX = 0;
  let mouseY = 0;

  const downCallbacks: Array<(x: number, y: number) => void> = [];
  const moveCallbacks: Array<(x: number, y: number) => void> = [];
  const upCallbacks: Array<(x: number, y: number) => void> = [];

  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    downCallbacks.forEach(cb => cb(mouseX, mouseY));
  });

  canvas.addEventListener('mousemove', (event: MouseEvent) => {
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    moveCallbacks.forEach(cb => cb(mouseX, mouseY));
  });

  canvas.addEventListener('mouseup', (event: MouseEvent) => {
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    upCallbacks.forEach(cb => cb(mouseX, mouseY));
  });

  return {
    getMousePosition: () => ({ x: mouseX, y: mouseY }),
    onMouseDown: (callback) => downCallbacks.push(callback),
    onMouseMove: (callback) => moveCallbacks.push(callback),
    onMouseUp: (callback) => upCallbacks.push(callback)
  };
}

/**
 * Get body at point using spatial query
 */
export function getBodyAtPoint(
  x: number,
  y: number,
  collision: CollisionDetectionSystem
): string | null {
  const bodies = collision.queryPoint({ x, y });
  return bodies.length > 0 ? bodies[0] : null;
}

/**
 * Get bodies in radius using spatial query
 */
export function getBodyiesInRadius(
  x: number,
  y: number,
  radius: number,
  collision: CollisionDetectionSystem
): string[] {
  return collision.queryRadius({ x, y }, radius);
}
