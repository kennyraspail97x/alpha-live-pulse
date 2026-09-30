import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { usePins, type MapLayer } from "@/components/alpha/AlphaMap";
import { PlaceRow } from "@/components/alpha/cards";
import { Chip } from "@/components/alpha/ui";
import { HOME, distanceKm, driveMinutes, eventById, liveById, placeById, places } from "@/data/alpha";

const InteractiveMap = lazy(() => import("@/components/alpha/InteractiveMap").then(m => ({ default: m.InteractiveMap })));

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Carte vivante de la Guadeloupe — Alpha Places" },
      {
        name: "description",
        content:
          "La carte du monde réel : lives en cours, stories, lieux animés, événements du jour et séjours disponibles.",
      },
      { property: "og:title", content: "Carte vivante — Alpha Places" },
      {
        property: "og:description",
        content: "Voyez le battement de cœur du territoire en temps réel.",
      },
    ],
  }),
  component: MapPage,
});

const LAYERS: MapLayer[] = ["LIVE", "STORIES", "PLACES", "EVENTS", "STAYS"];

function MapPage() {
  const [layer, setLayer] = useState<MapLayer>("LIVE");
  const [selected, setSelected] = useState<string | null>(null);
  const pins = usePins(layer);
  const [center, setCenter] = useState(HOME);
  const [area, setArea] = useState(HOME);
  const selectPin = useCallback((p: {id: string}) => setSelected(p.id), []);

  const nearbyPlaces = useMemo(
    () =>
      [...places]
        .sort((a, b) => distanceKm(area, a) - distanceKm(area, b))
        .slice(0, 8),
    [area],
  );

  const selectedPin = pins.find((p) => p.id === selected);

  return (
    <div className="relative">
      <div className="fixed inset-x-0 top-0 z-10 mx-auto h-[62vh] max-w-[520px]">
        <Suspense fallback={<div className="h-full bg-night" />}><InteractiveMap pins={pins} selectedId={selected ?? undefined} onSelect={selectPin} onMove={setCenter} /></Suspense>
        <div className="no-scrollbar absolute top-5 right-4 left-4 flex gap-2 overflow-x-auto">
          {LAYERS.map((l) => (
            <Chip key={l} active={layer === l} onClick={() => { setLayer(l); setSelected(null); }}>
              {l}
            </Chip>
          ))}
        </div>
        <div className="absolute bottom-[12%] left-4 flex gap-2"><Chip onClick={() => { navigator.geolocation?.getCurrentPosition(position => { const pos = { lat: position.coords.latitude, lng: position.coords.longitude }; setCenter(pos); setArea(pos); }, () => {}); }}>Me localiser</Chip><Chip onClick={() => setArea(center)}>Rechercher dans cette zone</Chip></div>
      </div>

      <div className="relative z-20 mt-[56vh] min-h-[60vh] rounded-t-[28px] bg-background pt-2 pb-6 alpha-hairline">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />

        {selectedPin && (
          <div className="mx-5 mb-4 rounded-2xl bg-surface p-4 alpha-hairline animate-alpha-rise">
            <p className="text-[11px] tracking-widest text-muted-foreground uppercase">{selectedPin.kind}</p>
            <h3 className="mt-1 font-display text-[17px] font-semibold">{selectedPin.label}</h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {selectedPin.meta} · {distanceKm(HOME, selectedPin).toFixed(1)} km ·{" "}
              {driveMinutes(distanceKm(HOME, selectedPin))} min
            </p>
            <div className="mt-3">
              {selectedPin.kind === "LIVE" && liveById(selectedPin.refId) && (
                <Link
                  to="/live/$id"
                  params={{ id: selectedPin.refId }}
                  className="inline-flex h-10 items-center rounded-full bg-live px-5 text-[13px] font-medium text-live-foreground"
                >
                  Regarder le live
                </Link>
              )}
              {selectedPin.kind === "EVENTS" && eventById(selectedPin.refId) && (
                <Link
                  to="/event/$id"
                  params={{ id: selectedPin.refId }}
                  className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-[13px] font-medium text-primary-foreground"
                >
                  Voir l'événement
                </Link>
              )}
              {(selectedPin.kind === "PLACES" || selectedPin.kind === "STORIES") &&
                placeById(selectedPin.refId) && (
                  <Link
                    to="/place/$id"
                    params={{ id: selectedPin.refId }}
                    className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-[13px] font-medium text-primary-foreground"
                  >
                    Voir le lieu
                  </Link>
                )}
              {selectedPin.kind === "STAYS" && (
                <Link
                  to="/stays"
                  className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-[13px] font-medium text-primary-foreground"
                >
                  Voir le séjour
                </Link>
              )}
            </div>
          </div>
        )}

        <h2 className="px-5 font-display text-[18px] font-semibold">Autour de vous</h2>
        <p className="px-5 text-[12px] text-muted-foreground">
          Position de référence : {HOME.town}. Votre position précise reste privée.
        </p>
        <div className="mt-3 space-y-2 px-5">
          {nearbyPlaces.map((p) => (
            <PlaceRow key={p.id} place={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
