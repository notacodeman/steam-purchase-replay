// The share card image and the downloadable report.

// The page as it was before any report was drawn, which is what a downloaded report starts from.
// app.js captures it at startup, once every script tag has been parsed.
let pristinePage = null;
function capturePristinePage() {
  const page = document.documentElement.cloneNode(true);
  page.querySelector('#embedded-data')?.remove();
  pristinePage = '<!doctype html>\n' + page.outerHTML;
}

const fileSafe = name => name.replace(/[^\w-]+/g, '_');

// ---------- share card ----------

async function openShareCard() {
  const dialog = $('#shareDlg');
  const image = $('#shareImg');
  image.removeAttribute('src');
  dialog.showModal();
  const canvas = await drawShareCard();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (image.dataset.url) URL.revokeObjectURL(image.dataset.url);
  image.dataset.url = URL.createObjectURL(blob);
  image.src = image.dataset.url;
  const name = hideNames || !report.accountName ? '' : '-' + fileSafe(report.accountName);
  $('#shareDl').onclick = () => downloadFile(blob, 'image/png', `steam-replay${name}.png`);
  const copy = $('#shareCopy');
  copy.hidden = !(navigator.clipboard && window.ClipboardItem);
  copy.onclick = async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      copy.textContent = 'Copied';
      setTimeout(() => copy.textContent = 'Copy image', 1600);
    } catch (e) {
      copy.textContent = "Couldn't copy";
    }
  };
}

// A 1200×630 summary image: the headline total and four stats.
async function drawShareCard() {
  const { history, licenses, playtime } = report;
  const totals = history.totals;
  const WIDTH = 1200;
  const HEIGHT = 630;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  try {
    await Promise.all([400, 700, 900].map(weight => document.fonts.load(`${weight} 20px "Albert Sans"`)));
  } catch (e) {
    // falls back to Arial
  }
  const font = (weight, size) => `${weight} ${size}px "Albert Sans", Arial, sans-serif`;
  // shrinks the font until the text fits the width
  const fitText = (text, weight, width, size, minSize, step) => {
    ctx.font = font(weight, size);
    while (ctx.measureText(text).width > width && size > minSize) {
      size -= step;
      ctx.font = font(weight, size);
    }
  };

  // background: gradient with faint diagonal stripes
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#2a475e');
  gradient.addColorStop(1, '#171a21');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 18;
  for (let x = -HEIGHT; x < WIDTH; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT);
    ctx.lineTo(x + HEIGHT, 0);
    ctx.stroke();
  }
  ctx.restore();

  // logo and title
  ctx.fillStyle = COLORS.steam;
  ctx.beginPath();
  ctx.roundRect(64, 56, 40, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#171a21';
  [[75, 79, 6, 11], [84, 72, 6, 18], [93, 65, 6, 25]].forEach(bar => ctx.fillRect(...bar));
  ctx.fillStyle = '#fff';
  ctx.font = font(800, 22);
  ctx.textBaseline = 'middle';
  ctx.fillText('SPENDING REPLAY', 120, 77);
  const who = hideNames || !report.accountName ? 'My Steam' : `${report.accountName}'s Steam`;
  ctx.fillStyle = COLORS.steam;
  ctx.font = font(700, 26);
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`${who}, ${history.years[0]}–${history.years[history.years.length - 1]}`, 64, 170);

  // headline total
  const keys = keySpend(report.keyPurchases);
  const headline = formatMoney(totals.net - totals.hardware + keys.total);
  fitText(headline, 900, 1070, 150, 70, 4);
  ctx.fillStyle = '#fff';
  ctx.fillText(headline, 58, 316);
  ctx.fillStyle = COLORS.text;
  ctx.font = font(400, 34);
  ctx.fillText(keys.orders ? 'spent on Steam games, including keys from other stores' : 'spent on Steam games, DLC, gifts and items', 64, 382);

  // four stats
  const perYear = yearlyWithoutHardware(history);
  const bestYear = indexOfMax(perYear);
  const stats = [
    [formatMoneyWhole(totals.saved), 'saved on sales', COLORS.sale],
    playtime ? [playtime.games.toLocaleString(), 'games owned', COLORS.steam] : [totals.itemsMine.toLocaleString(), 'store items bought', COLORS.steam],
    licenses ? [licenses.totals.key.toLocaleString(), 'product keys activated', COLORS.key] : [totals.giftBought.toLocaleString(), 'gift copies sent', COLORS.gift],
    playtime ? [Math.round(playtime.hours).toLocaleString(), 'hours played', COLORS.purple] : [String(history.years[bestYear]), `biggest year, ${formatMoneyWhole(perYear[bestYear])}`, COLORS.purple],
  ];
  const boxWidth = (WIDTH - 128 - 3 * 20) / 4;
  stats.forEach(([value, label, color], i) => {
    const x = 64 + i * (boxWidth + 20);
    const y = 432;
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fillRect(x, y, boxWidth, 118);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, boxWidth, 4);
    ctx.fillStyle = '#fff';
    fitText(value, 800, boxWidth - 36, 46, 24, 2);
    ctx.fillText(value, x + 18, y + 62);
    ctx.fillStyle = COLORS.muted;
    ctx.font = font(500, 19);
    ctx.fillText(label, x + 18, y + 96);
  });
  ctx.fillStyle = COLORS.muted;
  ctx.font = font(500, 20);
  ctx.textAlign = 'right';
  ctx.fillText('steam.codeman.club', 1136, 600);
  return canvas;
}

// ---------- downloadable report ----------

// A single HTML file that opens without this site: the page with its stylesheet and scripts inlined and the report's
// data embedded. With "Hide names" on, friends' names and the account name are left out.
async function downloadReport() {
  let historyRows = report.historyRows;
  let keyPurchases = report.keyPurchases;
  let name = report.accountName;
  if (hideNames) {
    const aliases = friendAliases(report.history);
    historyRows = historyRows.map(r => ({ ...r, items: r.items.map(i => i.to ? { ...i, to: aliases.get(i.to) || 'Friend' } : i) }));
    keyPurchases = keyPurchases && { orders: keyPurchases.orders.map(({ giftNote, ...order }) => order) };
    name = null;
  }
  const gamesPage = report.gamesPage && {
    typed: report.gamesPage.typed,
    games: report.gamesPage.games.map(g => ({ id: g.id, name: g.name, min: g.min, last: g.last, ach: g.ach, t: g.t, price: g.price })),
  };
  const data = JSON.stringify({
    v: 1,
    h: historyRows,
    l: report.licenseRows,
    p: gamesPage,
    ov: report.priceEdits || null,
    kp: keyPurchases || null,
    name,
    example: report.isExample,
    anon: hideNames,
    saved: new Date().toISOString().slice(0, 10),
    stamp: Date.now().toString(36),
  }).replace(/</g, '\\u003c');

  let page;
  try {
    page = await inlineAssets(pristinePage);
  } catch (e) {
    console.error(e);
    $('#savedNote').textContent = "Couldn't build the download: the page's files didn't load. Try again from steam.codeman.club.";
    $('#savedNote').hidden = false;
    return;
  }
  const dataTag = `<script id="embedded-data" type="application/json">${data}<\/script>\n`;
  const at = page.indexOf('<script src="https://cdn.jsdelivr.net');
  downloadFile(page.slice(0, at) + dataTag + page.slice(at), 'text/html', `steam-replay${name ? '-' + fileSafe(name) : ''}.html`);
}

// Replaces the page's own stylesheet and script tags with their contents. A downloaded report is already inlined.
async function inlineAssets(html) {
  const tags = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)">|<script src="((?:js|data)\/[^"]+)"><\/script>/g)];
  const contents = await Promise.all(tags.map(async ([, css, js]) => {
    const response = await fetch(css || js);
    if (!response.ok) throw new Error(`${css || js}: ${response.status}`);
    const text = await response.text();
    return css ? `<style>\n${text}</style>` : `<script>\n${text.replace(/<\/script/gi, '<\\/script')}</script>`;
  }));
  tags.forEach(([tag], i) => {
    html = html.replace(tag, () => contents[i]);
  });
  return html;
}
