/**
 * Mermaid Zoom Preview - Preview Script Entry Point
 *
 * This script runs in the VS Code markdown preview context.
 * It handles:
 * - Mermaid diagram rendering
 * - Pan/zoom functionality via svg-pan-zoom
 * - State persistence across re-renders
 * - Theme change detection
 * - Export and fullscreen features
 */

import { initObserver, destroyObserver } from './observer';
import { setFullscreenCallback, setExportCallback } from './controls';
import { openFullscreen } from './fullscreen';
import { exportDiagram } from './export';

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init(): void {
  console.log('Mermaid Zoom Preview: Initializing...');

  try {
    // Set up callbacks for fullscreen and export
    setFullscreenCallback(openFullscreen);
    setExportCallback(exportDiagram);

    initObserver();
    console.log('Mermaid Zoom Preview: Initialized successfully');
  } catch (error) {
    console.error('Mermaid Zoom Preview: Initialization failed:', error);
  }
}

// Cleanup on page unload (if applicable)
window.addEventListener('unload', () => {
  destroyObserver();
});

// Export for potential external access
export { initObserver, destroyObserver };
