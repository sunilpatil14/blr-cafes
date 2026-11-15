const DAYS: Record<string, string> = {
  Mo: "Mon", Tu: "Tue", We: "Wed", Th: "Thu", Fr: "Fri", Sa: "Sat", Su: "Sun",
};

function clock(h: string, m: string) {
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 && hour < 24 ? "pm" : "am";
  const h12 = hour % 12 || 12;
  return m === "00" ? `${h12} ${suffix}` : `${h12}:${m} ${suffix}`;
}

export function prettyHours(raw: string): string {
  let s = raw.trim();
  if (s === "24/7") return "Open 24 hours";

  s = s
    .replace(/\b(PH|SH)\s*,\s*/g, "")
    .replace(/\s*,\s*(PH|SH)\b/g, "")
    .replace(/\bMo-Su\b/g, "Daily")
    .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/g, (d) => DAYS[d])
    .replace(/\b(\d{1,2}):(\d{2})\b/g, (_, h: string, m: string) => clock(h, m))
    .replace(/\b(am|pm)\s*-\s*(?=\d)/g, "$1 – ")
    .replace(/\s*;\s*/g, " · ");

  return s;
}