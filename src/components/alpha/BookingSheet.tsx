import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import type { AlphaEvent, Place, Stay } from "@/data/alpha";
import { useAlpha } from "@/lib/alpha-store";
import { Button, Chip } from "./ui";

const SLOTS = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const DAYS = ["Aujourd'hui", "Demain", "Samedi", "Dimanche"];

export function BookingSheet({
  place,
  event,
  stay,
  nights = 5,
  onClose,
}: {
  place?: Place;
  event?: AlphaEvent;
  stay?: Stay;
  nights?: number;
  onClose: () => void;
}) {
  const { addBooking } = useAlpha();
  const [day, setDay] = useState(DAYS[0]!);
  const [slot, setSlot] = useState(SLOTS[2]!);
  const [people, setPeople] = useState(2);
  const [done, setDone] = useState(false);

  const title = place?.name ?? event?.title ?? stay?.name ?? "Réservation";
  const unit = event ? event.price : stay ? stay.nightly * nights : place ? place.price * 25 : 0;
  const total = useMemo(
    () => (stay ? unit : Math.max(0, unit) * (event ? people : people)),
    [unit, people, event, stay],
  );

  const confirm = () => {
    addBooking({
      kind: stay ? "stay" : event ? "event" : "place",
      refId: stay?.id ?? event?.id ?? place?.id ?? "",
      title,
      subtitle: stay ? `${stay.town} · ${nights} nuits` : (place?.town ?? event?.organizer ?? ""),
      when: stay ? `${nights} nuits` : `${day} · ${slot}`,
      people,
      total,
      status: "upcoming",
    } as never);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-[520px] rounded-t-3xl bg-surface p-5 pb-8 alpha-hairline animate-alpha-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground alpha-glow">
              <Check className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-display text-[20px] font-semibold">Réservation confirmée</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {title} · {stay ? `${nights} nuits` : `${day} à ${slot}`} · {people} pers.
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Disponibilité simulée pour la démonstration.
            </p>
            <div className="mt-5 flex gap-2">
              <Link to="/bookings" className="flex-1" onClick={onClose}>
                <Button className="w-full">Voir mes réservations</Button>
              </Link>
              <Button variant="surface" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
            <h3 className="font-display text-[19px] font-semibold">{title}</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Disponibilités simulées — aucun paiement réel n'est effectué.
            </p>

            {!stay && (
              <>
                <p className="mt-4 mb-2 text-[12px] tracking-widest text-muted-foreground uppercase">Date</p>
                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                  {DAYS.map((d) => (
                    <Chip key={d} active={day === d} onClick={() => setDay(d)}>
                      {d}
                    </Chip>
                  ))}
                </div>
                <p className="mt-4 mb-2 text-[12px] tracking-widest text-muted-foreground uppercase">Heure</p>
                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                  {SLOTS.map((s) => (
                    <Chip key={s} active={slot === s} onClick={() => setSlot(s)}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </>
            )}

            <p className="mt-4 mb-2 text-[12px] tracking-widest text-muted-foreground uppercase">
              {stay ? "Voyageurs" : "Personnes"}
            </p>
            <div className="flex items-center gap-3">
              <Button variant="surface" size="sm" onClick={() => setPeople((p) => Math.max(1, p - 1))}>
                −
              </Button>
              <span className="w-8 text-center font-display text-lg">{people}</span>
              <Button variant="surface" size="sm" onClick={() => setPeople((p) => Math.min(12, p + 1))}>
                +
              </Button>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
              <span className="text-[13px] text-muted-foreground">Total estimé</span>
              <span className="font-display text-lg font-semibold">{total} €</span>
            </div>

            <Button className="mt-4 w-full" size="lg" onClick={confirm}>
              Confirmer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
