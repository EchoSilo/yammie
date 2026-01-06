# Yet Another Markdown Mermaid IDE Extention (YAMMIE)

A VS Code extension that renders Mermaid diagrams in the markdown preview with zoom and pan capabilities.

## Features

- **Mermaid Diagram Rendering**: Automatically renders Mermaid code blocks in markdown preview
- **Zoom**: Mouse wheel zoom or control buttons
- **Pan**: Click and drag to pan around large diagrams
- **State Persistence**: Zoom/pan state preserved when editing markdown
- **Theme Support**: Automatic light/dark theme detection
- **Hover Controls**: Clean UI with controls that appear on hover

## Usage

1. Create a markdown file with Mermaid code blocks:

```markdown
\`\`\`mermaid
flowchart TD
    A[Start] --> B[End]
\`\`\`
```

2. Open the markdown preview (Ctrl+Shift+V or Cmd+Shift+V)
3. Interact with diagrams:
   - **Scroll** to zoom in/out
   - **Click + drag** to pan
   - **Hover** over diagram to see controls
   - Click **[+]** to zoom in
   - Click **[-]** to zoom out
   - Click **reset** to fit diagram to view

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `mermaid-zoom.enabled` | `true` | Enable zoom/pan functionality |
| `mermaid-zoom.mouseWheelZoom` | `true` | Enable mouse wheel zoom |
| `mermaid-zoom.doubleClickZoom` | `true` | Enable double-click to zoom |
| `mermaid-zoom.showControls` | `"hover"` | When to show controls: `"always"`, `"hover"`, `"never"` |
| `mermaid-zoom.minZoom` | `0.1` | Minimum zoom level |
| `mermaid-zoom.maxZoom` | `20` | Maximum zoom level |
| `mermaid-zoom.zoomSensitivity` | `0.3` | Zoom sensitivity (0.1-1.0) |
| `mermaid-zoom.lightTheme` | `"default"` | Mermaid theme for light mode |
| `mermaid-zoom.darkTheme` | `"dark"` | Mermaid theme for dark mode |

## Supported Diagram Types

- Flowcharts
- Sequence diagrams
- Class diagrams
- State diagrams
- Entity Relationship diagrams
- Gantt charts
- Pie charts
- And more...

## Development

### Prerequisites

- Node.js 18+
- VS Code 1.85+

### Setup

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Watch mode
npm run watch
```

### Testing

1. Press F5 to launch Extension Development Host
2. Open `test-workspace/sample.md`
3. Open markdown preview (Ctrl+Shift+V)

### Packaging

```bash
npm run package
```

## License

MIT
