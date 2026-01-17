/**
 * Build Script for GitHub Pages Deployment
 *
 * Generates a standalone index.html file that can be deployed to GitHub Pages
 */

const fs = require('fs');
const path = require('path');

// Import the compiled module
const { renderClientSideApp } = require('../dist/client-side-app');

// Generate the HTML
const html = renderClientSideApp();

// Write to docs folder for GitHub Pages
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const outputPath = path.join(docsDir, 'index.html');
fs.writeFileSync(outputPath, html, 'utf8');

console.log('✅ Static HTML generated successfully!');
console.log(`📁 Output: ${outputPath}`);
console.log('🚀 Ready for GitHub Pages deployment');
