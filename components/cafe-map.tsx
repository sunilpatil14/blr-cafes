"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Pin = { id: string; name: string; lat: number; lng: number };

function paint(el: HTMLElement, on: boolean) {
  Object.assign(el.style, {
    width: on ? "24px" : "16px",
    height: on ? "24px" : "16px",
    borderRadius: "50%",
    background: on ? "#6fa8cf" : "#8b5a3c",
    border: "3px solid #fff",
    boxShadow: `0 2px 8px rgba(0,0,0,${on ? 0.5 : 0.35})`,
    cursor: "pointer",
    transition: "width .2s, height .2s, background .2s",
    zIndex: on ? "5" : "1",
  });
}

export function CafeMap({
  cafes,
  activeId = null,
  onSelect,
}: {
  cafes: Pin[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const els = useRef(new Map<string, HTMLElement>());
  const markerObjs = useRef<maplibregl.Marker[]>([]);
  const boundsRef = useRef<maplibregl.LngLatBounds | null>(null);
  const needsFit = useRef(false);
  const refitRef = useRef<(duration: number) => void>(() => {});
  const activeRef = useRef<string | null>(activeId);
  const selectRef = useRef(onSelect);

  useEffect(() => {
    selectRef.current = onSelect;
  });

  // create the map once
  useEffect(() => {
    const node = container.current;
    if (!node) return;

    const map = new maplibregl.Map({
      container: node,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [77.5946, 12.9716],
      zoom: 12,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    mapRef.current = map;

    refitRef.current = (duration) => {
      const b = boundsRef.current;
      if (!b || node.clientWidth === 0) {
        needsFit.current = !!b; // map is hidden right now; fit when it appears
        return;
      }
      map.fitBounds(b, { padding: 50, maxZoom: 16, duration });
      needsFit.current = false;
    };

    // the map can start hidden (phone list view), so resize when it shows up
    const ro = new ResizeObserver(() => {
      map.resize();
      if (needsFit.current) refitRef.current(0);
    });
    ro.observe(node);

    return () => {
      ro.disconnect();
      markerObjs.current.forEach((m) => m.remove());
      markerObjs.current = [];
      els.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // swap the pins whenever the list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const hadPins = markerObjs.current.length > 0;
    markerObjs.current.forEach((m) => m.remove());
    markerObjs.current = [];
    els.current.clear();

    if (cafes.length === 0) {
      boundsRef.current = null;
      return;
    }

    const bounds = new maplibregl.LngLatBounds();

    cafes.forEach((c) => {
      const el = document.createElement("div");
      paint(el, c.id === activeRef.current);
      el.addEventListener("click", () => selectRef.current?.(c.id));

      const link = document.createElement("a");
      link.href = `/cafes/${c.id}`;
      link.textContent = c.name;
      link.style.cssText = "font-weight:600;color:#2b1b14;text-decoration:none;";

      const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setDOMContent(link);

      markerObjs.current.push(
        new maplibregl.Marker({ element: el })
          .setLngLat([c.lng, c.lat])
          .setPopup(popup)
          .addTo(map)
      );
      els.current.set(c.id, el);
      bounds.extend([c.lng, c.lat]);
    });

    boundsRef.current = bounds;
    needsFit.current = true;
    refitRef.current(hadPins ? 500 : 0);
  }, [cafes]);

  // highlight the pin for the card being hovered
  useEffect(() => {
    activeRef.current = activeId;
    els.current.forEach((el, id) => paint(el, id === activeId));
  }, [activeId]);

  return <div ref={container} className="h-full w-full" />;
}