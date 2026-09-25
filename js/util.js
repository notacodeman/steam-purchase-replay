// Small helpers shared by every other script: DOM access, dates, money, names and colours.

// Amounts smaller than this are treated as zero (rounding noise).
const HALF_CENT = 0.005;

const COLORS = {
  steam: '#66c0f4',
  key: '#e8b64a',
  gift: '#ff6fa8',
  free: '#6b7a88',
  freeText: '#9aa7b3', // the free grey is too dark for text
  beta: '#9fd3e8',
  other: '#8f98a0',
  sale: '#beee11',
  purple: '#b69cff',
  orange: '#ff9f43',
  hardware: '#e6edf3',
  ink: '#dcdedf',
  text: '#c7d5e0',
  muted: '#8f98a0',
  background: '#1b2838',
  grid: 'rgba(102,192,244,.08)',
};

// ---------- DOM ----------

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const escapeHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function setSectionVisible(id, visible) {
  const el = document.getElementById(id);
  if (el) el.hidden = !visible;
}

// A section's intro text: one line per sentence group, empty entries skipped.
function setLede(selector, lines) {
  $(selector).innerHTML = lines.filter(Boolean).map(line => `<span class="ln">${escapeHtml(line)}</span>`).join('');
}

function downloadFile(content, type, filename) {
  const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ---------- numbers and text ----------

const sum = (list, pick = x => x) => list.reduce((total, x, i) => total + pick(x, i), 0);
const round2 = v => Math.round(v * 100) / 100;
const pluralize = (n, word, plural) => `${n.toLocaleString()} ${n === 1 ? word : (plural || word + 's')}`;
const newId = () => 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Index of the largest value.
const indexOfMax = values => values.reduce((best, v, i) => v > values[best] ? i : best, 0);

// The n biggest entries of a list of numbers, as indexes, biggest first.
const topIndexes = (values, n) => values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, n).map(x => x[1]);

// ---------- dates (all dates are "YYYY-MM-DD" strings) ----------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
  'November', 'December'];
const MONTH_INDEX = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

const isoDate = (year, monthIndex, day) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const yearOf = date => +date.slice(0, 4);
const monthOf = date => +date.slice(5, 7) - 1;

// Noon avoids daylight-saving edges moving a date to the day before or after.
function addDays(date, days) {
  const d = new Date(date + 'T12:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// "Mar 5, 2024", "March 5, 2024", "5 Mar, 2024" and "5 March 2024", as Steam writes them in English.
function parseSteamDate(text) {
  text = (text || '').replace(/\s+/g, ' ').trim();
  let m = text.match(/^([A-Za-z]{3,})\.? (\d{1,2}),? (\d{4})/);
  if (m && MONTH_INDEX[m[1].slice(0, 3).toLowerCase()] != null) {
    return isoDate(+m[3], MONTH_INDEX[m[1].slice(0, 3).toLowerCase()], +m[2]);
  }
  m = text.match(/^(\d{1,2}) ([A-Za-z]{3,})\.?,? (\d{4})/);
  if (m && MONTH_INDEX[m[2].slice(0, 3).toLowerCase()] != null) {
    return isoDate(+m[3], MONTH_INDEX[m[2].slice(0, 3).toLowerCase()], +m[1]);
  }
  return null;
}

const formatDate = date => date
  ? new Date(date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : 'Date unknown';

const formatMonth = yearMonth =>
  new Date(yearMonth + '-15T12:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// ---------- money ----------

// Parses amounts as Steam and spreadsheets write them: "$1,234.56", "CDN$ 25.00", "12,50€", "R$ 5,40", "-$9.83".
// Returns { value, currency, symbolFirst, decimalMark } or null.
function parseMoney(text) {
  if (!text) return null;
  text = text.replace(/[  ]/g, ' ').trim();
  const m = text.match(/\d(?:[\d.,' ]*\d)?/);
  if (!m) return null;
  const before = text.slice(0, m.index);
  const after = text.slice(m.index + m[0].length);
  const digits = m[0].replace(/[' ]/g, '');
  const lastComma = digits.lastIndexOf(',');
  const lastDot = digits.lastIndexOf('.');
  let value;
  let decimalMark = '.';
  if (lastComma >= 0 && lastDot >= 0) {
    // both marks: whichever comes last is the decimal mark
    if (lastComma > lastDot) {
      value = +digits.replace(/\./g, '').replace(',', '.');
      decimalMark = ',';
    } else {
      value = +digits.replace(/,/g, '');
    }
  } else if (lastComma >= 0) {
    // "12,50" is a decimal comma; "1,234" is a thousands separator
    const decimals = digits.length - lastComma - 1;
    if (decimals !== 3 && digits.split(',').length === 2) {
      value = +digits.replace(',', '.');
      decimalMark = ',';
    } else {
      value = +digits.replace(/,/g, '');
    }
  } else if (lastDot >= 0) {
    // "1.234" is a thousands separator; "12.99" is a decimal point
    value = digits.length - lastDot - 1 === 3 ? +digits.replace(/\./g, '') : +digits;
  } else {
    value = +digits;
  }
  if (!isFinite(value)) return null;
  const sign = /-/.test(before) ? -1 : 1;
  const symbolBefore = before.replace(/[+\-\s]/g, '');
  const symbolAfter = after.split(/\s{2,}|\n/)[0].replace(/[+\-]/g, '').trim().split(' ')[0] || '';
  return { value: sign * value, currency: symbolBefore || symbolAfter, symbolFirst: !!symbolBefore, decimalMark };
}

// The account's currency, set from the purchase history when a report is built.
let currency = { symbol: '$', symbolFirst: true, decimalMark: '.' };

function formatMoney(value, decimals = 2) {
  const number = Math.abs(Number(value)).toLocaleString(currency.decimalMark === ',' ? 'de-DE' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  // letter codes get a space ("CDN$ 25.00"), symbols don't ("$25.00")
  const symbol = currency.symbol.length > 1 && /[A-Za-z]/.test(currency.symbol) ? currency.symbol + ' ' : currency.symbol;
  const sign = value < 0 ? '-' : '';
  return sign + (currency.symbolFirst ? symbol + number : number + ' ' + currency.symbol);
}

const formatMoneyWhole = value => formatMoney(value, 0);

// Hours played → "1,234 h", "12.5 h" or "25 min".
const formatHours = hours => hours <= 0 ? 'never'
  : hours >= 100 ? Math.round(hours).toLocaleString() + ' h'
    : hours >= 1 ? hours.toFixed(1) + ' h'
      : Math.round(hours * 60) + ' min';

// ---------- game and product names ----------

// Reduces a product name to a comparable form: no trademark signs, accents, punctuation or bracketed notes,
// lower case. "S.T.A.L.K.E.R.: Shadow of Chernobyl™ (2007)" → "stalker shadow of chernobyl 2007".
const normalizeName = s => s
  .replace(/[™®©]/g, '')
  .replace(/\b([A-Za-z])\.(?=[A-Za-z]\.)/g, '$1')
  .replace(/\b([A-Za-z])\.(?=\s|$|\d)/g, '$1')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/\((\d{4})\)/g, ' $1 ')
  .replace(/[\(\[][^\)\]]*[\)\]]/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

// Drops edition words from a normalized name: "doom deluxe edition" → "doom".
const stripEditionSuffix = s => s
  .replace(/\s+(standard|starter|deluxe|digital deluxe|gold|ultimate|complete|definitive|premium|special|collectors|game of the year|goty|enhanced|anniversary|legendary)\s+edition$/, '')
  .replace(/\s+(edition|goty|preorder|pre purchase|launch|bogo|legendary|\d pack)$/, '');

// Region and packaging tags Steam puts in license names.
const PACKAGE_TAGS = /\((?:RoW|ROW|ROW Key|WW|WW ex CN|Key-Only WW|Key-only WW|Key-Only Everywhere except CN|NA|NA \+ ROW|Global|Retail- Global|Rest of World|Digital Retail|Post Preorder|Post-launch|Post-Launch|Promotion\/Event Package|event package|Win64|US)\)|\[(?:DIGITAL RETAIL|Digital)\]/g;

// A license name as a person would write it: "Portal 2 (RoW) Retail" → "Portal 2".
function cleanLicenseName(name) {
  let s = name
    .replace(/^DO NOT USE - /, '')
    .replace(PACKAGE_TAGS, '')
    .replace(/\s+(?:ESD|PROMO|Steam Store and Retail Key)\b/g, '')
    .replace(/\s+Retail\s+(?:WW|Activation)$/, ' Retail');
  for (let i = 0; i < 3; i++) s = s.replace(/(?:\s+-)?\s+(?:retail|digital)\b(?=\s*(?:-|$))/gi, '');
  s = s
    .replace(/\s+ROW$/, '')
    .replace(/\s*-\s*(?:-\s*)+/g, ' - ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s-]+|[\s-]+$/g, '');
  return s || name;
}

const ADDON_WORDS = /(edition|soundtrack|ost|dlc|season pass|pack|bundle|upgrade|expansion|artbook)/;

// Returns match(name, allowAddon) → the game from `games` a product name refers to, or null.
// With allowAddon, "Game Name Soundtrack" also matches "Game Name".
function makeNameMatcher(games) {
  const byName = new Map();
  for (const game of games) {
    const n = normalizeName(game.name);
    if (n && !byName.has(n)) byName.set(n, game);
  }
  const longestFirst = [...byName.keys()].sort((a, b) => b.length - a.length);

  const lookup = (name, allowAddon) => {
    const n = normalizeName(name);
    if (byName.has(n)) return byName.get(n);
    const stripped = stripEditionSuffix(n);
    if (byName.has(stripped)) return byName.get(stripped);
    // a store name that drops a series prefix ("Rainbow Six Siege" for "Tom Clancy's Rainbow Six Siege")
    if (stripped.length >= 10) {
      const endsWith = longestFirst.filter(k => k.endsWith(' ' + stripped));
      if (endsWith.length === 1) return byName.get(endsWith[0]);
    }
    if (allowAddon) {
      const base = longestFirst.find(k => k.length >= 4 && n.startsWith(k + ' ') && ADDON_WORDS.test(n.slice(k.length)));
      if (base) return byName.get(base);
    }
    return null;
  };

  // Dual titles like "RESIDENT EVIL 2 / BIOHAZARD RE:2 Deluxe Edition": try the first title, but only when its last
  // word also appears in the second, so "Resident Evil / Biohazard Revelations 2" doesn't become Resident Evil.
  return (name, allowAddon) => {
    const found = lookup(name, allowAddon);
    if (found || !name.includes(' / ')) return found;
    const [first, second] = name.split(' / ');
    const lastWord = normalizeName(first).split(' ').pop();
    return lastWord && (' ' + normalizeName(second) + ' ').includes(' ' + lastWord + ' ') ? lookup(first, false) : null;
  };
}
