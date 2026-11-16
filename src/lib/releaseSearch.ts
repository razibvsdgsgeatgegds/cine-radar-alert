export interface SearchRelease {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
}

export function classifyReleaseSearch<T extends SearchRelease>(items: T[], query: string, today: string) {
  const unique = [...new Map(items.map(item => [item.id, item])).values()];
  const normalized = query.trim().toLocaleLowerCase();
  return {
    results: unique.filter(item => (item.release_date || item.first_air_date || '') >= today),
    pastMatch: unique.find(item => {
      const date = item.release_date || item.first_air_date || '';
      return date !== '' && date < today && (item.title || item.name || '').toLocaleLowerCase() === normalized;
    }),
  };
}