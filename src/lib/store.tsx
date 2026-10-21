import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { emptyBuckets, insertPlace, removePlace, type Sentiment } from './ranking';
import type { AppState, Place, User } from './types';
import { SEED_PLACES } from './venues';

// Pilot storage lives on the phone. Friends, invites and sync need the
// Supabase backend described in docs/BACKEND.md; this store is the seam
// where those calls will go.
const KEY = 'rankea:v1';

const initialState: AppState = {
  user: null,
  visits: {},
  buckets: emptyBuckets(),
  saved: [],
  customPlaces: [],
};

type Store = {
  ready: boolean;
  state: AppState;
  places: Place[];
  placeById: (id: string) => Place | undefined;
  setUser: (user: User) => void;
  rankPlace: (args: { placeId: string; sentiment: Sentiment; index: number; note?: string; photoUri?: string }) => void;
  unrankPlace: (placeId: string) => void;
  toggleSaved: (placeId: string) => void;
  addPlace: (place: Omit<Place, 'id' | 'verified' | 'addedByUser'>) => Place;
  reset: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...initialState, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const store = useMemo<Store>(() => {
    const places = [...SEED_PLACES, ...state.customPlaces];
    const byId = new Map(places.map((p) => [p.id, p]));
    return {
      ready,
      state,
      places,
      placeById: (id) => byId.get(id),
      setUser: (user) => setState((s) => ({ ...s, user })),
      rankPlace: ({ placeId, sentiment, index, note, photoUri }) =>
        setState((s) => ({
          ...s,
          buckets: insertPlace(s.buckets, sentiment, index, placeId),
          visits: {
            ...s.visits,
            [placeId]: { placeId, sentiment, note, photoUri, date: new Date().toISOString() },
          },
          saved: s.saved.filter((id) => id !== placeId),
        })),
      unrankPlace: (placeId) =>
        setState((s) => {
          const { [placeId]: _, ...visits } = s.visits;
          return { ...s, buckets: removePlace(s.buckets, placeId), visits };
        }),
      toggleSaved: (placeId) =>
        setState((s) => ({
          ...s,
          saved: s.saved.includes(placeId) ? s.saved.filter((id) => id !== placeId) : [...s.saved, placeId],
        })),
      addPlace: (input) => {
        const place: Place = { ...input, id: `user-${Date.now()}`, verified: false, addedByUser: true };
        setState((s) => ({ ...s, customPlaces: [...s.customPlaces, place] }));
        return place;
      },
      reset: () => setState(initialState),
    };
  }, [state, ready]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
