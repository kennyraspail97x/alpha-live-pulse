import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookingSheet } from "@/components/alpha/BookingSheet";
import { StayCard } from "@/components/alpha/cards";
import { Button, Chip } from "@/components/alpha/ui";
import { stays, type Stay } from "@/data/alpha";

export const Route = createFileRoute("/stays")({
  head: () => ({
    meta: [
      { title: "Alpha Stays — hébergements en Guadeloupe" },
      {
        name: "description",
        content: "Villas, hôtels, appartements et cases créoles en Guadeloupe, prix total affiché clairement.",
      },
      { property: "og:title", content: "Alpha Stays — hébergements en Guadeloupe" },
      { property: "og:description", content: "Villas, hôtels et cases créoles avec prix total transparent." },
    ],
  }),
  component: StaysPage,
});

const TYPES = ["Tous", "Villa", "Hotel", "Apartment", "Guest house"];

function StaysPage() {
  const [type, setType] = useState("Tous");
  const [nights, setNights] = useState(5);
  const [guests, setGuests] = useState(4);
  const [selected, setSelected] = useState<Stay | null>(null);

  const list = useMemo(
    () => stays.filter((s) => (type === "Tous" || s.type === type) && s.guests >= guests - 2),
    [type, guests],
  );

  return (
    <div className="animate-alpha-rise">
      <header className="px-5 pt-6">
        <h1 className="font-display text-[26px] font-semibold">Alpha Stays</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Guadeloupe · {nights} nuits · {guests} voyageurs
        </p>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>
              {t}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="surface" size="sm" onClick={() => setNights((n) => Math.max(1, n - 1))}>
            − nuit
          </Button>
          <Button variant="surface" size="sm" onClick={() => setNights((n) => n + 1)}>
            + nuit
          </Button>
          <Button variant="surface" size="sm" onClick={() => setGuests((g) => Math.max(1, g - 1))}>
            − voyageur
          </Button>
          <Button variant="surface" size="sm" onClick={() => setGuests((g) => g + 1)}>
            + voyageur
          </Button>
        </div>
      </header>

      <div className="mt-5 space-y-4 px-5">
        {list.map((s) => (
          <div key={s.id}>
            <StayCard stay={s} nights={nights} />
            <Button className="mt-2 w-full" onClick={() => setSelected(s)}>
              Réserver · {s.nightly * nights} €
            </Button>
          </div>
        ))}
        <p className="pb-4 text-center text-[11px] text-muted-foreground">
          Disponibilités et prix simulés pour la démonstration.
        </p>
      </div>

      {selected && (
        <BookingSheet stay={selected} nights={nights} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
