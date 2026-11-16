import { test, expect } from 'bun:test';
import { streamingLink } from './streamingLinks.ts';
test('Netflix open button uses its official streaming website', () => {
  expect(streamingLink('Netflix')).toBe('https://www.netflix.com/');
});
test('unknown platform uses trusted title-specific TMDB watch link', () => {
  expect(streamingLink('Unknown', 'https://www.themoviedb.org/movie/123/watch')).toBe('https://www.themoviedb.org/movie/123/watch');
});
test('untrusted provider links cannot be opened', () => {
  expect(streamingLink('Unknown', 'javascript:alert(1)')).toBeNull();
  expect(streamingLink('Unknown', 'https://example.test/')).toBeNull();
});