import beach from "@/assets/beach.jpg";
import restaurant from "@/assets/restaurant.jpg";
import nightlife from "@/assets/nightlife.jpg";
import nature from "@/assets/nature.jpg";
import stayImg from "@/assets/stay.jpg";
import eventImg from "@/assets/event.jpg";

export const MEDIA = {
  beach,
  restaurant,
  nightlife,
  nature,
  stay: stayImg,
  event: eventImg,
} as const;

export type MediaKey = keyof typeof MEDIA;

export type PlaceCategory =
  | "Eat & Drink"
  | "Beaches"
  | "Nightlife"
  | "Nature"
  | "Culture"
  | "Experiences"
  | "Stays";

export type ActivityLevel = "Calm" | "Getting busy" | "Popular now" | "Very active";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  town: string;
  lat: number;
  lng: number;
  media: MediaKey;
  rating: number;
  reviews: number;
  price: 0 | 1 | 2 | 3;
  verified: boolean;
  activity: ActivityLevel;
  opensAt: number; // hour
  closesAt: number; // hour (may exceed 24)
  description: string;
  amenities: string[];
  cta: "Reserve" | "Book" | "Buy Ticket" | "Go";
  tags: string[];
  /** typical visit duration in minutes */
  duration: number;
}

export interface AlphaUser {
  id: string;
  name: string;
  username: string;
  bio: string;
  followers: number;
  following: number;
  initials: string;
}

export interface Story {
  id: string;
  authorId: string;
  placeId: string;
  media: MediaKey;
  caption: string;
  minutesAgo: number;
  cta: "View Place" | "Go There" | "Book" | "See Event" | "Watch Live";
}

export interface Live {
  id: string;
  authorId: string;
  placeId: string;
  title: string;
  viewers: number;
  startedMinutesAgo: number;
  media: MediaKey;
  eventId?: string;
}

export interface AlphaEvent {
  id: string;
  title: string;
  placeId: string;
  organizer: string;
  day: string;
  startHour: number;
  endHour: number;
  price: number;
  ticketsLeft: number;
  interested: number;
  media: MediaKey;
  category: string;
  description: string;
}

export interface Stay {
  id: string;
  name: string;
  type: "Villa" | "Hotel" | "Apartment" | "Guest house";
  town: string;
  lat: number;
  lng: number;
  media: MediaKey;
  nightly: number;
  guests: number;
  bedrooms: number;
  rating: number;
  amenities: string[];
}

/** Reference location: Le Gosier */
export const HOME = { lat: 16.2055, lng: -61.4915, town: "Le Gosier", territory: "Guadeloupe" };

export const users: AlphaUser[] = [
  { id: "u1", name: "Kenny R.", username: "kenny", bio: "Guadeloupe. Sunsets, ti-punch and good tables.", followers: 482, following: 210, initials: "KR" },
  { id: "u2", name: "Naéla", username: "naela", bio: "Beach hunter · Sainte-Anne", followers: 1240, following: 320, initials: "NA" },
  { id: "u3", name: "Yohan", username: "yoh", bio: "Kite + rhum + carnaval", followers: 860, following: 190, initials: "YO" },
  { id: "u4", name: "La Toubana", username: "latoubana", bio: "Hotel & Spa · Sainte-Anne", followers: 9800, following: 12, initials: "LT" },
  { id: "u5", name: "Zoukland", username: "zoukland", bio: "Club · Baie-Mahault", followers: 15200, following: 4, initials: "ZK" },
  { id: "u6", name: "Marie-Lou", username: "mlou", bio: "Randos & cascades", followers: 640, following: 400, initials: "ML" },
];

export const places: Place[] = [
  { id: "p1", name: "Plage de la Caravelle", category: "Beaches", town: "Sainte-Anne", lat: 16.2245, lng: -61.3814, media: "beach", rating: 4.7, reviews: 3120, price: 0, verified: true, activity: "Popular now", opensAt: 6, closesAt: 20, description: "Lagon turquoise protégé par la barrière de corail. L'une des plus belles plages de l'île, parfaite en fin de journée.", amenities: ["Lagon calme", "Ombre", "Snacks", "Parking"], cta: "Go", tags: ["family", "sunset", "free", "swim"], duration: 120 },
  { id: "p2", name: "Plage des Salines Bois Jolan", category: "Beaches", town: "Sainte-Anne", lat: 16.2306, lng: -61.3486, media: "beach", rating: 4.6, reviews: 980, price: 0, verified: false, activity: "Calm", opensAt: 6, closesAt: 20, description: "Eau peu profonde sur des centaines de mètres, cocotiers et calme absolu.", amenities: ["Peu profond", "Cocotiers", "Free"], cta: "Go", tags: ["family", "calm", "free"], duration: 150 },
  { id: "p3", name: "Grande Anse Deshaies", category: "Beaches", town: "Deshaies", lat: 16.3172, lng: -61.7947, media: "beach", rating: 4.8, reviews: 4210, price: 0, verified: true, activity: "Getting busy", opensAt: 6, closesAt: 19, description: "Immense plage de sable doré face à l'ouest — le meilleur coucher de soleil de Basse-Terre.", amenities: ["Sunset ouest", "Restaurants", "Parking"], cta: "Go", tags: ["sunset", "couples", "free"], duration: 120 },
  { id: "p4", name: "La Toubana Hôtel & Spa", category: "Stays", town: "Sainte-Anne", lat: 16.2244, lng: -61.3946, media: "stay", rating: 4.7, reviews: 720, price: 3, verified: true, activity: "Popular now", opensAt: 7, closesAt: 23, description: "Hôtel de charme perché sur la falaise, piscine à débordement face à la Caravelle.", amenities: ["Piscine", "Spa", "Vue mer", "Restaurant"], cta: "Book", tags: ["couples", "premium"], duration: 180 },
  { id: "p5", name: "Le Zandoli", category: "Eat & Drink", town: "Le Gosier", lat: 16.2036, lng: -61.4901, media: "restaurant", rating: 4.6, reviews: 512, price: 2, verified: true, activity: "Very active", opensAt: 18, closesAt: 24, description: "Cuisine créole contemporaine, terrasse ouverte sur la mer, carte de rhums arrangés.", amenities: ["Vue mer", "Terrasse", "Végétarien", "Réservation"], cta: "Reserve", tags: ["dinner", "couples", "seaview"], duration: 90 },
  { id: "p6", name: "Kaz à Poul", category: "Eat & Drink", town: "Pointe-à-Pitre", lat: 16.2412, lng: -61.5335, media: "restaurant", rating: 4.4, reviews: 890, price: 1, verified: false, activity: "Getting busy", opensAt: 11, closesAt: 23, description: "Poulet boucané, accras et sauce chien. Institution locale, service rapide.", amenities: ["À emporter", "Local", "Ouvert tard"], cta: "Reserve", tags: ["cheap", "friends", "late"], duration: 45 },
  { id: "p7", name: "Marché de Sainte-Anne", category: "Culture", town: "Sainte-Anne", lat: 16.2266, lng: -61.3822, media: "restaurant", rating: 4.3, reviews: 610, price: 1, verified: true, activity: "Calm", opensAt: 7, closesAt: 14, description: "Épices, vanille, madras et fruits — l'odeur du marché créole dès l'entrée.", amenities: ["Épices", "Artisanat", "Cash"], cta: "Go", tags: ["culture", "family", "morning"], duration: 60 },
  { id: "p8", name: "Chute du Carbet — 2e saut", category: "Nature", town: "Capesterre-Belle-Eau", lat: 16.0417, lng: -61.6428, media: "nature", rating: 4.8, reviews: 2400, price: 1, verified: true, activity: "Getting busy", opensAt: 8, closesAt: 17, description: "Cascade de 110 m au cœur du Parc national. 20 min de marche depuis le parking.", amenities: ["Sentier balisé", "Parking", "Baignade interdite"], cta: "Go", tags: ["nature", "hike", "family"], duration: 150 },
  { id: "p9", name: "Réserve Cousteau", category: "Experiences", town: "Bouillante", lat: 16.1706, lng: -61.7897, media: "nature", rating: 4.7, reviews: 1900, price: 2, verified: true, activity: "Popular now", opensAt: 8, closesAt: 16, description: "Snorkeling et plongée autour des Îlets Pigeon, tortues et coraux.", amenities: ["Matériel fourni", "Bateau", "Guide"], cta: "Book", tags: ["experience", "friends", "sea"], duration: 210 },
  { id: "p10", name: "Zoukland Club", category: "Nightlife", town: "Baie-Mahault", lat: 16.2686, lng: -61.5892, media: "nightlife", rating: 4.2, reviews: 1400, price: 2, verified: true, activity: "Very active", opensAt: 22, closesAt: 29, description: "Zouk, dancehall et afrobeats jusqu'au petit matin. Grande terrasse extérieure.", amenities: ["Terrasse", "Table VIP", "Vestiaire"], cta: "Buy Ticket", tags: ["night", "friends", "dance"], duration: 180 },
  { id: "p11", name: "Beach Club Sunset Deshaies", category: "Nightlife", town: "Deshaies", lat: 16.3035, lng: -61.7942, media: "nightlife", rating: 4.5, reviews: 430, price: 2, verified: true, activity: "Very active", opensAt: 16, closesAt: 26, description: "Transats, DJ set au coucher du soleil, cocktails les pieds dans le sable.", amenities: ["DJ", "Transats", "Cocktails"], cta: "Reserve", tags: ["sunset", "friends", "night"], duration: 150 },
  { id: "p12", name: "Fort Delgrès", category: "Culture", town: "Basse-Terre", lat: 15.9975, lng: -61.7278, media: "nature", rating: 4.4, reviews: 520, price: 0, verified: true, activity: "Calm", opensAt: 9, closesAt: 17, description: "Fortification du XVIIe siècle et mémoire de Louis Delgrès, vue sur la rade.", amenities: ["Visite guidée", "Gratuit", "Vue"], cta: "Go", tags: ["culture", "free", "history"], duration: 90 },
  { id: "p13", name: "Plage de la Perle", category: "Beaches", town: "Deshaies", lat: 16.3372, lng: -61.8028, media: "beach", rating: 4.5, reviews: 780, price: 0, verified: false, activity: "Calm", opensAt: 6, closesAt: 19, description: "Sable doré, vagues pour surfeurs, spot sauvage et peu fréquenté en semaine.", amenities: ["Surf", "Sauvage"], cta: "Go", tags: ["hidden", "surf", "free"], duration: 120 },
  { id: "p14", name: "Distillerie Bologne", category: "Experiences", town: "Basse-Terre", lat: 16.0114, lng: -61.7383, media: "nature", rating: 4.5, reviews: 1100, price: 1, verified: true, activity: "Getting busy", opensAt: 9, closesAt: 17, description: "Visite d'une distillerie historique de rhum agricole, dégustation incluse.", amenities: ["Dégustation", "Boutique", "Visite"], cta: "Book", tags: ["experience", "culture", "friends"], duration: 90 },
  { id: "p15", name: "Îlet du Gosier", category: "Experiences", town: "Le Gosier", lat: 16.1994, lng: -61.4936, media: "beach", rating: 4.6, reviews: 1350, price: 1, verified: true, activity: "Popular now", opensAt: 9, closesAt: 17, description: "Navette 8 minutes vers l'îlet et son phare. Snorkeling et snack sur le sable.", amenities: ["Navette", "Snorkeling", "Snack"], cta: "Book", tags: ["experience", "family", "sea"], duration: 180 },
  { id: "p16", name: "Plage de la Feuillère", category: "Beaches", town: "Marie-Galante", lat: 15.8842, lng: -61.2358, media: "beach", rating: 4.8, reviews: 640, price: 0, verified: false, activity: "Calm", opensAt: 6, closesAt: 19, description: "Marie-Galante au ralenti : lagon transparent, presque personne.", amenities: ["Lagon", "Calme"], cta: "Go", tags: ["hidden", "calm", "free"], duration: 180 },
  { id: "p17", name: "Le Ti Bar des Saintes", category: "Eat & Drink", town: "Les Saintes", lat: 15.8698, lng: -61.5851, media: "restaurant", rating: 4.6, reviews: 380, price: 1, verified: false, activity: "Getting busy", opensAt: 11, closesAt: 22, description: "Tourment d'amour, planches de poisson frais et vue sur la baie.", amenities: ["Vue baie", "Poisson frais"], cta: "Reserve", tags: ["lunch", "couples"], duration: 75 },
  { id: "p18", name: "Marina Bas-du-Fort", category: "Eat & Drink", town: "Les Abymes", lat: 16.2214, lng: -61.5253, media: "restaurant", rating: 4.3, reviews: 1500, price: 2, verified: true, activity: "Very active", opensAt: 17, closesAt: 25, description: "Le quai des bars et restaurants, ambiance chaque soir jusqu'à tard.", amenities: ["Bars", "Ouvert tard", "Parking"], cta: "Reserve", tags: ["night", "friends", "late"], duration: 120 },
  { id: "p19", name: "Plage de Petit-Havre", category: "Beaches", town: "Le Gosier", lat: 16.2049, lng: -61.4448, media: "beach", rating: 4.4, reviews: 520, price: 0, verified: false, activity: "Getting busy", opensAt: 6, closesAt: 19, description: "Deux petites criques abritées, très locales le dimanche.", amenities: ["Crique", "Local", "Free"], cta: "Go", tags: ["free", "family", "quick"], duration: 60 },
  { id: "p20", name: "Jardin Botanique de Deshaies", category: "Nature", town: "Deshaies", lat: 16.3169, lng: -61.7822, media: "nature", rating: 4.7, reviews: 3300, price: 2, verified: true, activity: "Popular now", opensAt: 9, closesAt: 17, description: "Sept hectares de jardin tropical, perroquets et vue sur la mer des Caraïbes.", amenities: ["Restaurant", "Accessible", "Boutique"], cta: "Buy Ticket", tags: ["family", "nature"], duration: 120 },
  { id: "p21", name: "Port-Louis · Plage du Souffleur", category: "Beaches", town: "Port-Louis", lat: 16.4197, lng: -61.5325, media: "beach", rating: 4.4, reviews: 900, price: 0, verified: false, activity: "Calm", opensAt: 6, closesAt: 19, description: "Cocotiers penchés, ambiance village et poissons grillés le week-end.", amenities: ["Cocotiers", "Snacks"], cta: "Go", tags: ["free", "family"], duration: 120 },
  { id: "p22", name: "Sainte-Rose · Mangrove kayak", category: "Experiences", town: "Sainte-Rose", lat: 16.3336, lng: -61.6975, media: "nature", rating: 4.6, reviews: 460, price: 2, verified: true, activity: "Getting busy", opensAt: 8, closesAt: 16, description: "Kayak dans le Grand Cul-de-Sac Marin entre palétuviers et îlets.", amenities: ["Guide", "Kayak", "Gilet"], cta: "Book", tags: ["experience", "nature", "family"], duration: 180 },
  { id: "p23", name: "Petit-Bourg · Table de Valombreuse", category: "Eat & Drink", town: "Petit-Bourg", lat: 16.1731, lng: -61.6081, media: "restaurant", rating: 4.5, reviews: 320, price: 2, verified: false, activity: "Calm", opensAt: 12, closesAt: 21, description: "Cuisine créole en pleine forêt, produits du jardin.", amenities: ["Jardin", "Végétarien"], cta: "Reserve", tags: ["lunch", "family", "nature"], duration: 90 },
  { id: "p24", name: "La Désirade · Plage du Souffleur", category: "Beaches", town: "La Désirade", lat: 16.3193, lng: -61.0641, media: "beach", rating: 4.7, reviews: 210, price: 0, verified: false, activity: "Calm", opensAt: 6, closesAt: 19, description: "Le bout du monde à 45 minutes de bateau. Presque toujours désert.", amenities: ["Sauvage", "Free"], cta: "Go", tags: ["hidden", "calm", "free"], duration: 240 },
];

export const stories: Story[] = [
  { id: "s1", authorId: "u2", placeId: "p1", media: "beach", caption: "L'eau est à 29°. Personne.", minutesAgo: 18, cta: "Go There" },
  { id: "s2", authorId: "u4", placeId: "p4", media: "stay", caption: "Happy hour piscine jusqu'à 19h", minutesAgo: 42, cta: "Book" },
  { id: "s3", authorId: "u5", placeId: "p10", media: "nightlife", caption: "Setup terminé. Ça commence à 23h.", minutesAgo: 65, cta: "See Event" },
  { id: "s4", authorId: "u3", placeId: "p11", media: "nightlife", caption: "DJ sunset dans 20 min 🔊", minutesAgo: 12, cta: "Watch Live" },
  { id: "s5", authorId: "u6", placeId: "p8", media: "nature", caption: "Sentier praticable, un peu de boue", minutesAgo: 130, cta: "View Place" },
  { id: "s6", authorId: "u1", placeId: "p5", media: "restaurant", caption: "Le vivaneau du soir 🐟", minutesAgo: 55, cta: "Book" },
  { id: "s7", authorId: "u2", placeId: "p15", media: "beach", caption: "Dernière navette 17h, ne la ratez pas", minutesAgo: 200, cta: "View Place" },
];

export const lives: Live[] = [
  { id: "l1", authorId: "u3", placeId: "p11", title: "Sunset DJ set — les pieds dans le sable", viewers: 1240, startedMinutesAgo: 22, media: "nightlife" },
  { id: "l2", authorId: "u5", placeId: "p10", title: "Ambiance & file d'attente", viewers: 860, startedMinutesAgo: 8, media: "nightlife", eventId: "e1" },
  { id: "l3", authorId: "u2", placeId: "p1", title: "Coucher de soleil Caravelle", viewers: 310, startedMinutesAgo: 5, media: "beach" },
  { id: "l4", authorId: "u1", placeId: "p18", title: "Marina un samedi soir", viewers: 194, startedMinutesAgo: 36, media: "restaurant" },
];

export const events: AlphaEvent[] = [
  { id: "e1", title: "Zouk Nation — Nuit Caribéenne", placeId: "p10", organizer: "Zoukland", day: "Ce soir", startHour: 23, endHour: 29, price: 25, ticketsLeft: 84, interested: 1290, media: "event", category: "Nightlife", description: "Trois DJ, zouk et dancehall jusqu'au lever du jour. Dress code élégant." },
  { id: "e2", title: "Sunset Session — Beach Club", placeId: "p11", organizer: "Sunset Deshaies", day: "Ce soir", startHour: 18, endHour: 23, price: 0, ticketsLeft: 200, interested: 640, media: "nightlife", category: "Nightlife", description: "DJ set au coucher du soleil, entrée libre, cocktails signature." },
  { id: "e3", title: "Marché nocturne créole", placeId: "p7", organizer: "Ville de Sainte-Anne", day: "Demain", startHour: 17, endHour: 22, price: 0, ticketsLeft: 999, interested: 410, media: "restaurant", category: "Culture", description: "Artisans, street-food créole et orchestre de gwoka en fin de soirée." },
  { id: "e4", title: "Festival Gwo Ka de Sainte-Anne", placeId: "p1", organizer: "Association Ka", day: "Samedi prochain", startHour: 19, endHour: 24, price: 12, ticketsLeft: 320, interested: 2100, media: "event", category: "Culture", description: "Tambours, danse et transmission — le rendez-vous incontournable de l'année." },
  { id: "e5", title: "Régate des Saintes", placeId: "p17", organizer: "Club Nautique", day: "Dimanche", startHour: 10, endHour: 17, price: 0, ticketsLeft: 999, interested: 530, media: "beach", category: "Sports", description: "Course de canots traditionnels dans la baie, ambiance village." },
];

export const stays: Stay[] = [
  { id: "st1", name: "Villa Ultramarine", type: "Villa", town: "Saint-François", lat: 16.2517, lng: -61.2822, media: "stay", nightly: 420, guests: 8, bedrooms: 4, rating: 4.9, amenities: ["Piscine", "Vue mer", "Clim", "Wifi"] },
  { id: "st2", name: "La Toubana Hôtel & Spa", type: "Hotel", town: "Sainte-Anne", lat: 16.2244, lng: -61.3946, media: "stay", nightly: 310, guests: 2, bedrooms: 1, rating: 4.7, amenities: ["Spa", "Plage privée", "Restaurant"] },
  { id: "st3", name: "Kaz Deshaies", type: "Guest house", town: "Deshaies", lat: 16.3061, lng: -61.7938, media: "stay", nightly: 120, guests: 4, bedrooms: 2, rating: 4.6, amenities: ["Jardin", "Wifi", "Petit-déj"] },
  { id: "st4", name: "Appartement Marina", type: "Apartment", town: "Les Abymes", lat: 16.2214, lng: -61.5253, media: "stay", nightly: 95, guests: 3, bedrooms: 1, rating: 4.3, amenities: ["Clim", "Wifi", "Parking"] },
  { id: "st5", name: "Case créole Marie-Galante", type: "Villa", town: "Marie-Galante", lat: 15.8842, lng: -61.2358, media: "stay", nightly: 160, guests: 6, bedrooms: 3, rating: 4.8, amenities: ["Plage à pied", "Terrasse", "Wifi"] },
];

export const collections = [
  { id: "c1", title: "Plages secrètes", placeIds: ["p13", "p16", "p24"], cover: "beach" as MediaKey },
  { id: "c2", title: "Date night", placeIds: ["p5", "p4", "p17"], cover: "restaurant" as MediaKey },
  { id: "c3", title: "Week-end en famille", placeIds: ["p2", "p20", "p15"], cover: "nature" as MediaKey },
];

export const EXPLORE_CATEGORIES = [
  { key: "Eat & Drink", label: "Eat & Drink", media: "restaurant" as MediaKey },
  { key: "Beaches", label: "Beaches", media: "beach" as MediaKey },
  { key: "Experiences", label: "Experiences", media: "nature" as MediaKey },
  { key: "Nightlife", label: "Nightlife", media: "nightlife" as MediaKey },
  { key: "Nature", label: "Nature", media: "nature" as MediaKey },
  { key: "Culture", label: "Culture", media: "restaurant" as MediaKey },
  { key: "Stays", label: "Stays", media: "stay" as MediaKey },
];

/* ---------- helpers (pure, isomorphic) ---------- */

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const driveMinutes = (km: number) => Math.max(3, Math.round((km / 45) * 60));

export const placeById = (id: string) => places.find((p) => p.id === id);
export const userById = (id: string) => users.find((u) => u.id === id);
export const eventById = (id: string) => events.find((e) => e.id === id);
export const liveById = (id: string) => lives.find((l) => l.id === id);

export function isOpen(place: Place, hour: number) {
  const close = place.closesAt > 24 ? place.closesAt - 24 : place.closesAt;
  if (place.closesAt > 24) return hour >= place.opensAt || hour < close;
  return hour >= place.opensAt && hour < close;
}

export function priceLabel(p: number) {
  return p === 0 ? "Gratuit" : "€".repeat(p);
}

export function fmtAgo(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h} h`;
}
