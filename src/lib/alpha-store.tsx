import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Booking {
  id: string;
  kind: "place" | "event" | "stay";
  refId: string;
  title: string;
  subtitle: string;
  when: string;
  people: number;
  total: number;
  status: "upcoming" | "completed" | "cancelled";
}

export interface TripItem {
  id: string;
  time: string;
  title: string;
  placeId?: string;
  cost: number;
}

export interface TripDay {
  label: string;
  items: TripItem[];
}

export interface Trip {
  id: string;
  destination: string;
  start: string;
  end: string;
  nights: number;
  adults: number;
  children: number;
  budget: number;
  comfort: "Economy" | "Best Value" | "Comfort" | "Premium";
  breakdown: Record<string, number>;
  total: number;
  days: TripDay[];
  createdAt: number;
}

interface AlphaState {
  followedPlaces: string[];
  followedUsers: string[];
  saved: string[];
  interested: string[];
  bookings: Booking[];
  trips: Trip[];
  checkIns: { placeId: string; at: number; visibility: string }[];
  locationVisibility: "invisible" | "friends" | "followers" | "public";
}

const EMPTY: AlphaState = {
  followedPlaces: [],
  followedUsers: [],
  saved: [],
  interested: [],
  bookings: [],
  trips: [],
  checkIns: [],
  locationVisibility: "friends",
};

interface Ctx extends AlphaState {
  toggleFollowPlace: (id: string) => void;
  toggleFollowUser: (id: string) => void;
  toggleSave: (id: string) => void;
  toggleInterested: (id: string) => void;
  addBooking: (b: Omit<Booking, "id" | "status">) => Booking;
  cancelBooking: (id: string) => void;
  addTrip: (t: Omit<Trip, "id" | "createdAt">) => Trip;
  removeTrip: (id: string) => void;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  checkIn: (placeId: string, visibility: string) => void;
  setLocationVisibility: (v: AlphaState["locationVisibility"]) => void;
}

const AlphaContext = createContext<Ctx | null>(null);
const KEY = "alpha-places-state-v1";

export function AlphaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlphaState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as AlphaState) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const toggleIn = useCallback((key: keyof AlphaState, id: string) => {
    setState((s) => {
      const list = s[key] as string[];
      return {
        ...s,
        [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
      };
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      toggleFollowPlace: (id) => toggleIn("followedPlaces", id),
      toggleFollowUser: (id) => toggleIn("followedUsers", id),
      toggleSave: (id) => toggleIn("saved", id),
      toggleInterested: (id) => toggleIn("interested", id),
      addBooking: (b) => {
        const booking: Booking = { ...b, id: `bk_${Date.now()}`, status: "upcoming" };
        setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
        return booking;
      },
      cancelBooking: (id) =>
        setState((s) => ({
          ...s,
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: "cancelled" } : b,
          ),
        })),
      addTrip: (t) => {
        const trip: Trip = { ...t, id: `tr_${Date.now()}`, createdAt: Date.now() };
        setState((s) => ({ ...s, trips: [trip, ...s.trips] }));
        return trip;
      },
      removeTrip: (id) =>
        setState((s) => ({ ...s, trips: s.trips.filter((t) => t.id !== id) })),
      updateTrip: (id, patch) =>
        setState((s) => ({
          ...s,
          trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      checkIn: (placeId, visibility) =>
        setState((s) => ({
          ...s,
          checkIns: [{ placeId, at: Date.now(), visibility }, ...s.checkIns],
        })),
      setLocationVisibility: (v) => setState((s) => ({ ...s, locationVisibility: v })),
    }),
    [state, toggleIn],
  );

  return <AlphaContext.Provider value={value}>{children}</AlphaContext.Provider>;
}

export function useAlpha() {
  const ctx = useContext(AlphaContext);
  if (!ctx) throw new Error("useAlpha must be used inside AlphaProvider");
  return ctx;
}
