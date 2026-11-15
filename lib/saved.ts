"use client";

import { useSyncExternalStore } from "react";
import type { Cafe } from "@/lib/cafes";

export type Saved = Pick<
  Cafe,
  "id" | "name" | "lat" | "lng" | "address" | "openingHours" | "wifi" | "outdoorSeating"
>;

const KEY = "brew-atlas-saved";
const MAX = 100;
const EMPTY: Saved[] = [];

let cache: Saved[] | null = null;
const listeners = new Set<() => void>();

function read(): Saved[] {
  if (cache) return cache;
  let next: Saved[] = [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    next = Array.isArray(parsed) ? parsed : [];
  } catch {
    // storage blocked or corrupt: start empty
  }
  cache = next;
  return next;
}

function write(next: Saved[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: the list still works until the page closes
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // keeps other open tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSaved() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);

  return {
    saved,
    isSaved: (id: string) => saved.some((c) => c.id === id),
    toggle: (c: Saved) => {
      const current = read();
      if (current.some((s) => s.id === c.id)) {
        write(current.filter((s) => s.id !== c.id));
        return;
      }
      const { id, name, lat, lng, address, openingHours, wifi, outdoorSeating } = c;
      write(
        [{ id, name, lat, lng, address, openingHours, wifi, outdoorSeating }, ...current].slice(0, MAX)
      );
    },
    clear: () => write([]),
  };
}

// false on the server and on the first client render, true afterwards
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}