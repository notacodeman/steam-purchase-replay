// Games page → game count, playtime, cost per hour, never-played games and backlog cost.

// Steam's store type for each app. Apps with no store entry (delisted, or only sold as part of another game) are
// listed separately and not counted as games, which matches Steam's own "games owned" figure much more closely.
const STORE_TYPES = { 0: 'game', 2: 'mod', 4: 'dlc', 6: 'software', 12: 'test' };
const PLAYTEST_PATTERN = /playtest|\bbeta\b|test server|testing grounds/i;

// Older saved games pages don't include store types.
const isTypedGamesPage = gamesPage => gamesPage.typed !== false && gamesPage.games.some(g => g.t != null);

// 'game', 'dlc', 'software', 'mod', 'test' or 'delisted'
function appKind(game, typed) {
  if (typed && STORE_TYPES[game.t]) return STORE_TYPES[game.t];
  if (PLAYTEST_PATTERN.test(game.name)) return 'test';
  return typed ? 'delisted' : 'game';
}

// edits: the visitor's own additions { keyPurchases, priceEdits, gameLinks }
function analyzePlaytime(gamesPage, historyRows, licenseList, { keyPurchases, priceEdits, gameLinks } = {}) {
  const all = gamesPage.games;
  const typed = isTypedGamesPage(gamesPage);
  all.forEach(g => g.k = appKind(g, typed));
  const mix = { game: 0, delisted: 0, test: 0, software: 0, mod: 0, dlc: 0 };
  all.forEach(g => mix[g.k]++);

  const games = all.filter(g => g.k === 'game' || (!typed && g.k === 'delisted'));
  const match = makeNameMatcher(games);
  const minutes = sum(games, g => g.min);
  const played = games.filter(g => g.min > 0).length;
  const cost = gameCosts(games, match, historyRows || [], gamesPage, keyPurchases, priceEdits);

  const toRow = game => cost.rowFor(game);
  const priced = games.filter(g => cost.hasPrice(g));
  const unplayed = priced.filter(g => !g.min).map(toRow).sort((a, b) => b.spent - a.spent);
  const withAchievements = games.filter(g => g.ach && g.ach[1] > 0);

  return {
    mix,
    typed,
    listCount: all.length,
    games: games.length,
    hours: minutes / 60,
    otherHours: (sum(all, g => g.min) - minutes) / 60,
    played,
    never: games.length - played,
    top: [...games].sort((a, b) => b.min - a.min).slice(0, 10).map(toRow),
    best: priced.filter(g => g.min >= 60).map(toRow).sort((a, b) => a.spent / a.h - b.spent / b.h).slice(0, 8),
    worst: priced.filter(g => g.min < 60).map(toRow).sort((a, b) => b.spent - a.spent).slice(0, 8),
    backlog: {
      n: unplayed.length,
      total: sum(unplayed, r => r.spent),
      est: unplayed.some(r => r.est),
      top: unplayed.slice(0, 6),
    },
    ...neverPlayedBySource(games, match, licenseList, gameLinks),
    perfect: withAchievements.filter(g => g.ach[0] >= g.ach[1]).length,
    achKnown: withAchievements.length,
  };
}

// What was spent on each game.
//  - The game itself: the exact price from a checkout with only that product in it (DLC bought on its own counts
//    towards its game), else an estimate marked ≈: its share of a multi-item checkout, or what its key cost at
//    another store. Exact prices always win.
//  - On top: in-game purchases (TF2 keys, Siege credits…) and purchases outside Steam made for the game
//    (a subscription like Trackmania Club Access).
function gameCosts(games, match, historyRows, gamesPage, keyPurchases, priceEdits) {
  const spent = new Map();
  const hasBase = new Set();
  const estimated = new Set();
  const add = (map, id, amount) => map.set(id, (map.get(id) || 0) + amount);

  for (const r of historyRows) {
    if (r.kind !== 'store' || r.hw || r.paid == null) continue;
    const names = [...new Set(r.items.map(i => i.name))];
    if (names.length !== 1 || r.refunded.some(Boolean)) continue;
    const base = match(names[0], false);
    const game = base || match(names[0], true);
    if (!game) continue;
    const edit = editedPrice(priceEdits, r, names[0]);
    add(spent, game.id, edit ? edit.paid * r.items.length : r.paid);
    if (base) hasBase.add(game.id);
  }

  const addEstimate = (game, amount, isEstimate) => {
    if (!game || hasBase.has(game.id) || !(amount > 0)) return;
    add(spent, game.id, amount);
    hasBase.add(game.id);
    if (isEstimate) estimated.add(game.id);
  };
  const cartPrices = itemPrices(historyRows, gamesPage, priceEdits);
  for (const r of historyRows) {
    if (r.kind !== 'store' || r.hw || !cartPrices.has(r)) continue;
    cartPrices.get(r).forEach((price, k) => {
      if (price && !r.refunded[k]) addEstimate(match(r.items[k].name, false), price.paid, price.est);
    });
  }

  const orders = keyPurchases && keyPurchases.orders || [];
  const linked = new Map();
  const linkedEstimated = new Set();
  for (const order of orders) {
    for (const item of order.items) {
      const game = item.forGame && item.paid != null && match(item.forGame, false);
      if (!game) continue;
      add(linked, game.id, item.paid);
      if (item.est) linkedEstimated.add(game.id);
    }
  }
  for (const order of orders) {
    if (order.notSteam || order.giftReceived) continue;
    for (const item of order.items) {
      if (item.paid == null || item.status === 'gifted' || item.status === 'refunded') continue;
      const game = (item.lic && match(item.lic[1], false)) || match(item.name, false);
      addEstimate(game, item.paid / (item.qty || 1), !!item.est || !!order.subEst);
    }
  }

  const inGame = new Map();
  for (const r of historyRows) {
    if (r.kind !== 'ingame' || r.refunded.some(Boolean)) continue;
    const game = match(r.items[0] ? r.items[0].name : '', false);
    const amount = r.paid != null ? r.paid : r.total;
    if (game && amount > 0) add(inGame, game.id, amount);
  }

  return {
    hasPrice: game => spent.get(game.id) > 0 && hasBase.has(game.id),
    rowFor: game => {
      const base = hasBase.has(game.id) ? spent.get(game.id) : null;
      const linkedAmount = linked.get(game.id) || 0;
      const extra = (inGame.get(game.id) || 0) + linkedAmount;
      return {
        name: game.name,
        h: game.min / 60,
        last: game.last,
        // with no base price (free, or a boxed retail copy) the game's own cost is missing, so it's an estimate
        est: estimated.has(game.id) || linkedEstimated.has(game.id) || (base == null && extra > 0),
        linked: linkedAmount,
        spent: base != null ? base + extra : (extra > 0 ? extra : null),
        inGame: extra,
        inGameOnly: base == null && extra > 0,
      };
    },
  };
}

// For each source, how many of its games were never played. Only games tied to exactly one source count; the rest
// are listed in `unmatched` so they can be linked by hand, and games linked by hand in `handMatched`. gameLinks maps an app id to the license ("date|name") the
// visitor picked for it, which overrides matching by name.
function neverPlayedBySource(games, match, licenseList, gameLinks) {
  if (!licenseList || !licenseList.length) return { bySrc: null, srcMatched: 0, unmatched: [], handMatched: [] };
  const matchedLicenses = new Map(); // game id → indexes of the licenses whose name matches it
  licenseList.forEach((license, index) => {
    const game = match(license.steamName, false) || match(license.name, false);
    if (!game) return;
    if (!matchedLicenses.has(game.id)) matchedLicenses.set(game.id, []);
    matchedLicenses.get(game.id).push(index);
  });
  const sourceOf = license => license.source === 'beta' ? 'key' : license.source;
  const bySrc = { store: [0, 0], key: [0, 0], free: [0, 0], gift: [0, 0], other: [0, 0] };
  const unmatched = [];
  const handMatched = [];
  let srcMatched = 0;
  for (const game of games) {
    const link = gameLinks && gameLinks[game.id];
    const linked = link && licenseList.find(l => l.date + '|' + l.steamName === link);
    const licenses = (matchedLicenses.get(game.id) || []).map(i => licenseList[i]);
    const sources = new Set(linked ? [sourceOf(linked)] : licenses.map(sourceOf));
    if (linked) handMatched.push({ id: game.id, name: game.name, licenses: [linked.name], linked: true });
    if (sources.size !== 1) {
      unmatched.push({ id: game.id, name: game.name, min: game.min, licenses: licenses.map(l => l.name) });
      continue;
    }
    const counts = bySrc[[...sources][0]];
    srcMatched++;
    counts[0]++;
    if (!game.min) counts[1]++;
  }
  return { bySrc, srcMatched, unmatched, handMatched };
}
