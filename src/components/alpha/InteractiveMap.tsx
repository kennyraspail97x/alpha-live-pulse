import { useEffect, useRef } from "react";
import type { MapPin } from "./AlphaMap";
import { HOME } from "@/data/alpha";

export function InteractiveMap({ pins, selectedId, onSelect, onMove }: { pins: MapPin[]; selectedId?: string; onSelect: (pin: MapPin) => void; onMove: (center: {lat: number; lng: number}) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").LayerGroup | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  useEffect(() => {
    let active = true;
    let teardown: (() => void) | undefined;
    import("leaflet").then(L => {
      if (!active || !container.current) return;
      const map = L.map(container.current, { zoomControl: false, attributionControl: true }).setView([HOME.lat, HOME.lng], 11);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', maxZoom: 19 }).addTo(map);
      const markers = L.layerGroup().addTo(map);
      mapRef.current = map;
      markersRef.current = markers;
      map.on("moveend", () => { const c = map.getCenter(); onMoveRef.current({ lat: c.lat, lng: c.lng }); });
      teardown = () => { map.remove(); mapRef.current = null; markersRef.current = null; };
    });
    return () => { active = false; teardown?.(); };
  }, []);
  useEffect(() => {
    let active = true;
    import("leaflet").then(L => {
      const markers = markersRef.current;
      if (!active || !markers) return;
      markers.clearLayers();
      const occupied = new Map<string, MapPin[]>();
      pins.forEach(pin => { const key = `${pin.lat.toFixed(2)}:${pin.lng.toFixed(2)}`; occupied.set(key, [...(occupied.get(key) ?? []), pin]); });
      occupied.forEach(group => {
        const pin = group.find(p => p.id === selectedId) ?? group[0];
        if (!pin) return;
        const color = pin.kind === "LIVE" ? "var(--live)" : pin.kind === "EVENTS" ? "var(--accent)" : "var(--primary)";
        const icon = L.divIcon({ className: "alpha-map-pin", html: `<span style="background:${color}">${group.length > 1 ? group.length : pin.kind === "LIVE" ? "●" : "•"}</span>`, iconSize: [34,34], iconAnchor: [17,17] });
        L.marker([pin.lat, pin.lng], {icon, title: group.length > 1 ? `${group.length} points proches` : pin.label}).on("click", () => onSelect(pin)).addTo(markers);
      });
    });
    return () => { active = false; };
  }, [pins, selectedId, onSelect]);
  return <div ref={container} className="h-full w-full" aria-label="Carte interactive de Guadeloupe" />;
}
