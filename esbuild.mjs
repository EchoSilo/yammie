import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

const isWatch = process.argv.includes('--watch');
const isProduction = process.argv.includes('--production');

// Common options
const commonOptions = {
  bundle: true,
  minify: isProduction,
  sourcemap: !isProduction,
  logLevel: 'info',
};

// Extension bundle (Node.js context)
const extensionConfig = {
  ...commonOptions,
  entryPoints: ['./src/extension.ts'],
  outfile: './dist/extension.js',
  platform: 'node',
  format: 'cjs',
  external: ['vscode'],
};

// Preview script bundle (browser context)
const previewConfig = {
  ...commonOptions,
  entryPoints: ['./src/preview/index.ts'],
  outfile: './dist/preview.js',
  platform: 'browser',
  format: 'iife',
  globalName: 'mermaidZoomPreview',
};

// Copy CSS file
function copyCSS() {
  const srcPath = './src/preview/styles.css';
  const destPath = './dist/preview.css';

  // Ensure dist directory exists
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
  }

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log('Copied preview.css');
  } else {
    console.warn('Warning: styles.css not found, creating empty file');
    fs.writeFileSync(destPath, '/* Mermaid Zoom Preview Styles */\n');
  }
}

async function build() {
  try {
    if (isWatch) {
      // Watch mode
      const extensionCtx = await esbuild.context(extensionConfig);
      const previewCtx = await esbuild.context(previewConfig);

      await extensionCtx.watch();
      await previewCtx.watch();

      // Watch CSS file
      fs.watch('./src/preview', (eventType, filename) => {
        if (filename === 'styles.css') {
          copyCSS();
        }
      });

      copyCSS();
      console.log('Watching for changes...');
    } else {
      // Single build
      await esbuild.build(extensionConfig);
      await esbuild.build(previewConfig);
      copyCSS();
      console.log('Build complete!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
