/* =============================================================
   ListinoHub — app.js
   Fork di CSVXpressSmart: logica di calcolo invariata
   Aggiunte: multi-listino, fornitore, sconto max, prezzi netti,
             bonus fedeltà, warning approvazione, import XLSX.
   ============================================================= */

/* -------------------- SERVICE WORKER (update robusto) -------------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const VER = document.documentElement.getAttribute('data-ver') || 'dev';
    const SW_URL = `service-worker.js?v=${encodeURIComponent(VER)}`;
    try {
      const reg = await navigator.serviceWorker.register(SW_URL);
      try { await reg.update(); } catch (_) {}
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            try { nw.postMessage({ type: 'SKIP_WAITING' }); } catch (_) {}
          }
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (sessionStorage.getItem('lh_sw_reloaded')) return;
        sessionStorage.setItem('lh_sw_reloaded', '1');
        window.location.reload();
      });
    } catch (err) {
      console.error('SW non registrato', err);
    }
  });
}

/* -------------------- STATE -------------------- */
let listini = [];           // record listini completi dall'IndexedDB
let listinoIndex = [];      // flat articoli con fornitore/listinoId/isNetto/scontoMax/bonus...
let articoliAggiunti = [];  // righe del preventivo
let autoPopolaCosti = true;
let mostraDettagliServizi = true;
let currentFilterFornitore = '__all__';
let searchDebounceTimer = null;

/* -------------------- HELPERS NUMERICI -------------------- */
function parseDec(val) {
  const s = String(val ?? '').trim().replace(/\s+/g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}
function fmtDec(num, decimals = 2, trim = true) {
  if (!Number.isFinite(num)) return '';
  let s = Number(num).toFixed(decimals);
  if (trim) s = s.replace(/\.?0+$/, '');
  return s.replace('.', ',');
}
function roundTwo(num) { return Math.round(num * 100) / 100; }
function clamp(num, min, max) { return Math.max(min, Math.min(max, num)); }
function sanitizeDecimalTyping(str) {
  let s = String(str ?? '');
  s = s.replace(/[^\d,.\-]/g, '');
  s = s.replace(/(?!^)-/g, '');
  const firstSep = s.search(/[.,]/);
  if (firstSep !== -1) {
    const head = s.slice(0, firstSep + 1);
    const tail = s.slice(firstSep + 1).replace(/[.,]/g, '');
    s = head + tail;
  }
  return s;
}
function uid() {
  try { return crypto.randomUUID(); } catch (_) {}
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}
function formatDateTime(ts) {
  try { return new Date(ts).toLocaleString('it-IT'); } catch (_) { return ''; }
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]));
}

/* -------------------- INDEXEDDB: listini + kv -------------------- */
const DB_NAME = 'listinohub_db_v1';
const DB_VERSION = 1;
const STORE_LISTINI = 'listini';
const STORE_KV = 'kv';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_LISTINI)) {
        db.createObjectStore(STORE_LISTINI, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LISTINI, 'readonly');
    const req = tx.objectStore(STORE_LISTINI).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function dbPut(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LISTINI, 'readwrite');
    tx.objectStore(STORE_LISTINI).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function dbDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LISTINI, 'readwrite');
    tx.objectStore(STORE_LISTINI).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function dbClearListini() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LISTINI, 'readwrite');
    tx.objectStore(STORE_LISTINI).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function kvSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_KV, 'readwrite');
    tx.objectStore(STORE_KV).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function kvGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_KV, 'readonly');
    const req = tx.objectStore(STORE_KV).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* -------------------- SMART SETTINGS (localStorage) -------------------- */
const SMART_KEY = 'listinohub_settings_v1';
let smartSettings = {
  smartMode: false,
  showVAT: false,
  vatRate: 22,
  hideVenduto: true,
  hideDiff: true,
  hideDiscounts: true,
  showClientDiscount: false
};
function loadSmartSettings() {
  try {
    const raw = localStorage.getItem(SMART_KEY);
    if (!raw) return;
    smartSettings = { ...smartSettings, ...JSON.parse(raw) };
  } catch (_) {}
}
function saveSmartSettings() {
  try { localStorage.setItem(SMART_KEY, JSON.stringify(smartSettings)); } catch (_) {}
}

/* -------------------- TOAST -------------------- */
function toast(message, variant = 'info', ms = 3800) {
  const region = document.getElementById('toastRegion');
  if (!region) return;
  const el = document.createElement('div');
  el.className = `toast toast-${variant}`;
  el.role = 'status';
  el.textContent = message;
  region.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 250);
  }, ms);
}

/* -------------------- COSTRUZIONE INDICE FLAT -------------------- */
function rebuildListinoIndex() {
  listinoIndex = [];
  for (const l of listini) {
    for (const a of l.articoli) {
      listinoIndex.push({
        codice: a.codice,
        descrizione: a.descrizione,
        prezzoLordo: a.prezzoLordo,
        costoTrasporto: a.costoTrasporto || 0,
        costoInstallazione: a.costoInstallazione || 0,
        fornitore: l.fornitore,
        listinoId: l.id,
        isNetto: !!l.isNetto,
        scontoMax: parseDec(l.scontoMaxCommerciale || 0),
        bonusType: l.bonusType || '',
        bonusValue: parseDec(l.bonusValue || 0)
      });
    }
  }
}

/* -------------------- RENDER LISTINI CARICATI -------------------- */
function renderListiniList() {
  const wrap = document.getElementById('listiniList');
  const empty = document.getElementById('listiniEmpty');
  if (!wrap) return;

  wrap.innerHTML = '';

  if (!listini.length) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'Nessun listino caricato. Importa il primo file per iniziare.';
    wrap.appendChild(p);
    if (empty) empty.remove();
    return;
  }

  for (const l of listini) {
    const card = document.createElement('article');
    card.className = 'listino-card';
    card.dataset.id = l.id;

    const bonusHtml = (l.bonusType && parseDec(l.bonusValue) > 0)
      ? `<span class="chip chip-bonus" title="Bonus">${escapeHtml(l.bonusType)}: ${fmtDec(parseDec(l.bonusValue), 2, true)}/pz</span>`
      : '';

    const nettoHtml = l.isNetto ? '<span class="chip chip-netto" title="Prezzi netti">netto</span>' : '';
    const maxHtml = parseDec(l.scontoMaxCommerciale) > 0
      ? `<span class="chip chip-max" title="Sconto max commerciale">max ${fmtDec(parseDec(l.scontoMaxCommerciale),2,true)}%</span>`
      : '<span class="chip chip-max chip-muted" title="Nessun limite">no limite</span>';

    card.innerHTML = `
      <header class="listino-head">
        <h3>${escapeHtml(l.fornitore || l.nome || 'Senza nome')}</h3>
        <div class="listino-chips">${nettoHtml}${maxHtml}${bonusHtml}</div>
      </header>
      <p class="listino-meta">
        <span>${l.numeroArticoli} articoli</span>
        <span>·</span>
        <span>${formatDateTime(l.dataImport)}</span>
      </p>
      <div class="listino-actions">
        <button type="button" data-action="rename" aria-label="Rinomina listino">Rinomina</button>
        <button type="button" data-action="settings" aria-label="Modifica impostazioni listino">Impostazioni</button>
        <button type="button" class="btn-danger" data-action="delete" aria-label="Elimina listino">Elimina</button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'rename') renameListino(l.id);
      else if (action === 'settings') openListinoSettingsModal(l.id);
      else if (action === 'delete') deleteListino(l.id);
    });

    wrap.appendChild(card);
  }
}

/* -------------------- POPOLA FILTRO FORNITORE -------------------- */
function renderSupplierFilter() {
  const sel = document.getElementById('supplierFilter');
  if (!sel) return;
  const prev = currentFilterFornitore;
  sel.innerHTML = '<option value="__all__">Tutti i fornitori</option>';
  const uniqueSuppliers = [...new Set(listini.map(l => l.fornitore).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  for (const s of uniqueSuppliers) {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    sel.appendChild(opt);
  }
  if (uniqueSuppliers.includes(prev) || prev === '__all__') sel.value = prev;
  else { sel.value = '__all__'; currentFilterFornitore = '__all__'; }
}

/* -------------------- AGGIORNA RISULTATI RICERCA -------------------- */
function aggiornaListinoSelect() {
  const select = document.getElementById('listinoSelect');
  if (!select) return;
  const searchTerm = (document.getElementById('searchListino')?.value || '').toLowerCase().trim();
  select.innerHTML = '';

  let items = listinoIndex;
  if (currentFilterFornitore !== '__all__') {
    items = items.filter(i => i.fornitore === currentFilterFornitore);
  }

  let shown = 0;
  const MAX = 500;
  for (const item of items) {
    if (shown >= MAX) break;
    const match = !searchTerm
      || String(item.codice).toLowerCase().includes(searchTerm)
      || String(item.descrizione).toLowerCase().includes(searchTerm);
    if (!match) continue;

    const opt = document.createElement('option');
    opt.value = `${item.listinoId}::${item.codice}`;
    const prezzoTxt = roundTwo(item.prezzoLordo).toFixed(2);
    opt.textContent = `[${item.fornitore}] ${item.codice} — ${item.descrizione} — €${prezzoTxt}`;
    select.appendChild(opt);
    shown++;
  }

  if (!shown) {
    const opt = document.createElement('option');
    opt.disabled = true;
    opt.textContent = listinoIndex.length
      ? 'Nessun risultato per questa ricerca'
      : 'Nessun listino caricato';
    select.appendChild(opt);
  }
}

/* -------------------- IMPORT: LETTURA FILE -------------------- */
async function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const supplier = (document.getElementById('newSupplier')?.value || '').trim();
  if (!supplier) {
    toast('Inserisci il nome fornitore prima di caricare il file.', 'warn');
    event.target.value = '';
    return;
  }

  const maxDisc = clamp(parseDec(document.getElementById('newMaxDiscount')?.value || '0'), 0, 100);
  const isNetto = !!document.getElementById('newIsNetto')?.checked;
  const bonusType = (document.getElementById('newBonusType')?.value || '').trim();
  const bonusValue = parseDec(document.getElementById('newBonusValue')?.value || '0');

  // conflitto fornitore?
  const existing = listini.find(l => (l.fornitore || '').toLowerCase() === supplier.toLowerCase());
  let decision = 'new';
  if (existing) {
    decision = await askSupplierConflict(supplier);
    if (decision === 'cancel') {
      event.target.value = '';
      return;
    }
  }

  try {
    const rows = await parseFileToRows(file);
    if (!rows.length) {
      toast('File vuoto o non leggibile.', 'error');
      document.getElementById('csvError').hidden = false;
      return;
    }
    document.getElementById('csvError').hidden = true;

    const articoli = normalizeRows(rows);
    if (!articoli.length) {
      toast('Nessuna riga valida trovata nel file.', 'error');
      return;
    }

    const record = {
      id: uid(),
      nome: `${supplier} — ${file.name}`,
      fornitore: supplier,
      dataImport: Date.now(),
      numeroArticoli: articoli.length,
      scontoMaxCommerciale: maxDisc,
      isNetto,
      bonusType,
      bonusValue,
      articoli
    };

    if (decision === 'replace' && existing) {
      await dbDelete(existing.id);
    }
    await dbPut(record);
    await reloadListini();
    toast(`Listino "${supplier}" importato: ${articoli.length} articoli.`, 'success');
  } catch (err) {
    console.error('Import error', err);
    document.getElementById('csvError').hidden = false;
    toast('Errore nel caricamento del file.', 'error');
  } finally {
    event.target.value = '';
  }
}

function parseFileToRows(file) {
  const name = (file.name || '').toLowerCase();
  const isCsv = name.endsWith('.csv') || name.endsWith('.tsv');
  return isCsv ? parseCsv(file) : parseXlsx(file);
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    if (typeof Papa === 'undefined') return reject(new Error('PapaParse non caricato'));
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data || []),
      error: (err) => reject(err)
    });
  });
}

function parseXlsx(file) {
  return new Promise((resolve, reject) => {
    if (typeof XLSX === 'undefined') return reject(new Error('SheetJS non caricato'));
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        resolve(rows.filter(r => Array.isArray(r) && r.some(c => String(c).trim() !== '')));
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/* -------------------- NORMALIZZA RIGHE → ARTICOLI -------------------- */
function normalizeRows(rows) {
  if (!rows.length) return [];
  const first = rows[0].map(c => String(c ?? '').toLowerCase().trim());

  // auto-detect colonne
  const find = (patterns) => {
    for (let i = 0; i < first.length; i++) {
      if (patterns.some(p => first[i].includes(p))) return i;
    }
    return -1;
  };
  const codIdx = find(['codice', 'code', 'cod']);
  const descIdx = find(['descriz', 'desc', 'art']);
  const prezzoIdx = find(['prezzo', 'price', 'listino', 'netto']);
  const trasportoIdx = find(['trasport', 'transport']);
  const installIdx = find(['install']);

  const autoDetected = codIdx >= 0 && descIdx >= 0 && prezzoIdx >= 0;
  let cIdx, dIdx, pIdx, tIdx, iIdx, dataStart;

  if (autoDetected) {
    cIdx = codIdx; dIdx = descIdx; pIdx = prezzoIdx;
    tIdx = trasportoIdx; iIdx = installIdx;
    dataStart = 1;
  } else {
    toast('Header non riconosciuti: uso le prime 3 colonne (codice, descrizione, prezzo). Verifica il file.', 'warn', 5200);
    cIdx = 0; dIdx = 1; pIdx = 2; tIdx = -1; iIdx = -1;
    dataStart = 0;
  }

  const out = [];
  for (let r = dataStart; r < rows.length; r++) {
    const row = rows[r] || [];
    const codice = String(row[cIdx] ?? '').trim();
    const descrizione = String(row[dIdx] ?? '').trim();
    const prezzo = parseDec(row[pIdx]);
    if (!codice && !descrizione) continue;
    out.push({
      codice,
      descrizione,
      prezzoLordo: prezzo,
      costoTrasporto: tIdx >= 0 ? parseDec(row[tIdx]) : 0,
      costoInstallazione: iIdx >= 0 ? parseDec(row[iIdx]) : 0
    });
  }
  return out;
}

/* -------------------- MODALE CONFLITTO FORNITORE -------------------- */
function askSupplierConflict(supplier) {
  return new Promise((resolve) => {
    const modal = document.getElementById('supplierConflictModal');
    const nameEl = document.getElementById('supplierConflictName');
    const btnReplace = document.getElementById('supplierConflictReplace');
    const btnKeep = document.getElementById('supplierConflictKeep');
    const btnCancel = document.getElementById('supplierConflictCancel');
    if (!modal) return resolve('new');

    nameEl.textContent = supplier;
    modal.hidden = false;

    const close = (res) => {
      modal.hidden = true;
      btnReplace.removeEventListener('click', onR);
      btnKeep.removeEventListener('click', onK);
      btnCancel.removeEventListener('click', onC);
      resolve(res);
    };
    const onR = () => close('replace');
    const onK = () => close('new');
    const onC = () => close('cancel');
    btnReplace.addEventListener('click', onR);
    btnKeep.addEventListener('click', onK);
    btnCancel.addEventListener('click', onC);
  });
}

/* -------------------- CRUD LISTINI -------------------- */
async function deleteListino(id) {
  const l = listini.find(x => x.id === id);
  if (!l) return;
  if (!confirm(`Eliminare il listino "${l.fornitore}"? Gli articoli in preventivo provenienti da questo listino resteranno.`)) return;
  await dbDelete(id);
  await reloadListini();
  toast('Listino eliminato.', 'success');
}

async function renameListino(id) {
  const l = listini.find(x => x.id === id);
  if (!l) return;
  const nuovo = prompt('Nuovo nome fornitore:', l.fornitore || '');
  if (nuovo === null) return;
  const trimmed = nuovo.trim();
  if (!trimmed) { toast('Nome fornitore non valido.', 'warn'); return; }
  l.fornitore = trimmed;
  l.nome = `${trimmed} — ${l.nome.split('—').slice(1).join('—').trim() || 'listino'}`;
  await dbPut(l);

  // propaga agli articoli già in preventivo
  articoliAggiunti.forEach(a => { if (a.listinoId === id) a.fornitore = trimmed; });

  await reloadListini();
  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  toast('Rinomina salvata.', 'success');
}

/* -------------------- MODALE IMPOSTAZIONI LISTINO -------------------- */
let settingsEditingId = null;
function openListinoSettingsModal(id) {
  const l = listini.find(x => x.id === id);
  if (!l) return;
  settingsEditingId = id;
  document.getElementById('settingsNome').value = l.fornitore || '';
  document.getElementById('settingsMaxDiscount').value = fmtDec(parseDec(l.scontoMaxCommerciale || 0), 2, true);
  document.getElementById('settingsBonusType').value = l.bonusType || '';
  document.getElementById('settingsBonusValue').value = fmtDec(parseDec(l.bonusValue || 0), 2, true);
  document.getElementById('listinoSettingsModal').hidden = false;
}
function bindSettingsModal() {
  document.getElementById('settingsSave')?.addEventListener('click', async () => {
    const l = listini.find(x => x.id === settingsEditingId);
    if (!l) { document.getElementById('listinoSettingsModal').hidden = true; return; }
    const nome = document.getElementById('settingsNome').value.trim();
    if (!nome) { toast('Nome fornitore obbligatorio.', 'warn'); return; }
    l.fornitore = nome;
    l.scontoMaxCommerciale = clamp(parseDec(document.getElementById('settingsMaxDiscount').value), 0, 100);
    l.bonusType = document.getElementById('settingsBonusType').value.trim();
    l.bonusValue = parseDec(document.getElementById('settingsBonusValue').value);
    await dbPut(l);

    articoliAggiunti.forEach(a => {
      if (a.listinoId === l.id) {
        a.fornitore = l.fornitore;
        a.scontoMax = l.scontoMaxCommerciale;
        a.bonusType = l.bonusType;
        a.bonusValue = l.bonusValue;
      }
    });

    document.getElementById('listinoSettingsModal').hidden = true;
    settingsEditingId = null;
    await reloadListini();
    renderTabellaArticoli();
    aggiornaTotaliGenerali();
    toast('Impostazioni salvate.', 'success');
  });
  document.getElementById('settingsCancel')?.addEventListener('click', () => {
    document.getElementById('listinoSettingsModal').hidden = true;
    settingsEditingId = null;
  });
}

/* -------------------- RELOAD DA DB -------------------- */
async function reloadListini() {
  listini = await dbAll();
  listini.sort((a, b) => (a.fornitore || '').localeCompare(b.fornitore || ''));
  rebuildListinoIndex();
  renderListiniList();
  renderSupplierFilter();
  aggiornaListinoSelect();
}

/* -------------------- AGGIUNTA ARTICOLO DAL LISTINO -------------------- */
function aggiungiArticoloDaListino() {
  const select = document.getElementById('listinoSelect');
  if (!select?.value) return;
  const [listinoId, codice] = select.value.split('::');
  const src = listinoIndex.find(i => i.listinoId === listinoId && i.codice === codice);
  if (!src) {
    toast('Articolo non trovato.', 'error');
    return;
  }
  const nuovo = {
    codice: src.codice,
    descrizione: src.descrizione,
    prezzoLordo: src.prezzoLordo,
    sconto: 0,
    sconto2: 0,
    margine: 0,
    scontoCliente: 0,
    costoTrasporto: autoPopolaCosti ? src.costoTrasporto : 0,
    costoInstallazione: autoPopolaCosti ? src.costoInstallazione : 0,
    quantita: 1,
    venduto: 0,
    fornitore: src.fornitore,
    listinoId: src.listinoId,
    isNetto: src.isNetto,
    scontoMax: src.scontoMax,
    bonusType: src.bonusType,
    bonusValue: src.bonusValue,
    needsApproval: false
  };

  if (smartSettings.showClientDiscount && !nuovo.isNetto) {
    nuovo.scontoCliente = computeClientDiscountFromCurrent(nuovo);
  }

  articoliAggiunti.push(nuovo);
  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  updateEquivalentDiscountDisplay();
}

/* -------------------- SCONTO CLIENTE: MODE SWITCH -------------------- */
function computeClientDiscountFromCurrent(articolo) {
  if (articolo.isNetto) return 0;
  const prezzoLordo = parseDec(articolo.prezzoLordo || 0);
  if (prezzoLordo <= 0) return 0;
  const r = computeRow({ ...articolo, __ignoreClientDiscount: true });
  const target = parseDec(r.conMargineUnit || 0);
  const eq = (1 - (target / prezzoLordo)) * 100;
  return clamp(eq, 0, 100);
}

function applyClientDiscountMode(enabled) {
  articoliAggiunti = articoliAggiunti.map(a => {
    const item = { ...a };
    if (item.isNetto) return item; // netti non si toccano

    if (enabled) {
      if (item._bakSconto === undefined) item._bakSconto = parseDec(item.sconto || 0);
      if (item._bakSconto2 === undefined) item._bakSconto2 = parseDec(item.sconto2 || 0);
      if (item._bakMargine === undefined) item._bakMargine = parseDec(item.margine || 0);
      item.scontoCliente = computeClientDiscountFromCurrent(item);
      item.sconto = 0; item.sconto2 = 0; item.margine = 0;
    } else {
      if (item._bakSconto !== undefined) item.sconto = item._bakSconto;
      if (item._bakSconto2 !== undefined) item.sconto2 = item._bakSconto2;
      if (item._bakMargine !== undefined) item.margine = item._bakMargine;
    }
    return item;
  });
  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  updateEquivalentDiscountDisplay();
}

function updateEquivalentDiscountDisplay() {
  const el = document.getElementById('smartEquivalentDiscount');
  if (!el) return;
  let base = 0, final = 0;
  articoliAggiunti.forEach(a => {
    const qta = a.quantita || 1;
    const r = computeRow(a);
    base += ((a.prezzoLordo || 0) * qta);
    final += (r.conMargineUnit * qta);
  });
  base = roundTwo(base); final = roundTwo(final);
  if (!base || base <= 0) { el.textContent = '—'; return; }
  let eq = (1 - (final / base)) * 100;
  eq = clamp(eq, -9999, 9999);
  el.textContent = `${eq.toFixed(2)}%`;
}

/* -------------------- INIT -------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  loadSmartSettings();

  const table = document.getElementById('articoli-table');
  if (table) {
    table.style.width = '100%';
    table.style.tableLayout = 'fixed';
    table.style.borderCollapse = 'collapse';
  }

  // File input: dopo aver inserito supplier + opzioni
  document.getElementById('csvFileInput').addEventListener('change', handleFileUpload);

  // Ricerca con debounce
  document.getElementById('searchListino').addEventListener('input', () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(aggiornaListinoSelect, 200);
  });

  // Filtro fornitore
  document.getElementById('supplierFilter').addEventListener('change', (e) => {
    currentFilterFornitore = e.target.value;
    aggiornaListinoSelect();
  });

  // Azioni
  document.getElementById('btnAddFromListino').addEventListener('click', aggiungiArticoloDaListino);
  document.getElementById('btnAddManual').addEventListener('click', mostraFormArticoloManuale);

  // Toggles
  document.getElementById('toggleCosti').addEventListener('change', togglePopolaCosti);
  document.getElementById('toggleMostraServizi').addEventListener('change', () => {
    mostraDettagliServizi = document.getElementById('toggleMostraServizi').checked;
  });

  bindSmartControls();
  bindSettingsModal();
  bindBackupUI();

  await reloadListini();

  if (smartSettings.showClientDiscount) applyClientDiscountMode(true);

  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  applyColumnVisibility();
  updateEquivalentDiscountDisplay();
});

/* -------------------- SMART CONTROLS -------------------- */
function bindSmartControls() {
  const elSmart = document.getElementById('toggleSmartMode');
  const elVat = document.getElementById('toggleShowVAT');
  const elVatRate = document.getElementById('vatRate');
  const elHideVenduto = document.getElementById('toggleHideVenduto');
  const elHideDiff = document.getElementById('toggleHideDiff');
  const elHideDiscounts = document.getElementById('toggleHideDiscounts');
  const elShowClientDiscount = document.getElementById('toggleShowClientDiscount');

  if (elSmart) elSmart.checked = !!smartSettings.smartMode;
  if (elVat) elVat.checked = !!smartSettings.showVAT;
  if (elVatRate) elVatRate.value = smartSettings.vatRate ?? 22;
  if (elHideVenduto) elHideVenduto.checked = !!smartSettings.hideVenduto;
  if (elHideDiff) elHideDiff.checked = !!smartSettings.hideDiff;
  if (elHideDiscounts) elHideDiscounts.checked = !!smartSettings.hideDiscounts;
  if (elShowClientDiscount) elShowClientDiscount.checked = !!smartSettings.showClientDiscount;

  const onChange = () => {
    const prevClient = !!smartSettings.showClientDiscount;

    smartSettings.smartMode = !!elSmart?.checked;
    smartSettings.showVAT = !!elVat?.checked;
    const rate = parseDec(elVatRate?.value || '22');
    smartSettings.vatRate = clamp(rate, 0, 100);
    smartSettings.hideVenduto = !!elHideVenduto?.checked;
    smartSettings.hideDiff = !!elHideDiff?.checked;
    smartSettings.hideDiscounts = !!elHideDiscounts?.checked;
    smartSettings.showClientDiscount = !!elShowClientDiscount?.checked;

    if (smartSettings.smartMode) {
      smartSettings.hideVenduto = true;
      smartSettings.hideDiff = true;
      smartSettings.hideDiscounts = true;
    }

    saveSmartSettings();

    if (prevClient !== !!smartSettings.showClientDiscount) {
      applyClientDiscountMode(!!smartSettings.showClientDiscount);
      return;
    }
    applyColumnVisibility();
    aggiornaCalcoliRighe();
    aggiornaTotaliGenerali();
    updateEquivalentDiscountDisplay();
  };

  [elSmart, elVat, elVatRate, elHideVenduto, elHideDiff, elHideDiscounts, elShowClientDiscount]
    .filter(Boolean)
    .forEach(el => el.addEventListener('change', onChange));
}

function applyColumnVisibility() {
  const hideVenduto = smartSettings.smartMode ? true : smartSettings.hideVenduto;
  const hideDiff = smartSettings.smartMode ? true : smartSettings.hideDiff;
  setColHidden('venduto', hideVenduto);
  setColHidden('diff', hideDiff);

  const clientMode = !!smartSettings.showClientDiscount;
  setColHidden('sconto1', clientMode);
  setColHidden('sconto2', clientMode);
  setColHidden('margine', smartSettings.smartMode || clientMode);
  setColHidden('scontoCliente', !clientMode);
  setColHidden('prezzoLordo', smartSettings.smartMode);
}
function setColHidden(colKey, hidden) {
  document.querySelectorAll(`th[data-col="${colKey}"]`).forEach(th => th.classList.toggle('col-hidden', !!hidden));
  document.querySelectorAll(`td[data-col="${colKey}"]`).forEach(td => td.classList.toggle('col-hidden', !!hidden));
}

/* -------------------- POPOLA COSTI -------------------- */
function togglePopolaCosti() {
  autoPopolaCosti = document.getElementById('toggleCosti').checked;
  const secondCheckbox = document.getElementById('toggleMostraServizi');
  if (secondCheckbox) {
    secondCheckbox.disabled = !autoPopolaCosti;
    mostraDettagliServizi = secondCheckbox.checked;
  }

  articoliAggiunti = articoliAggiunti.map(a => {
    const src = listinoIndex.find(i => i.listinoId === a.listinoId && i.codice === a.codice);
    return {
      ...a,
      costoTrasporto: autoPopolaCosti && src ? src.costoTrasporto : 0,
      costoInstallazione: autoPopolaCosti && src ? src.costoInstallazione : 0
    };
  });

  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  updateEquivalentDiscountDisplay();
}

/* -------------------- CALCOLI RIGA -------------------- */
function computeRow(articolo) {
  const prezzoLordo = parseDec(articolo.prezzoLordo || 0);
  const qta = Math.max(1, parseInt(articolo.quantita || 1, 10) || 1);

  let sconto1 = 0, sconto2 = 0, margine = 0;
  let totaleNettoUnit = 0, conMargineUnit = 0;

  if (articolo.isNetto) {
    totaleNettoUnit = roundTwo(prezzoLordo);
    conMargineUnit = totaleNettoUnit;
  } else {
    const useClientDiscount = !!smartSettings.showClientDiscount && !articolo.__ignoreClientDiscount;
    if (useClientDiscount) {
      const sc = clamp(parseDec(articolo.scontoCliente || 0), 0, 100);
      conMargineUnit = roundTwo(prezzoLordo * (1 - sc / 100));
      totaleNettoUnit = conMargineUnit;
    } else {
      sconto1 = clamp(parseDec(articolo.sconto || 0), 0, 100);
      sconto2 = clamp(parseDec(articolo.sconto2 || 0), 0, 100);
      const prezzoScontato = prezzoLordo * (1 - sconto1 / 100) * (1 - sconto2 / 100);
      totaleNettoUnit = roundTwo(prezzoScontato);
      margine = clamp(parseDec(articolo.margine || 0), 0, 99.99);
      conMargineUnit = roundTwo(totaleNettoUnit / (1 - margine / 100));
    }
  }

  const serviziUnit = roundTwo(parseDec(articolo.costoTrasporto || 0) + parseDec(articolo.costoInstallazione || 0));
  const granTotRiga = roundTwo((conMargineUnit + serviziUnit) * qta);
  const venduto = parseDec(articolo.venduto || 0);
  const differenza = roundTwo(venduto - granTotRiga);
  const nettoCadSmart = roundTwo(granTotRiga / qta);

  return { sconto1, sconto2, totaleNettoUnit, conMargineUnit, qta, serviziUnit, granTotRiga, venduto, differenza, nettoCadSmart };
}

/* sconto equivalente della singola riga (0..100), per confronto con max fornitore */
function rowEquivalentDiscount(articolo) {
  const prezzoLordo = parseDec(articolo.prezzoLordo || 0);
  if (prezzoLordo <= 0 || articolo.isNetto) return 0;
  const r = computeRow({ ...articolo, __ignoreClientDiscount: false });
  const eq = (1 - (r.conMargineUnit / prezzoLordo)) * 100;
  return clamp(eq, 0, 100);
}

function checkScontoMaxForRow(articolo) {
  if (articolo.isNetto) return { over: false, eq: 0, max: 0 };
  const max = parseDec(articolo.scontoMax || 0);
  if (max <= 0) return { over: false, eq: 0, max };
  const eq = rowEquivalentDiscount(articolo);
  return { over: eq > max + 0.0001, eq, max };
}

/* -------------------- TABELLA: RENDER -------------------- */
function renderTabellaArticoli() {
  const tableBody = document.querySelector('#articoli-table tbody');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  articoliAggiunti.forEach((articolo, index) => {
    const r = computeRow(articolo);
    const row = document.createElement('tr');
    row.dataset.index = String(index);
    if (articolo.isNetto) row.classList.add('row-netto');
    if (articolo.needsApproval) row.classList.add('row-overmax');

    const disabledAttr = articolo.isNetto ? 'disabled' : '';
    const nettoBadge = articolo.isNetto ? ' <span class="inline-netto">netto</span>' : '';

    row.innerHTML = `
      <td data-col="codice">${escapeHtml(articolo.codice)}</td>
      <td data-col="fornitore">${escapeHtml(articolo.fornitore || '')}${nettoBadge}</td>
      <td data-col="descrizione">${escapeHtml(articolo.descrizione)}</td>
      <td data-col="prezzoLordo" class="cell-prezzoLordo">${roundTwo(parseDec(articolo.prezzoLordo)).toFixed(2)}€</td>

      <td data-col="sconto1">
        <input class="cell-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
          value="${fmtDec(r.sconto1, 2, true)}"
          data-index="${index}" data-field="sconto" ${disabledAttr} />
      </td>
      <td data-col="sconto2">
        <input class="cell-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
          value="${fmtDec(r.sconto2, 2, true)}"
          data-index="${index}" data-field="sconto2" ${disabledAttr} />
      </td>
      <td data-col="scontoCliente">
        <input class="cell-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
          value="${fmtDec(parseDec(articolo.scontoCliente || 0), 2, true)}"
          data-index="${index}" data-field="scontoCliente" ${disabledAttr} />
      </td>
      <td data-col="margine">
        <input class="cell-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
          value="${fmtDec(parseDec(articolo.margine || 0), 2, true)}"
          data-index="${index}" data-field="margine" ${disabledAttr} />
      </td>
      <td data-col="totaleNetto" class="cell-totaleNetto">${r.totaleNettoUnit.toFixed(2)}€</td>
      <td data-col="trasporto">
        <input class="cell-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
          value="${fmtDec(parseDec(articolo.costoTrasporto || 0), 2, true)}"
          data-index="${index}" data-field="costoTrasporto" />
      </td>
      <td data-col="installazione">
        <input class="cell-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
          value="${fmtDec(parseDec(articolo.costoInstallazione || 0), 2, true)}"
          data-index="${index}" data-field="costoInstallazione" />
      </td>
      <td data-col="qta">
        <input class="cell-input" type="number" min="1" step="1" inputmode="numeric"
          value="${r.qta}" data-index="${index}" data-field="quantita" />
      </td>
      <td data-col="granTot" class="cell-granTot">${r.granTotRiga.toFixed(2)}€</td>
      <td data-col="venduto">
        <input class="cell-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
          value="${fmtDec(r.venduto, 2, true)}"
          data-index="${index}" data-field="venduto" />
      </td>
      <td data-col="diff" class="cell-diff">${r.differenza.toFixed(2)}€</td>
      <td data-col="azioni"><button type="button" class="btn-danger" aria-label="Rimuovi riga" onclick="rimuoviArticolo(${index})">Rimuovi</button></td>
    `;

    tableBody.appendChild(row);
    markRowOverMax(row, articolo);
  });

  tableBody.removeEventListener('input', onTableInput, true);
  tableBody.addEventListener('input', onTableInput, true);

  tableBody.querySelectorAll('input.cell-input').forEach(inp => { inp.style.boxSizing = 'border-box'; });

  applyColumnVisibility();
}

function markRowOverMax(row, articolo) {
  const { over } = checkScontoMaxForRow(articolo);
  const fields = ['sconto1', 'sconto2', 'scontoCliente', 'margine'];
  fields.forEach(f => {
    const td = row.querySelector(`td[data-col="${f}"]`);
    if (!td) return;
    td.classList.toggle('over-max', !!over && !articolo.isNetto);
    const inp = td.querySelector('input');
    if (inp) inp.setAttribute('aria-invalid', over ? 'true' : 'false');
  });
  row.classList.toggle('row-overmax', !!over);
}

function onTableInput(e) {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;

  const idx = parseInt(target.dataset.index || '-1', 10);
  const field = target.dataset.field || '';
  if (idx < 0 || !field) return;
  if (target.disabled) return;

  if (field !== 'quantita') {
    const cleaned = sanitizeDecimalTyping(target.value);
    if (cleaned !== target.value) {
      const pos = target.selectionStart ?? cleaned.length;
      target.value = cleaned;
      try { target.setSelectionRange(pos, pos); } catch (_) {}
    }
  }

  if (field === 'quantita') {
    let v = parseInt(String(target.value || '1'), 10) || 1;
    if (v < 1) v = 1;
    articoliAggiunti[idx][field] = v;
  } else {
    let v = parseDec(target.value);
    if (field === 'sconto' || field === 'sconto2' || field === 'scontoCliente') v = clamp(v, 0, 100);
    if (field === 'margine') v = clamp(v, 0, 99.99);
    if (field === 'costoTrasporto' || field === 'costoInstallazione' || field === 'venduto') v = Math.max(0, v);
    articoliAggiunti[idx][field] = v;

    if (!smartSettings.showClientDiscount && (field === 'sconto' || field === 'sconto2' || field === 'margine')) {
      articoliAggiunti[idx].scontoCliente = computeClientDiscountFromCurrent(articoliAggiunti[idx]);
    }
  }

  // sconto max check
  const art = articoliAggiunti[idx];
  const { over, eq, max } = checkScontoMaxForRow(art);
  const wasOver = !!art.needsApproval;
  art.needsApproval = over;

  aggiornaCalcoliRiga(idx);

  const row = document.querySelector(`#articoli-table tbody tr[data-index="${idx}"]`);
  if (row) markRowOverMax(row, art);

  // toast solo sulla transizione ok→over
  if (over && !wasOver) {
    toast(`⚠ Sconto ${eq.toFixed(1)}% oltre il limite per ${art.fornitore} (max ${max.toFixed(1)}%)`, 'warn', 4200);
  }

  aggiornaTotaliGenerali();
  updateEquivalentDiscountDisplay();
}

function aggiornaCalcoliRiga(index) {
  const row = document.querySelector(`#articoli-table tbody tr[data-index="${index}"]`);
  if (!row) return;
  const articolo = articoliAggiunti[index];
  const r = computeRow(articolo);
  const tdTotaleNetto = row.querySelector('.cell-totaleNetto');
  const tdGranTot = row.querySelector('.cell-granTot');
  const tdDiff = row.querySelector('.cell-diff');
  const tdPrezzoLordo = row.querySelector('.cell-prezzoLordo');
  if (tdPrezzoLordo) tdPrezzoLordo.textContent = `${roundTwo(parseDec(articolo.prezzoLordo)).toFixed(2)}€`;
  if (tdTotaleNetto) tdTotaleNetto.textContent = `${r.totaleNettoUnit.toFixed(2)}€`;
  if (tdGranTot) tdGranTot.textContent = `${r.granTotRiga.toFixed(2)}€`;
  if (tdDiff) tdDiff.textContent = `${r.differenza.toFixed(2)}€`;
}
function aggiornaCalcoliRighe() { for (let i = 0; i < articoliAggiunti.length; i++) aggiornaCalcoliRiga(i); }

/* -------------------- RIMOZIONE -------------------- */
function rimuoviArticolo(index) {
  articoliAggiunti.splice(index, 1);
  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  updateEquivalentDiscountDisplay();
}

/* -------------------- BONUS AGGREGATI -------------------- */
function aggregateBonus() {
  const map = new Map();
  for (const a of articoliAggiunti) {
    const type = (a.bonusType || '').trim();
    const value = parseDec(a.bonusValue || 0);
    if (!type || value <= 0) continue;
    const qta = Math.max(1, parseInt(a.quantita || 1, 10) || 1);
    const cur = map.get(type) || 0;
    map.set(type, cur + value * qta);
  }
  return [...map.entries()].map(([type, total]) => ({ type, total: roundTwo(total) }));
}
function hasNeedsApproval() { return articoliAggiunti.some(a => a.needsApproval); }
function formatBonusLine(list) {
  if (!list.length) return '';
  return 'Bonus accumulati: ' + list.map(b => `${fmtDec(b.total, 2, false)} in ${b.type}`).join(' | ');
}

/* -------------------- TOTALI -------------------- */
function aggiornaTotaliGenerali() {
  let totaleSenzaServizi = 0, totaleConServizi = 0, totaleVenduto = 0, totaleDifferenzaSconto = 0;

  articoliAggiunti.forEach(a => {
    const r = computeRow(a);
    totaleSenzaServizi += r.conMargineUnit * r.qta;
    totaleConServizi += r.granTotRiga;
    totaleVenduto += r.venduto;
    totaleDifferenzaSconto += r.differenza;
  });

  const imponibile = autoPopolaCosti ? roundTwo(totaleConServizi) : roundTwo(totaleSenzaServizi);
  const vatRate = clamp(parseDec(smartSettings.vatRate ?? 22), 0, 100);
  const iva = roundTwo(imponibile * (vatRate / 100));
  const totaleIvato = roundTwo(imponibile + iva);

  let totaleDiv = document.getElementById('totaleGenerale');
  if (!totaleDiv) {
    totaleDiv = document.createElement('div');
    totaleDiv.id = 'totaleGenerale';
    document.getElementById('report-section').insertAdjacentElement('beforebegin', totaleDiv);
  }

  const smart = !!smartSettings.smartMode;
  let html = '';

  if (!smart) {
    html += `<div><strong>Totale Netto (senza Trasporto/Installazione):</strong> ${totaleSenzaServizi.toFixed(2)}€</div>`;
    html += `<div><strong>Totale Complessivo (incl. Trasporto/Installazione):</strong> ${totaleConServizi.toFixed(2)}€</div>`;
    html += `<div><strong>Totale Venduto:</strong> ${totaleVenduto.toFixed(2)}€</div>`;
    html += `<div><strong>Totale Differenza Sconto:</strong> ${totaleDifferenzaSconto.toFixed(2)}€</div>`;
  } else {
    html += `<div><strong>Imponibile:</strong> ${imponibile.toFixed(2)}€</div>`;
    if (smartSettings.showVAT) {
      html += `<div><strong>IVA (${vatRate.toFixed(1)}%):</strong> ${iva.toFixed(2)}€</div>`;
      html += `<div><strong>Totale + IVA:</strong> ${totaleIvato.toFixed(2)}€</div>`;
    } else {
      html += `<div><strong>Totale:</strong> ${imponibile.toFixed(2)}€</div>`;
    }
  }
  if (!smart && smartSettings.showVAT) {
    html += `<hr>`;
    html += `<div><strong>Imponibile:</strong> ${imponibile.toFixed(2)}€</div>`;
    html += `<div><strong>IVA (${vatRate.toFixed(1)}%):</strong> ${iva.toFixed(2)}€</div>`;
    html += `<div><strong>Totale + IVA:</strong> ${totaleIvato.toFixed(2)}€</div>`;
  }

  const bonus = aggregateBonus();
  if (bonus.length) {
    html += `<div class="bonus-line"><strong>Bonus accumulati:</strong> `
         + bonus.map(b => `${fmtDec(b.total, 2, false)} in ${escapeHtml(b.type)}`).join(' · ')
         + `</div>`;
  }

  if (hasNeedsApproval()) {
    html += `<div class="approval-warning">⚠ Alcune righe superano il limite di sconto del fornitore — richiede approvazione.</div>`;
  }

  totaleDiv.innerHTML = html;
}

/* -------------------- MANUALE -------------------- */
function mostraFormArticoloManuale() {
  const tableBody = document.querySelector('#articoli-table tbody');
  if (!tableBody) return;
  if (document.getElementById('manual-input-row')) return;

  const row = document.createElement('tr');
  row.id = 'manual-input-row';

  row.innerHTML = `
    <td data-col="codice"><input type="text" id="manualCodice" placeholder="Codice" /></td>
    <td data-col="fornitore"><input type="text" id="manualFornitore" placeholder="Fornitore" /></td>
    <td data-col="descrizione"><input type="text" id="manualDescrizione" placeholder="Descrizione" /></td>
    <td data-col="prezzoLordo"><input type="text" inputmode="decimal" id="manualPrezzo" placeholder="€" value="0" /></td>
    <td data-col="sconto1"><input type="text" inputmode="decimal" id="manualSconto1" placeholder="%" value="0" /></td>
    <td data-col="sconto2"><input type="text" inputmode="decimal" id="manualSconto2" placeholder="%" value="0" /></td>
    <td data-col="scontoCliente"><input type="text" inputmode="decimal" id="manualScontoCliente" placeholder="%" value="0" /></td>
    <td data-col="margine"><input type="text" inputmode="decimal" id="manualMargine" placeholder="%" value="0" /></td>
    <td data-col="totaleNetto"><span id="manualTotale">—</span></td>
    <td data-col="trasporto"><input type="text" inputmode="decimal" id="manualTrasporto" placeholder="€" value="0" /></td>
    <td data-col="installazione"><input type="text" inputmode="decimal" id="manualInstallazione" placeholder="€" value="0" /></td>
    <td data-col="qta"><input type="number" id="manualQuantita" placeholder="1" value="1" min="1" step="1" inputmode="numeric" /></td>
    <td data-col="granTot"><span id="manualGranTotale">—</span></td>
    <td data-col="venduto"><input type="text" inputmode="decimal" id="manualVenduto" placeholder="€" value="0" /></td>
    <td data-col="diff"><span id="manualDifferenza">—</span></td>
    <td data-col="azioni">
      <button type="button" onclick="aggiungiArticoloManuale()" aria-label="Conferma">✅</button>
      <button type="button" onclick="annullaArticoloManuale()" aria-label="Annulla">❌</button>
    </td>
  `;

  tableBody.appendChild(row);

  [
    'manualPrezzo','manualSconto1','manualSconto2','manualScontoCliente','manualMargine',
    'manualTrasporto','manualInstallazione','manualQuantita','manualVenduto'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      if (el.type === 'text') el.value = sanitizeDecimalTyping(el.value);
      calcolaRigaManuale();
    });
  });

  applyColumnVisibility();
  calcolaRigaManuale();
}

function calcolaRigaManuale() {
  const prezzoLordo = parseDec(document.getElementById('manualPrezzo').value);
  const sconto1 = clamp(parseDec(document.getElementById('manualSconto1').value), 0, 100);
  const sconto2 = clamp(parseDec(document.getElementById('manualSconto2').value), 0, 100);
  const scontoCliente = clamp(parseDec(document.getElementById('manualScontoCliente').value), 0, 100);
  const margine = clamp(parseDec(document.getElementById('manualMargine').value), 0, 99.99);
  const trasporto = Math.max(0, parseDec(document.getElementById('manualTrasporto').value));
  const installazione = Math.max(0, parseDec(document.getElementById('manualInstallazione').value));
  const quantita = Math.max(1, parseInt(document.getElementById('manualQuantita').value || '1', 10) || 1);
  const venduto = Math.max(0, parseDec(document.getElementById('manualVenduto').value));

  let conMargine = 0, nettoMostrato = 0;
  if (smartSettings.showClientDiscount) {
    conMargine = roundTwo(prezzoLordo * (1 - scontoCliente / 100));
    nettoMostrato = conMargine;
  } else {
    const scontato = roundTwo(prezzoLordo * (1 - sconto1 / 100) * (1 - sconto2 / 100));
    conMargine = roundTwo(scontato / (1 - margine / 100));
    nettoMostrato = scontato;
  }
  const granTot = roundTwo((conMargine + trasporto + installazione) * quantita);
  const differenza = roundTwo(venduto - granTot);

  document.getElementById('manualTotale').textContent = nettoMostrato.toFixed(2) + '€';
  document.getElementById('manualGranTotale').textContent = granTot.toFixed(2) + '€';
  document.getElementById('manualDifferenza').textContent = differenza.toFixed(2) + '€';
}

function aggiungiArticoloManuale() {
  const codice = document.getElementById('manualCodice').value.trim();
  const fornitore = document.getElementById('manualFornitore').value.trim() || '—';
  const descrizione = document.getElementById('manualDescrizione').value.trim();

  const prezzoLordo = parseDec(document.getElementById('manualPrezzo').value);
  const sconto = clamp(parseDec(document.getElementById('manualSconto1').value), 0, 100);
  const sconto2 = clamp(parseDec(document.getElementById('manualSconto2').value), 0, 100);
  const scontoCliente = clamp(parseDec(document.getElementById('manualScontoCliente').value), 0, 100);
  const margine = clamp(parseDec(document.getElementById('manualMargine').value), 0, 99.99);
  const costoTrasporto = Math.max(0, parseDec(document.getElementById('manualTrasporto').value));
  const costoInstallazione = Math.max(0, parseDec(document.getElementById('manualInstallazione').value));
  const quantita = Math.max(1, parseInt(document.getElementById('manualQuantita').value || '1', 10) || 1);
  const venduto = Math.max(0, parseDec(document.getElementById('manualVenduto').value));

  const nuovo = {
    codice, descrizione, prezzoLordo,
    sconto, sconto2, margine, scontoCliente,
    costoTrasporto, costoInstallazione, quantita, venduto,
    fornitore, listinoId: null,
    isNetto: false, scontoMax: 0,
    bonusType: '', bonusValue: 0, // TODO: estendere a override per riga se richiesto
    needsApproval: false
  };

  if (smartSettings.showClientDiscount) {
    nuovo.scontoCliente = computeClientDiscountFromCurrent(nuovo);
    nuovo.sconto = 0; nuovo.sconto2 = 0; nuovo.margine = 0;
  }

  articoliAggiunti.push(nuovo);
  annullaArticoloManuale();
  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  updateEquivalentDiscountDisplay();
}
function annullaArticoloManuale() { document.getElementById('manual-input-row')?.remove(); }

/* -------------------- REPORTS -------------------- */
function generaReportSmartCliente() {
  let report = 'PREVENTIVO / ORDINE\n\n';
  let imponibile = 0;
  const mostraServizi = document.getElementById('toggleMostraServizi')?.checked && autoPopolaCosti;

  articoliAggiunti.forEach((a, index) => {
    const r = computeRow(a);
    const nettoCad = r.nettoCadSmart;
    const totRiga = r.granTotRiga;
    imponibile += totRiga;
    report += `${index + 1}) ${a.descrizione}\n`;
    if (a.fornitore) report += `Fornitore: ${a.fornitore}\n`;
    report += `Codice: ${a.codice}\n`;
    report += `Q.tà: ${r.qta}\n`;
    report += `Netto/cad: ${nettoCad.toFixed(2)}€\n`;
    if (mostraServizi) {
      const tr = roundTwo(parseDec(a.costoTrasporto || 0));
      const ins = roundTwo(parseDec(a.costoInstallazione || 0));
      if (tr !== 0 || ins !== 0) {
        report += `Servizi:\n`;
        report += `Trasporto ${tr.toFixed(2)}€\n`;
        report += `Installazione ${ins.toFixed(2)}€\n`;
      }
    }
    report += `Totale riga: ${totRiga.toFixed(2)}€\n\n`;
  });

  imponibile = roundTwo(imponibile);
  const vatRate = clamp(parseDec(smartSettings.vatRate ?? 22), 0, 100);
  const iva = roundTwo(imponibile * (vatRate / 100));
  const totaleIvato = roundTwo(imponibile + iva);

  report += `RIEPILOGO\n`;
  report += `Imponibile: ${imponibile.toFixed(2)}€\n`;
  if (smartSettings.showVAT) {
    report += `IVA (${vatRate.toFixed(1)}%): ${iva.toFixed(2)}€\n`;
    report += `Totale + IVA: ${totaleIvato.toFixed(2)}€\n`;
  } else {
    report += `Totale: ${imponibile.toFixed(2)}€\n`;
  }

  const bonus = aggregateBonus();
  if (bonus.length) report += `\n${formatBonusLine(bonus)}\n`;
  if (hasNeedsApproval()) report += `\n⚠ ATTENZIONE: Questo preventivo contiene sconti oltre i limiti autorizzati per uno o più fornitori. Richiede approvazione del responsabile.\n`;

  return report;
}

function generaReportTesto() {
  if (smartSettings.smartMode) return generaReportSmartCliente();

  let report = 'Report Articoli:\n\n';
  let totaleSenzaServizi = 0, totaleConServizi = 0, sommaDifferenze = 0, totaleVenduto = 0;
  mostraDettagliServizi = document.getElementById('toggleMostraServizi')?.checked;
  const clientMode = !!smartSettings.showClientDiscount;

  articoliAggiunti.forEach((a, index) => {
    const r = computeRow(a);
    sommaDifferenze += r.differenza;
    totaleVenduto += r.venduto;
    totaleSenzaServizi += r.conMargineUnit * r.qta;
    totaleConServizi += r.granTotRiga;

    report += `${index + 1}. Codice: ${a.codice}\n`;
    if (a.fornitore) report += `Fornitore: ${a.fornitore}${a.isNetto ? ' (netto)' : ''}\n`;
    report += `Descrizione: ${a.descrizione}\n`;
    report += `Prezzo netto: ${r.totaleNettoUnit.toFixed(2)}€\n`;

    if (!smartSettings.hideDiscounts && !a.isNetto) {
      if (clientMode) {
        report += `Sconto cliente: ${clamp(parseDec(a.scontoCliente || 0), 0, 100).toFixed(2)}%\n`;
      } else {
        report += `Sconto 1: ${r.sconto1}%\n`;
        report += `Sconto 2: ${r.sconto2}%\n`;
      }
    }
    report += `Quantità: ${r.qta}\n`;
    if (mostraDettagliServizi && autoPopolaCosti) {
      report += `Trasporto: ${roundTwo(parseDec(a.costoTrasporto || 0)).toFixed(2)}€\n`;
      report += `Installazione: ${roundTwo(parseDec(a.costoInstallazione || 0)).toFixed(2)}€\n`;
    }
    report += `Totale: ${r.granTotRiga.toFixed(2)}€\n`;
    if (!smartSettings.hideVenduto) report += `Venduto A: ${(r.venduto || 0).toFixed(2)}€\n`;
    if (!smartSettings.hideDiff) report += `Differenza sconto: ${r.differenza.toFixed(2)}€\n`;
    report += `\n`;
  });

  report += `Totale Netto (senza Trasporto/Installazione): ${totaleSenzaServizi.toFixed(2)}€\n`;
  if (autoPopolaCosti) report += `Totale Complessivo (inclusi Trasporto/Installazione): ${totaleConServizi.toFixed(2)}€\n`;
  if (!smartSettings.hideVenduto) report += `Totale Venduto: ${totaleVenduto.toFixed(2)}€\n`;
  if (!smartSettings.hideDiff) report += `Totale Differenza Sconto: ${sommaDifferenze.toFixed(2)}€\n`;

  if (smartSettings.showVAT) {
    const imponibile = autoPopolaCosti ? roundTwo(totaleConServizi) : roundTwo(totaleSenzaServizi);
    const vatRate = clamp(parseDec(smartSettings.vatRate ?? 22), 0, 100);
    const iva = roundTwo(imponibile * (vatRate / 100));
    const totaleIvato = roundTwo(imponibile + iva);
    report += `\nRIEPILOGO IVA\n`;
    report += `Imponibile: ${imponibile.toFixed(2)}€\n`;
    report += `IVA (${vatRate.toFixed(1)}%): ${iva.toFixed(2)}€\n`;
    report += `Totale + IVA: ${totaleIvato.toFixed(2)}€\n`;
  }

  const bonus = aggregateBonus();
  if (bonus.length) report += `\n${formatBonusLine(bonus)}\n`;
  if (hasNeedsApproval()) report += `\n⚠ ATTENZIONE: Questo preventivo contiene sconti oltre i limiti autorizzati per uno o più fornitori. Richiede approvazione del responsabile.\n`;

  return report;
}

function inviaReportWhatsApp() {
  const report = generaReportTesto();
  const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(report);
  window.open(url, '_blank');
}
function generaTXTReport() {
  const report = generaReportTesto();
  scaricaTesto(report, smartSettings.smartMode ? 'preventivo_smart.txt' : 'report.txt');
}

function generaReportTestoSenzaMargine() {
  if (smartSettings.smartMode) return generaReportSmartCliente();

  let report = 'Report Articoli (senza Margine):\n\n';
  let totaleSenzaServizi = 0, totaleConServizi = 0;
  const mostraServizi = document.getElementById('toggleMostraServizi')?.checked;
  const clientMode = !!smartSettings.showClientDiscount;

  articoliAggiunti.forEach((a, index) => {
    const prezzoLordo = parseDec(a.prezzoLordo || 0);
    const quantita = Math.max(1, parseInt(a.quantita || 1, 10) || 1);

    let prezzoNetto = 0;
    if (a.isNetto) {
      prezzoNetto = roundTwo(prezzoLordo);
    } else if (clientMode) {
      const sc = clamp(parseDec(a.scontoCliente || 0), 0, 100);
      prezzoNetto = roundTwo(prezzoLordo * (1 - sc / 100));
    } else {
      const sconto1 = clamp(parseDec(a.sconto || 0), 0, 100);
      const sconto2 = clamp(parseDec(a.sconto2 || 0), 0, 100);
      prezzoNetto = roundTwo(prezzoLordo * (1 - sconto1 / 100) * (1 - sconto2 / 100));
    }

    const granTotale = roundTwo(
      (prezzoNetto + Math.max(0, parseDec(a.costoTrasporto || 0)) + Math.max(0, parseDec(a.costoInstallazione || 0))) * quantita
    );

    totaleSenzaServizi += prezzoNetto * quantita;
    totaleConServizi += granTotale;

    report += `${index + 1}. Codice: ${a.codice}\n`;
    if (a.fornitore) report += `Fornitore: ${a.fornitore}${a.isNetto ? ' (netto)' : ''}\n`;
    report += `Descrizione: ${a.descrizione}\n`;
    report += `Prezzo netto: ${prezzoNetto.toFixed(2)}€\n`;
    if (!smartSettings.hideDiscounts && !a.isNetto) {
      if (clientMode) report += `Sconto cliente: ${clamp(parseDec(a.scontoCliente || 0), 0, 100).toFixed(2)}%\n`;
      else {
        report += `Sconto 1: ${clamp(parseDec(a.sconto || 0), 0, 100)}%\n`;
        report += `Sconto 2: ${clamp(parseDec(a.sconto2 || 0), 0, 100)}%\n`;
      }
    }
    report += `Quantità: ${quantita}\n`;
    if (mostraServizi && autoPopolaCosti) {
      report += `Trasporto: ${roundTwo(parseDec(a.costoTrasporto || 0)).toFixed(2)}€\n`;
      report += `Installazione: ${roundTwo(parseDec(a.costoInstallazione || 0)).toFixed(2)}€\n`;
    }
    report += `Totale: ${granTotale.toFixed(2)}€\n\n`;
  });

  report += `Totale Netto (senza Trasporto/Installazione): ${totaleSenzaServizi.toFixed(2)}€\n`;
  if (autoPopolaCosti) report += `Totale Complessivo (inclusi Trasporto/Installazione): ${totaleConServizi.toFixed(2)}€\n`;

  if (smartSettings.showVAT) {
    const imponibile = autoPopolaCosti ? roundTwo(totaleConServizi) : roundTwo(totaleSenzaServizi);
    const vatRate = clamp(parseDec(smartSettings.vatRate ?? 22), 0, 100);
    const iva = roundTwo(imponibile * (vatRate / 100));
    const totaleIvato = roundTwo(imponibile + iva);
    report += `\nRIEPILOGO IVA\n`;
    report += `Imponibile: ${imponibile.toFixed(2)}€\n`;
    report += `IVA (${vatRate.toFixed(1)}%): ${iva.toFixed(2)}€\n`;
    report += `Totale + IVA: ${totaleIvato.toFixed(2)}€\n`;
  }

  const bonus = aggregateBonus();
  if (bonus.length) report += `\n${formatBonusLine(bonus)}\n`;
  if (hasNeedsApproval()) report += `\n⚠ ATTENZIONE: Questo preventivo contiene sconti oltre i limiti autorizzati per uno o più fornitori. Richiede approvazione del responsabile.\n`;

  return report;
}
function inviaReportWhatsAppSenzaMargine() {
  const report = generaReportTestoSenzaMargine();
  window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(report), '_blank');
}
function generaTXTReportSenzaMargine() {
  scaricaTesto(generaReportTestoSenzaMargine(), smartSettings.smartMode ? 'preventivo_smart.txt' : 'report_senza_margine.txt');
}

function scaricaTesto(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/* -------------------- BACKUP / RESTORE JSON -------------------- */
const BACKUP_VERSION = 1;

function buildBackupPayload() {
  return {
    app: 'ListinoHub',
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    listini,
    smartSettings,
    preventivo: articoliAggiunti
  };
}

function exportBackup() {
  try {
    const payload = buildBackupPayload();
    const json = JSON.stringify(payload, null, 2);
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    scaricaTesto(json, `listinohub-backup-${stamp}.json`);
    toast('Backup esportato.', 'success');
  } catch (err) {
    console.error(err);
    toast('Errore durante l\'export del backup.', 'error');
  }
}

function validateBackupPayload(data) {
  if (!data || typeof data !== 'object') return 'File non valido.';
  if (typeof data.version !== 'number') return 'Versione mancante o non valida.';
  if (!Array.isArray(data.listini)) return 'Struttura "listini" mancante o non valida.';
  for (const l of data.listini) {
    if (!l || typeof l !== 'object') return 'Listino non valido.';
    if (typeof l.id !== 'string' || !l.id) return 'ID listino mancante.';
    if (typeof l.fornitore !== 'string') return 'Fornitore listino mancante.';
    if (!Array.isArray(l.articoli)) return 'Articoli listino mancanti.';
  }
  return null;
}

async function importBackupFromFile(file) {
  try {
    const text = await file.text();
    let data;
    try { data = JSON.parse(text); }
    catch { toast('Il file non è un JSON valido.', 'error'); return; }

    const err = validateBackupPayload(data);
    if (err) { toast(err, 'error'); return; }

    const confirmed = confirm(
      `Sostituire i dati attuali con il backup?\n\n` +
      `Backup contiene: ${data.listini.length} listini, ` +
      `${Array.isArray(data.preventivo) ? data.preventivo.length : 0} righe preventivo.\n\n` +
      `Verranno SOVRASCRITTI i listini e il preventivo correnti.`
    );
    if (!confirmed) return;

    await dbClearListini();
    for (const l of data.listini) {
      const safe = {
        id: String(l.id),
        nome: String(l.nome || l.fornitore || 'listino'),
        fornitore: String(l.fornitore || ''),
        dataImport: Number(l.dataImport) || Date.now(),
        numeroArticoli: Number(l.numeroArticoli) || (Array.isArray(l.articoli) ? l.articoli.length : 0),
        scontoMaxCommerciale: parseDec(l.scontoMaxCommerciale || 0),
        isNetto: !!l.isNetto,
        bonusType: String(l.bonusType || ''),
        bonusValue: parseDec(l.bonusValue || 0),
        articoli: (Array.isArray(l.articoli) ? l.articoli : []).map(a => ({
          codice: String(a.codice || '').trim(),
          descrizione: String(a.descrizione || '').trim(),
          prezzoLordo: parseDec(a.prezzoLordo || 0),
          costoTrasporto: parseDec(a.costoTrasporto || 0),
          costoInstallazione: parseDec(a.costoInstallazione || 0)
        }))
      };
      await dbPut(safe);
    }

    if (data.smartSettings && typeof data.smartSettings === 'object') {
      smartSettings = { ...smartSettings, ...data.smartSettings };
      saveSmartSettings();
      // rispecchia nei controlli UI
      const map = {
        toggleSmartMode: smartSettings.smartMode,
        toggleShowVAT: smartSettings.showVAT,
        toggleHideVenduto: smartSettings.hideVenduto,
        toggleHideDiff: smartSettings.hideDiff,
        toggleHideDiscounts: smartSettings.hideDiscounts,
        toggleShowClientDiscount: smartSettings.showClientDiscount
      };
      Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.checked = !!val;
      });
      const vatEl = document.getElementById('vatRate');
      if (vatEl) vatEl.value = smartSettings.vatRate ?? 22;
    }

    if (Array.isArray(data.preventivo)) {
      articoliAggiunti = data.preventivo.map(a => ({
        codice: String(a.codice || ''),
        descrizione: String(a.descrizione || ''),
        prezzoLordo: parseDec(a.prezzoLordo || 0),
        sconto: parseDec(a.sconto || 0),
        sconto2: parseDec(a.sconto2 || 0),
        margine: parseDec(a.margine || 0),
        scontoCliente: parseDec(a.scontoCliente || 0),
        costoTrasporto: parseDec(a.costoTrasporto || 0),
        costoInstallazione: parseDec(a.costoInstallazione || 0),
        quantita: Math.max(1, parseInt(a.quantita || 1, 10) || 1),
        venduto: parseDec(a.venduto || 0),
        fornitore: String(a.fornitore || ''),
        listinoId: a.listinoId || null,
        isNetto: !!a.isNetto,
        scontoMax: parseDec(a.scontoMax || 0),
        bonusType: String(a.bonusType || ''),
        bonusValue: parseDec(a.bonusValue || 0),
        needsApproval: !!a.needsApproval
      }));
    }

    await reloadListini();
    renderTabellaArticoli();
    aggiornaTotaliGenerali();
    applyColumnVisibility();
    updateEquivalentDiscountDisplay();

    toast(`Backup importato: ${data.listini.length} listini.`, 'success');
  } catch (err) {
    console.error(err);
    toast('Errore durante l\'import del backup.', 'error');
  }
}

function bindBackupUI() {
  const btnExport = document.getElementById('btnExportBackup');
  const btnImport = document.getElementById('btnImportBackup');
  const fileInput = document.getElementById('backupFileInput');
  if (btnExport) btnExport.addEventListener('click', exportBackup);
  if (btnImport && fileInput) {
    btnImport.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (f) await importBackupFromFile(f);
      e.target.value = '';
    });
  }
}

/* Expose per onclick legacy nei pulsanti report */
window.inviaReportWhatsApp = inviaReportWhatsApp;
window.generaTXTReport = generaTXTReport;
window.inviaReportWhatsAppSenzaMargine = inviaReportWhatsAppSenzaMargine;
window.generaTXTReportSenzaMargine = generaTXTReportSenzaMargine;
window.rimuoviArticolo = rimuoviArticolo;
window.aggiungiArticoloManuale = aggiungiArticoloManuale;
window.annullaArticoloManuale = annullaArticoloManuale;
