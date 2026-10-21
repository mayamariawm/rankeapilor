import type { Sentiment } from './ranking';

export const colors = {
  bg: '#FFF8F3',
  card: '#FFFFFF',
  ink: '#2B1D1F',
  muted: '#8A7A7C',
  line: '#F0E3DC',
  primary: '#E2556B',
  primarySoft: '#FCE4E8',
};

export const sentimentColor: Record<Sentiment, string> = {
  loved: '#2E9E6A',
  fine: '#D99A1E',
  disliked: '#C0504D',
};

export const radius = 14;
