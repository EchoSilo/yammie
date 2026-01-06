import svgPanZoom from 'svg-pan-zoom';
import { Config, PanZoomInstance } from './types';
import { updateZoomLevel } from './controls';

// Track active modal state
let activeModal: HTMLElement | null = null;
let modalPanZoom: PanZoomInstance | null = null;
let escapeHandler: ((e: KeyboardEvent) => void) | null = null;

// SVG icons for modal controls
const ICONS = {
  close: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>`,
  zoomIn: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>`,
  zoomOut: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>`,
  fitWidth: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z"/>
  </svg>`,
  reset: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/>
  </svg>`,
};

/**
 * Open fullscreen modal view for a diagram
 */
export function openFullscreen(svg: SVGElement, config: Config): void {
  // Close existing modal if open
  if (activeModal) {
    closeFullscreen();
  }

  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'mermaid-fullscreen-modal';
  modal.innerHTML = `
    <div class="mermaid-fullscreen-backdrop"></div>
    <div class="mermaid-fullscreen-content">
      <button class="mermaid-fullscreen-close" aria-label="Close fullscreen" title="Close (Esc)">
        ${ICONS.close}
      </button>
      <div class="mermaid-fullscreen-diagram"></div>
      <div class="mermaid-fullscreen-controls" role="toolbar" aria-label="Diagram controls">
        <span class="mermaid-zoom-level" aria-live="polite">100%</span>
        <button class="mermaid-zoom-btn" data-action="zoom-in" aria-label="Zoom in" title="Zoom in">
          ${ICONS.zoomIn}
        </button>
        <button class="mermaid-zoom-btn" data-action="zoom-out" aria-label="Zoom out" title="Zoom out">
          ${ICONS.zoomOut}
        </button>
        <button class="mermaid-zoom-btn" data-action="fit-width" aria-label="Fit to width" title="Fit to width">
          ${ICONS.fitWidth}
        </button>
        <button class="mermaid-zoom-btn" data-action="reset" aria-label="Reset view" title="Reset view">
          ${ICONS.reset}
        </button>
      </div>
    </div>
  `;

  // Clone SVG
  const diagramContainer = modal.querySelector('.mermaid-fullscreen-diagram') as HTMLElement;
  const svgClone = svg.cloneNode(true) as SVGElement;
  svgClone.style.width = '100%';
  svgClone.style.height = '100%';
  svgClone.style.maxWidth = 'none';
  diagramContainer.appendChild(svgClone);

  // Add to DOM
  document.body.appendChild(modal);
  activeModal = modal;

  // Initialize pan/zoom after DOM insertion
  requestAnimationFrame(() => {
    modalPanZoom = svgPanZoom(svgClone, {
      zoomEnabled: config.mouseWheelZoom,
      panEnabled: true,
      controlIconsEnabled: false,
      fit: true,
      center: true,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      zoomScaleSensitivity: config.zoomSensitivity,
      dblClickZoomEnabled: config.doubleClickZoom,
      mouseWheelZoomEnabled: config.mouseWheelZoom,
      onZoom: (scale: number) => {
        const content = modal.querySelector('.mermaid-fullscreen-content') as HTMLElement;
        if (content) {
          updateZoomLevel(content, scale);
        }
      },
    }) as PanZoomInstance;

    // Set initial zoom level
    const content = modal.querySelector('.mermaid-fullscreen-content') as HTMLElement;
    if (content && modalPanZoom) {
      updateZoomLevel(content, modalPanZoom.getZoom());
    }
  });

  // Event handlers
  const backdrop = modal.querySelector('.mermaid-fullscreen-backdrop') as HTMLElement;
  const closeBtn = modal.querySelector('.mermaid-fullscreen-close') as HTMLButtonElement;
  const controls = modal.querySelector('.mermaid-fullscreen-controls') as HTMLElement;

  backdrop.addEventListener('click', closeFullscreen);
  closeBtn.addEventListener('click', closeFullscreen);

  // Control button handlers
  controls.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest('[data-action]');
    if (!button || !modalPanZoom) return;

    e.preventDefault();
    e.stopPropagation();

    const action = button.getAttribute('data-action');
    const content = modal.querySelector('.mermaid-fullscreen-content') as HTMLElement;

    switch (action) {
      case 'zoom-in':
        modalPanZoom.zoomIn();
        updateZoomLevel(content, modalPanZoom.getZoom());
        break;
      case 'zoom-out':
        modalPanZoom.zoomOut();
        updateZoomLevel(content, modalPanZoom.getZoom());
        break;
      case 'fit-width':
        modalPanZoom.resetZoom();
        modalPanZoom.fit();
        modalPanZoom.center();
        updateZoomLevel(content, modalPanZoom.getZoom());
        break;
      case 'reset':
        modalPanZoom.resetZoom();
        modalPanZoom.resetPan();
        modalPanZoom.fit();
        modalPanZoom.center();
        updateZoomLevel(content, modalPanZoom.getZoom());
        break;
    }
  });

  // Escape key handler
  escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeFullscreen();
    }
  };
  document.addEventListener('keydown', escapeHandler);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Focus close button for accessibility
  closeBtn.focus();
}

/**
 * Close the fullscreen modal
 */
export function closeFullscreen(): void {
  if (modalPanZoom) {
    try {
      modalPanZoom.destroy();
    } catch (e) {
      // Ignore destroy errors
    }
    modalPanZoom = null;
  }

  if (activeModal) {
    activeModal.remove();
    activeModal = null;
  }

  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }

  document.body.style.overflow = '';
}

/**
 * Check if fullscreen modal is currently open
 */
export function isFullscreenOpen(): boolean {
  return activeModal !== null;
}
