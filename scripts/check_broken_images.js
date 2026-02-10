// scripts/check_broken_images.js
// Kontrola "broken images" v HTML súboroch
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const axios = require('axios');
const glob = require('glob');

const workspaceRoot = path.resolve(__dirname, '..');
const reportDir = path.join(workspaceRoot, 'reports');
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);
const reportPath = path.join(reportDir, 'broken_images_report.txt');

function isExternal(src) {
  return /^https?:\/\//i.test(src);
}

async function checkImage(src, baseFile) {
  if (isExternal(src)) {
    try {
      const res = await axios.head(src, { timeout: 8000 });
      return res.status >= 200 && res.status < 400;
    } catch (e) {
      return false;
    }
  } else {
    const imgPath = path.resolve(path.dirname(baseFile), src.replace(/^\//, ''));
    return fs.existsSync(imgPath);
  }
}

(async function main() {
  const htmlFiles = glob.sync(path.join(workspaceRoot, '**/*.html'));
  let broken = [];
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(content);
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src) broken.push({ file, src });
    });
  }
  let brokenList = [];
  for (const { file, src } of broken) {
    const ok = await checkImage(src, file);
    if (!ok) brokenList.push(`${file}: ${src}`);
  }
  fs.writeFileSync(reportPath, brokenList.length ? brokenList.join('\n') : 'Žiadne broken images nenájdené.');
  console.log('Broken images report:', reportPath);
})();
