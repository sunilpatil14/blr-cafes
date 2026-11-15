const PALETTES = [
  ["#f3e9d8", "#cfe4f2"],
  ["#efe2cf", "#e0c3a3"],
  ["#dcebf5", "#b7d6ea"],
  ["#e8d9c4", "#c8a784"],
  ["#f5ecde", "#bfddf0"],
  ["#e2d0ba", "#a9cde6"],
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function CafeCover({
  name,
  className = "",
  large = false,
}: {
  name: string;
  className?: string;
  large?: boolean;
}) {
  const [a, b] = PALETTES[hash(name) % PALETTES.length];
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      {/* faint map contours, echoing the intro */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden="true"
      >
        {[16, 28, 40, 52].map((r) => (
          <circle key={r} cx="72" cy="74" r={r} stroke="#2b1b14" strokeOpacity="0.08" />
        ))}
      </svg>
      <span
        className={`font-display relative text-foreground/70 ${large ? "text-8xl" : "text-4xl sm:text-5xl"}`}
      >
        {initial}
      </span>
    </div>
  );
}