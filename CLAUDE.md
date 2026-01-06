# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VS Code extension that renders Mermaid diagrams in markdown preview with interactive zoom and pan capabilities. This is an all-in-one solution using Mermaid.js and svg-pan-zoom.

## Build Commands

```bash
npm install          # Install dependencies
npm run build        # Bundle extension and preview scripts with esbuild
```

Debug via VS Code's "Run Extension" launch configuration (F5) which opens an Extension Development Host.

## Architecture

**Two execution contexts:**
1. **Extension Host** (`src/extension.ts`) - Runs in VS Code, provides `extendMarkdownIt()` to identify mermaid code blocks and inject config
2. **Preview Scripts** (`src/preview/`) - Run inside the markdown preview webview

**Preview script flow:**
- `observer.ts` - MutationObserver detects new mermaid blocks
- `mermaidRenderer.ts` - Renders code to SVG
- `panZoom.ts` - Wraps SVG with svg-pan-zoom
- `zoomState.ts` - Preserves zoom/pan state across re-renders using content hash keys
- `controls.ts` - [+] [-] [Reset] buttons with hover reveal

**Build output** (`dist/`):
- `extension.js` - Extension host bundle
- `preview.js` - Single bundled preview script
- `preview.css` - Control styling

## Key Technical Constraints

- **CSP Compliance**: Bundle everything, no dynamic loading, inline SVG icons only
- **Timing**: Use double `requestAnimationFrame` to wait for Mermaid's async rendering
- **State preservation**: Hash first 500 chars of SVG to identify diagrams across re-renders
- **Theme support**: Detect light/dark/high-contrast via `document.body.classList`
- **Cleanup**: Use WeakMap for svg-pan-zoom instances to prevent memory leaks

## Configuration Schema

Extension settings use `mermaid-zoom.*` namespace:
- `enabled` (boolean, default: true)
- `mouseWheelZoom` (boolean, default: true)
- `showControls` ("always" | "hover" | "never", default: "hover")
- `minZoom` (number, default: 0.1)
- `maxZoom` (number, default: 20)

## Testing

Use `test-workspace/` with markdown files containing various diagrams. Test in Extension Development Host across light, dark, and high-contrast themes.
