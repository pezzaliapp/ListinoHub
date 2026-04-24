# ListinoHub

PWA mobile-first per gestire **più listini fornitore** e generare preventivi con sconti, prezzi netti e bonus fedeltà.
Fork evolutivo di [CSVXpressSmart](https://github.com/pezzaliapp/CSVXpressSmart), stessa logica di calcolo, nuovo modello dati multi-listino.

**Live:** https://www.alessandropezzali.it/ListinoHub/

---

## Funzionalità

- **Multi-listino** con IndexedDB — ogni listino ha fornitore, data import, sconto max commerciale, flag "prezzi netti", bonus (tipo + valore per pezzo).
- **Import CSV / XLSX / XLS** con auto-detect colonne (codice, descrizione, prezzo, trasporto, installazione) e fallback sulle prime 3 colonne quando gli header non sono riconosciuti.
- **Conflitto fornitore duplicato**: al ri-import dello stesso fornitore si può scegliere di _aggiornare_ (sostituire), _aggiungere come separato_ o _annullare_.
- **Prezzi netti** (`isNetto`): per i listini marcati come netti i campi sconto e margine sono disabilitati e il prezzo venduto è il prezzo di listino.
- **Sconto max fornitore (safeguard)**: se lo sconto equivalente di una riga supera il limite del fornitore, la cella è evidenziata in rosso, parte un toast di warning e la riga viene marcata `needsApproval`. Il TXT finale riporta l'avviso di approvazione richiesta.
- **Bonus / punti fedeltà**: eredità automatica da listino, aggregati per tipo e stampati nel report (es. `Bonus accumulati: 45,00 in buoni carburante | 120 in punti fedeltà`).
- **Preventivo**: qtà, sconto 1/2, sconto cliente, margine, trasporto, installazione, IVA, totali — invariato rispetto a CSVXpressSmart per articoli non netti.
- **Filtra per fornitore** sopra la ricerca; **ricerca con debounce** su codice + descrizione.
- **Export TXT** e **condivisione WhatsApp** (con e senza margine).
- **PWA offline** via Service Worker (cache-first su asset, network-first su HTML e CDN).
- **Responsive**: tabella su desktop, **card verticali su smartphone** (nessuna rotazione richiesta), safe-area iOS rispettata.

---

## Stack

- HTML + CSS + JavaScript **vanilla**, zero build step.
- [PapaParse](https://www.papaparse.com/) via CDN per CSV.
- [SheetJS](https://sheetjs.com/) via CDN per XLSX / XLS.
- IndexedDB per i listini, localStorage per le preferenze smart.
- Service Worker per installabilità + offline.

---

## Struttura

```
ListinoHub/
├── index.html
├── app.js
├── styles.css
├── style.mobile.cards.v3.css
├── manifest.json
├── service-worker.js
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-1024.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
├── LICENSE
├── SPEC.md
└── README.md
```

---

## Deploy

GitHub Pages — _Deploy from a branch_ → `main` → `/(root)`.
Push su `main` = deploy immediato. Nessun workflow Actions, nessun build step.

Il dominio custom `https://www.alessandropezzali.it/ListinoHub/` è ereditato dall'account; tutti i path nell'app sono relativi (`./`) per essere compatibili con il subpath.

---

## Uso rapido

1. Apri l'app, compila il blocco **Nuovo listino**: fornitore, eventuale sconto max %, flag "prezzi netti", bonus (opzionali).
2. Carica il file CSV/XLSX.
3. Cerca l'articolo dalla sezione **Cerca articolo** (filtra per fornitore se serve).
4. In tabella imposta quantità, sconti, margine, trasporto/installazione.
5. Condividi il preventivo via **WhatsApp** o esporta un **TXT**.

---

## Autore

**[Alessandro Pezzali](https://github.com/pezzaliapp)** — PezzaliAPP
📧 pezzalialessandro@gmail.com
🌐 https://www.alessandropezzali.it

---

## Licenza

[MIT](./LICENSE) — © PezzaliAPP
