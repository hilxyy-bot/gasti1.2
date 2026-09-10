const fs = require('fs');
const path = require('path');

try {
  const distDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    console.log('Dist directory does not exist, skipping singlefile bundle.');
    process.exit(0);
  }

  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('dist/index.html not found, skipping.');
    process.exit(0);
  }

  let html = fs.readFileSync(indexPath, 'utf-8');

  // Find css file
  const cssMatch = html.match(/href="([^"]*assets\/index-[^"]+\.css)"/);
  if (cssMatch) {
    const rawPath = cssMatch[1].replace(/^\.\//, '').replace(/^\//, '');
    const cssPath = path.join(distDir, rawPath);
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      html = html.replace(
        new RegExp(`<link[^>]*href="${cssMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g'),
        `<style>\n${cssContent}\n</style>`
      );
    }
  }

  // Find js file
  const jsMatch = html.match(/src="([^"]*assets\/index-[^"]+\.js)"/);
  if (jsMatch) {
    const rawPath = jsMatch[1].replace(/^\.\//, '').replace(/^\//, '');
    const jsPath = path.join(distDir, rawPath);
    if (fs.existsSync(jsPath)) {
      let jsContent = fs.readFileSync(jsPath, 'utf-8');
      // Escape </script> if any inside literals
      jsContent = jsContent.replace(/<\/script>/gi, '<\\/script>');
      html = html.replace(
        new RegExp(`<script[^>]*src="${jsMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*></script>`, 'g'),
        `<script type="module">\n${jsContent}\n</script>`
      );
    }
  }

  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(distDir, 'gasti.html'), html, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'gasti.html'), html, 'utf-8');
  console.log('✅ gasti.html bundled successfully into dist/ and public/ (' + (Buffer.byteLength(html) / 1024 / 1024).toFixed(2) + ' MB)');
} catch (err) {
  console.error('Error bundling gasti.html:', err);
}
