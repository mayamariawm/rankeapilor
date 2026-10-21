import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { bucketsFromRows, emptyBuckets, insertPlace, rankingRows, removePlace, type Sentiment } from './ranking';
import { supabase } from './supabase';
import type { AppState, Category, District, Place, User, Visit } from './types';
import { SEED_PLACES } from './venues';

// Supabase is the source of truth (schema in supabase/migrations). Edits show
// up at once and are written in the background; if a write fails we reload
// from the server so the screen never shows something that was not saved.

const initialState: AppState = {
  user: null,
  visits: {},
  buckets: emptyBuckets(),
  saved: [],
};

type PlaceRow = {
  id: string;
  name: string;
  district: District;
  category: Category;
  lat: number;
  lng: number;
  is_new: boolean | null;
  verified: boolean | null;
  added_by: string | null;
};

const toPlace = (r: PlaceRow, me: string | null): Place => ({
  id: r.id,
  name: r.name,
  district: r.district,
  category: r.category,
  lat: r.lat,
  lng: r.lng,
  isNew: r.is_new ?? false,
  verified: r.verified ?? false,
  addedByUser: !!me && r.added_by === me,
});

type Store = {
  ready: boolean;
  /** Signed in, possibly still without a profile (name and @usuario). */
  signedIn: boolean;
  state: AppState;
  places: Place[];
  placeById: (id: string) => Place | undefined;
  /** Each auth call resolves to an error message in Spanish, or null on success. */
  sendCode: (email: string) => Promise<string | null>;
  verifyCode: (email: string, code: string) => Promise<string | null>;
  createProfile: (name: string, handle: string) => Promise<string | null>;
  rankPlace: (args: { placeId: string; sentiment: Sentiment; index: number; note?: string; photoUri?: string }) => void;
  unrankPlace: (placeId: string) => void;
  toggleSaved: (placeId: string) => void;
  addPlace: (place: Omit<Place, 'id' | 'verified' | 'addedByUser'>) => Promise<Place>;
  signOut: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [places, setPlaces] = useState<Place[]>(SEED_PLACES);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setUserId(data.session?.user.id ?? null))
      .finally(() => setAuthChecked(true));
    // Supabase warns against awaiting its own calls inside this callback,
    // so it only records who is signed in and the effect below loads data.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const load = useCallback(async (uid: string | null) => {
    const placesRes = await supabase.from('places').select('*').order('name');
    if (placesRes.data?.length) setPlaces((placesRes.data as PlaceRow[]).map((r) => toPlace(r, uid)));
    if (!uid) {
      setState(initialState);
      return;
    }
    const [profile, rankings, saved] = await Promise.all([
      supabase.from('profiles').select('id, name, handle').eq('id', uid).maybeSingle(),
      supabase.from('rankings').select('place_id, sentiment, position, note, photo_path, created_at').eq('user_id', uid),
      supabase.from('saved').select('place_id').eq('user_id', uid).order('created_at'),
    ]);
    const rows = rankings.data ?? [];
    const visits: Record<string, Visit> = {};
    for (const r of rows) {
      visits[r.place_id] = {
        placeId: r.place_id,
        sentiment: r.sentiment,
        note: r.note ?? undefined,
        photoUri: r.photo_path ?? undefined,
        date: r.created_at,
      };
    }
    setState({
      user: (profile.data as User | null) ?? null,
      visits,
      buckets: bucketsFromRows(rows),
      saved: (saved.data ?? []).map((s) => s.place_id),
    });
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    setLoaded(false);
    load(userId)
      .catch((e) => console.warn('Rankea: could not load from Supabase', e))
      .finally(() => setLoaded(true));
  }, [authChecked, userId, load]);

  // Runs a write; on failure, reloads so the screen matches the server again.
  const write = useCallback(
    (what: string, run: () => PromiseLike<{ error: unknown }>) => {
      Promise.resolve(run()).then(({ error }) => {
        if (!error) return;
        console.warn(`Rankea: ${what} failed`, error);
        load(userId).catch(() => {});
      });
    },
    [load, userId],
  );

  const store = useMemo<Store>(() => {
    const byId = new Map(places.map((p) => [p.id, p]));

    // Upserts every ranking, because one insert shifts its neighbours' scores.
    const saveRankings = (next: AppState) =>
      write('saving rankings', () =>
        supabase.from('rankings').upsert(
          rankingRows(next.buckets).map((r) => ({
            ...r,
            user_id: userId,
            note: next.visits[r.place_id]?.note ?? null,
            // A local file path for now: the photo only shows on the phone
            // that took it until uploads go to Supabase Storage.
            photo_path: next.visits[r.place_id]?.photoUri ?? null,
          })),
        ),
      );

    return {
      ready: authChecked && loaded,
      signedIn: !!userId,
      state,
      places,
      placeById: (id) => byId.get(id),

      sendCode: async (email) => {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase() });
        return error ? 'No pudimos enviar el código. Revisa tu correo e inténtalo de nuevo.' : null;
      },
      verifyCode: async (email, code) => {
        const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
        return error ? 'El código no es válido o ya venció.' : null;
      },
      createProfile: async (name, handle) => {
        if (!userId) return 'Primero ingresa con tu correo.';
        const { data, error } = await supabase
          .from('profiles')
          .insert({ id: userId, name, handle })
          .select('id, name, handle')
          .single();
        if (error) return error.code === '23505' ? 'Ese @usuario ya existe. Prueba otro.' : 'No pudimos crear tu perfil.';
        setState((s) => ({ ...s, user: data as User }));
        return null;
      },

      rankPlace: ({ placeId, sentiment, index, note, photoUri }) => {
        const s = stateRef.current;
        const next: AppState = {
          ...s,
          buckets: insertPlace(s.buckets, sentiment, index, placeId),
          visits: { ...s.visits, [placeId]: { placeId, sentiment, note, photoUri, date: new Date().toISOString() } },
          saved: s.saved.filter((id) => id !== placeId),
        };
        setState(next);
        saveRankings(next);
        if (s.saved.includes(placeId)) {
          write('removing from Quiero ir', () => supabase.from('saved').delete().match({ user_id: userId, place_id: placeId }));
        }
      },
      unrankPlace: (placeId) => {
        const s = stateRef.current;
        const { [placeId]: _, ...visits } = s.visits;
        const next: AppState = { ...s, buckets: removePlace(s.buckets, placeId), visits };
        setState(next);
        write('removing a ranking', () => supabase.from('rankings').delete().match({ user_id: userId, place_id: placeId }));
        saveRankings(next);
      },
      toggleSaved: (placeId) => {
        const s = stateRef.current;
        const isSaved = s.saved.includes(placeId);
        setState({ ...s, saved: isSaved ? s.saved.filter((id) => id !== placeId) : [...s.saved, placeId] });
        write('updating Quiero ir', () =>
          isSaved
            ? supabase.from('saved').delete().match({ user_id: userId, place_id: placeId })
            : supabase.from('saved').insert({ user_id: userId, place_id: placeId }),
        );
      },
      addPlace: async (input) => {
        const id = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const { data, error } = await supabase
          .from('places')
          .insert({
            id,
            name: input.name,
            district: input.district,
            category: input.category,
            lat: input.lat,
            lng: input.lng,
            is_new: input.isNew ?? false,
            added_by: userId,
          })
          .select('*')
          .single();
        if (error) throw error;
        const place = toPlace(data as PlaceRow, userId);
        setPlaces((ps) => [...ps, place]);
        return place;
      },
      signOut: () => {
        supabase.auth.signOut();
      },
    };
  }, [state, places, userId, authChecked, loaded, write]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
