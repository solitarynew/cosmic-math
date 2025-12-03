import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateParticles } from '../utils/math';
import { ShapeType } from '../types';
import { PARTICLE_COUNT, TRANSITION_SPEED } from '../constants';

// Fix for TypeScript not recognizing R3F intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      pointsMaterial: any;
    }
  }
}

interface ParticlesProps {
  shape: ShapeType;
  color: string;
}

const Particles: React.FC<ParticlesProps> = ({ shape, color }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  // Buffers for interpolation
  const currentPositions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const targetPositions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  
  // Colors buffer
  const colors = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const colorObj = new THREE.Color();

  // Initialize buffers
  useEffect(() => {
    // Generate initial positions (Vortex)
    const initial = generateParticles(ShapeType.VORTEX);
    currentPositions.current.set(initial);
    targetPositions.current.set(initial);

    // Initial fill for geometry
    if (geometryRef.current) {
        geometryRef.current.setAttribute('position', new THREE.BufferAttribute(currentPositions.current, 3));
    }
  }, []);

  // When shape changes, update target
  useEffect(() => {
    const newPositions = generateParticles(shape);
    targetPositions.current.set(newPositions);
  }, [shape]);

  // When color changes, update color buffer
  useEffect(() => {
    colorObj.set(color);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Add slight variation to color for depth
      const variation = Math.random() * 0.2;
      colors[i * 3] = Math.max(0, colorObj.r - variation);
      colors[i * 3 + 1] = Math.max(0, colorObj.g - variation);
      colors[i * 3 + 2] = Math.max(0, colorObj.b - variation);
    }
    if (geometryRef.current) {
      geometryRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometryRef.current.attributes.color.needsUpdate = true;
    }
  }, [color]);

  useFrame((state) => {
    if (!pointsRef.current || !geometryRef.current) return;

    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const target = targetPositions.current;
    
    // Interpolation (Lerp)
    let moved = false;
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      const dist = target[i] - positions[i];
      if (Math.abs(dist) > 0.001) {
        positions[i] += dist * TRANSITION_SPEED;
        moved = true;
      }
    }

    // Continuous rotation
    pointsRef.current.rotation.y += 0.001;
    pointsRef.current.rotation.z += 0.0005;

    // Optional: Mouse interaction influence (Subtle parralax)
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;

    if (moved) {
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  // Texture for glowy particle
  const texture = useMemo(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const context = canvas.getContext('2d');
      if(context) {
          const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
          gradient.addColorStop(0, 'rgba(255,255,255,1)');
          gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)');
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          context.fillStyle = gradient;
          context.fillRect(0, 0, 32, 32);
      }
      const tex = new THREE.CanvasTexture(canvas);
      return tex;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions.current}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        map={texture}
        transparent
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default Particles;