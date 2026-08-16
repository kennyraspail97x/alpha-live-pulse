import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, Ticket } from "lucide-react";
import { useState } from "react";
import { BookingSheet } from "@/components/alpha/BookingSheet";
import { Button, Tag } from "@/components/alpha/ui";
import { HOME, MEDIA, distanceKm, driveMinutes, eventById, lives, placeById } from "@/data/alpha";
import { useAlpha } from "@/lib/alpha-store";

export const Route = createFileRoute("/event/$id")({
  loader: ({ params }) => {
    const event = eventById(params.id);
    if (!event) throw notFound();
    return { title: event.title, description: event.description };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.title} — Alpha Places` },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: loaderData.title },
            { property: "og:description", content: loaderData.description },
          ],
        }
      : { meta: [{ title: "Événement indisponible" }, { name: "robots", content: "noindex" }] },
  component: EventPage,
});

function EventPage() {
  const { id } = useParams({ from: "/event/$id" });
  const event = eventById(id)!;
  const place = placeById(event.placeId)!;
  const { interested, toggleInterested } = useAlpha();
  const [booking, setBooking] = useState(false);
  const km = distanceKm(HOME, place);
  const live = lives.find((l) => l.eventId === event.id);
  const going = interested.includes(event.id);

  return (
    <div className="animate-alpha-rise pb-8">
      <div className="relative h-[46vh]">
        <img src={MEDIA[event.media]} alt={event.title} width={1024} height={1280} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/50" />
        <Link to="/" aria-label="Retour" className="absolute top-5 left-4 grid h-10 w-10 place-items-center rounded-full bg-background/60 backdrop-blur-md alpha-hairline">
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div className="absolute right-5 bottom-5 left-5">
          <div className="mb-2 flex gap-2">
            <Tag tone="primary">{event.day}</Tag>
            <Tag>{event.category}</Tag>
          </div>
          <h1 className="font-display text-[25px] leading-tight font-semibold">{event.title}</h1>
          <p className="mt-1.5 text-[12px] text-muted-foreground">Organisé par {event.organizer}</p>
        </div>
      </div>

      <div className="space-y-3 px-5 pt-5">
        <div className="flex items-center gap-2 text-[13px]">
          <CalendarDays className="h-4 w-4 text-primary" /> {event.day} · {event.startHour % 24}h00 –{" "}
          {event.endHour % 24}h00
        </div>
        <Link to="/place/$id" params={{ id: place.id }} className="flex items-center gap-2 text-[13px]">
          <MapPin className="h-4 w-4 text-primary" /> {place.name} · {km.toFixed(1)} km ·{" "}
          {driveMinutes(km)} min
        </Link>
        <div className="flex items-center gap-2 text-[13px]">
          <Ticket className="h-4 w-4 text-primary" />
          {event.price === 0 ? "Entrée libre" : `${event.price} €`} · {event.ticketsLeft} places restantes
          (simulé)
        </div>
        <p className="pt-2 text-[14px] leading-relaxed text-foreground/90">{event.description}</p>
        <p className="text-[12px] text-muted-foreground">{event.interested} personnes intéressées</p>

        {live && (
          <Link to="/live/$id" params={{ id: live.id }} className="block rounded-2xl bg-live/15 p-4 alpha-hairline">
            <p className="text-[13px] font-medium text-live">Live en cours depuis le lieu</p>
            <p className="text-[12px] text-muted-foreground">{live.title}</p>
          </Link>
        )}

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={() => setBooking(true)}>
            {event.price === 0 ? "Je participe" : "Acheter un billet"}
          </Button>
          <Button variant="surface" onClick={() => toggleInterested(event.id)}>
            {going ? "Intéressé ✓" : "Intéressé"}
          </Button>
        </div>
      </div>

      {booking && <BookingSheet event={event} onClose={() => setBooking(false)} />}
    </div>
  );
}
