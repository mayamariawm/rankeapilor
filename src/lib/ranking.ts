// Beli-style ranking: the user first says how they felt (sentiment bucket),
// then answers "better or worse than X?" until the new place finds its slot.
// Binary search keeps it to about log2(n) questions, so 3 to 5 for most users.

export type Sentiment = 'loved' | 'fine' | 'disliked';

export const SENTIMENTS: Sentiment[] = ['loved', 'fine', 'disliked'];

export type Buckets = Record<Sentiment, string[]>; // place ids, best first

export const SCORE_RANGES: Record<Sentiment, { min: number; max: number }> = {
  loved: { min: 6.8, max: 10 },
  fine: { min: 3.4, max: 6.7 },
  disliked: { min: 0, max: 3.3 },
};

export type Comparison = { lo: number; hi: number };

export const emptyBuckets = (): Buckets => ({ loved: [], fine: [], disliked: [] });

/** Starts a comparison over a bucket. Returns null when no question is needed. */
export function startComparison(bucket: string[]): Comparison | null {
  return bucket.length === 0 ? null : { lo: 0, hi: bucket.length };
}

/** Index in the bucket of the place to compare against. */
export function pivotIndex(c: Comparison): number {
  return Math.floor((c.lo + c.hi) / 2);
}

/** Applies one answer. Returns the next comparison, or the final insert index. */
export function answer(c: Comparison, newIsBetter: boolean): Comparison | number {
  const mid = pivotIndex(c);
  const next = newIsBetter ? { lo: c.lo, hi: mid } : { lo: mid + 1, hi: c.hi };
  return next.lo >= next.hi ? next.lo : next;
}

/** Removes a place from whichever bucket holds it. */
export function removePlace(buckets: Buckets, placeId: string): Buckets {
  return {
    loved: buckets.loved.filter((id) => id !== placeId),
    fine: buckets.fine.filter((id) => id !== placeId),
    disliked: buckets.disliked.filter((id) => id !== placeId),
  };
}

export function insertPlace(
  buckets: Buckets,
  sentiment: Sentiment,
  index: number,
  placeId: string,
): Buckets {
  const cleaned = removePlace(buckets, placeId);
  const bucket = [...cleaned[sentiment]];
  bucket.splice(Math.max(0, Math.min(index, bucket.length)), 0, placeId);
  return { ...cleaned, [sentiment]: bucket };
}

/** Spreads scores evenly across the bucket's range, best place at the top. */
export function scoreAt(sentiment: Sentiment, index: number, size: number): number {
  const { min, max } = SCORE_RANGES[sentiment];
  if (size <= 1) return max;
  const score = max - (index / (size - 1)) * (max - min);
  return Math.round(score * 10) / 10;
}

export type RankedEntry = { placeId: string; sentiment: Sentiment; score: number; rank: number };

/** All ranked places, best first, with a score out of 10 and an overall rank. */
export function rankedList(buckets: Buckets): RankedEntry[] {
  const out: RankedEntry[] = [];
  for (const s of SENTIMENTS) {
    const bucket = buckets[s];
    bucket.forEach((placeId, i) => {
      out.push({ placeId, sentiment: s, score: scoreAt(s, i, bucket.length), rank: out.length + 1 });
    });
  }
  return out;
}

export function scoreFor(buckets: Buckets, placeId: string): number | null {
  for (const s of SENTIMENTS) {
    const i = buckets[s].indexOf(placeId);
    if (i >= 0) return scoreAt(s, i, buckets[s].length);
  }
  return null;
}

/** A ranking as stored on the server: one row per place, ordered by position within its bucket. */
export type RankingRow = { place_id: string; sentiment: Sentiment; position: number; score: number };

/** Every ranked place as a row. Inserting one place shifts the positions and scores of its neighbours, so a sync writes them all. */
export function rankingRows(buckets: Buckets): RankingRow[] {
  return SENTIMENTS.flatMap((s) =>
    buckets[s].map((place_id, position) => ({
      place_id,
      sentiment: s,
      position,
      score: scoreAt(s, position, buckets[s].length),
    })),
  );
}

/** Rebuilds the buckets from server rows, whatever order they arrive in. */
export function bucketsFromRows(rows: Pick<RankingRow, 'place_id' | 'sentiment' | 'position'>[]): Buckets {
  const buckets = emptyBuckets();
  for (const s of SENTIMENTS) {
    buckets[s] = rows
      .filter((r) => r.sentiment === s)
      .sort((a, b) => a.position - b.position)
      .map((r) => r.place_id);
  }
  return buckets;
}
