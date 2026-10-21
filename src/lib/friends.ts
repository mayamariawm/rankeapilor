import { useCallback, useEffect, useState } from 'react';
import type { Sentiment } from './ranking';
import { supabase } from './supabase';

export type FriendActivity = {
  id: string;
  friend: string;
  handle: string;
  placeId: string;
  sentiment: Sentiment;
  score: number;
  note?: string;
  date: string; // ISO
};

/** Rankings by people the user follows, newest first. Pass a place id for one place only. */
export function useFriendFeed(placeId?: string) {
  const [items, setItems] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('friend_feed')
      .select('user_id, place_id, sentiment, score, note, created_at, friend_name, handle')
      .order('created_at', { ascending: false })
      .limit(50);
    if (placeId) query = query.eq('place_id', placeId);
    const { data, error } = await query;
    if (error) console.warn('Rankea: could not load friend feed', error);
    setItems(
      (data ?? []).map((r) => ({
        id: `${r.user_id}:${r.place_id}`,
        friend: r.friend_name,
        handle: r.handle,
        placeId: r.place_id,
        sentiment: r.sentiment,
        score: Number(r.score),
        note: r.note ?? undefined,
        date: r.created_at,
      })),
    );
    setLoading(false);
  }, [placeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh };
}

/** Follows someone by @usuario. Resolves to an error message in Spanish, or null. */
export async function followHandle(raw: string): Promise<string | null> {
  const handle = raw.trim().replace(/^@/, '').toLowerCase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 'Primero ingresa a tu cuenta.';
  const { data: person } = await supabase.from('profiles').select('id').eq('handle', handle).maybeSingle();
  if (!person) return `No encontramos a @${handle}.`;
  if (person.id === auth.user.id) return 'Ese eres tú.';
  const { error } = await supabase.from('follows').insert({ follower: auth.user.id, followee: person.id });
  if (error && error.code !== '23505') return 'No pudimos seguir a esa persona.';
  return null;
}

export function ago(iso: string): string {
  const h = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 36e5));
  if (h < 1) return 'hace un rato';
  return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} d`;
}
