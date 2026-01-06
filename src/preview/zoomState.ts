import { ZoomState, PanZoomInstance } from './types';
import { hashString } from './utils';

/**
 * Manages zoom/pan state persistence across re-renders
 */
class ZoomStateManager {
  private states: Map<string, ZoomState> = new Map();

  /**
   * Generate a stable key for a diagram based on its content
   */
  private getKey(mermaidSource: string, index: number): string {
    // Use first 500 chars of source to create hash
    const contentHash = hashString(mermaidSource.substring(0, 500));
    return `${contentHash}-${index}`;
  }

  /**
   * Save the current zoom/pan state for a diagram
   */
  save(mermaidSource: string, index: number, panZoomInstance: PanZoomInstance): void {
    const key = this.getKey(mermaidSource, index);
    const pan = panZoomInstance.getPan();
    const zoom = panZoomInstance.getZoom();

    this.states.set(key, { zoom, pan });
  }

  /**
   * Restore zoom/pan state for a diagram if it exists
   * Returns true if state was restored, false otherwise
   */
  restore(mermaidSource: string, index: number, panZoomInstance: PanZoomInstance): boolean {
    const key = this.getKey(mermaidSource, index);
    const state = this.states.get(key);

    if (state) {
      try {
        panZoomInstance.zoom(state.zoom);
        panZoomInstance.pan(state.pan);
        return true;
      } catch (e) {
        console.warn('Failed to restore zoom state:', e);
      }
    }
    return false;
  }

  /**
   * Check if state exists for a diagram
   */
  hasState(mermaidSource: string, index: number): boolean {
    const key = this.getKey(mermaidSource, index);
    return this.states.has(key);
  }

  /**
   * Clear all stored states
   */
  clear(): void {
    this.states.clear();
  }

  /**
   * Remove state for a specific diagram
   */
  remove(mermaidSource: string, index: number): void {
    const key = this.getKey(mermaidSource, index);
    this.states.delete(key);
  }
}

// Export singleton instance
export const zoomStateManager = new ZoomStateManager();
