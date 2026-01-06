import svgPanZoom from 'svg-pan-zoom';
import { Config, PanZoomInstance } from './types';
import { zoomStateManager } from './zoomState';
import { createControls } from './controls';
import { debounce } from './utils';

// Track pan-zoom instances by container element
const instances = new WeakMap<HTMLElement, PanZoomInstance>();

// Track original mermaid source for state management
const sources = new WeakMap<HTMLElement, string>();

/**
 * Initialize pan/zoom on a rendered Mermaid SVG
 */
export function initializePanZoom(
  container: HTMLElement,
  svg: SVGElement,
  config: Config,
  index: number,
  mermaidSource: string
): PanZoomInstance | null {
  // Skip if disabled
  if (!config.enabled) {
    return null;
  }

  // Check if already initialized
  if (instances.has(container)) {
    return instances.get(container) || null;
  }

  // Store the source for state management
  sources.set(container, mermaidSource);

  // Remove Mermaid's restrictive inline styles
  svg.style.maxWidth = 'none';
  svg.removeAttribute('height');
  svg.style.width = '100%';
  svg.style.height = 'auto';

  // Create wrapper for proper overflow handling
  const wrapper = createWrapper(container, svg);

  // Initialize svg-pan-zoom
  const instance = svgPanZoom(svg, {
    zoomEnabled: config.mouseWheelZoom,
    panEnabled: true,
    controlIconsEnabled: false, // We provide our own
    fit: true,
    center: true,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom,
    zoomScaleSensitivity: config.zoomSensitivity,
    dblClickZoomEnabled: config.doubleClickZoom,
    mouseWheelZoomEnabled: config.mouseWheelZoom,
    preventMouseEventsDefault: true,

    // Save state on zoom/pan (debounced)
    onZoom: debounce(() => {
      zoomStateManager.save(mermaidSource, index, instance);
    }, 100),
    onPan: debounce(() => {
      zoomStateManager.save(mermaidSource, index, instance);
    }, 100),
  }) as PanZoomInstance;

  // Store instance
  instances.set(container, instance);

  // Try to restore previous state
  const hasState = zoomStateManager.restore(mermaidSource, index, instance);

  // If no previous state, fit and center
  if (!hasState) {
    instance.fit();
    instance.center();
  }

  // Add controls
  const controls = createControls(wrapper, instance, config);
  wrapper.appendChild(controls);

  return instance;
}

/**
 * Create a wrapper div around the SVG for proper layout
 */
function createWrapper(container: HTMLElement, svg: SVGElement): HTMLElement {
  // Check if wrapper already exists
  let wrapper = container.querySelector('.mermaid-zoom-wrapper') as HTMLElement;
  if (wrapper) {
    return wrapper;
  }

  wrapper = document.createElement('div');
  wrapper.className = 'mermaid-zoom-wrapper';

  // Find the mermaid div and wrap its contents
  const mermaidDiv = container.querySelector('.mermaid');
  if (mermaidDiv && svg.parentNode === mermaidDiv) {
    mermaidDiv.insertBefore(wrapper, svg);
    wrapper.appendChild(svg);
  }

  return wrapper;
}

/**
 * Cleanup pan/zoom instance for a container
 */
export function cleanupPanZoom(container: HTMLElement): void {
  const instance = instances.get(container);
  if (instance) {
    try {
      // Save state before destroying
      const source = sources.get(container);
      if (source) {
        const index = getContainerIndex(container);
        zoomStateManager.save(source, index, instance);
      }
      instance.destroy();
    } catch (e) {
      console.warn('Failed to destroy pan-zoom instance:', e);
    }
    instances.delete(container);
    sources.delete(container);
  }
}

/**
 * Get the index of a container among all mermaid containers
 */
function getContainerIndex(container: HTMLElement): number {
  const containers = document.querySelectorAll('.mermaid-zoom-container');
  return Array.from(containers).indexOf(container);
}

/**
 * Check if a container has an active pan/zoom instance
 */
export function hasPanZoom(container: HTMLElement): boolean {
  return instances.has(container);
}

/**
 * Get the pan/zoom instance for a container
 */
export function getPanZoom(container: HTMLElement): PanZoomInstance | undefined {
  return instances.get(container);
}

/**
 * Resize all pan/zoom instances (call on window resize)
 */
export function resizeAll(): void {
  const containers = document.querySelectorAll('.mermaid-zoom-container');
  containers.forEach((container) => {
    const instance = instances.get(container as HTMLElement);
    if (instance) {
      instance.resize();
      instance.fit();
      instance.center();
    }
  });
}
