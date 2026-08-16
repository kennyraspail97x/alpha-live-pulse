import { useMemo } from "react";
import { HOME, distanceKm, events, lives, places, stays, stories } from "@/data/alpha";
import { cn } from "@/lib/utils";
import { LiveDot } from "./ui";

export type MapLayer = "LIVE" | "STORIES" | "PLACES" | "EVENTS" | "STAYS";

const BOUNDS = { minLat: 15.82, maxLat: 16.55, minLng: -61.85, maxLng: -61.0 };

function project(lat: number, lng: number) {
  return {
    left: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100,
    top: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100,
  };
}

export interface MapPin {
  id: string;
  kind: MapLayer;
  label: string;
  lat: number;
  lng: number;
  refId: string;
  meta?: string;
}

export function usePins(layer: MapLayer): MapPin[] {
  return useMemo(() => {
    if (layer === "LIVE")
      return lives.map((l) => {
        const p = places.find((x) => x.id === l.placeId)!;
        return { id: l.id, kind: layer, label: p.name, lat: p.lat, lng: p.lng, refId: l.id, meta: `${l.viewers} spectateurs` };
      });
    if (layer === "STORIES")
      return stories.map((s) => {
        const p = places.find((x) => x.id === s.placeId)!;
        return { id: s.id, kind: layer, label: p.name, lat: p.lat, lng: p.lng, refId: p.id, meta: `il y a ${s.minutesAgo} min` };
      });
    if (layer === "EVENTS")
      return events.map((e) => {
        const p = places.find((x) => x.id === e.placeId)!;
        return { id: e.id, kind: layer, label: e.title, lat: p.lat, lng: p.lng, refId: e.id, meta: e.day };
      });
    if (layer === "STAYS")
      return stays.map((s) => ({ id: s.id, kind: layer, label: s.name, lat: s.lat, lng: s.lng, refId: s.id, meta: `${s.nightly} €/nuit` }));
    return places.map((p) => ({ id: p.id, kind: layer, label: p.name, lat: p.lat, lng: p.lng, refId: p.id, meta: p.category }));
  }, [layer]);
}

export function AlphaMap({
  pins,
  selectedId,
  onSelect,
  className,
}: {
  pins: MapPin[];
  selectedId?: string;
  onSelect: (pin: MapPin) => void;
  className?: string;
}) {
  const me = project(HOME.lat, HOME.lng);
  return (
    <div className={cn("relative overflow-hidden bg-night", className)}>
      {/* stylised territory canvas */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 30% 20%, oklch(0.22 0.09 266) 0%, transparent 60%), radial-gradient(90% 80% at 75% 70%, oklch(0.2 0.07 250) 0%, transparent 65%)",
        }}
      />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.3 0.09 266)" />
            <stop offset="100%" stopColor="oklch(0.2 0.06 266)" />
          </linearGradient>
        </defs>
        {/* Basse-Terre */}
        <path
          d="M18 22 C10 34, 12 52, 22 66 C28 76, 34 86, 40 82 C46 76, 44 60, 40 48 C36 34, 30 20, 24 18 Z"
          fill="url(#land)"
          stroke="oklch(0.55 0.2 260 / 40%)"
          strokeWidth="0.4"
        />
        {/* Grande-Terre */}
        <path
          d="M42 20 C52 12, 70 14, 78 24 C84 32, 80 44, 70 50 C58 58, 46 52, 42 42 Z"
          fill="url(#land)"
          stroke="oklch(0.55 0.2 260 / 40%)"
          strokeWidth="0.4"
        />
        {/* Marie-Galante / Les Saintes / Désirade */}
        <circle cx="86" cy="72" r="5" fill="url(#land)" stroke="oklch(0.55 0.2 260 / 40%)" strokeWidth="0.4" />
        <circle cx="55" cy="88" r="3" fill="url(#land)" stroke="oklch(0.55 0.2 260 / 40%)" strokeWidth="0.4" />
        <circle cx="94" cy="30" r="3" fill="url(#land)" stroke="oklch(0.55 0.2 260 / 40%)" strokeWidth="0.4" />
      </svg>

      {/* me */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${me.left}%`, top: `${me.top}%` }}>
        <span className="relative flex h-3 w-3">
          <span className="absolute h-3 w-3 rounded-full bg-accent animate-alpha-pulse" />
          <span className="relative h-3 w-3 rounded-full bg-accent alpha-hairline" />
        </span>
      </div>

      {pins.map((pin) => {
        const pos = project(pin.lat, pin.lng);
        const active = pin.id === selectedId;
        return (
          <button
            key={pin.id}
            onClick={() => onSelect(pin)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
          >
            {pin.kind === "LIVE" ? (
              <span className="relative grid place-items-center">
                <span className="absolute h-6 w-6 rounded-full bg-live/60 animate-alpha-pulse" />
                <span className="relative inline-flex items-center gap-1 rounded-full bg-live px-2 py-1 text-[10px] font-bold text-live-foreground">
                  <LiveDot /> LIVE
                </span>
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex max-w-[130px] items-center rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap transition-all",
                  active
                    ? "bg-primary text-primary-foreground alpha-glow"
                    : "bg-background/75 text-foreground backdrop-blur-md alpha-hairline",
                )}
              >
                <span className="truncate">{pin.label}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export const nearest = (lat: number, lng: number) =>
  [...places].sort((a, b) => distanceKm({ lat, lng }, a) - distanceKm({ lat, lng }, b));
