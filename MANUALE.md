# ListinoHub — Manuale dell'utente

**L'app per commerciali che gestiscono più fornitori**

| | |
|---|---|
| **Versione app** | 1.0.0 |
| **Data manuale** | Aprile 2026 |
| **Autore** | PezzaliAPP |
| **URL live** | https://www.alessandropezzali.it/ListinoHub/ |
| **Repository** | https://github.com/pezzaliapp/ListinoHub |
| **Licenza** | MIT |

---

## Indice

1. [A chi serve e perché](#1-a-chi-serve-e-perché)
2. [Feature principali](#2-feature-principali)
3. [Primo avvio](#3-primo-avvio)
4. [Installazione sul telefono](#4-installazione-sul-telefono)
5. [Come deve essere fatto il file del listino](#5-come-deve-essere-fatto-il-file-del-listino)
6. [Caricare un listino](#6-caricare-un-listino)
7. [Cercare e aggiungere articoli](#7-cercare-e-aggiungere-articoli)
8. [Gestire il preventivo](#8-gestire-il-preventivo)
9. [Flag e opzioni avanzate](#9-flag-e-opzioni-avanzate)
10. [Esportare e condividere](#10-esportare-e-condividere)
11. [Backup e sicurezza dati](#11-backup-e-sicurezza-dati)
12. [Casi d'uso pratici](#12-casi-duso-pratici)
13. [Domande frequenti (FAQ)](#13-domande-frequenti-faq)
14. [Supporto e contatti](#14-supporto-e-contatti)
15. [Glossario](#15-glossario)

---

## 1. A chi serve e perché

### Il destinatario tipico

Questo manuale si rivolge a:

- **Agenti di commercio** e **rappresentanti plurimandato**, che distribuiscono prodotti di più fornitori;
- **Commerciali interni** di piccole e medie imprese che rivendono attrezzature, ricambi, materiali da più marchi;
- **Responsabili vendite** che preparano preventivi rapidi per clienti industriali, artigiani, cantieri;
- **Tecnici commerciali** in fiera, in visita, in cantiere.

Se il tuo lavoro quotidiano è **cercare un articolo in uno dei tanti listini che ricevi dai fornitori, applicare lo sconto giusto e mandare un preventivo al cliente**, ListinoHub è pensata per te.

### Il problema che ListinoHub risolve

Ogni fornitore manda i listini in un **formato diverso**: alcuni in Excel, altri in CSV, alcuni con prezzi lordi da scontare, altri già netti "chiusi". Quando ti arriva la richiesta di un cliente, devi:

1. Trovare il file giusto tra decine salvati in cartelle, Drive, email;
2. Cercare l'articolo a mano, scorrendo centinaia di righe;
3. Applicare lo sconto corretto — diverso per fornitore, a volte anche per categoria;
4. Calcolare margine e totale senza sbagliare un calcolo a mente o con la calcolatrice;
5. Riscrivere tutto in un messaggio WhatsApp o email e mandare.

E tutto questo spesso **dal telefono**, in cantiere, in fiera, in macchina, **senza rete mobile affidabile**.

### Come ListinoHub ti semplifica la vita

- **Tutti i listini in un unico posto**, cercabili in un secondo per codice o descrizione;
- **Funziona offline**: una volta aperta con rete, resta installata sul tuo telefono e puoi usarla senza connessione;
- **Regole di sconto per fornitore** già pre-caricate — l'app ti avvisa se stai andando oltre il limite autorizzato;
- **Preventivo pronto in 30 secondi**, condiviso via WhatsApp o salvato come file TXT;
- **I tuoi dati restano sul tuo dispositivo**: nessun server, nessun cloud, nessuna condivisione con terzi.

---

## 2. Feature principali

- 📋 **Gestione multi-listino** — importa tutti i listini dei tuoi fornitori da CSV o Excel, senza limiti di numero;
- 🏷️ **Organizzazione per fornitore** — ogni articolo è etichettato con il suo fornitore, sempre visibile;
- 🔍 **Ricerca istantanea** su tutti i listini contemporaneamente, filtrabile per fornitore;
- 💰 **Sconti a cascata** — primo sconto, secondo sconto, sconto cliente alternativo, margine commerciale;
- 🚦 **Limite sconto autorizzato** — imposta un massimo per fornitore, l'app ti avvisa quando lo superi;
- 🧾 **Prezzi netti** — per i listini "chiusi" (già netti), sconti e margine sono bloccati automaticamente;
- 🎁 **Bonus e fidelizzazione** — buoni carburante, punti fedeltà accumulati in automatico nel preventivo;
- 🚚 **Costi accessori** — trasporto e installazione gestiti per riga;
- 📱 **Funziona offline (PWA)** — installabile come app sul telefono, nessuno store, nessun download di app;
- 📤 **Export TXT e WhatsApp** — preventivo condivisibile in un tap;
- 💾 **Backup e ripristino** — salva tutto in un file JSON, ripristina su un altro dispositivo.

---

## 3. Primo avvio

### Aprire l'app dal browser

Apri il browser del dispositivo (Chrome, Safari, Edge o Firefox) e vai su:

> **https://www.alessandropezzali.it/ListinoHub/**

[SCREENSHOT: schermata di benvenuto con header rosso/antracite "ListinoHub"]

La prima volta che apri l'app la vedi **vuota**: nessun listino caricato. Ti vengono proposte tre sezioni:

1. **Nuovo listino** — per importare il primo file;
2. **Listini caricati** — dove compariranno i listini man mano che li importi;
3. **Cerca articolo** — al momento vuota, si popola dopo il primo import.

[SCREENSHOT: app vuota con messaggio "Nessun listino caricato. Importa il primo file per iniziare."]

### Cosa fare al primo utilizzo

1. Installa l'app sul telefono (sezione successiva);
2. Prepara il primo listino in formato corretto (sezione 5);
3. Importa il listino (sezione 6);
4. Verifica il numero di articoli caricati;
5. Fai una ricerca di prova.

---

## 4. Installazione sul telefono

ListinoHub è una **PWA** (app web installabile): non la scarichi dallo store, la installi direttamente dal browser. Funziona sia su iPhone sia su Android.

### iPhone / iPad (Safari)

1. Apri **Safari** e vai su `https://www.alessandropezzali.it/ListinoHub/`;
2. Tocca il pulsante **Condividi** (il quadrato con la freccia verso l'alto, in basso al centro);
3. Scorri verso il basso nel menu fino a trovare **"Aggiungi alla schermata Home"**;
4. Conferma il nome (ListinoHub) e tocca **Aggiungi** in alto a destra;
5. L'icona rossa/nera con la "L" comparirà sulla tua schermata Home, come una vera app.

[SCREENSHOT: iOS — menu condividi con voce "Aggiungi alla schermata Home"]

**Importante:** su iPhone l'installazione funziona **solo da Safari**. Chrome o altri browser iOS non hanno il pulsante.

### Android (Chrome o Edge)

1. Apri **Chrome** e vai su `https://www.alessandropezzali.it/ListinoHub/`;
2. Tocca il menu a tre puntini in alto a destra;
3. Seleziona **"Installa app"** (oppure "Aggiungi a schermata Home");
4. Conferma e l'icona ListinoHub comparirà nel drawer delle app e sulla Home.

[SCREENSHOT: Android — menu Chrome con voce "Installa app"]

In alcuni casi Chrome mostra un banner automatico **"Installa ListinoHub"** in fondo allo schermo: tocca **Installa** e il gioco è fatto.

### Desktop (PC o Mac)

Su Chrome o Edge desktop trovi l'icona **+** nella barra degli indirizzi (sul lato destro): cliccala, conferma e ListinoHub diventa una finestra dedicata.

### Dopo l'installazione

L'app funziona **offline**: una volta aperta almeno una volta con rete, resta nel tuo dispositivo con tutti i listini e le preferenze. Puoi usarla anche senza connessione — in cantiere, in fiera, in macchina.

Gli aggiornamenti sono automatici: ogni volta che apri l'app con rete, se c'è una nuova versione si scarica e si installa in pochi secondi.

---

## 5. Come deve essere fatto il file del listino

> **Questa è la sezione più importante del manuale.** Se il file non è preparato bene, l'app non legge i prezzi, non trova i codici e il preventivo è sbagliato. Dedica 5 minuti a leggere con attenzione: ti risparmia ore di lavoro più avanti.

### 5.1 Formati accettati

ListinoHub accetta:

- **Excel**: `.xlsx`, `.xls`
- **CSV**: `.csv` (separatore virgola `,`, punto e virgola `;` o tabulazione — riconosciuto automaticamente)

**Regola per Excel:** **un solo foglio di lavoro** per file. Se il tuo file ha più fogli (Foglio1, Foglio2, ecc.), l'app legge **solo il primo**. Prima di importare, sposta il listino sul primo foglio oppure salva un file nuovo con solo il foglio che ti serve.

### 5.2 Colonne obbligatorie

Il file **deve avere almeno queste 3 colonne**, in qualsiasi ordine:

| Colonna | Cosa contiene | Esempio |
|---------|---------------|---------|
| **Codice** | Codice articolo del fornitore | `COM-400` |
| **Descrizione** | Descrizione del prodotto | `Compressore 400L 3HP trifase` |
| **Prezzo** | Prezzo di listino in euro | `1250,00` |

L'app riconosce **automaticamente** i nomi delle intestazioni (maiuscole e minuscole non contano). I nomi riconosciuti sono:

**Colonna Codice** — l'intestazione deve contenere una di queste parole:

| Riconosciute | Esempi validi |
|---|---|
| `codice` | "Codice", "Codice articolo", "CODICE" |
| `code` | "Code", "Item code", "Product code" |
| `cod` | "Cod.", "Cod art.", "Cod. fornitore" |

**Colonna Descrizione** — l'intestazione deve contenere una di:

| Riconosciute | Esempi validi |
|---|---|
| `descriz` | "Descrizione", "Descriz.", "DESCRIZIONE" |
| `desc` | "Desc.", "Description" |
| `art` | "Art.", "Articolo" |

**Colonna Prezzo** — l'intestazione deve contenere una di:

| Riconosciute | Esempi validi |
|---|---|
| `prezzo` | "Prezzo", "Prezzo lordo", "Prezzo listino" |
| `price` | "Price", "List price" |
| `listino` | "Listino", "Prezzo a listino" |
| `netto` | "Netto", "Prezzo netto" |

### 5.3 Esempio di file CORRETTO

Ecco un file perfetto per ListinoHub:

| Codice | Descrizione | Prezzo |
|--------|-------------|--------|
| COM-400 | Compressore 400L 3HP trifase | 1250,00 |
| COM-200 | Compressore 200L 2HP monofase | 780,00 |
| ACC-01 | Tubo aria gomma 10m | 45,50 |
| ACC-02 | Raccordo rapido 1/4 G | 8,90 |

La **prima riga** contiene le intestazioni (Codice / Descrizione / Prezzo).
Dalla **seconda riga in poi** ci sono i dati, uno per riga.
Ogni riga ha **tutti e tre i valori valorizzati**.

Puoi anche aggiungere colonne opzionali che ListinoHub riconosce:

| Codice | Descrizione | Prezzo | Trasporto | Installazione |
|--------|-------------|--------|-----------|---------------|
| COM-400 | Compressore 400L 3HP | 1250,00 | 80,00 | 150,00 |

Le colonne **Trasporto** e **Installazione** vengono riconosciute se contengono nell'intestazione `trasport` / `transport` (es. "Trasporto", "Costo trasporto") o `install` (es. "Installazione", "Installation"). Se non ci sono, non è un problema: i costi accessori si inseriscono manualmente nel preventivo.

### 5.4 Esempi di file SBAGLIATI e come correggerli

Queste sono le sei situazioni più frequenti. Per ogni caso trovi il problema e la soluzione.

#### Errore 1 — Intestazioni nella riga sbagliata

**Sintomo:** L'app carica un numero di articoli sbagliato, o nessuno.

**Problema:** Molti fornitori mettono nelle prime righe del file un logo, il titolo "LISTINO 2026", una nota di validità, un recapito. La vera tabella parte solo alla riga 4 o 5.

Esempio di file **sbagliato**:

| A | B | C |
|---|---|---|
| FORNITORE XYZ | | |
| Listino 2026 in vigore dal 01/01 | | |
| | | |
| Codice | Descrizione | Prezzo |
| COM-400 | Compressore... | 1250,00 |

ListinoHub legge la **prima riga** come intestazione. Nel caso sopra legge "FORNITORE XYZ" come intestazione → non riconosce nulla → fa il fallback sulle prime 3 colonne → sbaglia a importare.

**Soluzione:** Apri il file in Excel, **elimina tutte le righe sopra l'intestazione vera**. La riga 1 deve essere `Codice | Descrizione | Prezzo`. Salva e re-importa.

#### Errore 2 — Prezzi scritti in modo strano

**Sintomo:** L'app carica gli articoli ma i prezzi risultano 0, oppure tagliati, oppure con virgola/punto sbagliato.

**Problema:** I prezzi possono essere scritti in modi che confondono la lettura:

- `€ 1.250,00` o `1.250,00 €` → il simbolo `€` nella cella può dare problemi;
- `1,250.00` (stile inglese: virgola per le migliaia, punto per i decimali) → l'app italiana può leggere `1,250` come 1 virgola 250;
- celle con solo testo `N/D`, `su richiesta`, `-` → articolo saltato;
- celle vuote → articolo saltato;
- spazi extra `  1250,00  ` → OK, vengono ripuliti automaticamente.

**Soluzione:**

1. Seleziona tutta la colonna prezzo → tasto destro → **Formato celle** → **Numero**, senza simbolo valuta;
2. Usa la **virgola** come separatore decimale (stile italiano: `1250,00`);
3. **Non mettere** il simbolo `€` dentro la cella (al massimo mettilo come formato di visualizzazione, non come testo);
4. Verifica che tutte le celle prezzo contengano **solo numeri**, non testo come "su richiesta".

#### Errore 3 — Più colonne "prezzo" nel file

**Sintomo:** I prezzi caricati sono sbagliati (tutti al ribasso o al rialzo rispetto al listino reale).

**Problema:** Alcuni listini hanno più colonne prezzo: "Prezzo Acquisto", "Prezzo Listino", "Prezzo al pubblico", "Prezzo Promo". ListinoHub prende la **prima** colonna il cui nome contiene `prezzo`, `price`, `listino` o `netto`. Se "Prezzo Acquisto" è prima di "Prezzo Listino", l'app prende il prezzo d'acquisto (sbagliato).

Esempio problematico:

| Codice | Descrizione | Prezzo Acquisto | Prezzo Listino |
|---|---|---|---|
| COM-400 | Compressore... | 620,00 | 1250,00 |

ListinoHub prenderà 620,00 (il primo match su `prezzo`).

**Soluzione:**

- Opzione A — **Elimina** la colonna "Prezzo Acquisto" prima di importare;
- Opzione B — **Rinomina** la colonna che vuoi ignorare con un nome senza le parole chiave: "Note costo" invece di "Prezzo Acquisto";
- Opzione C — **Sposta** la colonna del prezzo corretto come prima colonna prezzo da sinistra a destra.

#### Errore 4 — Celle unite (merged cells)

**Sintomo:** L'app carica le righe in modo caotico, descrizioni vuote, prezzi sbagliati.

**Problema:** In Excel è possibile unire più celle in una sola (merged cells), tipicamente per fare intestazioni di sezione o raggruppare categorie. ListinoHub non gestisce bene le celle unite: vede il valore solo nella prima e le altre restano vuote.

**Soluzione:**

1. Seleziona tutto il foglio (Ctrl+A / Cmd+A);
2. Menu **Formato** → **Unisci celle** → **Separa celle**;
3. Se serve, copia manualmente i valori nelle celle rimaste vuote.

#### Errore 5 — Righe di categoria/raggruppamento

**Sintomo:** Numero articoli caricato inferiore a quello che ti aspetti, ricerche che non trovano voci intermedie.

**Problema:** Molti listini hanno righe "decorative" per separare categorie, tipo:

| Codice | Descrizione | Prezzo |
|---|---|---|
| | **=== ATTREZZATURE PNEUMATICHE ===** | |
| COM-400 | Compressore 400L | 1250,00 |
| COM-200 | Compressore 200L | 780,00 |
| | **=== ACCESSORI ===** | |
| ACC-01 | Tubo aria 10m | 45,50 |

Le righe di categoria non hanno né codice né prezzo → ListinoHub le salta silenziosamente. Questo normalmente va bene, ma se sono **tante** righe saltate rispetto alle attese potresti avere un listino con informazioni importanti perse.

**Soluzione:** Se preferisci che ogni voce sia importata, **elimina le righe di categoria** o trasformale in articoli veri con un codice fittizio (es. `---CAT-01---`) — ma di solito è più pulito **eliminarle**.

#### Errore 6 — Codici numerici che diventano numeri in Excel

**Sintomo:** Codici come `00123` caricati come `123`, con gli zeri iniziali persi.

**Problema:** Excel tratta di default i valori che sembrano numeri come numeri, e rimuove gli zeri iniziali non significativi. `00123` → `123`. `01` → `1`.

**Soluzione:** Prima di inserire i codici:

1. Seleziona la colonna Codice;
2. Tasto destro → **Formato celle** → **Testo**;
3. Ora puoi inserire `00123` e Excel lo conserva tale e quale.

In alternativa, metti un **apostrofo** davanti al codice nella singola cella: `'00123` → Excel lo tratta come testo e mostra `00123`.

### 5.5 Cosa succede se l'app NON riconosce le intestazioni

Se ListinoHub non trova nessuna delle parole chiave riconosciute nelle intestazioni:

1. Mostra un **toast arancione** di avviso:
   > "Header non riconosciuti: uso le prime 3 colonne (codice, descrizione, prezzo). Verifica il file."
2. **Prende le prime tre colonne** da sinistra: A = Codice, B = Descrizione, C = Prezzo;
3. Inizia a leggere dalla **prima riga** (senza saltare intestazione).

**Se questo comportamento è giusto per il tuo file** (le prime 3 colonne sono davvero quelle), l'import funziona.
**Se è sbagliato** (colonne in ordine diverso, oppure c'è davvero un'intestazione in riga 1), l'import sarà sbagliato: rivedi il file seguendo la sezione 5.4 e re-importa.

### 5.6 Suggerimento — Prepara un file template

La cosa più veloce per evitare problemi è preparare **una sola volta** un file modello pulito e riusarlo per tutti i fornitori.

Crea un file `template-listino.xlsx` così:

| Codice | Descrizione | Prezzo | Trasporto | Installazione |
|--------|-------------|--------|-----------|---------------|

Lascialo vuoto (solo le intestazioni). Quando ricevi un listino nuovo da un fornitore:

1. Apri il template, salva una copia con il nome del fornitore (es. `cormach-2026.xlsx`);
2. Copia i dati dal file del fornitore nelle colonne giuste;
3. Importa in ListinoHub.

Ci metti 2 minuti per listino, ma il risultato è pulito al 100%.

### 5.7 Listini a prezzo netto

Alcuni fornitori ti mandano il listino con **prezzi già netti** — cioè il prezzo in listino è il prezzo finale concordato, non c'è più margine di sconto.

**Quando usarlo:** tipicamente per forniture a condizioni chiuse, accordi quadro, prezzi "da catalogo netto".

**Come gestirlo in ListinoHub:**

1. Prima di caricare il file, **attiva la casella "Listino a prezzi netti"** nel form di import;
2. L'app marca tutti gli articoli di quel listino come **non scontabili**;
3. Quando aggiungi un articolo netto al preventivo:
   - I campi **Sc.1 %**, **Sc.2 %**, **Sc.Cliente %** e **Marg. %** risultano **disabilitati** (grigi, non cliccabili);
   - Il prezzo di listino è automaticamente anche il prezzo finale;
   - Un badge blu "NETTO" compare sulla riga per ricordartelo;
4. I campi **Trasporto** e **Installazione** restano comunque modificabili (i costi accessori si possono sempre aggiungere).

**Importante:** il flag "prezzi netti" è **immutabile** dopo l'import. Se hai importato un listino come "non netto" e poi scopri che era netto, devi **cancellare il listino e re-importarlo** con il flag attivo.

Questo design evita il rischio più grave: applicare per errore uno sconto su un prezzo già netto, e mandare al cliente un preventivo sotto costo.

---

## 6. Caricare un listino

### Passaggi per l'import

1. Vai nella sezione **Nuovo listino** (la prima della pagina);
2. Compila i campi **prima** di selezionare il file:

   | Campo | Obbligatorio | Descrizione |
   |-------|--------------|-------------|
   | **Fornitore** | Sì | Il nome del fornitore (es. "Cormach", "Pippo", "Pluto") |
   | **Sconto max commerciale %** | No | Sconto massimo che sei autorizzato a fare per questo fornitore (0 = nessun limite) |
   | **Listino a prezzi netti** | No | Attiva se il fornitore ti manda già prezzi finali (vedi 5.7) |
   | **Bonus — tipo** | No | Tipo di bonus associato (es. "buoni carburante", "punti fedeltà") |
   | **Bonus — valore per pezzo** | No | Quanto bonus accumuli per ogni pezzo venduto |

3. Tocca **File listino** e seleziona il file dal tuo dispositivo;
4. L'app importa immediatamente e mostra un toast verde:
   > `Listino "Cormach" importato: 342 articoli.`

[SCREENSHOT: form nuovo listino compilato con Cormach, sconto max 20%, file selezionato]

### Verifica dopo l'import

Subito dopo, controlla:

- Il **numero di articoli** importati (mostrato sia nel toast sia nella card del listino). Se è molto diverso da quello che ti aspetti, probabilmente hai un problema di formato (vedi sezione 5.4);
- La sezione **Listini caricati** mostra una card con: nome fornitore, data import, numero articoli, eventuali chip di stato (netto / sconto max / bonus);
- Fai una ricerca di prova: cerca un codice che sai essere nel listino e verifica che compaia con prezzo corretto.

### Listino con fornitore già esistente (conflitto)

Se provi a caricare un listino con un **nome fornitore già presente**, l'app apre una finestra con tre scelte:

| Scelta | Cosa fa |
|--------|---------|
| **Aggiorna (sostituisci)** | Elimina il vecchio listino di quel fornitore e lo rimpiazza con il nuovo |
| **Aggiungi come separato** | Crea un secondo listino con lo stesso nome fornitore (utile per versioni diverse, es. "Cormach 2025" vs "Cormach 2026" — in tal caso rinomina dopo) |
| **Annulla** | Non fa nulla, torna alla schermata principale |

[SCREENSHOT: popup "Fornitore già presente" con 3 pulsanti]

**Caso tipico — aggiornamento annuale:** a gennaio il fornitore manda il listino 2026, tu scegli "Aggiorna (sostituisci)" e il listino 2025 viene sostituito.

**Caso tipico — versioni parallele:** stai lavorando contemporaneamente su due versioni di listino (una standard, una promozione), scegli "Aggiungi come separato" e poi vai nelle impostazioni del listino per rinominare uno dei due ("Cormach Promo Q2").

### Gestione dei listini caricati

Nella sezione **Listini caricati** ogni card ha tre pulsanti:

- **Rinomina** — cambia il nome fornitore (anche negli articoli già aggiunti al preventivo);
- **Impostazioni** — modifica nome, sconto max, tipo e valore bonus (non il flag "prezzi netti" che è immutabile);
- **Elimina** — cancella il listino. Se ha righe nel preventivo, ti chiede se rimuoverle o lasciarle come voci "orfane".

---

## 7. Cercare e aggiungere articoli

### Filtro per fornitore

Sopra la barra di ricerca c'è il menu a tendina **Filtra per fornitore**:

- **Tutti i fornitori** (default) → cerca in tutti i listini caricati;
- **[Nome fornitore]** → restringe la ricerca al singolo fornitore.

Usa il filtro quando sai già da quale marchio vuoi ordinare, velocizzi la ricerca.

### Barra di ricerca

Scrivi nella casella **Cerca**:

- Un **codice** (anche parziale): es. `COM-40` trova `COM-400` e `COM-400-X`;
- Una parola della **descrizione**: es. `compressore` trova tutti i compressori;
- Maiuscole e minuscole non contano.

I risultati compaiono nel menu a tendina sotto, fino a un massimo di 500 voci. Se non vedi quello che cerchi, raffina la ricerca con più parole.

Ogni riga del risultato è formattata così:

```
[Fornitore] CODICE — Descrizione — €prezzo
```

Esempio:

```
[Cormach] COM-400 — Compressore 400L 3HP trifase — €1250,00
```

### Articoli con codici duplicati tra fornitori

Se due fornitori usano lo stesso codice articolo, **entrambi compaiono** nei risultati con il prefisso `[Fornitore]` che li distingue. È una feature: non è un errore, non è un duplicato da eliminare.

Esempio:

```
[Cormach] AB-100 — Compressore piccolo — €400,00
[Pippo]   AB-100 — Chiave inglese 30mm — €18,50
```

Scegli quello giusto dal menu.

### Aggiungere un articolo al preventivo

1. Seleziona l'articolo dal menu a tendina **Risultati**;
2. Tocca il pulsante rosso **Aggiungi articolo**;
3. L'articolo compare nella tabella **Articoli aggiunti**, con quantità 1, sconti 0, margine 0, costi accessori ereditati dal listino (se presenti).

### Aggiungere un articolo manuale (fuori listino)

Se il cliente chiede qualcosa **che non è in nessun listino** (ricambio speciale, servizio extra):

1. Tocca **Aggiungi manuale**;
2. Compila i campi direttamente nella riga vuota che appare;
3. Conferma con ✅ o annulla con ❌.

L'articolo manuale viene aggiunto senza fornitore specifico (etichetta "—") e senza controllo sconto max.

---

## 8. Gestire il preventivo

Nella sezione **Articoli aggiunti** ogni riga è completamente modificabile. Su desktop vedi una tabella, su smartphone ogni riga diventa una **scheda verticale** con le etichette a sinistra e i campi a destra.

### I campi di ogni riga

| Campo | Cosa è |
|-------|--------|
| **Codice** | Codice del fornitore (non modificabile) |
| **Fornitore** | Nome del fornitore, etichetta di provenienza |
| **Descrizione** | Descrizione del prodotto (non modificabile) |
| **P. Lordo** | Prezzo di listino di partenza (non modificabile) |
| **Sc.1 %** | Primo sconto percentuale sul prezzo lordo |
| **Sc.2 %** | Secondo sconto percentuale sul prezzo già scontato |
| **Sc.Cliente %** | Sconto unico alternativo (visibile solo se attivi la modalità Sc.Cliente — vedi sezione 9) |
| **Marg. %** | Margine/ricarico applicato dopo gli sconti |
| **Totale** | Prezzo netto unitario (calcolato dopo sconti e margine, senza servizi) |
| **Trasp.** | Costo trasporto per singolo pezzo |
| **Inst.** | Costo installazione per singolo pezzo |
| **Qtà** | Quantità |
| **Tot.** | Totale riga = (Prezzo netto + Trasp. + Inst.) × Qtà |
| **Vend.€** | Prezzo "realmente venduto" (campo libero, per confrontare con il listino) |
| **Diff.** | Differenza tra venduto e totale calcolato |
| **Az.** | Pulsante rosso **Rimuovi** per eliminare la riga |

### Esempio pratico di calcolo

Articolo: Compressore 400L, prezzo lordo **1.000,00 €**.

Imposti **Sc.1 = 20%**, **Sc.2 = 10%**, **Margine = 0%**, **Trasporto = 50 €**, **Qtà = 2**.

- Dopo Sc.1: 1.000,00 × (1 − 0,20) = **800,00 €**
- Dopo Sc.2: 800,00 × (1 − 0,10) = **720,00 €** (prezzo netto unitario)
- Con margine 0%: resta **720,00 €** (prezzo venduto unitario)
- Con trasporto: 720,00 + 50,00 = **770,00 €**
- Totale riga: 770,00 × 2 = **1.540,00 €**

### Cosa succede se supero lo sconto max autorizzato

Se in fase di importazione hai impostato uno **sconto max commerciale** per quel fornitore (es. 20%), ListinoHub controlla automaticamente:

1. Lo **sconto equivalente totale** della riga (combinando Sc.1, Sc.2, Sc.Cliente e Margine);
2. Se supera il limite del fornitore, ListinoHub:
   - **Evidenzia in rosso/arancio** le celle di sconto della riga;
   - **Mostra un toast di avviso**:
     > `⚠ Sconto 35% oltre il limite per Cormach (max 20%)`
   - **Non blocca** l'operazione: puoi comunque salvare il preventivo;
   - **Marca internamente la riga** come "richiede approvazione";
3. Se esporti il TXT con almeno una riga oltre il limite, in fondo al file compare:
   > `⚠ ATTENZIONE: Questo preventivo contiene sconti oltre i limiti autorizzati per uno o più fornitori. Richiede approvazione del responsabile.`

[SCREENSHOT: riga con celle sconto in arancione e toast di warning in basso]

In pratica: il commerciale può sempre chiudere l'offerta che serve, ma il capo area ha **traccia scritta** che c'è un over-sconto da firmare.

### Articoli da listini "prezzi netti"

Se aggiungi al preventivo un articolo proveniente da un listino **netto**:

- I campi **Sc.1 %**, **Sc.2 %**, **Sc.Cliente %**, **Marg. %** sono **grigi e non editabili**;
- Un badge **NETTO** compare vicino al nome fornitore;
- Il prezzo totale è semplicemente `P. Lordo × Qtà + Trasporto + Installazione`.

Se provi a modificare i campi bloccati, non succede nulla. È volontario: evita errori.

---

## 9. Flag e opzioni avanzate

Nella sezione **Articoli aggiunti** trovi un pannello **Modalità Preventivo / Ordine** con diverse caselle di spunta. Ecco cosa fanno.

### Modalità Cliente (Smart)

Quando la attivi:

- Nasconde il **Prezzo Lordo** nella tabella (il cliente non deve vedere il tuo prezzo di partenza);
- Nasconde **Margine**, **Vend.€**, **Diff.** e i dettagli **Sc.1 / Sc.2**;
- Nel TXT genera un report pulito, orientato al cliente, con descrizione + quantità + netto/cadauno + totale riga + riepilogo imponibile/IVA.

**Quando usarla:** quando stai per condividere il preventivo direttamente con il cliente via WhatsApp o email.

### Mostra IVA

Attiva per aggiungere il calcolo IVA nei totali e nel report:

- Nei **Totali** compaiono: imponibile, IVA, totale con IVA;
- Nel TXT il riepilogo contiene le tre righe.

### IVA %

Campo di testo per modificare la percentuale IVA. Default: **22**. Puoi cambiarla per aliquote ridotte (10, 4, 0).

### Ometti "Vend.€" / Ometti "Diff."

Nascondono le colonne "Venduto A €" e "Differenza" sia nella tabella sia nel report TXT. Utile se non usi mai quei campi per confronto.

### Ometti Sc.1/Sc.2 nel report

Nasconde le percentuali di sconto nel TXT. Utile per fornire al cliente solo i prezzi finali, senza rivelare lo sconto applicato (tipico per listini riservati).

### Attiva "Sc.Cliente"

Cambia completamente la modalità di gestione sconto:

- Al posto di Sc.1 + Sc.2 + Margine, usi **un solo sconto** "Sc.Cliente %";
- L'app calcola automaticamente lo sconto cliente **equivalente** al prezzo già ottenuto con Sc.1 + Sc.2 + Margine (invariato);
- Da lì in poi modifichi solo Sc.Cliente, più semplice per contrattare con il cliente.

Esempio: prezzo 1.000 €, Sc.1 20%, Sc.2 10%, Margine 0% → prezzo venduto 720 €. Equivalente: sconto unico del **28%**. Attivando "Sc.Cliente" il campo mostra 28% e puoi ritoccarlo a 25% o 30% direttamente, senza calcolare a mente la combinazione di due sconti.

**Quando usarla:** quando la trattativa col cliente è "di quanto sconto mi fai?" e vuoi un singolo numero da discutere.

### Riepilogo sconto equivalente

Nella sezione smart, in basso, vedi sempre:
> `Sconto eq. cliente: 22,45%`

È lo sconto medio applicato sull'intero preventivo (totale finale vs totale lordo). Ti aiuta a capire se stai facendo un'offerta aggressiva o conservativa senza dover rifare i conti.

---

## 10. Esportare e condividere

Nella sezione **Report articoli** trovi quattro pulsanti.

### Genera TXT

Scarica un file di testo `.txt` con il preventivo completo. Contenuto:

```
Report Articoli:

1. Codice: COM-400
Fornitore: Cormach
Descrizione: Compressore 400L 3HP trifase
Prezzo netto: 720,00€
Sconto 1: 20%
Sconto 2: 10%
Quantità: 2
Trasporto: 50,00€
Installazione: 0,00€
Totale: 1540,00€

[...altri articoli...]

Totale Netto (senza Trasporto/Installazione): 1440,00€
Totale Complessivo (inclusi Trasporto/Installazione): 1540,00€

Bonus accumulati: € 10,00 in buoni carburante | 20 punti fedeltà

⚠ ATTENZIONE: Questo preventivo contiene sconti oltre i limiti autorizzati per uno o più fornitori. Richiede approvazione del responsabile.
```

Puoi aprirlo in qualsiasi editor di testo (Note, WordPad, TextEdit), allegarlo a email, stamparlo.

### Invia WhatsApp

Prepara lo stesso contenuto e apre **WhatsApp Web** (o l'app se sei da telefono) con il messaggio già pronto. Tu scegli il destinatario e invii.

- Su **iPhone**: apre WhatsApp direttamente con il messaggio precompilato;
- Su **Android**: apre WhatsApp Web, puoi scegliere il contatto;
- Su **desktop senza WhatsApp**: apre la versione web in un tab del browser.

### WA (No Margine) e TXT (No Margine)

Stesse funzioni, ma il report **non mostra** le percentuali Sc.1 / Sc.2 / Margine se hai attivato "Ometti sconti nel report", e in modalità Cliente (Smart) produce un riepilogo particolarmente pulito.

Usali quando mandi il preventivo direttamente al **cliente finale** e non vuoi rivelare la struttura degli sconti interni.

### Warning approvazione nel report

Se almeno una riga supera il limite di sconto, il report (qualsiasi variante) chiude con:

> `⚠ ATTENZIONE: Questo preventivo contiene sconti oltre i limiti autorizzati per uno o più fornitori. Richiede approvazione del responsabile.`

È lì perché chi riceve il preventivo (il tuo capo area, il direttore commerciale) sa che va controfirmato prima di essere inviato al cliente.

### Bonus accumulati nel report

Se il preventivo contiene articoli con bonus, compare una riga dedicata:

- Tipo con "buoni carburante", "euro", "€" → `€ 45,00 in buoni carburante`
- Tipo con "punti fedeltà" → `120 punti fedeltà` (intero, senza €)
- Altri tipi (generici) → `45,00 gettoni` (numero decimale + tipo)

Più tipi diversi sono separati da `|`:

> `Bonus accumulati: € 45,00 in buoni carburante | 120 punti fedeltà`

---

## 11. Backup e sicurezza dati

### Dove sono salvati i dati

**Tutti i dati di ListinoHub stanno sul tuo dispositivo.**

- Nessun server esterno;
- Nessun cloud;
- Nessuna registrazione account;
- Nessuna condivisione con terzi.

Quello che hai caricato sul tuo telefono resta sul tuo telefono. Se formatti il telefono o cancelli l'app, i dati sono persi. Per questo esiste il backup JSON.

### Esporta backup JSON

Vai nella sezione **Backup** in fondo alla pagina. Tocca **Esporta backup JSON**:

- Viene scaricato un file chiamato `listinohub-backup-YYYY-MM-DD.json`;
- Contiene: **tutti i listini**, le **preferenze smart** (IVA, modalità cliente, ecc.), il **preventivo corrente**;
- Conservalo in una cartella sicura (Drive, Dropbox, email a te stesso).

**Quando farlo:**

- **Settimanale**: buona pratica per chi usa l'app intensivamente;
- **Dopo aver importato listini nuovi**: non perdere un import di 10.000 articoli per una disattenzione;
- **Prima di cambiare telefono**: obbligatorio;
- **Prima di un aggiornamento grosso dell'app**: precauzione.

### Importa backup JSON

Sul nuovo dispositivo (o dopo un reset):

1. Installa ListinoHub sul telefono (vedi sezione 4);
2. Apri l'app e vai su **Backup** → **Importa backup JSON**;
3. Seleziona il file `listinohub-backup-YYYY-MM-DD.json`;
4. Compare una richiesta di conferma:
   > `Sostituire i dati attuali con il backup? Backup contiene: 12 listini, 48 righe preventivo. Verranno SOVRASCRITTI i listini e il preventivo correnti.`
5. Tocca **OK**: in pochi secondi tutto è ripristinato.

### Cosa NON viene salvato nel backup

- Eventuali impostazioni del dispositivo (notifiche, ecc.);
- La cache offline dell'app (si ricostruisce da sola alla prima apertura);
- Dati esterni (es. messaggi WhatsApp inviati, email).

### Privacy

ListinoHub **non invia dati a nessun server esterno**. Non c'è analytics, non c'è tracking, nessuna telemetria. I due indirizzi esterni a cui si connette sono:

- `cdnjs.cloudflare.com` e `cdn.jsdelivr.net` — solo per scaricare le librerie di lettura file (CSV / Excel) **una volta**, al primo avvio. Dopo sono in cache e non serve più connessione.

Ogni tuo listino, ogni tuo cliente, ogni tuo preventivo, resta privato e solo tuo.

---

## 12. Casi d'uso pratici

Tre scenari reali di utilizzo, per mostrarti come si lavora davvero con ListinoHub.

### Scenario A — "Cliente in cantiere senza rete"

**Mario** è agente commerciale per un fornitore di compressori (Cormach). È in cantiere con un cliente a 30 km dal paese più vicino, zero rete mobile. Il cliente gli chiede una quotazione al volo per 3 compressori.

Mario apre ListinoHub dal telefono (già installata come PWA, funziona offline):

1. Cerca "compressore 400" nella barra ricerca → compaiono 4 modelli;
2. Tocca **Aggiungi articolo** per il COM-400;
3. Imposta Qtà = 3;
4. Applica Sc.1 = 15%;
5. Aggiunge Trasporto = 80,00 €;
6. Totale calcolato in automatico: **2.567,50 €**;
7. Genera TXT e salva sul telefono.

Appena torna in zona con rete, tocca **Invia WhatsApp** e manda il preventivo al cliente.

**Tempo totale: 2 minuti.** Zero stress, zero errori di calcolo, zero ricerca nei file Excel.

### Scenario B — "Preventivo multi-fornitore"

**Laura** è responsabile vendite di un'azienda che distribuisce tre linee:

- **Cormach** — utensili e attrezzature pneumatiche (sconto max 25%);
- **Pippo Ricambi** — ricambi industriali a **prezzi netti** (nessuno sconto, no bonus);
- **Pluto Installazioni** — servizi chiavi in mano con bonus "buoni carburante" da 5 €/pezzo.

Il cliente vuole un'offerta completa: 2 compressori, 10 ricambi, 1 installazione.

Laura, dal PC, apre ListinoHub. Ha tutti e tre i listini già caricati:

1. Cerca "compressore" → trova il COM-400 di Cormach → aggiunge 2 pezzi → sconto 20% (entro il max);
2. Cerca i 10 codici di Pippo → li aggiunge uno a uno → i campi sconto/margine sono **bloccati automaticamente** (sono netti, non c'è rischio di errore);
3. Cerca l'installazione di Pluto → aggiunge 1 pezzo → applica sconto 10% + bonus 5 € per pezzo.

In fondo al preventivo compare:

```
Imponibile: 4.820,00€
IVA (22%): 1.060,40€
Totale + IVA: 5.880,40€

Bonus accumulati: € 5,00 in buoni carburante
```

Laura attiva **Modalità Cliente**, genera il TXT pulito, lo manda via email al cliente. Il cliente vede solo i prezzi finali puliti, non lo sconto applicato.

### Scenario C — "Sconto oltre soglia, richiesta approvazione"

**Giovanni** è commerciale nuovo in azienda. Vuole chiudere un ordine importante con un cliente storico e applica uno **sconto 35%** su un articolo Cormach (max autorizzato: 20%).

ListinoHub non blocca Giovanni:

- La cella Sc.1 diventa **arancione**;
- Compare un toast:
  > `⚠ Sconto 35% oltre il limite per Cormach (max 20%)`
- Lo sconto resta applicato, il totale si aggiorna;
- Internamente, la riga viene marcata come "richiede approvazione".

Giovanni genera il TXT e lo manda via WhatsApp al capo area, Marco. Il TXT in fondo contiene:

> `⚠ ATTENZIONE: Questo preventivo contiene sconti oltre i limiti autorizzati per uno o più fornitori. Richiede approvazione del responsabile.`

Marco vede la nota, verifica la marginalità, approva via WhatsApp con un messaggio. Giovanni può procedere con l'ordine sapendo che ha traccia dell'autorizzazione.

**Nessuno blocca la vendita, ma nessuna autorizzazione si perde.**

---

## 13. Domande frequenti (FAQ)

**D: Perdo i dati se cambio telefono o formatto?**
R: Sì, se non fai il backup. Usa la funzione **Esporta backup JSON** regolarmente (vedi sezione 11). È l'unica cosa che ti mette al riparo.

**D: ListinoHub funziona senza internet?**
R: Sì, una volta installata e aperta almeno una volta con rete, funziona completamente offline: ricerche, preventivi, export TXT. Serve rete solo per aprire WhatsApp al momento della condivisione.

**D: Posso avere più listini dello stesso fornitore?**
R: Sì. Quando importi il secondo, scegli "Aggiungi come separato". Puoi poi rinominarli ("Cormach 2025", "Cormach 2026 Q1") dalla sezione Impostazioni del listino.

**D: Posso cancellare un listino già caricato?**
R: Sì. Tocca il pulsante **Elimina** sulla card del listino. Se ci sono righe nel preventivo collegate a quel listino, l'app ti chiede se rimuoverle o lasciarle come voci "orfane".

**D: I miei listini sono visibili ad altri utenti o ai fornitori?**
R: No, mai. Tutti i dati stanno sul tuo dispositivo. Nessun server vede i tuoi file.

**D: Posso usare ListinoHub su PC?**
R: Sì. Apri il link `https://www.alessandropezzali.it/ListinoHub/` con Chrome, Edge, Safari o Firefox. Su Chrome/Edge puoi anche installarla come app desktop (icona "+" nella barra degli indirizzi).

**D: E se il cliente vuole un PDF invece del TXT?**
R: Genera il TXT, aprilo sul PC, copia il contenuto in un documento Word/Pages/Google Docs e salva come PDF. In futuro potrebbe arrivare l'export PDF diretto.

**D: Come aggiorno l'app quando esce una nuova versione?**
R: Automatico. Ogni volta che apri ListinoHub con rete, se c'è una nuova versione viene scaricata e applicata in pochi secondi. Potresti vedere la pagina ricaricarsi una volta: è normale.

**D: Il listino si carica ma nei risultati di ricerca non vedo i prezzi, o sono tutti a 0. Cosa succede?**
R: Il formato del file ha un problema nella colonna Prezzo. Vedi la sezione **5.4 — Errore 2** per le soluzioni.

**D: Il listino si carica ma il numero di articoli è molto più basso del previsto. Perché?**
R: Probabilmente ci sono righe di categoria vuote o intestazioni nella riga sbagliata. Vedi **5.4 — Errori 1 e 5**.

**D: I codici articolo tipo `00123` vengono caricati come `123`. Come li mantengo interi?**
R: Problema di Excel che li tratta come numeri. Vedi **5.4 — Errore 6** per la soluzione.

**D: Due fornitori hanno lo stesso codice. Come li distinguo?**
R: ListinoHub li mostra entrambi nei risultati con prefisso `[Fornitore]`. È una funzionalità voluta, non un bug. Scegli quello del fornitore giusto.

**D: Lo sconto max è solo un avviso o blocca davvero?**
R: Solo avviso. L'app non blocca mai l'operazione, ma evidenzia la cella, mostra un toast e scrive una nota di approvazione nel TXT finale. La scelta finale è sempre del commerciale.

**D: Posso aggiungere articoli non presenti in nessun listino?**
R: Sì, con il pulsante **Aggiungi manuale**. L'articolo viene aggiunto senza fornitore specifico e senza controllo sconto max.

**D: L'app salva automaticamente il preventivo se chiudo il browser?**
R: Il preventivo corrente resta in memoria tra una sessione e l'altra (se non pulisci la cache del browser). Per sicurezza, dopo un lavoro importante **esporta il backup**.

**D: Posso stampare il preventivo?**
R: Sì, apri il TXT scaricato e stampalo dal programma di testo del tuo dispositivo.

**D: Cosa vuol dire "PWA"?**
R: Progressive Web App — un'app web che si installa sul dispositivo e funziona offline. Vedi il **glossario** in sezione 15.

---

## 14. Supporto e contatti

### Autore e manutenzione

**PezzaliAPP** — Alessandro Pezzali
🌐 https://www.alessandropezzali.it
💻 https://github.com/pezzaliapp

### Licenza

ListinoHub è rilasciata con licenza **MIT**: puoi usarla, copiarla, modificarla, distribuirla liberamente, anche in contesti commerciali, citando la fonte. Il testo completo della licenza è nel file `LICENSE` della repository.

### Segnalare un bug o proporre miglioramenti

Apri una **issue** sulla repository GitHub:

> https://github.com/pezzaliapp/ListinoHub/issues

Descrivi il problema, indicando:

1. Dispositivo e browser (es. iPhone 15 + Safari, o PC Windows + Chrome);
2. Passaggi per riprodurre il problema;
3. Comportamento atteso vs comportamento osservato.

### Repository del codice

Se sei sviluppatore e vuoi contribuire:

> https://github.com/pezzaliapp/ListinoHub

Il codice è vanilla JavaScript, senza build step. Puoi modificarlo, forkare, adattarlo per la tua azienda.

### Novità future

ListinoHub è un progetto attivo. Alcune feature previste per il futuro (già annotate come "TODO" nel codice):

- Override del bonus riga per riga (oggi è ereditato dal listino);
- Export diretto in PDF;
- Sincronizzazione multi-dispositivo (opzionale, solo se richiesta);
- Anagrafica clienti con sconto fisso memorizzato;
- Password admin per proteggere impostazioni critiche.

---

## 15. Glossario

**Bonus fedeltà** — premio accumulato per il cliente, espresso in buoni carburante (euro), punti fedeltà (numero) o altri formati. In ListinoHub si imposta per listino e viene sommato automaticamente nel preventivo.

**CSV** (Comma-Separated Values) — formato di file di testo semplice, dove ogni riga è un record e i campi sono separati da virgole (o punto e virgola). Leggibile da qualsiasi programma, peso basso.

**Listino** — archivio di articoli di un fornitore, con codice, descrizione, prezzo. In ListinoHub è un insieme di righe importate da un file CSV o Excel, etichettato con un nome fornitore.

**Listino netto (a prezzi netti)** — listino dove i prezzi sono già finali, non più scontabili. Tipico degli accordi quadro o delle condizioni chiuse.

**Margine** — percentuale di guadagno commerciale che applichi **sopra** il prezzo netto. Prezzo venduto = Prezzo netto ÷ (1 − margine/100).
Esempio: prezzo netto 100 €, margine 20% → prezzo venduto 125 €.

**Prezzo lordo** — il prezzo di listino "ufficiale", prima di qualunque sconto.

**Prezzo netto** — il prezzo dopo aver applicato gli sconti (Sc.1 e Sc.2).

**PWA** (Progressive Web App) — applicazione web installabile sul dispositivo (telefono, tablet, PC) che funziona come un'app nativa, anche offline. Non passa dagli store (App Store / Play Store), la installi direttamente dal browser.

**Ricarico** — termine spesso usato come sinonimo di margine, ma in senso stretto il **ricarico** si calcola sul costo (es. ricarico 25% = costo + 25% del costo), mentre il **margine** si calcola sul prezzo finale (margine 25% = il 25% del prezzo venduto è guadagno). In ListinoHub la formula usata è quella del margine.

**Sconto a cascata** — applicazione di due o più sconti uno dopo l'altro, in sequenza. Sc.1 20% + Sc.2 10% su 1.000 € non fa 30% totale ma: 1.000 × 0,80 × 0,90 = 720 € (**28% equivalente**, non 30%).

**Sconto cliente (Sc.Cliente)** — sconto unico "equivalente" che sostituisce Sc.1 + Sc.2 + Margine mantenendo invariato il prezzo finale. Utile per negoziare con il cliente su un unico numero.

**Sconto equivalente** — percentuale di sconto che, applicata una sola volta sul prezzo lordo, darebbe lo stesso prezzo finale degli sconti combinati. Esempio: Sc.1 20% + Sc.2 10% → equivalente 28%.

**Sconto max commerciale** — limite massimo di sconto autorizzato che il commerciale può applicare in autonomia, senza firma del responsabile. Impostabile per fornitore in ListinoHub.

**Service Worker** — meccanismo tecnico che permette alla PWA di funzionare offline e di aggiornarsi automaticamente. L'utente non ci interagisce direttamente.

**TXT** (testo semplice) — formato file `.txt`, contiene solo testo senza formattazione grafica. Apribile ovunque, leggero, perfetto per condividere un preventivo su WhatsApp senza dipendere da PDF o Word.

**XLSX / XLS** — formati file di Microsoft Excel. XLSX è il formato moderno (dal 2007), XLS il formato storico. ListinoHub legge entrambi.

---

*Fine del manuale — ListinoHub v1.0.0 — Aprile 2026 — © PezzaliAPP — MIT License*
