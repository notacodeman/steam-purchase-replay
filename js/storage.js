// Keeping reports in this browser (localStorage). Only parsed data is kept, never the saved pages themselves.
//
// Several reports can be kept, each under 'ssr:r:<id>' as { v: 1, id, saved, name, h, l, p, kp, ov, gl, from }:
// history rows, license rows, games page, 3rd-party purchases, price edits, games matched to licenses by hand, and
// `from`, the stamp of the downloaded report it was imported from. 'ssr:index' lists them as
// { current, reports: [{ id, name, saved, years, orders, from }] }, newest first; `current` opens on the next visit.
// Reports saved before there could be several were kept under 'ssr:v1' and are moved over on first load.
//
// A downloaded report carries its own data, so when the file itself is opened only its edits (kp, ov, gl) are saved,
// under a key of their own, with `basedOn` naming the copy of the file they belong to.

const isDownloadedReport = () => !!document.getElementById('embedded-data');
const INDEX_KEY = 'ssr:index';
const reportKey = id => 'ssr:r:' + id;
const FILE_EDITS_KEY = 'ssr:report:' + location.pathname;

// For a downloaded report: the stamp of this copy of the file, so edits saved from an older copy aren't applied.
let embeddedStamp = null;

// Reports that didn't fit in storage, kept for this visit only.
const unsavedReports = new Map();

function readStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch (e) {
    return null;
  }
}

// Returns false if the browser wouldn't store it (storage full, private browsing, blocked site data).
function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function removeStored(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // nothing stored
  }
}

const newReportId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// What the report list shows about a report, without reading all of its data.
function reportSummary(state) {
  const dates = (state.h || []).map(r => r.date).filter(Boolean).sort();
  return {
    id: state.id,
    name: state.name || null,
    saved: state.saved,
    years: dates.length ? [dates[0].slice(0, 4), dates[dates.length - 1].slice(0, 4)] : null,
    orders: ordersOf(state.kp).length,
    from: state.from || null,
  };
}

function reportIndex() {
  const index = readStored(INDEX_KEY) || { current: null, reports: [] };
  const old = readStored('ssr:v1');
  if (old) {
    if (old.h) {
      const state = { ...old, id: newReportId() };
      if (writeStored(reportKey(state.id), state)) {
        index.reports.unshift(reportSummary(state));
        index.current = index.current || state.id;
        writeStored(INDEX_KEY, index);
      }
    }
    removeStored('ssr:v1');
  }
  for (const state of unsavedReports.values()) {
    index.reports = [{ ...reportSummary(state), unsaved: true }, ...index.reports.filter(r => r.id !== state.id)];
  }
  return index;
}

const loadReport = id => id && (unsavedReports.get(id) || readStored(reportKey(id)));

// Saves a report and makes it the one that opens next time. Returns false if it didn't fit, in which case it's kept
// for this visit only (and any older copy of it stays stored).
function storeReport(state) {
  state = { v: 1, ...state, saved: new Date().toISOString() };
  const stored = writeStored(reportKey(state.id), state);
  const index = readStored(INDEX_KEY) || { current: null, reports: [] };
  if (stored) {
    unsavedReports.delete(state.id);
    index.reports = [reportSummary(state), ...index.reports.filter(r => r.id !== state.id)];
  } else {
    unsavedReports.set(state.id, state);
  }
  if (index.reports.some(r => r.id === state.id)) index.current = state.id;
  writeStored(INDEX_KEY, index);
  return stored;
}

function removeReport(id) {
  unsavedReports.delete(id);
  removeStored(reportKey(id));
  const index = readStored(INDEX_KEY);
  if (!index) return;
  index.reports = index.reports.filter(r => r.id !== id);
  if (index.current === id) index.current = index.reports[0]?.id || null;
  writeStored(INDEX_KEY, index);
}

// Saves the report on screen. Returns false if the browser wouldn't store it.
function saveState() {
  const edits = { kp: report.keyPurchases || { orders: [] }, ov: report.priceEdits || null, gl: report.gameLinks || null };
  if (report.fromFile) {
    return writeStored(FILE_EDITS_KEY, { v: 1, ...edits, saved: new Date().toISOString(), basedOn: embeddedStamp, edited: true });
  }
  if (!report.id) report.id = newReportId();
  return storeReport({
    id: report.id, name: report.accountName, h: report.historyRows, l: report.licenseRows, p: report.gamesPage,
    ...edits, from: report.from || null,
  });
}

const loadFileEdits = () => readStored(FILE_EDITS_KEY);

// Removes the report on screen from this browser.
function forgetState() {
  if (report.fromFile) removeStored(FILE_EDITS_KEY);
  else if (report.id) removeReport(report.id);
}
