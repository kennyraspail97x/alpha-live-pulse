/**
 * Real-time local life engine.
 * Pure, deterministic, territory-agnostic: everything is derived from a
 * reference `now` Date passed by the caller (SSR-stable).
 */
import {
  HOME,
  distanceKm,
  driveMinutes,
  isOpen,
  placeById,
  places,
  priceLabel,
  userById,
  type MediaKey,
} from "@/data/alpha";
import {
  ACTIVE_TERRITORY,
  EVENT_CATEGORIES,
  activitySignals,
  availabilities,
  communityEvents,
  liveContents,
  organizerById,
  type CommunityEvent,
  type EventStatus,
  type GeoActivitySignal,
  type LiveContent,
} from "@/data/live-layer";

/* ---------------- time ---------------- */

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export interface EventWindow {
  start: Date;
  end: Date;
  minutesToStart: number;
  minutesToEnd: number;
}

export function eventWindow(ev: CommunityEvent, now: Date): EventWindow {
  const base = startOfDay(now);
  const start = new Date(base);
  start.setDate(start.getDate() + ev.dayOffset);
  start.setHours(0, 0, 0, 0);
  start.setMinutes(ev.startHour * 60);
  const end = new Date(base);
  end.setDate(end.getDate() + ev.dayOffset);
  end.setHours(0, 0, 0, 0);
  end.setMinutes(ev.endHour * 60);
  return {
    start,
    end,
    minutesToStart: Math.round((start.getTime() - now.getTime()) / 60000),
    minutesToEnd: Math.round((end.getTime() - now.getTime()) / 60000),
  };
}

export function eventStatus(ev: CommunityEvent, now: Date): EventStatus {
  if (ev.cancelled) return "cancelled";
  const w = eventWindow(ev, now);
  if (w.minutesToEnd <= 0) return "ended";
  if (w.minutesToStart <= 0) return "ongoing";
  if (ev.registrationMode !== "none" && ev.capacity !== null && ev.registered >= ev.capacity)
    return "full";
  if (ev.registrationMode !== "none") return "registrations_open";
  return "upcoming";
}

export const STATUS_META: Record<EventStatus, { label: string; tone: "live" | "primary" | "muted" | "danger" }> = {
  ongoing: { label: "En cours", tone: "live" },
  registrations_open: { label: "Inscriptions ouvertes", tone: "primary" },
  full: { label: "Complet", tone: "muted" },
  upcoming: { label: "À venir", tone: "muted" },
  ended: { label: "Terminé", tone: "muted" },
  cancelled: { label: "Annulé", tone: "danger" },
};

export function seatsLeft(ev: CommunityEvent) {
  if (ev.capacity === null) return null;
  return Math.max(0, ev.capacity - ev.registered);
}

export function formatClock(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatDay(d: Date, now: Date) {
  const diff = Math.round(
    (startOfDay(d).getTime() - startOfDay(now).getTime()) / 86_400_000,
  );
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  return d.toLocaleDateString(ACTIVE_TERRITORY.locale, { weekday: "long", day: "numeric", month: "short" });
}

export function relativeTimeLabel(ev: CommunityEvent, now: Date) {
  const w = eventWindow(ev, now);
  if (w.minutesToStart <= 0 && w.minutesToEnd > 0)
    return `Jusqu'à ${formatClock(w.end)}`;
  if (w.minutesToStart > 0 && w.minutesToStart <= 90)
    return `Commence dans ${w.minutesToStart} min`;
  return `${formatDay(w.start, now)} · ${formatClock(w.start)}`;
}

export const fmtPrice = (price: number) => (price === 0 ? "Gratuit" : `${price} €`);

/* ---------------- signal quality ---------------- */

export interface Signal {
  confidence: number;
  freshnessMinutes: number;
  label: string;
  level: GeoActivitySignal["observedLevel"];
  sources: GeoActivitySignal["sources"];
}

const LEVEL_LABEL: Record<GeoActivitySignal["observedLevel"], string> = {
  quiet: "Calme",
  steady: "Activité régulière",
  busy: "Animé",
  packed: "Très animé",
};

/**
 * Returns a signal ONLY when it is backed by fresh, real evidence.
 * Never infer activity from the mere existence of a place.
 */
export function placeSignal(placeId: string): Signal | null {
  const s = activitySignals.find((x) => x.placeId === placeId);
  if (!s) return null;
  if (s.confidence < 0.4) return null;
  if (s.freshnessMinutes > 180) return null;
  return {
    confidence: s.confidence,
    freshnessMinutes: s.freshnessMinutes,
    label: LEVEL_LABEL[s.observedLevel],
    level: s.observedLevel,
    sources: s.sources,
  };
}

export const availabilityFor = (refId: string) => availabilities.find((a) => a.refId === refId) ?? null;

export function availabilityLabel(refId: string): string | null {
  const a = availabilityFor(refId);
  if (!a) return null;
  if (a.slotsLeft === 0) return "Complet ce soir";
  if (a.slotsLeft === null) return null;
  return `${a.slotsLeft} places · confirmé il y a ${a.updatedMinutesAgo} min`;
}

export const isLiveActive = (l: LiveContent) => l.publishedMinutesAgo < l.ttlHours * 60;

/* ---------------- unified Now items ---------------- */

export type NowKind = "event" | "live" | "place";
export type NowStatus = "now" | "soon" | "today" | "later";
export type NowGroup = "Événements" | "Activités" | "Restaurants" | "Live";

export interface NowItem {
  id: string;
  kind: NowKind;
  refId: string;
  title: string;
  subtitle: string;
  media: MediaKey;
  lat: number;
  lng: number;
  locationLabel: string;
  km: number;
  minutes: number;
  timeLabel: string;
  status: NowStatus;
  statusLabel: string;
  priceLabel: string | null;
  availability: string | null;
  signal: Signal | null;
  group: NowGroup;
  categoryLabel: string;
  /** Sorting weight — higher first. */
  rank: number;
  isDemo: boolean;
}

const origin = HOME;

function eventToNowItem(ev: CommunityEvent, now: Date): NowItem | null {
  const status = eventStatus(ev, now);
  if (status === "ended" || status === "cancelled") return null;
  const w = eventWindow(ev, now);
  if (w.minutesToStart > 60 * 24 * 4) return null;
  const km = distanceKm(origin, ev);
  const ongoing = w.minutesToStart <= 0;
  const soon = w.minutesToStart > 0 && w.minutesToStart <= 180;
  const today = w.minutesToStart > 0 && startOfDay(w.start).getTime() === startOfDay(now).getTime();
  const org = organizerById(ev.organizerId);
  const cat = EVENT_CATEGORIES[ev.category];
  const left = seatsLeft(ev);
  return {
    id: `ev_${ev.id}`,
    kind: "event",
    refId: ev.id,
    title: ev.title,
    subtitle: org ? `Par ${org.name}` : cat.label,
    media: ev.media,
    lat: ev.lat,
    lng: ev.lng,
    locationLabel: ev.address,
    km,
    minutes: driveMinutes(km),
    timeLabel: relativeTimeLabel(ev, now),
    status: ongoing ? "now" : soon ? "soon" : today ? "today" : "later",
    statusLabel: ongoing
      ? "Maintenant"
      : soon
        ? "Commence bientôt"
        : today
          ? "Aujourd'hui"
          : formatDay(w.start, now),
    priceLabel: fmtPrice(ev.price),
    availability:
      ev.registrationMode === "none"
        ? null
        : left === null
          ? "Inscription libre"
          : left === 0
            ? `Complet · ${ev.waitlisted} en liste d'attente`
            : `${left} places restantes`,
    signal: ev.placeId ? placeSignal(ev.placeId) : null,
    group: cat.group,
    categoryLabel: cat.label,
    rank: (ongoing ? 300 : soon ? 220 : today ? 150 : 60) - Math.min(60, km),
    isDemo: ev.isDemo,
  };
}

function liveToNowItem(l: LiveContent, now: Date): NowItem | null {
  if (!isLiveActive(l)) return null;
  const p = l.placeId ? placeById(l.placeId) : undefined;
  const lat = p?.lat ?? origin.lat;
  const lng = p?.lng ?? origin.lng;
  const km = distanceKm(origin, { lat, lng });
  const author = userById(l.authorId);
  void now;
  return {
    id: `lv_${l.id}`,
    kind: "live",
    refId: l.id,
    title: l.caption,
    subtitle: author ? `@${author.username}` : "Live",
    media: l.media,
    lat,
    lng,
    locationLabel: p ? `${p.name} · ${p.town}` : "Lieu approximatif",
    km,
    minutes: driveMinutes(km),
    timeLabel: `Il y a ${l.publishedMinutesAgo} min`,
    status: "now",
    statusLabel: "En direct",
    priceLabel: null,
    availability: null,
    signal: l.placeId ? placeSignal(l.placeId) : null,
    group: "Live",
    categoryLabel: l.kind === "video" ? "Live vidéo" : "Live photo",
    rank: 320 - Math.min(60, km) - l.publishedMinutesAgo * 0.4,
    isDemo: l.isDemo,
  };
}

function placeToNowItem(placeId: string, now: Date): NowItem | null {
  const p = placeById(placeId);
  if (!p) return null;
  const signal = placeSignal(placeId);
  const avail = availabilityLabel(placeId);
  // No verified signal and no availability data → we say nothing about it.
  if (!signal && !avail) return null;
  const open = isOpen(p, now.getHours());
  if (!open) return null;
  const km = distanceKm(origin, p);
  return {
    id: `pl_${p.id}`,
    kind: "place",
    refId: p.id,
    title: p.name,
    subtitle: p.category,
    media: p.media,
    lat: p.lat,
    lng: p.lng,
    locationLabel: p.town,
    km,
    minutes: driveMinutes(km),
    timeLabel: `Ouvert jusqu'à ${p.closesAt % 24}h`,
    status: "now",
    statusLabel: signal?.label ?? "Ouvert",
    priceLabel: priceLabel(p.price),
    availability: avail,
    signal,
    group: p.category === "Eat & Drink" ? "Restaurants" : p.category === "Nightlife" ? "Événements" : "Activités",
    categoryLabel: p.category,
    rank: 120 + (signal ? signal.confidence * 80 : 0) - Math.min(60, km),
    isDemo: true,
  };
}

export function buildNowItems(now: Date): NowItem[] {
  const items: NowItem[] = [];
  for (const l of liveContents) {
    const i = liveToNowItem(l, now);
    if (i) items.push(i);
  }
  for (const ev of communityEvents) {
    const i = eventToNowItem(ev, now);
    if (i) items.push(i);
  }
  for (const p of places) {
    const i = placeToNowItem(p.id, now);
    if (i) items.push(i);
  }
  return items.sort((a, b) => b.rank - a.rank);
}

/** Items happening right now or starting within 3 hours. */
export const happeningNow = (items: NowItem[]) =>
  items.filter((i) => i.status === "now" || i.status === "soon");

/* ---------------- Tonight ---------------- */

export type TonightKey =
  | "Sortir"
  | "Manger"
  | "Boire"
  | "Danser"
  | "Activités"
  | "Live"
  | "Événements"
  | "En famille"
  | "Gratuit"
  | "Dernière minute";

export const TONIGHT_KEYS: TonightKey[] = [
  "Sortir",
  "Manger",
  "Boire",
  "Danser",
  "Activités",
  "Live",
  "Événements",
  "En famille",
  "Gratuit",
  "Dernière minute",
];

/** Items usable this evening (18h → 04h). */
export function buildTonightItems(now: Date): NowItem[] {
  const items: NowItem[] = [];
  for (const l of liveContents) {
    const i = liveToNowItem(l, now);
    if (i) items.push(i);
  }
  for (const ev of communityEvents) {
    const w = eventWindow(ev, now);
    const sameDay = startOfDay(w.start).getTime() === startOfDay(now).getTime();
    const evening = ev.endHour >= 18;
    if (!sameDay || !evening) continue;
    const i = eventToNowItem(ev, now);
    if (i) items.push(i);
  }
  for (const p of places) {
    if (p.closesAt < 21) continue;
    const i = placeToNowItem(p.id, now);
    if (i) items.push(i);
  }
  return items.sort((a, b) => b.rank - a.rank);
}

export function matchesTonight(item: NowItem, key: TonightKey, now: Date): boolean {
  const place = item.kind === "place" ? placeById(item.refId) : undefined;
  const ev = item.kind === "event" ? communityEvents.find((e) => e.id === item.refId) : undefined;
  switch (key) {
    case "Sortir":
      return item.group !== "Live";
    case "Manger":
      return item.group === "Restaurants" || ev?.category === "grillade";
    case "Boire":
      return place?.category === "Nightlife" || place?.category === "Eat & Drink";
    case "Danser":
      return place?.category === "Nightlife" || ev?.category === "nightlife" || ev?.category === "concert";
    case "Activités":
      return item.group === "Activités";
    case "Live":
      return item.kind === "live";
    case "Événements":
      return item.kind === "event";
    case "En famille":
      return ev?.category === "family" || place?.tags.includes("family") === true;
    case "Gratuit":
      return item.priceLabel === "Gratuit";
    case "Dernière minute":
      return item.status === "now" || item.status === "soon";
    default:
      void now;
      return true;
  }
}
