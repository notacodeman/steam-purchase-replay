// Reading the pages people save from Steam. Everything here turns a saved page into plain rows; nothing is analyzed.
//
// The row shapes below are also what gets saved in the browser and in downloaded reports, so their field names
// can't change without breaking reports people already have.
//
//   history row  { date, items: [{ name, to, sub }], type, pays: [{ amt, method }], list, paid, tax, ship, total,
//                  cur, curPre, dec, credit, wallet, walletCur, tid }
//   license row  { date, item, acq }
//   games page   { persona, typed, games: [{ id, name, min, last, ach, t, price }] }

const textOf = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : '';

// 'history', 'licenses' or 'unknown'. The games page is recognised from its raw text instead (see addFiles).
function detectPageKind(doc) {
  const heading = textOf(doc.querySelector('.pageheader')) + ' ' + textOf(doc.querySelector('title'));
  if (doc.querySelector('tr.wallet_table_row') || /Purchase History/i.test(heading)) return 'history';
  if (doc.querySelector('td.license_acquisition_col') || /Licenses/i.test(heading)) return 'licenses';
  return 'unknown';
}

// "someone's Purchase History" → "someone"
function accountNameOf(doc) {
  const heading = textOf(doc.querySelector('h2.pageheader')) || textOf(doc.querySelector('.pageheader'));
  const m = heading.match(/^(.+?)['’]s (Purchase History|Licenses)/i);
  return m ? m[1] : null;
}

// ---------- purchase history (store.steampowered.com/account/history) ----------

function parseHistoryPage(doc) {
  const rows = [];
  for (const tr of doc.querySelectorAll('tr.wallet_table_row')) {
    const cell = name => tr.querySelector('td.' + name);
    const date = parseSteamDate(textOf(cell('wht_date')));
    if (!date) continue;
    const typeCell = cell('wht_type');
    const typeDiv = typeCell && [...typeCell.children].find(e => e.tagName === 'DIV' && !e.classList.contains('wth_payment'));
    const { list, paid } = parseBasePrice(cell('wht_base_price'));
    const totalCell = cell('wht_total');
    const totalDiv = totalCell && ([...totalCell.children].find(e => e.tagName === 'DIV' && !e.classList.contains('wth_payment')) || totalCell);
    const total = parseMoney(textOf(totalDiv));
    const walletChange = parseMoney(textOf(cell('wht_wallet_change')));
    rows.push({
      date,
      items: parseItems(cell('wht_items')),
      type: typeDiv ? textOf(typeDiv) : textOf(typeCell),
      pays: parsePayments(typeCell && typeCell.querySelector('.wth_payment')),
      list: list && list.value,
      paid: paid && paid.value,
      tax: (parseMoney(textOf(cell('wht_tax'))) || { value: 0 }).value,
      ship: (parseMoney(textOf(cell('wht_shipping'))) || { value: 0 }).value,
      total: total && total.value,
      cur: total ? total.currency : (walletChange ? walletChange.currency : null),
      curPre: total ? total.symbolFirst : true,
      dec: total ? total.decimalMark : '.',
      credit: /credit/i.test(textOf(totalCell)),
      wallet: walletChange && walletChange.value,
      walletCur: walletChange && walletChange.currency,
      tid: ((tr.getAttribute('onclick') || '').match(/transid=(\d+)/) || [])[1] || null,
    });
  }
  return rows;
}

// Each item is a <div>, optionally followed by a .wth_payment line naming the friend it was gifted to
// or a sub-item (like "500 Crystals" for an in-game purchase).
function parseItems(itemsCell) {
  if (!itemsCell) return [];
  const itemDivs = [...itemsCell.children].filter(e => e.tagName === 'DIV'
    && !e.classList.contains('wth_payment') && !e.classList.contains('wth_item_refunded'));
  if (!itemDivs.length) {
    return textOf(itemsCell) ? [{ name: textOf(itemsCell), to: null, sub: null }] : [];
  }
  const items = [];
  for (const div of itemDivs) {
    const copy = div.cloneNode(true);
    for (const link of copy.querySelectorAll('a')) {
      if (/shipment/i.test(link.textContent)) link.remove();
    }
    const name = textOf(copy).replace(/\s*View Shipment Details\s*$/i, '');
    let to = null;
    let sub = null;
    const next = div.nextElementSibling;
    if (next && next.classList.contains('wth_payment')) {
      const link = next.querySelector('a');
      if (link && /gift sent to/i.test(next.textContent)) to = textOf(link);
      else sub = textOf(next);
    }
    if (name) items.push({ name, to, sub });
  }
  return items;
}

// "Visa **** 1234", or a split payment with one amount per line ("$5.00 Wallet", "$7.99 PayPal").
function parsePayments(paymentEl) {
  if (!paymentEl) return [];
  const lines = [...paymentEl.querySelectorAll('div')].filter(d => !d.querySelector('div'));
  const split = lines.map(line => {
    const text = textOf(line);
    const amount = parseMoney(text);
    if (!amount) return null;
    return { amt: amount.value, method: text.replace(/^[^A-Za-z]*[\d.,]+\s*/, '').replace(/\*+\s*\d+/g, '').trim() };
  }).filter(Boolean);
  const oneAmountedLine = split.length === 1 && lines.length === 1 && /\d/.test(textOf(lines[0]).slice(0, 4));
  if (split.length > 1 || oneAmountedLine) return split;
  return [{ amt: null, method: textOf(paymentEl).replace(/\*+\s*\d+/g, '').trim() }];
}

// A discounted checkout shows the list price and the price paid; otherwise there is one price.
function parseBasePrice(priceCell) {
  if (!priceCell) return { list: null, paid: null };
  const original = priceCell.querySelector('.wht_original_price');
  const discounted = priceCell.querySelector('.wht_discounted_price');
  if (original && discounted) return { list: parseMoney(textOf(original)), paid: parseMoney(textOf(discounted)) };
  const price = parseMoney(textOf(priceCell));
  return { list: price, paid: price };
}

// ---------- licenses (store.steampowered.com/account/licenses) ----------

function parseLicensesPage(doc) {
  const rows = [];
  for (const tr of doc.querySelectorAll('table.account_table tr')) {
    const dateCell = tr.querySelector('td.license_date_col');
    const sourceCell = tr.querySelector('td.license_acquisition_col');
    if (!dateCell || !sourceCell) continue;
    const date = parseSteamDate(textOf(dateCell));
    const cells = [...tr.children];
    const itemCell = cells[cells.indexOf(dateCell) + 1];
    if (!date || !itemCell) continue;
    const copy = itemCell.cloneNode(true);
    copy.querySelectorAll('.free_license_remove_link').forEach(e => e.remove());
    rows.push({ date, item: decodeEntities(textOf(copy)), acq: textOf(sourceCell) });
  }
  return rows;
}

// Some license names arrive double-escaped ("&amp;trade;"). A detached <textarea> decodes them without running markup.
function decodeEntities(text) {
  const textarea = document.createElement('textarea');
  for (let i = 0; i < 3 && /&[#a-z0-9]+;/i.test(text); i++) {
    textarea.innerHTML = text;
    if (textarea.value === text) break;
    text = textarea.value;
  }
  return text;
}

// ---------- games page (steamcommunity.com/my/games/?tab=all) ----------

// The current page embeds its data as JSON inside window.SSR.renderContext; older saves have a `var rgGames` array.
function parseGamesPage(text) {
  let games = null;
  const achievements = {};
  const storeTypes = {};
  const storePrices = {};
  const marker = 'window.SSR.renderContext=JSON.parse(';
  const at = text.indexOf(marker);
  if (at >= 0) {
    try {
      const context = JSON.parse(readJsString(text, at + marker.length));
      for (const query of JSON.parse(context.queryData).queries) {
        const kind = (query.queryKey || [])[0];
        const data = query.state && query.state.data;
        if (kind === 'OwnedGames' && Array.isArray(data)) {
          games = data;
        } else if (kind === 'AchievementProgress' && data && data.appid) {
          achievements[data.appid] = [data.unlocked || 0, data.total || 0];
        } else if (kind === 'StoreItem' && data && data.appid && typeof data.type === 'number') {
          storeTypes[data.appid] = data.type;
          const option = data.best_purchase_option;
          const cents = option && (option.original_price_in_cents || option.final_price_in_cents);
          if (cents) storePrices[data.appid] = +cents / 100;
        }
      }
    } catch (e) {
      console.warn('Games page: could not read renderContext', e);
    }
  }
  if (!games) games = parseOldGamesList(text);
  if (!games) return null;
  const persona = text.match(/\\?"persona_name\\?":\\?"([^"\\]{1,64})/);
  return {
    persona: persona ? persona[1] : null,
    typed: Object.keys(storeTypes).length > 0,
    games: games.map(g => ({
      id: g.appid,
      name: g.name,
      min: g.playtime_forever || 0,
      last: g.rtime_last_played || 0,
      ach: achievements[g.appid] || null,
      t: storeTypes[g.appid] ?? null,
      price: storePrices[g.appid] ?? null,
    })),
  };
}

function parseOldGamesList(text) {
  const m = text.match(/var rgGames\s*=\s*(\[[\s\S]*?\]);\s*\n/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]).map(g => ({
      appid: g.appid,
      name: g.name,
      playtime_forever: Math.round(parseFloat(String(g.hours_forever || '0').replace(/,/g, '')) * 60),
      rtime_last_played: g.last_played || 0,
    }));
  } catch (e) {
    return null;
  }
}

// The JavaScript string literal starting at text[start] (a double quote), decoded.
function readJsString(text, start) {
  let end = start + 1;
  while (end < text.length && text[end] !== '"') end += text[end] === '\\' ? 2 : 1;
  return JSON.parse(text.slice(start, end + 1));
}

// ---------- combining files ----------

// Rows from several saved files, without double counting. A row that appears n times in one file and m times in
// another is kept max(n, m) times: the files overlap, but one checkout can legitimately appear twice.
function mergeRows(fileRows, keyOf) {
  const seen = new Map();
  for (const rows of fileRows) {
    const countInFile = new Map();
    for (const row of rows) {
      const key = keyOf(row);
      countInFile.set(key, (countInFile.get(key) || 0) + 1);
      if (!seen.has(key)) seen.set(key, { keep: 0, rows: [] });
      seen.get(key).rows.push(row);
    }
    countInFile.forEach((n, key) => {
      const entry = seen.get(key);
      entry.keep = Math.max(entry.keep, n);
    });
  }
  return [...seen.values()].flatMap(entry => entry.rows.slice(0, entry.keep));
}
