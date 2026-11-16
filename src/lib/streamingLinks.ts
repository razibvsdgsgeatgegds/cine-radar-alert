const sites: Record<string,string> = {
  Netflix:'https://www.netflix.com/', 'Amazon Prime Video':'https://www.primevideo.com/',
  'Disney Plus':'https://www.disneyplus.com/', Hulu:'https://www.hulu.com/',
  Max:'https://www.max.com/', 'HBO Max':'https://www.max.com/',
  'Apple TV':'https://tv.apple.com/', 'Apple TV Plus':'https://tv.apple.com/',
  'Paramount Plus':'https://www.paramountplus.com/', Peacock:'https://www.peacocktv.com/',
};
export function streamingLink(name: string, tmdbLink?: string | null) {
  if (sites[name]) return sites[name];
  if (!tmdbLink) return null;
  try { const url = new URL(tmdbLink); return url.protocol === 'https:' && (url.hostname === 'www.themoviedb.org' || url.hostname === 'themoviedb.org') ? url.href : null; }
  catch { return null; }
}