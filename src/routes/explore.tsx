import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { EventCard, LiveCard, PlaceRow } from "@/components/alpha/cards";
import { Chip, SectionTitle } from "@/components/alpha/ui";
import { MEDIA, events, lives, places, stays, users } from "@/data/alpha";
import { recommend } from "@/lib/alpha-context";
import { useNowContext } from "@/lib/use-now";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explorer la Guadeloupe — Alpha Places" },
      {
        name: "description",
        content:
          "Plages, tables créoles, expériences, nightlife, culture et hébergements : explorez la Guadeloupe par intention.",
      },
      { property: "og:title", content: "Explorer la Guadeloupe — Alpha Places" },
      {
        property: "og:description",
        content: "Recherche universelle : lieux, événements, lives, séjours et personnes.",
      },
    ],
  }),
  component: ExplorePage,
});

const INTENTS = [
  { label: "Live Now", tags: [] as string[], live: true },
  { label: "Ce soir", tags: ["night"] },
  { label: "Famille", tags: ["family"] },
  { label: "Couples", tags: ["couples"] },
  { label: "Entre amis", tags: ["friends"] },
  { label: "Gratuit", tags: ["free"] },
  { label: "Lieux cachés", tags: ["hidden"] },
  { label: "Coucher de soleil", tags: ["sunset"] },
];

const CATEGORIES = [
  { key: "Eat & Drink", media: "restaurant" as const },
  { key: "Beaches", media: "beach" as const },
  { key: "Experiences", media: "nature" as const },
  { key: "Nightlife", media: "nightlife" as const },
  { key: "Nature", media: "nature" as const },
  { key: "Culture", media: "restaurant" as const },
  { key: "Stays", media: "stay" as const },
];

/** Lightweight natural-language matcher — placeholder for the AI search service. */
function nlSearch(q: string) {
  const s = q.toLowerCase();
  const wants = (...w: string[]) => w.some((x) => s.includes(x));
  const tags: string[] = [];
  let category: string | undefined;
  if (wants("plage", "beach", "mer")) category = "Beaches";
  if (wants("restaurant", "manger", "table", "créole", "creole")) category = "Eat & Drink";
  if (wants("sortir", "soir", "club", "boîte", "nuit", "concert")) category = "Nightlife";
  if (wants("rando", "cascade", "nature", "forêt")) category = "Nature";
  if (wants("enfant", "famille", "kids")) tags.push("family");
  if (wants("calme", "tranquille", "désert")) tags.push("calm");
  if (wants("vue mer", "vue")) tags.push("seaview");
  if (wants("gratuit", "sans budget")) tags.push("free");
  if (wants("coucher", "sunset")) tags.push("sunset");
  return { tags, category };
}

function ExplorePage() {
  const ctx = useNowContext();
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const parsed = useMemo(() => nlSearch(query), [query]);
  const activeIntent = INTENTS.find((i) => i.label === intent);

  const results = useMemo(() => {
    const tags = [...(activeIntent?.tags ?? []), ...parsed.tags];
    const cat = category ?? parsed.category;
    let list = recommend(ctx, { tags, category: cat, limit: 40 });
    if (query.trim()) {
      const q = query.toLowerCase();
      const direct = list.filter(
        (r) =>
          r.place.name.toLowerCase().includes(q) ||
          r.place.town.toLowerCase().includes(q) ||
          r.place.description.toLowerCase().includes(q),
      );
      if (direct.length) list = direct;
    }
    return list.slice(0, 14);
  }, [ctx, activeIntent, parsed, category, query]);

  const searching = query.trim().length > 0 || intent !== null || category !== null;

  const peopleHits = query.trim()
    ? users.filter((u) => (u.name + u.username).toLowerCase().includes(query.toLowerCase()))
    : [];
  const eventHits = query.trim()
    ? events.filter((e) => e.title.toLowerCase().includes(query.toLowerCase()))
    : [];
  const stayHits = query.trim()
    ? stays.filter((s) => (s.name + s.town).toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="animate-alpha-rise">
      <header className="sticky top-0 z-20 bg-background/90 px-5 pt-6 pb-3 backdrop-blur-xl">
        <h1 className="font-display text-[26px] font-semibold">Explorer</h1>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-surface px-4 alpha-hairline">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="restaurant créole avec vue mer…"
            className="h-11 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Effacer">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {INTENTS.map((i) => (
            <Chip
              key={i.label}
              active={intent === i.label}
              onClick={() => setIntent(intent === i.label ? null : i.label)}
            >
              {i.label}
            </Chip>
          ))}
        </div>
      </header>

      {intent === "Live Now" ? (
        <section className="mt-4">
          <SectionTitle title="En direct maintenant" hint={`${lives.length} lives actifs`} />
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
            {lives.map((l) => (
              <LiveCard key={l.id} live={l} />
            ))}
          </div>
        </section>
      ) : null}

      {!searching && (
        <section className="mt-4 px-5">
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="relative h-28 overflow-hidden rounded-2xl text-left alpha-hairline"
              >
                <img
                  src={MEDIA[c.media]}
                  alt={c.key}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <span className="absolute bottom-3 left-3 font-display text-[15px] font-semibold">
                  {c.key}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {searching && (
        <div className="mt-4 space-y-2 px-5">
          {category && (
            <Chip active onClick={() => setCategory(null)}>
              {category} ✕
            </Chip>
          )}
          {peopleHits.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-[11px] tracking-widest text-muted-foreground uppercase">Personnes</p>
              {peopleHits.map((u) => (
                <div key={u.id} className="mb-2 rounded-2xl bg-surface px-4 py-3 text-[13px] alpha-hairline">
                  {u.name} <span className="text-muted-foreground">@{u.username}</span>
                </div>
              ))}
            </div>
          )}
          {eventHits.length > 0 && (
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pt-2">
              {eventHits.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
          {stayHits.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-[11px] tracking-widest text-muted-foreground uppercase">Séjours</p>
              {stayHits.map((s) => (
                <Link
                  key={s.id}
                  to="/stays"
                  className="mb-2 block rounded-2xl bg-surface px-4 py-3 text-[13px] alpha-hairline"
                >
                  {s.name} · {s.nightly} €/nuit
                </Link>
              ))}
            </div>
          )}
          <p className="pt-2 text-[11px] tracking-widest text-muted-foreground uppercase">
            {results.length} lieux
          </p>
          {results.map(({ place }) => (
            <PlaceRow key={place.id} place={place} />
          ))}
          {results.length === 0 && (
            <p className="py-8 text-center text-[13px] text-muted-foreground">
              Aucun lieu ne correspond. Essayez « plage calme » ou « sortir ce soir ».
            </p>
          )}
        </div>
      )}

      {!searching && (
        <section className="mt-8">
          <SectionTitle title="Tendances en Guadeloupe" hint="Activité en hausse cette semaine" />
          <div className="space-y-2 px-5">
            {places
              .filter((p) => p.activity === "Very active" || p.activity === "Popular now")
              .slice(0, 6)
              .map((p) => (
                <PlaceRow key={p.id} place={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
