import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Scan, AlertCircle } from 'lucide-react';

interface GestureHandlerProps {
  onZoomChange: (zoom: number) => void;
  isActive: boolean;
}

const GestureHandler: React.FC<GestureHandlerProps> = ({ onZoomChange, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Smoothing variables
  const lastZoomRef = useRef(1);

  useEffect(() => {
    if (!isActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predict);
        }
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
        setError("无法访问摄像头或加载模型");
      }
    };

    init();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, [isActive]);

  const predict = () => {
    if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;

    const startTimeMs = performance.now();
    const result = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
    const ctx = canvasRef.current.getContext('2d');
    
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw minimal HUD
      if (result.landmarks && result.landmarks.length > 0) {
        const landmarks = result.landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        // Calculate distance in normalized coordinates (approx)
        const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        
        // Draw points
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(thumbTip.x * w, thumbTip.y * h);
        ctx.lineTo(indexTip.x * w, indexTip.y * h);
        ctx.stroke();

        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(thumbTip.x * w, thumbTip.y * h, 4, 0, 2 * Math.PI);
        ctx.arc(indexTip.x * w, indexTip.y * h, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Map distance to zoom
        // Distance roughly 0.05 (closed) to 0.3 (open)
        // Map to 0.5x to 2.0x
        let targetZoom = 1;
        // Simple linear mapping
        // 0.05 -> 0.5 (Zoom out / Far)
        // 0.25 -> 2.0 (Zoom in / Close)
        const minD = 0.05;
        const maxD = 0.25;
        const clampedD = Math.max(minD, Math.min(maxD, distance));
        const t = (clampedD - minD) / (maxD - minD); // 0 to 1
        
        targetZoom = 0.5 + t * 2.0;

        // Smooth output
        lastZoomRef.current = lastZoomRef.current * 0.9 + targetZoom * 0.1;
        onZoomChange(lastZoomRef.current);
      }
    }

    rafRef.current = requestAnimationFrame(predict);
  };

  if (!isActive) return null;

  return (
    <div className="absolute bottom-6 left-6 z-50 rounded-lg overflow-hidden border border-white/20 bg-black/50 backdrop-blur-md shadow-2xl transition-all duration-500 animate-fade-in-up">
      {error ? (
        <div className="p-4 flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : (
        <div className="relative w-48 h-36 bg-black">
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 transform scale-x-[-1]" 
            autoPlay 
            playsInline
            muted
          />
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            width={320}
            height={240}
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 gap-2">
               <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
               <span className="text-[10px]">正在初始化视觉模型...</span>
            </div>
          )}
          {isLoaded && (
             <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-mono tracking-wider">AI VISION ACTIVE</span>
             </div>
          )}
          {isLoaded && (
             <div className="absolute bottom-2 left-0 w-full text-center">
               <span className="text-[10px] text-white/70 bg-black/40 px-2 py-1 rounded">捏合手指缩放</span>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GestureHandler;