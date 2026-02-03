const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('img/optimized/portfolio/manifest.json', 'utf-8'));
const entries = Object.keys(manifest.entries);

// Kategorizuj projekty
const projects = {};
entries.forEach(file => {
  const baseName = file.replace(/\.[^.]+$/, '');
  const prefix = baseName.match(/^[A-Z]+\s+[A-Z_]+/)[0]; // Extract "RD HACIK", "INT ZICH", etc.
  
  if (!projects[prefix]) {
    projects[prefix] = [];
  }
  projects[prefix].push(baseName);
});

// Mapovanie prefixov na kategórie
const categoryMap = {
  'RD': 'rodinne-domy',
  'CH': 'rodinne-domy',
  'DD': 'interiery',
  'INT': 'interiery',
  'IBV': 'komercne-budovy',
  'OB': 'komercne-budovy',
};

const categories = {
  'rodinne-domy': { title: '🏠 Rodinné domy', projects: [] },
  'interiery': { title: '🎨 Interiéry', projects: [] },
  'komercne-budovy': { title: '🏢 Komerčné budovy', projects: [] }
};

// Rozdelenie do kategórií
Object.entries(projects).forEach(([prefix, images]) => {
  const category = categoryMap[prefix.split(' ')[0]];
  if (category) {
    categories[category].projects.push({ name: prefix, images });
  }
});

// Generovanie HTML
Object.entries(categories).forEach(([catId, catData]) => {
  console.log(`\n    <section id="${catId}" class="portfolio-category py-5">`);
  console.log(`        <div class="container">`);
  console.log(`            <h2 class="text-center mb-4" data-aos="fade-up">${catData.title}</h2>`);
  console.log(`            <div class="row g-4">`);
  
  catData.projects.forEach(proj => {
    const thumbnail = proj.images[0];
    const cleanName = proj.name.replace(/_/g, ' ');
    
    console.log(`                <div class="col-lg-4 col-md-6" data-aos="zoom-in">`);
    console.log(`                    <div class="portfolio-project-card" data-project="${proj.name}">`);
    console.log(`                        <div class="project-thumb" style="background-image:url('img/optimized/portfolio/${encodeURI(thumbnail)}-1800.jpg')"></div>`);
    console.log(`                        <div class="project-info">`);
    console.log(`                            <h3>${cleanName}</h3>`);
    console.log(`                            <p>${proj.images.length} fotografií</p>`);
    console.log(`                        </div>`);
    console.log(`                    </div>`);
    console.log(`                </div>`);
  });
  
  console.log(`            </div>`);
  console.log(`        </div>`);
  console.log(`    </section>`);
});

console.log(`\n<!-- Total projects: ${Object.keys(projects).length} -->`);
