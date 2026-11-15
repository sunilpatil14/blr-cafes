"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Pin = { id: string; name: string; lat: number; lng: number };

export function CafeMap({ cafes }: { cafes: Pin[] }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  // create the map once
  useEffect(() => {
    if (!container.current) return;

    const map = new maplibregl.Map({
      container: container.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [77.5946, 12.9716],
      zoom: 12,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    mapRef.current = map;

    return () => {
      markers.current.forEach((m) => m.remove());
      markers.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // swap the pins whenever the list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markers.current.forEach((m) => m.remove());
    markers.current = [];
    if (cafes.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    cafes.forEach((c) => {
      const el = document.createElement("div");
      el.style.cssText =
        "width:16px;height:16px;border-radius:50%;background:#8b5a3c;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer;";

      const link = document.createElement("a");
      link.href = `/cafes/${c.id}`;
      link.textContent = c.name;
      link.style.cssText = "font-weight:600;color:#2b1b14;text-decoration:none;";

      const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setDOMContent(link);

      markers.current.push(
        new maplibregl.Marker({ element: el })
          .setLngLat([c.lng, c.lat])
          .setPopup(popup)
          .addTo(map)
      );
      bounds.extend([c.lng, c.lat]);
    });

    map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 400 });
  }, [cafes]);

  return <div ref={container} className="h-full w-full" />;
}