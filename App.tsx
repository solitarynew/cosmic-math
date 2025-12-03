import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

import Particles from './components/Particles';
import UI from './components/UI';
import GestureHandler from './components/GestureHandler';
import { SHAPE_SEQUENCE, AUTO_SWITCH_INTERVAL } from './constants';
import { ShapeConfig, ShapeType } from './types';

// Fix for TypeScript not recognizing R3F intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
    }
  }
}

// Camera controller with smooth zoom and gesture support
const CameraController: React.FC<{ targetZ: number, zoomFactor: number }> = ({ targetZ, zoomFactor }) => {
  useFrame((state) => {
    // Apply zoom factor inversely to Z position (Zoom x2 means half distance)
    const finalTargetZ = targetZ / zoomFactor;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, finalTargetZ, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [manualOverride, setManualOverride] = useState(false);
  const [gestureActive, setGestureActive] = useState(false);
  const [gestureZoom, setGestureZoom] = useState(1);

  const currentConfig = SHAPE_SEQUENCE[currentIndex];

  // Auto-switch timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying && !manualOverride) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % SHAPE_SEQUENCE.length);
      }, AUTO_SWITCH_INTERVAL);
    }

    return () => clearInterval(interval);
  }, [isPlaying, manualOverride]);

  const handleShapeSelect = (config: ShapeConfig) => {
    const index = SHAPE_SEQUENCE.findIndex(s => s.type === config.type);
    if (index !== -1) {
      setCurrentIndex(index);
      setManualOverride(true);
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setManualOverride(false);
    }
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <UI 
        currentShape={currentConfig.type}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onSelectShape={handleShapeSelect}
        gestureActive={gestureActive}
        onToggleGesture={() => setGestureActive(!gestureActive)}
      />
      
      <GestureHandler 
        isActive={gestureActive}
        onZoomChange={setGestureZoom}
        onRotateChange={(x, y) => { /* Placeholder for rotation logic */ }}
      />
      
      <Canvas
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 2]} // Support high DPI screens
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      >
        <color attach="background" args={['#000000']} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 40]} fov={60} />
        <CameraController targetZ={currentConfig.cameraZ} zoomFactor={gestureZoom} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={!gestureActive} // Disable scroll zoom if gesture is active to avoid conflict
          autoRotate={isPlaying && !manualOverride} 
          autoRotateSpeed={0.5}
          maxDistance={100}
          minDistance={5}
        />

        <Suspense fallback={null}>
          <Particles 
            shape={currentConfig.type} 
            color={currentConfig.color} 
          />
        </Suspense>

        <EffectComposer enableNormalPass={false}>
           {/* Glow Effect */}
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
          />
          {/* Cinematic Vignette */}
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default App;