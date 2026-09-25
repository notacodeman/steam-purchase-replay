// Keeping the report in this browser (localStorage). Only parsed data is kept, never the saved pages themselves.
//
// Saved shape: { v: 1, saved, name, h, l, p, kp, ov, gl, basedOn, edited } — history rows, license rows, games page,
// 3rd-party purchases, price edits and games matched to licenses by hand. A downloaded report carries its own data,
// so for one of those only the edits (kp, ov, gl) are saved, under a key of their own, with `basedOn` naming the copy
// of the file they belong to.

const isDownloadedReport = () => !!document.getElementById('embedded-data');
const STORAGE_KEY = isDownloadedReport() ? 'ssr:report:' + location.pathname : 'ssr:v1';

// For a downloaded report: the stamp of this copy of the file, so edits saved from an older copy aren't applied.
let embeddedStamp = null;

// Returns false if the browser wouldn't store everything.
function saveState() {
  const edits = { v: 1, name: report.accountName, kp: report.keyPurchases || { orders: [] }, ov: report.priceEdits || null, gl: report.gameLinks || null };
  try {
    const state = { ...edits, saved: new Date().toISOString(), basedOn: embeddedStamp, edited: true };
    if (!isDownloadedReport() && !report.isExample) {
      state.h = report.historyRows;
      state.l = report.licenseRows;
      state.p = report.gamesPage;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    // storage full: keep the edits at least
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...edits, partial: true }));
    } catch (e2) {
      // storage unavailable (private browsing, blocked site data)
    }
    return false;
  }
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch (e) {
    return null;
  }
}

function forgetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // nothing stored
  }
}
