import { test, expect } from 'bun:test';
import { classifyReleaseSearch } from './releaseSearch.ts';

test('search shows today and future releases, never past or undated titles', () => {
  const result = classifyReleaseSearch([
    { id: 1, title: 'Old', release_date: '2026-11-15' },
    { id: 2, title: 'Today', release_date: '2026-11-16' },
    { id: 3, name: 'Future', first_air_date: '2027-05-01' },
    { id: 4, title: 'Unknown', release_date: '' },
  ], 'future', '2026-11-16');
  expect(result.results.map(item => item.id)).toEqual([2, 3]);
});
test('past exact searches handle surrounding spaces and case', () => {
  const result = classifyReleaseSearch([{ id: 1, title: 'Interstellar', release_date: '2014-11-07' }], ' INTERSTELLAR ', '2026-11-16');
  expect(result.pastMatch?.release_date).toBe('2014-11-07');
  expect(result.results).toEqual([]);
});
test('search removes duplicates across result pages', () => {
  const item = { id: 1, title: 'Next', release_date: '2027-01-01' };
  expect(classifyReleaseSearch([item, item], 'next', '2026-11-16').results).toEqual([item]);
});