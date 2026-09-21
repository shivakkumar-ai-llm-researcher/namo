const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'node_modules', 'astronomy-engine');
if (!fs.existsSync(baseDir)) {
  process.exit(0);
}

['astronomy.js', 'esm/astronomy.js', 'astronomy.browser.js'].forEach(file => {
  const p = path.join(baseDir, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (!content.includes('typeof observer.latitude === "number"')) {
      content = content.replace(
        'if (!(observer instanceof Observer)) {',
        'if (!(observer instanceof Observer) && !(observer && typeof observer.latitude === "number")) {'
      );
      fs.writeFileSync(p, content, 'utf8');
      console.log('Patched VerifyObserver in', file);
    }
  }
});
