import { existsSync, readFileSync, writeFileSync } from "node:fs";

const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY. Check .env.local.");
  process.exit(1);
}

const CAFES_FILE = "data/cafes-bengaluru.json";
const OUT = "data/place-ids.json";
const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

const WIDE = process.argv.includes("--wide");
const RETRY_MISSING = process.argv.includes("--retry-missing");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

// about 90 m each way normally, about 280 m with --wide
const D = WIDE ? 0.0025 : 0.0008;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const cafes = JSON.parse(readFileSync(CAFES_FILE, "utf8"));
const out = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

// a wide search is only safe for names that appear once in the whole list
const nameCount = new Map();
for (const c of cafes) {
  nameCount.set(norm(c.name), (nameCount.get(norm(c.name)) ?? 0) + 1);
}
const isUnique = (c) => nameCount.get(norm(c.name)) === 1;

const todo = cafes
  .filter((c) => !(c.id in out) || (RETRY_MISSING && out[c.id] === null))
  .filter((c) => !WIDE || isUnique(c))
  .slice(0, LIMIT);

console.log(`${Object.keys(out).length} already saved, ${todo.length} to look up`);

const save = () => writeFileSync(OUT, JSON.stringify(out));
process.on("SIGINT", () => {
  save();
  console.log("\nStopped. Progress saved.");
  process.exit(0);
});

let firstRequest = true;

async function lookup(c) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    let res;
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": KEY,
          // ids only: this is what keeps the request free
          "X-Goog-FieldMask": "places.id",
        },
        body: JSON.stringify({
          textQuery: c.name,
          locationRestriction: {
            rectangle: {
              low: { latitude: c.lat - D, longitude: c.lng - D },
              high: { latitude: c.lat + D, longitude: c.lng + D },
            },
          },
        }),
      });
    } catch {
      await sleep(2000 * attempt); // network hiccup, try again
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * attempt);
      continue;
    }
    if (!res.ok) {
      const text = (await res.text()).slice(0, 300);
      if (firstRequest) {
        console.error(`Google said ${res.status}: ${text}`);
        console.error("Check that Places API (New) is enabled and billing is on.");
        process.exit(1);
      }
      console.log(`   skipped (${res.status})`);
      return undefined;
    }
    firstRequest = false;
    const json = await res.json();
    return json.places?.[0]?.id ?? null;
  }
  return undefined; // gave up for now; run the script again later
}

let found = 0;
let missing = 0;

for (let i = 0; i < todo.length; i++) {
  const c = todo[i];
  const id = await lookup(c);
  if (id !== undefined) {
    out[c.id] = id;
    if (id) found++;
    else missing++;
  }
  console.log(`[${i + 1}/${todo.length}] ${c.name} -> ${id ?? "no match"}`);
  if ((i + 1) % 20 === 0) save();
  await sleep(120);
}

save();
console.log(`Done. ${found} matched, ${missing} had no match here.`);