// Drawing the report: every section except the licenses section (render-licenses.js) and the charts (charts.js).

// Everything the current report is built from. Filled in by runReport() in app.js.
const report = {
  historyRows: null, // parsed purchase history
  licenseRows: [], // parsed licenses pages
  gamesPage: null, // parsed games page
  accountName: null,
  isExample: false,
  history: null, // analyzeHistory()
  licenses: null, // analyzeLicenses()
  playtime: null, // analyzePlaytime()
  priceEdits: null, // prices typed in by the visitor (see prices.js)
  keyPurchases: null, // 3rd-party purchases (see purchases.js)
  gameLinks: null, // app id → the license ("date|name") the visitor matched a game to by hand
};
let hideNames = false;

const CATEGORY_COLORS = {
  [CATEGORY.mine]: COLORS.steam,
  [CATEGORY.gifts]: COLORS.gift,
  [CATEGORY.inGame]: COLORS.orange,
  [CATEGORY.market]: COLORS.purple,
  [CATEGORY.hardware]: COLORS.hardware,
};
const CATEGORY_PHRASES = {
  [CATEGORY.mine]: 'games and DLC for yourself',
  [CATEGORY.gifts]: 'gifts',
  [CATEGORY.inGame]: 'in-game items',
  [CATEGORY.market]: 'Market items',
  [CATEGORY.hardware]: 'hardware',
};
const SALE_COLORS = { Summer: COLORS.key, Winter: COLORS.steam, Autumn: COLORS.purple, Spring: COLORS.sale, None: COLORS.free };

// Categories with any spending, hardware left out (it's kept separate from game spending).
const spendingCategories = history =>
  CATEGORIES.filter(c => c !== CATEGORY.hardware && history.byYear[c].some(v => Math.abs(v) > HALF_CENT));

// Spending per year without hardware.
const yearlyWithoutHardware = history => history.netByYear.map((net, i) => net - history.byYear[CATEGORY.hardware][i]);

function renderReport() {
  const { history, licenses } = report;
  destroyCharts();
  currency = history.money;
  renderHeader(history, licenses);
  renderHero(history, licenses);
  renderLedes(history);
  renderSaleTiming(history.saleTiming);
  renderHardware(history);
  renderGifts(history, licenses);
  renderBigSaves(history);
  renderTopGames(history);
  setSectionVisible('keys', !!licenses);
  if (licenses) renderLicenses(licenses);
  renderPlaytime(report.playtime, history);
  renderNotes(history, licenses);
  if (setUpCharts()) {
    buildSpendingCharts(history, report.keyPurchases);
    if (licenses) buildLicenseCharts(licenses);
  } else {
    $$('#report .ch').forEach(c => c.innerHTML = '<p class="vempty">The chart library didn\'t load. The lists and tables still work.</p>');
  }
  buildRail();
}

const tileHtml = (value, label, color) => `<div class="tile" style="--tc:${color}"><b>${escapeHtml(value)}</b><span>${label}</span></div>`;

function discountPercent(original, paid) {
  return original > paid + HALF_CENT ? Math.round((1 - paid / original) * 100) : 0;
}

// Steam-style price box: "-50%  $19.99  $9.99", or just the price when it wasn't discounted.
function discountBlock(original, paid, extraClass = '') {
  const pct = discountPercent(original, paid);
  if (!pct) return `<div class="dblock full ${extraClass}"><div class="prices"><div class="final">${formatMoney(paid)}</div></div></div>`;
  return `<div class="dblock ${extraClass}"><div class="pct">-${pct}%</div><div class="prices"><div class="orig">${formatMoney(original)}</div><div class="final">${formatMoney(paid)}</div></div></div>`;
}

// The same as a single-line badge for tables.
function priceBadge(original, paid) {
  const pct = discountPercent(original, paid);
  if (!pct) return `<span class="pb full"><span class="f">${formatMoney(paid)}</span></span>`;
  return `<span class="pb"><span class="p">-${pct}%</span><span class="o">${formatMoney(original)}</span><span class="f">${formatMoney(paid)}</span></span>`;
}

// Friends' names replaced by "Friend 1", "Friend 2"… when names are hidden.
function friendAliases(history) {
  return new Map(history.topRecipients.map(([name], i) => [name, `Friend ${i + 1}`]));
}

// ---------- header, hero and tiles ----------

function renderHeader(history, licenses) {
  const name = hideNames ? null : report.accountName;
  const years = `${history.years[0]}–${history.years[history.years.length - 1]}`;
  $('#crumb').innerHTML = `${name ? escapeHtml(name) + ' › ' : ''}Account › <b>Purchase history${licenses ? ' and keys' : ''}, ${years}</b>`;
  document.title = `${name ? name + "'s " : ''}Steam spending, ${years}`;

  // Wallet-paid charges in another currency are converted silently (the wallet amount is exact); anything else in
  // another currency has no exchange rate, so it's left out and said so.
  const skipped = history.skipped;
  let warning = '';
  if (skipped.length === 1) {
    const s = skipped[0];
    warning = `Left out 1 transaction charged in ${s.cur} (${s.name}, ${formatDate(s.date)}, ${s.cur} ${s.total.toLocaleString()}). Steam's history doesn't give an exchange rate, so it can't be added to your ${currency.symbol} totals.`;
  } else if (skipped.length) {
    const currencies = [...new Set(skipped.map(s => s.cur))].join(', ');
    warning = `Left out ${skipped.length} transactions charged in ${currencies}. Steam's history doesn't give an exchange rate, so they can't be added to your ${currency.symbol} totals.`;
  }
  $('#rwarn').textContent = warning;
  $('#rwarn').hidden = !warning;
}

function renderHero(history, licenses) {
  const totals = history.totals;
  const games = totals.net - totals.hardware;
  const years = (new Date(history.last) - new Date(history.first)) / (365.25 * 864e5);
  $('#kick').textContent = `${formatDate(history.first)} – ${formatDate(history.last)}`;
  $('#hNet').innerHTML = `${escapeHtml(formatMoney(games))}<small>spent on Steam games, DLC, gifts and items</small>`;
  let subline = `After ${pluralize(totals.refundCount, 'refund')}, across ${pluralize(totals.txCount, 'Steam transaction')}`;
  if (totals.tax > HALF_CENT) subline += `, including ${formatMoneyWhole(totals.tax)} of sales tax`;
  subline += '.';
  if (years >= 1) subline += ` That's about ${formatMoneyWhole(games / years)} a year.`;
  $('#hSub').textContent = subline;

  const keys = keySpend(report.keyPurchases);
  const rows = [['Steam only', formatMoney(games), 'Games, DLC, gifts and items bought on Steam, after refunds', 's']];
  if (keys.orders) {
    rows.push(['3rd-party keys', '+ ' + formatMoney(keys.total), `${pluralize(keys.orders, 'order')} from other stores`, 'k']);
    rows.push(['Steam + keys', formatMoney(games + keys.total), 'Everything spent on Steam games, wherever you bought them', 't']);
  }
  if (licenses && !licenses.synthetic) {
    const matched = keyPurchaseMap(licenses, report.keyPurchases).size;
    rows.push(['Keys activated', licenses.totals.key.toLocaleString(), matched ? `${matched.toLocaleString()} matched to a purchase or gift` : 'Product keys from outside Steam', 'n']);
  }
  if (totals.hardware > HALF_CENT) {
    const devices = new Set(history.hardware.flatMap(h => h.name.split(' + ')
      .filter(n => HARDWARE_PATTERN.test(n))
      .map(n => n.replace(/\s*\(.*\)$/, ''))));
    rows.push(['Hardware', formatMoney(totals.hardware), `Kept separate from the game totals (${[...devices].join(', ')})`, 'h']);
  }
  $('#hTotals').innerHTML = rows.map(([label, value, note, cls]) =>
    `<div class="ht ${cls}"><span class="l">${escapeHtml(label)}</span><b>${escapeHtml(value)}</b><span class="d">${escapeHtml(note)}</span></div>`).join('');

  $('#rList').textContent = formatMoney(totals.list);
  $('#rPaid').textContent = formatMoney(totals.paidPreTax);
  $('#rSale').textContent = `${totals.saleTx} of ${totals.storeTx}`;
  $('#rBlock').outerHTML = discountBlock(totals.list, totals.paidPreTax).replace('<div class="dblock', '<div id="rBlock" class="dblock');

  $('#tiles').innerHTML = [
    tileHtml(totals.itemsMine.toLocaleString(), 'store items bought for yourself (games, DLC, soundtracks)', 'var(--c1)'),
    tileHtml(totals.giftBought.toLocaleString(), 'gift copies bought for friends', 'var(--c2)'),
    tileHtml(formatMoneyWhole(totals.saved), 'saved by buying on sale', 'var(--sale-ink)'),
    tileHtml(totals.avgDiscount + '%', 'average discount on sale checkouts', 'var(--sale-ink)'),
    tileHtml(totals.marketBuyCount.toLocaleString(), 'Market items bought', 'var(--c4)'),
  ].join('');
}

function renderLedes(history) {
  const totals = history.totals;
  const years = history.years.map(String);
  const perYear = yearlyWithoutHardware(history);
  const best = indexOfMax(perYear);
  const median = [...perYear].sort((a, b) => a - b)[Math.floor(perYear.length / 2)];
  const switchable = [totals.hardware > 0 ? 'Hardware' : null, ordersOf(report.keyPurchases).length ? '3rd-party keys' : null].filter(Boolean);
  setLede('#yearLede', [
    `Net spending on Steam after refunds.${switchable.length ? ` ${switchable.join(' and ')} can be switched on below.` : ''}`,
    `Your biggest year was ${years[best]} at ${formatMoneyWhole(perYear[best])}; a typical year is about ${formatMoneyWhole(median)}.`,
  ]);

  const categories = CATEGORIES.filter(c => c !== CATEGORY.hardware);
  const total = sum(categories, c => Math.max(0, history.catTotals[c]));
  const [first, second] = [...categories].sort((a, b) => history.catTotals[b] - history.catTotals[a]);
  const share = c => (history.catTotals[c] / total * 100).toFixed(1);
  setLede('#boughtLede', [
    `${formatMoney(total)} after refunds, hardware excluded.`,
    total > 0 ? `${share(first)}% went on ${CATEGORY_PHRASES[first]}, ${share(second)}% on ${CATEGORY_PHRASES[second]}.` : null,
  ]);

  $('#saveLede').textContent = totals.list > 0 ? `You paid about ${Math.round(totals.paidPreTax / totals.list * 100)}¢ on the dollar across ${pluralize(totals.storeTx, 'checkout')}.` : '';
  $('#saveCall').innerHTML = `<b>${escapeHtml(formatMoneyWhole(totals.saved))}</b><span>saved compared to list prices${totals.saved > totals.paidPreTax ? '. The discount tags added up to more than you actually spent.' : '.'}</span>`;

  const months = topIndexes(history.byMonth, 12);
  const [top, runnerUp, quietest] = [months[0], months[1], months[11]];
  setLede('#monthLede', [
    `All years combined${totals.hardware > 0 ? ', hardware excluded' : ''}.`,
    `${MONTH_NAMES[top]} leads at ${formatMoneyWhole(history.byMonth[top])}, then ${MONTH_NAMES[runnerUp]} at ${formatMoneyWhole(history.byMonth[runnerUp])}. ${MONTH_NAMES[quietest]} is your quietest month.`,
  ]);
}

// ---------- when you buy: seasonal sales ----------

function renderSaleTiming(timing) {
  const show = timing && timing.total > HALF_CENT;
  $('#stWrap').hidden = !show;
  if (!show) return;
  const kinds = [['Summer', 'Summer Sale'], ['Winter', 'Winter Sale'], ['Autumn', 'Autumn Sale'], ['Spring', 'Spring Sale'], ['None', 'Any other time']]
    .filter(([kind]) => timing.by[kind] > HALF_CENT || kind === 'None');
  const biggest = Math.max(...kinds.map(([kind]) => timing.by[kind]));
  $('#stBars').innerHTML = kinds.map(([kind, label]) => {
    const amount = timing.by[kind];
    return `<div class="bar"><span>${label}</span><div class="trk"><div class="fl" style="width:${(amount / biggest * 100).toFixed(1)}%;background:${SALE_COLORS[kind]}"></div></div><span class="v">${escapeHtml(formatMoneyWhole(amount))} · ${Math.round(amount / timing.total * 100)}%</span></div>`;
  }).join('');

  const share = Math.round((timing.total - timing.by.None) / timing.total * 100);
  const dayShare = Math.round(timing.dayShare * 100);
  let note = `${share}% of this spending landed in a seasonal sale, though those sales covered only ${dayShare}% of the days between your first and last purchase.`;
  if (share > dayShare * 1.5) note += ' You wait for the big sales.';
  else if (share < dayShare) note += ' You mostly buy whenever something catches your eye.';
  note += ' Sale dates are matched by day, so a purchase on the first morning before the sale went live still counts.';
  if (timing.after) {
    note += ` ${pluralize(timing.after, 'purchase')} after ${formatDate(STEAM_SALES.coveredUntil)} ${timing.after === 1 ? 'is' : 'are'} left out, because this page doesn't know Steam's sale dates past then yet.`;
  }
  $('#stNote').textContent = note;
  $('#stTop').innerHTML = timing.top.length
    ? timing.top.map(e => `<div class="vrow"><span class="n"><i class="stdot" style="background:${SALE_COLORS[e.type]}"></i>${escapeHtml(e.name)}</span><span class="h">${pluralize(e.n, 'checkout')}</span><span class="c"><b>${escapeHtml(formatMoney(e.amt))}</b></span></div>`).join('')
    : '<p class="vempty">Nothing bought during a seasonal sale.</p>';
}

// ---------- hardware ----------

function renderHardware(history) {
  const orders = history.hardware;
  setSectionVisible('hardware', orders.length > 0);
  if (!orders.length) return;
  const total = sum(orders, h => h.total);
  const biggest = [...orders].sort((a, b) => b.total - a.total)[0];
  setLede('#hwLede', [
    `${formatMoney(total)} across ${pluralize(orders.length, 'order')}, ${(total / history.totals.net * 100).toFixed(1)}% of everything you've spent on Steam.`,
    orders.length > 1 ? `The biggest was ${biggest.name} at ${formatMoneyWhole(biggest.total)}.` : null,
  ]);
  // 1–3 orders sit on one row, 4 make a 2×2 grid, more fill rows of three
  const n = orders.length;
  $('#hwCards').className = 'hwgrid cols-' + (n <= 3 ? n : n === 4 ? 2 : 3);
  $('#hwCards').innerHTML = orders.map(h => hardwareCardHtml(h, total)).join('');
}

function hardwareCardHtml(order, hardwareTotal) {
  const notes = [];
  if (order.deposit) notes.push(`Includes a ${escapeHtml(formatMoney(order.deposit.amt))} deposit paid ${formatDate(order.deposit.date)}.`);
  if (order.others.length && order.others.length < order.name.split(' + ').length) {
    notes.push(`The same checkout included ${escapeHtml(order.others.join(', '))}; Steam charges one price per checkout, so all of it is counted here.`);
  }
  const line = (label, value, cls = 'ln') => `<div class="${cls}"><span>${label}</span><span>${value}</span></div>`;
  return `<div class="hwc">
    <h3>${escapeHtml(order.name)}</h3>
    <div class="d">${formatDate(order.date)}</div>
    <p>${notes.join(' ')}</p>
    ${line('Price', formatMoney(order.paid))}
    ${line('Tax', formatMoney(order.tax || 0))}
    ${line('Shipping', order.ship ? formatMoney(order.ship) : 'None')}
    ${line('Total', formatMoney(order.total), 'ln tot')}
    <div class="share" title="Share of hardware spending"><div style="width:${(order.total / hardwareTotal * 100).toFixed(1)}%"></div></div>
  </div>`;
}

// ---------- gifts ----------

// Steam gift copies, plus keys bought at other stores that went to other people.
function renderGifts(history, licenses) {
  const totals = history.totals;
  const keys = giftedKeys(report.keyPurchases, licenses, report.gamesPage);
  const keyCount = sum(keys, k => k.qty);
  setSectionVisible('gifts', totals.giftBought > 0 || keyCount > 0);
  if (!totals.giftBought && !keyCount) return;

  const given = totals.giftBought - totals.giftRefunded + keyCount;
  $('#giftLede').innerHTML = [
    `<span class="ln">${escapeHtml(pluralize(totals.giftBought, 'Steam gift copy', 'Steam gift copies'))}${totals.giftRefunded ? ` (${totals.giftRefunded} refunded, usually a declined or unclaimed gift)` : ''}.</span>`,
    keyCount ? `<span class="ln"><b class="kg">${escapeHtml(pluralize(keyCount, 'key'))} from 3rd-party stores.</b></span>` : '',
    `<span class="ln">${escapeHtml(pluralize(given, 'game'))} given away in total${keyCount ? `, ${escapeHtml(formatMoney(sum(keys, k => k.paid)))} of it on keys` : ''}.</span>`,
  ].join('');

  // copies per game: sent (s), refunded (r) and 3rd-party keys (k)
  const perGame = new Map();
  const add = (name, field, n) => {
    const key = normalizeName(name);
    if (!perGame.has(key)) perGame.set(key, { name, s: 0, r: 0, k: 0 });
    perGame.get(key)[field] += n;
  };
  history.topGifted.forEach(([name, copies, refunded]) => {
    add(name, 's', copies - refunded);
    add(name, 'r', refunded);
  });
  keys.forEach(k => add(k.name, 'k', k.qty));
  const count = g => g.s + g.k + g.r;
  const games = [...perGame.values()].sort((a, b) => count(b) - count(a) || a.name.localeCompare(b.name));
  const most = count(games[0]);
  const refundedFill = `repeating-linear-gradient(45deg,${COLORS.gift} 0 3px,transparent 3px 6px)`;
  const segment = (n, background) => n ? `<div style="width:${(n / most * 100).toFixed(1)}%;background:${background}"></div>` : '';
  const gameRow = g => `<div class="bar">
      <span>${escapeHtml(g.name)}</span>
      <div class="gbar">${segment(g.s, COLORS.gift)}${segment(g.k, COLORS.key)}${segment(g.r, refundedFill)}<div class="rest"></div></div>
      <span class="v">${count(g)}</span>
    </div>`;
  $('#gLegend').innerHTML = `<span><i style="background:${COLORS.gift}"></i>Steam gift</span>${keyCount ? `<span><i style="background:${COLORS.key}"></i>3rd-party key</span>` : ''}<span><i style="background:${refundedFill}"></i>Refunded</span>`;
  const lists = [{ selector: '#gGames', items: games, row: gameRow }];

  const friends = history.topRecipients;
  if (friends.length) {
    const aliases = friendAliases(history);
    const mostReceived = friends[0][1];
    const friendRow = ([name, n]) => `<div class="bar"><span>${escapeHtml(hideNames ? aliases.get(name) : name)}</span><div class="trk"><div class="fl" style="width:${(n / mostReceived * 100).toFixed(1)}%;background:${COLORS.steam}"></div></div><span class="v">${n}</span></div>`;
    lists.push({ selector: '#gFriends', items: friends, row: friendRow });
  } else {
    $('#gFriends').innerHTML = '<p class="vempty">Steam didn\'t list who received these gifts.</p>';
  }
  scrollableLists(lists, '#gifts .grid2', 10);
}

// Side-by-side lists that show every row but scroll after about `limit` rows. Next to each other they're cut at the
// same line: the lowest point any of them reaches after its first `limit` rows. Stacked (narrow screens), each is
// cut after its own rows. Half of the next row peeks out, so it's clear the list scrolls.
let listResizeObserver = null;
function scrollableLists(lists, containerSelector, limit) {
  lists.forEach(({ selector, items, row }) => $(selector).innerHTML = items.map(row).join(''));
  const boxes = lists.map(({ selector }) => $(selector));
  const fit = () => {
    if (boxes.some(box => !box.clientWidth)) return; // hidden; the observer calls again once it has a size
    boxes.forEach(box => {
      box.style.maxHeight = '';
      box.classList.remove('scrolls');
    });
    const cutAt = boxes.map(box => {
      const next = box.children[limit];
      if (!next) return box.getBoundingClientRect().bottom;
      const r = next.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    const panelTop = box => (box.closest('.panel') || box).getBoundingClientRect().top;
    const sideBySide = boxes.every(box => Math.abs(panelTop(box) - panelTop(boxes[0])) < 2);
    boxes.forEach((box, i) => {
      const height = (sideBySide ? Math.max(...cutAt) : cutAt[i]) - box.getBoundingClientRect().top;
      if (box.scrollHeight > height + 1) {
        box.style.maxHeight = height + 'px';
        box.classList.add('scrolls');
      }
    });
  };
  if (listResizeObserver) listResizeObserver.disconnect();
  // only width changes re-flow the rows; the height changes fit() itself causes are ignored
  let lastWidth = -1;
  listResizeObserver = new ResizeObserver(entries => {
    const width = Math.round(entries[0].contentRect.width);
    if (width === lastWidth) return;
    lastWidth = width;
    fit();
  });
  listResizeObserver.observe($(containerSelector));
}

// ---------- sale savings ----------

function renderBigSaves(history) {
  $('#bigSaves').innerHTML = history.bigSaves.length
    ? history.bigSaves.map(s => `<div class="save"><div class="l"><b>${escapeHtml(s.label)}</b><span>${formatDate(s.date)} · <span class="saved">saved ${escapeHtml(formatMoneyWhole(s.saved))}</span></span></div>${discountBlock(s.orig, s.paid, 'sm')}</div>`).join('')
    : '<p class="vempty">No discounted checkouts found.</p>';
}

// ---------- top games by price paid ----------

// DLC, season passes and the like, recognised by name.
const DLC_PATTERN = /season pass|year \d+ pass|\bdlc\b|soundtrack|\bost\b|expansion pass|founder'?s pack|battle level|battle pass|costume|skin pack|upgrade\b/i;

function renderTopGames(history) {
  const games = topGames(history);
  setSectionVisible('top50', games.length > 0);
  $('#topTitle').textContent = `Top ${games.length} games by price paid`;
  const gamesPage = report.gamesPage;
  const owned = gamesPage ? makeNameMatcher(gamesPage.games) : null;
  const hoursClass = owned ? ' hrs' : '';
  $('#topHead').className = 'tr th' + hoursClass;
  $('#topHead').innerHTML = '<div role="columnheader">#</div><div role="columnheader">Product</div><div role="columnheader">Purchased</div>'
    + (owned ? '<div role="columnheader" class="r">Played</div>' : '') + '<div role="columnheader" class="r">Price</div>';

  const hoursCell = game => {
    if (!owned) return '';
    if (game.gift) return '<div class="hc z" role="cell">gift</div>';
    const match = owned(game.name, false);
    if (match) return `<div class="hc${match.min ? '' : ' z'}" role="cell">${match.min ? formatHours(match.min / 60) : 'never'}</div>`;
    const inBundle = bundleGames(game.name, gamesPage.games);
    if (inBundle) {
      const minutes = sum(inBundle, g => g.min);
      const names = escapeHtml(inBundle.map(g => g.name).join(', '));
      return `<div class="hc${minutes ? '' : ' z'}" role="cell" title="${names}">${minutes ? formatHours(minutes / 60) : 'never'}<span class="hc-sub">${inBundle.length} games</span></div>`;
    }
    return '<div class="hc z" role="cell">–</div>';
  };

  let showAll = false;
  const draw = () => {
    const shown = showAll ? games : games.slice(0, 20);
    $('#rows').innerHTML = shown.map((game, i) => topGameRowHtml(game, i, hoursClass, hoursCell(game))).join('');
    $('#more').hidden = games.length <= 20;
    $('#more').textContent = showAll ? 'Show top 20 only' : `Show all ${games.length}`;
  };
  $('#more').onclick = () => {
    showAll = !showAll;
    draw();
  };
  draw();
}

// The 50 most expensive games bought for yourself or as gifts, per copy. Single-product checkouts are exact; items of
// multi-item checkouts use the per-item split (exact where confirmed, otherwise estimated and marked ≈).
function topGames(history) {
  const priceEdits = report.priceEdits;
  const cartPrices = itemPrices(history.rows, report.gamesPage, priceEdits);
  const candidates = [];
  for (const r of history.rows) {
    if (!((r.kind === 'store' && !r.hw) || r.kind === 'gift') || r.paid == null) continue;
    const names = [...new Set(r.items.map(i => i.name))];
    if (names.length === 1) {
      if (r.refunded.some(Boolean)) continue;
      const copies = r.items.length;
      const edit = editedPrice(priceEdits, r, names[0]);
      candidates.push({
        name: names[0],
        date: r.date,
        paid: edit ? edit.paid : r.paid / copies,
        orig: edit ? edit.list ?? edit.paid : (r.list ?? r.paid) / copies,
        gift: r.kind === 'gift',
        copies,
        est: !edit && !!r.est,
      });
      continue;
    }
    const prices = cartPrices.get(r);
    if (!prices) continue;
    // a refund with no item name that equals one item's price with tax is that item's refund
    const withTax = r.paid > 0 ? r.total / r.paid : 1;
    const refunded = new Set();
    (r.unnamedRef || []).forEach(amount => {
      const k = prices.findIndex((p, j) => !refunded.has(j) && p && Math.abs(p.paid * withTax - amount) <= 0.03);
      if (k >= 0) refunded.add(k);
    });
    const byName = new Map();
    r.items.forEach((item, k) => {
      if (r.refunded[k] || refunded.has(k) || !prices[k]) return;
      const game = byName.get(item.name) || { name: item.name, date: r.date, paid: 0, orig: 0, gift: r.kind === 'gift' || !!item.to, copies: 0, est: false };
      game.paid += prices[k].paid;
      game.orig += Math.max(prices[k].list ?? prices[k].paid, prices[k].paid);
      game.copies++;
      game.est = game.est || prices[k].est;
      byName.set(item.name, game);
    });
    byName.forEach(game => {
      game.paid /= game.copies;
      game.orig /= game.copies;
      candidates.push(game);
    });
  }
  const isDlc = dlcChecker(report.gamesPage);
  return candidates.filter(g => !isDlc(g.name)).sort((a, b) => b.paid - a.paid).slice(0, 50);
}

// Returns isDlc(name). Obvious add-ons are caught by name. With a games page, anything named "<a game you own>:
// something" or "<game> - something" that isn't itself a game in the list is an add-on too.
function dlcChecker(gamesPage) {
  if (!gamesPage) return name => DLC_PATTERN.test(name);
  const baseGame = makeNameMatcher(gamesPage.games.filter(g => g.k !== 'dlc' && g.k !== 'software'));
  const gameNames = gamesPage.games.filter(g => g.k === 'game' || g.k === 'delisted').map(g => normalizeName(g.name));
  return name => {
    if (DLC_PATTERN.test(name)) return true;
    if (baseGame(name, false)) return false;
    const separator = /\s*(?::|\s-\s)\s*/g;
    let m;
    while ((m = separator.exec(name))) {
      const base = normalizeName(name.slice(0, m.index));
      if (base.length < 4) continue;
      if (baseGame(name.slice(0, m.index), false) || gameNames.some(g => g === base || g.endsWith(' ' + base))) return true;
    }
    return false;
  };
}

function topGameRowHtml(game, index, extraClass, hoursCell) {
  const gift = game.gift ? `<span class="gift">GIFT${game.copies > 1 ? ' ×' + game.copies : ''}</span>` : '';
  const estimate = game.est ? '<span class="estm" title="Bought in a multi-item checkout; Steam only records the checkout total, so this is an estimate.">≈</span>' : '';
  return `<div class="tr${extraClass}${index < 3 ? ' top' : ''}" role="row">
    <div class="rk" role="cell">${index + 1}</div>
    <div class="nm" role="cell" title="${escapeHtml(game.name)}">${escapeHtml(game.name)}${gift}</div>
    <div class="dt" role="cell">${formatDate(game.date)}</div>
    ${hoursCell}
    <div class="r" role="cell">${estimate}${priceBadge(game.orig, game.paid)}</div>
  </div>`;
}

// Packs whose contents can't be worked out from the name alone. The pattern is tested against normalized names.
const KNOWN_PACKS = {
  // Dawn of War I and II with their expansions (Steam package 44370); Dawn of War III came out after the pack.
  'dawn of war franchise pack': /^warhammer 40 000 dawn of war( ii)?( (?!iii\b)|$)/,
};

// Games a "<Series> Bundle" most likely contained: games named exactly after the series, or the series plus a
// subtitle ("Crysis", "Crysis Warhead", "Crysis Wars"). Numbered sequels and remasters are left out, since a bundle
// named after the first game usually doesn't include them. Null unless at least two games match.
function bundleGames(name, games) {
  const n = normalizeName(name);
  const isGame = g => !g.k || g.k === 'game' || g.k === 'delisted';
  if (KNOWN_PACKS[n]) {
    const hits = games.filter(g => isGame(g) && KNOWN_PACKS[n].test(normalizeName(g.name)));
    return hits.length ? hits : null;
  }
  if (!/\bbundle$/.test(n)) return null;
  const series = n.replace(/\s+(maximum edition|complete|collection|franchise)?\s*bundle$/, '').trim();
  if (series.length < 4) return null;
  const hits = games.filter(g => {
    if (!isGame(g)) return false;
    const gameName = normalizeName(g.name);
    if (gameName === series) return true;
    if (!gameName.startsWith(series + ' ')) return false;
    const nextWord = gameName.slice(series.length + 1).split(' ')[0];
    return !/^(\d+|ii|iii|iv|v|vi|remastered|remake)$/.test(nextWord);
  });
  return hits.length >= 2 ? hits : null;
}

// ---------- games and playtime ----------

function renderPlaytime(playtime, history) {
  setSectionVisible('play', !!playtime);
  if (!playtime) return;
  const totals = history.totals;
  const perHour = playtime.hours > 0 ? (totals.net - totals.hardware) / playtime.hours : 0;
  setLede('#playLede', [
    `${pluralize(playtime.games, 'game')}, not counting DLC, soundtracks, playtests or software.`,
    `${playtime.played.toLocaleString()} played for ${Math.round(playtime.hours).toLocaleString()} hours, about ${formatMoney(perHour)} per hour of spending.`,
  ]);
  renderGamesMix(playtime);

  const tiles = [
    tileHtml(playtime.games.toLocaleString(), 'games on your account', COLORS.steam),
    tileHtml(Math.round(playtime.hours).toLocaleString(), 'hours played', COLORS.steam),
    tileHtml(Math.round(playtime.never / playtime.games * 100) + '%', `never played (${playtime.never.toLocaleString()} games)`, COLORS.key),
  ];
  const backlog = playtime.backlog;
  if (backlog.n) {
    tiles.push(tileHtml((backlog.est ? '≈ ' : '') + formatMoneyWhole(backlog.total), `spent on ${pluralize(backlog.n, 'game')} you've never played`, COLORS.key));
  }
  tiles.push(tileHtml(formatMoney(perHour), 'per hour played, overall', COLORS.sale));
  if (playtime.achKnown) tiles.push(tileHtml(playtime.perfect.toLocaleString(), 'games with every achievement', COLORS.purple));
  $('#pTiles').innerHTML = tiles.join('');

  const approx = row => row.est ? '≈ ' : '';
  const gameRow = (row, value, hours = formatHours(row.h)) =>
    `<div class="vrow"><span class="n" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</span><span class="h">${hours}</span><span class="c">${value}</span></div>`;
  const costPerHour = row => {
    if (!row.spent) return '';
    const value = `<b>${escapeHtml(formatMoney(row.spent / row.h))}</b>/h`;
    if (row.inGameOnly) {
      const parts = [];
      if (row.linked) parts.push(`${formatMoney(row.linked)} bought outside Steam for this game`);
      if (row.inGame - row.linked > HALF_CENT) parts.push(`${formatMoney(row.inGame - row.linked)} of in-game purchases`);
      return `<span title="The game itself was free or a boxed retail copy, so this counts ${escapeHtml(parts.join(' and '))}.">${approx(row)}${value}</span>`;
    }
    const title = row.inGame ? ` title="Includes ${escapeHtml(formatMoney(row.inGame))} of in-game purchases."` : '';
    return `<span${title}>${approx(row)}${value}</span>`;
  };
  $('#pTop').innerHTML = playtime.top.map(row => gameRow(row, costPerHour(row))).join('');
  $('#pBest').innerHTML = playtime.best.length
    ? playtime.best.map(row => gameRow(row, `${approx(row)}${escapeHtml(formatMoney(row.spent))} · <b>${escapeHtml(formatMoney(row.spent / row.h))}</b>/h`)).join('')
    : '<p class="vempty">No purchases matched to played games.</p>';
  $('#pWorst').innerHTML = playtime.worst.length
    ? playtime.worst.map(row => gameRow(row, approx(row) + escapeHtml(formatMoney(row.spent)))).join('')
    : '<p class="vempty">Nothing you paid for sits under an hour. Nice.</p>';
  $('#pBack').hidden = !backlog.n;
  $('#pBackList').innerHTML = backlog.top.map(row => gameRow(row, `${approx(row)}<b>${escapeHtml(formatMoney(row.spent))}</b>`, '')).join('');
  renderNeverPlayed(playtime);
}

// What the saved games page lists, by the type Steam's store gives each entry.
function renderGamesMix(playtime) {
  const mix = playtime.mix;
  const entries = [['main', playtime.games, 'Games', COLORS.steam]];
  if (playtime.typed && mix.delisted) entries.push(['', mix.delisted, 'No store page (delisted, or part of another game)', COLORS.free]);
  const others = [['test', 'Playtests and betas', COLORS.beta], ['software', 'Software and tools', COLORS.hardware], ['mod', 'Free mods', COLORS.purple], ['dlc', 'Standalone DLC', COLORS.key]];
  for (const [kind, label, color] of others) {
    if (mix[kind]) entries.push(['', mix[kind], label, color]);
  }
  $('#pMix').innerHTML = entries.map(([cls, count, label, color]) => {
    const share = count / playtime.listCount * 100;
    return `<li class="${cls}" style="--gc:${color}">
      <span class="gl">${escapeHtml(label)}</span>
      <span class="gp">${share >= 10 ? share.toFixed(0) : share.toFixed(1)}%</span>
      <b>${count.toLocaleString()}</b>
    </li>`;
  }).join('') + `<li class="total"><span class="gl">Everything on your games page</span><span class="gp">100%</span><b>${playtime.listCount.toLocaleString()}</b></li>`;
  const typedNote = playtime.typed
    ? "Each one is sorted by the type Steam's store gives it. Only apps Steam labels as games are counted and used for the playtime figures below. Steam's own numbers don't agree either: the library counts every entry on this page, and the profile uses a rule Steam doesn't publish."
    : "This page didn't include Steam's store types, so only playtests and betas (spotted by name) are left out.";
  const otherHours = playtime.otherHours >= 1 ? ` The ${Math.round(playtime.otherHours).toLocaleString()} hours spent in the other entries aren't included.` : '';
  $('#pMixNote').textContent = `Your saved games page lists ${playtime.listCount.toLocaleString()} entries. ${typedNote}${otherHours}`;
}

function renderNeverPlayed(playtime) {
  if (!playtime.bySrc) {
    $('#pSrc').innerHTML = '<p class="vempty">Add your licenses page to see this.</p>';
    $('#pSrcNote').textContent = '';
    return;
  }
  // 'other' only appears when there are no licenses pages to tell keys, free games and gifts apart
  $('#pSrc').innerHTML = ['store', 'key', 'gift', 'free', 'other']
    .filter(source => playtime.bySrc[source][0] > 0)
    .map(source => {
      const [games, never] = playtime.bySrc[source];
      const pct = never / games * 100;
      return `<div class="np" style="--c:${LICENSE_SOURCES[source].color}">
        <div class="np-head"><span class="np-name">${LICENSE_SOURCES[source].plural}</span><b>${Math.round(pct)}%</b></div>
        <div class="np-bar" aria-hidden="true"><span class="never" style="width:${pct.toFixed(1)}%"></span></div>
        <div class="np-sub">${never.toLocaleString()} of ${games.toLocaleString()} games never played</div>
      </div>`;
    }).join('');
  $('#pSrcNote').textContent = `Share of each source's games with no playtime. Based on the ${playtime.srcMatched.toLocaleString()} of ${playtime.games.toLocaleString()} games that could be matched to a single license by name.`
    + (report.licenses && report.licenses.synthetic ? ' Add your licenses pages to split keys, free games and gifts apart.' : '');
}

// ---------- methodology ----------

function renderNotes(history, licenses) {
  const totals = history.totals;
  const unnamed = totals.unnamedRefunds;
  const notes = [
    `Source: your Steam purchase history, ${formatDate(history.first)} to ${formatDate(history.last)}. Totals include sales tax and shipping.`,
    `Wallet top-ups and gift cards aren't counted as spending, because the purchases made with that money already are.`,
    `Refunds (${formatMoney(totals.refunds)}) are subtracted from the year and category they came from. Market purchases (${pluralize(totals.marketBuyCount, 'item')}, ${formatMoney(totals.marketBuys)}) are included; Market sales (${formatMoney(totals.marketSales)}) are not subtracted.`,
    unnamed ? `${pluralize(unnamed, 'refund')} in the history ${unnamed === 1 ? "doesn't" : "don't"} name the item. ${unnamed === 1 ? 'It is' : 'They are'} matched to the most recent purchase that could cover the amount, so ${unnamed === 1 ? 'its' : 'their'} category can be off.` : null,
    `Steam shows one price per checkout, not per item. Anything that needs a per-item price (the biggest purchases list, the discount of a single game) only uses checkouts with one product in them.`,
    `List prices and savings come from the original prices Steam shows on discounted checkouts. Checkouts with no discount shown count as full price.`,
    totals.hardware > 0 ? `Hardware is anything shipped, or a Steam Deck, Controller, Link or Index. It counts in the headline total but is left out of the charts so it doesn't swamp the game spending. A cart that mixed hardware and games counts entirely as hardware.` : null,
    `"Games and DLC for you" can't be split further: Steam's purchase history doesn't say whether an item is a game, DLC or soundtrack. The store items count has the same limit, so it is not a game count.`,
    ...(licenses ? licenseNotes(licenses) : []),
  ];
  if (report.playtime) {
    notes.push(
      `Playtime comes from your saved games page: ${pluralize(report.playtime.games, 'game')}, as Steam reports them. Games you own through Family Sharing or that were removed from the store may be missing.`,
      `Cost per hour uses the exact price when a game was the only item in its checkout. Otherwise it uses an estimate, marked ≈: the game's share of a multi-item checkout, or what its key cost at another store. DLC bought on its own counts towards its game. Games are matched to purchases and licenses by name, so a renamed or re-released game can be missed.`,
    );
  }
  $('#notes').innerHTML = notes.filter(Boolean).map(n => `<li>${escapeHtml(n)}</li>`).join('');
}
