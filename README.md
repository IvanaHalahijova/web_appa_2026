# web_appa_2026

Jednoduchý statický web projekt — lokálny repozitár pre Appa.

## Optimalizácia obrázkov 🔧
Skript `scripts/optimize_images.js` používa [sharp](https://www.npmjs.com/package/sharp) na vygenerovanie WebP a JPEG variantov v rôznych veľkostiach.

Základné použitie:

- Inštalovať závislosti:

  ```powershell
  npm install
  ```

- Spustiť skript v dry-run (len vypíše, čo by spravil):

  ```powershell
  npm run optimize-images -- --dry-run
  ```

- Spustiť reálne generovanie:

  ```powershell
  npm run optimize-images
  ```

Voliteľné argumenty:
- `--src=img` — vstupný adresár (predvolené `img`)
- `--out=img/optimized` — výstupný adresár (predvolené `img/optimized`)
- `--sizes=480,768,1200` — zoznam šíriek
- `--formats=webp,jpeg` — formáty na generovanie
- `--quality=80` — kvalita (0-100)

Skript vytvorí `manifest.json` v adresári výstupu s prehľadom vygenerovaných súborov.
