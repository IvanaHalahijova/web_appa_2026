#!/usr/bin/env node
// Skript na optimalizáciu obrázkov pomocou sharp
// Použitie: node scripts/optimize_images.js [--src=img] [--out=img/optimized] [--sizes=480,768,1200] [--formats=webp,jpeg] [--quality=80] [--dry-run]

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const argv = require('process').argv.slice(2);
const opts = {};
argv.forEach(a => {
    const m = a.match(/^--([^=]+)=?(.*)$/);
    if (m) opts[m[1]] = m[2] || true;
});

const SRC = opts.src || 'img';
const OUT = opts.out || path.join(SRC, 'optimized');
const SIZES = (opts.sizes || '480,768,1200,1800').split(',').map(s => parseInt(s,10)).filter(Boolean);
const FORMATS = (opts.formats || 'webp,jpeg').split(',').map(f => f.trim()).filter(Boolean);
const QUALITY = parseInt(opts.quality || '80', 10);
const DRY = !!opts['dry-run'] || !!opts['dry'];

function isImage(file) {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.tif', '.tiff'].includes(ext);
}

async function ensureDir(dir){
    try { await fs.mkdir(dir, { recursive: true }); } catch(e){}
}

async function fileModifiedTime(file){
    try { const s = await fs.stat(file); return s.mtimeMs; } catch(e){ return 0; }
}

(async function main(){
    console.log('Image optimizer — src:', SRC, 'out:', OUT, 'sizes:', SIZES.join(','), 'formats:', FORMATS.join(','), 'quality:', QUALITY, DRY? '(dry-run)':'' );
    await ensureDir(OUT);

    const files = (await fs.readdir(SRC)).filter(f => isImage(f));
    const manifest = {};

    for (const file of files){
        const srcPath = path.join(SRC, file);
        const name = path.basename(file, path.extname(file));
        const srcMtime = await fileModifiedTime(srcPath);
        manifest[file] = [];

        for (const size of SIZES){
            for (const fmt of FORMATS){
                const ext = fmt === 'jpeg' ? 'jpg' : fmt;
                const outName = `${name}-${size}.${ext}`;
                const outPath = path.join(OUT, outName);

                const skip = await (async ()=>{
                    try {
                        const s = await fs.stat(outPath);
                        return s.mtimeMs >= srcMtime;
                    } catch(e){ return false; }
                })();

                if (skip){
                    console.log('skip (up-to-date):', outName);
                    manifest[file].push({ size, fmt, file: outName, skipped: true });
                    continue;
                }

                console.log((DRY? '[DRY]' : '[WRITE]'), outName);
                manifest[file].push({ size, fmt, file: outName, skipped: false });

                if (DRY) continue;

                try {
                    let pipeline = sharp(srcPath).rotate();
                    pipeline = pipeline.resize({ width: size });
                    if (fmt === 'webp') pipeline = pipeline.webp({ quality: QUALITY });
                    else if (fmt === 'jpeg') pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
                    else pipeline = pipeline.toFormat(fmt);

                    await pipeline.toFile(outPath);
                } catch (e){
                    console.error('error processing', srcPath, '->', outPath, e);
                }
            }
        }
    }

    const manifestPath = path.join(OUT, 'manifest.json');
    if (!DRY) await fs.writeFile(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), sizes: SIZES, formats: FORMATS, entries: manifest }, null, 2));
    console.log('Done. Manifest:', manifestPath);
})();
