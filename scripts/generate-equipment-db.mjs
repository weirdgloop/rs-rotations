import { readFile, writeFile } from 'node:fs/promises';

const RAW_PATH = new URL('../equipment_raw.json', import.meta.url);
const OUT_PATH = new URL('../src/equipment.json', import.meta.url);

function firstId(item) {
    if (!Array.isArray(item.id) || item.id.length === 0) {
        throw new Error(`Equipment item "${item.name ?? '<unnamed>'}" has no id array`);
    }
    const id = Number(item.id[0]);
    if (!Number.isInteger(id)) {
        throw new Error(`Equipment item "${item.name ?? '<unnamed>'}" has invalid first id`);
    }
    return id;
}

const raw = JSON.parse(await readFile(RAW_PATH, 'utf8'));
if (!Array.isArray(raw)) {
    throw new Error('static/equipment_raw.json must be an array');
}

const byId = {};
for (const item of raw) {
    const id = firstId(item);
    if (byId[id]) {
        continue;
    }
    byId[id] = {
        ...item,
        id,
        ids: item.id
    };
}

const sorted = Object.fromEntries(
    Object.entries(byId).sort(([a], [b]) => Number(a) - Number(b))
);

await writeFile(OUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Wrote ${Object.keys(sorted).length} equipment records to static/equipment.json`);
