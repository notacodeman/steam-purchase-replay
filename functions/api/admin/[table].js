// /api/admin/packages, /api/admin/bundles, /api/admin/free: the admin page's lists. Protected by Cloudflare Access.
//   GET                 -> every row
//   POST {row}          -> add a row, or replace the row with that id
//   DELETE {id}         -> remove a row
// Every change is written to `history` with the row as it was, so the admin page can undo it.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// A list of names: one per entry, trimmed, blanks dropped, duplicates removed.
const nameList = value => {
  if (!Array.isArray(value)) return null;
  const names = [...new Set(value.map(v => String(v).trim()).filter(Boolean))];
  return names.length && names.every(n => n.length <= 200) ? names : null;
};
const text = (max, required) => value => {
  const s = String(value ?? '').trim();
  return (required && !s) || s.length > max ? null : s;
};

// Per table: the D1 table, each writable column with its check (null = invalid), which columns hold lists, and
// what to call a row in the change history.
const TABLES = {
  packages: {
    table: 'packages',
    columns: { licenses: nameList, games: nameList, note: text(500, false) },
    lists: ['licenses', 'games'],
    label: row => row.licenses[0],
  },
  bundles: {
    table: 'bundles',
    columns: {
      name: text(200, true),
      store: text(100, false),
      kind: value => (['sub', 'bundle', 'giveaway'].includes(value) ? value : null),
      date: value => (/^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : null),
      // a giveaway's last day; empty for bundles and subscriptions
      ends: value => (value === null || value === '' || value === undefined ? null
        : /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined),
      price: value => (value === null || value === '' || value === undefined ? null
        : Number.isFinite(+value) && +value >= 0 ? Math.round(+value * 100) / 100 : undefined),
      games: nameList,
      note: text(500, false),
    },
    lists: ['games'],
    label: row => row.name,
    nullable: ['price', 'ends'],
  },
  free: {
    table: 'free_games',
    columns: { name: text(200, true) },
    lists: [],
    label: row => row.name,
  },
};

const decode = (config, row) => {
  const out = { ...row };
  for (const list of config.lists) out[list] = JSON.parse(row[list]);
  return out;
};

async function logChange(env, config, action, rowId, label, before) {
  await env.DB.prepare('INSERT INTO history (tbl, row_id, action, label, before, at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(config.table, rowId, action, label || '', before ? JSON.stringify(before) : null, new Date().toISOString()).run();
}

export async function onRequestGet({ params, env }) {
  const config = TABLES[params.table];
  if (!config) return json({ ok: false, error: 'Unknown list.' }, 404);
  const { results } = await env.DB.prepare(`SELECT * FROM ${config.table} ORDER BY id`).all();
  return json({ ok: true, rows: results.map(row => decode(config, row)) });
}

export async function onRequestPost({ params, request, env }) {
  const config = TABLES[params.table];
  if (!config) return json({ ok: false, error: 'Unknown list.' }, 404);
  const body = await request.json().catch(() => null);
  if (!body) return json({ ok: false, error: 'Expected a JSON row.' }, 400);

  const values = {};
  for (const [column, check] of Object.entries(config.columns)) {
    const value = check(body[column]);
    if (value === undefined || (value === null && !(config.nullable || []).includes(column))) {
      return json({ ok: false, error: `${column} is missing or not valid.` }, 400);
    }
    values[column] = config.lists.includes(column) ? JSON.stringify(value) : value;
  }
  values.updated_at = new Date().toISOString();
  const columns = Object.keys(values);
  const label = config.label({ ...body, ...Object.fromEntries(config.lists.map(l => [l, JSON.parse(values[l])])) });

  try {
    const id = body.id != null && body.id !== '' ? Number(body.id) : null;
    const existing = id != null ? await env.DB.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).bind(id).first() : null;
    if (existing) {
      await env.DB.prepare(`UPDATE ${config.table} SET ${columns.map(c => `${c} = ?`).join(', ')} WHERE id = ?`)
        .bind(...columns.map(c => values[c]), id).run();
      await logChange(env, config, 'edit', id, label, existing);
      return json({ ok: true, id });
    }
    // a new row, or one being restored after a delete (which keeps its old id)
    const withId = id != null ? ['id', ...columns] : columns;
    const result = await env.DB.prepare(
      `INSERT INTO ${config.table} (${withId.join(', ')}) VALUES (${withId.map(() => '?').join(', ')})`
    ).bind(...(id != null ? [id] : []), ...columns.map(c => values[c])).run();
    const newId = id ?? result.meta.last_row_id;
    await logChange(env, config, 'add', newId, label, null);
    return json({ ok: true, id: newId });
  } catch (err) {
    const message = String(err && err.message || err);
    return json({ ok: false, error: /UNIQUE/.test(message) ? 'That one is already on the list.' : message }, 500);
  }
}

export async function onRequestDelete({ params, request, env }) {
  const config = TABLES[params.table];
  if (!config) return json({ ok: false, error: 'Unknown list.' }, 404);
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  const existing = await env.DB.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).bind(id).first();
  if (!existing) return json({ ok: false, error: 'Not found.' }, 404);
  await env.DB.prepare(`DELETE FROM ${config.table} WHERE id = ?`).bind(id).run();
  await logChange(env, config, 'delete', id, config.label(decode(config, existing)), existing);
  return json({ ok: true });
}
