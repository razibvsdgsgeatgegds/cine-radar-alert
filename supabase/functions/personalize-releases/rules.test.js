import { test, expect } from 'bun:test';
import { futureCandidates, validatedPicks } from './rules.ts';
test('AI recommendations exclude past releases but include today', () => {
  const entries = [{id:1,type:'movie',title:'Past',date:'2026-11-15',overview:''},{id:2,type:'series',title:'Today',date:'2026-11-16',overview:''}];
  expect(futureCandidates(entries, '2026-11-16').map(i => i.id)).toEqual([2]);
});
test('AI output cannot invent titles outside the candidate list', () => {
  expect(validatedPicks([{id:99,type:'movie',reason:'Invented'},{id:2,type:'series',reason:'Match'}], [{id:2,type:'series',title:'Today',date:'2026-11-16',overview:''}]).map(i => i.id)).toEqual([2]);
});