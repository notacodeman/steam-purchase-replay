// Licenses page → every license with where it came from, per-year and per-month counts, and key redemption sprees.

// Where a license came from. `other` is only used when there are no licenses pages, so keys, free games and gifts
// can't be told apart.
const LICENSE_SOURCES = {
  store: { label: 'Bought on Steam', plural: 'Bought on Steam', short: 'Steam', color: COLORS.steam },
  key: { label: 'Product key', plural: 'Product keys', short: 'Keys', color: COLORS.key },
  free: { label: 'Free', plural: 'Free', short: 'Free', color: COLORS.free },
  gift: { label: 'Gift received', plural: 'Gifts received', short: 'Gifts', color: COLORS.gift },
  beta: { label: 'Beta or playtest', plural: 'Betas and playtests', short: 'Betas', color: COLORS.beta },
  other: { label: 'Key, free or gift', plural: 'Keys, free games and gifts', short: 'Other', color: COLORS.other },
};

// Steam's wording on the licenses page → source.
const ACQUISITION_SOURCE = {
  'Steam Store': 'store',
  'Retail': 'key',
  'Complimentary': 'free',
  'Gift/Guest Pass': 'gift',
  'Other': 'other',
};

const BETA_PATTERN = /beta testing|\bbeta$|playtest/i;

// Returns null when there's nothing dated to show.
function analyzeLicenses(licenseRows, gamesPage) {
  if (!licenseRows.length) return null;
  const rows = licenseRows
    .map((r, i) => ({ ...r, order: i, source: ACQUISITION_SOURCE[r.acq] }))
    .filter(r => r.source);
  for (const r of rows) {
    if (r.source === 'key' && BETA_PATTERN.test(r.item)) r.source = 'beta';
  }
  if (gamesPage && gamesPage.games) reclassifyFullGameBetaKeys(rows, gamesPage.games);

  // newest first; rows with no date go last
  rows.sort((a, b) => {
    if (!a.date !== !b.date) return a.date ? -1 : 1;
    return a.date < b.date ? 1 : a.date > b.date ? -1 : a.order - b.order;
  });
  const dated = rows.filter(r => r.date);
  if (!dated.length) return null;

  const first = dated[dated.length - 1].date;
  const last = dated[0].date;
  const years = [];
  for (let y = yearOf(first); y <= yearOf(last); y++) years.push(y);
  const byYear = Object.fromEntries(['store', 'key', 'beta', 'free', 'gift'].map(s => [s, years.map(() => 0)]));
  for (const r of dated) {
    if (byYear[r.source]) byYear[r.source][yearOf(r.date) - years[0]]++;
  }

  // month of year, full calendar years only so a partial first or last year doesn't skew it
  const monthYears = [years[0] + 1, years[years.length - 1] - 1];
  const monthKeys = new Array(12).fill(0);
  const monthStore = new Array(12).fill(0);
  for (const r of dated) {
    const year = yearOf(r.date);
    if (year < monthYears[0] || year > monthYears[1]) continue;
    if (r.source === 'key') monthKeys[monthOf(r.date)]++;
    if (r.source === 'store') monthStore[monthOf(r.date)]++;
  }

  const totals = Object.fromEntries(Object.keys(byYear).map(s => [s, sum(byYear[s])]));
  totals.other = rows.filter(r => r.source === 'other').length;
  totals.all = rows.length;

  return {
    synthetic: rows.some(r => r.pieced),
    first,
    last,
    years,
    byYear,
    monthKeys,
    monthStore,
    monthYears,
    sprees: redemptionSprees(rows),
    totals,
    list: rows.map(r => {
      const name = cleanLicenseName(r.item);
      return { date: r.date, name, rawName: name !== r.item ? r.item : '', steamName: r.item, source: r.source };
    }),
  };
}

// Some keys are issued as "Game for Beta Testing" / "Game - Beta Testing" packages but grant the full game. If the
// name without the suffix is something Steam lists as a game, and nothing else on the account grants it, the key
// counts as a key for that game.
function reclassifyFullGameBetaKeys(rows, games) {
  const match = makeNameMatcher(games);
  const granted = new Set();
  for (const r of rows) {
    if (r.source === 'beta') continue;
    const game = match(cleanLicenseName(r.item), false);
    if (game) granted.add(game.id);
  }
  for (const r of rows) {
    if (r.source !== 'beta') continue;
    const base = r.item.replace(/\s*(?:-\s*|for\s+)beta\s+testing$/i, '').trim();
    if (base === r.item) continue;
    const game = match(base, false);
    if (game && (game.t === 0 || game.t == null) && !granted.has(game.id)) {
      r.source = 'key';
      granted.add(game.id);
    }
  }
}

// The days the most keys were activated.
function redemptionSprees(rows) {
  const byDay = new Map();
  for (const r of rows) {
    if (r.source !== 'key') continue;
    if (!byDay.has(r.date)) byDay.set(r.date, []);
    byDay.get(r.date).push(cleanLicenseName(r.item));
  }
  return [...byDay.entries()]
    .sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1))
    .slice(0, 8)
    .map(([date, names]) => ({ date, n: names.length, names }));
}

// Without the licenses pages, a license list is pieced together from what there is: every product bought on Steam
// (with its purchase date) from the purchase history, plus every other game on the games page, which came from a
// key, a free claim or a gift and has no date.
function synthesizeLicenses(history, gamesPage) {
  const rows = [];
  for (const r of history.rows) {
    if (r.kind !== 'store' || r.hw) continue;
    r.items.forEach((item, k) => {
      if (!r.refunded[k]) rows.push({ date: r.date, item: item.name, acq: 'Steam Store', pieced: true });
    });
  }
  if (gamesPage && gamesPage.games) {
    const match = makeNameMatcher(gamesPage.games);
    const bought = new Set(rows.map(r => match(r.item, false)).filter(Boolean).map(g => g.id));
    const typed = isTypedGamesPage(gamesPage);
    for (const game of gamesPage.games) {
      const kind = appKind(game, typed);
      if (bought.has(game.id) || (kind !== 'game' && kind !== 'delisted')) continue;
      rows.push({ date: '', item: game.name, acq: 'Other', pieced: true });
    }
  }
  return rows;
}
