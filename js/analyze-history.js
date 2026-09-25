// Purchase history → totals, per-year and per-month spending, sale savings, gifts, hardware and sale timing.

const CATEGORY = {
  mine: 'Games and DLC for you',
  gifts: 'Gifts',
  inGame: 'In-game items',
  market: 'Market',
  hardware: 'Hardware',
};
const CATEGORIES = Object.values(CATEGORY);
const HARDWARE_PATTERN = /\b(Steam Deck|Steam Controller|Steam Link|Valve Index|Steam Frame|Steam Machine)\b/i;
const DISCOUNT_BUCKETS = ['Full price', '1–25%', '26–50%', '51–75%', '76–90%', '91%+'];

function analyzeHistory(historyRows, gamesPage) {
  const sorted = [...historyRows].sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
  const money = accountCurrency(sorted);
  convertWalletCharges(sorted, money.symbol);

  // Charges in another currency that couldn't be converted are left out and reported.
  const isForeign = r => r.total != null && r.cur != null && r.cur !== money.symbol;
  const skipped = sorted.filter(isForeign);
  const rows = sorted.filter(r => !isForeign(r));
  rows.forEach(classifyRow);
  splitSelfGiftCheckouts(rows, gamesPage);

  const spend = rows.filter(r => r.cat && r.total != null);
  const refunds = rows.filter(r => r.kind === 'refund' && r.total != null);
  const unnamedRefunds = matchRefunds(refunds, spend);

  const first = rows[0]?.date;
  const last = rows[rows.length - 1]?.date;
  const years = [];
  for (let y = yearOf(first); y <= yearOf(last); y++) years.push(y);
  const yearIndex = date => yearOf(date) - years[0];
  const perYear = () => years.map(() => 0);

  // net spending per category and year, and per month of the year (hardware left out of the months)
  const byYear = Object.fromEntries(CATEGORIES.map(c => [c, perYear()]));
  const byMonth = new Array(12).fill(0);
  const addToTotals = (r, sign) => {
    byYear[r.cat][yearIndex(r.date)] += sign * r.total;
    if (r.cat !== CATEGORY.hardware) byMonth[monthOf(r.date)] += sign * r.total;
  };
  spend.forEach(r => addToTotals(r, 1));
  refunds.forEach(r => addToTotals(r, -1));
  const catTotals = Object.fromEntries(CATEGORIES.map(c => [c, sum(byYear[c])]));

  // Sticker price vs. paid: checkouts with a list price, hardware and Market left out. A split gift checkout
  // counts once, as the original checkout.
  const checkouts = [...new Set(spend.map(r => r.splitFrom || r))]
    .filter(r => r.cat !== CATEGORY.hardware && r.kind !== 'mbuy' && r.paid != null && r.list != null && r.list > 0);
  const listByYear = perYear();
  const paidByYear = perYear();
  const bucketCount = DISCOUNT_BUCKETS.map(() => 0);
  const bucketSpent = DISCOUNT_BUCKETS.map(() => 0);
  for (const r of checkouts) {
    listByYear[yearIndex(r.date)] += r.list;
    paidByYear[yearIndex(r.date)] += r.paid;
    const pct = Math.round((1 - r.paid / r.list) * 100);
    const bucket = pct <= 0 ? 0 : pct <= 25 ? 1 : pct <= 50 ? 2 : pct <= 75 ? 3 : pct <= 90 ? 4 : 5;
    r.pct = Math.max(0, pct);
    bucketCount[bucket]++;
    bucketSpent[bucket] += r.paid;
  }
  const onSale = checkouts.filter(r => r.pct > 0);
  const bigSaves = [...checkouts]
    .sort((a, b) => (b.list - b.paid) - (a.list - a.paid))
    .slice(0, 6)
    .filter(r => r.list - r.paid > HALF_CENT)
    .map(r => ({ label: checkoutLabel(r), date: r.date, orig: r.list, paid: r.paid, saved: r.list - r.paid }));

  const gifts = giftStats(spend);
  const bought = spend.filter(r => r.kind === 'store' && !r.hw);
  const marketBuys = rows.filter(r => r.kind === 'mbuy');
  const marketSales = rows.filter(r => r.kind === 'msell');
  const gross = sum(spend, r => r.total);
  const refunded = sum(refunds, r => r.total);

  return {
    rows,
    money,
    first,
    last,
    years,
    skipped: skipped.map(r => ({ date: r.date, name: r.items[0]?.name || r.type, total: r.total, cur: r.cur })),
    byYear: Object.fromEntries(CATEGORIES.map(c => [c, byYear[c].map(round2)])),
    netByYear: years.map((_, i) => sum(CATEGORIES, c => byYear[c][i])),
    catTotals,
    byMonth,
    listByYear,
    paidByYear,
    payment: paymentMethods(spend),
    discBuckets: { labels: DISCOUNT_BUCKETS, count: bucketCount, spent: bucketSpent },
    bigSaves,
    hardware: hardwareOrders(spend),
    topGifted: gifts.topGifted,
    topRecipients: gifts.topRecipients,
    saleTiming: saleTiming(spend, first, last),
    totals: {
      gross,
      refunds: refunded,
      net: gross - refunded,
      tax: sum(spend, r => r.tax || 0),
      list: sum(checkouts, r => r.list),
      paidPreTax: sum(checkouts, r => r.paid),
      saved: sum(checkouts, r => r.list - r.paid),
      avgDiscount: onSale.length ? Math.round(sum(onSale, r => r.pct) / onSale.length * 10) / 10 : 0,
      saleTx: onSale.length,
      storeTx: checkouts.length,
      itemsMine: sum(bought, r => r.items.length - r.refunded.filter(Boolean).length),
      giftBought: gifts.copies,
      giftRefunded: gifts.refunded,
      txCount: sorted.length,
      refundCount: refunds.length,
      unnamedRefunds,
      marketBuys: sum(marketBuys, r => r.total),
      marketBuyCount: sum(marketBuys, r => r.count || 1),
      marketSales: sum(marketSales, r => r.total || 0),
      hardware: catTotals[CATEGORY.hardware],
    },
  };
}

// The currency most transactions are in.
function accountCurrency(rows) {
  const counts = new Map();
  for (const r of rows) {
    if (r.cur != null && r.total != null) counts.set(r.cur, (counts.get(r.cur) || 0) + 1);
  }
  const symbol = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '$';
  const sample = rows.find(r => r.cur === symbol);
  return { symbol, symbolFirst: sample ? sample.curPre : true, decimalMark: sample ? sample.dec : '.' };
}

// A charge in another currency paid from the Steam Wallet shows the wallet change in the account's currency, which
// is exactly what was charged. Those are converted in place; other foreign charges have no exchange rate to use.
function convertWalletCharges(rows, symbol) {
  for (const r of rows) {
    if (r.total == null || r.cur == null || r.cur === symbol) continue;
    if (r.wallet == null || r.wallet >= 0 || r.walletCur !== symbol) continue;
    const rate = -r.wallet / r.total;
    r.total = -r.wallet;
    r.tax = (r.tax || 0) * rate;
    r.paid = r.paid != null ? r.paid * rate : null;
    r.list = r.list != null ? r.list * rate : null;
    r.cur = symbol;
  }
}

// Sets kind (what Steam called it), cat (the spending category, or null if it isn't spending) and hw (hardware).
function classifyRow(r) {
  const type = r.type;
  const firstItem = r.items[0]?.name || '';
  const market = type.match(/^(\d+)?\s*Market Transactions?$/i);
  if (market) {
    r.count = +(market[1] || 1);
    const isSale = r.wallet != null ? r.wallet > 0 : r.credit;
    r.kind = isSale ? 'msell' : 'mbuy';
  } else if (/^Purchase$/i.test(type)) {
    r.kind = /Wallet Credit/i.test(firstItem) ? 'topup' : 'store';
  } else {
    r.kind = { 'gift purchase': 'gift', 'in-game purchase': 'ingame', 'refund': 'refund' }[type.toLowerCase()] || 'other';
  }
  r.hw = r.kind === 'store' && (r.ship > 0 || r.items.some(i => HARDWARE_PATTERN.test(i.name)));
  r.cat = {
    store: r.hw ? CATEGORY.hardware : CATEGORY.mine,
    gift: CATEGORY.gifts,
    ingame: CATEGORY.inGame,
    mbuy: CATEGORY.market,
  }[r.kind] || null;
  r.refunded = r.items.map(() => false);
}

// Relative weights for splitting one checkout's total between its items, by each item's list price today.
// Items with no known price share whatever part of the checkout's list total is left over; if nothing is left,
// they get a fifth of the average known price.
function listPriceWeights(listPrices, checkoutList) {
  const known = listPrices.filter(v => v);
  const unknownCount = listPrices.length - known.length;
  const leftOver = checkoutList - sum(known);
  let unknownWeight = 0;
  if (unknownCount) {
    if (leftOver > 0.5) unknownWeight = leftOver / unknownCount;
    else unknownWeight = known.length ? sum(known) / known.length * 0.2 : 1;
  }
  return listPrices.map(v => v || unknownWeight);
}

// Steam files a checkout as a Gift Purchase when any item in it was a gift. Items with no recipient went to your
// own account, so such a checkout is split into a gift part and a store part, weighted by list price. Old gift
// checkouts with no recipients at all were inventory gifts and stay gifts.
function splitSelfGiftCheckouts(rows, gamesPage) {
  const priceOf = gamesPage && gamesPage.games ? makeNameMatcher(gamesPage.games) : null;
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    if (r.kind !== 'gift' || !r.items.some(it => it.to) || r.items.every(it => it.to)) continue;
    const listPrices = r.items.map(it => {
      const game = priceOf && priceOf(it.name, false);
      return game && game.price ? game.price : null;
    });
    const weights = listPriceWeights(listPrices, r.list ?? r.total);
    const weightTotal = sum(weights) || 1;
    const part = (kind, keep) => {
      const indexes = r.items.map((_, k) => k).filter(keep);
      const share = sum(indexes, k => weights[k]) / weightTotal;
      const scale = v => v == null ? null : round2(v * share);
      return {
        ...r,
        kind,
        cat: kind === 'gift' ? CATEGORY.gifts : CATEGORY.mine,
        hw: false,
        est: true,
        splitFrom: r,
        items: indexes.map(k => r.items[k]),
        refunded: indexes.map(() => false),
        total: scale(r.total),
        paid: scale(r.paid),
        list: scale(r.list),
        tax: scale(r.tax) || 0,
        pays: r.pays.map(p => ({ ...p, amt: p.amt == null ? null : scale(p.amt) })),
      };
    };
    rows.splice(i, 1, part('gift', k => !!r.items[k].to), part('store', k => !r.items[k].to));
  }
}

// Marks refunded items on the purchase each refund came from and gives each refund that purchase's category.
// A refund that names its item matches the latest earlier purchase of it. One that names nothing matches the
// latest purchase in the 60 days before it that could cover the amount. Returns how many refunds named nothing.
function matchRefunds(refunds, spend) {
  let unnamed = 0;
  for (const refund of refunds) {
    const names = refund.items.map(i => i.name).filter(n => !/^Refund$/i.test(n));
    let cat = null;
    for (const name of names) {
      for (let i = spend.length - 1; i >= 0; i--) {
        const p = spend[i];
        if (p.date > refund.date || p.kind === 'mbuy') continue;
        const k = p.items.findIndex((it, j) => it.name === name && !p.refunded[j]);
        if (k < 0) continue;
        p.refunded[k] = true;
        if (names.length === 1) (p.refAmt = p.refAmt || {})[k] = refund.total;
        cat = cat || p.cat;
        break;
      }
    }
    if (!names.length) {
      unnamed++;
      const earliest = addDays(refund.date, -60);
      for (let i = spend.length - 1; i >= 0; i--) {
        const p = spend[i];
        if (p.date > refund.date || p.kind === 'mbuy') continue;
        if (p.date < earliest) break;
        if (p.total >= refund.total - HALF_CENT) {
          cat = p.cat;
          (p.unnamedRef = p.unnamedRef || []).push(refund.total);
          break;
        }
      }
    }
    refund.cat = cat || CATEGORY.mine;
    refund.matched = !!names.length;
  }
  return unnamed;
}

// What a checkout is still worth after refunds of some of its items.
function netOfRefunds(r) {
  let amount = r.total;
  r.refunded.forEach((done, k) => {
    if (done) amount -= r.refAmt && r.refAmt[k] != null ? r.refAmt[k] : r.total / r.items.length;
  });
  (r.unnamedRef || []).forEach(v => amount -= v);
  return Math.max(0, amount);
}

// "Game", "Game ×2" or "Game + 3 more"
function checkoutLabel(r) {
  const names = [...new Set(r.items.map(i => i.name))];
  if (names.length > 1) return `${names[0]} + ${names.length - 1} more`;
  return r.items.length > 1 ? `${names[0]} ×${r.items.length}` : names[0];
}

// Spending per payment method: the top five, with the rest as Other. Split payments count each part.
function paymentMethods(spend) {
  const byMethod = {};
  const add = (method, amount) => byMethod[method] = (byMethod[method] || 0) + amount;
  for (const r of spend) {
    if (!r.pays.length) add('Other', r.total);
    for (const p of r.pays) add(p.method || 'Other', p.amt != null && r.pays.length > 1 ? p.amt : r.total);
  }
  const ranked = Object.entries(byMethod).sort((a, b) => b[1] - a[1]);
  const top = Object.fromEntries(ranked.slice(0, 5));
  if (ranked.length > 5) top.Other = (top.Other || 0) + sum(ranked.slice(5), x => x[1]);
  return top;
}

// One entry per hardware order, with a reservation deposit ("Steam Deck 256 GB Deposit") folded into the order it
// was put towards.
function hardwareOrders(spend) {
  const orders = spend.filter(r => r.cat === CATEGORY.hardware).map(r => ({
    name: [...new Set(r.items.map(i => i.name))].join(' + '),
    date: r.date,
    paid: r.paid ?? r.total,
    list: r.list,
    tax: r.tax,
    ship: r.ship,
    total: r.total,
    deposit: null,
    others: r.items.map(i => i.name).filter(n => !HARDWARE_PATTERN.test(n)),
  }));
  return orders.filter(order => {
    const m = order.name.match(/^(.*?)\s+(?:Reservation\s+)?Deposit$/i);
    const target = m && orders.find(o => o !== order && o.date >= order.date && o.name === m[1]);
    if (!target) return true;
    target.paid += order.paid;
    target.tax += order.tax;
    target.total += order.total;
    target.deposit = { amt: order.total, date: order.date };
    return false;
  });
}

function giftStats(spend) {
  const gifts = spend.filter(r => r.kind === 'gift');
  const copies = {};
  const refunded = {};
  const recipients = {};
  for (const r of gifts) {
    r.items.forEach((item, k) => {
      copies[item.name] = (copies[item.name] || 0) + 1;
      if (r.refunded[k]) refunded[item.name] = (refunded[item.name] || 0) + 1;
      else if (item.to) recipients[item.to] = (recipients[item.to] || 0) + 1;
    });
  }
  const byCountThenName = (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]);
  return {
    topGifted: Object.keys(copies).map(n => [n, copies[n], refunded[n] || 0]).sort(byCountThenName),
    topRecipients: Object.entries(recipients).sort(byCountThenName),
    copies: sum(gifts, r => r.items.length),
    refunded: sum(Object.values(refunded)),
  };
}

// ---------- seasonal sales (dates in data/steam-sales.js) ----------

// The seasonal sale a date falls in, as { type, name, key }, or null.
function steamSaleOn(date) {
  const sale = STEAM_SALES.sales.find(s => date >= s.start && date <= s.end);
  return sale ? { type: sale.type, key: sale.type + sale.start, name: `${sale.type} Sale ${yearOf(sale.start)}` } : null;
}

// Games, DLC and gifts bought during each kind of seasonal sale vs. the rest of the time, the sales you spent the
// most in, and the share of days that fell in a sale as a baseline to compare against.
function saleTiming(spend, first, last) {
  const byType = { Summer: 0, Winter: 0, Autumn: 0, Spring: 0, None: 0 };
  const events = new Map();
  let total = 0;
  let afterCoverage = 0;
  for (const r of spend) {
    if (r.cat !== CATEGORY.mine && r.cat !== CATEGORY.gifts) continue;
    if (r.date > STEAM_SALES.coveredUntil) {
      afterCoverage++;
      continue;
    }
    const amount = netOfRefunds(r);
    if (amount <= HALF_CENT) continue;
    total += amount;
    const sale = steamSaleOn(r.date);
    byType[sale ? sale.type : 'None'] += amount;
    if (!sale) continue;
    const event = events.get(sale.key) || { name: sale.name, type: sale.type, amt: 0, n: 0 };
    event.amt += amount;
    event.n++;
    events.set(sale.key, event);
  }
  const end = last > STEAM_SALES.coveredUntil ? STEAM_SALES.coveredUntil : last;
  let days = 0;
  let saleDays = 0;
  for (let d = first; d <= end; d = addDays(d, 1)) {
    days++;
    if (steamSaleOn(d)) saleDays++;
  }
  return {
    total,
    by: byType,
    top: [...events.values()].sort((a, b) => b.amt - a.amt).slice(0, 8),
    dayShare: days ? saleDays / days : 0,
    after: afterCoverage,
  };
}
