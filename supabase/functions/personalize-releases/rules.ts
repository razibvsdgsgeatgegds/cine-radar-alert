export interface Candidate { id: number; type: 'movie' | 'series'; title: string; date: string; overview: string }
export function futureCandidates(items: Candidate[], today: string) {
  return items.filter(item => /^\d{4}-\d{2}-\d{2}$/.test(item.date) && item.date >= today);
}
export function validatedPicks(picks: { id: number; type: string; reason: string }[], candidates: Candidate[]) {
  const allowed = new Set(candidates.map(item => `${item.type}-${item.id}`));
  const seen = new Set<string>();
  return picks.filter(pick => {
    const key = `${pick.type}-${pick.id}`;
    if (!allowed.has(key) || seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, 6);
}