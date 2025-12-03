export enum ShapeType {
  VORTEX = '宇宙漩涡',
  KOCH = '科赫雪花',
  CARDIOID = '心形线',
  BUTTERFLY = '蝴蝶曲线',
  ARCHIMEDES = '阿基米德螺旋',
  CATENARY = '悬链曲面',
  LEMNISCATE = '伯努利双扭线',
  ROSE = '玫瑰曲线',
}

export interface ShapeConfig {
  type: ShapeType;
  color: string;
  cameraZ: number;
}