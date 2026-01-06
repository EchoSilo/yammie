import { Config, ExportFormat } from './types';

/**
 * Export a diagram to the specified format
 */
export async function exportDiagram(
  svg: SVGElement,
  format: ExportFormat,
  config: Config
): Promise<void> {
  const filename = `mermaid-diagram-${Date.now()}`;

  switch (format) {
    case 'png':
      await exportAsImage(svg, 'png', filename, config.exportScale);
      break;
    case 'jpg':
      await exportAsImage(svg, 'jpg', filename, config.exportScale);
      break;
    case 'html':
      exportAsHtml(svg, filename);
      break;
  }
}

/**
 * Export SVG as PNG or JPG image
 */
async function exportAsImage(
  svg: SVGElement,
  format: 'png' | 'jpg',
  filename: string,
  scale: number
): Promise<void> {
  // Clone SVG to avoid modifying the original
  const svgClone = svg.cloneNode(true) as SVGElement;

  // Get dimensions from viewBox or bounding box
  const viewBox = svg.getAttribute('viewBox');
  let width: number;
  let height: number;

  if (viewBox) {
    const parts = viewBox.split(' ').map(Number);
    width = parts[2];
    height = parts[3];
  } else {
    const bbox = svg.getBoundingClientRect();
    width = bbox.width;
    height = bbox.height;
  }

  // Apply scale for higher resolution export
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  // Set explicit dimensions on clone
  svgClone.setAttribute('width', String(width));
  svgClone.setAttribute('height', String(height));

  // Serialize SVG
  const svgString = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error('Canvas 2D context not supported');
  }

  // Scale context for high DPI
  ctx.scale(scale, scale);

  // For JPG, fill white background (JPG doesn't support transparency)
  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Load and draw SVG
  const img = new Image();

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    img.src = url;
  });

  // Export to data URL and trigger download
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = format === 'jpg' ? 0.95 : undefined;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  downloadFile(dataUrl, `${filename}.${format}`);
}

/**
 * Export SVG as standalone HTML file
 */
function exportAsHtml(svg: SVGElement, filename: string): void {
  const svgClone = svg.cloneNode(true) as SVGElement;

  // Get background color from current theme
  const bgColor = getComputedStyle(document.body).getPropertyValue('--vscode-editor-background') || '#1e1e1e';
  const textColor = getComputedStyle(document.body).getPropertyValue('--vscode-foreground') || '#cccccc';

  const svgString = new XMLSerializer().serializeToString(svgClone);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mermaid Diagram</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: ${bgColor};
      color: ${textColor};
    }
    svg {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
${svgString}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, `${filename}.html`);
  URL.revokeObjectURL(url);
}

/**
 * Trigger file download
 */
function downloadFile(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
