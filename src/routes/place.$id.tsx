import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Clock,
  MapPin,
  Navigation,
  Share2,
  Star,
} from "lucide-react";
import { useState } from "react";
import { EventCard, LiveCard } from "@/components/alpha/cards";
import { BookingSheet } from "@/components/alpha/BookingSheet";
import { Avatar, Button, LiveDot, Tag } from "@/components/alpha/ui";
import {
  HOME,
  MEDIA,
  distanceKm,
  driveMinutes,
  events,
  isOpen,
  lives,
  placeById,
  priceLabel,
  stories,
  userById,
} from "@/data/alpha";
import { useAlpha } from "@/lib/alpha-store";
import { useNowContext } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/place/$id")({
  loader: ({ params }) => {
    const place = placeById(params.id);
    if (!place) throw notFound();
    return { name: place.name, description: place.description, town: place.town };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Lieu indisponible — Alpha Places" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.name}, ${loaderData.town} — Alpha Places`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
      ],
    };
  },
  component: PlacePage,
});

function PlacePage() {
  const { id } = useParams({ from: "/place/$id" });
  const place = placeById(id)!;
  const ctx = useNowContext();
  const { saved, followedPlaces, toggleSave, toggleFollowPlace, checkIn } = useAlpha();
  const [booking, setBooking] = useState(false);

  const km = distanceKm(HOME, place);
  const open = isOpen(place, Math.floor(ctx.hour));
  const live = lives.find((l) => l.placeId === place.id);
  const placeStories = stories.filter((s) => s.placeId === place.id);
  const placeEvents = events.filter((e) => e.placeId === place.id);
  const isSaved = saved.includes(place.id);
  const isFollowed = followedPlaces.includes(place.id);

  return (
    <div className="animate-alpha-rise pb-6">
      <div className="relative h-[52vh]">
        <img
          src={MEDIA[place.media]}
          alt={place.name}
          width={1024}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/60" />
        <Link
          to="/"
          aria-label="Retour"
          className="absolute top-5 left-4 grid h-10 w-10 place-items-center rounded-full bg-background/60 backdrop-blur-md alpha-hairline"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div className="absolute top-5 right-4 flex gap-2">
          <button
            onClick={() => toggleSave(place.id)}
            aria-label="Enregistrer"
            className="grid h-10 w-10 place-items-center rounded-full bg-background/60 backdrop-blur-md alpha-hairline"
          >
            <Bookmark className={cn("h-4.5 w-4.5", isSaved && "fill-primary text-primary")} />
          </button>
          <button
            aria-label="Partager"
            className="grid h-10 w-10 place-items-center rounded-full bg-background/60 backdrop-blur-md alpha-hairline"
          >
            <Share2 className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="absolute right-5 bottom-5 left-5">
          <div className="mb-2 flex gap-2">
            <Tag>{place.category}</Tag>
            {live && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-live px-2 py-[3px] text-[11px] font-bold text-live-foreground uppercase">
                <LiveDot /> Live
              </span>
            )}
          </div>
          <h1 className="flex items-center gap-2 font-display text-[26px] leading-tight font-semibold">
            {place.name}
            {place.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> {place.rating} ({place.reviews})
            </span>
            <span>{priceLabel(place.price)}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {place.town} · {km.toFixed(1)} km · {driveMinutes(km)} min
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[12px]">
            <span className={cn("inline-flex items-center gap-1", open ? "text-accent" : "text-muted-foreground")}>
              <Clock className="h-3 w-3" /> {open ? "Ouvert" : "Fermé"} · {place.opensAt}h–
              {place.closesAt % 24}h
            </span>
            <span className="rounded-full bg-surface px-2 py-[2px] text-[11px] alpha-hairline">
              {place.activity}
            </span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 flex gap-2 bg-background/90 px-5 py-3 backdrop-blur-xl">
        <Button className="flex-1" onClick={() => setBooking(true)}>
          {place.cta === "Go" ? "Y aller" : place.cta === "Book" ? "Réserver" : place.cta === "Buy Ticket" ? "Billet" : "Réserver"}
        </Button>
        <Button variant="surface" onClick={() => toggleFollowPlace(place.id)}>
          {isFollowed ? "Suivi" : "Suivre"}
        </Button>
        <Button variant="surface" aria-label="Itinéraire">
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {live && (
        <section className="mt-2 px-5">
          <div className="no-scrollbar flex gap-3 overflow-x-auto">
            <LiveCard live={live} />
            {placeStories.map((s) => {
              const author = userById(s.authorId)!;
              return (
                <div key={s.id} className="w-[62vw] max-w-[240px] shrink-0 overflow-hidden rounded-3xl bg-surface alpha-hairline">
                  <img src={MEDIA[s.media]} alt={s.caption} loading="lazy" width={1024} height={1280} className="aspect-[9/14] w-full object-cover" />
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={author.initials} size={24} />
                      <span className="text-[12px]">{author.name}</span>
                    </div>
                    <p className="mt-1.5 text-[12px] text-muted-foreground">{s.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-5 px-5">
        <p className="text-[14px] leading-relaxed text-foreground/90">{place.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {place.amenities.map((a) => (
            <span key={a} className="rounded-full bg-surface px-3 py-1.5 text-[12px] alpha-hairline">
              {a}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="rounded-2xl bg-surface p-4 alpha-hairline">
          <p className="text-[13px] font-medium">Vous y êtes ?</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Le check-in est facultatif et agrégé — personne ne voit votre position exacte.
          </p>
          <div className="mt-3 flex gap-2">
            {["Privé", "Amis", "Public"].map((v) => (
              <Button key={v} size="sm" variant="surface" onClick={() => checkIn(place.id, v)}>
                Je suis là · {v}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {placeEvents.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 px-5 font-display text-[18px] font-semibold">Événements à venir</h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
            {placeEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-7 px-5">
        <h2 className="mb-3 font-display text-[18px] font-semibold">Situation</h2>
        <div className="h-40 overflow-hidden rounded-2xl bg-night alpha-hairline">
          <div className="grid h-full place-items-center text-[12px] text-muted-foreground">
            {place.lat.toFixed(4)}, {place.lng.toFixed(4)} · {place.town}
          </div>
        </div>
      </section>

      {booking && <BookingSheet place={place} onClose={() => setBooking(false)} />}
    </div>
  );
}
