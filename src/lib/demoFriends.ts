import type { Sentiment } from './ranking';

// Sample activity so the Amigos tab is not empty before the backend exists.
// The screen labels it as an example; replace with real friends from Supabase.
export type FriendActivity = {
  id: string;
  friend: string;
  handle: string;
  placeId: string;
  sentiment: Sentiment;
  score: number;
  note?: string;
  hoursAgo: number;
};

export const DEMO_ACTIVITY: FriendActivity[] = [
  { id: 'a1', friend: 'Valeria', handle: 'vale.come', placeId: 'origen', sentiment: 'loved', score: 9.4, note: 'El mejor flat white de Barranco', hoursAgo: 2 },
  { id: 'a2', friend: 'Diego', handle: 'diegoenlima', placeId: 'manolo', sentiment: 'fine', score: 6.1, hoursAgo: 5 },
  { id: 'a3', friend: 'Camila', handle: 'cami.brunch', placeId: 'pan-chola', sentiment: 'loved', score: 8.9, note: 'Pan de masa madre increíble', hoursAgo: 20 },
  { id: 'a4', friend: 'Valeria', handle: 'vale.come', placeId: 'isolina', sentiment: 'loved', score: 9.8, hoursAgo: 30 },
  { id: 'a5', friend: 'Andrés', handle: 'andres.k', placeId: 'arabica', sentiment: 'fine', score: 5.7, note: 'Rico pero siempre lleno', hoursAgo: 52 },
];
