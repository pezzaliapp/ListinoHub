# ListinoHub

PWA mobile-first per importare listini Excel/CSV, cercare articoli e comporre preventivi con sconti e voci accessorie. Funziona offline grazie al Service Worker.

Live: https://pezzaliapp.github.io/ListinoHub/

Vedi [`SPEC.md`](./SPEC.md) per i requisiti completi.

## Stack
Vite + React + TypeScript + Tailwind + vite-plugin-pwa + Dexie (IndexedDB) + Zustand.

## Sviluppo
```bash
npm install
npm run dev
```

## Build
```bash
npm run typecheck
npm run build
npm run preview
```

## Deploy
Push su `main` → GitHub Actions builda e pubblica su GitHub Pages.

## Autore
**PezzaliAPP** — https://github.com/pezzaliapp

## Licenza
[MIT](./LICENSE) — © 2026 PezzaliAPP
