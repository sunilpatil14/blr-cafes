"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { Coffee, DoorOpen, Navigation, Sun, Wifi } from "lucide-react";

const SKY = "#bfddf0";

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

// where the little cafe dots sit (percent of the panel)
const PINS = [
  { x: 22, y: 30 },
  { x: 68, y: 20 },
  { x: 82, y: 50 },
  { x: 30, y: 62 },
  { x: 60, y: 36 },
  { x: 44, y: 18 },
  { x: 12, y: 46 },
];

const CHIPS = [
  { icon: DoorOpen, label: "Open now", className: "left-4 top-[20%] sm:left-6", delay: 0 },
  { icon: Wifi, label: "WiFi", className: "right-4 top-[34%] sm:right-6", delay: 0.6 },
  { icon: Sun, label: "Outdoor seating", className: "left-5 top-[52%] sm:left-8", delay: 1.2 },
];

export function HeroMap({ play }: { play: boolean }) {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 120, damping: 16 });
  const ry = useSpring(0, { stiffness: 120, damping: 16 });

  return (
    <motion.div
      className="relative h-[340px] w-full overflow-hidden rounded-[2rem] bg-[#2b1b14] shadow-2xl shadow-[#2b1b14]/25 sm:h-[460px] lg:h-[580px]"
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={play ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.96 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * 10);
        rx.set(-py * 10);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {/* street lines */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
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
            animate={play ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 1.4, delay: 0.7 + i * 0.12, ease: "easeInOut" }}
          />
        ))}
        <motion.path
          d={ring}
          stroke={SKY}
          strokeWidth={1.6}
          strokeOpacity={0.45}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={play ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.8, delay: 1, ease: "easeInOut" }}
        />
      </svg>

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,27,20,0)_30%,#2b1b14_95%)]" />

      {/* coordinates, like in the intro */}
      <p
        className="absolute left-5 top-5 text-[10px] uppercase tracking-[0.3em] sm:left-7 sm:top-6 sm:text-xs"
        style={{ color: SKY, opacity: 0.65 }}
      >
        12.97° N · 77.59° E
      </p>
      <p className="absolute right-5 top-5 rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#f6f0e6]/70 sm:right-7 sm:top-6 sm:text-xs">
        Bengaluru
      </p>

      {/* cafe dots */}
      {PINS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute size-3"
          style={{ left: `${p.x}%`, top: `${p.y}%`, marginLeft: -6, marginTop: -6 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={play ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 14, delay: 1.1 + i * 0.12 }}
        >
          <span className="absolute inset-0 rounded-full" style={{ background: SKY }} />
          <motion.span
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: SKY }}
            animate={play ? { scale: [1, 3], opacity: [0.8, 0] } : { opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 1.6 + i * 0.25,
            }}
          />
        </motion.div>
      ))}

      {/* ripple under the main pin */}
      <div className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
        <div style={{ transform: "scaleY(0.35)" }}>
          <motion.span
            className="block size-20 rounded-full border"
            style={{ borderColor: SKY }}
            animate={play ? { scale: [0.3, 2.6], opacity: [0, 0.7, 0] } : { opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 2 }}
          />
        </div>
      </div>

      {/* main pin drops in */}
      <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-full">
        <motion.div
          initial={{ y: -260, opacity: 0 }}
          animate={play ? { y: 0, opacity: 1 } : { y: -260, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 1.4 }}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-16 drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] sm:size-20"
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
      </div>

      {/* floating feature chips */}
      {CHIPS.map((c) => (
        <motion.div
          key={c.label}
          className={`absolute ${c.className}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={play ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ delay: 1.9 + c.delay, duration: 0.7 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
            className="flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-xs text-foreground shadow-lg"
          >
            <c.icon className="size-3.5 text-sky-deep" />
            {c.label}
          </motion.div>
        </motion.div>
      ))}

      {/* info card */}
      <motion.div
        className="absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-2xl bg-card p-3 shadow-xl sm:inset-x-6 sm:bottom-6 sm:p-4"
        initial={{ opacity: 0, y: 30 }}
        animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ delay: 2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-sky/60 sm:size-16">
          <Coffee className="size-7 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight sm:text-xl">
            Your next favourite cafe
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
            Hours, details and directions in one tap
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Navigation className="size-4" />
        </div>
      </motion.div>
    </motion.div>
  );
}