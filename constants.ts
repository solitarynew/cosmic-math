import { ShapeType, ShapeConfig } from './types';

export const PARTICLE_COUNT = 30000;
export const TRANSITION_SPEED = 0.02; // Interpolation speed (0-1)
export const AUTO_SWITCH_INTERVAL = 8000; // ms

// Defines the order and visual properties of each mathematical shape
export const SHAPE_SEQUENCE: ShapeConfig[] = [
  { type: ShapeType.VORTEX, color: '#4f46e5', cameraZ: 35 },
  { type: ShapeType.KOCH, color: '#06b6d4', cameraZ: 40 },
  { type: ShapeType.CARDIOID, color: '#db2777', cameraZ: 25 },
  { type: ShapeType.BUTTERFLY, color: '#9333ea', cameraZ: 30 },
  { type: ShapeType.ARCHIMEDES, color: '#ea580c', cameraZ: 45 },
  { type: ShapeType.CATENARY, color: '#16a34a', cameraZ: 35 },
  { type: ShapeType.LEMNISCATE, color: '#facc15', cameraZ: 30 },
  { type: ShapeType.ROSE, color: '#dc2626', cameraZ: 25 },
];
