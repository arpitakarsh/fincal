const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImports(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Match import/export from relative paths
      const importRegex = /(import|export)\s+(?:.*?\s+from\s+)?['"](\.[^'"]+)['"]/g;
      
      content = content.replace(importRegex, (match, type, relPath) => {
        // Only fix imports/exports if they are not already absolute aliases
        const resolvedPath = path.resolve(path.dirname(fullPath), relPath);
        if (resolvedPath.startsWith(srcDir)) {
          const relativeToSrc = path.relative(srcDir, resolvedPath);
          const newPath = '@/' + relativeToSrc.replace(/\\/g, '/'); // ensure forward slash
          changed = true;
          return match.replace(relPath, newPath);
        }
        return match;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

fixImports(srcDir);
console.log('Imports fixed.');
