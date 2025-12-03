import { ShapeType } from '../types';
import { PARTICLE_COUNT } from '../constants';

// Helper to normalize and spread points in 3D
const randomSpread = (scale: number) => (Math.random() - 0.5) * scale;

export const generateParticles = (type: ShapeType, count: number = PARTICLE_COUNT): Float32Array => {
  const positions = new Float32Array(count * 3);
  let idx = 0;

  const setPoint = (x: number, y: number, z: number) => {
    positions[idx * 3] = x;
    positions[idx * 3 + 1] = y;
    positions[idx * 3 + 2] = z;
    idx++;
  };

  switch (type) {
    case ShapeType.VORTEX: {
      for (let i = 0; i < count; i++) {
        const angle = i * 0.02;
        const radius = 5 + i * 0.0005;
        // Logarithmic spiral with chaos
        const x = Math.cos(angle) * radius + randomSpread(2);
        const y = Math.sin(angle) * radius + randomSpread(2);
        const z = (Math.random() - 0.5) * 15 * (1 - i / count); 
        setPoint(x, y, z);
      }
      break;
    }

    case ShapeType.ARCHIMEDES: {
      // r = a + b * theta
      const a = 0;
      const b = 0.2;
      for (let i = 0; i < count; i++) {
        const theta = i * 0.05;
        const r = a + b * theta;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const z = (i / count) * 20 - 10 + randomSpread(1); // Helix effect
        setPoint(x, y, z);
      }
      break;
    }

    case ShapeType.CARDIOID: {
      // 3D Heart Rotation
      for (let i = 0; i < count; i++) {
        const t = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI; 
        
        // 2D Cardioid Polar: r = 1 - sin(theta)
        // Let's use a parametric equation for a 3D heart-ish shape
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // z = variation
        
        // Distribute along the curve parameter
        const theta = (i / count) * Math.PI * 2;
        
        const x = 1.2 * (16 * Math.pow(Math.sin(theta), 3));
        const y = 1.2 * (13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta));
        // Add depth by layering multiple hearts or thickening
        const z = randomSpread(4); 
        
        setPoint(x, y, z);
      }
      break;
    }

    case ShapeType.BUTTERFLY: {
      // Parametric Butterfly
      for (let i = 0; i < count; i++) {
        const u = (i / count) * 24 * Math.PI; // Go around multiple times
        const r = Math.exp(Math.sin(u)) - 2 * Math.cos(4 * u) + Math.pow(Math.sin((2 * u - Math.PI) / 24), 5);
        
        const scale = 5;
        const x = scale * r * Math.cos(u);
        const y = scale * r * Math.sin(u);
        const z = r * Math.cos(u/2) * 2 + randomSpread(1); // 3D volume
        
        setPoint(x, y, z);
      }
      break;
    }

    case ShapeType.ROSE: {
      // r = cos(k * theta)
      const k = 4; 
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 10; // Multiple petals
        const r = 12 * Math.cos(k * theta);
        
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const z = Math.sin(theta * 5) * 3 + randomSpread(0.5);
        
        setPoint(x, y, z);
      }
      break;
    }

    case ShapeType.LEMNISCATE: {
      // Bernoulli's Lemniscate (Infinity)
      // x = (a cos t) / (1 + sin^2 t)
      // y = (a sin t cos t) / (1 + sin^2 t)
      const a = 15;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const denom = 1 + Math.sin(t) ** 2;
        const x = (a * Math.cos(t)) / denom;
        const y = (a * Math.sin(t) * Math.cos(t)) / denom;
        // Add a twist in Z to make it a Mobius strip feel or 3D ribbon
        const z = Math.sin(t * 2) * 4 + randomSpread(1);
        
        setPoint(x, y, z);
      }
      break;
    }

    case ShapeType.CATENARY: {
      // Catenary Surface (Catenoid-like)
      // Rotated catenary curve
      const c = 2; // parameter
      for (let i = 0; i < count; i++) {
        const u = ((i % 100) / 100) * Math.PI * 2; // Circle around Y
        const v = Math.floor(i / 100) / (count / 100) * 6 - 3; // Height
        
        const r = c * Math.cosh(v / c);
        const x = r * Math.cos(u);
        const z = r * Math.sin(u);
        const y = v * 4; // Stretch vertically
        
        setPoint(x, y, z);
      }
      break;
    }

    case ShapeType.KOCH: {
      // 3D Fractal approximation (Sierpinski/Koch hybrid for particles)
      // A true Koch is 1D line, let's map it to a tetrahedron fractal cloud
      
      const getTetrahedronPoint = (depth: number): [number, number, number] => {
         // Simple chaos game logic for tetrahedron
         let x = 0, y = 0, z = 0;
         const corners = [
           [10, 10, 10],
           [-10, -10, 10],
           [-10, 10, -10],
           [10, -10, -10]
         ];
         
         // Iterate to find a point
         for(let s=0; s<15; s++) { // 15 iterations per particle
             const corner = corners[Math.floor(Math.random() * 4)];
             x = (x + corner[0]) / 2;
             y = (y + corner[1]) / 2;
             z = (z + corner[2]) / 2;
         }
         return [x * 1.5, y * 1.5, z * 1.5];
      };

      for (let i = 0; i < count; i++) {
         const [tx, ty, tz] = getTetrahedronPoint(5);
         setPoint(tx, ty, tz);
      }
      break;
    }
    
    default: {
      // Sphere fallback
      for (let i = 0; i < count; i++) {
        setPoint(0,0,0);
      }
    }
  }

  return positions;
};
