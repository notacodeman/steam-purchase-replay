// Keys bought from other stores (Humble, Fanatical…), added by hand or from a spreadsheet, and how they tie up with
// the key activations on the licenses page.
//
// Stored as { orders: [...] }. An order:
//   { id, date, store, bundle, total, fee, feeUnknown, priceUnknown, foreign, converted, subscription,
//     giftReceived, freeGiveaway, notSteam, forGame, items: [...], form }
// An item: { name, paid, item, lic: [activation date, license name], status, qty, est, to (who a gifted key went to),
//   forGame (the game money spent outside Steam went on, like a Trackmania Club Access subscription) }
// `form` keeps what was typed into the purchase form so it can be edited later. Orders imported by older versions
// can carry a few more notes (dateEst, totalEst, totalNote, bundleGames, giftNote, subEst, refunded…).

// Label and style for each state a purchased key can be in.
const PURCHASE_STATUS = {
  newer: ['Bought after your saved licenses page', 'st'],
  giftin: ['Gift you received', 'ok'],
  giveaway: ['Free giveaway', 'ok'],
  traded: ['Already owned; likely traded in on the Digiphile Exchange', 'st'],
  sub: ['Games claimed separately', 'st'],
  nomatch: ['Not matched to a license', 'st'],
  notsteam: ['Not a Steam key', 'st'],
  found: ['On your account', 'ok'],
  gifted: ['Gifted', 'given'],
  second: ['Extra copy (only one activated)', 'st'],
  missing: ['Not found on your account', 'warn'],
  forgame: ['Counted towards the game', 'ok'],
  refunded: ['Refunded', 'st'],
};

const ordersOf = keyPurchases => keyPurchases && keyPurchases.orders || [];

// Total split into n parts that add up exactly, the rounding difference going to the first.
function splitEven(total, n) {
  if (!n) return [];
  const parts = new Array(n).fill(round2(total / n));
  parts[0] = round2(parts[0] + total - sum(parts));
  return parts;
}

// Builds a stored order from what was entered in the purchase form or a spreadsheet row.
// fields: { id, type, date, name, game, store, total, currency, converted, gifted, giftedTo, platform, keys: [{ lic, name }] }
function makeOrder(fields) {
  const { type } = fields;
  const order = { id: fields.id || newId(), user: true, date: fields.date, store: fields.store || '3rd-party store', fee: 0, feeUnknown: true };
  if (fields.name) order.bundle = fields.name;
  const keys = fields.keys || [];
  const gifted = Math.max(0, fields.gifted | 0);
  const hasPrice = fields.total != null && isFinite(fields.total);
  let total = hasPrice ? fields.total : 0;

  if (fields.currency && fields.currency !== currency.symbol) {
    order.foreign = fields.currency + ' ' + (fields.total ?? '');
    if (fields.converted != null && isFinite(fields.converted)) {
      order.converted = true;
      total = fields.converted;
    } else {
      order.priceUnknown = true;
      total = 0;
    }
  } else if (!hasPrice && type !== 'gift' && type !== 'free') {
    order.priceUnknown = true;
  }
  order.total = type === 'gift' || type === 'free' ? 0 : total;
  if (type === 'sub') order.subscription = true;
  if (type === 'gift' || type === 'free') order.giftReceived = true;
  if (type === 'free') order.freeGiveaway = true;
  if (type === 'nonsteam') order.notSteam = fields.platform || 'Other platform';
  if (type === 'forgame') order.forGame = fields.game;

  const shares = order.priceUnknown ? [] : splitEven(order.total, keys.length + gifted);
  const est = keys.length + gifted > 1;
  const priced = amount => order.priceUnknown ? null : amount;
  order.items = keys.map((key, j) => ({
    name: key.name, item: null, paid: priced(shares[j]), lic: key.lic, status: type === 'nonsteam' ? 'notsteam' : 'found', est,
  }));
  if (gifted) {
    order.items.push({
      name: fields.name || 'Gifted copies', item: null, paid: priced(round2(sum(shares.slice(keys.length)))), lic: null, status: 'gifted', qty: gifted, est,
      ...(fields.giftedTo ? { to: fields.giftedTo } : {}),
    });
  }
  if (type === 'forgame') {
    order.items.push({ name: fields.name || 'Purchase', item: null, paid: priced(order.total), lic: null, status: 'forgame', forGame: fields.game });
  } else if (!order.items.length) {
    const status = type === 'sub' ? 'sub' : type === 'nonsteam' ? 'notsteam' : 'nomatch';
    order.items.push({ name: fields.name || 'Purchase', item: null, paid: priced(order.total), lic: null, status });
  }
  order.form = { ...fields, keys: keys.map(k => k.lic) };
  return order;
}

// The purchase form's fields for an existing order (older orders have no saved `form`).
function orderFormFields(order) {
  if (order.form) return order.form;
  return {
    type: order.subscription ? 'sub' : order.freeGiveaway ? 'free' : order.giftReceived ? 'gift' : order.notSteam ? 'nonsteam' : order.forGame ? 'forgame' : 'purchase',
    game: order.forGame || '',
    date: order.date,
    name: order.bundle || order.items[0]?.name,
    store: order.store,
    total: order.priceUnknown ? null : order.total,
    currency: currency.symbol,
    gifted: sum(order.items.filter(i => i.status === 'gifted'), i => i.qty || 1),
    giftedTo: order.items.find(i => i.to)?.to || '',
    platform: order.notSteam || '',
    keys: order.items.filter(i => i.lic).map(i => i.lic),
  };
}

// Map of license index → the purchased key it was activated from, with the order it belongs to.
function keyPurchaseMap(licenses, keyPurchases) {
  const byDate = new Map();
  licenses.list.forEach((license, i) => {
    if (license.source !== 'key' && license.source !== 'other') return;
    if (!byDate.has(license.date)) byDate.set(license.date, []);
    byDate.get(license.date).push(i);
  });
  const result = new Map();
  for (const order of ordersOf(keyPurchases)) {
    for (const item of order.items) {
      if (!item.lic) continue;
      const [date, name] = item.lic;
      const wanted = normalizeName(name);
      const cleaned = normalizeName(cleanLicenseName(name));
      const index = (byDate.get(date) || []).find(i => {
        if (result.has(i)) return false;
        const license = licenses.list[i];
        const licenseName = normalizeName(license.name);
        return licenseName === wanted || normalizeName(license.steamName) === wanted || cleaned === licenseName;
      });
      if (index == null) continue;
      const qty = item.qty || 1;
      result.set(index, {
        ...item,
        paid: item.paid == null ? null : item.paid / qty,
        item: item.item == null ? null : item.item / qty,
        order,
      });
    }
  }
  return result;
}

// Returns status(item, order) → a PURCHASE_STATUS key. A key that doesn't show up on the account went to someone
// else if the game was already on the account before the order.
function keyStatusChecker(licenses, gamesPage) {
  const ownedGame = gamesPage ? makeNameMatcher(gamesPage.games) : null;
  const ownedBefore = (name, date) => {
    if (!licenses || !date) return false;
    const n = normalizeName(cleanLicenseName(name));
    return licenses.list.some(l => l.date && l.date < date && (normalizeName(l.name) === n || normalizeName(l.rawName) === n));
  };
  return (item, order) => {
    if (order.giftReceived) return order.freeGiveaway ? 'giveaway' : 'giftin';
    if (order.notSteam || item.status === 'notsteam') return 'notsteam';
    if (['traded', 'sub', 'nomatch', 'refunded', 'forgame'].includes(item.status)) return item.status;
    if (item.lic) return 'found';
    if (item.status === 'missing') {
      if (ownedBefore(item.name, order.date)) return 'gifted';
      if (ownedGame && ownedGame(item.name, false)) return 'found';
    }
    return item.status || 'found';
  };
}

// Keys bought at other stores that went to other people: gifted keys, and the extra copies of a key bought more
// than once.
function giftedKeys(keyPurchases, licenses, gamesPage) {
  const status = keyStatusChecker(licenses, gamesPage);
  const result = [];
  for (const order of ordersOf(keyPurchases)) {
    if (order.giftReceived) continue;
    for (const item of order.items) {
      const s = status(item, order);
      const qty = item.qty || 1;
      if (s === 'gifted') result.push({ name: item.name, qty, date: order.date, paid: item.paid || 0, to: item.to || null });
      else if (s === 'found' && qty > 1) result.push({ name: item.name, qty: qty - 1, date: order.date, paid: item.paid * (qty - 1) / qty });
    }
  }
  return result;
}

// Money spent on Steam game keys at other stores (non-Steam items and gifts received left out).
function keySpend(keyPurchases) {
  const orders = ordersOf(keyPurchases).filter(o => !o.notSteam && !o.giftReceived);
  return { total: sum(orders, o => o.total || 0), orders: orders.length };
}

// Forms of a game or license name that bundle and pack game lists are compared on.
function nameForms(name) {
  const normalized = normalizeName(cleanLicenseName(name));
  return [normalized, stripEditionSuffix(normalized), looseNameKeys(normalized)[0]].filter(Boolean);
}
const licenseForms = license => [license.name, license.steamName].flatMap(nameForms);

// Name forms of each bundle's games, worked out once per bundle (the list is long and checked on every render).
const bundleFormCache = new WeakMap();
function bundleForms(bundle) {
  if (!bundleFormCache.has(bundle)) bundleFormCache.set(bundle, new Set(bundle.games.flatMap(nameForms)));
  return bundleFormCache.get(bundle);
}

// The days a key from a known bundle could have been activated: from the day before it went on sale, and for a
// giveaway, until the day after it ended.
const bundleWindow = bundle => [addDays(bundle.date, -1), bundle.ends ? addDays(bundle.ends, 1) : '9999'];
const isGiveaway = bundle => bundle.kind === 'giveaway';
// Whether a key was activated within the bundle's own dates, without the day of slack at each end. Breaks ties
// between back-to-back giveaways of the same game.
const withinDates = (bundle, license) => license.date >= bundle.date && (!bundle.ends || license.date <= bundle.ends);

// A bundle's keys are usually redeemed together, so keys only count as one bundle when they were all activated
// within this many days of each other. Without it, any two keys of games that were ever bundled together would match.
const BUNDLE_SPREAD_DAYS = 30;
const daysApart = (a, b) => Math.abs(new Date(a + 'T12:00') - new Date(b + 'T12:00')) / 864e5;

// The largest group of keys activated within BUNDLE_SPREAD_DAYS of each other, the earliest one on a tie.
function closestKeys(keys) {
  const sorted = [...keys].sort((a, b) => a.date.localeCompare(b.date));
  let best = [];
  for (let first = 0, last = 0; last < sorted.length; last++) {
    while (daysApart(sorted[first].date, sorted[last].date) > BUNDLE_SPREAD_DAYS) first++;
    if (last - first + 1 > best.length) best = sorted.slice(first, last + 1);
  }
  return best;
}

// Unlinked keys of a bundle's games activated in its window (bundleWindow). keyForms maps each key to its name forms.
function keysInBundle(bundle, keys, keyForms) {
  const games = bundleForms(bundle);
  const [from, to] = bundleWindow(bundle);
  return keys.filter(l => l.date >= from && l.date <= to && keyForms.get(l).some(f => games.has(f)));
}

// Known bundles (KNOWN_BUNDLES in data/known-packages.js) that unlinked key activations probably came from, most
// keys first: [{ bundle, keys }]. A key counts for a bundle when it's one of its games and was activated in its window
// (bundleWindow); a bundle's keys also have to be activated within BUNDLE_SPREAD_DAYS of each other. Each key goes to
// one bundle only. A bundle needs two keys to be suggested; a giveaway, one.
function bundleSuggestions(unlinked) {
  const keyForms = new Map(unlinked.map(l => [l, licenseForms(l)]));
  const group = (bundle, keys) => (isGiveaway(bundle) ? keys : closestKeys(keys));
  const candidates = KNOWN_BUNDLES.map(bundle => {
    const keys = group(bundle, keysInBundle(bundle, unlinked, keyForms));
    return { bundle, keys, exact: keys.filter(l => withinDates(bundle, l)).length };
  }).filter(c => c.keys.length).sort((a, b) => b.keys.length - a.keys.length || b.exact - a.exact);
  const taken = new Set();
  const suggestions = [];
  for (const { bundle, keys } of candidates) {
    const free = group(bundle, keys.filter(l => !taken.has(l)));
    if (free.length < (isGiveaway(bundle) ? 1 : 2)) continue;
    free.forEach(l => taken.add(l));
    suggestions.push({ bundle, keys: free });
  }
  return suggestions;
}

// Where one unlinked key may have been bought, for the purchase form:
//  - bundles: up to 5 KNOWN_BUNDLES it's a game from whose window (bundleWindow) it was activated in, giveaways
//    included, the ones with the most other unlinked keys activated within BUNDLE_SPREAD_DAYS of it first;
//  - packs: KNOWN_PACKAGES packs of 3+ games it's in. A pack normally arrives as one license, so a separate key for one
//    of its games only points to it when the pack is a Humble Bundle or another unlinked key activated within a week
//    is from it too (the pack was sold as separate keys);
//  - sale: the Steam seasonal sale it was activated during or up to a week after, since key stores run sales then.
// Each bundle and pack lists the unlinked keys from it, this one first. Returns { bundles, packs, sale }.
function keySourceHints(license, unlinked) {
  const own = new Set(licenseForms(license));
  const hasThis = games => games.some(game => nameForms(game).some(f => own.has(f)));
  const near = days => unlinked.filter(l => l !== license && daysApart(l.date, license.date) <= days);
  const keysFrom = (games, others) => {
    const set = new Set(games.flatMap(nameForms));
    return [license, ...others.filter(l => licenseForms(l).some(f => set.has(f)))];
  };
  const nearby = near(BUNDLE_SPREAD_DAYS);
  const nearbyForms = new Map(nearby.map(l => [l, licenseForms(l)]));
  const bundles = KNOWN_BUNDLES
    .filter(bundle => {
      const [from, to] = bundleWindow(bundle);
      return license.date >= from && license.date <= to && [...own].some(f => bundleForms(bundle).has(f));
    })
    .map(bundle => ({ ...bundle, keys: [license, ...keysInBundle(bundle, nearby, nearbyForms)] }))
    .sort((a, b) => b.keys.length - a.keys.length || withinDates(b, license) - withinDates(a, license)
      || b.date.localeCompare(a.date))
    .slice(0, 5);
  const packs = KNOWN_PACKAGES
    .filter(([names, games]) => games.length >= 3 && !names.some(n => nameForms(n).some(f => own.has(f))) && hasThis(games))
    .map(([names, games]) => ({ name: names[0], store: /humble/i.test(names.join(' ')) ? 'Humble Bundle' : '', games,
      keys: keysFrom(games, near(7)) }))
    .filter(pack => pack.store || pack.keys.length > 1)
    .sort((a, b) => b.keys.length - a.keys.length)
    .slice(0, 3);
  const sale = STEAM_SALES.sales.find(s => license.date >= s.start && license.date <= addDays(s.end, 7)) || null;
  return { bundles, packs, sale };
}
