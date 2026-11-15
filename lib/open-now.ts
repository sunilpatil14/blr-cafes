export type OpenState = "open" | "closed" | "unknown";
export type OpenInfo = { state: OpenState; text: string };

type OH = {
  getState(date?: Date): boolean;
  getUnknown(date?: Date): boolean;
  getNextChange(date?: Date): Date | undefined;
};
type OHConstructor = new (value: string, nominatim?: unknown) => OH;

// Karnataka, so sunrise and holiday rules use the right place
const PLACE = {
  lat: 12.97,
  lon: 77.59,
  address: { country_code: "in", state: "Karnataka" },
};

let loader: Promise<OHConstructor> | null = null;

function load(): Promise<OHConstructor> {
  if (!loader) {
    // @ts-ignore -- the package may or may not ship its own type declarations
    loader = import("opening_hours").then((m: unknown) => {
      const mod = m as { default?: OHConstructor };
      return (mod.default ?? m) as OHConstructor;
    });
    loader.catch(() => {
      loader = null; // allow a retry if the download failed
    });
  }
  return loader;
}

// Many cafes write "PH,Mo-Su 08:00-23:30". Without holiday data for India
// that can come back as "unknown", so drop the holiday tokens from lists.
function simplify(value: string) {
  return value
    .replace(/\b(PH|SH)\s*,\s*/g, "")
    .replace(/\s*,\s*(PH|SH)\b/g, "");
}

function time12(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function fmt(d: Date, now: Date) {
  const time = time12(d);
  if (d.toDateString() === now.toDateString()) return time;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return `${time} tomorrow`;
  return `${d.toLocaleDateString("en-IN", { weekday: "short" })} ${time}`;
}

export async function evaluateOpen(
  cafes: { id: string; openingHours?: string }[]
): Promise<Map<string, OpenInfo>> {
  const OpeningHours = await load();
  const now = new Date();
  const out = new Map<string, OpenInfo>();

  for (const c of cafes) {
    if (!c.openingHours) continue;
    try {
      const oh = new OpeningHours(simplify(c.openingHours), PLACE);

      if (oh.getUnknown(now)) {
        out.set(c.id, { state: "unknown", text: "Hours may vary" });
        continue;
      }

      const open = oh.getState(now);
      const next = oh.getNextChange(now);
      out.set(c.id, {
        state: open ? "open" : "closed",
        text: open
          ? next ? `Open · closes ${fmt(next, now)}` : "Open now"
          : next ? `Closed · opens ${fmt(next, now)}` : "Closed",
      });
    } catch {
      out.set(c.id, { state: "unknown", text: "Hours unclear" });
    }
  }
  return out;
}