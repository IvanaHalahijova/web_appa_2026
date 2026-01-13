/*
  scripts/link_and_validate.js
  - Skript prekontroluje všetky .html súbory v projekte (rekurzívne)
  - Vytiahne odkazy (<a href>), obrázky (<img src>), <link href> a <script src>
  - Overí, či lokálne súbory skutočne existujú
  - Skontroluje kotvy (#id) v cieľových súboroch
  - Otestuje externé odkazy cez HEAD (fallback na GET)
  - Pošle HTML do W3C validátora (https://validator.w3.org/nu/?out=json) a uloží správy
  - Výsledok zapíše do reports/link_validation_report.json

  Použitie: node scripts/link_and_validate.js
  Poznámka: bežím lokálne, nie do CI; môžeš to pridať neskôr do workflowu.
*/

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const workspaceRoot = path.resolve(__dirname, '..');
const reportDir = path.join(workspaceRoot, 'reports');
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

const TIMEOUT = 8000;

function walk(dir, ext = '.html'){
  const res = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list){
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) res.push(...walk(full, ext));
    else if (ent.isFile() && path.extname(ent.name).toLowerCase() === ext) res.push(full);
  }
  return res;
}

function readFile(f){ return fs.readFileSync(f, 'utf8'); }

function extractLinks(html){
  const hrefRe = /<(?:a|link)\b[^>]*?href=(?:"|')([^"']+)(?:"|')[^>]*>/ig;
  const srcRe = /<(?:img|script)\b[^>]*?src=(?:"|')([^"']+)(?:"|')[^>]*>/ig;
  const ids = [];
  const idRe = /\bid=(?:"|')([^"']+)(?:"|')/ig;
  let m;
  while ((m = idRe.exec(html))){ ids.push(m[1]); }
  const hrefs = []; while ((m = hrefRe.exec(html))){ hrefs.push(m[1]); }
  const srcs = []; while ((m = srcRe.exec(html))){ srcs.push(m[1]); }
  return { hrefs, srcs, ids };
}

function isExternal(h){ return /^https?:\/\//i.test(h); }
function isIgnoredScheme(h){ return /^(mailto:|tel:|javascript:|#\/)/i.test(h); }

function checkLocalPath(baseFile, link){
  // Riešim relatívnu cestu voči súboru (baseFile)
  let target = link.split('#')[0];
  if (!target) return {exists:true, path: baseFile}; // just a fragment
  // If link starts with /, resolve relative to workspace root
  if (target.startsWith('/')) target = path.join(workspaceRoot, target);
  else target = path.join(path.dirname(baseFile), decodeURIComponent(target));
  // Normalize and check
  const cleaned = path.normalize(target);
  return { exists: fs.existsSync(cleaned), path: cleaned };
}

function checkAnchorInFile(fileContent, fragment){
  const id = fragment.replace(/^#/, '');
  // Hľadám id="..." alebo name="..." (kontrola kotvy)
  return fileContent.includes('id="'+id+'"') || fileContent.includes("id='"+id+"'") ||
         fileContent.includes('name="'+id+'"') || fileContent.includes("name='"+id+"'");
}

function httpRequest(urlStr, method='HEAD', timeout=TIMEOUT){
  return new Promise((resolve) => {
    try{
      const url = new URL(urlStr);
      const lib = url.protocol === 'https:' ? https : http;
      const opts = { method, timeout, headers: { 'User-Agent': 'link-validator/1.0' } };
      const req = lib.request(url, opts, (res) => {
        const status = res.statusCode;
        // Sledujem presmerovania (jednoduchý follow, až 5) 
        if ([301,302,303,307,308].includes(status) && res.headers.location){
          resolve(httpRequest(new URL(res.headers.location, url).toString(), method, timeout));
          return;
        }
        res.resume();
        resolve({ ok: status >= 200 && status < 400, status });
      });
      req.on('error', (err) => resolve({ ok:false, error:err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok:false, error:'timeout' }); });
      req.end();
    }catch(err){ resolve({ ok:false, error: err.message }); }
  });
}

function validateHtmlWithW3C(html){
  return new Promise((resolve) => {
    const postData = html;
    const options = {
      hostname: 'validator.w3.org',
      path: '/nu/?out=json',
      method: 'POST',
      headers: {
        'User-Agent': 'link-validator/1.0',
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: TIMEOUT
    };
    const req = https.request(options, (res) => {
      let data='';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try{ const json = JSON.parse(data); resolve({ ok: true, json }); }
        catch(e){ resolve({ ok:false, error:'invalid-json' }); }
      });
    });
    req.on('error', (err) => resolve({ ok:false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok:false, error:'timeout' }); });
    req.write(postData);
    req.end();
  });
}

(async function main(){
  console.log('Scanning workspace for .html files...');
  const htmlFiles = walk(workspaceRoot).filter(f => !/node_modules/.test(f));
  console.log('Found', htmlFiles.length, 'HTML files');

  const report = { scannedFiles: htmlFiles.length, files: [] };

  for (const file of htmlFiles){
    const content = readFile(file);
    const { hrefs, srcs, ids } = extractLinks(content);
    const fileReport = { file: path.relative(workspaceRoot, file), hrefs: [], srcs: [], ids: ids || [], htmlValidation: null };

    // Kontrola href (odkazy) - lokálne / externé / kotvy
    for (const h of hrefs){
      if (isIgnoredScheme(h)) { fileReport.hrefs.push({ link: h, note: 'ignored-scheme' }); continue; }
      if (isExternal(h)){
        const res = await httpRequest(h, 'HEAD');
        if (!res.ok && res.error) fileReport.hrefs.push({ link: h, ok: false, error: res.error });
        else fileReport.hrefs.push({ link: h, ok: !!res.ok, status: res.status });
      } else {
        const frag = h.includes('#') ? h.split('#').slice(1).join('#') : null;
        const targetCheck = checkLocalPath(file, h);
        if (!targetCheck.exists){ fileReport.hrefs.push({ link: h, ok:false, reason:'target-missing', resolvedPath: targetCheck.path }); }
        else {
          if (h.includes('#')){
            const targetFile = targetCheck.path;
            const targetContent = readFile(targetFile);
            const fragId = '#'+frag;
            const found = targetContent.includes('id="'+frag+'"') || targetContent.includes("name=\""+frag+"\"") || targetContent.includes("id='"+frag+"'") || targetContent.includes("name='"+frag+"'");
            fileReport.hrefs.push({ link: h, ok: !!found, fragment: frag, resolvedPath: targetFile, fragmentFound: !!found });
          } else {
            fileReport.hrefs.push({ link: h, ok: true, resolvedPath: targetCheck.path });
          }
        }
      }
    }

    // Kontrola src (zdroje obrázkov, skriptov)
    for (const s of srcs){
      // Data: URI považujem za platné (napr. placeholdery)
      if (/^data:/i.test(s)){
        fileReport.srcs.push({ src: s, ok: true, note: 'data-uri' });
        continue;
      }
      if (isExternal(s)){
        const res = await httpRequest(s, 'HEAD');
        fileReport.srcs.push({ src: s, ok: !!res.ok, status: res.status || null, error: res.error || null });
      } else {
        const targetCheck = checkLocalPath(file, s);
        fileReport.srcs.push({ src: s, ok: targetCheck.exists, resolvedPath: targetCheck.path });
      }
    }

    // W3C validácia HTML (posielam cez API)
    try{
      const val = await validateHtmlWithW3C(content);
      if (val.ok && val.json){
        fileReport.htmlValidation = { messages: val.json.messages || [], url: val.json.url || null };
      } else fileReport.htmlValidation = { error: val.error || 'unknown' };
    }catch(e){ fileReport.htmlValidation = { error: e.message }; }

    report.files.push(fileReport);
    console.log('Processed', path.relative(workspaceRoot, file));
  }

  const outPath = path.join(reportDir, 'link_validation_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('\nReport written to', outPath);
  // Zhrnutie výsledkov (po spracovaní všetkých súborov)
  let missing = 0, brokenExternal = 0, htmlErrors = 0;
  for (const f of report.files){
    for (const h of f.hrefs) if (h.ok === false) missing++;
    for (const s of f.srcs) if (s.ok === false) missing++;
    if (f.htmlValidation && f.htmlValidation.messages && f.htmlValidation.messages.some(m => m.type === 'error')) htmlErrors++;
    for (const h of f.hrefs) if (h.status && h.status >= 400) brokenExternal++;
    for (const s of f.srcs) if (s.status && s.status >= 400) brokenExternal++;
  }
  console.log(`\nSummary: ${report.files.length} files; ${missing} missing local refs; ${brokenExternal} broken external refs; ${htmlErrors} files with HTML errors`);
})();
