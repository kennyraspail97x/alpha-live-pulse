/**
 * ALPHA PLACES — Real-time local life layer (data models + demo seed).
 *
 * ⚠️ IMPORTANT — DEMO DATA
 * Every record exported from this file is FICTIONAL and flagged `isDemo: true`.
 * It must never be surfaced in production as a real availability, a real
 * registration count or a real event. UI components read `isDemo` to display
 * an explicit "Données de démonstration" marker.
 *
 * The business models below are territory-agnostic: Guadeloupe is only the
 * launch market, injected through ACTIVE_TERRITORY. No business rule may
 * hardcode a country, a timezone or a currency.
 */
import type { MediaKey } from "./alpha";

export const IS_DEMO_DATA = true;
export const DEMO_NOTICE = "Contenu de démonstration — ni disponibilités ni fréquentations réelles.";

/* ------------------------------------------------------------------ */
/* Territory (scalability boundary)                                    */
/* ------------------------------------------------------------------ */

export interface Territory {
  id: string;
  name: string;
  countryCode: string;
  timezone: string;
  currency: "EUR" | "USD" | "XCD";
  locale: string;
  center: { lat: number; lng: number };
  /** UTC offset in hours, used for deterministic time math without a tz lib. */
  utcOffset: number;
}

export const TERRITORIES: Record<string, Territory> = {
  gp: {
    id: "gp",
    name: "Guadeloupe",
    countryCode: "GP",
    timezone: "America/Guadeloupe",
    currency: "EUR",
    locale: "fr-FR",
    center: { lat: 16.2055, lng: -61.4915 },
    utcOffset: -4,
  },
};

export const ACTIVE_TERRITORY = TERRITORIES["gp"]!;

/* ------------------------------------------------------------------ */
/* Organizer                                                           */
/* ------------------------------------------------------------------ */

export type OrganizerKind = "business" | "association" | "public" | "resident";

export interface Organizer {
  id: string;
  name: string;
  kind: OrganizerKind;
  initials: string;
  verified: boolean;
  /** Can publish community events without moderation. */
  canPublish: boolean;
  placeId?: string;
  since: string;
  eventsHosted: number;
  isDemo: boolean;
}

/* ------------------------------------------------------------------ */
/* Event category                                                      */
/* ------------------------------------------------------------------ */

export type EventCategoryKey =
  | "domino"
  | "belote"
  | "grillade"
  | "market"
  | "concert"
  | "sport"
  | "culture"
  | "family"
  | "nightlife"
  | "beach"
  | "community";

export interface EventCategory {
  key: EventCategoryKey;
  label: string;
  /** Coarse grouping used by the map / Tonight filters. */
  group: "Événements" | "Activités" | "Restaurants" | "Live";
}

export const EVENT_CATEGORIES: Record<EventCategoryKey, EventCategory> = {
  domino: { key: "domino", label: "Tournoi de domino", group: "Événements" },
  belote: { key: "belote", label: "Tournoi de belote", group: "Événements" },
  grillade: { key: "grillade", label: "Grillade / repas", group: "Restaurants" },
  market: { key: "market", label: "Marché", group: "Activités" },
  concert: { key: "concert", label: "Concert", group: "Événements" },
  sport: { key: "sport", label: "Sport", group: "Activités" },
  culture: { key: "culture", label: "Culture", group: "Événements" },
  family: { key: "family", label: "En famille", group: "Activités" },
  nightlife: { key: "nightlife", label: "Soirée", group: "Événements" },
  beach: { key: "beach", label: "Plage", group: "Activités" },
  community: { key: "community", label: "Animation de quartier", group: "Événements" },
};

/* ------------------------------------------------------------------ */
/* Signal quality                                                      */
/* ------------------------------------------------------------------ */

export type SignalSource =
  | "event_ongoing"
  | "availability_feed"
  | "recent_booking"
  | "recent_live"
  | "recent_interaction"
  | "venue_confirmation"
  | "opening_hours";

/**
 * A place is NEVER described as busy just because it exists in the database.
 * Activity may only be rendered when a GeoActivitySignal exists, and the UI
 * must show its confidence + freshness.
 */
export interface GeoActivitySignal {
  id: string;
  placeId: string;
  /** 0 → 1. Below 0.4 the UI must not claim activity. */
  confidence: number;
  /** Age of the freshest underlying data point, in minutes. */
  freshnessMinutes: number;
  sources: SignalSource[];
  observedLevel: "quiet" | "steady" | "busy" | "packed";
  isDemo: boolean;
}

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

export interface Availability {
  id: string;
  refKind: "place" | "event" | "stay";
  refId: string;
  slotsLeft: number | null;
  nextSlotHour: number | null;
  updatedMinutesAgo: number;
  source: "venue_confirmation" | "availability_feed";
  isDemo: boolean;
}

/* ------------------------------------------------------------------ */
/* Community event                                                     */
/* ------------------------------------------------------------------ */

export type EventStatus =
  | "upcoming"
  | "registrations_open"
  | "full"
  | "ongoing"
  | "ended"
  | "cancelled";

export type RegistrationMode = "none" | "open" | "required";
export type ParticipantUnit = "individual" | "pair" | "team";

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategoryKey;
  organizerId: string;
  placeId?: string;
  address: string;
  lat: number;
  lng: number;
  timezone: string;
  currency: Territory["currency"];
  locale: string;
  /** Days from "today" in the active territory. Resolved at render time. */
  dayOffset: number;
  startHour: number;
  /** May exceed 24 for events running past midnight. */
  endHour: number;
  price: number;
  media: MediaKey;
  capacity: number | null;
  registered: number;
  waitlisted: number;
  registrationMode: RegistrationMode;
  participantUnit: ParticipantUnit;
  /** Only meaningful when participantUnit === "team". */
  teamSize?: number;
  rules: string[];
  prizes: string[];
  cancelled: boolean;
  createdAtMinutesAgo: number;
  isDemo: boolean;
}

/* ------------------------------------------------------------------ */
/* Live content                                                        */
/* ------------------------------------------------------------------ */

export interface LiveContent {
  id: string;
  authorId: string;
  kind: "video" | "photo";
  placeId?: string;
  eventId?: string;
  caption: string;
  media: MediaKey;
  publishedMinutesAgo: number;
  /** Content disappears after this many hours. */
  ttlHours: number;
  viewers: number;
  visibility: "public" | "followers";
  /** Precise personal location is never published without an explicit action. */
  sharesPreciseLocation: boolean;
  reportable: boolean;
  isDemo: boolean;
}

/* ------------------------------------------------------------------ */
/* Registration                                                        */
/* ------------------------------------------------------------------ */

export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled";

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  unit: ParticipantUnit;
  /** Names of the partner / team-mates. Prepared for future tournaments. */
  members: string[];
  seats: number;
  createdAt: number;
  passCode: string;
}

/* ------------------------------------------------------------------ */
/* DEMO SEED — fictional Guadeloupe content                            */
/* ------------------------------------------------------------------ */

export const organizers: Organizer[] = [
  { id: "og1", name: "Association Ka Sainte-Anne", kind: "association", initials: "AK", verified: true, canPublish: true, since: "2019", eventsHosted: 42, isDemo: true },
  { id: "og2", name: "Comité des fêtes du Gosier", kind: "public", initials: "CF", verified: true, canPublish: true, since: "2016", eventsHosted: 88, isDemo: true },
  { id: "og3", name: "Zoukland", kind: "business", initials: "ZK", verified: true, canPublish: true, placeId: "p10", since: "2012", eventsHosted: 210, isDemo: true },
  { id: "og4", name: "Yohan M.", kind: "resident", initials: "YO", verified: false, canPublish: true, since: "2024", eventsHosted: 6, isDemo: true },
  { id: "og5", name: "Club Nautique Saint-François", kind: "association", initials: "CN", verified: true, canPublish: true, since: "2008", eventsHosted: 120, isDemo: true },
  { id: "og6", name: "Marché de Sainte-Anne", kind: "public", initials: "MS", verified: true, canPublish: true, placeId: "p7", since: "1998", eventsHosted: 300, isDemo: true },
];

export const organizerById = (id: string) => organizers.find((o) => o.id === id);

export const communityEvents: CommunityEvent[] = [
  {
    id: "ce1",
    title: "Tournoi de domino du Gosier",
    description:
      "Tournoi en binôme sur la place du bourg. Tables sous chapiteau, buvette locale et musique entre les manches. Ambiance familiale, inscriptions sur place ou via Alpha Places.",
    category: "domino",
    organizerId: "og2",
    placeId: "p5",
    address: "Place du bourg, Le Gosier",
    lat: 16.2043,
    lng: -61.4922,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 0,
    startHour: 19,
    endHour: 23,
    price: 5,
    media: "restaurant",
    capacity: 32,
    registered: 26,
    waitlisted: 2,
    registrationMode: "required",
    participantUnit: "pair",
    teamSize: 2,
    rules: ["Binôme obligatoire", "Arrivée 15 min avant le début", "Parties en 100 points"],
    prizes: ["Trophée + 200 €", "Panier créole", "Bon restaurant"],
    cancelled: false,
    createdAtMinutesAgo: 2600,
    isDemo: true,
  },
  {
    id: "ce2",
    title: "Grillade communautaire de Bois Jolan",
    description:
      "Grillade partagée sur la plage : chacun amène ce qu'il souhaite, les braises et les tables sont fournies par le comité. Coucher de soleil garanti.",
    category: "grillade",
    organizerId: "og4",
    placeId: "p2",
    address: "Plage de Bois Jolan, Sainte-Anne",
    lat: 16.2306,
    lng: -61.3486,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 0,
    startHour: 17,
    endHour: 22,
    price: 0,
    media: "beach",
    capacity: 60,
    registered: 41,
    waitlisted: 0,
    registrationMode: "open",
    participantUnit: "individual",
    rules: ["Repartir avec ses déchets", "Pas de sono après 22h"],
    prizes: [],
    cancelled: false,
    createdAtMinutesAgo: 320,
    isDemo: true,
  },
  {
    id: "ce3",
    title: "Marché nocturne artisanal",
    description:
      "Artisans, épices, street-food créole et orchestre de gwoka en clôture. Entrée libre, parking gratuit derrière l'église.",
    category: "market",
    organizerId: "og6",
    placeId: "p7",
    address: "Marché de Sainte-Anne",
    lat: 16.2266,
    lng: -61.3822,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 0,
    startHour: 17,
    endHour: 22,
    price: 0,
    media: "restaurant",
    capacity: null,
    registered: 0,
    waitlisted: 0,
    registrationMode: "none",
    participantUnit: "individual",
    rules: [],
    prizes: [],
    cancelled: false,
    createdAtMinutesAgo: 1400,
    isDemo: true,
  },
  {
    id: "ce4",
    title: "Zouk Nation — Nuit caribéenne",
    description: "Trois DJ, zouk et dancehall jusqu'au lever du jour. Dress code élégant.",
    category: "nightlife",
    organizerId: "og3",
    placeId: "p10",
    address: "Zoukland, Baie-Mahault",
    lat: 16.2686,
    lng: -61.5892,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 0,
    startHour: 23,
    endHour: 29,
    price: 25,
    media: "nightlife",
    capacity: 400,
    registered: 316,
    waitlisted: 0,
    registrationMode: "required",
    participantUnit: "individual",
    rules: ["+18", "Pièce d'identité obligatoire"],
    prizes: [],
    cancelled: false,
    createdAtMinutesAgo: 5000,
    isDemo: true,
  },
  {
    id: "ce5",
    title: "Initiation paddle en famille",
    description:
      "Session encadrée d'une heure dans le lagon, matériel fourni, à partir de 8 ans. Petits groupes de 10 personnes maximum.",
    category: "family",
    organizerId: "og5",
    placeId: "p15",
    address: "Ponton de l'îlet, Le Gosier",
    lat: 16.1994,
    lng: -61.4936,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 1,
    startHour: 9,
    endHour: 12,
    price: 18,
    media: "beach",
    capacity: 10,
    registered: 10,
    waitlisted: 3,
    registrationMode: "required",
    participantUnit: "individual",
    rules: ["Savoir nager", "Arriver 10 min avant"],
    prizes: [],
    cancelled: false,
    createdAtMinutesAgo: 900,
    isDemo: true,
  },
  {
    id: "ce6",
    title: "Tournoi de belote du dimanche",
    description: "Tournoi en binôme à la salle des fêtes, café et sandwichs sur place.",
    category: "belote",
    organizerId: "og2",
    address: "Salle des fêtes, Le Gosier",
    lat: 16.2071,
    lng: -61.4948,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 2,
    startHour: 14,
    endHour: 19,
    price: 10,
    media: "restaurant",
    capacity: 24,
    registered: 8,
    waitlisted: 0,
    registrationMode: "required",
    participantUnit: "pair",
    teamSize: 2,
    rules: ["Binôme obligatoire"],
    prizes: ["150 €", "Bouteille de rhum vieux"],
    cancelled: false,
    createdAtMinutesAgo: 4000,
    isDemo: true,
  },
  {
    id: "ce7",
    title: "Beach volley — tournoi ouvert",
    description: "Équipes de 3, inscriptions le matin même. Buvette et sono sur place.",
    category: "sport",
    organizerId: "og5",
    placeId: "p1",
    address: "Plage de la Caravelle, Sainte-Anne",
    lat: 16.2245,
    lng: -61.3814,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 1,
    startHour: 15,
    endHour: 20,
    price: 0,
    media: "beach",
    capacity: 12,
    registered: 5,
    waitlisted: 0,
    registrationMode: "required",
    participantUnit: "team",
    teamSize: 3,
    rules: ["Équipes de 3", "Matchs en 21 points"],
    prizes: ["Panier de produits locaux"],
    cancelled: false,
    createdAtMinutesAgo: 600,
    isDemo: true,
  },
  {
    id: "ce8",
    title: "Gwo ka au bord de l'eau",
    description: "Léwòz ouvert à tous, tambours fournis, transmission et danse jusqu'à minuit.",
    category: "culture",
    organizerId: "og1",
    placeId: "p1",
    address: "Front de mer, Sainte-Anne",
    lat: 16.2261,
    lng: -61.3831,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 0,
    startHour: 20,
    endHour: 24,
    price: 0,
    media: "event",
    capacity: null,
    registered: 0,
    waitlisted: 0,
    registrationMode: "none",
    participantUnit: "individual",
    rules: [],
    prizes: [],
    cancelled: false,
    createdAtMinutesAgo: 180,
    isDemo: true,
  },
  {
    id: "ce9",
    title: "Régate des canots traditionnels",
    description: "Course dans la baie, village d'animations et dégustations au retour des équipages.",
    category: "sport",
    organizerId: "og5",
    placeId: "p17",
    address: "Marina de Saint-François",
    lat: 16.2517,
    lng: -61.2822,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 3,
    startHour: 10,
    endHour: 17,
    price: 0,
    media: "beach",
    capacity: null,
    registered: 0,
    waitlisted: 0,
    registrationMode: "none",
    participantUnit: "team",
    teamSize: 6,
    rules: [],
    prizes: [],
    cancelled: false,
    createdAtMinutesAgo: 8000,
    isDemo: true,
  },
  {
    id: "ce10",
    title: "Ciné plein air — annulé (météo)",
    description: "Projection annulée en raison des prévisions de pluie. Reportée à la semaine prochaine.",
    category: "community",
    organizerId: "og2",
    placeId: "p12",
    address: "Esplanade, Basse-Terre",
    lat: 15.9975,
    lng: -61.7278,
    timezone: ACTIVE_TERRITORY.timezone,
    currency: "EUR",
    locale: "fr-FR",
    dayOffset: 1,
    startHour: 20,
    endHour: 23,
    price: 0,
    media: "nature",
    capacity: 200,
    registered: 64,
    waitlisted: 0,
    registrationMode: "open",
    participantUnit: "individual",
    rules: [],
    prizes: [],
    cancelled: true,
    createdAtMinutesAgo: 3000,
    isDemo: true,
  },
];

export const communityEventById = (id: string) => communityEvents.find((e) => e.id === id);

export const liveContents: LiveContent[] = [
  { id: "lc1", authorId: "u3", kind: "video", placeId: "p11", caption: "Sunset DJ set, les pieds dans le sable", media: "nightlife", publishedMinutesAgo: 22, ttlHours: 24, viewers: 1240, visibility: "public", sharesPreciseLocation: false, reportable: true, isDemo: true },
  { id: "lc2", authorId: "u5", kind: "video", placeId: "p10", eventId: "ce4", caption: "Setup terminé, file d'attente qui démarre", media: "nightlife", publishedMinutesAgo: 8, ttlHours: 24, viewers: 860, visibility: "public", sharesPreciseLocation: false, reportable: true, isDemo: true },
  { id: "lc3", authorId: "u2", kind: "video", placeId: "p1", caption: "Coucher de soleil sur la Caravelle", media: "beach", publishedMinutesAgo: 5, ttlHours: 24, viewers: 310, visibility: "public", sharesPreciseLocation: false, reportable: true, isDemo: true },
  { id: "lc4", authorId: "u1", kind: "photo", placeId: "p2", eventId: "ce2", caption: "Braises allumées, il reste de la place", media: "beach", publishedMinutesAgo: 14, ttlHours: 24, viewers: 132, visibility: "public", sharesPreciseLocation: false, reportable: true, isDemo: true },
  { id: "lc5", authorId: "u6", kind: "photo", placeId: "p7", eventId: "ce3", caption: "Les stands s'installent", media: "restaurant", publishedMinutesAgo: 46, ttlHours: 24, viewers: 88, visibility: "public", sharesPreciseLocation: false, reportable: true, isDemo: true },
];

export const availabilities: Availability[] = [
  { id: "av1", refKind: "place", refId: "p5", slotsLeft: 3, nextSlotHour: 21, updatedMinutesAgo: 11, source: "venue_confirmation", isDemo: true },
  { id: "av2", refKind: "place", refId: "p6", slotsLeft: 12, nextSlotHour: 20, updatedMinutesAgo: 25, source: "availability_feed", isDemo: true },
  { id: "av3", refKind: "place", refId: "p9", slotsLeft: 4, nextSlotHour: 9, updatedMinutesAgo: 140, source: "availability_feed", isDemo: true },
  { id: "av4", refKind: "place", refId: "p11", slotsLeft: 0, nextSlotHour: null, updatedMinutesAgo: 18, source: "venue_confirmation", isDemo: true },
];

export const activitySignals: GeoActivitySignal[] = [
  { id: "gs1", placeId: "p5", confidence: 0.86, freshnessMinutes: 11, sources: ["venue_confirmation", "availability_feed", "recent_booking"], observedLevel: "busy", isDemo: true },
  { id: "gs2", placeId: "p10", confidence: 0.78, freshnessMinutes: 8, sources: ["recent_live", "event_ongoing"], observedLevel: "packed", isDemo: true },
  { id: "gs3", placeId: "p11", confidence: 0.72, freshnessMinutes: 22, sources: ["recent_live", "venue_confirmation"], observedLevel: "busy", isDemo: true },
  { id: "gs4", placeId: "p1", confidence: 0.54, freshnessMinutes: 5, sources: ["recent_live"], observedLevel: "steady", isDemo: true },
  { id: "gs5", placeId: "p7", confidence: 0.47, freshnessMinutes: 46, sources: ["recent_live", "opening_hours"], observedLevel: "steady", isDemo: true },
  { id: "gs6", placeId: "p18", confidence: 0.35, freshnessMinutes: 190, sources: ["recent_interaction"], observedLevel: "quiet", isDemo: true },
];
