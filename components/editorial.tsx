"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { FEATURED_AREAS, PLACES, placeLabel, type Place } from "@/data/places";     

/* ---------- 1. the statement ---------- */

const STATEMENT =
  "Every neighbourhood hides a cafe that fits your mood. Slow mornings, quiet laptops, long talks over chai.";
const EMPHASIS = new Set(["mood", "mornings", "chai"]);

function Word({
  word,
  em,
  progress,
  range,
}: {
  word: string;
  em: boolean;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const reduce = useReducedMotion();
  const opacity = useTransform(progress, range, [0.14, 1]);

  return (
    <motion.span
      style={{ opacity: reduce ? 1 : opacity }}
      className={`mr-[0.25em] inline-block ${em ? "italic text-accent" : ""}`}
    >
      {word}
    </motion.span>
  );
}

function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const words = STATEMENT.split(" ");

  return (
    <section className="mx-auto max-w-5xl px-6 py-28 sm:py-40">
      <p className="mb-8 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        A note on cafes
      </p>
      <p
        ref={ref}
        className="font-display text-4xl leading-[1.12] sm:text-6xl lg:text-7xl"
      >
        {words.map((w, i) => (
          <Word
            key={i}
            word={w}
            em={EMPHASIS.has(w.toLowerCase().replace(/[^a-z]/g, ""))}
            progress={scrollYProgress}
            range={[i / words.length, (i + 1) / words.length]}
          />
        ))}
      </p>
    </section>
  );
}

/* ---------- 2. the index ---------- */

// everything that isn't already on the street
const INDEX = PLACES.filter(
  (p) => p.name !== "Bengaluru" && !FEATURED_AREAS.includes(p.name)
);

function Row({ place, n }: { place: Place; n: number }) {
  return (
    <li className="break-inside-avoid border-b border-border">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div initial="rest" animate="rest" whileHover="hover" whileTap="hover">
          <Link
            href={`/cafes?lat=${place.lat}&lng=${place.lng}&name=${encodeURIComponent(placeLabel(place))}`}
            className="relative flex items-baseline gap-4 overflow-hidden px-4 py-5 sm:gap-6 sm:px-6 sm:py-6"
          >
            {/* colour sweep */}
            <motion.span
              aria-hidden
              className="absolute inset-0 origin-left bg-sky"
              variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="relative w-8 shrink-0 text-sm tabular-nums text-muted-foreground sm:w-12 sm:text-base">
              {String(n).padStart(2, "0")}
            </span>
            <motion.span
              className="font-display relative text-3xl leading-none sm:text-5xl lg:text-4xl xl:text-5xl"
              variants={{ rest: { x: 0 }, hover: { x: 14 } }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {place.name}
            </motion.span>
            <motion.span
              aria-hidden
              className="relative ml-auto self-center"
              variants={{ rest: { opacity: 0, x: -12 }, hover: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight className="size-6 sm:size-8" />
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </li>
  );
}

function Index() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-28 sm:pb-36">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            The index
          </p>
          <h2 className="font-display mt-3 text-4xl sm:text-6xl">
            More neighbourhoods
          </h2>
        </div>
        <p className="max-w-xs text-sm text-muted-foreground">
          {INDEX.length} more areas beyond the street above. Not listed? Use
          the search at the top.
        </p>
      </div>

      <ul className="border-t border-border lg:columns-2 lg:gap-x-12">
        {INDEX.map((p, i) => (
          <Row key={p.name} place={p} n={i + 1} />
        ))}
      </ul>
    </section>
  );
}

/* ---------- 3. giant moving words ---------- */

function Band({
  words,
  reverse = false,
  outline = false,
  still,
}: {
  words: string[];
  reverse?: boolean;
  outline?: boolean;
  still: boolean;
}) {
  const row = [...words, ...words]; // doubled so the loop never shows a gap

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex w-max items-center"
        animate={still ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 45, ease: "linear", repeat: Infinity }}
      >
        {row.map((w, i) => (
          <span key={i} className="flex items-center">
            <span
              className={`font-display whitespace-nowrap text-[clamp(4rem,12vw,10rem)] leading-none ${
                outline ? "italic" : ""
              }`}
              style={
                outline
                  ? { WebkitTextStroke: "1.5px #2b1b14", color: "transparent" }
                  : undefined
              }
            >
              {w}
            </span>
            <span
              aria-hidden
              className="mx-6 text-[clamp(3rem,8vw,7rem)] leading-none text-accent sm:mx-10"
            >
              /
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function Editorial() {
  const reduce = useReducedMotion();
  const still = !!reduce;

  return (
    <>
      <Statement />
      <Index />
      <section aria-hidden="true" className="space-y-2 bg-sky/70 py-10 sm:py-14">
        <Band words={["Coffee", "Chai", "Brunch", "Calm"]} still={still} />
        <Band
          words={["Laptops", "Dates", "Books", "Catch-ups"]}
          reverse
          outline
          still={still}
        />
      </section>
    </>
  );
}