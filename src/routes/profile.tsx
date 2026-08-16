import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PlaceRow } from "@/components/alpha/cards";
import { Avatar, Button, Chip, Stat } from "@/components/alpha/ui";
import { MEDIA, collections, placeById, users } from "@/data/alpha";
import { useAlpha } from "@/lib/alpha-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Mon profil — Alpha Places" },
      {
        name: "description",
        content: "Vos lieux enregistrés, collections, voyages, réservations et réglages de confidentialité.",
      },
      { property: "og:title", content: "Mon profil — Alpha Places" },
      { property: "og:description", content: "Identité sociale, collections et confidentialité." },
    ],
  }),
  component: ProfilePage,
});

const TABS = ["Enregistrés", "Collections", "Confidentialité"] as const;

function ProfilePage() {
  const me = users[0]!;
  const { saved, followedPlaces, trips, bookings, locationVisibility, setLocationVisibility } = useAlpha();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Enregistrés");

  return (
    <div className="animate-alpha-rise px-5 pt-6 pb-6">
      <div className="flex items-center gap-4">
        <Avatar initials={me.initials} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[20px] font-semibold">{me.name}</h1>
          <p className="text-[12px] text-muted-foreground">@{me.username}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">{me.bio}</p>
        </div>
      </div>

      <div className="mt-5 flex justify-around rounded-2xl bg-surface py-3 alpha-hairline">
        <Stat value={me.followers} label="Abonnés" />
        <Stat value={followedPlaces.length} label="Lieux suivis" />
        <Stat value={saved.length} label="Enregistrés" />
        <Stat value={trips.length} label="Voyages" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link to="/bookings">
          <Button variant="surface" className="w-full">
            Réservations ({bookings.length})
          </Button>
        </Link>
        <Link to="/trips">
          <Button variant="surface" className="w-full">
            Mes voyages
          </Button>
        </Link>
      </div>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Chip>
        ))}
      </div>

      {tab === "Enregistrés" && (
        <div className="mt-4 space-y-2">
          {saved.length === 0 && (
            <p className="rounded-2xl bg-surface p-5 text-center text-[13px] text-muted-foreground alpha-hairline">
              Aucun lieu enregistré. Touchez le signet sur une fiche lieu.
            </p>
          )}
          {saved.map((id) => {
            const p = placeById(id);
            return p ? <PlaceRow key={id} place={p} /> : null;
          })}
        </div>
      )}

      {tab === "Collections" && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {collections.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-2xl bg-surface alpha-hairline">
              <img
                src={MEDIA[c.cover]}
                alt={c.title}
                loading="lazy"
                width={1024}
                height={1280}
                className="h-24 w-full object-cover"
              />
              <div className="p-3">
                <p className="text-[13px] font-medium">{c.title}</p>
                <p className="text-[11px] text-muted-foreground">{c.placeIds.length} lieux</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Confidentialité" && (
        <div className="mt-4 rounded-2xl bg-surface p-5 alpha-hairline">
          <p className="text-[13px] font-medium">Visibilité de ma position</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Votre position précise n'est jamais publique. Vous choisissez ce que les autres voient.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["invisible", "friends", "followers", "public"] as const).map((v) => (
              <Chip key={v} active={locationVisibility === v} onClick={() => setLocationVisibility(v)}>
                {v === "invisible"
                  ? "Invisible"
                  : v === "friends"
                    ? "Amis"
                    : v === "followers"
                      ? "Abonnés"
                      : "Public (niveau lieu)"}
              </Chip>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Alpha Places Connect (outils pro), paiements et messagerie arriveront dans une prochaine étape.
          </p>
        </div>
      )}
    </div>
  );
}
