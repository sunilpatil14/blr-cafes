"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Coffee, Navigation, Search, type LucideIcon } from "lucide-react";
import { IntroLoader } from "@/components/intro-loader";
import { SavedLink } from "@/components/saved-link";
import { SearchBox } from "@/components/search-box";
import { GlassRoot, glassProps } from "@/components/liquid-glass-root";
import { FEATURED_AREAS, PLACES, placeLabel, type Place } from "@/data/places";
import { Editorial } from "@/components/editorial";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/components/wordmark";

// resets on a full refresh, survives in-app navigation
let introPlayed = false;

const CAFE_COUNT = "1,100+"; // edit to match your snapshot

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const plainWords = ["Find", "the", "cafe", "that", "feels"];

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Search,
    title: "Search your way",
    text: "Pick an area or type a cafe name. Suggestions appear as you type.",
  },
  {
    icon: Coffee,
    title: "See what's inside",
    text: "Menus, coffee types and offers wherever cafes have shared them.",
  },
  {
    icon: Navigation,
    title: "Get there easily",
    text: "Hours, WiFi and outdoor seating where listed, plus one-tap directions.",
  },
];

/* ---------- the cafe street ---------- */

const C = {
  esp: "#2b1b14",
  brown: "#3b2418",
  accent: "#8b5a3c",
  sky: "#bfddf0",
  skyDeep: "#6fa8cf",
  cream: "#f6f0e6",
  paper: "#fcf8f1",
  sand: "#f1e7d6",
  line: "#d6c5a8",
  warm: "#f6e2b8",
};

const STREET = FEATURED_AREAS.map((n) => PLACES.find((p) => p.name === n)).filter(
  (p): p is Place => !!p
);

const AWNINGS: [string, string][] = [
  [C.accent, C.cream],
  [C.skyDeep, C.cream],
  [C.esp, C.sky],
  [C.accent, C.sky],
  [C.skyDeep, C.paper],
  [C.brown, C.cream],
  [C.accent, C.cream],
];
const TOPS = [38, 54, 30, 52, 44, 34, 50]; // height of the upper floor
const STEAM = new Set([0, 3, 5]); // shops with a steaming chimney

const serif = { fontFamily: "var(--font-fraunces), Georgia, serif" };
const sans = { fontFamily: "var(--font-dm-sans), sans-serif" };

function Shop({
  place,
  i,
  revealed,
}: {
  place: Place;
  i: number;
  revealed: boolean;
}) {
  const [a, b] = AWNINGS[i % AWNINGS.length];
  const top = TOPS[i % TOPS.length];
  const lit = i % 3;

  return (
    <motion.div
      className="shrink-0"
      initial={{ y: 140, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : { y: 140, opacity: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 16, delay: 1.1 + i * 0.1 }}
    >
      <Link
        href={`/cafes?lat=${place.lat}&lng=${place.lng}&name=${encodeURIComponent(placeLabel(place))}`}
        aria-label={`Cafes in ${place.name}`}
        className="group block"
      >
        <motion.div
          initial="rest"
          animate="rest"
          whileHover="hover"
          variants={{ rest: { y: 0 }, hover: { y: -8 } }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <svg
            viewBox="0 0 200 300"
            className="block w-[150px] overflow-visible md:w-[165px]"
            aria-hidden="true"
          >
            <defs>
              <clipPath id={`awn-${i}`}>
                <path d="M30 148H170L184 178H16Z" />
              </clipPath>
            </defs>

            {/* chimney and steam */}
            {STEAM.has(i) && (
              <>
                <rect x="150" y={top - 32} width="14" height="26" fill={C.accent} />
                <motion.path
                  d={`M157 ${top - 36}c-6-8 6-12 0-22`}
                  stroke={C.skyDeep}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  animate={{ opacity: [0, 0.7, 0], y: [0, -10] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: i * 0.3 }}
                />
              </>
            )}

            {/* building */}
            <rect x="10" y={top} width="180" height={300 - top} fill={C.sand} stroke={C.line} strokeWidth="2" />
            <rect x="4" y={top - 8} width="192" height="10" rx="2" fill={C.accent} />

            {/* upper windows */}
            {[24, 86, 148].map((x, k) => (
              <path
                key={x}
                transform={`translate(${x} ${top + 14})`}
                d="M0 34V16a14 14 0 0 1 28 0V34z"
                fill={k === lit ? C.warm : C.sky}
                fillOpacity={k === lit ? 1 : 0.85}
                stroke={C.esp}
                strokeWidth="2"
              />
            ))}

            {/* sign board */}
            <rect x="22" y="108" width="156" height="34" rx="5" fill={C.esp} />
            <rect x="26" y="112" width="148" height="26" rx="3" fill="none" stroke={C.sky} strokeOpacity="0.45" />
            <text
              x="100"
              y="130"
              textAnchor="middle"
              fontSize="16"
              fill={C.cream}
              style={serif}
            >
              {place.name}
            </text>

            {/* plinth */}
            <rect x="10" y="284" width="180" height="16" fill={C.line} fillOpacity="0.7" />

            {/* shop window */}
            <rect x="24" y="186" width="84" height="92" rx="6" fill={C.warm} stroke={C.esp} strokeWidth="3" />
            <rect
              x="24"
              y="186"
              width="84"
              height="92"
              rx="6"
              fill="#fff"
              className="opacity-0 transition-opacity duration-300 group-hover:opacity-40"
            />
            <path d="M28 190L60 190L28 232Z" fill="#fff" fillOpacity="0.35" />
            <g stroke={C.esp} strokeWidth="1.5">
              <path d="M44 189V200M66 189V194M88 189V202" />
            </g>
            <path
              d="M38 206a6 6 0 0 1 12 0zM60 200a6 6 0 0 1 12 0zM82 208a6 6 0 0 1 12 0z"
              fill={C.esp}
            />
            <path d="M30 250H102" stroke={C.accent} strokeWidth="4" strokeLinecap="round" />
            <path d="M40 236h16v6a8 8 0 0 1-16 0z" fill={C.esp} />
            <path d="M64 236h16v6a8 8 0 0 1-16 0z" fill={C.accent} />

            {/* door */}
            <path d="M122 300V212a27 27 0 0 1 54 0V300z" fill={C.brown} stroke={C.esp} strokeWidth="2" />
            <path d="M131 262V218a18 18 0 0 1 36 0V262z" fill={C.sky} fillOpacity="0.85" />
            <circle cx="168" cy="272" r="3" fill={C.warm} />
            <rect x="136" y="274" width="26" height="12" rx="2" fill={C.cream} />
            <text x="149" y="283" textAnchor="middle" fontSize="7" fill={C.esp} style={sans}>
              OPEN
            </text>

            {/* striped awning, drawn last so it overhangs the window */}
            <motion.g
              variants={{ rest: { y: 0 }, hover: { y: -3 } }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <g clipPath={`url(#awn-${i})`}>
                {Array.from({ length: 7 }).map((_, k) => (
                  <rect
                    key={k}
                    x={16 + 24 * k}
                    y="148"
                    width="24"
                    height="32"
                    fill={k % 2 === 0 ? a : b}
                  />
                ))}
              </g>
              {Array.from({ length: 7 }).map((_, k) => (
                <circle key={k} cx={28 + 24 * k} cy="178" r="12" fill={k % 2 === 0 ? a : b} />
              ))}
              <path
                d="M30 148H170L184 178H16Z"
                fill="none"
                stroke={C.esp}
                strokeWidth="2"
                strokeOpacity="0.3"
              />
            </motion.g>
          </svg>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function Cloud({
  top,
  width,
  duration,
  delay,
}: {
  top: string;
  width: string;
  duration: string;
  delay: string;
}) {
  return (
    <div
      className="cloud pointer-events-none absolute left-0"
      style={{ top, "--d": duration, "--delay": delay } as React.CSSProperties}
    >
      <svg viewBox="0 0 120 50" className={width} aria-hidden="true">
        <g fill="#ffffff" fillOpacity="0.85">
          <circle cx="35" cy="30" r="18" />
          <circle cx="60" cy="22" r="22" />
          <circle cx="88" cy="30" r="16" />
          <rect x="30" y="30" width="64" height="18" rx="9" />
        </g>
      </svg>
    </div>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(() => !introPlayed);
  const [revealed, setRevealed] = useState(() => introPlayed);

  const handleReveal = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => setMounted(false), []);

  useEffect(() => {
    introPlayed = true;
    if (reduceMotion) {
      setMounted(false);
      setRevealed(true);
    }
  }, [reduceMotion]);

  return (
    <>
      {mounted && <IntroLoader onReveal={handleReveal} onDone={handleDone} />}

      <main>
        <section className="relative flex min-h-screen flex-col items-center overflow-hidden pt-28">
          {/* sky */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#cfe5f4_0%,#e4f0f8_30%,#f7f1e7_66%)]" />
          <div className="pointer-events-none absolute -right-10 top-10 size-72 rounded-full bg-[#f6e2b8]/60 blur-3xl" />
          <Cloud top="12%" width="w-44" duration="95s" delay="-20s" />
          <Cloud top="26%" width="w-28" duration="120s" delay="-70s" />
          <Cloud top="8%" width="w-36" duration="80s" delay="-55s" />

          {/* nav */}
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6"
          >
            <Link href="/" className="font-display flex items-center gap-2 text-xl">
              <Coffee className="size-5 text-accent" />
              <Wordmark />
            </Link>
            <div className="flex items-center gap-6">
              <SavedLink />
              <a
                href="#how"
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                How it works
              </a>
            </div>
          </motion.nav>

          {/* centred content */}
          <div className="relative z-10 flex w-full flex-1 items-center justify-center px-6">
            <motion.div
              variants={container}
              initial="hidden"
              animate={revealed ? "show" : "hidden"}
              className="flex w-full flex-col items-center text-center"
            >
              <motion.p
                variants={item}
                className="mb-5 rounded-full border border-border bg-card/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-muted-foreground backdrop-blur"
              >
                Bengaluru cafe finder
              </motion.p>

              <h1 className="font-display max-w-4xl text-5xl leading-[1.08] sm:text-6xl xl:text-7xl">
                {plainWords.map((w) => (
                  <motion.span key={w} variants={item} className="mr-[0.25em] inline-block">
                    {w}
                  </motion.span>
                ))}
                <motion.span variants={item} className="mr-[0.25em] inline-block italic text-accent">
                  just
                </motion.span>
                <motion.span variants={item} className="relative inline-block italic text-accent">
                  right
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1 left-0 h-3 w-full sm:-bottom-2"
                    fill="none"
                  >
                    <motion.path
                      d="M2 8C40 2 80 12 120 6S180 4 198 8"
                      stroke="#8b5a3c"
                      strokeWidth="3"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: revealed ? 1 : 0 }}
                      transition={{ delay: 1.2, duration: 0.9, ease: "easeInOut" }}
                    />
                  </svg>
                </motion.span>
              </h1>

              <motion.p variants={item} className="mt-6 max-w-xl text-lg text-muted-foreground">
                Search an area or a cafe name and see hours, details and
                directions before you step through the door.
              </motion.p>

              <motion.div variants={item} className="mt-10 flex w-full justify-center">
                <SearchBox />
              </motion.div>

              <motion.p
                variants={item}
                className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground"
              >
                <span>{CAFE_COUNT} Bengaluru cafes</span>
                <span aria-hidden>·</span>
                <span>Free to use</span>
                <span aria-hidden>·</span>
                <span>No sign-up</span>
              </motion.p>
            </motion.div>
          </div>

          {/* the street */}
          <div className="relative z-10 mt-12 w-full">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: revealed ? 1 : 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="mb-3 text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Or stroll down the street
            </motion.p>
            <div className="overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="mx-auto flex w-max items-end">
                {STREET.map((p, i) => (
                  <Shop key={p.name} place={p} i={i} revealed={revealed} />
                ))}
              </div>
            </div>
            <div className="h-3 w-full bg-[#3b2418]" />
          </div>
        </section>

        <Editorial />

        {/* how it works */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {CAFE_COUNT} cafes mapped in Bengaluru
            </p>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl">How it works</h2>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassRoot className="relative h-full rounded-3xl">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky/50 via-card to-accent/15"
                  />
                  <div
                    {...glassProps({
                      cornerRadius: 24,
                      blurAmount: 0.22,
                      refraction: 0.4,
                      edgeHighlight: 0.06,
                      specular: 0.1,
                      shadowOpacity: 0.12,
                      shadowSpread: 14,
                      shadowOffsetY: 6,
                      button: true,
                    })}
                    className="h-full rounded-3xl border border-border bg-card/15 p-8 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-sky/60 text-primary">
                      <f.icon className="size-6" />
                    </div>
                    <h3 className="font-display text-2xl">{f.title}</h3>
                    <p className="mt-3 text-muted-foreground">{f.text}</p>
                  </div>
                </GlassRoot>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border px-6 py-10 text-center text-xs text-muted-foreground">
            <p className="text-base text-foreground">
             <Wordmark />
            </p>      
           <p className="mt-2">Cafe data © OpenStreetMap contributors</p>
        </footer>
      </main>
    </>
  );
}