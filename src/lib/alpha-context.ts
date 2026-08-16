import {
  HOME,
  distanceKm,
  driveMinutes,
  isOpen,
  places,
  type Place,
} from "@/data/alpha";

export interface TimeContext {
  hour: number;
  label: string;
  weather: string;
  temp: number;
  sunsetIn: number | null;
  dayName: string;
}

export function getTimeContext(now: Date): TimeContext {
  const hour = now.getHours() + now.getMinutes() / 60;
  const label =
    hour < 6
      ? "Nuit"
      : hour < 11
        ? "Matin"
        : hour < 14
          ? "Midi"
          : hour < 17
            ? "Après-midi"
            : hour < 20
              ? "Fin de journée"
              : "Soirée";
  const sunset = 18.4;
  const sunsetIn = hour < sunset ? Math.round((sunset - hour) * 60) : null;
  return {
    hour,
    label,
    weather: hour >= 14 && hour < 16 ? "Averse passagère" : "Ciel dégagé",
    temp: hour < 7 || hour > 20 ? 25 : 29,
    sunsetIn,
    dayName: now.toLocaleDateString("fr-FR", { weekday: "long" }),
  };
}

export interface Scored {
  place: Place;
  score: number;
  km: number;
  minutes: number;
  open: boolean;
}

/** Isolated recommendation service — deterministic scoring. */
export function recommend(
  ctx: TimeContext,
  opts: {
    maxMinutes?: number | undefined;
    tags?: string[] | undefined;
    category?: string | undefined;
    origin?: { lat: number; lng: number };
    limit?: number;
  } = {},
): Scored[] {
  const origin = opts.origin ?? HOME;
  const hourInt = Math.floor(ctx.hour);
  const activityWeight: Record<Place["activity"], number> = {
    Calm: 0,
    "Getting busy": 6,
    "Popular now": 12,
    "Very active": 16,
  };

  const scored = places
    .map((place) => {
      const km = distanceKm(origin, place);
      const minutes = driveMinutes(km);
      const open = isOpen(place, hourInt);
      let score = 100;
      score -= Math.min(45, minutes * 0.9);
      if (open) score += 18;
      else score -= 30;
      score += place.rating * 6;
      score += activityWeight[place.activity];
      if (opts.tags?.length) {
        const hits = opts.tags.filter((t) => place.tags.includes(t)).length;
        score += hits * 14;
        if (!hits) score -= 12;
      }
      if (opts.category && place.category !== opts.category) score -= 200;
      if (opts.maxMinutes) {
        const round = minutes * 2 + place.duration;
        if (round > opts.maxMinutes) score -= 200;
        else score += 12;
      }
      if (ctx.hour >= 20 && place.category === "Beaches") score -= 25;
      if (ctx.hour < 17 && place.category === "Nightlife") score -= 40;
      if (ctx.weather.includes("Averse") && place.tags.includes("free")) score -= 8;
      return { place, score, km, minutes, open };
    })
    .filter((s) => s.score > -50)
    .sort((a, b) => b.score - a.score);

  return opts.limit ? scored.slice(0, opts.limit) : scored;
}

export interface AlphaMoment {
  title: string;
  body: string;
  placeId: string;
  cta: string;
}

export function alphaMoment(ctx: TimeContext): AlphaMoment {
  if (ctx.weather.includes("Averse")) {
    const pick = recommend(ctx, { category: "Culture", limit: 1 })[0];
    return {
      title: "Averse dans 20 minutes",
      body: `Repli à l'abri : ${pick?.place.name ?? "Fort Delgrès"} à ${pick?.minutes ?? 20} min.`,
      placeId: pick?.place.id ?? "p12",
      cta: "Voir le lieu",
    };
  }
  if (ctx.sunsetIn !== null && ctx.sunsetIn < 90) {
    return {
      title: `Coucher de soleil dans ${ctx.sunsetIn} min`,
      body: "Grande Anse est orientée plein ouest — partez maintenant pour y être à temps.",
      placeId: "p3",
      cta: "Y aller",
    };
  }
  if (ctx.hour >= 20) {
    return {
      title: "La soirée démarre",
      body: "L'activité augmente fortement à la Marina et à Zoukland. 2 lives en cours.",
      placeId: "p18",
      cta: "Voir l'ambiance",
    };
  }
  return {
    title: "Bon moment pour la mer",
    body: "Lagon calme et affluence faible à Bois Jolan pendant encore 2 heures.",
    placeId: "p2",
    cta: "Y aller",
  };
}
