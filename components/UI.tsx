import React from 'react';
import { ShapeType, ShapeConfig } from '../types';
import { SHAPE_SEQUENCE } from '../constants';
import { Play, Pause, Layers, Camera, CameraOff } from 'lucide-react';

interface UIProps {
  currentShape: ShapeType;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectShape: (shape: ShapeConfig) => void;
  gestureActive: boolean;
  onToggleGesture: () => void;
}

const UI: React.FC<UIProps> = ({ 
  currentShape, 
  isPlaying, 
  onTogglePlay, 
  onSelectShape,
  gestureActive,
  onToggleGesture
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 text-white font-sans select-none">
      {/* Header */}
      <div className="flex justify-between items-start animate-fade-in-down">
        <div>
          <h1 className="text-4xl font-light tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 filter drop-shadow-lg font-bold">
            宇宙 <span className="font-light text-white">数学</span>
          </h1>
          <p className="text-white/60 text-sm mt-1 max-w-md leading-relaxed">
            30,000 颗微粒实时渲染，完美诠释科赫曲线、心形线与混沌之美。
          </p>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
             <button 
               onClick={onToggleGesture}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all text-xs font-mono
                 ${gestureActive 
                   ? 'bg-blue-500/20 border-blue-400/50 text-blue-200' 
                   : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/20'}
               `}
               title="开启/关闭手势识别"
             >
               {gestureActive ? <Camera size={14} /> : <CameraOff size={14} />}
               <span className="hidden sm:inline">{gestureActive ? '手势控制中' : '手势控制'}</span>
             </button>

             <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono">
               {currentShape}
             </div>
             <button 
                onClick={onTogglePlay}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/10"
             >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
             </button>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col gap-4 pointer-events-auto max-w-2xl">
        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest mb-2">
            <Layers size={12} />
            <span>选择几何模型</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {SHAPE_SEQUENCE.map((item) => (
            <button
              key={item.type}
              onClick={() => onSelectShape(item)}
              className={`
                px-4 py-2 rounded-lg text-sm transition-all duration-300
                backdrop-blur-md border 
                ${currentShape === item.type 
                  ? 'bg-white/20 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                  : 'bg-black/30 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
              `}
            >
              {item.type}
            </button>
          ))}
        </div>
      </div>
      
      {/* HUD Info */}
      <div className="absolute bottom-6 right-6 text-right pointer-events-none opacity-50 hidden md:block">
        <div className="text-xs font-mono">粒子数: 30,000</div>
        <div className="text-xs font-mono">渲染引擎: WEBGL2</div>
        <div className="text-xs font-mono">帧率: 60 FPS</div>
      </div>
    </div>
  );
};

export default UI;