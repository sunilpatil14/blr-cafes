"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import {
  Coffee,
  DoorOpen,
  Navigation,
  Search,
  Sun,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { IntroLoader } from "@/components/intro-loader";
import { SavedLink } from "@/components/saved-link";
import { SearchBox } from "@/components/search-box";
import { PLACES, placeLabel } from "@/data/places";

// resets on a full refresh, survives in-app navigation
let introPlayed = false;

const CAFE_COUNT = "1,100+"; // edit to match your snapshot
const SKY = "#bfddf0";

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

const streets = [
  "M-20 120L1020 170",
  "M-20 330C250 300 600 380 1020 320",
  "M-20 500L1020 450",
  "M180 -20L220 620",
  "M470 -20C430 200 520 400 480 620",
  "M760 -20L800 620",
];
const ring =
  "M120 300C120 120 360 60 500 60S880 140 880 300S640 540 500 540S120 480 120 300Z";

// cafe dots (percent of the map layer)
const DOTS = [
  { x: 8, y: 22 }, { x: 16, y: 64 }, { x: 24, y: 38 }, { x: 31, y: 78 },
  { x: 40, y: 14 }, { x: 58, y: 84 }, { x: 66, y: 26 }, { x: 74, y: 70 },
  { x: 82, y: 40 }, { x: 90, y: 18 }, { x: 93, y: 62 }, { x: 48, y: 90 },
  { x: 5, y: 84 }, { x: 70, y: 10 },
];

const floaters: {
  icon: LucideIcon;
  label: string;
  className: string;
  delay: number;
}[] = [
  { icon: DoorOpen, label: "Open now", className: "left-[4%] top-[32%]", delay: 0 },
  { icon: Wifi, label: "WiFi spots", className: "right-[4%] top-[38%]", delay: 0.7 },
  { icon: Sun, label: "Outdoor seating", className: "left-[6%] top-[64%]", delay: 1.4 },
];

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

function DropPin({ play }: { play: boolean }) {
  return (
    <div className="relative mb-4 flex flex-col items-center">
      <motion.div
        initial={{ y: -180, opacity: 0 }}
        animate={play ? { y: 0, opacity: 1 } : { y: -180, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-14 drop-shadow-[0_8px_14px_rgba(0,0,0,0.5)] sm:size-16"
          fill="none"
        >
          <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill={SKY} />
          <g
            transform="translate(-0.4 0)"
            stroke="#2b1b14"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M8.6 9h5.6v2.4a2.8 2.8 0 0 1-2.8 2.8 2.8 2.8 0 0 1-2.8-2.8z"
              fill="#2b1b14"
            />
            <path d="M14.2 9.8h.6a1.4 1.4 0 0 1 0 2.8h-.6" />
          </g>
        </svg>
      </motion.div>

      {/* ripples under the tip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-1 flex h-0 items-center justify-center">
        <div style={{ transform: "scaleY(0.35)" }}>
          <motion.span
            className="block size-12 rounded-full border"
            style={{ borderColor: SKY }}
            animate={play ? { scale: [0.3, 3], opacity: [0, 0.7, 0] } : { opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 1 }}
          />
        </div>
      </div>
    </div>
  );
}

function AreaMarquee({ still }: { still: boolean }) {
  const row = PLACES.filter((p) => p.name !== "Bengaluru");
  const fade =
    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)";

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <motion.div
        className="flex w-max"
        animate={still ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 45, ease: "linear", repeat: Infinity }}
      >
        {[...row, ...row].map((p, i) => (
          <Link
            key={`${p.name}-${i}`}
            href={`/cafes?lat=${p.lat}&lng=${p.lng}&name=${encodeURIComponent(placeLabel(p))}`}
            className="mr-3 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#f6f0e6]/85 transition hover:border-sky hover:bg-white/10"
          >
            {p.name}
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const still = !!reduceMotion;
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

  // glow that follows the pointer
  const mx = useMotionValue(50);
  const my = useMotionValue(35);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${sx}% ${sy}%, rgba(191,221,240,0.16), transparent 62%)`;

  return (
    <>
      {mounted && <IntroLoader onReveal={handleReveal} onDone={handleDone} />}

      <main>
        <section
          className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden rounded-b-[2.5rem] bg-[#2b1b14] pb-10 pt-28 sm:rounded-b-[4rem]"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(((e.clientX - r.left) / r.width) * 100);
            my.set(((e.clientY - r.top) / r.height) * 100);
          }}
        >
          {/* slowly zooming map layer */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={still ? undefined : { scale: [1, 1.1] }}
            transition={{
              duration: 30,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <svg
              viewBox="0 0 1000 600"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
              fill="none"
              aria-hidden="true"
            >
              {streets.map((d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  stroke={SKY}
                  strokeWidth={1.2}
                  strokeOpacity={0.25}
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={revealed ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 1.4, delay: 0.2 + i * 0.12, ease: "easeInOut" }}
                />
              ))}
              <motion.path
                d={ring}
                stroke={SKY}
                strokeWidth={1.6}
                strokeOpacity={0.4}
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={revealed ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.8, delay: 0.5, ease: "easeInOut" }}
              />
            </svg>

            {DOTS.map((d, i) => (
              <motion.div
                key={i}
                className="absolute size-2.5"
                style={{ left: `${d.x}%`, top: `${d.y}%`, marginLeft: -5, marginTop: -5 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={revealed ? { scale: 1, opacity: 0.9 } : { scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.9 + i * 0.1 }}
              >
                <span className="absolute inset-0 rounded-full" style={{ background: SKY }} />
                <motion.span
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: SKY }}
                  animate={revealed ? { scale: [1, 3.2], opacity: [0.7, 0] } : { opacity: 0 }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 1.4 + i * 0.3,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* vignette and pointer glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(43,27,20,0.2)_0%,#2b1b14_92%)]" />
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: spotlight }}
          />

          {/* nav */}
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6"
          >
            <Link href="/" className="font-display flex items-center gap-2 text-xl text-[#f6f0e6]">
              <Coffee className="size-5 text-sky" />
              Brew Atlas
            </Link>
            <div className="flex items-center gap-6">
              <SavedLink dark />
              <a
                href="#how"
                className="text-sm text-[#f6f0e6]/70 transition hover:text-[#f6f0e6]"
              >
                How it works
              </a>
            </div>
          </motion.nav>

          {/* floating chips (wide screens only) */}
          {floaters.map((f) => (
            <motion.div
              key={f.label}
              className={`pointer-events-none absolute z-10 hidden xl:block ${f.className}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.6 + f.delay, duration: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
                className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-foreground shadow-xl"
              >
                <f.icon className="size-4 text-sky-deep" />
                {f.label}
              </motion.div>
            </motion.div>
          ))}

          {/* content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={revealed ? "show" : "hidden"}
            className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center"
          >
            <DropPin play={revealed} />

            <motion.p
              variants={item}
              className="mb-5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-[#f6f0e6]/75 backdrop-blur"
            >
              Bengaluru cafe finder
            </motion.p>

            <h1 className="font-display max-w-4xl text-5xl leading-[1.08] text-[#f6f0e6] sm:text-6xl xl:text-7xl">
              {plainWords.map((w) => (
                <motion.span key={w} variants={item} className="mr-[0.25em] inline-block">
                  {w}
                </motion.span>
              ))}
              <motion.span variants={item} className="mr-[0.25em] inline-block italic text-sky">
                just
              </motion.span>
              <motion.span variants={item} className="relative inline-block italic text-sky">
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
                    stroke={SKY}
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

            <motion.p variants={item} className="mt-6 max-w-xl text-lg text-[#f6f0e6]/70">
              Search an area or a cafe name and see hours, details and
              directions before you step through the door.
            </motion.p>

            <motion.div variants={item} className="mt-10 flex w-full justify-center">
              <SearchBox />
            </motion.div>

            <motion.p
              variants={item}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-[#f6f0e6]/55"
            >
              <span>{CAFE_COUNT} Bengaluru cafes</span>
              <span aria-hidden>·</span>
              <span>Free to use</span>
              <span aria-hidden>·</span>
              <span>No sign-up</span>
            </motion.p>
          </motion.div>

          {/* area strip */}
          <motion.div
            className="relative z-10 mt-14 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ delay: 1.8, duration: 0.9 }}
          >
            <AreaMarquee still={still} />
          </motion.div>
        </section>

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
                <div className="h-full rounded-3xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-sky/60 text-primary">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="font-display text-2xl">{f.title}</h3>
                  <p className="mt-3 text-muted-foreground">{f.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border px-6 py-10 text-center text-xs text-muted-foreground">
          <p className="font-display text-base text-foreground">Brew Atlas</p>
          <p className="mt-2">Cafe data © OpenStreetMap contributors</p>
        </footer>
      </main>
    </>
  );
}