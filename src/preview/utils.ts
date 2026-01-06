import { Config, DEFAULT_CONFIG } from './types';

/**
 * Generate a simple hash from a string for diagram identification
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * Wait for next animation frame (double RAF for stability)
 */
export function waitForRender(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * Detect if VS Code is in dark mode
 */
export function isDarkMode(): boolean {
  return document.body.classList.contains('vscode-dark') ||
         document.body.classList.contains('vscode-high-contrast');
}

/**
 * Parse configuration from container data attribute
 */
export function parseConfig(container: HTMLElement): Config {
  try {
    const configStr = container.getAttribute('data-config');
    if (configStr) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(configStr) };
    }
  } catch (e) {
    console.warn('Failed to parse mermaid-zoom config:', e);
  }
  return DEFAULT_CONFIG;
}

/**
 * Generate unique ID for a diagram
 */
export function generateDiagramId(): string {
  return 'mermaid-' + Math.random().toString(36).substring(2, 11);
}
