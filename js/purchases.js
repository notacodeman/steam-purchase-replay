// Keys bought from other stores (Humble, Fanatical…), added by hand or from a spreadsheet, and how they tie up with
// the key activations on the licenses page.
//
// Stored as { orders: [...] }. An order:
//   { id, date, store, bundle, total, fee, feeUnknown, priceUnknown, foreign, converted, subscription,
//     giftReceived, freeGiveaway, notSteam, items: [...], form }
// An item: { name, paid, item, lic: [activation date, license name], status, qty, est }
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
  gifted: ['Gifted', 'st'],
  second: ['Extra copy (only one activated)', 'st'],
  missing: ['Not found on your account', 'warn'],
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
// fields: { id, type, date, name, store, total, currency, converted, gifted, platform, keys: [{ lic, name }] }
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

  const shares = order.priceUnknown ? [] : splitEven(order.total, keys.length + gifted);
  const est = keys.length + gifted > 1;
  const priced = amount => order.priceUnknown ? null : amount;
  order.items = keys.map((key, j) => ({
    name: key.name, item: null, paid: priced(shares[j]), lic: key.lic, status: type === 'nonsteam' ? 'notsteam' : 'found', est,
  }));
  if (gifted) {
    order.items.push({
      name: fields.name || 'Gifted copies', item: null, paid: priced(round2(sum(shares.slice(keys.length)))), lic: null, status: 'gifted', qty: gifted, est,
    });
  }
  if (!order.items.length) {
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
    type: order.subscription ? 'sub' : order.freeGiveaway ? 'free' : order.giftReceived ? 'gift' : order.notSteam ? 'nonsteam' : 'purchase',
    date: order.date,
    name: order.bundle || order.items[0]?.name,
    store: order.store,
    total: order.priceUnknown ? null : order.total,
    currency: currency.symbol,
    gifted: sum(order.items.filter(i => i.status === 'gifted'), i => i.qty || 1),
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
    if (['traded', 'sub', 'nomatch', 'refunded'].includes(item.status)) return item.status;
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
      if (s === 'gifted') result.push({ name: item.name, qty, date: order.date, paid: item.paid || 0 });
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
