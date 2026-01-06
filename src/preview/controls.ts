import { Config, PanZoomInstance, ExportFormat } from './types';

// SVG icons for controls (inline for CSP compliance)
const ICONS = {
  zoomIn: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>`,
  zoomOut: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>`,
  reset: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/>
  </svg>`,
  fitWidth: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z"/>
  </svg>`,
  fullscreen: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
  </svg>`,
  export: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>`,
};

// Callbacks for fullscreen and export (set by external modules)
let fullscreenCallback: ((svg: SVGElement, config: Config) => void) | null = null;
let exportCallback: ((svg: SVGElement, format: ExportFormat, config: Config) => void) | null = null;

export function setFullscreenCallback(cb: (svg: SVGElement, config: Config) => void): void {
  fullscreenCallback = cb;
}

export function setExportCallback(cb: (svg: SVGElement, format: ExportFormat, config: Config) => void): void {
  exportCallback = cb;
}

/**
 * Creates and manages control buttons for a diagram
 */
export function createControls(
  wrapper: HTMLElement,
  panZoomInstance: PanZoomInstance,
  config: Config,
  svg: SVGElement
): HTMLElement {
  const controls = document.createElement('div');
  controls.className = 'mermaid-zoom-controls';
  controls.setAttribute('role', 'toolbar');
  controls.setAttribute('aria-label', 'Diagram zoom controls');

  // Set visibility class based on config
  if (config.showControls === 'hover') {
    wrapper.classList.add('mermaid-zoom-hover-controls');
  } else if (config.showControls === 'never') {
    controls.style.display = 'none';
  }

  // Build controls HTML
  const zoomLevelHtml = config.showZoomLevel
    ? `<span class="mermaid-zoom-level" aria-live="polite">100%</span>`
    : '';

  const fullscreenBtnHtml = config.showFullscreenButton
    ? `<button class="mermaid-zoom-btn" data-action="fullscreen"
              aria-label="Fullscreen" title="Fullscreen">
        ${ICONS.fullscreen}
      </button>`
    : '';

  const exportBtnHtml = config.showExportButton
    ? `<div class="mermaid-export-dropdown">
        <button class="mermaid-zoom-btn" data-action="export-toggle"
                aria-label="Export diagram" title="Export diagram"
                aria-haspopup="true" aria-expanded="false">
          ${ICONS.export}
        </button>
        <div class="mermaid-export-menu" role="menu">
          <button class="mermaid-export-option" data-action="export" data-format="png" role="menuitem">PNG</button>
          <button class="mermaid-export-option" data-action="export" data-format="jpg" role="menuitem">JPG</button>
          <button class="mermaid-export-option" data-action="export" data-format="html" role="menuitem">HTML</button>
        </div>
      </div>`
    : '';

  controls.innerHTML = `
    ${zoomLevelHtml}
    <button class="mermaid-zoom-btn" data-action="zoom-in"
            aria-label="Zoom in" title="Zoom in">
      ${ICONS.zoomIn}
    </button>
    <button class="mermaid-zoom-btn" data-action="zoom-out"
            aria-label="Zoom out" title="Zoom out">
      ${ICONS.zoomOut}
    </button>
    <button class="mermaid-zoom-btn" data-action="fit-width"
            aria-label="Fit to width" title="Fit to width">
      ${ICONS.fitWidth}
    </button>
    <button class="mermaid-zoom-btn" data-action="reset"
            aria-label="Reset zoom" title="Fit to view">
      ${ICONS.reset}
    </button>
    ${fullscreenBtnHtml}
    ${exportBtnHtml}
  `;

  // Event delegation for button clicks
  controls.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('[data-action]');
    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    const action = button.getAttribute('data-action');
    switch (action) {
      case 'zoom-in':
        panZoomInstance.zoomIn();
        updateZoomLevel(wrapper, panZoomInstance.getZoom());
        break;
      case 'zoom-out':
        panZoomInstance.zoomOut();
        updateZoomLevel(wrapper, panZoomInstance.getZoom());
        break;
      case 'fit-width':
        panZoomInstance.resetZoom();
        panZoomInstance.fit();
        panZoomInstance.center();
        updateZoomLevel(wrapper, panZoomInstance.getZoom());
        break;
      case 'reset':
        panZoomInstance.resetZoom();
        panZoomInstance.resetPan();
        panZoomInstance.fit();
        panZoomInstance.center();
        updateZoomLevel(wrapper, panZoomInstance.getZoom());
        break;
      case 'fullscreen':
        if (fullscreenCallback) {
          fullscreenCallback(svg, config);
        }
        break;
      case 'export-toggle':
        toggleExportMenu(controls);
        break;
      case 'export':
        const format = button.getAttribute('data-format') as ExportFormat;
        if (exportCallback && format) {
          exportCallback(svg, format, config);
        }
        closeExportMenu(controls);
        break;
    }
  });

  // Close export menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!controls.contains(e.target as Node)) {
      closeExportMenu(controls);
    }
  });

  return controls;
}

/**
 * Update the zoom level indicator
 */
export function updateZoomLevel(wrapper: HTMLElement, zoomLevel: number): void {
  const indicator = wrapper.querySelector('.mermaid-zoom-level');
  if (indicator) {
    const percentage = Math.round(zoomLevel * 100);
    indicator.textContent = `${percentage}%`;
  }
}

/**
 * Toggle export dropdown menu
 */
function toggleExportMenu(controls: HTMLElement): void {
  const menu = controls.querySelector('.mermaid-export-menu');
  const btn = controls.querySelector('[data-action="export-toggle"]');
  if (menu && btn) {
    const isOpen = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  }
}

/**
 * Close export dropdown menu
 */
function closeExportMenu(controls: HTMLElement): void {
  const menu = controls.querySelector('.mermaid-export-menu');
  const btn = controls.querySelector('[data-action="export-toggle"]');
  if (menu && btn) {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Update controls visibility based on config
 */
export function updateControlsVisibility(
  wrapper: HTMLElement,
  config: Config
): void {
  const controls = wrapper.querySelector('.mermaid-zoom-controls') as HTMLElement;
  if (!controls) return;

  wrapper.classList.remove('mermaid-zoom-hover-controls');

  switch (config.showControls) {
    case 'hover':
      wrapper.classList.add('mermaid-zoom-hover-controls');
      controls.style.display = '';
      break;
    case 'always':
      controls.style.display = '';
      break;
    case 'never':
      controls.style.display = 'none';
      break;
  }
}
