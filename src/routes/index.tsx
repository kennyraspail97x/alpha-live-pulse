import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, CloudSun, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EventCard, LiveCard, PlaceCard, StoryBubble } from "@/components/alpha/cards";
import { StoryViewer } from "@/components/alpha/StoryViewer";
import { Button, Chip, LiveDot, SectionTitle } from "@/components/alpha/ui";
import { HOME, events, lives, placeById, stories, userById } from "@/data/alpha";
import { alphaMoment, recommend } from "@/lib/alpha-context";
import { useNowContext } from "@/lib/use-now";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Now — Alpha Places Guadeloupe" },
      {
        name: "description",
        content:
          "Ce qui se passe maintenant autour de vous en Guadeloupe : lives, stories, lieux animés, événements du soir et réservations.",
      },
      { property: "og:title", content: "Now — Alpha Places Guadeloupe" },
      {
        property: "og:description",
        content: "Lives, stories et lieux vivants autour de vous, en temps réel.",
      },
    ],
  }),
  component: NowPage,
});

const DURATIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 h", minutes: 60 },
  { label: "2 h", minutes: 120 },
  { label: "Demi-journée", minutes: 300 },
  { label: "Journée", minutes: 600 },
  { label: "Ce soir", minutes: 240 },
];

function NowPage() {
  const ctx = useNowContext();
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const moment = useMemo(() => alphaMoment(ctx), [ctx]);
  const momentPlace = placeById(moment.placeId)!;
  const nearby = useMemo(() => recommend(ctx, { limit: 6 }), [ctx]);
  const tonight = useMemo(
    () => recommend(ctx, { tags: ["night", "dinner"], limit: 5 }),
    [ctx],
  );
  const iHave = useMemo(
    () => (duration ? recommend(ctx, { maxMinutes: duration, limit: 4 }) : []),
    [ctx, duration],
  );

  const hour = Math.floor(ctx.hour);
  const minute = Math.round((ctx.hour - hour) * 60);

  return (
    <div className="animate-alpha-rise">
      {storyIndex !== null && (
        <StoryViewer storyList={stories} startIndex={storyIndex} onClose={() => setStoryIndex(null)} />
      )}

      <header className="px-5 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {HOME.town}, {HOME.territory}
            </p>
            <h1 className="mt-1 font-display text-[28px] leading-tight font-semibold">
              {ctx.label}, {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
            </h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <CloudSun className="h-3.5 w-3.5" /> {ctx.weather} · {ctx.temp}°
              {ctx.sunsetIn !== null && ` · coucher de soleil dans ${ctx.sunsetIn} min`}
            </p>
          </div>
          <Link to="/explore" aria-label="Rechercher" className="grid h-11 w-11 place-items-center rounded-full bg-surface alpha-hairline">
            <Search className="h-4.5 w-4.5" />
          </Link>
        </div>
      </header>

      {/* Alpha Moment */}
      <section className="mt-5 px-5">
        <Link
          to="/place/$id"
          params={{ id: momentPlace.id }}
          className="block rounded-3xl bg-gradient-to-br from-ultramarine to-surface p-5 alpha-glow"
        >
          <p className="text-[10px] font-bold tracking-[0.18em] text-accent uppercase">Alpha Moment</p>
          <h2 className="mt-2 font-display text-[19px] leading-snug font-semibold">{moment.title}</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">{moment.body}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-foreground">
            {moment.cta} <ChevronRight className="h-4 w-4" />
          </span>
        </Link>
      </section>

      {/* Stories */}
      <section className="mt-6">
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
          {stories.map((s, i) => {
            const author = userById(s.authorId)!;
            const place = placeById(s.placeId)!;
            return (
              <StoryBubble
                key={s.id}
                initials={author.initials}
                label={place.town}
                live={lives.some((l) => l.placeId === s.placeId)}
                onClick={() => setStoryIndex(i)}
              />
            );
          })}
        </div>
      </section>

      {/* Lives */}
      <section className="mt-7">
        <SectionTitle
          title="En direct près de vous"
          hint={`${lives.length} lives · rayon 30 km`}
          action={
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-live uppercase">
              <LiveDot /> Live
            </span>
          }
        />
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
          {lives.map((l) => (
            <LiveCard key={l.id} live={l} />
          ))}
        </div>
      </section>

      {/* I have… */}
      <section className="mt-8">
        <SectionTitle title="J'ai…" hint="On calcule le trajet aller-retour et les horaires" />
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5">
          {DURATIONS.map((d) => (
            <Chip
              key={d.label}
              active={duration === d.minutes}
              onClick={() => setDuration(duration === d.minutes ? null : d.minutes)}
            >
              {d.label}
            </Chip>
          ))}
        </div>
        {duration && (
          <div className="mt-3 space-y-2 px-5">
            {iHave.length === 0 && (
              <p className="text-[13px] text-muted-foreground">
                Rien de réaliste dans ce créneau depuis {HOME.town}. Essayez une durée plus longue.
              </p>
            )}
            {iHave.map(({ place, minutes }) => (
              <Link
                key={place.id}
                to="/place/$id"
                params={{ id: place.id }}
                className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 alpha-hairline"
              >
                <div>
                  <p className="text-[14px] font-medium">{place.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {minutes} min de trajet · {place.duration} min sur place
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular nearby */}
      <section className="mt-8">
        <SectionTitle title="Ça bouge autour de vous" hint="Classé par proximité, horaires et activité" />
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
          {nearby.map(({ place }) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      {/* Tonight */}
      <section className="mt-8">
        <SectionTitle title="Ce soir en Guadeloupe" hint="Événements et lieux ouverts tard" />
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
          {events.slice(0, 3).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      {/* Friends */}
      <section className="mt-8 px-5">
        <h2 className="font-display text-[19px] font-semibold">Vos amis explorent</h2>
        <div className="mt-3 space-y-2">
          {tonight.slice(0, 3).map(({ place }, i) => {
            const friend = userById(`u${i + 2}`)!;
            return (
              <Link
                key={place.id}
                to="/place/$id"
                params={{ id: place.id }}
                className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 alpha-hairline"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ultramarine text-[11px] font-semibold">
                  {friend.initials}
                </span>
                <p className="min-w-0 flex-1 truncate text-[13px]">
                  <span className="font-medium">{friend.name}</span>{" "}
                  <span className="text-muted-foreground">est à {place.name}</span>
                </p>
                <span className="text-[11px] text-muted-foreground">niveau lieu</span>
              </Link>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Position partagée au niveau du lieu uniquement, selon les réglages de chacun.
        </p>
      </section>

      <section className="mt-8 px-5">
        <Link to="/map">
          <Button className="w-full" size="lg">
            Ouvrir la carte vivante
          </Button>
        </Link>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Prototype de démonstration — contenus, lives et disponibilités simulés.
        </p>
      </section>
    </div>
  );
}
