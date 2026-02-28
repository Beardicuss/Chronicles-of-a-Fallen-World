/**
 * Game Canvas Component
 * Wrapper component for canvas rendering
 */

import React, { ReactElement, useEffect, useRef } from 'react';
import { PhysicsEngine } from '../constants/physics/PhysicsEngine.js';
import { renderBodiesToCanvas, createRenderingLoop } from '../utils/GameEngineIntegration.js';

interface GameCanvasProps {
  width: number;
  height: number;
  physics: PhysicsEngine;
  onRender?: (context: CanvasRenderingContext2D) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width,
  height,
  physics,
  onRender
}): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const stopRender = createRenderingLoop(canvas, physics, onRender);

    return () => {
      stopRender();
    };
  }, [physics, onRender]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: '1px solid #ccc',
        backgroundColor: '#000',
        display: 'block'
      }}
    />
  );
};
