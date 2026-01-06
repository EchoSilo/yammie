import mermaid from 'mermaid';
import { Config } from './types';
import { isDarkMode, generateDiagramId, waitForRender } from './utils';

let isInitialized = false;

/**
 * Initialize Mermaid with appropriate theme settings
 */
export function initializeMermaid(config: Config): void {
  const theme = isDarkMode() ? config.darkTheme : config.lightTheme;

  mermaid.initialize({
    startOnLoad: false,
    theme: theme as any,
    securityLevel: 'loose',
    fontFamily: 'var(--vscode-font-family, "Segoe UI", sans-serif)',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
    },
    sequence: {
      useMaxWidth: true,
    },
    gantt: {
      useMaxWidth: true,
    },
  });

  isInitialized = true;
}

/**
 * Render a single Mermaid diagram
 */
export async function renderDiagram(
  container: HTMLElement,
  source: string,
  config: Config
): Promise<SVGElement | null> {
  if (!isInitialized) {
    initializeMermaid(config);
  }

  const mermaidDiv = container.querySelector('.mermaid') as HTMLElement;
  if (!mermaidDiv) {
    console.warn('Mermaid container not found');
    return null;
  }

  // Check if already rendered (has SVG)
  const existingSvg = mermaidDiv.querySelector('svg');
  if (existingSvg) {
    return existingSvg;
  }

  try {
    const id = generateDiagramId();

    // Render the diagram
    const { svg } = await mermaid.render(id, source);

    // Insert the rendered SVG
    mermaidDiv.innerHTML = svg;

    // Wait for DOM to settle
    await waitForRender();

    // Return the SVG element
    return mermaidDiv.querySelector('svg');
  } catch (error) {
    console.error('Mermaid rendering error:', error);

    // Show error message in the container
    mermaidDiv.innerHTML = `
      <div class="mermaid-zoom-error">
        <strong>Mermaid Diagram Error</strong>
        <pre>${escapeHtml(String(error))}</pre>
      </div>
    `;
    return null;
  }
}

/**
 * Re-render all diagrams (e.g., on theme change)
 */
export async function rerenderAllDiagrams(config: Config): Promise<void> {
  // Re-initialize with new theme
  initializeMermaid(config);

  const containers = document.querySelectorAll('.mermaid-zoom-container');

  for (const container of containers) {
    const sourceEl = container.querySelector('.mermaid-source');
    const mermaidDiv = container.querySelector('.mermaid') as HTMLElement;

    if (sourceEl && mermaidDiv) {
      const source = sourceEl.textContent || '';

      // Clear existing SVG
      mermaidDiv.innerHTML = '';

      // Re-render
      await renderDiagram(container as HTMLElement, source, config);
    }
  }
}

/**
 * Get the mermaid source from a container
 */
export function getMermaidSource(container: HTMLElement): string {
  const sourceEl = container.querySelector('.mermaid-source');
  return sourceEl?.textContent || '';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
