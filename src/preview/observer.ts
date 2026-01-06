import { Config } from './types';
import { parseConfig, waitForRender, debounce, isDarkMode } from './utils';
import { renderDiagram, getMermaidSource, rerenderAllDiagrams } from './mermaidRenderer';
import { initializePanZoom, cleanupPanZoom, hasPanZoom } from './panZoom';

let observer: MutationObserver | null = null;
let lastTheme: boolean = isDarkMode();

/**
 * Process a single mermaid container
 */
async function processContainer(container: HTMLElement, index: number): Promise<void> {
  // Skip if already has pan-zoom
  if (hasPanZoom(container)) {
    return;
  }

  // Mark as processing
  if (container.hasAttribute('data-processing')) {
    return;
  }
  container.setAttribute('data-processing', 'true');

  try {
    const config = parseConfig(container);
    const source = getMermaidSource(container);

    if (!source) {
      console.warn('No mermaid source found in container');
      return;
    }

    // Render the diagram
    const svg = await renderDiagram(container, source, config);

    if (svg) {
      // Wait for render to complete
      await waitForRender();

      // Initialize pan/zoom
      initializePanZoom(container, svg, config, index, source);
    }
  } finally {
    container.removeAttribute('data-processing');
  }
}

/**
 * Process all mermaid containers in the document
 */
const processAllContainers = debounce(async () => {
  const containers = document.querySelectorAll('.mermaid-zoom-container');

  // Process each container
  let index = 0;
  for (const container of containers) {
    await processContainer(container as HTMLElement, index);
    index++;
  }
}, 100);

/**
 * Handle theme changes
 */
function checkThemeChange(): void {
  const currentTheme = isDarkMode();

  if (currentTheme !== lastTheme) {
    lastTheme = currentTheme;

    // Get config from first container (or use defaults)
    const firstContainer = document.querySelector('.mermaid-zoom-container') as HTMLElement;
    const config = firstContainer ? parseConfig(firstContainer) : null;

    if (config) {
      // Cleanup all existing instances
      const containers = document.querySelectorAll('.mermaid-zoom-container');
      containers.forEach((container) => {
        cleanupPanZoom(container as HTMLElement);
      });

      // Re-render all diagrams with new theme
      rerenderAllDiagrams(config).then(() => {
        processAllContainers();
      });
    }
  }
}

/**
 * Initialize the DOM observer
 */
export function initObserver(): void {
  if (observer) {
    return; // Already initialized
  }

  // Initial processing
  processAllContainers();

  // Create mutation observer for new containers
  observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    for (const mutation of mutations) {
      // Check for added nodes
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.classList?.contains('mermaid-zoom-container') ||
                node.querySelector?.('.mermaid-zoom-container')) {
              shouldProcess = true;
              break;
            }
          }
        }
      }

      // Check for class changes (theme detection)
      if (mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          mutation.target === document.body) {
        checkThemeChange();
      }
    }

    if (shouldProcess) {
      processAllContainers();
    }
  });

  // Observe document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });

  // Listen for VS Code's content update event
  window.addEventListener('vscode.markdown.updateContent', () => {
    processAllContainers();
  });

  // Handle window resize
  window.addEventListener('resize', debounce(() => {
    const containers = document.querySelectorAll('.mermaid-zoom-container');
    containers.forEach((container) => {
      if (hasPanZoom(container as HTMLElement)) {
        // Instance will auto-resize
      }
    });
  }, 200));
}

/**
 * Cleanup observer and all instances
 */
export function destroyObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Cleanup all pan-zoom instances
  const containers = document.querySelectorAll('.mermaid-zoom-container');
  containers.forEach((container) => {
    cleanupPanZoom(container as HTMLElement);
  });
}
