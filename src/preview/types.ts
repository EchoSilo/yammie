export interface Config {
  enabled: boolean;
  mouseWheelZoom: boolean;
  doubleClickZoom: boolean;
  showControls: 'always' | 'hover' | 'never';
  minZoom: number;
  maxZoom: number;
  zoomSensitivity: number;
  lightTheme: string;
  darkTheme: string;
  showZoomLevel: boolean;
  showFullscreenButton: boolean;
  showExportButton: boolean;
  exportScale: number;
}

export type ExportFormat = 'png' | 'jpg' | 'html';

export interface ZoomState {
  zoom: number;
  pan: { x: number; y: number };
}

export interface PanZoomInstance {
  zoom(scale: number): void;
  zoomIn(): void;
  zoomOut(): void;
  pan(point: { x: number; y: number }): void;
  getPan(): { x: number; y: number };
  getZoom(): number;
  resetZoom(): void;
  resetPan(): void;
  fit(): void;
  center(): void;
  destroy(): void;
  resize(): void;
  enablePan(): void;
  disablePan(): void;
  isPanEnabled(): boolean;
  enableZoom(): void;
  disableZoom(): void;
  isZoomEnabled(): boolean;
}

export const DEFAULT_CONFIG: Config = {
  enabled: true,
  mouseWheelZoom: true,
  doubleClickZoom: true,
  showControls: 'hover',
  minZoom: 0.1,
  maxZoom: 20,
  zoomSensitivity: 0.3,
  lightTheme: 'default',
  darkTheme: 'dark',
  showZoomLevel: true,
  showFullscreenButton: true,
  showExportButton: true,
  exportScale: 2,
};
