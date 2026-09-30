import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, CircleHelp, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { DemoMedia } from "@/components/alpha/DemoMedia";
import { Button } from "@/components/alpha/ui";
import { HOME, distanceKm, driveMinutes, placeById, places } from "@/data/alpha";

export const Route = createFileRoute("/experience/$id")({
  loader: ({ params }) => { const place = placeById(params.id); if (!place) throw notFound(); return { name: place.name }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `Vivre ça · ${loaderData?.name ?? "Expérience"} — Alpha Places` },
    { name: "description", content: "Vérifiez ce qu'il faut savoir avant de vivre cette expérience en Guadeloupe." },
    { property: "og:title", content: `Vivre ça · ${loaderData?.name ?? "Expérience"}` },
    { property: "og:description", content: "Dates, distance, budget et disponibilité : gardez le choix avant de partir." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { id } = useParams({ from: "/experience/$id" });
  const place = placeById(id);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState("");
  if (!place) return null;
  const km = distanceKm(HOME, place);
  const similar = places.filter(p => p.id !== id && p.category === place.category).slice(0, 2);
  const direction = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  return <main className="animate-alpha-rise pb-8">
    <div className="relative h-48 bg-surface-2"><DemoMedia label={place.name} /><Link to="/place/$id" params={{ id }} aria-label="Retour au lieu" className="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-background/80"><ArrowLeft className="h-5 w-5" /></Link></div>
    <div className="px-5 pt-6">
      <p className="text-xs font-semibold uppercase text-accent">Vivre ça · Démo</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">{place.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{place.town} · {km.toFixed(1)} km depuis {HOME.town} · environ {driveMinutes(km)} min de trajet estimé</p>
      <div className="mt-7 border-y border-border py-5">
        <h2 className="font-display text-lg font-semibold">Votre projet</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs text-muted-foreground">Date souhaitée<input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-2 text-sm text-foreground" /></label>
          <label className="text-xs text-muted-foreground">Personnes<input type="number" min="1" max="20" value={people} onChange={e => setPeople(Math.max(1, Number(e.target.value)))} className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground" /></label>
          <label className="col-span-2 text-xs text-muted-foreground">Budget total envisagé (€)<input type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Facultatif" className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground" /></label>
        </div>
      </div>
      <h2 className="mt-6 font-display text-lg font-semibold">Ce qu’Alpha peut vérifier</h2>
      <div className="mt-4 space-y-4 text-sm">
        <p className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-accent" /> <span>Lieu identifié et trajet indicatif depuis {HOME.town}.</span></p>
        <p className="flex gap-3"><Users className="h-5 w-5 shrink-0 text-muted-foreground" /> <span>Groupe de {people} personne{people > 1 ? "s" : ""}{date ? ` · date demandée : ${date}` : " · date à préciser"}.</span></p>
        <p className="flex gap-3"><CircleHelp className="h-5 w-5 shrink-0 text-muted-foreground" /> <span>Prix réel, disponibilité, horaires et conditions météo : non communiqués. {budget ? `Impossible de confirmer le respect de votre budget de ${budget} €.` : "Ajoutez un budget pour préparer votre choix."}</span></p>
      </div>
      <div className="mt-7 border-t border-border pt-5">
        <p className="text-sm font-medium">Réservation impossible pour l’instant</p>
        <p className="mt-1 text-xs text-muted-foreground">Aucun établissement ni paiement n’est connecté. Le contenu ancien ne prouve jamais une place disponible aujourd’hui.</p>
        <a href={direction} target="_blank" rel="noopener noreferrer" className="mt-4 block"><Button className="w-full" size="lg"><MapPin className="h-4 w-4" /> Voir l’itinéraire</Button></a>
      </div>
      {similar.length > 0 && <section className="mt-8"><h2 className="font-display text-lg font-semibold">Dans le même esprit</h2><div className="mt-3 divide-y divide-border">{similar.map(p => <Link key={p.id} to="/experience/$id" params={{ id: p.id }} className="block py-3 text-sm">{p.name}<span className="block text-xs text-muted-foreground">{p.town} · disponibilité à confirmer</span></Link>)}</div></section>}
    </div>
  </main>;
}
