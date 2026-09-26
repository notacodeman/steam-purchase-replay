// The upload screen, building a report, the section rail, and startup.

// ---------- building a report ----------

// historyRows, licenseRows and gamesPage are parsed pages (see parse.js); priceEdits, keyPurchases and gameLinks are
// the visitor's own additions. id is the saved report it came from (see storage.js), from the downloaded report it was
// imported from, and fromFile is set when this page is a downloaded report showing its own data.
// Returns false if the purchase history couldn't be read.
function runReport({
  historyRows, licenseRows, gamesPage, accountName, isExample = false, priceEdits = null, keyPurchases = null, gameLinks = null,
  id = null, from = null, fromFile = false,
}) {
  let history;
  try {
    history = analyzeHistory(historyRows, gamesPage);
  } catch (e) {
    console.error(e);
    $('#imsg').innerHTML = '<div class="msg err">Something in the purchase history couldn\'t be read. Try saving the page again after it has fully loaded.</div>';
    return false;
  }
  const licenses = analyzeLicenses(licenseRows && licenseRows.length ? licenseRows : synthesizeLicenses(history, gamesPage), gamesPage);
  let playtime = null;
  if (gamesPage && gamesPage.games && gamesPage.games.length) {
    try {
      playtime = analyzePlaytime(gamesPage, history.rows, licenses && licenses.list, { keyPurchases, priceEdits, gameLinks });
    } catch (e) {
      console.error(e);
    }
  }
  Object.assign(report, {
    historyRows, licenseRows: licenseRows || [], gamesPage: gamesPage || null, accountName, isExample,
    history, licenses, playtime, priceEdits: priceEdits || null, keyPurchases: keyPurchases || null, gameLinks: gameLinks || null,
    id, from, fromFile,
  });
  $('#intro').hidden = true;
  $('#report').hidden = false;
  $('#reset').hidden = false;
  $('#exbar').hidden = !isExample;
  renderReport();
  scrollTo(0, 0);
  // a downloaded report already carries its data; it's only saved here once it's edited
  if (!isExample && !fromFile) saveState();
  return true;
}

// The same, from what's stored in the browser or embedded in a downloaded report.
const runSavedReport = (saved, overrides = {}) => runReport({
  historyRows: saved.h, licenseRows: saved.l, gamesPage: saved.p || null, accountName: saved.name,
  isExample: !!saved.example, priceEdits: saved.ov || null, keyPurchases: saved.kp || null, gameLinks: saved.gl || null,
  id: saved.id || null, from: saved.from || null, ...overrides,
});

function showUploadScreen() {
  destroyCharts();
  $('#report').hidden = true;
  $('#intro').hidden = false;
  $('#reset').hidden = true;
  $('#toc').hidden = true;
  $('#crumb').innerHTML = 'Steam › Account › <b>Spending replay</b>';
  document.title = 'Steam Spending Replay';
  drawReportList();
  scrollTo(0, 0);
}

// ---------- saved reports ----------

// The report picked in the list on the upload screen: its id, '' for a new report, or null before anything is picked.
let selectedReport = null;

const yearSpan = years => years && (years[0] === years[1] ? years[0] : years.join('–'));

function drawReportList() {
  const reports = reportIndex().reports;
  const ids = reports.map(r => r.id);
  if (selectedReport === null || (selectedReport && !ids.includes(selectedReport))) {
    const current = reportIndex().current;
    selectedReport = ids.includes(current) ? current : ids[0] || '';
  }
  $('#rlist').hidden = !reports.length;
  const item = (id, title, detail, actions = '') => `<label class="ritem${id === selectedReport ? ' on' : ''}">` +
    `<input type="radio" name="rsel" value="${id}"${id === selectedReport ? ' checked' : ''}>` +
    `<span class="rtxt"><b>${title}</b><span>${detail}</span></span>${actions}</label>`;
  $('#rlItems').innerHTML = reports.map(r => item(
    r.id,
    escapeHtml(r.name || 'Unnamed report'),
    [
      yearSpan(r.years),
      pluralize(r.orders, 'added purchase'),
      r.from ? 'imported' : null,
      r.unsaved ? 'not saved, this browser\'s storage is full' : `saved ${new Date(r.saved).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    ].filter(Boolean).join(' · '),
    `<span class="ract"><button type="button" class="linkbtn" data-open="${r.id}">Open</button> · <button type="button" class="linkbtn" data-remove="${r.id}">Remove</button></span>`,
  )).join('') + item('', 'Start a new report', 'from the pages you drop here');

  $$('#rlItems input').forEach(input => input.onchange = () => {
    selectedReport = input.value;
    $$('#rlItems .ritem').forEach(label => label.classList.toggle('on', label.contains(input)));
    drawUploads();
  });
  $$('#rlItems [data-open]').forEach(button => button.onclick = event => {
    event.preventDefault();
    const saved = loadReport(button.dataset.open);
    if (saved) runSavedReport(saved);
  });
  $$('#rlItems [data-remove]').forEach(button => button.onclick = event => {
    event.preventDefault();
    const name = reports.find(r => r.id === button.dataset.remove)?.name;
    if (!confirm(`Remove ${name ? name + "'s" : 'this'} report and its added purchases from this browser? Download the report first if you want to keep it.`)) return;
    removeReport(button.dataset.remove);
    drawReportList();
  });
  drawUploads();
}

// A report downloaded from this site (anyone's) carries its data in a script tag. Returns that data, or null.
function readReportFile(text) {
  const tag = new DOMParser().parseFromString(text, 'text/html').getElementById('embedded-data');
  if (!tag) return null;
  const data = JSON.parse(tag.textContent);
  return data && Array.isArray(data.h) && data.h.length ? data : null;
}

// Adds a downloaded report to the ones kept in this browser, once per copy of the file.
// Returns { id, added }, added being false when that copy was already here.
function importReport(data) {
  const existing = data.stamp && reportIndex().reports.find(r => r.from === data.stamp);
  if (existing) return { id: existing.id, added: false };
  const id = newReportId();
  storeReport({
    id, name: data.name || null, h: data.h, l: data.l || [], p: data.p || null,
    kp: data.kp || null, ov: data.ov || null, gl: data.gl || null, from: data.stamp || null,
  });
  return { id, added: true };
}

// ---------- uploaded files ----------

const uploads = []; // { name, size, kind, rows, account, games, empty, error, example, reportId, imported }
const UPLOAD_KIND_LABELS = { history: 'Purchase history', licenses: 'Licenses', games: 'Games', report: 'Report', unknown: 'Not recognized' };
const uploadsOf = kind => uploads.filter(f => f.kind === kind && f.rows.length);
const pageAccount = () => uploads.find(f => f.kind !== 'report' && f.account)?.account || null;

async function addFiles(files) {
  for (const file of files) {
    if (uploads.some(f => f.name === file.name && f.size === file.size)) continue;
    const upload = { name: file.name, size: file.size, kind: 'unknown', rows: [], account: null };
    try {
      const text = await file.text();
      const data = text.includes('<script id="embedded-data"') ? readReportFile(text) : null;
      if (data) {
        upload.kind = 'report';
        upload.account = data.name || null;
        if (data.example) {
          upload.example = upload.empty = true;
        } else {
          upload.rows = data.h;
          const { id, added } = importReport(data);
          upload.reportId = selectedReport = id;
          upload.imported = added;
        }
      } else if (text.includes('"OwnedGames') || text.includes('OwnedGames\\"') || /var rgGames\s*=/.test(text)) {
        upload.kind = 'games';
        upload.games = parseGamesPage(text);
        upload.rows = upload.games ? upload.games.games : [];
        upload.empty = !upload.games;
      } else {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        upload.kind = detectPageKind(doc);
        upload.account = accountNameOf(doc);
        upload.rows = upload.kind === 'history' ? parseHistoryPage(doc) : upload.kind === 'licenses' ? parseLicensesPage(doc) : [];
        upload.empty = upload.kind !== 'unknown' && !upload.rows.length;
      }
    } catch (e) {
      console.error(e);
      upload.error = true;
    }
    uploads.push(upload);
  }
  drawReportList();
}

// The saved report the dropped pages go into: the one picked in the list, unless the pages are for another account.
// Then it's that account's saved report if there is one, or a new report. note says so when that happens.
function uploadTarget() {
  const reports = reportIndex().reports;
  const account = pageAccount();
  let target = selectedReport ? reports.find(r => r.id === selectedReport) || null : null;
  let note = null;
  if (target && account && target.name && target.name !== account) {
    const own = reports.find(r => r.name === account) || null;
    note = own ? `These pages are for ${account}, so they'll go into ${account}'s saved report rather than ${target.name}'s.`
      : uploadsOf('history').length ? `These pages are for ${account}, not ${target.name}, so they'll make a new report.`
      : `These pages are for ${account}, not ${target.name}. Add ${account}'s purchase history too to make a report for them.`;
    target = own;
  }
  return { target, note };
}

function drawUploads() {
  $('#flist').innerHTML = uploads.map((f, i) => {
    const kind = f.example ? 'Example report'
      : f.empty ? 'No rows found'
      : f.kind === 'report' ? 'Report' + (f.account ? ` · ${escapeHtml(f.account)}` : '')
      : UPLOAD_KIND_LABELS[f.kind] + (f.rows.length ? ` · ${f.rows.length.toLocaleString()}` : '');
    const type = f.empty && !f.example ? 'unknown' : f.kind;
    return `<li><span class="fn" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span><span class="ft ${type}">${kind}</span><button data-i="${i}" aria-label="Remove ${escapeHtml(f.name)}">Remove</button></li>`;
  }).join('');
  $$('#flist button').forEach(button => button.onclick = () => {
    const [removed] = uploads.splice(+button.dataset.i, 1);
    // a report file that was only just imported is taken back out of the list
    if (removed.imported) removeReport(removed.reportId);
    drawReportList();
  });

  const hasHistory = uploadsOf('history').length > 0;
  const hasLicenses = uploadsOf('licenses').length > 0;
  const hasGames = uploadsOf('games').length > 0;
  const hasPages = hasHistory || hasLicenses || hasGames;
  const { target, note } = uploadTarget();
  const unreadable = uploads.filter(f => f.kind === 'unknown' || (f.empty && !f.example)).length;
  const messages = [];
  if (unreadable) {
    messages.push(`${pluralize(unreadable, 'file')} didn't look like a Steam purchase history, licenses or games page, or had no rows. Check that Steam was in English and the page had finished loading before you saved it.`);
  }
  if (uploads.some(f => f.example)) {
    messages.push('The example report is made up, so it isn\'t kept. Use "See an example report" below to look at it.');
  }
  if (note) messages.push(note);
  if (!hasHistory && !target && !note && uploads.some(f => f.kind !== 'report')) {
    messages.push('Add your purchase history to build the replay, or pick a saved report above to add these pages to. The licenses page on its own isn\'t enough.');
  } else if (hasHistory && !target && (!hasLicenses || !hasGames)) {
    const missing = [
      hasLicenses ? null : 'your licenses pages to split keys, free games and gifts apart',
      hasGames ? null : 'your games page to see playtime and your real game count',
    ].filter(Boolean);
    messages.push(`Optional: add ${missing.join(', and ')}. You can add them now or later.`);
  }
  $('#imsg').innerHTML = messages.map(m => `<div class="msg warn">${escapeHtml(m)}</div>`).join('');
  const whose = target && (target.name ? target.name + "'s" : 'the');
  const updating = target && hasPages;
  const opening = target && !hasPages && uploads.some(f => f.kind === 'report' && !f.example);
  $('#go').hidden = !(hasHistory || updating || opening);
  $('#go').textContent = updating ? `Update ${whose} report` : opening ? `Open ${whose} report` : 'Show my replay';
}

// Several saved copies of the same page (or its separate pages) are merged without double counting. Pages added to a
// saved report: a new purchase history replaces the saved one (it's always the whole history, and refunds change
// rows), licenses pages are merged with the saved ones, and a new games page replaces the saved one.
function buildFromUploads() {
  const { target } = uploadTarget();
  const saved = target ? loadReport(target.id) : null;
  const history = uploadsOf('history');
  const licenses = uploadsOf('licenses');
  const historyRows = history.length
    ? mergeRows(history.map(f => f.rows), r => [r.date, r.tid, r.type, r.total, r.items.map(i => i.name).join('|')].join('~'))
    : saved && saved.h;
  if (!historyRows) return;
  const licenseRows = mergeRows([(saved && saved.l) || [], ...licenses.map(f => f.rows)], r => [r.date, r.item, r.acq].join('~'));
  const games = uploads.filter(f => f.kind === 'games' && f.games).pop();
  const shown = runReport({
    historyRows,
    licenseRows,
    gamesPage: games ? { games: games.games.games, typed: games.games.typed } : (saved && saved.p) || null,
    accountName: pageAccount() || (saved && saved.name) || null,
    priceEdits: saved && saved.ov,
    keyPurchases: saved && saved.kp,
    gameLinks: saved && saved.gl,
    id: saved && saved.id,
    from: saved && saved.from,
  });
  if (!shown) return;
  uploads.length = 0;
  selectedReport = null;
}

// ---------- section rail ----------

const RAIL_SECTIONS = [
  ['overview', 'Overview'], ['year', 'Year by year'], ['bought', 'What it bought'], ['sale', 'Sale savings'],
  ['top50', 'Top purchases'], ['play', 'Games & playtime'], ['months', 'When you buy'], ['hardware', 'Hardware'],
  ['gifts', 'Gifts'], ['keys', 'Licenses & keys'], ['method', 'Methodology'],
];
const rail = { links: [], sections: [] };

function buildRail() {
  const visible = RAIL_SECTIONS.filter(([id]) => {
    const section = document.getElementById(id);
    return section && !section.hidden;
  });
  $('#tocList').innerHTML = visible.map(([id, label]) => `<li><a href="#${id}"><span>${label}</span></a></li>`).join('');
  rail.links = $$('#tocList a');
  rail.sections = rail.links.map(a => document.getElementById(a.hash.slice(1)));
  rail.links.forEach(a => a.addEventListener('click', () => {
    setRailOpen(false);
    a.blur();
  }));
  $('#toc').hidden = false;
  markCurrentSection();
}

function setRailOpen(open) {
  $('#toc').classList.toggle('open', open);
  $('#tocBtn').setAttribute('aria-expanded', open);
  $('#tocBtn').setAttribute('aria-label', open ? 'Hide sections' : 'Show sections');
}

// The current section is the last one whose top has passed 35% of the way down the window.
function markCurrentSection() {
  if (!rail.sections.length || $('#toc').hidden) return;
  let current = 0;
  rail.sections.forEach((section, i) => {
    if (section.getBoundingClientRect().top <= innerHeight * 0.35) current = i;
  });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = rail.sections.length - 1;
  rail.links.forEach((a, i) => i === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
}

function initRail() {
  const toc = $('#toc');
  setRailOpen(false);
  $('#tocBtn').onclick = event => {
    event.stopPropagation();
    setRailOpen(!toc.classList.contains('open'));
  };
  document.addEventListener('click', event => {
    if (!toc.contains(event.target)) setRailOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toc.classList.contains('open')) {
      setRailOpen(false);
      $('#tocBtn').focus();
    }
  });
  let frame = 0;
  addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      markCurrentSection();
    });
  }, { passive: true });
  addEventListener('resize', markCurrentSection);
}

// ---------- startup ----------

function initUploadScreen() {
  $('#files').addEventListener('change', event => {
    addFiles([...event.target.files]);
    event.target.value = '';
  });
  const dropZone = $('#drop');
  ['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.add('over');
  }));
  ['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.remove('over');
  }));
  dropZone.addEventListener('drop', event => addFiles([...event.dataTransfer.files].filter(f => /\.html?$/i.test(f.name) || f.type === 'text/html')));
  $('#go').onclick = buildFromUploads;
  $('#example').onclick = () => {
    const example = makeExample();
    runReport({ historyRows: example.h, licenseRows: example.l, gamesPage: example.p, accountName: example.name, isExample: true });
  };
}

function initReportTools() {
  $('#reset').onclick = showUploadScreen;
  $('#exOwn').onclick = showUploadScreen;
  $('#bShare').onclick = openShareCard;
  $('#bDl').onclick = downloadReport;
  $('#shareClose').onclick = () => $('#shareDlg').close();
  $('#shareDlg').addEventListener('click', event => {
    if (event.target === $('#shareDlg')) $('#shareDlg').close();
  });
  $('#anon').onchange = event => {
    hideNames = event.target.checked;
    const scroll = scrollY;
    renderReport();
    scrollTo(0, scroll);
  };
  $('#kpForget').onclick = () => {
    if (!confirm('Remove this report and its added purchases from this browser? Download the report first if you want to keep them.')) return;
    forgetState();
    flash('This report was removed from this browser. It stays on screen until you leave the page.');
  };
}

// A downloaded report opens with its own data. Edits made to this same copy of the file win; edits saved from an
// older copy are ignored.
function openDownloadedReport() {
  try {
    const data = JSON.parse($('#embedded-data').textContent);
    if (data.anon) {
      hideNames = true;
      $('#anon').checked = true;
    }
    embeddedStamp = data.stamp || null;
    const saved = loadFileEdits();
    const edits = saved && saved.edited && data.stamp && saved.basedOn === embeddedStamp ? saved : null;
    runSavedReport(data, {
      fromFile: true,
      ...(edits ? { keyPurchases: edits.kp || data.kp || null, priceEdits: edits.ov || data.ov || null, gameLinks: edits.gl || data.gl || null } : {}),
    });
    $('#savedNote').textContent = `Saved report from ${formatDate(data.saved)}.`;
    $('#savedNote').hidden = false;
  } catch (e) {
    console.error(e);
  }
}

// Coming back to the site reopens the report that was open last.
function reopenSavedReport() {
  drawReportList();
  const saved = loadReport(reportIndex().current);
  if (saved && saved.h) runSavedReport(saved);
}

capturePristinePage();
initUploadScreen();
initReportTools();
initForms();
initRail();
if (isDownloadedReport()) openDownloadedReport();
else reopenSavedReport();
