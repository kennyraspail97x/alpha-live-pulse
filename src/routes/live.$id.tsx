import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { ArrowLeft, Eye, Navigation } from "lucide-react";
import { Avatar, Button, LiveDot } from "@/components/alpha/ui";
import { HOME, MEDIA, distanceKm, fmtAgo, liveById, placeById, userById } from "@/data/alpha";

export const Route = createFileRoute("/live/$id")({
  loader: ({ params }) => {
    const live = liveById(params.id);
    if (!live) throw notFound();
    return { title: live.title, place: placeById(live.placeId)!.name };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `Live · ${loaderData.title} — Alpha Places` },
            { name: "description", content: `En direct depuis ${loaderData.place}, Guadeloupe.` },
            { property: "og:title", content: `Live · ${loaderData.title}` },
            { property: "og:description", content: `En direct depuis ${loaderData.place}.` },
          ],
        }
      : { meta: [{ title: "Live indisponible" }, { name: "robots", content: "noindex" }] },
  component: LivePage,
});

function LivePage() {
  const { id } = useParams({ from: "/live/$id" });
  const live = liveById(id)!;
  const place = placeById(live.placeId)!;
  const author = userById(live.authorId)!;
  const km = distanceKm(HOME, place);

  return (
    <div className="fixed inset-0 mx-auto max-w-[520px] bg-background">
      <img src={MEDIA[live.media]} alt={live.title} width={1024} height={1280} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background" />

      <Link to="/" aria-label="Retour" className="absolute top-5 left-4 grid h-10 w-10 place-items-center rounded-full bg-background/60 backdrop-blur-md alpha-hairline">
        <ArrowLeft className="h-4.5 w-4.5" />
      </Link>
      <div className="absolute top-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[11px] font-bold text-live-foreground uppercase">
          <LiveDot /> Live
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2.5 py-1 text-[11px] backdrop-blur-md">
          <Eye className="h-3 w-3" /> {live.viewers.toLocaleString("fr-FR")}
        </span>
      </div>

      <div className="absolute right-4 bottom-28 left-4">
        <div className="flex items-center gap-3">
          <Avatar initials={author.initials} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{author.name}</p>
            <p className="truncate text-[12px] text-muted-foreground">
              {place.name} · {km.toFixed(1)} km · depuis {fmtAgo(live.startedMinutesAgo)}
            </p>
          </div>
        </div>
        <p className="mt-3 font-display text-[19px] leading-snug font-semibold">{live.title}</p>
        <div className="mt-4 flex gap-2">
          <Link to="/place/$id" params={{ id: place.id }} className="flex-1">
            <Button className="w-full">Voir le lieu</Button>
          </Link>
          <Button variant="surface" aria-label="Itinéraire">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Flux vidéo simulé pour la démonstration.
        </p>
      </div>
    </div>
  );
}
