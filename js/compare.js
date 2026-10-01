// Comparing the report on screen with another one side by side. The other report is one saved in this browser, a
// report file someone downloaded from this site and sent (dropped in, and saved like any imported report), or the
// example account. Each side is worked out on its own and shown in its own currency.

// The two sides' colours: the report on screen, then the one it's compared with.
const SIDE_COLORS = [COLORS.steam, COLORS.gift];
const COMMON_GAMES_ROWS = 15; // rows shown before the shared games list scrolls
const SHORT_NAME_LENGTH = 9; // names under the year chart are cut to this many characters

// The two sides while a comparison is on screen (see compareSide).
let compareSides = null;

// Runs fn with money formatted in another account's currency.
function inCurrency(money, fn) {
  const previous = currency;
  currency = money;
  try {
    return fn();
  } finally {
    currency = previous;
  }
}

const shortName = name => name.length > SHORT_NAME_LENGTH ? name.slice(0, SHORT_NAME_LENGTH - 1) + '…' : name;

// Everything the comparison needs about one report. analysis is what analyzeReport() returns.
function compareSide(name, fallbackName, { history, licenses, playtime }, keyPurchases, gamesPage) {
  const label = !hideNames && name ? name : fallbackName;
  return {
    name: label,
    short: shortName(label),
    money: history.money,
    history,
    licenses: licenses && !licenses.synthetic ? licenses : null,
    playtime,
    keys: keySpend(keyPurchases),
    gamesPage,
  };
}

// ---------- picking the other report ----------

function openCompareDialog() {
  $('#cmpErr').textContent = '';
  $('#cmpFile').value = '';
  const others = reportIndex().reports.filter(r => r.id !== report.id);
  const item = (attribute, title, detail) => `<button type="button" class="ritem cmpitem" ${attribute}>` +
    `<span class="rtxt"><b>${title}</b><span>${detail}</span></span><span class="ract">Compare</span></button>`;
  const saved = others.map(r => item(
    `data-id="${r.id}"`,
    escapeHtml(r.name || 'Unnamed report'),
    [yearSpan(r.years), r.from ? 'imported' : null, `saved ${formatDate(r.saved.slice(0, 10))}`].filter(Boolean).join(' · '),
  ));
  if (!report.isExample) saved.push(item('data-example', 'The example account', 'made up, to see what a comparison looks like'));
  $('#cmpList').innerHTML = `<h3 class="cmplh">Saved in this browser</h3>${saved.join('')}`;
  $$('#cmpList [data-id]').forEach(button => button.onclick = () => {
    const data = loadReport(button.dataset.id);
    if (data) compareWith(data);
  });
  const example = $('#cmpList [data-example]');
  if (example) example.onclick = () => compareWith({ ...makeExample(), example: true });
  $('#cmpDlg').showModal();
}

// A report file dropped or picked in the dialog. It's kept in this browser like one dropped on the upload screen.
async function compareWithFile(file) {
  $('#cmpErr').textContent = '';
  if (!file) return;
  let data = null;
  try {
    data = readReportFile(await file.text());
  } catch (e) {
    console.error(e);
  }
  if (!data) {
    $('#cmpErr').textContent = `${file.name} isn't a report downloaded from this site. Ask for the file the Download report button saves.`;
    return;
  }
  if (data.example) {
    compareWith(data);
    return;
  }
  compareWith(loadReport(importReport(data).id) || data);
}

// data: a report as saved in this browser or embedded in a report file (see storage.js).
function compareWith(data) {
  // the analysis adds fields to the rows it reads, so it gets its own copy
  const saved = structuredClone(data);
  let other;
  try {
    const analysis = analyzeReport({
      historyRows: saved.h, licenseRows: saved.l, gamesPage: saved.p || null,
      priceEdits: saved.ov || null, keyPurchases: saved.kp || null, gameLinks: saved.gl || null,
    });
    other = compareSide(saved.name, saved.example ? 'Example account' : 'Other report', analysis, saved.kp, saved.p || null);
  } catch (e) {
    console.error(e);
    $('#cmpErr').textContent = "That report's purchase history couldn't be read.";
    return;
  }
  $('#cmpDlg').close();
  const own = compareSide(report.accountName, report.isExample ? 'Example account' : 'This report', report, report.keyPurchases, report.gamesPage);
  // two copies of one account's report
  if (other.name === own.name) {
    other.name += ' (2)';
    other.short = shortName(other.name);
  }
  compareSides = [own, other];
  showComparison();
}

// ---------- the comparison ----------

function showComparison() {
  const sides = compareSides;
  destroyCharts();
  currency = sides[0].money;
  $('#report').hidden = true;
  $('#toc').hidden = true;
  $('#compare').hidden = false;
  $('#crumb').innerHTML = `Spending replay › <b>${escapeHtml(sides[0].name)} vs. ${escapeHtml(sides[1].name)}</b>`;
  document.title = `${sides[0].name} vs. ${sides[1].name}, Steam spending`;

  const sameCurrency = sides[0].money.symbol === sides[1].money.symbol;
  $('#cmpWarn').textContent = sameCurrency ? ''
    : `These accounts use different currencies (${sides[0].money.symbol} and ${sides[1].money.symbol}). Amounts are shown in each account's own currency and aren't converted, so money figures aren't compared with bars, and the year chart shows shares of each total.`;
  $('#cmpWarn').hidden = sameCurrency;

  renderCompareHero(sides, sameCurrency);
  renderCompareStats(sides, sameCurrency);
  renderCompareYears(sides, sameCurrency);
  renderCompareShares(sides);
  renderCommonGames(sides);
  scrollTo(0, 0);
}

function closeComparison() {
  compareSides = null;
  $('#compare').hidden = true;
  $('#report').hidden = false;
  renderReport();
  scrollTo(0, 0);
}

const swatch = k => `<i class="sw" style="background:${SIDE_COLORS[k]}"></i>`;

// The two names, their dates and headline totals facing each other, with a bar splitting the combined total.
function renderCompareHero(sides, sameCurrency) {
  const totals = sides.map(steamSpend);
  const card = (side, k) => {
    const keys = side.keys.orders ? `<span class="sub">+ ${escapeHtml(inCurrency(side.money, () => formatMoneyWhole(side.keys.total)))} on keys from other stores</span>` : '';
    return `<div class="hside${k ? " right" : ""}" style="--c:${SIDE_COLORS[k]}">
      <b class="hname">${escapeHtml(side.name)}</b>
      <span class="sub">${formatDate(side.history.first)} – ${formatDate(side.history.last)}</span>
      <span class="hbig">${escapeHtml(inCurrency(side.money, () => formatMoneyWhole(totals[k])))}</span>
      <span class="sub">on Steam games, DLC, gifts and items</span>${keys}
    </div>`;
  };
  let split = '';
  if (sameCurrency && totals[0] + totals[1] > 0) {
    const share = totals[0] / (totals[0] + totals[1]) * 100;
    const [more, less] = totals[0] >= totals[1] ? [0, 1] : [1, 0];
    const verdict = totals[less] > 0 && totals[more] / totals[less] >= 1.005
      ? `${escapeHtml(sides[more].name)} spent ${Math.round((totals[more] / totals[less] - 1) * 100)}% more on Steam.`
      : 'Almost exactly the same spent on Steam.';
    split = `<div class="hsplit" aria-hidden="true"><i style="width:${share.toFixed(1)}%;background:${SIDE_COLORS[0]}"></i><i style="background:${SIDE_COLORS[1]}"></i></div>
      <p class="hverdict">${verdict}</p>`;
  }
  $('#cmpHero').innerHTML = `${card(sides[0], 0)}<span class="hvs">vs</span>${card(sides[1], 1)}${split}`;
}

// ---------- side by side figures ----------

// Spending on Steam, hardware left out, as in the report's headline.
const steamSpend = side => side.history.totals.net - side.history.totals.hardware;
const yearsOnRecord = side => (new Date(side.history.last) - new Date(side.history.first)) / (365.25 * 864e5);

// Each row: the group it's in, a label, the figure for a side (null when that report doesn't have it), and how it's
// written: money, cents (money with cents), count, percent or hours. Rows that are empty or zero on both sides are
// left out.
const COMPARE_ROWS = [
  ['Spending', 'Spent on Steam, after refunds', steamSpend, 'money'],
  ['Spending', 'Keys from other stores', s => s.keys.orders ? s.keys.total : null, 'money'],
  ['Spending', 'Spent per year', s => yearsOnRecord(s) >= 1 ? steamSpend(s) / yearsOnRecord(s) : null, 'money'],
  ['Spending', 'Games and DLC bought for themselves', s => s.history.totals.itemsMine, 'count'],
  ['Spending', 'Gift copies sent', s => s.history.totals.giftBought, 'count'],
  ['Spending', 'Spent on in-game items', s => s.history.catTotals[CATEGORY.inGame], 'money'],
  ['Spending', 'Market items bought', s => s.history.totals.marketBuyCount, 'count'],
  ['Spending', 'Refunds', s => s.history.totals.refundCount, 'count'],
  ['Spending', 'Hardware (not in the totals)', s => s.history.totals.hardware, 'money'],
  ['Sales', 'Saved by buying on sale', s => s.history.totals.saved, 'money'],
  ['Sales', 'Checkouts on sale', s => s.history.totals.storeTx ? s.history.totals.saleTx / s.history.totals.storeTx * 100 : null, 'percent'],
  ['Sales', 'Average discount when on sale', s => s.history.totals.avgDiscount, 'percent'],
  ['Sales', 'Spent during Steam\'s seasonal sales', s => {
    const timing = s.history.saleTiming;
    return timing.total ? (1 - timing.by.None / timing.total) * 100 : null;
  }, 'percent'],
  ['Games and playtime', 'Games owned', s => s.playtime && s.playtime.games, 'count'],
  ['Games and playtime', 'Hours played', s => s.playtime && s.playtime.hours, 'hours'],
  ['Games and playtime', 'Games never played', s => s.playtime && s.playtime.games ? s.playtime.never / s.playtime.games * 100 : null, 'percent'],
  ['Games and playtime', 'Spent on games never played', s => s.playtime && s.playtime.backlog.total, 'money'],
  ['Games and playtime', 'Spent per hour played', s => s.playtime && s.playtime.hours >= 1 ? steamSpend(s) / s.playtime.hours : null, 'cents'],
  ['Games and playtime', 'Games with every achievement', s => s.playtime && s.playtime.perfect, 'count'],
  ['Licenses', 'Licenses on the account', s => s.licenses && s.licenses.totals.all, 'count'],
  ['Licenses', 'Bought on Steam', s => s.licenses && s.licenses.totals.store, 'count'],
  ['Licenses', 'Product keys activated', s => s.licenses && s.licenses.totals.key, 'count'],
  ['Licenses', 'Free', s => s.licenses && s.licenses.totals.free, 'count'],
  ['Licenses', 'Gifts received', s => s.licenses && s.licenses.totals.gift, 'count'],
];

// The groups' panels, left column then right, so the two columns end up about the same height.
const COMPARE_COLUMNS = [['Spending', 'Sales'], ['Games and playtime', 'Licenses']];

// What a group needs, for the note when one side doesn't have it.
const GROUP_NEEDS = { Licenses: ['licenses', 'licenses pages'], 'Games and playtime': ['playtime', 'games page'] };

function formatFigure(side, value, kind) {
  if (kind === 'money' || kind === 'cents') return inCurrency(side.money, () => kind === 'cents' ? formatMoney(value) : formatMoneyWhole(value));
  if (kind === 'percent') return Math.round(value) + '%';
  if (kind === 'hours') return Math.round(value).toLocaleString() + ' h';
  return Math.round(value).toLocaleString();
}

// One panel per group. Each figure is a label over one bar per account, the bars scaled to the bigger figure.
function renderCompareStats(sides, sameCurrency) {
  const panel = group => {
    const rows = COMPARE_ROWS.filter(row => row[0] === group).map(([, label, figure, kind]) => {
      const values = sides.map(side => {
        const v = figure(side);
        return v == null || !isFinite(v) ? null : v;
      });
      if (values.every(v => v == null || Math.abs(v) < HALF_CENT)) return '';
      const barred = kind !== 'money' && kind !== 'cents' || sameCurrency;
      const most = Math.max(...values.map(v => Math.max(0, v || 0)));
      const line = k => {
        const width = barred && most > 0 && values[k] ? (Math.max(0, values[k]) / most * 100).toFixed(1) : 0;
        const figureText = values[k] == null ? '—' : escapeHtml(formatFigure(sides[k], values[k], kind));
        const lead = values[k] != null && values[k] === most && values[1 - k] !== most ? ' lead' : '';
        return `<div class="dline"><span class="dbar"><i style="width:${width}%;background:${SIDE_COLORS[k]}"></i></span>` +
          `<span class="dv${lead}${values[k] == null ? ' none' : ''}">${figureText}</span></div>`;
      };
      return `<div class="duel"><span class="dl">${label}</span>${line(0)}${line(1)}</div>`;
    }).join('');
    if (!rows) return '';
    const need = GROUP_NEEDS[group];
    const missing = need ? sides.filter(side => !side[need[0]]).map(side => escapeHtml(side.name) + "'s") : [];
    const note = missing.length ? `<p class="kpct">No ${need[1]} in ${missing.join(' or ')} report.</p>` : '';
    return `<div class="panel"><h3>${group}</h3>${note}${rows}</div>`;
  };
  const legend = `<div class="dlegend">${sides.map((side, k) => `<span>${swatch(k)}${escapeHtml(side.name)}</span>`).join('')}</div>`;
  $('#cmpGroups').innerHTML = legend + COMPARE_COLUMNS.map(groups => `<div class="cmpcol">${groups.map(panel).join('')}</div>`).join('');
}

// ---------- year by year ----------

function renderCompareYears(sides, sameCurrency) {
  $('#cmpYearLegend').innerHTML = sides.map((side, k) => `<span>${swatch(k)}${escapeHtml(side.name)}</span>`).join('');
  const biggest = sides.map(side => {
    const perYear = yearlyWithoutHardware(side.history);
    const i = indexOfMax(perYear);
    return `${side.name}'s biggest year was ${side.history.years[i]}, at ${inCurrency(side.money, () => formatMoneyWhole(perYear[i]))}.`;
  });
  setLede('#cmpYearLede', [
    sameCurrency ? 'Spending on Steam per year, hardware left out.' : "Each year's share of that account's own Steam spending, hardware left out.",
    biggest.join(' '),
  ]);
  if (setUpCharts()) buildCompareYearChart(sides, !sameCurrency);
  else $('#cCmpYear').parentElement.innerHTML = '<p class="vempty">The chart library didn\'t load.</p>';
}

// ---------- where it went ----------

const shareText = share => share >= 10 || share === 0 ? Math.round(share) + '%' : share.toFixed(1) + '%';

// Rows of one label and a bar per side. items: [{ label, values: [a, b] }], values being counts or amounts that are
// shown as shares of each side's total. amount(side, value) writes the value next to the share.
function shareRows(sides, items, amount) {
  const totals = sides.map((_, k) => sum(items, item => Math.max(0, item.values[k])));
  const shares = items.map(item => item.values.map((v, k) => totals[k] ? Math.max(0, v) / totals[k] * 100 : 0));
  const most = Math.max(...shares.flat());
  return items.map((item, i) => `<div class="cshare">
    <div class="cshare-l">${escapeHtml(item.label)}</div>
    ${sides.map((side, k) => `<div class="cshare-r">
      <span class="trk"><i style="width:${most ? (shares[i][k] / most * 100).toFixed(1) : 0}%;background:${SIDE_COLORS[k]}"></i></span>
      <b>${shareText(shares[i][k])}</b><span>${escapeHtml(amount(side, item.values[k]))}</span>
    </div>`).join('')}
  </div>`).join('');
}

function renderCompareShares(sides) {
  $('#cmpMixLegend').innerHTML = sides.map((side, k) => `<span>${swatch(k)}${escapeHtml(side.name)}</span>`).join('');
  const categories = CATEGORIES.filter(c => sides.some(side => spendingCategories(side.history).includes(c)));
  $('#cmpTypes').innerHTML = shareRows(
    sides,
    categories.map(c => ({ label: c, values: sides.map(side => side.history.catTotals[c]) })),
    (side, v) => inCurrency(side.money, () => formatMoneyWhole(v)),
  );
  if (sides.every(side => side.licenses)) {
    const sources = ['store', 'key', 'free', 'gift', 'beta'].filter(s => sides.some(side => side.licenses.totals[s]));
    $('#cmpSources').innerHTML = shareRows(
      sides,
      sources.map(s => ({ label: LICENSE_SOURCES[s].plural, values: sides.map(side => side.licenses.totals[s]) })),
      (side, v) => v.toLocaleString(),
    );
  } else {
    $('#cmpSources').innerHTML = '<p class="vempty">Needs both accounts\' licenses pages.</p>';
  }
}

// ---------- shared games ----------

// Games on both accounts, by app id from the games pages, with each side's playtime. Without both games pages, the
// licenses both accounts have, by name, with the date each added it. null if neither can be worked out.
function commonGames(sides) {
  if (sides.every(side => side.playtime)) {
    const byId = sides.map(side => new Map(side.gamesPage.games.filter(g => g.k === 'game' || !g.k).map(g => [g.id, g])));
    const rows = [...byId[0].values()].filter(g => byId[1].has(g.id)).map(g => ({ name: g.name, values: [g.min, byId[1].get(g.id).min] }));
    rows.sort((a, b) => sum(b.values) - sum(a.values) || a.name.localeCompare(b.name));
    return { kind: 'games', rows, counts: byId.map(m => m.size) };
  }
  if (sides.every(side => side.licenses)) {
    // earliest license of each name; betas left out
    const byName = sides.map(side => {
      const names = new Map();
      for (const license of side.licenses.list) {
        const key = normalizeName(license.name);
        if (license.source === 'beta' || !key) continue;
        const known = names.get(key);
        if (!known || (license.date && (!known.date || license.date < known.date))) names.set(key, license);
      }
      return names;
    });
    const rows = [...byName[0].entries()].filter(([key]) => byName[1].has(key))
      .map(([key, license]) => ({ name: license.name, values: [license.date, byName[1].get(key).date] }));
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return { kind: 'licenses', rows, counts: byName.map(m => m.size) };
  }
  return null;
}

function renderCommonGames(sides) {
  const common = commonGames(sides);
  const table = $('#cmpGames .tbl');
  table.hidden = !common || !common.rows.length;
  if (!common) {
    $('#cmpGamesTitle').textContent = 'Games you both own';
    setLede('#cmpGamesLede', ["Add both accounts' games pages, or their licenses pages, to see what's on both."]);
    return;
  }
  const games = common.kind === 'games';
  const noun = games ? 'game' : 'license';
  $('#cmpGamesTitle').textContent = games ? 'Games on both accounts' : 'Licenses on both accounts';
  const n = common.rows.length;
  if (!n) {
    setLede('#cmpGamesLede', [`Not a single ${noun} on both accounts.`]);
    return;
  }
  const shareOf = k => common.counts[k] ? Math.round(n / common.counts[k] * 100) : 0;
  setLede('#cmpGamesLede', [
    `${pluralize(n, noun)} on both: ${shareOf(0)}% of ${sides[0].name}'s and ${shareOf(1)}% of ${sides[1].name}'s.`,
    sides.map((side, k) => `${side.name} has ${(common.counts[k] - n).toLocaleString()} the other doesn't.`).join(' '),
    games ? 'Sorted by playtime on both accounts together.' : 'Matched by name, because only the licenses pages are there. Add both games pages to match by game and compare playtime.',
  ]);
  $('#cmpGamesHead').innerHTML = `<div role="columnheader">${games ? 'Game' : 'License'}</div>` +
    sides.map((side, k) => `<div role="columnheader" class="r">${swatch(k)}${escapeHtml(side.short)}</div>`).join('');
  const cell = v => games ? `<div role="cell" class="r${v ? '' : ' z'}">${formatHours(v / 60)}</div>` : `<div role="cell" class="r">${v ? formatDate(v) : '—'}</div>`;
  $('#cmpCommon').innerHTML = common.rows.map(row =>
    `<div class="tr cmpg" role="row"><div role="cell" class="nm">${escapeHtml(row.name)}</div>${row.values.map(cell).join('')}</div>`).join('');
  $('#cmpCommon').scrollTop = 0;
  scrollAfterRows([$('#cmpCommon')], '#cmpGames', COMMON_GAMES_ROWS);
}

// ---------- startup ----------

function initCompare() {
  $('#cmpBack').onclick = closeComparison;
  $('#cmpOther').onclick = openCompareDialog;
  $('#cmpDlg .x').onclick = () => $('#cmpDlg').close();
  $('#cmpFile').onchange = event => compareWithFile(event.target.files[0]);
  const dropZone = $('#cmpDrop');
  ['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.add('over');
  }));
  ['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.remove('over');
  }));
  dropZone.addEventListener('drop', event => compareWithFile(event.dataTransfer.files[0]));
}
