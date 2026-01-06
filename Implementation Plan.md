# VS Code Mermaid Preview with Zoom/Pan - Implementation Plan

## Overview
Build a complete VS Code extension that renders Mermaid diagrams in markdown preview with zoom and pan capabilities. This is an all-in-one solution (not a companion to existing extensions).

## Technology Stack
- **Mermaid.js**: Latest version for diagram rendering
- **svg-pan-zoom**: Zero-dependency library for zoom/pan (proven with Mermaid)
- **esbuild**: Fast TypeScript bundling
- **TypeScript 5.4+**: Strict mode

## File Structure
```
markdon-mermaid-vscode/
├── .vscode/
│   ├── launch.json
│   └── tasks.json
├── src/
│   ├── extension.ts              # Extension entry (config injection)
│   └── preview/
│       ├── index.ts              # Preview script entry
│       ├── mermaidRenderer.ts    # Mermaid initialization & rendering
│       ├── panZoom.ts            # svg-pan-zoom wrapper
│       ├── observer.ts           # DOM observation for diagrams
│       ├── zoomState.ts          # State persistence across re-renders
│       ├── controls.ts           # UI control buttons
│       ├── utils.ts              # Helper functions
│       └── styles.css            # Control styling
├── dist/                         # Build output
│   ├── extension.js
│   ├── preview.js
│   └── preview.css
├── test-workspace/               # Test markdown files
├── package.json
├── tsconfig.json
├── esbuild.mjs
└── README.md
```

## Implementation Steps

### Step 1: Project Setup
1. Initialize npm project with `npm init`
2. Install dependencies:
   - `mermaid` (diagram rendering)
   - `svg-pan-zoom` (zoom/pan)
   - `@types/node`, `typescript`, `esbuild` (dev)
   - `@types/vscode` (dev)
3. Create `tsconfig.json` with strict mode, ES2022 target
4. Create `esbuild.mjs` build script (two bundles: extension + preview)
5. Create `.vscode/launch.json` for Extension Host debugging

### Step 2: Package.json Manifest
Define VS Code extension contribution points:
```json
{
  "contributes": {
    "markdown.markdownItPlugins": true,
    "markdown.previewScripts": ["./dist/preview.js"],
    "markdown.previewStyles": ["./dist/preview.css"],
    "configuration": {
      "properties": {
        "mermaid-zoom.enabled": { "type": "boolean", "default": true },
        "mermaid-zoom.mouseWheelZoom": { "type": "boolean", "default": true },
        "mermaid-zoom.showControls": { "enum": ["always", "hover", "never"], "default": "hover" },
        "mermaid-zoom.minZoom": { "type": "number", "default": 0.1 },
        "mermaid-zoom.maxZoom": { "type": "number", "default": 20 }
      }
    }
  }
}
```

### Step 3: Extension Host (`src/extension.ts`)
- Minimal activation on `onLanguage:markdown`
- Return `extendMarkdownIt()` function that:
  - Adds markdown-it plugin to identify mermaid code blocks
  - Injects configuration as hidden DOM element for preview script to read

### Step 4: Mermaid Renderer (`src/preview/mermaidRenderer.ts`)
- Initialize Mermaid with configuration
- Handle theme detection (light/dark via `document.body.classList`)
- Render mermaid code blocks to SVG
- Key: Must work with VS Code's incremental DOM updates

### Step 5: DOM Observer (`src/preview/observer.ts`)
- Use `MutationObserver` to detect new mermaid code blocks
- Listen for `vscode.markdown.updateContent` event
- Use double `requestAnimationFrame` for timing (wait for render)
- Debounce rapid changes (100ms)

### Step 6: Pan/Zoom Manager (`src/preview/panZoom.ts`)
- Wrap SVG in container div for overflow handling
- Initialize svg-pan-zoom with options:
  ```js
  svgPanZoom(svg, {
    zoomEnabled: true,
    panEnabled: true,
    controlIconsEnabled: false,  // We provide custom controls
    fit: true,
    center: true,
    minZoom: 0.1,
    maxZoom: 20,
    zoomScaleSensitivity: 0.3
  })
  ```
- Remove Mermaid's inline `max-width` style
- Track instances with WeakMap for cleanup

### Step 7: Zoom State Manager (`src/preview/zoomState.ts`)
- Generate content hash key from SVG (first 500 chars)
- Store zoom level and pan position per diagram
- Restore state after re-renders
- Save state on zoom/pan events (debounced)

### Step 8: UI Controls (`src/preview/controls.ts`)
- Create control buttons: [+] [-] [Reset]
- Position: top-right corner (configurable)
- Show on hover (default), fade in/out
- Use VS Code CSS variables for theming
- Inline SVG icons (no external resources - CSP compliance)

### Step 9: Styles (`src/preview/styles.css`)
- Wrapper: `position: relative; overflow: hidden; border-radius: 4px`
- Controls: absolute positioned, flex layout
- Use `--vscode-*` CSS variables throughout
- Hover fade animation for controls
- Focus states for accessibility

### Step 10: Preview Entry (`src/preview/index.ts`)
- Read configuration from hidden DOM element
- Initialize observer
- Coordinate Mermaid rendering → pan/zoom initialization
- Handle cleanup on content updates

## Key Technical Solutions

### Timing Issue (Mermaid async rendering)
```typescript
// Wait for SVG with double RAF
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const svg = container.querySelector('svg');
    if (svg) initPanZoom(svg);
  });
});
```

### State Preservation
```typescript
// Hash-based key for diagram identification
const key = hashString(svg.outerHTML.substring(0, 500));
stateMap.set(key, { zoom, pan });
```

### CSP Compliance
- Bundle everything into single `preview.js`
- No dynamic script loading
- Inline SVG icons
- No `eval()` or `new Function()`

## Configuration Options (v1)
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `enabled` | boolean | true | Enable/disable zoom functionality |
| `mouseWheelZoom` | boolean | true | Zoom with scroll wheel |
| `showControls` | string | "hover" | "always" / "hover" / "never" |
| `minZoom` | number | 0.1 | Minimum zoom level |
| `maxZoom` | number | 20 | Maximum zoom level |

## User Interactions
| Action | Behavior |
|--------|----------|
| Scroll wheel | Zoom in/out at cursor |
| Click + drag | Pan diagram |
| Double-click | Zoom in |
| [+] button | Zoom in |
| [-] button | Zoom out |
| [Reset] button | Fit & center |

## Testing Strategy
1. Create `test-workspace/` with various diagrams:
   - Simple flowchart
   - Complex sequence diagram
   - Multiple diagrams in one file
   - Very large diagram
2. Manual testing in Extension Development Host
3. Test light/dark/high-contrast themes

## Potential Issues & Mitigations
| Issue | Mitigation |
|-------|------------|
| Timing race with Mermaid | Double RAF + MutationObserver |
| Memory leaks | WeakMap for instances, explicit cleanup |
| CSP violations | Bundle all code, no dynamic loading |
| Large diagrams lag | svg-pan-zoom uses GPU transforms |
| Theme switching | Re-render on theme change detection |

## Out of Scope (v1)
- Keyboard navigation (future)
- PNG/SVG export (future)
- Mermaid configuration UI (future)
- State persistence across sessions (future)

## Success Criteria
1. Mermaid diagrams render correctly in markdown preview
2. Mouse wheel zoom works smoothly
3. Click-drag pan works smoothly
4. Controls appear on hover
5. Zoom state preserved when editing markdown
6. Works in light, dark, and high-contrast themes
7. No console errors or CSP violations
