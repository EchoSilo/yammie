import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  return {
    extendMarkdownIt(md: any) {
      // Get configuration
      const config = vscode.workspace.getConfiguration('mermaid-zoom');

      // Store original fence renderer
      const defaultFenceRenderer = md.renderer.rules.fence;

      // Custom fence renderer to handle mermaid blocks
      md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx];
        const info = token.info.trim().toLowerCase();

        // Check if this is a mermaid code block
        if (info === 'mermaid') {
          const content = token.content;

          // Create configuration data attributes
          const configData = {
            enabled: config.get('enabled', true),
            mouseWheelZoom: config.get('mouseWheelZoom', true),
            doubleClickZoom: config.get('doubleClickZoom', true),
            showControls: config.get('showControls', 'hover'),
            minZoom: config.get('minZoom', 0.1),
            maxZoom: config.get('maxZoom', 20),
            zoomSensitivity: config.get('zoomSensitivity', 0.3),
            lightTheme: config.get('lightTheme', 'default'),
            darkTheme: config.get('darkTheme', 'dark'),
          };

          // Return a container div that will be processed by preview script
          return `<div class="mermaid-zoom-container" data-config='${JSON.stringify(configData)}'>
            <pre class="mermaid-source" style="display:none">${escapeHtml(content)}</pre>
            <div class="mermaid">${escapeHtml(content)}</div>
          </div>`;
        }

        // Fall back to default renderer for non-mermaid code blocks
        if (defaultFenceRenderer) {
          return defaultFenceRenderer(tokens, idx, options, env, self);
        }

        // Fallback if no default renderer
        return `<pre><code>${escapeHtml(token.content)}</code></pre>`;
      };

      return md;
    }
  };
}

export function deactivate() {
  // Cleanup if needed
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
