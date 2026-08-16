import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Chip } from "@/components/alpha/ui";
import { useAlpha } from "@/lib/alpha-store";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Mes réservations — Alpha Places" },
      { name: "description", content: "Vos tables, billets, expériences et séjours réservés en Guadeloupe." },
      { property: "og:title", content: "Mes réservations — Alpha Places" },
      { property: "og:description", content: "Tables, billets, expériences et séjours au même endroit." },
    ],
  }),
  component: BookingsPage,
});

const TABS = ["À venir", "Terminées", "Annulées"] as const;

function BookingsPage() {
  const { bookings, cancelBooking } = useAlpha();
  const [tab, setTab] = useState<(typeof TABS)[number]>("À venir");

  const filtered = bookings.filter((b) =>
    tab === "À venir" ? b.status === "upcoming" : tab === "Terminées" ? b.status === "completed" : b.status === "cancelled",
  );

  return (
    <div className="animate-alpha-rise px-5 pt-6">
      <h1 className="font-display text-[26px] font-semibold">Réservations</h1>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-surface p-6 text-center alpha-hairline">
            <p className="text-[14px]">Rien ici pour l'instant.</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Réservez une table, un billet ou un séjour depuis un lieu.
            </p>
            <Link to="/explore">
              <Button className="mt-4">Explorer</Button>
            </Link>
          </div>
        )}
        {filtered.map((b) => (
          <div key={b.id} className="rounded-2xl bg-surface p-4 alpha-hairline">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-[16px] font-semibold">{b.title}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{b.subtitle}</p>
                <p className="mt-2 text-[13px]">
                  {b.when} · {b.people} pers. · {b.total} €
                </p>
              </div>
              <span className="rounded-full bg-surface-2 px-2 py-1 text-[10px] tracking-wide uppercase">
                {b.kind}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="surface">
                Itinéraire
              </Button>
              <Button size="sm" variant="surface">
                Billet / QR
              </Button>
              {b.status === "upcoming" && (
                <Button size="sm" variant="ghost" onClick={() => cancelBooking(b.id)}>
                  Annuler
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 pb-4 text-center text-[11px] text-muted-foreground">
        Réservations de démonstration — aucun partenaire n'est encore connecté.
      </p>
    </div>
  );
}
