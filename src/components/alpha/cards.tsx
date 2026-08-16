import { Link } from "@tanstack/react-router";
import { Bookmark, MapPin, Star } from "lucide-react";
import {
  HOME,
  MEDIA,
  distanceKm,
  driveMinutes,
  fmtAgo,
  priceLabel,
  placeById,
  userById,
  type AlphaEvent,
  type Live,
  type Place,
  type Stay,
} from "@/data/alpha";
import { useAlpha } from "@/lib/alpha-store";
import { cn } from "@/lib/utils";
import { Avatar, LiveDot, Tag } from "./ui";

export function PlaceCard({ place, wide }: { place: Place; wide?: boolean }) {
  const { saved, toggleSave } = useAlpha();
  const km = distanceKm(HOME, place);
  const isSaved = saved.includes(place.id);
  return (
    <div className={cn("relative shrink-0", wide ? "w-full" : "w-[73vw] max-w-[300px]")}>
      <Link
        to="/place/$id"
        params={{ id: place.id }}
        className="block overflow-hidden rounded-3xl bg-surface alpha-hairline"
      >
        <div className="relative aspect-[4/5]">
          <img
            src={MEDIA[place.media]}
            alt={place.name}
            loading="lazy"
            width={1024}
            height={1280}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Tag>{place.category}</Tag>
            {place.activity === "Very active" && <Tag tone="primary">Très animé</Tag>}
          </div>
          <div className="absolute right-0 bottom-0 left-0 p-4">
            <h3 className="font-display text-[17px] leading-tight font-semibold">{place.name}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" /> {place.rating}
              </span>
              <span>{priceLabel(place.price)}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {km.toFixed(1)} km · {driveMinutes(km)} min
              </span>
            </div>
          </div>
        </div>
      </Link>
      <button
        aria-label="Enregistrer"
        onClick={() => toggleSave(place.id)}
        className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/55 backdrop-blur-md alpha-hairline transition-transform active:scale-90"
      >
        <Bookmark className={cn("h-4 w-4", isSaved && "fill-primary text-primary")} />
      </button>
    </div>
  );
}

export function PlaceRow({ place }: { place: Place }) {
  const km = distanceKm(HOME, place);
  return (
    <Link
      to="/place/$id"
      params={{ id: place.id }}
      className="flex gap-3 rounded-2xl bg-surface p-2.5 alpha-hairline"
    >
      <img
        src={MEDIA[place.media]}
        alt={place.name}
        loading="lazy"
        width={1024}
        height={1280}
        className="h-20 w-20 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="truncate font-display text-[15px] font-semibold">{place.name}</h3>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
          {place.category} · {place.town}
        </p>
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          ★ {place.rating} · {priceLabel(place.price)} · {driveMinutes(km)} min
        </p>
      </div>
    </Link>
  );
}

export function LiveCard({ live }: { live: Live }) {
  const place = placeById(live.placeId)!;
  const author = userById(live.authorId)!;
  const km = distanceKm(HOME, place);
  return (
    <Link
      to="/live/$id"
      params={{ id: live.id }}
      className="relative block w-[62vw] max-w-[240px] shrink-0 overflow-hidden rounded-3xl bg-surface alpha-hairline"
    >
      <div className="relative aspect-[9/14]">
        <img
          src={MEDIA[live.media]}
          alt={live.title}
          loading="lazy"
          width={1024}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-live px-2 py-1 text-[10px] font-bold tracking-widest text-live-foreground uppercase">
          <LiveDot /> Live
        </div>
        <div className="absolute top-3 right-3 rounded-full bg-background/60 px-2 py-1 text-[11px] backdrop-blur-md">
          {live.viewers.toLocaleString("fr-FR")}
        </div>
        <div className="absolute right-0 bottom-0 left-0 p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <Avatar initials={author.initials} size={26} />
            <span className="truncate text-[12px] font-medium">{author.name}</span>
          </div>
          <p className="text-[13px] leading-snug font-medium">{live.title}</p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {place.name} · {km.toFixed(1)} km
          </p>
        </div>
      </div>
    </Link>
  );
}

export function EventCard({ event }: { event: AlphaEvent }) {
  const place = placeById(event.placeId)!;
  return (
    <Link
      to="/event/$id"
      params={{ id: event.id }}
      className="block w-[80vw] max-w-[330px] shrink-0 overflow-hidden rounded-3xl bg-surface alpha-hairline"
    >
      <div className="relative aspect-[16/10]">
        <img
          src={MEDIA[event.media]}
          alt={event.title}
          loading="lazy"
          width={1024}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        <div className="absolute top-3 left-3">
          <Tag tone="primary">{event.day}</Tag>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-[16px] leading-tight font-semibold">{event.title}</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {place.name} · {event.startHour % 24}h00
        </p>
        <p className="mt-2 text-[12px]">
          {event.price === 0 ? "Entrée libre" : `Dès ${event.price} €`} ·{" "}
          <span className="text-muted-foreground">{event.interested} intéressés</span>
        </p>
      </div>
    </Link>
  );
}

export function StayCard({ stay, nights = 5 }: { stay: Stay; nights?: number }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-surface alpha-hairline">
      <div className="relative aspect-[16/11]">
        <img
          src={MEDIA[stay.media]}
          alt={stay.name}
          loading="lazy"
          width={1024}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Tag>{stay.type}</Tag>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[16px] font-semibold">{stay.name}</h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {stay.town} · {stay.guests} voyageurs · {stay.bedrooms} ch.
            </p>
          </div>
          <span className="text-[12px] text-muted-foreground">★ {stay.rating}</span>
        </div>
        <p className="mt-3 text-[13px]">
          <span className="font-display text-lg font-semibold">{stay.nightly} €</span>
          <span className="text-muted-foreground"> / nuit · {stay.nightly * nights} € au total ({nights} nuits)</span>
        </p>
      </div>
    </div>
  );
}

export function StoryBubble({
  initials,
  label,
  live,
  onClick,
  seen,
}: {
  initials: string;
  label: string;
  live?: boolean;
  seen?: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-[68px] shrink-0 text-center">
      <span
        className={cn(
          "grid h-16 w-16 place-items-center rounded-full p-[2px]",
          live
            ? "bg-live"
            : seen
              ? "bg-muted"
              : "bg-gradient-to-tr from-primary to-accent",
        )}
      >
        <span className="grid h-full w-full place-items-center rounded-full bg-background">
          <Avatar initials={initials} size={54} />
        </span>
      </span>
      <span className="mt-1.5 block truncate text-[11px] text-muted-foreground">{label}</span>
    </button>
  );
}

export function ago(min: number) {
  return fmtAgo(min);
}
