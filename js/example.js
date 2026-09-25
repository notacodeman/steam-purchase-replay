// The made-up example account behind "See an example report". Seeded, so it's the same every time.
// Returns { h, l, p, name }: history rows, license rows and a games page, in the same shapes the parsers produce.

function makeExample() {
  let seed = 20260923;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pick = list => list[Math.floor(random() * list.length)];
  const between = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));

  const ADJECTIVES = ['Hollow', 'Crimson', 'Silent', 'Neon', 'Iron', 'Paper', 'Starlit', 'Rusty', 'Frozen', 'Wild', 'Tiny',
    'Last', 'Lost', 'Sunken', 'Clockwork', 'Velvet', 'Hidden', 'Broken', 'Golden', 'Quiet', 'Salt', 'Ember', 'Glass', 'Echo', 'Moss'];
  const NOUNS = ['Tide', 'Harbor', 'Circuit', 'Lantern', 'Orchard', 'Vanguard', 'Meridian', 'Burrow', 'Signal', 'Kingdom',
    'Drift', 'Relic', 'Garden', 'Engine', 'Frontier', 'Hollowmere', 'Canyon', 'Station', 'Voyage', 'Rift', 'Carnival', 'Archive',
    'Summit', 'Outpost', 'Thicket'];
  const SUFFIXES = ['', ' II', ': Remastered', ' Deluxe Edition', '', ' Tactics', '', ' Online', '', ': Origins', '', ' 3'];
  const PARTY_GAMES = ['Couch Castle Brawl', 'Goose Kart Party', 'Pickaxe Pals', 'Tower of Tacos', 'Midnight Heist Co-op'];
  const FRIENDS = ['Mossbeard', 'NovaFrog', 'pixelplum', 'Rook', 'quietbird', 'Gravlax', 'Tamsin', 'kettle'];
  const LIST_PRICES = [4.99, 9.99, 9.99, 14.99, 19.99, 19.99, 24.99, 29.99, 39.99, 59.99, 69.99];
  // how likely each month is to have a purchase: busy around the summer and winter sales
  const MONTH_WEIGHTS = [5, 3, 7, 4, 4, 15, 6, 4, 4, 5, 9, 19];

  const usedTitles = new Set();
  const title = () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const t = pick(ADJECTIVES) + ' ' + pick(NOUNS) + pick(SUFFIXES);
      if (!usedTitles.has(t)) {
        usedTitles.add(t);
        return t;
      }
    }
    return 'Untitled ' + usedTitles.size;
  };
  const randomMonth = year => {
    const monthsSoFar = year === 2026 ? 8 : 12;
    let month;
    do {
      let r = random() * sum(MONTH_WEIGHTS);
      month = 0;
      while (r > MONTH_WEIGHTS[month]) r -= MONTH_WEIGHTS[month++];
    } while (month >= monthsSoFar);
    return month;
  };
  const date = (year, month, day) => isoDate(year, month, Math.min(day, 28));
  const taxRate = year => year < 2016 ? 0 : year < 2024 ? 0.0625 : 0.08;
  const paymentMethod = () => {
    const r = random();
    return r < 0.5 ? 'Visa' : r < 0.78 ? 'PayPal' : 'Wallet';
  };

  const history = [];
  const licenses = [];
  const blankRow = { tax: 0, ship: 0, cur: '$', curPre: true, dec: '.', credit: false, wallet: null, tid: null };
  const item = name => ({ name, to: null, sub: null });
  const checkout = (day, items, type, method, list, paid) => {
    const tax = round2(paid * taxRate(yearOf(day)));
    history.push({
      ...blankRow, date: day, items: items.map(n => typeof n === 'string' ? item(n) : n), type, pays: [{ amt: null, method }], list, paid, tax, total: round2(paid + tax),
    });
  };
  const refund = (day, name, total) => {
    history.push({ ...blankRow, date: day, items: [item(name)], type: 'Refund', pays: [], list: null, paid: null, total });
  };

  for (let year = 2012; year <= 2026; year++) {
    // games for yourself, sometimes several in one checkout
    const purchases = between(9, 19) + (year > 2015 && year < 2022 ? 5 : 0);
    for (let k = 0; k < purchases; k++) {
      const month = randomMonth(year);
      const day = date(year, month, between(1, 28));
      const onSale = [2, 5, 10, 11].includes(month) ? random() < 0.75 : random() < 0.3;
      const cartSize = random() < 0.8 ? 1 : between(2, 3);
      const names = [];
      const prices = [];
      for (let c = 0; c < cartSize; c++) {
        names.push(title());
        prices.push(pick(LIST_PRICES));
      }
      const list = round2(sum(prices));
      const discount = onSale ? pick([25, 33, 40, 50, 60, 67, 75, 80, 85, 90]) : 0;
      checkout(day, names, 'Purchase', paymentMethod(), list, round2(list * (1 - discount / 100)));
      if (cartSize === 1 && random() < 0.06) {
        refund(addDays(day, between(1, 9)), names[0], history[history.length - 1].total);
      } else {
        names.forEach(name => licenses.push({ date: day, item: name, acq: 'Steam Store' }));
      }
    }
    // gifts for friends
    const gifts = between(2, 7);
    for (let k = 0; k < gifts; k++) {
      const day = date(year, randomMonth(year), between(1, 28));
      const name = random() < 0.6 ? pick(PARTY_GAMES) : title();
      const copies = random() < 0.25 ? 2 : 1;
      const listPrice = pick([9.99, 14.99, 19.99]);
      const discount = random() < 0.6 ? pick([33, 50, 66]) : 0;
      const items = [];
      for (let c = 0; c < copies; c++) items.push({ name, to: pick(FRIENDS), sub: null });
      checkout(day, items, 'Gift Purchase', paymentMethod(), round2(listPrice * copies), round2(listPrice * copies * (1 - discount / 100)));
      if (random() < 0.1) refund(addDays(day, between(3, 14)), name, round2(history[history.length - 1].total / copies));
    }
    if (year >= 2014) {
      const inGame = between(0, 4);
      for (let k = 0; k < inGame; k++) {
        const price = pick([4.99, 9.99, 1.99, 19.99]);
        const day = date(year, randomMonth(year), between(1, 28));
        checkout(day, [{ name: 'Skyward Brawl', to: null, sub: pick(['Season Pass', '500 Crystals', 'Starter Pack']) }], 'In-Game Purchase', 'Wallet', price, price);
      }
    }
    if (year >= 2013 && year <= 2022) {
      const market = between(2, 7);
      for (let k = 0; k < market; k++) {
        const count = between(1, 14);
        const amount = round2(count * (0.04 + random() * 0.2));
        const isSale = random() < 0.25;
        history.push({
          ...blankRow,
          date: date(year, randomMonth(year), between(1, 28)),
          items: [item('Steam Community Market')],
          type: count > 1 ? `${count} Market Transactions` : 'Market Transaction',
          pays: [{ amt: null, method: 'Wallet' }],
          list: null,
          paid: null,
          total: amount,
          credit: isSale,
          wallet: isSale ? amount : -amount,
        });
      }
    }
    const topUps = between(0, 2);
    for (let k = 0; k < topUps; k++) {
      const amount = pick([10, 20, 25, 50]);
      history.push({
        ...blankRow,
        date: date(year, randomMonth(year), between(1, 28)),
        items: [item(`Purchased $${amount}.00 Wallet Credit`)],
        type: 'Purchase',
        pays: [{ amt: null, method: 'Visa' }],
        list: amount,
        paid: amount,
        total: amount,
        wallet: amount,
      });
    }
    // licenses that don't come from purchases: key batches, free games, gifts received, playtests
    if (year >= 2013) {
      const batches = between(2, 6);
      for (let k = 0; k < batches; k++) {
        const day = date(year, randomMonth(year), between(1, 28));
        const keys = random() < 0.3 ? between(8, 16) : between(1, 6);
        for (let c = 0; c < keys; c++) licenses.push({ date: day, item: title() + (random() < 0.15 ? ' Retail' : ''), acq: 'Retail' });
      }
    }
    const freeGames = between(6, 20);
    for (let k = 0; k < freeGames; k++) licenses.push({ date: date(year, randomMonth(year), between(1, 28)), item: title(), acq: 'Complimentary' });
    const giftsReceived = between(0, 3);
    for (let k = 0; k < giftsReceived; k++) licenses.push({ date: date(year, randomMonth(year), between(1, 28)), item: pick(PARTY_GAMES), acq: 'Gift/Guest Pass' });
    if (random() < 0.3) licenses.push({ date: date(year, randomMonth(year), between(1, 28)), item: title() + ' Playtest', acq: 'Retail' });
  }
  checkout('2021-07-20', ['Steam Deck 512 GB Deposit'], 'Purchase', 'Visa', 5, 5);
  history[history.length - 1].tax = 0;
  history[history.length - 1].total = 5;
  checkout('2022-03-10', ['Steam Deck 512 GB'], 'Purchase', 'Visa', 644, 644);

  // playtime: every license except playtests is a game, and keys go unplayed far more often
  const NEVER_PLAYED_CHANCE = { 'Retail': 0.62, 'Complimentary': 0.55, 'Gift/Guest Pass': 0.15, 'Steam Store': 0.22 };
  const seen = new Set();
  const games = [];
  let appId = 100000;
  for (const license of licenses) {
    if (/Playtest/.test(license.item) || (license.acq === 'Gift/Guest Pass' && seen.has(license.item))) continue;
    const name = license.item.replace(/ Retail$/, '');
    if (seen.has(name)) continue;
    seen.add(name);
    const minutes = random() < NEVER_PLAYED_CHANCE[license.acq] ? 0 : Math.round(Math.exp(random() * 8.2) * (1 + 2 * random()));
    const lastPlayed = minutes ? Math.floor(new Date(license.date).getTime() / 1000) + between(1, 400) * 86400 : 0;
    let achievements = null;
    if (random() < 0.7) {
      const total = between(10, 60);
      achievements = [minutes ? Math.min(total, Math.floor(total * random() * 1.3)) : 0, total];
    }
    games.push({ t: /Playtest/.test(name) ? 12 : 0, id: appId++, name, min: minutes, last: lastPlayed, ach: achievements });
  }
  for (const name of PARTY_GAMES) {
    if (!seen.has(name)) games.push({ t: 0, id: appId++, name, min: between(200, 4000), last: 0, ach: null });
  }
  games.push(
    { t: 6, id: appId++, name: 'Pixel Forge Studio', min: 340, last: 0, ach: null },
    { t: 12, id: appId++, name: 'Salt Harbor Playtest', min: 95, last: 0, ach: null },
  );
  return { h: history, l: licenses, name: 'example_player', p: { games, typed: true } };
}
