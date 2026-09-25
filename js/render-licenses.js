// The "Licenses and keys" section: summary tiles, the 3rd-party purchases panel and the table of every license.

function renderLicenses(licenses) {
  if (licenses.synthetic) renderPiecedTogetherSummary(licenses);
  else renderLicensesSummary(licenses);
  renderKeyPurchases(report.keyPurchases, licenses);
  renderLicenseTable(licenses);
}

function renderLicensesSummary(licenses) {
  const totals = licenses.totals;
  const added = totals.store + totals.key + totals.free + totals.gift;
  const keyShare = added ? Math.round(totals.key / added * 100) : 0;
  $('#keyLede').textContent = `Every key you activated from ${formatDate(licenses.first)} to ${formatDate(licenses.last)}, from bundles, key stores, boxed copies and anywhere else off-Steam. There are no prices here, because Steam doesn't record what you paid for a key elsewhere, so none of this changes the spending totals above.`;
  $('#kTiles').innerHTML = [
    tileHtml(totals.key.toLocaleString(), 'product keys activated', COLORS.key),
    tileHtml(keyShare + '%', 'of licenses came from a key', COLORS.key),
    tileHtml(totals.store.toLocaleString(), 'licenses bought on Steam', COLORS.steam),
    tileHtml(totals.free.toLocaleString(), 'free licenses', COLORS.free),
    tileHtml(totals.gift.toLocaleString(), 'gift licenses received', COLORS.gift),
  ].join('');
  const gameCount = report.playtime
    ? ` Going by the type Steam gives each app, you have ${report.playtime.games.toLocaleString()} games (see Games and playtime).`
    : ' Add your games page for a real game count.';
  $('#kLicNote').textContent = `A license is anything Steam adds to your account: a game, but also each DLC, soundtrack, costume pack or free promo. So ${added.toLocaleString()} licenses doesn't mean ${added.toLocaleString()} games.${gameCount}`;

  const sprees = licenses.sprees.slice(0, 6);
  $('#sprees').innerHTML = sprees.length ? sprees.map(spree => {
    const names = escapeHtml(spree.names.slice(0, 3).join(', ')) + (spree.n > 3 ? `, and ${spree.n - 3} more` : '');
    return `<details class="spree"><summary><span><b>${formatDate(spree.date)}</b><span class="s">${names}</span></span><span class="n">${pluralize(spree.n, 'key')}</span></summary><ul>${spree.names.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ul></details>`;
  }).join('') : '<p class="vempty">No product keys found.</p>';

  const { monthKeys, monthStore, monthYears } = licenses;
  if (monthYears[1] >= monthYears[0] && sum(monthKeys) && sum(monthStore)) {
    const store = topThreeMonths(monthStore);
    const keys = topThreeMonths(monthKeys);
    $('#kMonthNote').textContent = `Full years ${monthYears[0]}–${monthYears[1]} only. The top three months hold ${store.share}% of store purchases (${store.names}) and ${keys.share}% of key activations (${keys.names}). If purchases were spread evenly across the year, any three months would hold 25% (3 of 12), so the higher the number, the more it bunches up.`;
  } else {
    $('#kMonthNote').textContent = 'Not enough full years yet to compare months.';
  }
}

// The three busiest months: their share of the year's total and their names.
function topThreeMonths(counts) {
  const top = topIndexes(counts, 3);
  return { share: Math.round(sum(top, i => counts[i]) / sum(counts) * 100), names: top.map(i => MONTHS[i]).join(', ') };
}

// No licenses pages: the list is built from the purchase history and games page.
function renderPiecedTogetherSummary(licenses) {
  const totals = licenses.totals;
  $('#keyLede').textContent = "You didn't add your licenses pages, so this is pieced together from your purchase history"
    + (report.gamesPage ? ' and games page' : '') + '. Everything bought on Steam has a date; games that came from keys, free claims or gifts can\'t be told apart or dated.';
  const tiles = [tileHtml(totals.store.toLocaleString(), 'bought on Steam', COLORS.steam)];
  if (totals.other) tiles.push(tileHtml(totals.other.toLocaleString(), 'from keys, free claims or gifts', COLORS.other));
  $('#kTiles').innerHTML = tiles.join('');
  $('#kLicNote').textContent = 'Add your licenses pages (see step 2 on the upload screen) to see every product key, free game and gift with its date.';
  $('#sprees').innerHTML = '<p class="vempty">Needs your licenses pages, which record when each key was activated.</p>';
  const store = sum(licenses.monthStore) ? topThreeMonths(licenses.monthStore) : null;
  $('#kMonthNote').textContent = store
    ? `Store purchases only, since keys need your licenses pages. The top three months hold ${store.share}% of them (${store.names}); an even spread would be 25%.`
    : '';
}

function licenseNotes(licenses) {
  if (licenses.synthetic) {
    return [
      'No licenses pages were added, so the Licenses and keys section is pieced together: products bought on Steam come from the purchase history (with their dates), and every other game on your games page is listed as a key, free claim or gift, with no date.',
      'Without the licenses pages, product keys, free games and gifts received can\'t be told apart, and key activations per year and month can\'t be shown.',
    ];
  }
  const betas = licenses.totals.beta;
  return [
    `Product keys come from Steam's "Licenses and product key activations" page, ${formatDate(licenses.first)} to ${formatDate(licenses.last)}. Anything marked Retail there counts as a key. Keys have no price attached, so they never feed into the dollar figures.`,
    'Each row on that page is a license, not a key. A single key occasionally grants more than one license (a game plus its soundtrack, say), so the key count can run slightly high.',
    betas ? `${pluralize(betas, 'beta or playtest key', 'beta and playtest keys')} ${betas === 1 ? 'is' : 'are'} listed but not counted as keys.` : null,
    'Region and packaging tags like "(RoW)", "Retail" or "[Digital]" are trimmed from license names; hover a row to see Steam\'s original package name.',
    '"Bought on Steam", "Free" and "Gifts received" use Steam\'s own labels (Steam Store, Complimentary, Gift/Guest Pass).',
    ordersOf(report.keyPurchases).length ? 'Keys marked 3rd-party were bought from a key store outside Steam, from order receipts you provided. Their cost is shown next to each key but kept out of all Steam spending figures.' : null,
  ];
}

// ---------- every license on your account ----------

const PAGE_SIZE = 25;

function renderLicenseTable(licenses) {
  const list = licenses.list;
  const prices = licensePrices(licenses, report.history && report.history.rows, report.gamesPage, report.priceEdits);
  const purchased = keyPurchaseMap(licenses, report.keyPurchases);
  // keys (or, without licenses pages, anything not bought on Steam) with no purchase behind them anywhere
  const isUnaccounted = (license, i) => (license.source === 'key' || license.source === 'other') && !purchased.has(i);
  const unaccounted = sum(list, (license, i) => isUnaccounted(license, i) ? 1 : 0);

  $('#ksNa').hidden = !unaccounted;
  $('#kUnacc').hidden = !unaccounted;
  if (unaccounted) {
    const what = licenses.synthetic ? 'keys, free games or gifts' : 'keys bought elsewhere or given to you';
    $('#kUnacc').innerHTML = `<b>${unaccounted.toLocaleString()}</b> ${unaccounted === 1 ? 'license isn\'t' : 'licenses aren\'t'} in your purchase history or linked to a 3rd-party purchase: ${what}. They're highlighted below; add a purchase to account for one. <button class="linkbtn" type="button" id="kUnaccGo">Show only these</button>`;
    $('#kUnaccGo').onclick = () => {
      $('#ks').value = 'unaccounted';
      $('#ks').onchange();
    };
  }

  $('#ky').innerHTML = '<option value="">All years</option>' + [...licenses.years].reverse().map(y => `<option>${y}</option>`).join('');
  $('#ksKp').hidden = !ordersOf(report.keyPurchases).length;
  // without licenses pages keys, free games and gifts are one group
  const detailedSources = ['key', 'free', 'gift', 'beta'];
  $$('#ks option').forEach(option => {
    if (detailedSources.includes(option.value)) option.hidden = licenses.synthetic;
    if (option.value === 'other') option.hidden = !licenses.synthetic;
  });
  $('#kq').value = '';
  $('#ks').value = '';

  let limit = PAGE_SIZE;
  let matching = 0;
  const draw = () => {
    const query = $('#kq').value.trim().toLowerCase();
    const year = $('#ky').value;
    const source = $('#ks').value;
    const matchesSource = (license, i) => !source
      || (source === 'purchased' ? purchased.has(i) : source === 'unaccounted' ? isUnaccounted(license, i) : license.source === source);
    const matchesQuery = (license, i) => !query
      || license.name.toLowerCase().includes(query)
      || license.rawName.toLowerCase().includes(query)
      || (purchased.has(i) && purchased.get(i).name.toLowerCase().includes(query));
    const rows = list.map((license, i) => [license, i])
      .filter(([license, i]) => (!year || license.date.startsWith(year)) && matchesSource(license, i) && matchesQuery(license, i));
    matching = rows.length;
    $('#krows').innerHTML = rows.length
      ? rows.slice(0, limit).map(([license, i]) => licenseRowHtml(license, i, licensePriceHtml(license, i, prices, purchased), purchased.get(i), isUnaccounted(license, i))).join('')
      : '<div class="kempty">Nothing matches. Try a shorter search or pick All years.</div>';
    $('#kcnt').textContent = `${rows.length.toLocaleString()} of ${list.length.toLocaleString()}`;
    $('#kmore').hidden = rows.length <= PAGE_SIZE;
    $('#kmore').textContent = limit >= rows.length ? 'Show fewer' : `Show ${Math.min(100, rows.length - limit)} more`;
  };
  const redraw = () => {
    limit = PAGE_SIZE;
    draw();
  };
  $('#kq').oninput = redraw;
  $('#ks').onchange = redraw;
  $('#ky').onchange = redraw;
  $('#kmore').onclick = () => {
    limit = limit >= matching ? PAGE_SIZE : limit + 100;
    draw();
  };
  draw();
}

function licenseRowHtml(license, index, priceHtml, keyPurchase, unaccounted) {
  const source = LICENSE_SOURCES[license.source];
  // a license named in another script (e.g. Chinese) also shows the name the key was sold under
  const soldAs = keyPurchase && normalizeName(keyPurchase.name) !== normalizeName(license.name) && !/[a-z]/i.test(license.name)
    ? ` <span class="pz">(${escapeHtml(keyPurchase.name)})</span>`
    : '';
  return `<div class="tr k${unaccounted ? ' unacc' : ''}" role="row">
    <div class="dt" role="cell">${formatDate(license.date)}</div>
    <div class="nm" role="cell" title="${escapeHtml(license.steamName)}">${escapeHtml(license.name)}${soldAs}<button class="oedit" data-lic="${index}" aria-label="Edit ${escapeHtml(license.name)}">Edit</button></div>
    <div class="pr" role="cell">${priceHtml}</div>
    <div class="sc" role="cell"><span class="src" title="${source.label}"><i style="background:${source.color}"></i><span>${source.label}</span></span></div>
  </div>`;
}

const muted = text => `<span class="pz">${text}</span>`;
const tag = (text, extraClass = '') => `<span class="tp${extraClass ? ' ' + extraClass : ''}">${text}</span>`;
const withTitle = (title, html) => `<span title="${escapeHtml(title)}">${html}</span>`;

function licensePriceHtml(license, index, prices, purchased) {
  switch (license.source) {
    case 'free': return muted('Free');
    case 'gift': return muted('Gift');
    case 'beta': return muted('Beta');
    case 'key':
    case 'other': return keyPriceHtml(license, purchased.get(index));
  }
  const price = prices.get(index);
  if (!price || price.none) return muted('–');
  const title = price.edited ? 'You entered this price.'
    : price.est ? `Estimated: bought in a ${price.cart}-item checkout, and Steam only records the checkout total. Split by each item's list price.`
      : price.cart ? `Exact, from a ${price.cart}-item checkout.` : 'Exact.';
  const edited = price.edited ? '<span class="edited" aria-label="edited">✎</span> ' : '';
  const list = price.list > price.paid + HALF_CENT ? ' ' + muted(`(${price.listEst ? '≈ ' : ''}${escapeHtml(formatMoney(price.list))})`) : '';
  return withTitle(title, `${edited}${price.est ? '≈ ' : ''}${escapeHtml(formatMoney(price.paid))}${list}`);
}

function keyPriceHtml(license, purchase) {
  if (!purchase) {
    return withTitle('Not in your purchase history and not linked to a 3rd-party purchase. Use Edit to add where it came from.',
      muted(license.source === 'key' ? 'Key' : '–') + tag('Unaccounted', 'na'));
  }
  const order = purchase.order;
  const store = order.store || 'a 3rd-party store';
  if (order.notSteam) {
    return withTitle(`From ${order.bundle || 'a non-game bundle'} (${formatMoney(order.total)}), which isn't counted in game totals.`,
      muted(`≈ ${escapeHtml(formatMoney(purchase.paid))} · ${escapeHtml(order.notSteam.toLowerCase())}`));
  }
  if (order.giftReceived) {
    return order.freeGiveaway
      ? withTitle(`Free giveaway from ${store}.`, muted('Free') + tag('Giveaway', 'gr'))
      : withTitle(`${order.giftNote || 'Key received as a gift'}. It cost you nothing.`, muted('Free') + tag('Gift received', 'gr'));
  }
  if (purchase.included) {
    return withTitle(`Part of the ${order.bundle || 'same'} order (${formatMoney(order.total)}), which is shown on its main row.`, muted('Included') + tag('3rd-party'));
  }
  if (purchase.paid == null) return withTitle(`Key bought from ${store}; price not known.`, muted('Price unknown') + tag('3rd-party'));
  const title = purchase.est
    ? `Part of a ${formatMoney(order.total)} bundle bought from a 3rd-party store on ${formatDate(order.date)}; the bundle price is split evenly across its games.`
    : `Key bought from a 3rd-party store on ${formatDate(order.date)}${purchase.item != null ? `: ${formatMoney(purchase.item)} plus its share of the ${formatMoney(order.fee)} service fee` : ''}.`;
  return withTitle(title + ' Not part of your Steam spending.', `${purchase.est ? '≈ ' : ''}${escapeHtml(formatMoney(purchase.paid))}${tag('3rd-party')}`);
}

// ---------- 3rd-party key purchases ----------

function renderKeyPurchases(keyPurchases, licenses) {
  const orders = ordersOf(keyPurchases);
  const any = orders.length > 0;
  $('#kpPanel').hidden = false;
  $('#kpEmpty').hidden = any;
  $('#kpNote').hidden = !any;
  $('#kpSum').hidden = !any;
  $('#kpPanel .tbl').hidden = !any;
  renderSuggestions(licenses);
  if (!any) {
    $('#kpMore').hidden = true;
    return;
  }
  orders.forEach(order => order.id = order.id || newId());

  // newest first, so a purchase you just added is at the top; orders with no known date go last
  const newestFirst = (a, b) => !a.date ? 1 : !b.date ? -1 : a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
  const bought = orders.filter(o => !o.giftReceived).sort(newestFirst);
  const steamKeys = bought.filter(o => !o.notSteam); // counted in the totals
  const otherItems = bought.filter(o => o.notSteam); // other platforms and non-game bundles, listed only
  const status = keyStatusChecker(licenses, report.gamesPage);
  const total = sum(steamKeys, o => o.total);
  const uncounted = ['refunded', 'sub', 'nomatch'];
  const [summary, ...details] = purchaseNote({
    orders,
    steamKeys,
    otherItems,
    total,
    fees: sum(steamKeys, o => o.fee || 0),
    keys: sum(steamKeys, o => sum(o.items, item => uncounted.includes(item.status) ? 0 : (item.qty || 1))),
    gifted: sum(giftedKeys({ orders: steamKeys }, licenses, report.gamesPage), k => k.qty),
    refunded: sum(steamKeys, o => o.refunded || 0),
  });
  $('#kpNote').innerHTML = `<p class="kpct">${escapeHtml(summary)}</p>`
    + (details.length ? `<details class="kpmore"><summary>How these are counted</summary><p class="kpct">${escapeHtml(details.join(' '))}</p></details>` : '');

  const totals = report.history.totals;
  const onSteam = totals.net - totals.hardware;
  const box = (color, amount, label, extraClass = '') => `<div class="ks${extraClass}" style="--kc:${color}"><b>${escapeHtml(formatMoney(amount))}</b><span>${label}</span></div>`;
  const operator = sign => `<div class="op" aria-hidden="true">${sign}</div>`;
  $('#kpSum').innerHTML = box(COLORS.steam, onSteam, 'On Steam: games, DLC, gifts and items, after refunds') + operator('+')
    + box(COLORS.key, total, '3rd-party keys') + operator('=')
    + box(COLORS.sale, onSteam + total, 'Total spent on games', ' tot')
    + (totals.hardware > HALF_CENT ? `<p class="hw">With ${escapeHtml(formatMoney(totals.hardware))} of Steam hardware added, everything comes to ${escapeHtml(formatMoney(totals.net + total))}.</p>` : '');

  const rows = [];
  for (const order of [...orders].sort(newestFirst)) {
    for (const item of order.items) {
      const key = status(item, order);
      const qty = item.qty || 1;
      let label = (PURCHASE_STATUS[key] || PURCHASE_STATUS.found)[0];
      if (key === 'found' && qty > 1) label = `On your account + ${qty - 1} gifted`;
      if (key === 'notsteam') {
        label = /^(Software|Audio|Books|Comics)$/.test(order.notSteam)
          ? `Not a game (${order.notSteam.toLowerCase()})${item.lic ? ', on your account' : ''}`
          : `Not a Steam key (${order.notSteam})`;
      }
      rows.push(purchaseRowHtml(order, item, key, label, qty));
    }
  }
  const totalRow = `<div class="tr kpr ord" role="row"><div role="cell"></div><div role="cell"><b>Total</b></div><div class="pr" role="cell"><b>${escapeHtml(formatMoney(total))}</b></div><div role="cell"></div></div>`;
  let showAll = false;
  const draw = () => {
    const allShown = showAll || rows.length <= 20;
    $('#kpRows').innerHTML = (allShown ? rows : rows.slice(0, 20)).join('') + (allShown ? totalRow : '');
    $('#kpMore').hidden = rows.length <= 20;
    $('#kpMore').textContent = showAll ? 'Show first 20 only' : `Show all ${rows.length}`;
  };
  $('#kpMore').onclick = () => {
    showAll = !showAll;
    draw();
  };
  draw();
}

function purchaseRowHtml(order, item, statusKey, statusLabel, qty) {
  const first = item === order.items[0];
  let date = muted('Date unknown');
  if (order.date) {
    date = order.dateEst ? withTitle('Order date not known; this is when the key was activated.', `≈ ${formatDate(order.date)}`) : formatDate(order.date);
  }
  let name = escapeHtml(item.name) + (qty > 1 ? ` ×${qty}` : '');
  if (first) name += `<button class="oedit" data-edit="${order.id}" aria-label="Edit this purchase">Edit</button>`;
  if (order.store) name += muted(' · ' + escapeHtml(order.store));
  if (first && order.bundle && order.bundle !== item.name) {
    const price = (order.totalEst ? '≈ ' : '') + escapeHtml(formatMoney(order.total));
    const title = order.totalNote ? ` title="${escapeHtml(order.totalNote)}"` : '';
    name += `<span class="pz"${title}> · ${escapeHtml(order.bundle)}, ${price}${order.partial ? ', more games not shown' : ''}</span>`;
  }
  if (first && order.bundleGames) name += `<span class="pz bundle-games">${escapeHtml(order.bundleGames.join(', '))}</span>`;
  if (statusKey !== 'notsteam') name += tag('3rd-party');

  let paid;
  if (statusKey === 'refunded') paid = muted(`${escapeHtml(formatMoney(item.item))} refunded`);
  else if (statusKey === 'notsteam') paid = muted(escapeHtml(item.paid == null ? 'Price unknown' : order.cur ? order.cur + item.paid.toFixed(2) : formatMoney(item.paid)));
  else if (order.giftReceived) paid = muted('Free');
  else if (item.included) paid = muted('Included');
  else if (item.paid == null) paid = muted('Price unknown');
  else paid = (item.est ? '≈ ' : '') + escapeHtml(formatMoney(item.paid));

  const activated = item.lic && item.lic[0] !== order.date ? ` (${formatDate(item.lic[0])})` : '';
  const style = (PURCHASE_STATUS[statusKey] || PURCHASE_STATUS.found)[1];
  return `<div class="tr kpr" role="row">
    <div class="dt" role="cell">${date}</div>
    <div class="nm" role="cell">${name}</div>
    <div class="pr" role="cell">${paid}</div>
    <div class="st ${style}" role="cell">${statusLabel}${activated}</div>
  </div>`;
}

// The explanation above the purchases table: a summary sentence, then one sentence per situation that applies.
function purchaseNote({ orders, steamKeys, otherItems, total, fees, keys, gifted, refunded }) {
  let summary = `${formatMoney(total)} across ${pluralize(steamKeys.length, 'order')} for ${pluralize(keys, 'key')} (${gifted} of them gifted)`;
  if (fees > HALF_CENT) {
    summary += `, including ${formatMoney(fees)} in service fees`;
    if (steamKeys.some(o => o.feeUnknown)) summary += ' (on the orders whose receipts list them)';
  }
  const parts = [summary + '.'];
  if (refunded) parts.push(`That's after ${formatMoney(refunded)} refunded.`);
  parts.push("These were bought outside Steam, so they're not part of the Steam spending totals above; the boxes below add them together.");
  parts.push("Each key's price includes its share of the order's service fee and discount code; games from bundles split the bundle price evenly (marked ≈).");
  if (otherItems.length) {
    const names = otherItems.map(o => {
      const price = o.priceUnknown ? '' : ` (${o.cur ? o.cur + o.total.toFixed(2) : formatMoney(o.total)})`;
      return (o.bundle || o.items.map(item => item.name).join(', ')) + price;
    });
    parts.push(`Also listed but not counted: ${names.join(', ')}, which aren't Steam game keys.`);
  }
  steamKeys.filter(o => o.converted && o.rate).forEach(o => {
    parts.push(`${o.items[0].name.replace(/ \(paid .*\)$/, '')} was paid in another currency (${o.foreign}); it's converted at that day's exchange rate to ≈ ${formatMoney(o.total)}.`);
  });
  const noPrice = steamKeys.filter(o => o.priceUnknown && !o.subscription);
  if (noPrice.length) {
    const stores = [...new Set(noPrice.map(o => o.store).filter(Boolean))];
    const one = noPrice.length === 1;
    parts.push(`${pluralize(noPrice.length, 'purchase')}${stores.length ? ` (${stores.join(', ')})` : ''} ${one ? 'has' : 'have'} no price on record, so ${one ? "it isn't" : "they aren't"} in the total.`);
  }
  if (steamKeys.some(o => o.dateEst)) parts.push("Where the order date isn't known, the activation date is shown (≈).");
  const giveaways = orders.filter(o => o.freeGiveaway);
  if (giveaways.length) parts.push(`${pluralize(giveaways.length, 'free giveaway')} ${giveaways.length === 1 ? 'is' : 'are'} shown as Free in the license list.`);
  const estimatedMonths = steamKeys.filter(o => o.subscription && o.subEst);
  if (estimatedMonths.length) {
    const one = estimatedMonths.length === 1;
    parts.push(`${pluralize(estimatedMonths.length, 'Humble Monthly / Choice month')} (${formatMoney(sum(estimatedMonths, o => o.total))}) `
      + `${one ? 'is' : 'are'} estimated at the monthly price back then, marked ≈: $12 from Humble Monthly through June 2025 `
      + '(the Classic plan kept that price after Humble Choice replaced Monthly), and $14.99 from July 2025. '
      + "Each month's price is split across the keys activated the day it was bought (or the day after). "
      + "Only the months you actually bought are counted. Humble's order page doesn't show the charge itself, so promo codes or an annual plan would make the real amount lower.");
  }
  const received = orders.filter(o => o.giftReceived && !o.freeGiveaway);
  if (received.length) {
    const names = received.map(o => (o.bundle || (o.items[0] && o.items[0].name) || '').replace(/ \(gift\)$/, ''));
    parts.push(`Keys you were given (${names.join('; ')}) aren't purchases, so they're left out here and shown as Free in the license list.`);
  }
  return parts;
}

// Key activations not linked to a purchase yet, grouped by day: several keys on one day usually came from one bundle.
function renderSuggestions(licenses) {
  const box = $('#kpSuggest');
  const unlinked = unlinkedKeys(licenses);
  box.hidden = !unlinked.length;
  if (!unlinked.length) return;
  const byDay = new Map();
  for (const license of unlinked) {
    if (!byDay.has(license.date)) byDay.set(license.date, []);
    byDay.get(license.date).push(license);
  }
  const batches = [...byDay.entries()].filter(([, day]) => day.length >= 3).sort((a, b) => b[1].length - a[1].length).slice(0, 6);
  const heading = `<h4>${pluralize(unlinked.length, 'key activation')} not linked to a purchase yet</h4>`;
  if (!batches.length) {
    box.innerHTML = heading + '<p class="kpct">They were activated one or two at a time. Use Add a purchase or import a spreadsheet to link them.</p>';
    return;
  }
  const cards = batches.map(([date, day]) => {
    const names = day.slice(0, 4).map(l => l.name).join(', ') + (day.length > 4 ? `, +${day.length - 4} more` : '');
    return `<div class="sg">
      <div><b>${formatDate(date)}</b> · ${pluralize(day.length, 'key')}<span class="s">${escapeHtml(names)}</span></div>
      <button class="tbtn sgb" data-d="${date}">Add this purchase</button>
    </div>`;
  });
  box.innerHTML = heading + '<p class="kpct">Keys activated together usually came from one bundle. Add the purchase and they\'ll be linked.</p>' + `<div class="sgl">${cards.join('')}</div>`;
  box.querySelectorAll('.sgb').forEach(button => button.onclick = () => openPurchaseForm({ date: button.dataset.d, type: 'purchase' }));
}

// Product keys on the licenses page that no purchase is linked to.
function unlinkedKeys(licenses) {
  if (!licenses) return [];
  const purchased = keyPurchaseMap(licenses, report.keyPurchases);
  return licenses.list.filter((license, i) => license.source === 'key' && !purchased.has(i));
}
