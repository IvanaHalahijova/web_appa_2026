const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync('img/optimized/hero/manifest.json', 'utf-8'));
const entries = Object.keys(manifest.entries);

let html = '';
entries.forEach((original, index) => {
  const baseName = original.replace(/\.[^/.]+$/, '');
  const active = index === 0 ? ' active' : '';
  
  html += `                <div class="carousel-item${active} zoom-bg" style="background-image:url('img/optimized/hero/${encodeURI(baseName)}-1200.jpg')"></div>\n`;
});

console.log(html);
console.log(`\n<!-- ${entries.length} slides generated -->`);
