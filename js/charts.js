// All the Chart.js charts. Charts have no hover tooltips; values are written on the chart instead: totals above the
// bars (topLabels) and a row of figures per series under the x axis (valueRows).

let charts = [];

function destroyCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
}

const FONT = '"Albert Sans",Arial,sans-serif';
const ROW_HEIGHT = 18;

// Returns false when Chart.js didn't load (offline, or blocked).
function setUpCharts() {
  if (!window.Chart) return false;
  Chart.defaults.font.family = FONT;
  Chart.defaults.font.size = 13;
  Chart.defaults.color = COLORS.muted;
  Chart.defaults.borderColor = COLORS.grid;
  Chart.defaults.events = [];
  Chart.defaults.plugins.tooltip.enabled = false;
  return true;
}

// Text above each bar stack. Set chart.$topText = i => text for column i, and optionally chart.$topColor.
const topLabels = {
  id: 'topLabels',
  afterDatasetsDraw(chart) {
    if (!chart.$topText) return;
    const { ctx } = chart;
    ctx.save();
    ctx.font = `600 13px ${FONT}`;
    ctx.fillStyle = chart.$topColor || COLORS.text;
    ctx.textAlign = 'center';
    chart.data.labels.forEach((_, i) => {
      let top = null;
      let x = null;
      chart.data.datasets.forEach((dataset, d) => {
        const bar = chart.getDatasetMeta(d).data[i];
        if (!chart.isDatasetVisible(d) || !bar || dataset.data[i] <= 0) return;
        x = bar.x;
        top = top === null ? bar.y : Math.min(top, bar.y);
      });
      const text = chart.$topText(i);
      if (top !== null && text) ctx.fillText(text, x, top - 6);
    });
    ctx.restore();
  },
};

// Rows of figures under the x axis, one per series. getRows() → [{ label, color, weight, value: i => text }].
const valueRows = getRows => ({
  id: 'valueRows',
  afterDraw(chart) {
    const rows = getRows();
    if (!rows.length) return;
    const { ctx } = chart;
    const xAxis = chart.scales.x;
    const left = chart.chartArea.left;
    ctx.save();
    ctx.textBaseline = 'middle';
    rows.forEach((row, r) => {
      const y = xAxis.bottom + 18 + r * ROW_HEIGHT;
      ctx.font = `${row.weight || 600} 13px ${FONT}`;
      ctx.fillStyle = row.color;
      ctx.textAlign = 'right';
      ctx.fillText(row.label, left - 8, y);
      ctx.textAlign = 'center';
      chart.data.labels.forEach((_, i) => {
        const text = row.value(i);
        if (text) ctx.fillText(text, xAxis.getPixelForValue(i), y);
      });
    });
    ctx.strokeStyle = 'rgba(102,192,244,.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, xAxis.bottom + 4.5);
    ctx.lineTo(chart.chartArea.right, xAxis.bottom + 4.5);
    ctx.stroke();
    ctx.restore();
  },
});

// Bottom padding that leaves room for n value rows.
const rowsPadding = n => n ? n * ROW_HEIGHT + 16 : 0;

// Keeps the y axis at least this wide, so charts stacked above each other line up.
const minAxisWidth = width => scale => {
  scale.width = Math.max(scale.width, width);
};

const moneyTicks = { callback: v => formatMoneyWhole(v) };
const moneyOrBlank = v => Math.abs(v) >= 0.5 ? formatMoneyWhole(v) : '';
const stackTopBorder = { borderColor: COLORS.background, borderWidth: { top: 1.5, bottom: 0, left: 0, right: 0 }, borderSkipped: false };

// Chip buttons that switch series on and off. series: [{ key, label, color, on }]
function seriesToggles(container, series, onToggle) {
  $(container).innerHTML = series.map(s =>
    `<button class="chip" aria-pressed="${s.on}" data-c="${escapeHtml(s.key)}"><i style="background:${s.color}"></i>${escapeHtml(s.label)}</button>`).join('');
  $$(container + ' .chip').forEach((button, i) => button.onclick = () => {
    series[i].on = !series[i].on;
    button.setAttribute('aria-pressed', series[i].on);
    onToggle(i, series[i].on);
  });
}

// ---------- spending charts ----------

function buildSpendingCharts(history, keyPurchases) {
  buildYearChart(history, keyPurchases);
  buildTypeChart(history);
  buildPaymentChart(history);
  buildSavingsChart(history);
  buildDiscountChart(history);
  buildMonthChart(history);
}

// Stacked categories per year, the total on top and each category's amount underneath.
// Hardware and 3rd-party keys can be switched on, but start off so the default is Steam game spending.
function buildYearChart(history, keyPurchases) {
  const years = history.years.map(String);
  const series = spendingCategories(history).map(c => ({
    key: c,
    label: c,
    short: { [CATEGORY.mine]: 'For you', [CATEGORY.inGame]: 'In-game' }[c] || c,
    color: CATEGORY_COLORS[c],
    data: history.byYear[c],
    on: true,
  }));
  const keysByYear = history.years.map(() => 0);
  for (const order of ordersOf(keyPurchases)) {
    if (order.notSteam || order.giftReceived || !order.date) continue;
    const i = history.years.indexOf(yearOf(order.date));
    if (i >= 0) keysByYear[i] += order.total || 0;
  }
  if (keysByYear.some(v => v > HALF_CENT)) {
    series.push({ key: 'keys', label: '3rd-party keys', short: 'Keys', color: COLORS.key, data: keysByYear, on: false });
  }
  if (history.byYear[CATEGORY.hardware].some(v => v > HALF_CENT)) {
    series.push({ key: CATEGORY.hardware, label: 'Hardware', short: 'Hardware', color: COLORS.hardware, data: history.byYear[CATEGORY.hardware], on: false });
  }
  const shownTotal = i => sum(series, s => s.on ? Math.max(0, s.data[i]) : 0);
  const rows = () => series.filter(s => s.on).map(s => ({ label: s.short, color: s.color, value: i => moneyOrBlank(s.data[i]) }));
  const chart = new Chart($('#cYear'), {
    type: 'bar',
    plugins: [topLabels, valueRows(rows)],
    data: {
      labels: years,
      datasets: series.map(s => ({
        label: s.label, data: s.data.map(v => Math.max(0, v)), backgroundColor: s.color, hidden: !s.on,
        ...stackTopBorder, stack: 's', barPercentage: 0.78, categoryPercentage: 0.9,
      })),
    },
    options: {
      maintainAspectRatio: false,
      layout: { padding: { top: 16, bottom: rowsPadding(rows().length) } },
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: COLORS.ink } },
        y: { stacked: true, ticks: moneyTicks, grid: { color: COLORS.grid }, afterFit: minAxisWidth(72) },
      },
    },
  });
  chart.$topText = i => shownTotal(i) > 0.5 ? formatMoneyWhole(shownTotal(i)) : '';
  chart.update();
  charts.push(chart);
  seriesToggles('#lgYear', series, (i, on) => {
    chart.setDatasetVisibility(i, on);
    chart.options.layout.padding.bottom = rowsPadding(rows().length);
    chart.update();
  });
}

// Horizontal bars with the amount and share written after each bar.
function buildTypeChart(history) {
  const categories = spendingCategories(history);
  const total = sum(categories, c => Math.max(0, history.catTotals[c]));
  const share = v => total ? Math.round(v / total * 1000) / 10 : 0;
  const amountLabels = {
    id: 'amountLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.font = `600 13px ${FONT}`;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.ink;
      ctx.textAlign = 'left';
      chart.getDatasetMeta(0).data.forEach((bar, i) => {
        const v = chart.data.datasets[0].data[i];
        ctx.fillText(`${formatMoneyWhole(v)}  ${share(v).toFixed(1)}%`, bar.x + 8, bar.y);
      });
      ctx.restore();
    },
  };
  charts.push(new Chart($('#cType'), {
    type: 'bar',
    plugins: [amountLabels],
    data: {
      labels: categories,
      datasets: [{ data: categories.map(c => history.catTotals[c]), backgroundColor: categories.map(c => CATEGORY_COLORS[c]), borderWidth: 0, borderRadius: 2 }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      layout: { padding: { right: 135 } },
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: moneyTicks, grid: { color: COLORS.grid } },
        y: { grid: { display: false }, ticks: { color: COLORS.ink } },
      },
    },
  }));
}

function buildPaymentChart(history) {
  const methods = Object.keys(history.payment);
  const total = sum(methods, m => history.payment[m]);
  const share = v => total ? (v / total * 100).toFixed(1) : '0.0';
  const colors = [COLORS.steam, COLORS.sale, COLORS.key, '#c58cf0', COLORS.orange, COLORS.free];
  charts.push(new Chart($('#cPay'), {
    type: 'doughnut',
    data: {
      labels: methods,
      datasets: [{ data: methods.map(m => history.payment[m]), backgroundColor: colors, borderColor: COLORS.background, borderWidth: 3, hoverOffset: 0 }],
    },
    options: {
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: COLORS.ink,
            boxWidth: 12,
            generateLabels: chart => chart.data.labels.map((label, i) => {
              const v = chart.data.datasets[0].data[i];
              return { text: `${label}  ${formatMoneyWhole(v)} · ${share(v)}%`, fillStyle: colors[i], strokeStyle: 'transparent', index: i, fontColor: COLORS.ink };
            }),
          },
        },
      },
    },
  }));
}

// Paid and saved stacked per year, the % off on top, and paid / saved / list underneath.
function buildSavingsChart(history) {
  const saved = history.listByYear.map((list, i) => Math.max(0, list - history.paidByYear[i]));
  const rows = [
    { label: 'Paid', color: COLORS.steam, value: i => moneyOrBlank(history.paidByYear[i]) },
    { label: 'Saved', color: COLORS.sale, value: i => moneyOrBlank(saved[i]) },
    { label: 'List', color: COLORS.muted, weight: 500, value: i => moneyOrBlank(history.listByYear[i]) },
  ];
  const chart = new Chart($('#cSave'), {
    type: 'bar',
    plugins: [topLabels, valueRows(() => rows)],
    data: {
      labels: history.years.map(String),
      datasets: [
        { label: 'Paid', data: history.paidByYear, backgroundColor: COLORS.steam, borderWidth: 0, stack: 's', barPercentage: 0.78 },
        {
          label: 'Saved by the sale', data: saved, backgroundColor: COLORS.sale, borderColor: COLORS.background,
          borderWidth: { top: 0, bottom: 1.5, left: 0, right: 0 }, borderSkipped: false, stack: 's', barPercentage: 0.78,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      layout: { padding: { top: 18, bottom: rowsPadding(rows.length) } },
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: COLORS.ink } },
        y: { stacked: true, ticks: moneyTicks, grid: { color: COLORS.grid }, afterFit: minAxisWidth(72) },
      },
    },
  });
  chart.$topColor = COLORS.sale;
  chart.$topText = i => history.listByYear[i] > 0 && saved[i] > HALF_CENT ? '-' + Math.round(saved[i] / history.listByYear[i] * 100) + '%' : '';
  chart.update();
  charts.push(chart);
}

// Checkouts per discount bucket on top, the amount spent underneath.
function buildDiscountChart(history) {
  const buckets = history.discBuckets;
  const rows = [{ label: 'Spent', color: COLORS.ink, value: i => moneyOrBlank(buckets.spent[i]) }];
  const chart = new Chart($('#cDisc'), {
    type: 'bar',
    plugins: [topLabels, valueRows(() => rows)],
    data: {
      labels: buckets.labels,
      datasets: [{ data: buckets.count, backgroundColor: buckets.labels.map((_, i) => i ? '#4c6b22' : '#3a4b5c'), borderWidth: 0, borderRadius: 2 }],
    },
    options: {
      maintainAspectRatio: false,
      layout: { padding: { top: 18, bottom: rowsPadding(rows.length) } },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: COLORS.sale, font: { weight: '700' } } },
        y: { grid: { color: COLORS.grid }, title: { display: true, text: 'Checkouts' }, afterFit: minAxisWidth(56) },
      },
    },
  });
  chart.$topText = i => buckets.count[i] ? String(buckets.count[i]) : '';
  chart.update();
  charts.push(chart);
}

// Spending per month of the year, the two biggest months highlighted.
function buildMonthChart(history) {
  const topTwo = topIndexes(history.byMonth, 2);
  const chart = new Chart($('#cMonth'), {
    type: 'bar',
    plugins: [topLabels],
    data: {
      labels: MONTHS,
      datasets: [{ data: history.byMonth, backgroundColor: MONTHS.map((_, i) => topTwo.includes(i) ? COLORS.steam : '#2f4a62'), borderWidth: 0, borderRadius: 2 }],
    },
    options: {
      maintainAspectRatio: false,
      layout: { padding: { top: 18 } },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: COLORS.ink } },
        y: { ticks: moneyTicks, grid: { color: COLORS.grid } },
      },
    },
  });
  chart.$topText = i => moneyOrBlank(history.byMonth[i]);
  chart.update();
  charts.push(chart);
}

// ---------- license charts ----------

function buildLicenseCharts(licenses) {
  buildLicensesPerYearChart(licenses);
  buildLibraryGrowthChart(licenses);
  buildLicenseMonthChart(licenses);
}

// Licenses added per year, stacked by source. Underneath: the total and each source's share of the sources shown.
function buildLicensesPerYearChart(licenses) {
  // only sources in this data (without licenses pages that's just "Bought on Steam")
  const series = ['store', 'key', 'free', 'gift']
    .filter(s => licenses.totals[s] > 0)
    .map(s => ({ key: s, label: LICENSE_SOURCES[s].plural, color: LICENSE_SOURCES[s].color, on: true }));
  $('#keysYearHelp').hidden = series.length < 2;
  const shownTotal = i => sum(series, s => s.on ? licenses.byYear[s.key][i] : 0);
  const percent = (n, total) => total ? Math.round(n / total * 100) + '%' : '';
  const rows = () => {
    const on = key => series.some(s => s.key === key && s.on);
    // Steam vs. keys head to head: round so the two add up to 100%
    const headToHead = on('store') && on('key') && !on('free') && !on('gift');
    return [
      { label: 'Total', color: COLORS.text, value: i => shownTotal(i) ? String(shownTotal(i)) : '' },
      ...series.filter(s => s.on).map(s => ({
        label: LICENSE_SOURCES[s.key].short,
        color: s.key === 'free' ? COLORS.freeText : s.color,
        weight: 700,
        value: i => {
          const total = shownTotal(i);
          if (!total) return '';
          if (headToHead && s.key === 'store') return (100 - Math.round(licenses.byYear.key[i] / total * 100)) + '%';
          return percent(licenses.byYear[s.key][i], total);
        },
      })),
    ];
  };
  const chart = new Chart($('#cKeys'), {
    type: 'bar',
    plugins: [valueRows(rows)],
    data: {
      labels: licenses.years.map(String),
      datasets: series.map(s => ({
        label: s.label, data: licenses.byYear[s.key], backgroundColor: s.color, ...stackTopBorder, stack: 's', barPercentage: 0.72, categoryPercentage: 0.9,
      })),
    },
    options: {
      maintainAspectRatio: false,
      layout: { padding: { top: 8, bottom: rowsPadding(rows().length) } },
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: COLORS.ink } },
        y: { stacked: true, grid: { color: COLORS.grid }, title: { display: true, text: 'Licenses added' }, afterFit: minAxisWidth(72) },
      },
    },
  });
  charts.push(chart);
  seriesToggles('#lgKeys', series, (i, on) => {
    chart.setDatasetVisibility(i, on);
    chart.options.layout.padding.bottom = rowsPadding(rows().length);
    chart.update();
  });
}

// Cumulative licenses by source, month by month (betas left out, as in the totals). Sources with no licenses are
// left out, which without licenses pages leaves just "Bought on Steam".
function buildLibraryGrowthChart(licenses) {
  const sources = ['store', 'key', 'free', 'gift'].filter(s => licenses.totals[s] > 0);
  const dated = licenses.list.filter(l => l.date && sources.includes(l.source));
  const months = [];
  // every month from the first license to the last, as "YYYY-MM" (the 15th plus 31 days is always next month)
  for (let month = licenses.first.slice(0, 7); month <= licenses.last.slice(0, 7); month = addDays(month + '-15', 31).slice(0, 7)) {
    months.push(month);
  }
  const monthIndex = Object.fromEntries(months.map((m, i) => [m, i]));
  const added = Object.fromEntries(sources.map(s => [s, new Array(months.length).fill(0)]));
  dated.forEach(l => added[l.source][monthIndex[l.date.slice(0, 7)]]++);
  const running = Object.fromEntries(sources.map(s => {
    let total = 0;
    return [s, added[s].map(v => total += v)];
  }));

  const total = dated.length;
  const halfway = months.findIndex((_, i) => sum(sources, s => running[s][i]) >= total / 2);
  // the last month keys were still at or behind store purchases
  let keysBehind = -1;
  if (running.key && running.store) {
    months.forEach((_, i) => {
      if (running.key[i] <= running.store[i]) keysBehind = i;
    });
  }
  $('#libNote').textContent = `${total.toLocaleString()} licenses by ${formatDate(licenses.last)}, not counting betas. These include DLC, soundtracks and other add-ons, so this is not a game count. You passed the halfway mark in ${formatMonth(months[halfway])}` +
    (keysBehind >= 0 && keysBehind < months.length - 1 ? `, and keys pulled ahead of store purchases for good in ${formatMonth(months[keysBehind + 1])}.` : '.');

  // each source's final count, written to the right of its band, nudged apart so they don't overlap, and kept
  // inside the canvas when thin bands at the top push the labels upwards
  const endLabels = {
    id: 'endLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const lastIndex = months.length - 1;
      const x = chart.chartArea.right + 8;
      const labels = [];
      chart.data.datasets.forEach((dataset, d) => {
        const point = chart.getDatasetMeta(d).data[lastIndex];
        if (!point) return;
        const bottom = d ? chart.getDatasetMeta(d - 1).data[lastIndex].y : chart.chartArea.bottom;
        const source = sources[d];
        labels.push({
          y: (point.y + bottom) / 2,
          text: `${dataset.label}: ${running[source][lastIndex].toLocaleString()}`,
          color: source === 'free' ? COLORS.freeText : LICENSE_SOURCES[source].color,
        });
      });
      const LINE = 17;
      labels.sort((a, b) => b.y - a.y);
      let previous = Infinity;
      labels.forEach(label => {
        if (label.y > previous - LINE) label.y = previous - LINE;
        previous = label.y;
      });
      const overflow = LINE / 2 - labels[labels.length - 1].y;
      if (overflow > 0) labels.forEach(label => label.y += overflow);
      ctx.save();
      ctx.font = `600 13px ${FONT}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      labels.forEach(label => {
        ctx.fillStyle = label.color;
        ctx.fillText(label.text, x, label.y);
      });
      ctx.restore();
    },
  };
  const everyOtherYear = months.length > 150;
  charts.push(new Chart($('#cLib'), {
    type: 'line',
    plugins: [endLabels],
    data: {
      labels: months,
      datasets: sources.map((s, i) => ({
        label: LICENSE_SOURCES[s].plural, data: running[s], borderColor: LICENSE_SOURCES[s].color, backgroundColor: LICENSE_SOURCES[s].color + 'cc',
        fill: i ? '-1' : 'origin', pointRadius: 0, borderWidth: 1, tension: 0,
      })),
    },
    options: {
      maintainAspectRatio: false,
      layout: { padding: { right: 170 } },
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: COLORS.ink,
            autoSkip: false,
            maxRotation: 0,
            // a year label at each January (every other year on long histories)
            callback: (_, i) => {
              const month = months[i];
              const labelled = (month.endsWith('-01') || i === 0) && (!everyOtherYear || yearOf(month) % 2 === 0);
              return labelled ? month.slice(0, 4) : '';
            },
          },
        },
        y: { stacked: true, grid: { color: COLORS.grid }, ticks: { callback: v => v.toLocaleString() } },
      },
    },
  }));
}

// Keys activated vs. store purchases per month of the year. Without licenses pages there are no key activations,
// so it shows store purchases only.
function buildLicenseMonthChart(licenses) {
  const hasKeys = licenses.monthKeys.some(v => v > 0);
  $('#keyMonthTitle').textContent = hasKeys ? 'Keys vs. store purchases by month' : 'Store purchases by month';
  $('#keyMonthLegend').hidden = !hasKeys;
  const series = [
    { label: 'Keys activated', short: 'Keys', data: licenses.monthKeys, color: COLORS.key },
    { label: 'Bought on Steam', short: 'Store', data: licenses.monthStore, color: COLORS.steam },
  ].slice(hasKeys ? 0 : 1);
  const rows = series.map(s => ({ label: s.short, color: s.color, weight: 700, value: i => String(s.data[i]) }));
  charts.push(new Chart($('#cKeyMonth'), {
    type: 'bar',
    plugins: [valueRows(() => rows)],
    data: {
      labels: MONTHS,
      datasets: series.map(s => ({ label: s.label, data: s.data, backgroundColor: s.color, borderWidth: 0, borderRadius: 2, barPercentage: 0.9, categoryPercentage: 0.75 })),
    },
    options: {
      maintainAspectRatio: false,
      layout: { padding: { bottom: rowsPadding(rows.length) } },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: COLORS.ink } },
        y: { grid: { color: COLORS.grid }, title: { display: true, text: 'Licenses' }, afterFit: minAxisWidth(52) },
      },
    },
  }));
}
