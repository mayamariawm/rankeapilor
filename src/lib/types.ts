import type { Buckets, Sentiment } from './ranking';

export type District = 'Miraflores' | 'Barranco';

export type Category = 'cafe' | 'brunch' | 'panaderia' | 'restaurante' | 'bar';

export type Place = {
  id: string;
  name: string;
  district: District;
  category: Category;
  lat: number;
  lng: number;
  /** Opened in the last ~6 months. Drives the "Nuevos" filter. */
  isNew?: boolean;
  /** False until someone on the team has checked the name and pin on site. */
  verified: boolean;
  addedByUser?: boolean;
};

export type Visit = {
  placeId: string;
  sentiment: Sentiment;
  note?: string;
  photoUri?: string;
  date: string; // ISO
};

export type User = { name: string; handle: string };

export type AppState = {
  user: User | null;
  visits: Record<string, Visit>;
  buckets: Buckets;
  saved: string[];
  customPlaces: Place[];
};

export const CATEGORY_LABELS: Record<Category, string> = {
  cafe: 'Cafés',
  brunch: 'Brunch',
  panaderia: 'Panaderías',
  restaurante: 'Restaurantes',
  bar: 'Bares',
};

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  loved: 'Me encantó',
  fine: 'Estuvo bien',
  disliked: 'No me gustó',
};

export const CATEGORY_SINGULAR: Record<Category, string> = {
  cafe: 'Café',
  brunch: 'Brunch',
  panaderia: 'Panadería',
  restaurante: 'Restaurante',
  bar: 'Bar',
};
