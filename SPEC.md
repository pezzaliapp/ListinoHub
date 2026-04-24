# PezzaliAPP — Listini & Preventivi PWA

App **PWA commerciale mobile-first** (iOS + Android + desktop) per gestire listini multipli, ricerca articoli, preventivi con sconti a regola d'utente, e voci accessorie (trasporto, installazione, ecc.).

Branding: **solo "PezzaliAPP"**. Nessun riferimento a terzi nel codice, nei testi, nelle icone o nelle meta.

---

## 1. Stack tecnico

| Area | Scelta | Motivazione |
|---|---|---|
| Build | **Vite + React + TypeScript** | Velocità, tree-shaking, DX moderna |
| UI | **Tailwind CSS** + CSS variables per design tokens | Mobile-first, rapido da iterare |
| Routing | **React Router v6** | Standard |
| Stato | **Zustand** (leggero) + persistenza su IndexedDB | Più semplice di Redux per questo scope |
| DB locale | **Dexie.js** (wrapper IndexedDB) | Serve per reggere 50+ listini con decine di migliaia di righe senza lag |
| Import file | **PapaParse** (CSV) + **SheetJS/xlsx** (Excel) | Standard de-facto |
| PWA | **vite-plugin-pwa** (Workbox) | Service worker, manifest, offline, installabile |
| Icone | **lucide-react** | Coerenti e leggere |
| Fonts | **Inter** (UI) + **IBM Plex Mono** (codici articolo) — servite self-hosted | Leggibilità mobile, no Google Fonts in prod (privacy) |
| Testing | Vitest + React Testing Library | Opzionale ma consigliato |
| Deploy | **GitHub Pages** via GitHub Actions | Gratuito, HTTPS automatico, integrazione diretta col repo |

---

## 2. Struttura repo

```
PezzaliAPP/
├─ public/
│  ├─ icons/              # icone PWA 192, 512, maskable, apple-touch
│  ├─ manifest.webmanifest
│  └─ robots.txt
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ router.tsx
│  │  └─ layout/
│  │     ├─ AppShell.tsx     # header + bottom nav mobile
│  │     ├─ BottomNav.tsx
│  │     └─ Header.tsx
│  ├─ pages/
│  │  ├─ Home.tsx
│  │  ├─ Listini.tsx         # elenco + import
│  │  ├─ ListinoDettaglio.tsx# scroll verticale fluido
│  │  ├─ Ricerca.tsx         # ricerca globale codice/nome
│  │  ├─ Preventivo.tsx      # "carrello" con sconti, flag, totali
│  │  ├─ Utenti.tsx          # anagrafica clienti + sconti fissi
│  │  ├─ Impostazioni.tsx    # calcMode, password, import/export backup
│  │  └─ Login.tsx           # password admin
│  ├─ features/
│  │  ├─ import/
│  │  │  ├─ csvParser.ts
│  │  │  ├─ xlsxParser.ts
│  │  │  ├─ columnMapper.tsx # UI per mappare colonne quando headers variano
│  │  │  └─ importService.ts
│  │  ├─ search/
│  │  │  └─ useSearch.ts     # ricerca fuzzy su codice+descrizione
│  │  ├─ preventivo/
│  │  │  ├─ calcolo.ts       # margine vs ricarico, sconti, IVA
│  │  │  ├─ pdfExport.ts     # opzionale: jsPDF
│  │  │  └─ shareService.ts  # Web Share API
│  │  └─ auth/
│  │     └─ passwordGate.tsx
│  ├─ db/
│  │  ├─ schema.ts           # Dexie schema
│  │  └─ queries.ts
│  ├─ store/
│  │  ├─ preventivoStore.ts
│  │  ├─ userStore.ts
│  │  └─ settingsStore.ts
│  ├─ components/
│  │  ├─ ui/                 # Button, Input, Card, Sheet, Toast
│  │  └─ ArticoloRow.tsx     # riga listino ottimizzata per mobile
│  ├─ styles/
│  │  ├─ globals.css
│  │  └─ tokens.css          # design tokens (sezione 4)
│  └─ lib/
│     └─ format.ts           # formatter € IT
├─ SPEC.md                   # questo file
├─ README.md
├─ vite.config.ts
├─ tailwind.config.ts
├─ tsconfig.json
└─ package.json
```

---

## 3. Modello dati (Dexie / IndexedDB)

```ts
// Listino: uno per ogni file importato
interface Listino {
  id: string;            // uuid
  nome: string;          // es. "Listino Fornitore X 2026"
  fornitore?: string;
  dataImport: number;    // timestamp
  numeroArticoli: number;
  // flag a livello di listino (ereditati dagli articoli se non sovrascritti)
  flagPrezziNettiNonScontabili: boolean;
  flagIncludeTrasporto: boolean;
  flagIncludeInstallazione: boolean;
}

interface Articolo {
  id: string;            // uuid
  listinoId: string;     // FK
  codice: string;        // indexed
  descrizione: string;   // indexed (lowercase mirror per ricerca)
  descrizioneLower: string;
  prezzoLordo: number;   // prezzo listino pubblico
  prezzoAcquisto: number;// costo per noi
  prezzoNettoFisso?: number; // se valorizzato, non scontabile
  // flag per articolo (sovrascrivono il listino)
  nonScontabile?: boolean;
  isTrasporto?: boolean;
  isInstallazione?: boolean;
  isVoceExtra?: boolean;
  unita?: string;        // pz, m, kg...
}

interface Utente {
  id: string;
  nome: string;
  password: string;      // hash (bcrypt-ts)
  scontoFisso: number;   // percentuale, es. 20
  note?: string;
}

interface RigaPreventivo {
  id: string;
  articoloId?: string;   // facoltativo: voci libere non hanno articolo
  codice: string;
  descrizione: string;
  quantita: number;
  prezzoLordo: number;
  scontoPerc: number;    // se articolo scontabile
  prezzoNettoUnitario: number; // calcolato
  flagTrasporto: boolean;
  flagInstallazione: boolean;
  flagVoceExtra: boolean;
  nonScontabile: boolean;
}

interface Preventivo {
  id: string;
  numero: string;
  data: number;
  clienteId?: string;
  clienteNome?: string;
  righe: RigaPreventivo[];
  calcMode: 'margine' | 'ricarico' | 'nessuno';
  margineRicaricoPerc?: number;
  ivaPerc: number;       // default 22
  note?: string;
  totaleImponibile: number;
  totaleIva: number;
  totale: number;
}

interface Settings {
  id: 'app';
  calcMode: 'margine' | 'ricarico' | 'nessuno';
  margineRicaricoDefault: number;
  ivaDefault: number;
  adminPasswordHash: string;
  requireLogin: boolean;
}
```

---

## 4. Design tokens (stile formau.it, senza riferimenti al brand)

```css
/* src/styles/tokens.css */
:root {
  /* Palette: rosso industriale, antracite, bianco, grigi */
  --color-bg: #ffffff;
  --color-bg-soft: #f5f5f7;
  --color-surface: #ffffff;
  --color-ink: #101114;          /* testo principale */
  --color-ink-soft: #4a4d55;     /* testo secondario */
  --color-muted: #8a8f99;
  --color-border: #e5e7eb;

  --color-accent: #c8102e;       /* rosso primario - bottoni, CTA, prezzi chiave */
  --color-accent-dark: #9a0c23;
  --color-accent-soft: #ffe8ec;

  --color-nav: #15171c;          /* header/bottom nav scura */
  --color-nav-ink: #ffffff;

  --color-success: #1f8a4c;
  --color-warn:    #c97a0a;
  --color-danger:  #c8102e;

  /* Tipografia */
  --font-ui: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, Menlo, monospace;

  /* Spacing / radius / shadow */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(16,17,20,.06);
  --shadow-md: 0 6px 20px rgba(16,17,20,.08);

  /* Touch targets mobile: min 44px */
  --tap: 44px;
}

@media (prefers-color-scheme: dark) {
  /* Tema scuro DISABILITATO di default (decisione di progetto: tema chiaro fisso).
     Se un domani si vuole riabilitare, rimuovere il selettore `:root.force-light`
     nel CSS globale e ripristinare le variabili qui sotto. */
}
```

Tailwind legge questi tramite `tailwind.config.ts`:
```ts
theme: { extend: { colors: {
  accent: 'var(--color-accent)',
  ink: 'var(--color-ink)',
  /* ... */
}}}
```

---

## 5. Funzionalità (spec dettagliata)

### 5.1 Import listini
- Formati: `.xlsx`, `.xls`, `.csv`, `.tsv`
- Colonne richieste (auto-detect da header): **Codice**, **Descrizione**, **Prezzo Lordo**, **Prezzo Acquisto**
- Se gli header non vengono riconosciuti → schermata **Column Mapper**: l'utente associa manualmente ogni colonna del file a un campo dell'app (preview delle prime 5 righe).
- Al salvataggio, ogni listino genera un record `Listino` + N record `Articolo` in Dexie.
- **Import multipli**: fino a 50+ listini; ogni listino è indipendente, con proprio nome e fornitore.
- Possibilità di **eliminare** o **sostituire** un listino esistente.
- Durante import mostrare progress bar (parsing chunked per file grandi).

### 5.2 Ricerca
- Barra di ricerca globale (accessibile dalla bottom nav, sempre 1 tap).
- Cerca simultaneamente su **codice** (match prefisso) e **descrizione** (match substring, case-insensitive).
- Risultati raggruppati per listino; ogni riga mostra: codice mono, descrizione, prezzo lordo, badge del listino.
- Tap sulla riga → **bottom sheet** con: quantità, sconto manuale, flag (trasporto/installazione/voce extra/non scontabile), pulsante "Aggiungi al preventivo".

### 5.3 Scorrimento listino
- Lista **virtualizzata** (react-window o TanStack Virtual) per reggere 10k+ righe a 60 fps.
- Scroll verticale fluido, nessun overflow orizzontale.
- Ogni riga: codice in monospace, descrizione troncata a 2 righe, prezzo lordo a destra.
- Pulsante "+" sempre visibile a destra per aggiungere al preventivo veloce.

### 5.4 Preventivo (carrello)
- Lista righe: drag-to-delete (swipe), tap per modificare quantità/sconto/flag.
- Totali in fondo, **sticky**:
  - Imponibile (lordo)
  - Totale sconti
  - Trasporto
  - Installazione
  - Extra
  - **Totale netto** (evidenziato rosso)
  - IVA (%)
  - **Totale con IVA** (grande, evidenziato)
- Toggle globali: Mostra margine / Mostra ricarico / Nessuno — con percentuale default da impostazioni (modificabile riga per riga).
- **Regola sconti**:
  1. Se `nonScontabile = true` → sconto 0, flag bloccato.
  2. Se l'utente selezionato ha `scontoFisso` → applicato di default, editabile solo se l'admin ha sbloccato.
  3. Altrimenti sconto manuale inseribile dall'operatore.
- Flag **Trasporto / Installazione / Voce Extra**: si possono aggiungere come righe accessorie (con o senza articolo), con prezzo libero; non entrano nel calcolo del margine se l'utente lo configura così nelle impostazioni.
- Azioni: **Salva preventivo**, **Esporta PDF** (jsPDF + jspdf-autotable), **Condividi** tramite Web Share API (WhatsApp / mail / altre app di sistema), **Nuovo**.
- L'export PDF deve includere: intestazione con logo PezzaliAPP, dati cliente, numero e data preventivo, tabella righe (codice, descrizione, q.tà, prezzo lordo, sconto %, netto), totali (imponibile, sconti, trasporto, installazione, extra, imponibile finale, IVA, totale), eventuali note.
- Dopo la generazione del PDF, il Web Share API permette di condividere il file direttamente (`navigator.share({ files: [pdfFile] })`) su WhatsApp, mail, Messaggi, ecc. Fallback su dispositivi senza Web Share: download locale del PDF.

### 5.5 Utenti / clienti + password
- Elenco utenti con: nome, sconto fisso %, note.
- Ogni utente ha una password (hash con bcrypt-ts o argon2-browser).
- Al "login" di un utente nel preventivo, si richiede password → sblocca il suo sconto fisso.
- Password admin separata → sblocca: modifica utenti, modifica impostazioni, override sconti bloccati, eliminazione listini.

### 5.6 Impostazioni
- Password admin (cambio).
- Modalità calcolo default: `margine` / `ricarico` / `nessuno`.
- % default margine o ricarico.
- % IVA default (22).
- Flag default per nuovi listini (trasporto incluso / prezzi netti non scontabili).
- **Backup/Restore**: export JSON di tutto il DB, import JSON.

### 5.7 PWA
- `manifest.webmanifest` con:
  - `name`: "PezzaliAPP"
  - `short_name`: "PezzaliAPP"
  - `display`: "standalone"
  - `orientation`: "portrait"
  - `theme_color`: `#15171c`
  - `background_color`: `#ffffff`
  - Icone 192/512/maskable + apple-touch-icon.
- Service worker (Workbox via vite-plugin-pwa):
  - Precache asset statici.
  - Strategie: `CacheFirst` per asset, `NetworkFirst` per HTML.
  - App funziona **100% offline** una volta caricata (i listini sono in IndexedDB).
- Prompt "Installa l'app" custom su Android; istruzioni "Aggiungi a schermata home" su iOS.

---

## 6. UX mobile — regole non negoziabili

- **Touch target minimo 44x44 px** (`--tap`).
- Bottom nav con 4 voci: **Home / Listini / Ricerca / Preventivo**. Badge con contatore righe preventivo.
- Nessun hover-only: ogni interazione deve funzionare a tocco.
- Tastiera numerica (`inputMode="decimal"`) sui campi prezzo/quantità/sconto.
- Swipe-to-delete sulle righe preventivo.
- Safe area iOS: `env(safe-area-inset-bottom)` sulla bottom nav.
- Prezzi sempre allineati a destra, font-variant-numeric: tabular-nums.

---

## 7. Prompt di partenza per Claude Code

Paste in Claude Code dopo aver creato la repo vuota:

> Sei a lavoro su **PezzaliAPP**, una PWA commerciale mobile-first per gestire listini e preventivi. Il file `SPEC.md` nella radice del repo contiene i requisiti completi, lo stack, il modello dati, i design tokens, le regole UX e il workflow di deploy.
>
> **Decisioni di progetto già prese (da rispettare):**
> - Deploy su **GitHub Pages** via GitHub Actions (repo: `PezzaliAPP/pezzaliapp-listini`)
> - Tema **chiaro fisso** (stile industriale: rosso accento + antracite su bianco). Niente dark mode automatico.
> - Export preventivo: **PDF** (jsPDF + jspdf-autotable) + **condivisione** via Web Share API (WhatsApp, mail, ecc.)
> - Brand: **solo "PezzaliAPP"**. Nessun riferimento a terzi nel codice, testi, asset o meta.
>
> Inizia in questo ordine:
> 1. Scaffold del progetto con Vite + React + TypeScript + Tailwind + vite-plugin-pwa, seguendo la struttura cartelle in SPEC.md sezione 2. Configura `vite.config.ts` con `base: '/pezzaliapp-listini/'` e il manifest PWA come da sezione 9.1.
> 2. Imposta `src/styles/tokens.css` con i design tokens di SPEC.md sezione 4, e collegali a `tailwind.config.ts`.
> 3. Crea `AppShell` con header scuro (`--color-nav`), bottom nav a 4 voci (Home / Listini / Ricerca / Preventivo) con badge contatore, e safe-area iOS (`env(safe-area-inset-bottom)`).
> 4. Configura Dexie con lo schema di SPEC.md sezione 3.
> 5. Implementa nell'ordine: **Import listini** (CSV + XLSX con Column Mapper) → **Ricerca globale** → **Preventivo** con sconti/flag/totali → **Utenti** con password → **Impostazioni** (backup/restore JSON) → **Export PDF + share**.
> 6. Crea `.github/workflows/deploy.yml` come in sezione 9.2 per il deploy automatico su GitHub Pages.
> 7. Tieni il codice pulito, type-safe, con liste virtualizzate (TanStack Virtual) dove servono.
>
> Prima di iniziare, leggi SPEC.md e fammi qualunque domanda di chiarimento. Quando non sei sicuro tra due opzioni, chiedi invece di indovinare.

---

## 8. Setup repo GitHub (PezzaliAPP)

```bash
# sul tuo PC, dentro una cartella vuota:
gh repo create PezzaliAPP/pezzaliapp-listini --public --clone
cd pezzaliapp-listini

# metti dentro SPEC.md (questo file) e un README minimo
# poi apri la cartella con Claude Code e incolla il prompt sopra
```

README.md iniziale suggerito:

```md
# PezzaliAPP — Listini & Preventivi

PWA mobile-first per import listini Excel/CSV, ricerca articoli, preventivi con sconti e voci accessorie.

Vedi [`SPEC.md`](./SPEC.md) per i requisiti completi.

## Sviluppo
​```bash
npm install
npm run dev
​```

## Build produzione
​```bash
npm run build
npm run preview
​```

## Deploy
Push su `main` → GitHub Actions builda e pubblica automaticamente su GitHub Pages.

## Licenza
Proprietaria — © PezzaliAPP
```

---

## 9. Deploy su GitHub Pages

### 9.1 Config Vite per subpath

Se la repo si chiama `pezzaliapp-listini`, l'URL sarà `https://pezzaliapp.github.io/pezzaliapp-listini/`.
Serve quindi `base` corretto in `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // IMPORTANTE: stesso nome della repo
  base: '/pezzaliapp-listini/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'PezzaliAPP',
        short_name: 'PezzaliAPP',
        description: 'Listini & Preventivi',
        start_url: '/pezzaliapp-listini/',
        scope: '/pezzaliapp-listini/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#15171c',
        background_color: '#ffffff',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
        // niente precache enorme per i listini: stanno in IndexedDB
      }
    })
  ]
});
```

### 9.2 GitHub Actions workflow

Crea il file `.github/workflows/deploy.yml`:

```yaml
name: Deploy PezzaliAPP to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Fix SPA routing for GitHub Pages
        run: cp dist/index.html dist/404.html
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 9.3 Attivazione Pages

Dopo il primo push su `main`:
1. Vai su **Settings → Pages** della repo
2. **Source**: seleziona **GitHub Actions**
3. Attendi il completamento del workflow
4. L'app sarà live su `https://pezzaliapp.github.io/pezzaliapp-listini/`

### 9.4 Router base path

In `src/app/router.tsx`, usa `basename` coerente col `base` di Vite:

```tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  /* routes */
], { basename: import.meta.env.BASE_URL });
```

### 9.5 HTTPS e PWA

GitHub Pages serve già su HTTPS → il service worker e `navigator.share()` funzionano senza configurazione aggiuntiva.

---

## 10. Checklist prima del deploy

- [ ] Icone PWA generate (192, 512, maskable, apple-touch)
- [ ] `vite.config.ts` → `base: '/pezzaliapp-listini/'` (coerente col nome repo)
- [ ] Router con `basename: import.meta.env.BASE_URL`
- [ ] Workflow `.github/workflows/deploy.yml` presente
- [ ] Settings → Pages → Source = GitHub Actions
- [ ] Manifest testato con Lighthouse (PWA score 100)
- [ ] Service worker attivo, app installabile da Android e iOS
- [ ] Test import con file XLSX reale da 10k+ righe
- [ ] Test preventivo con 50 righe, swipe funzionante
- [ ] Test export PDF + share nativo su mobile reale
- [ ] Password admin impostata al primo avvio
- [ ] Backup/restore JSON verificato
- [ ] Nessuna stringa/asset/URL con riferimenti a terzi: **solo "PezzaliAPP"**
- [ ] HTTPS verificato (automatico su GitHub Pages)
