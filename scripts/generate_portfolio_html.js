const fs = require('fs');
const path = require('path');

// Načítaj manifesty
const portfolioManifest = JSON.parse(fs.readFileSync('img/optimized/portfolio/manifest.json', 'utf-8'));

// Mapovanie vzoriek na kategórie a opisy
const categoryMap = {
  'RD': { category: 'rodinne-domy', desc: 'Rodinný dom' },
  'INT': { category: 'interiery', desc: 'Interiér' },
  'DD': { category: 'interiery', desc: 'Interiér' },
  'CH': { category: 'rodinne-domy', desc: 'Rodinný dom' },
  'IBV': { category: 'interiery', desc: 'Interiér' },
  'OB': { category: 'komercne-budovy', desc: 'Komerčná budova' },
};

// Vygeneruj picture HTML
function generatePictureHTML(baseName, sizes = [480, 1200]) {
  const webpSources = sizes.map(size => `img/optimized/portfolio/${baseName}-${size}.webp ${size}w`).join(', ');
  const jpgSources = sizes.map(size => `img/optimized/portfolio/${baseName}-${size}.jpg ${size}w`).join(', ');
  const alt = baseName.replace(/_/g, ' ');
  
  return `<picture>
                            <source srcset="${webpSources}" type="image/webp" />
                            <source srcset="${jpgSources}" type="image/jpeg" />
                            <img src="img/optimized/portfolio/${baseName}-1200.jpg" alt="${alt}" class="img-fluid rounded-3 shadow">
                        </picture>`;
}

// Vygeneruj portfolio items
const items = {};
for (const [original, variants] of Object.entries(portfolioManifest.entries)) {
  const baseName = original.replace(/\.[^.]+$/, '');
  const prefix = baseName.split('_')[0];
  const { category, desc } = categoryMap[prefix] || { category: 'unknown', desc: baseName };
  
  if (!items[category]) items[category] = [];
  
  const picture = generatePictureHTML(baseName);
  items[category].push({
    baseName,
    desc: `${desc} - ${baseName}`,
    picture,
  });
}

// Generuj HTML sekcie
let output = '';
for (const [category, list] of Object.entries(items)) {
  output += `\n<!-- Kategória: ${category} (${list.length} položiek) -->\n`;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    output += `<div class="col-md-4" data-aos="zoom-in">
                    <div class="portfolio-item" data-title="${item.desc}" data-desc="${item.desc}">
                        ${item.picture}
                    </div>
                </div>\n`;
  }
}

console.log(output);
console.log('\n\n=== SUMMARY ===');
console.log(`Rodinné domy: ${items['rodinne-domy']?.length || 0}`);
console.log(`Interiéry: ${items['interiery']?.length || 0}`);
console.log(`Komerčné budovy: ${items['komercne-budovy']?.length || 0}`);
