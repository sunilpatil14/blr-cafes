"use client";

import {
  createElement,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";

type GlassConfig = Partial<{
  blurAmount: number;
  refraction: number;
  chromAberration: number;
  edgeHighlight: number;
  specular: number;
  fresnel: number;
  distortion: number;
  cornerRadius: number;
  zRadius: number;
  opacity: number;
  saturation: number;
  tintStrength: number;
  brightness: number;
  shadowOpacity: number;
  shadowSpread: number;
  shadowOffsetY: number;
  floating: boolean;
  button: boolean;
  bevelMode: 0 | 1;
}>;

type LiquidGlassInstance = {
  fps: number;
  destroy: () => void;
  markChanged: (element?: HTMLElement) => void;
};

/**
 * Wraps a subtree in a LiquidGlass root. Any DIRECT child of this component
 * that carries `data-glass` becomes a refractive glass panel; every other
 * direct child is treated as the "scene" the glass refracts.
 *
 * Mount cost is a dynamic import (keeps WebGL + html-to-image out of the
 * server bundle) and one LiquidGlass.init() call. Safe to render multiple
 * GlassRoots on one page — each gets its own WebGL context.
 */
export function GlassRoot<T extends ElementType = "div">({
  as,
  children,
  defaults,
  ...rest
}: {
  as?: T;
  children: ReactNode;
  defaults?: GlassConfig;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">) {
  const Tag = (as ?? "div") as ElementType;
  const rootRef = useRef<HTMLElement | null>(null);
  const instanceRef = useRef<LiquidGlassInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    const root = rootRef.current;
    if (!root) return;

    (async () => {
      try {
        const { LiquidGlass } = await import("@ybouane/liquidglass");
        if (cancelled) return;

        // Only direct children marked data-glass — the library requires
        // glass elements to be direct children of root anyway, but being
        // explicit here avoids depending on its console-warning fallback.
        const glassElements = root.querySelectorAll<HTMLElement>(
          ":scope > [data-glass]"
        );
        if (glassElements.length === 0) return;

        const instance = await LiquidGlass.init({
          root,
          glassElements,
          defaults,
        });

        if (cancelled) {
          instance.destroy();
          return;
        }
        instanceRef.current = instance;
      } catch (err) {
        // Fails soft: panels keep their regular CSS background/border,
        // page stays usable without WebGL.
        console.warn("LiquidGlass failed to initialise", err);
      }
    })();

    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createElement(
    Tag,
    { ref: rootRef, style: { position: "relative" }, ...rest },
    children
  );
}

/**
 * Convenience helper for a glass panel: just sets the data-glass /
 * data-config attributes the library reads. You can skip this and set the
 * attributes by hand on any element (including motion.div) — this just
 * saves the JSON.stringify boilerplate.
 */
export function glassProps(config?: GlassConfig, dynamic?: boolean) {
  return {
    "data-glass": "",
    ...(dynamic ? { "data-dynamic": "" } : {}),
    ...(config ? { "data-config": JSON.stringify(config) } : {}),
  } as const;
}