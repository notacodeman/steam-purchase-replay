// Per-item prices. Steam's history only records one total per checkout, so the price of one item in a multi-item
// checkout has to be worked out, and visitors can type in a price themselves ("price edits").
//
// Price edits are stored by key: "<checkout date>|<item name>" for an item of a checkout, or
// "lic:<license date>|<license name>" for a Steam license that couldn't be tied to a checkout.
// Each value is { paid, list, edited: true }.

// A price the visitor typed in for one product of a checkout, or null.
function editedPrice(priceEdits, row, itemName) {
  const edit = priceEdits && priceEdits[row.date + '|' + itemName];
  return edit && typeof edit === 'object' && edit.edited ? edit : null;
}

// Map of checkout row → [{ paid, list, est, listEst }] per item, for store, gift and in-game checkouts with more
// than one item.
//  1. Exact where known: a typed-in price, or a refund that names one item (its with-tax amount, tax taken back out).
//  2. The rest of the checkout is split by each item's list price today (from the games page). Without a games page
//     it is split evenly. These are estimates.
function itemPrices(historyRows, gamesPage, priceEdits) {
  const priceOf = gamesPage ? makeNameMatcher(gamesPage.games) : null;
  const listPriceToday = name => {
    const game = priceOf && priceOf(name, false);
    return game && game.price ? game.price : null;
  };
  const result = new Map();
  for (const r of historyRows) {
    if (!['store', 'gift', 'ingame'].includes(r.kind) || r.paid == null || r.items.length < 2) continue;
    const preTaxShare = r.total > 0 ? r.paid / r.total : 1;
    const prices = r.items.map((item, k) => {
      const edit = priceEdits && priceEdits[r.date + '|' + item.name];
      if (edit != null) {
        // older saves stored a bare number
        return typeof edit === 'number' ? { paid: edit, est: false } : { paid: edit.paid, list: edit.list ?? null, est: false };
      }
      if (r.refAmt && r.refAmt[k] != null) return { paid: round2(r.refAmt[k] * preTaxShare), est: false };
      return null;
    });

    const open = r.items.map((_, k) => k).filter(k => !prices[k]);
    if (open.length) {
      const paidLeft = Math.max(0, r.paid - sum(prices, p => p ? p.paid : 0));
      const checkoutList = r.list != null ? r.list : r.paid;
      const weights = listPriceWeights(open.map(k => listPriceToday(r.items[k].name)), checkoutList);
      const weightTotal = sum(weights) || 1;
      open.forEach((k, j) => {
        prices[k] = {
          paid: round2(paidLeft * weights[j] / weightTotal),
          list: round2(checkoutList * weights[j] / weightTotal),
          est: true,
        };
      });
    }

    // list price per item: from the games page when not already known, and never below what was paid
    prices.forEach((price, k) => {
      if (price.list == null) {
        const today = listPriceToday(r.items[k].name);
        price.list = today ? Math.max(today, price.paid) : price.paid;
        price.listEst = true;
      }
      if (price.list < price.paid) price.list = price.paid;
    });
    result.set(r, prices);
  }
  return result;
}

// Map of license index → price for each Steam Store license, found by name in a checkout on the same day or a day
// either side. Each price carries `editKey`, the price-edit key to use if the visitor changes it.
function licensePrices(licenses, historyRows, gamesPage, priceEdits) {
  const result = new Map();
  if (!licenses || !historyRows) return result;
  const cartPrices = itemPrices(historyRows, gamesPage, priceEdits);
  const byDay = new Map();
  for (const r of historyRows) {
    if (r.kind !== 'store' && r.kind !== 'ingame') continue;
    if (!byDay.has(r.date)) byDay.set(r.date, []);
    byDay.get(r.date).push(r);
  }

  licenses.list.forEach((license, index) => {
    if (license.source !== 'store') return;
    const ownKey = `lic:${license.date}|${license.steamName}`;
    const own = priceEdits && priceEdits[ownKey];
    if (own && own.edited) {
      result.set(index, { paid: own.paid, list: own.list ?? own.paid, est: false, edited: true, editKey: ownKey });
      return;
    }
    if (!license.date) {
      result.set(index, { none: true, editKey: ownKey });
      return;
    }
    const names = [normalizeName(license.steamName), normalizeName(license.name)];
    for (const day of [license.date, addDays(license.date, -1), addDays(license.date, 1)]) {
      for (const r of byDay.get(day) || []) {
        const k = r.items.findIndex(item => names.includes(normalizeName(item.name)));
        if (k < 0) continue;
        const editKey = r.date + '|' + r.items[k].name;
        let price;
        if (new Set(r.items.map(item => item.name)).size === 1 && r.paid != null) {
          price = {
            paid: r.paid / r.items.length,
            list: (r.list ?? r.paid) / r.items.length,
            est: !!r.est,
            listEst: !!r.est,
            cart: r.est ? r.splitFrom.items.length : undefined,
          };
        } else {
          const split = cartPrices.get(r) && cartPrices.get(r)[k];
          price = split ? { paid: split.paid, list: split.list, est: split.est, listEst: split.listEst || split.est, cart: r.items.length } : { none: true };
        }
        const edit = editedPrice(priceEdits, r, r.items[k].name);
        if (edit) {
          price = {
            ...price,
            none: false,
            paid: edit.paid,
            list: edit.list ?? Math.max(edit.paid, price.list || 0),
            est: false,
            listEst: edit.list == null,
            edited: true,
          };
        }
        result.set(index, { ...price, editKey });
        return;
      }
    }
  });
  return result;
}
