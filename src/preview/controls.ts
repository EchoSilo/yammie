import { Config, PanZoomInstance } from './types';

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
};

/**
 * Creates and manages control buttons for a diagram
 */
export function createControls(
  wrapper: HTMLElement,
  panZoomInstance: PanZoomInstance,
  config: Config
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

  controls.innerHTML = `
    <button class="mermaid-zoom-btn" data-action="zoom-in"
            aria-label="Zoom in" title="Zoom in">
      ${ICONS.zoomIn}
    </button>
    <button class="mermaid-zoom-btn" data-action="zoom-out"
            aria-label="Zoom out" title="Zoom out">
      ${ICONS.zoomOut}
    </button>
    <button class="mermaid-zoom-btn" data-action="reset"
            aria-label="Reset zoom" title="Fit to view">
      ${ICONS.reset}
    </button>
  `;

  // Event delegation for button clicks
  controls.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest('[data-action]');
    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    const action = button.getAttribute('data-action');
    switch (action) {
      case 'zoom-in':
        panZoomInstance.zoomIn();
        break;
      case 'zoom-out':
        panZoomInstance.zoomOut();
        break;
      case 'reset':
        panZoomInstance.resetZoom();
        panZoomInstance.resetPan();
        panZoomInstance.fit();
        panZoomInstance.center();
        break;
    }
  });

  return controls;
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
