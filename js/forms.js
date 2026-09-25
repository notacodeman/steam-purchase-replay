// Everything the visitor can edit: 3rd-party purchases (form and spreadsheet import) and Steam prices.

// Re-runs the numbers that depend on purchases and prices, redraws, and saves.
function commitChanges(message) {
  report.keyPurchases = report.keyPurchases || { orders: [] };
  const scroll = scrollY;
  if (report.gamesPage) {
    report.playtime = analyzePlaytime(report.gamesPage, report.history.rows, report.licenses && report.licenses.list, report.keyPurchases, report.priceEdits);
  }
  renderReport();
  scrollTo(0, scroll);
  if (report.isExample) {
    flash(message + ' (this is the example account, so nothing is saved)');
    return;
  }
  const saved = saveState();
  flash(message + (saved ? '' : ' (couldn\'t save everything on this device; download the report to keep it)'));
}

function flash(message) {
  const el = $('#kpFlash');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(flash.timer);
  flash.timer = setTimeout(() => el.hidden = true, 5000);
}

// Reads an amount typed into a form: null when blank, NaN when it isn't a number.
function readAmount(text) {
  if (text == null || String(text).trim() === '') return null;
  const amount = parseMoney(String(text));
  return amount ? amount.value : NaN;
}

// ---------- add / edit a purchase ----------

const purchaseForm = {
  editing: null, // id of the order being edited, or null for a new one
  picked: new Set(), // "date|license name" of the ticked keys
  extra: [], // keys added by searching, outside the date window
  autoPick: true, // tick the unlinked keys around the date the next time the list is drawn
};
const keyId = license => license.date + '|' + license.steamName;

function openPurchaseForm(fields = {}) {
  purchaseForm.editing = fields.id || null;
  const form = $('#buyForm');
  form.reset();
  $('#buyErr').textContent = '';
  $('#buyH').textContent = purchaseForm.editing ? 'Edit purchase' : 'Add a purchase';
  $('#buyDel').hidden = !purchaseForm.editing;
  $('#buyCurLbl').textContent = currency.symbol;
  $('#buyCurLbl').value = currency.symbol;
  $('#buyCurLbl2').textContent = currency.symbol;
  const values = { ...fields, type: fields.type || 'purchase', currency: fields.currency || currency.symbol, gifted: fields.gifted || 0 };
  for (const name of ['type', 'store', 'date', 'name', 'total', 'currency', 'converted', 'gifted', 'platform']) {
    if (values[name] != null) form.elements[name].value = values[name];
  }
  purchaseForm.picked = new Set((fields.keys || []).map(([date, name]) => date + '|' + name));
  purchaseForm.extra = [];
  purchaseForm.autoPick = !fields.keys;
  updatePurchaseForm();
  $('#buyDlg').showModal();
  setTimeout(() => form.elements.date.focus(), 30);
}

// Key activations from the day before to `daysAfter` days after a date, with the purchase each is linked to.
function keysAround(date, daysAfter) {
  const licenses = report.licenses;
  if (!licenses || !date) return [];
  const purchased = keyPurchaseMap(licenses, report.keyPurchases);
  const from = addDays(date, -1);
  const to = addDays(date, daysAfter);
  return licenses.list
    .map((license, index) => ({ index, license, linked: purchased.get(index) }))
    .filter(k => ['key', 'free', 'beta'].includes(k.license.source) && k.license.date >= from && k.license.date <= to);
}

// Shows or hides fields for the purchase type and lists the keys activated around the date.
function updatePurchaseForm() {
  const form = $('#buyForm');
  const type = form.elements.type.value;
  const chosenCurrency = form.elements.currency.value;
  $('#buyConv').hidden = !chosenCurrency || chosenCurrency === currency.symbol;
  $('#buyPlat').hidden = type !== 'nonsteam';
  $('#buyPrice').hidden = type === 'gift' || type === 'free';
  const date = form.elements.date.value;
  const box = $('#buyKeys');
  if (!report.licenses) {
    box.innerHTML = '<p class="vempty">Add your licenses page to link keys to this purchase.</p>';
    return;
  }
  if (!date) {
    box.innerHTML = '<p class="vempty">Pick a date to see the keys you activated around then.</p>';
    return;
  }
  // a subscription month's games can be claimed weeks later
  const nearby = keysAround(date, type === 'sub' ? 35 : 2);
  if (purchaseForm.autoPick) {
    nearby.forEach(k => {
      if (!k.linked && k.license.date <= addDays(date, 1) && k.license.source === 'key') purchaseForm.picked.add(keyId(k.license));
    });
    purchaseForm.autoPick = false;
  }
  const shown = new Set();
  const keys = [...nearby, ...purchaseForm.extra.filter(x => !nearby.some(k => k.index === x.index))].filter(k => {
    const id = keyId(k.license);
    if (shown.has(id)) return false;
    shown.add(id);
    return true;
  });
  box.innerHTML = keys.length ? keys.map(k => {
    const id = keyId(k.license);
    const elsewhere = linkedElsewhere(k.linked);
    const note = elsewhere ? `linked to ${escapeHtml(k.linked.order.bundle || k.linked.order.store || 'another purchase')}` : LICENSE_SOURCES[k.license.source].label;
    return `<label class="kpick${elsewhere ? ' taken' : ''}"><input type="checkbox" data-k="${escapeHtml(id)}" ${purchaseForm.picked.has(id) ? 'checked' : ''} ${elsewhere ? 'disabled' : ''}><span class="d">${formatDate(k.license.date)}</span><span class="n">${escapeHtml(k.license.name)}</span><span class="s">${note}</span></label>`;
  }).join('') : '<p class="vempty">No keys activated within a day of this date. Search below if you redeemed them later.</p>';
  box.querySelectorAll('input').forEach(input => input.onchange = () => {
    if (input.checked) purchaseForm.picked.add(input.dataset.k);
    else purchaseForm.picked.delete(input.dataset.k);
  });
}

// A key linked to some other order than the one being edited can't be ticked.
const linkedElsewhere = linked => linked && !(purchaseForm.editing && linked.order.id === purchaseForm.editing);

function searchKeys(query) {
  const box = $('#buyFound');
  const licenses = report.licenses;
  query = query.trim().toLowerCase();
  if (query.length < 2 || !licenses) {
    box.innerHTML = '';
    return;
  }
  const purchased = keyPurchaseMap(licenses, report.keyPurchases);
  const hits = licenses.list
    .map((license, index) => ({ index, license, linked: purchased.get(index) }))
    .filter(k => k.license.source !== 'store' && (k.license.name.toLowerCase().includes(query) || k.license.rawName.toLowerCase().includes(query)))
    .slice(0, 12);
  box.innerHTML = hits.map(k => `<button type="button" class="kadd" data-i="${k.index}" ${linkedElsewhere(k.linked) ? 'disabled' : ''}>+ ${escapeHtml(k.license.name)} <span>${formatDate(k.license.date)}</span></button>`).join('')
    || '<p class="vempty">No matching key activations.</p>';
  box.querySelectorAll('.kadd').forEach(button => button.onclick = () => {
    const key = hits.find(k => k.index === +button.dataset.i);
    purchaseForm.extra.push(key);
    purchaseForm.picked.add(keyId(key.license));
    updatePurchaseForm();
    box.innerHTML = '';
    $('#buySearch').value = '';
  });
}

// The form's values as makeOrder() fields, and what's wrong with them.
function readPurchaseForm() {
  const fields = $('#buyForm').elements;
  const errors = [];
  const date = fields.date.value;
  const name = fields.name.value.trim();
  const total = readAmount(fields.total.value);
  const converted = readAmount(fields.converted.value);
  const gifted = +fields.gifted.value || 0;
  if (!date) errors.push('Enter the date you bought it.');
  if (Number.isNaN(total)) errors.push('The price must be a number, like 12.99.');
  if (Number.isNaN(converted)) errors.push('The amount charged must be a number.');
  if (gifted < 0 || gifted > 999 || !Number.isInteger(gifted)) errors.push('Copies given away must be a whole number.');
  const keys = [...purchaseForm.picked].map(id => {
    const [keyDate, ...rest] = id.split('|');
    const keyName = rest.join('|');
    const license = report.licenses ? report.licenses.list.find(l => l.date === keyDate && l.steamName === keyName) : null;
    return { lic: [keyDate, keyName], name: license ? license.name : keyName };
  });
  if (!name && !keys.length) errors.push('Give it a name or tick at least one key.');
  return {
    errors,
    fields: {
      id: purchaseForm.editing, type: fields.type.value, date, name, store: fields.store.value.trim(), total,
      currency: fields.currency.value, converted, gifted, platform: fields.platform.value.trim(), keys,
    },
  };
}

function savePurchaseForm(event) {
  event.preventDefault();
  const { errors, fields } = readPurchaseForm();
  if (errors.length) {
    $('#buyErr').innerHTML = errors.map(escapeHtml).join('<br>');
    return;
  }
  report.keyPurchases = report.keyPurchases || { orders: [] };
  const orders = report.keyPurchases.orders;
  const order = makeOrder(fields);
  const existing = orders.findIndex(o => o.id === purchaseForm.editing);
  if (purchaseForm.editing && existing >= 0) orders[existing] = order;
  else orders.push(order);
  $('#buyDlg').close();
  const linked = order.items.filter(i => i.lic).length;
  commitChanges(purchaseForm.editing ? 'Purchase updated.' : `Added ${order.bundle || 'purchase'}${linked ? ` and linked ${pluralize(linked, 'key')}` : ''}.`);
}

function deletePurchase() {
  if (!purchaseForm.editing || !confirm('Delete this purchase?')) return;
  report.keyPurchases.orders = report.keyPurchases.orders.filter(o => o.id !== purchaseForm.editing);
  $('#buyDlg').close();
  commitChanges('Purchase deleted.');
}

function editOrder(id) {
  const order = ordersOf(report.keyPurchases).find(o => o.id === id);
  if (order) openPurchaseForm({ ...orderFormFields(order), id: order.id });
}

// ---------- editing a license row ----------

// A Steam purchase gets a price edit; anything else is edited as a purchase linked to that license.
let priceEditKey = null;
function editLicense(index) {
  const licenses = report.licenses;
  const license = licenses.list[index];
  if (!license) return;
  if (license.source === 'store') {
    const price = licensePrices(licenses, report.history.rows, report.gamesPage, report.priceEdits).get(index) || {};
    priceEditKey = price.editKey || `lic:${license.date}|${license.steamName}`;
    const form = $('#priceForm');
    form.reset();
    $('#priceErr').textContent = '';
    $('#priceWhat').textContent = `${license.name}, bought on Steam${license.date ? ' ' + formatDate(license.date) : ''}. Your price replaces the estimate everywhere it's used: this list, the top games and the cost per hour.`;
    if (price.paid != null) form.elements.paid.value = price.paid.toFixed(2);
    if (price.list != null && price.list > (price.paid || 0)) form.elements.list.value = price.list.toFixed(2);
    const edits = report.priceEdits;
    $('#priceReset').hidden = !(edits && edits[priceEditKey] && edits[priceEditKey].edited);
    $('#priceDlg').showModal();
    return;
  }
  const linked = keyPurchaseMap(licenses, report.keyPurchases).get(index);
  if (linked) {
    editOrder(linked.order.id);
    return;
  }
  const type = license.source === 'free' ? 'free' : license.source === 'gift' ? 'gift' : 'purchase';
  openPurchaseForm({ type, date: license.date || '', name: license.name, keys: [[license.date, license.steamName]] });
}

function savePrice(event) {
  event.preventDefault();
  const form = $('#priceForm');
  const paid = readAmount(form.elements.paid.value);
  const list = readAmount(form.elements.list.value);
  if (paid == null || Number.isNaN(paid) || paid < 0) {
    $('#priceErr').textContent = 'Enter the price you paid as a number, like 12.99.';
    return;
  }
  if (Number.isNaN(list) || (list != null && list < paid)) {
    $('#priceErr').textContent = 'The list price must be a number no lower than what you paid, or left blank.';
    return;
  }
  report.priceEdits = report.priceEdits || {};
  report.priceEdits[priceEditKey] = { paid, list, edited: true };
  $('#priceDlg').close();
  commitChanges('Price saved.');
}

function resetPrice() {
  if (report.priceEdits) delete report.priceEdits[priceEditKey];
  $('#priceDlg').close();
  commitChanges("Back to Steam's figure.");
}

// ---------- spreadsheet import ----------

// Header names accepted for each column.
const SHEET_COLUMNS = {
  date: ['date', 'order date', 'purchased', 'purchase date', 'bought'],
  store: ['store', 'shop', 'site', 'seller', 'source'],
  product: ['product', 'name', 'game', 'title', 'item', 'bundle'],
  price: ['price', 'total', 'amount', 'paid', 'cost'],
  currency: ['currency', 'cur'],
  type: ['type', 'kind'],
  gifted: ['gifted', 'given away', 'copies given', 'gift copies'],
  platform: ['platform', 'drm'],
};
// Words in the type column → purchase type. Anything else is a purchase.
const SHEET_TYPES = [
  ['sub', /subscri|monthly|choice/i],
  ['gift', /gift (received|to me)|received/i],
  ['free', /free|giveaway/i],
  ['nonsteam', /not steam|non-steam|xbox|switch|playstation|epic|gog|origin|ubisoft/i],
];
const SHEET_TEMPLATE = 'date,store,product,price,currency,type,gifted\n'
  + '2024-03-31,Humble Bundle,Humble Indie Bundle 12,10.00,USD,bundle,0\n'
  + '2025-07-19,GG.deals,HYPER DEMON,3.25,USD,purchase,0\n'
  + '2024-09-07,Fanatical,Golf Gang,1.73,USD,purchase,3\n'
  + '2025-08-05,Humble Bundle,August 2025 Humble Choice,14.99,USD,subscription,0\n';
const MAX_SHEET_BYTES = 5e6;

let importRows = [];

// CSV or TSV, delimiter guessed from the header line, quoted cells supported.
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const header = text.split(/\r?\n/)[0] || '';
  const delimiter = ['\t', ';', ','].map(d => [d, header.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        cell += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === delimiter) {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += c;
    }
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

// "2024-03-31", "31/03/2024", "3/31/24", "Mar 31, 2024" or an Excel serial number. A date that reads both ways
// (03/04/2024) comes back as { ambiguous: true, us, eu } for the visitor to choose.
function parseSheetDate(text) {
  text = String(text || '').trim();
  if (!text) return null;
  let m = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return isoDate(+m[1], +m[2] - 1, +m[3]);
  m = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (m) {
    const [a, b] = [+m[1], +m[2]];
    const year = +m[3] < 100 ? +m[3] + 2000 : +m[3];
    if (a > 12 && b <= 12) return isoDate(year, b - 1, a);
    if (b > 12 && a <= 12) return isoDate(year, a - 1, b);
    if (a <= 12 && b <= 12) return { ambiguous: true, us: isoDate(year, a - 1, b), eu: isoDate(year, b - 1, a) };
    return null;
  }
  if (/^\d{5}$/.test(text)) return new Date(Date.UTC(1899, 11, 30) + (+text) * 864e5).toISOString().slice(0, 10);
  return parseSteamDate(text);
}

async function readSheet(file) {
  const name = file.name.toLowerCase();
  if (file.size > MAX_SHEET_BYTES) throw new Error('That file is over 5 MB, which is more than a purchase list should need.');
  if (/\.(xlsx|xls|ods)$/.test(name)) {
    if (!window.XLSX) await loadSheetReader();
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: false, defval: '' });
  }
  if (!/\.(csv|tsv|txt)$/.test(name) && file.type && !/text|csv/.test(file.type)) {
    throw new Error('That file type isn\'t supported. Use a .csv, .tsv or .xlsx spreadsheet.');
  }
  return parseCSV(await file.text());
}

// SheetJS is only fetched when someone imports an Excel file.
function loadSheetReader() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('The spreadsheet reader didn\'t load. Save the sheet as CSV and try again.'));
    document.head.appendChild(script);
  });
}

// Checks every row. Returns { ok: [rows], bad: [{ line, errs }], ambiguous: count, fatal: message }.
function validateSheet(rows) {
  const result = { ok: [], bad: [], ambiguous: 0 };
  if (rows.length < 2) {
    result.fatal = 'The file needs a header row and at least one purchase.';
    return result;
  }
  const header = rows[0].map(h => String(h).trim().toLowerCase());
  const column = {};
  Object.entries(SHEET_COLUMNS).forEach(([field, names]) => {
    const i = header.findIndex(h => names.includes(h));
    if (i >= 0) column[field] = i;
  });
  const missing = ['date', 'product'].filter(field => column[field] == null);
  if (missing.length) {
    result.fatal = `Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. The first row must be headers, e.g. date, store, product, price.`;
    return result;
  }
  rows.slice(1).forEach((row, k) => {
    const value = field => column[field] != null ? String(row[column[field]] ?? '').trim() : '';
    const errors = [];
    const date = parseSheetDate(value('date'));
    if (date && date.ambiguous) result.ambiguous++;
    if (!date) errors.push(`date "${value('date') || '(empty)'}" isn't a date I can read (use 2024-03-31)`);
    const product = value('product');
    if (!product) errors.push('product is empty');
    let price = null;
    const priceText = value('price');
    if (priceText && !/^(-+|n\/?a|unknown|\?)$/i.test(priceText)) {
      price = parseMoney(priceText);
      if (!price) errors.push(`price "${priceText}" isn't a number`);
    }
    const giftedText = value('gifted');
    const gifted = !giftedText ? 0 : /^(y|yes|true|x)$/i.test(giftedText) ? 1 : +giftedText;
    if (!Number.isFinite(gifted) || gifted < 0) errors.push(`gifted "${giftedText}" should be a number of copies or yes/no`);
    const typeText = value('type');
    const type = SHEET_TYPES.reduce((found, [t, pattern]) => pattern.test(typeText) ? t : found, 'purchase');
    const rowCurrency = value('currency') || (price && price.currency) || '';
    if (errors.length) {
      result.bad.push({ line: k + 2, errs: errors });
      return;
    }
    result.ok.push({
      line: k + 2, date, product, store: value('store'), price: price ? price.value : null,
      cur: rowCurrency && rowCurrency !== '$' && rowCurrency.toUpperCase() !== 'USD' ? rowCurrency : '',
      type, gifted, platform: value('platform'),
    });
  });
  return result;
}

function showImportPreview(result) {
  const box = $('#impRes');
  if (result.fatal) {
    box.innerHTML = `<div class="msg err">${escapeHtml(result.fatal)}</div>`;
    $('#impGo').hidden = true;
    return;
  }
  let html = `<p><b>${pluralize(result.ok.length, 'row')}</b> ready to import${result.bad.length ? `, <b>${pluralize(result.bad.length, 'row')}</b> skipped` : ''}.</p>`;
  if (result.ambiguous) {
    html += `<div class="msg warn">${pluralize(result.ambiguous, 'date')} could be read either way (like 03/04/2024). <label><input type="radio" name="dfmt" value="us" checked> Month first (US)</label> <label><input type="radio" name="dfmt" value="eu"> Day first</label></div>`;
  }
  if (result.bad.length) {
    html += `<details class="impbad"><summary>Skipped rows</summary><ul>${result.bad.slice(0, 50).map(b => `<li>Row ${b.line}: ${escapeHtml(b.errs.join('; '))}</li>`).join('')}</ul></details>`;
  }
  if (result.ok.length) {
    const previewRow = r => {
      const date = r.date.ambiguous ? escapeHtml(r.date.us) + '?' : formatDate(r.date);
      const price = r.price == null ? '–' : escapeHtml((r.cur ? r.cur + ' ' : '') + r.price);
      return `<div class="tr imp"><div class="dt">${date}</div><div class="nm">${escapeHtml(r.product)}</div><div>${escapeHtml(r.store || '–')}</div><div class="pr">${price}</div></div>`;
    };
    html += '<div class="tbl"><div class="tr th imp" role="row"><div>Date</div><div>Product</div><div>Store</div><div class="pr">Price</div></div>'
      + result.ok.slice(0, 8).map(previewRow).join('') + '</div>';
    if (result.ok.length > 8) html += `<p class="vempty">…and ${result.ok.length - 8} more.</p>`;
  }
  box.innerHTML = html;
  $('#impGo').hidden = !result.ok.length;
  importRows = result.ok;
}

// Adds each row as a purchase and links keys: a key with the same name activated from the day before on, or for a
// bundle or subscription, every unlinked key activated that day or the next.
function importPurchases() {
  const dayFirst = ($('input[name="dfmt"]:checked') || {}).value === 'eu';
  report.keyPurchases = report.keyPurchases || { orders: [] };
  let linked = 0;
  for (const row of importRows) {
    const date = row.date.ambiguous ? (dayFirst ? row.date.eu : row.date.us) : row.date;
    const unlinked = unlinkedKeys(report.licenses);
    const wanted = normalizeName(row.product);
    const sameName = unlinked
      .filter(l => l.date >= addDays(date, -1) && (normalizeName(l.name) === wanted || normalizeName(l.rawName) === wanted
        || stripEditionSuffix(normalizeName(l.name)) === stripEditionSuffix(wanted)))
      .sort((a, b) => a.date < b.date ? -1 : 1)[0];
    let keys = [];
    if (sameName) {
      keys = [sameName];
    } else if (/bundle|pack|collection|monthly|choice/i.test(row.product) || row.type === 'sub') {
      keys = unlinked.filter(l => l.date === date || l.date === addDays(date, 1));
    }
    linked += keys.length;
    report.keyPurchases.orders.push(makeOrder({
      type: row.type, date, name: row.product, store: row.store, total: row.price, currency: row.cur || currency.symbol,
      converted: null, gifted: row.gifted, platform: row.platform, keys: keys.map(l => ({ lic: [l.date, l.steamName], name: l.name })),
    }));
  }
  $('#impDlg').close();
  commitChanges(`Imported ${pluralize(importRows.length, 'purchase')} and linked ${pluralize(linked, 'key')}. Check them in the list below.`);
}

// ---------- wiring ----------

function initForms() {
  $('#kpAdd').onclick = () => openPurchaseForm({});
  $('#kpImport').onclick = () => {
    $('#impFile').value = '';
    $('#impRes').innerHTML = '';
    $('#impGo').hidden = true;
    $('#impDlg').showModal();
  };
  $('#kpTpl').onclick = () => downloadFile(SHEET_TEMPLATE, 'text/csv', 'steam-replay-purchases-template.csv');
  $('#impFile').onchange = async event => {
    const file = event.target.files[0];
    if (!file) return;
    $('#impRes').innerHTML = '<p class="vempty">Reading…</p>';
    try {
      showImportPreview(validateSheet(await readSheet(file)));
    } catch (error) {
      $('#impRes').innerHTML = `<div class="msg err">${escapeHtml(error.message || 'That file couldn\'t be read.')}</div>`;
      $('#impGo').hidden = true;
    }
  };
  $('#impGo').onclick = importPurchases;
  $$('#impDlg .x, #buyDlg .x, #priceDlg .x').forEach(button => button.onclick = () => button.closest('dialog').close());

  const form = $('#buyForm');
  ['type', 'currency', 'date'].forEach(name => form.elements[name].addEventListener('change', () => {
    // a new date means a new set of nearby keys; when editing, the ticked keys stay
    if (name === 'date' && !purchaseForm.editing) {
      purchaseForm.autoPick = true;
      purchaseForm.picked = new Set();
    }
    updatePurchaseForm();
  }));
  $('#buySearch').oninput = event => searchKeys(event.target.value);
  form.onsubmit = savePurchaseForm;
  $('#buyDel').onclick = deletePurchase;

  $('#priceForm').onsubmit = savePrice;
  $('#priceReset').onclick = resetPrice;
  $('#krows').addEventListener('click', event => {
    const button = event.target.closest('[data-lic]');
    if (button) editLicense(+button.dataset.lic);
  });
  $('#kpRows').addEventListener('click', event => {
    const button = event.target.closest('[data-edit]');
    if (button) editOrder(button.dataset.edit);
  });
}
