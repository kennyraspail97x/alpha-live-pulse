import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button, Chip, SectionTitle } from "@/components/alpha/ui";
import { places } from "@/data/alpha";
import { useAlpha, type Trip, type TripDay } from "@/lib/alpha-store";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "Voyages & budget — Alpha Places" },
      {
        name: "description",
        content:
          "Planifiez votre séjour en Guadeloupe : budget total estimé, itinéraire jour par jour et réservations.",
      },
      { property: "og:title", content: "Voyages & budget — Alpha Places" },
      { property: "og:description", content: "Budget de voyage complet et itinéraire intelligent." },
    ],
  }),
  component: TripsPage,
});

type Comfort = Trip["comfort"];
const COMFORTS: Comfort[] = ["Economy", "Best Value", "Comfort", "Premium"];

const MULT: Record<Comfort, number> = {
  Economy: 0.75,
  "Best Value": 1,
  Comfort: 1.35,
  Premium: 1.9,
};

function computeTrip(nights: number, adults: number, children: number, comfort: Comfort) {
  const travelers = adults + children;
  const m = MULT[comfort];
  const transport = Math.round(travelers * 520 * (comfort === "Premium" ? 1.6 : comfort === "Comfort" ? 1.2 : 1));
  const stay = Math.round(nights * 120 * m * Math.max(1, Math.ceil(travelers / 4)));
  const mobility = Math.round(nights * 45 * (comfort === "Economy" ? 0.8 : 1));
  const food = Math.round(nights * travelers * 38 * m);
  const activities = Math.round(nights * travelers * 22 * m);
  const eventsCost = Math.round(travelers * 25);
  const other = Math.round((transport + stay + food) * 0.05);
  const breakdown = { Transport: transport, Séjour: stay, Mobilité: mobility, Restauration: food, Activités: activities, Événements: eventsCost, Autres: other };
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { breakdown, total };
}

function buildItinerary(nights: number): TripDay[] {
  const pool = places.filter((p) => p.category !== "Stays");
  const days: TripDay[] = [];
  for (let d = 0; d < Math.min(nights, 5); d++) {
    const morning = pool[(d * 3) % pool.length]!;
    const lunch = pool.filter((p) => p.category === "Eat & Drink")[d % 5]!;
    const afternoon = pool[(d * 5 + 2) % pool.length]!;
    const dinner = pool.filter((p) => p.category === "Eat & Drink")[(d + 2) % 5]!;
    days.push({
      label: `Jour ${d + 1}`,
      items: [
        { id: `${d}-1`, time: "09:30", title: morning.name, placeId: morning.id, cost: morning.price * 15 },
        { id: `${d}-2`, time: "12:30", title: `Déjeuner · ${lunch.name}`, placeId: lunch.id, cost: 28 },
        { id: `${d}-3`, time: "15:00", title: afternoon.name, placeId: afternoon.id, cost: afternoon.price * 20 },
        { id: `${d}-4`, time: "20:00", title: `Dîner · ${dinner.name}`, placeId: dinner.id, cost: 42 },
      ],
    });
  }
  return days;
}

function TripsPage() {
  const { trips, addTrip, removeTrip, updateTrip } = useAlpha();
  const [nights, setNights] = useState(6);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [budget, setBudget] = useState(4000);
  const [comfort, setComfort] = useState<Comfort>("Best Value");

  const preview = useMemo(() => computeTrip(nights, adults, children, comfort), [nights, adults, children, comfort]);
  const options = useMemo(
    () => COMFORTS.map((c) => ({ comfort: c, ...computeTrip(nights, adults, children, c) })),
    [nights, adults, children],
  );

  const create = () =>
    addTrip({
      destination: "Guadeloupe",
      start: "Prochain séjour",
      end: `${nights} nuits`,
      nights,
      adults,
      children,
      budget,
      comfort,
      breakdown: preview.breakdown,
      total: preview.total,
      days: buildItinerary(nights),
    });

  return (
    <div className="animate-alpha-rise pb-6">
      <header className="px-5 pt-6">
        <h1 className="font-display text-[26px] font-semibold">Voyages</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Budget complet, itinéraire jour par jour, réservations.
        </p>
      </header>

      <section className="mt-5 px-5">
        <div className="rounded-3xl bg-surface p-5 alpha-hairline">
          <h2 className="font-display text-[18px] font-semibold">Nouveau voyage · Guadeloupe</h2>

          <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <Counter label="Nuits" value={nights} onChange={setNights} min={1} />
            <Counter label="Adultes" value={adults} onChange={setAdults} min={1} />
            <Counter label="Enfants" value={children} onChange={setChildren} min={0} />
            <div>
              <p className="mb-1 text-[11px] tracking-widest text-muted-foreground uppercase">Budget</p>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="h-10 w-full rounded-xl bg-surface-2 px-3 text-[14px] outline-none"
              />
            </div>
          </div>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
            {COMFORTS.map((c) => (
              <Chip key={c} active={comfort === c} onClick={() => setComfort(c)}>
                {c}
              </Chip>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-gradient-to-br from-ultramarine to-surface-2 p-4">
            <p className="text-[11px] tracking-widest text-accent uppercase">Coût total estimé</p>
            <p className="mt-1 font-display text-[32px] leading-none font-semibold">
              {preview.total.toLocaleString("fr-FR")} €
            </p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Budget restant : {(budget - preview.total).toLocaleString("fr-FR")} €
            </p>
          </div>

          <div className="mt-4 space-y-1.5">
            {Object.entries(preview.breakdown).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 text-[13px]">
                <span className="w-28 text-muted-foreground">{k}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${Math.round((v / preview.total) * 100)}%` }}
                  />
                </span>
                <span className="w-16 text-right">{v.toLocaleString("fr-FR")} €</span>
              </div>
            ))}
          </div>

          <Button className="mt-5 w-full" size="lg" onClick={create}>
            Créer le voyage et l'itinéraire
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Estimations calculées à partir de tarifs moyens simulés.
          </p>
        </div>
      </section>

      <section className="mt-7">
        <SectionTitle title="Comparer les formules" hint="Même durée, même groupe" />
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
          {options.map((o) => (
            <button
              key={o.comfort}
              onClick={() => setComfort(o.comfort)}
              className="w-40 shrink-0 rounded-2xl bg-surface p-4 text-left alpha-hairline"
            >
              <p className="text-[12px] text-muted-foreground">{o.comfort}</p>
              <p className="mt-1 font-display text-[20px] font-semibold">
                {o.total.toLocaleString("fr-FR")} €
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {Math.round(o.total / nights).toLocaleString("fr-FR")} € / nuit
              </p>
            </button>
          ))}
        </div>
      </section>

      {trips.length > 0 && (
        <section className="mt-8 px-5">
          <h2 className="font-display text-[18px] font-semibold">Mes voyages</h2>
          <div className="mt-3 space-y-4">
            {trips.map((t) => (
              <div key={t.id} className="rounded-3xl bg-surface p-5 alpha-hairline">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-[17px] font-semibold">{t.destination}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {t.nights} nuits · {t.adults + t.children} voyageurs · {t.comfort}
                    </p>
                  </div>
                  <p className="font-display text-[18px] font-semibold">
                    {t.total.toLocaleString("fr-FR")} €
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {t.days.map((d) => (
                    <div key={d.label}>
                      <p className="text-[11px] tracking-widest text-muted-foreground uppercase">{d.label}</p>
                      <div className="mt-1.5 space-y-1.5">
                        {d.items.map((it) => (
                          <div key={it.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
                            <span className="w-11 text-[12px] text-muted-foreground">{it.time}</span>
                            {it.placeId ? (
                              <Link
                                to="/place/$id"
                                params={{ id: it.placeId }}
                                className="min-w-0 flex-1 truncate text-[13px]"
                              >
                                {it.title}
                              </Link>
                            ) : (
                              <span className="min-w-0 flex-1 truncate text-[13px]">{it.title}</span>
                            )}
                            <span className="text-[12px] text-muted-foreground">{it.cost} €</span>
                            <button
                              aria-label="Retirer"
                              className="text-[12px] text-muted-foreground"
                              onClick={() =>
                                updateTrip(t.id, {
                                  days: t.days.map((dd) =>
                                    dd.label === d.label
                                      ? { ...dd, items: dd.items.filter((x) => x.id !== it.id) }
                                      : dd,
                                  ),
                                })
                              }
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to="/stays" className="flex-1">
                    <Button className="w-full" size="sm">
                      Ajouter un séjour
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => removeTrip(t.id)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 px-5">
        <Link to="/bookings">
          <Button variant="surface" className="w-full">
            Mes réservations
          </Button>
        </Link>
      </section>
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] tracking-widest text-muted-foreground uppercase">{label}</p>
      <div className="flex h-10 items-center justify-between rounded-xl bg-surface-2 px-3">
        <button onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <span className="text-[14px]">{value}</span>
        <button onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}
