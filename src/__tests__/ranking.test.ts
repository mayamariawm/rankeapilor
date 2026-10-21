import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  answer,
  emptyBuckets,
  insertPlace,
  pivotIndex,
  rankedList,
  scoreAt,
  scoreFor,
  startComparison,
  type Comparison,
} from '../lib/ranking.ts';

// Runs the comparison flow against a hidden "true" order to check that
// binary insertion lands every place in the right slot.
function insertByAsking(bucket: string[], newId: string, truth: string[]): string[] {
  let c: Comparison | number | null = startComparison(bucket);
  let asked = 0;
  while (c !== null && typeof c !== 'number') {
    const pivot = bucket[pivotIndex(c)];
    c = answer(c, truth.indexOf(newId) < truth.indexOf(pivot));
    asked++;
  }
  assert.ok(asked <= Math.ceil(Math.log2(bucket.length + 1)), `asked ${asked} for ${bucket.length}`);
  const out = [...bucket];
  out.splice(c ?? 0, 0, newId);
  return out;
}

test('binary insertion recovers the true order', () => {
  const truth = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
  const shuffled = ['g', 'b', 'l', 'a', 'e', 'k', 'c', 'i', 'd', 'h', 'f', 'j'];
  let bucket: string[] = [];
  for (const id of shuffled) bucket = insertByAsking(bucket, id, truth);
  assert.deepEqual(bucket, truth);
});

test('first place in a bucket needs no question', () => {
  assert.equal(startComparison([]), null);
});

test('scores spread across the bucket range', () => {
  assert.equal(scoreAt('loved', 0, 1), 10);
  assert.equal(scoreAt('loved', 0, 3), 10);
  assert.equal(scoreAt('loved', 2, 3), 6.8);
  assert.equal(scoreAt('fine', 1, 3), 5.1);
  assert.equal(scoreAt('disliked', 1, 2), 0);
});

test('re-ranking moves a place instead of duplicating it', () => {
  let b = emptyBuckets();
  b = insertPlace(b, 'loved', 0, 'x');
  b = insertPlace(b, 'loved', 1, 'y');
  b = insertPlace(b, 'fine', 0, 'x');
  assert.deepEqual(b.loved, ['y']);
  assert.deepEqual(b.fine, ['x']);
  const list = rankedList(b);
  assert.deepEqual(list.map((e) => [e.placeId, e.rank]), [['y', 1], ['x', 2]]);
  assert.equal(scoreFor(b, 'x'), 6.7);
  assert.equal(scoreFor(b, 'zzz'), null);
});
