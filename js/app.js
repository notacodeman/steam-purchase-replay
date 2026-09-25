// The upload screen, building a report, the section rail, and startup.

// ---------- building a report ----------

// historyRows, licenseRows and gamesPage are parsed pages (see parse.js); priceEdits, keyPurchases and gameLinks are
// the visitor's own additions.
function runReport({ historyRows, licenseRows, gamesPage, accountName, isExample = false, priceEdits = null, keyPurchases = null, gameLinks = null }) {
  let history;
  try {
    history = analyzeHistory(historyRows, gamesPage);
  } catch (e) {
    console.error(e);
    $('#imsg').innerHTML = '<div class="msg err">Something in the purchase history couldn\'t be read. Try saving the page again after it has fully loaded.</div>';
    return;
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
  });
  $('#intro').hidden = true;
  $('#report').hidden = false;
  $('#reset').hidden = false;
  $('#exbar').hidden = !isExample;
  renderReport();
  scrollTo(0, 0);
  // a downloaded report already carries its data; it's only saved here once it's edited
  if (!isExample && !isDownloadedReport()) saveState();
}

// The same, from what's stored in the browser or embedded in a downloaded report.
const runSavedReport = (saved, overrides = {}) => runReport({
  historyRows: saved.h, licenseRows: saved.l, gamesPage: saved.p || null, accountName: saved.name,
  isExample: !!saved.example, priceEdits: saved.ov || null, keyPurchases: saved.kp || null, gameLinks: saved.gl || null, ...overrides,
});

function showUploadScreen() {
  destroyCharts();
  $('#report').hidden = true;
  $('#intro').hidden = false;
  $('#reset').hidden = true;
  $('#toc').hidden = true;
  $('#crumb').innerHTML = 'Steam › Account › <b>Spending replay</b>';
  document.title = 'Steam Spending Replay';
  scrollTo(0, 0);
}

// ---------- uploaded files ----------

const uploads = []; // { name, size, kind, rows, account, games, empty, error }
const UPLOAD_KIND_LABELS = { history: 'Purchase history', licenses: 'Licenses', games: 'Games', unknown: 'Not recognized' };
const uploadsOf = kind => uploads.filter(f => f.kind === kind && f.rows.length);

async function addFiles(files) {
  for (const file of files) {
    if (uploads.some(f => f.name === file.name && f.size === file.size)) continue;
    const upload = { name: file.name, size: file.size, kind: 'unknown', rows: [], account: null };
    try {
      const text = await file.text();
      if (text.includes('"OwnedGames') || text.includes('OwnedGames\\"') || /var rgGames\s*=/.test(text)) {
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
  drawUploads();
}

function drawUploads() {
  $('#flist').innerHTML = uploads.map((f, i) => {
    const kind = f.empty ? 'No rows found' : UPLOAD_KIND_LABELS[f.kind] + (f.rows.length ? ` · ${f.rows.length.toLocaleString()}` : '');
    return `<li><span class="fn" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span><span class="ft ${f.empty ? 'unknown' : f.kind}">${kind}</span><button data-i="${i}" aria-label="Remove ${escapeHtml(f.name)}">Remove</button></li>`;
  }).join('');
  $$('#flist button').forEach(button => button.onclick = () => {
    uploads.splice(+button.dataset.i, 1);
    drawUploads();
  });

  const hasHistory = uploadsOf('history').length > 0;
  const hasLicenses = uploadsOf('licenses').length > 0;
  const hasGames = uploadsOf('games').length > 0;
  const unreadable = uploads.filter(f => f.kind === 'unknown' || f.empty).length;
  const messages = [];
  if (unreadable) {
    messages.push(`${pluralize(unreadable, 'file')} didn't look like a Steam purchase history, licenses or games page, or had no rows. Check that Steam was in English and the page had finished loading before you saved it.`);
  }
  if (!hasHistory && uploads.length) {
    messages.push('Add your purchase history to build the replay. The licenses page on its own isn\'t enough.');
  } else if (hasHistory && (!hasLicenses || !hasGames)) {
    const missing = [
      hasLicenses ? null : 'your licenses pages to split keys, free games and gifts apart',
      hasGames ? null : 'your games page to see playtime and your real game count',
    ].filter(Boolean);
    messages.push(`Optional: add ${missing.join(', and ')}. You can add them now or later.`);
  }
  $('#imsg').innerHTML = messages.map(m => `<div class="msg warn">${escapeHtml(m)}</div>`).join('');
  $('#go').hidden = !hasHistory;
}

// Several saved copies of the same page (or its separate pages) are merged without double counting.
function buildFromUploads() {
  const history = uploadsOf('history');
  const licenses = uploadsOf('licenses');
  if (!history.length) return;
  const historyRows = mergeRows(history.map(f => f.rows), r => [r.date, r.tid, r.type, r.total, r.items.map(i => i.name).join('|')].join('~'));
  const licenseRows = mergeRows(licenses.map(f => f.rows), r => [r.date, r.item, r.acq].join('~'));
  const accountName = [...history, ...licenses].find(f => f.account)?.account || null;
  const games = uploads.filter(f => f.kind === 'games' && f.games).pop();
  // purchases and prices saved earlier carry over, unless they were for another account
  let saved = loadState();
  if (saved && saved.name && accountName && saved.name !== accountName) saved = null;
  runReport({
    historyRows,
    licenseRows,
    gamesPage: games ? { games: games.games.games, typed: games.games.typed } : (saved && saved.p) || null,
    accountName,
    priceEdits: saved && saved.ov,
    keyPurchases: saved && saved.kp,
    gameLinks: saved && saved.gl,
  });
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
    if (!confirm('Remove your saved report and purchases from this browser? Download the report first if you want to keep them.')) return;
    forgetState();
    flash('Saved data removed from this browser.');
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
    const saved = loadState();
    const edits = saved && saved.edited && data.stamp && saved.basedOn === embeddedStamp ? saved : null;
    runSavedReport(data, edits ? { keyPurchases: edits.kp || data.kp || null, priceEdits: edits.ov || data.ov || null, gameLinks: edits.gl || data.gl || null } : {});
    $('#savedNote').textContent = `Saved report from ${formatDate(data.saved)}.`;
    $('#savedNote').hidden = false;
  } catch (e) {
    console.error(e);
  }
}

// Coming back to the site reopens the report saved in this browser.
function reopenSavedReport() {
  const saved = loadState();
  if (!saved || !saved.h) return;
  $('#resume').hidden = false;
  $('#resumeTxt').textContent = `Saved report${saved.name ? ` for ${saved.name}` : ''} from ${formatDate(saved.saved.slice(0, 10))}, with ${pluralize(ordersOf(saved.kp).length, 'added purchase')}.`;
  $('#resumeGo').onclick = () => runSavedReport(saved);
  $('#resumeForget').onclick = () => {
    forgetState();
    $('#resume').hidden = true;
  };
  runSavedReport(saved);
}

capturePristinePage();
initUploadScreen();
initReportTools();
initForms();
initRail();
if (isDownloadedReport()) openDownloadedReport();
else reopenSavedReport();
