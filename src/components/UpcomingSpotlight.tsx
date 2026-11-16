import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { tmdbApi } from '@/services/tmdb';

interface PreviewRelease {
  id: number; title?: string; name?: string; poster_path: string | null;
  overview: string; release_date?: string; first_air_date?: string;
}

export function UpcomingSpotlight() {
  const [type, setType] = useState<'movie' | 'series'>('movie');
  const [items, setItems] = useState<PreviewRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PreviewRelease | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true); setItems([]);
    void tmdbApi.discoverUpcomingPublic(type, 'soonest').then(data => {
      if (!active) return;
      const today = new Date().toISOString().split('T')[0];
      setItems((data.results || []).filter((item: PreviewRelease) => item.poster_path && (item.release_date || item.first_air_date || '') >= today).slice(0, 6));
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [type]);
  const path = `/releases/${type === 'movie' ? 'movies' : 'series'}`;
  return <section id="up-next" className="border-b border-border py-10 sm:py-14">
    <div className="container mx-auto px-5 sm:px-8">
      <div className="flex flex-wrap justify-between items-end gap-5 mb-7">
        <div><p className="section-eyebrow mb-2">THE NEXT BIG THING</p><h2 className="text-3xl sm:text-4xl font-semibold">The wait starts here.</h2></div>
        <div className="flex items-center gap-2"><Button variant={type === 'movie' ? 'default' : 'ghost'} onClick={() => setType('movie')} aria-pressed={type === 'movie'}><Film />Movies</Button><Button variant={type === 'series' ? 'default' : 'ghost'} onClick={() => setType('series')} aria-pressed={type === 'series'}><Tv />Series</Button></div>
      </div>
      {loading ? <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">{[0,1,2,3].map(i => <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />)}</div>
      : items.length ? <div className={items.length < 3 ? 'grid sm:grid-cols-2 gap-6' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'}>
        {items.map((item, index) => <Button key={item.id} variant="ghost" onClick={() => setSelected(item)} className={items.length < 3 ? 'spotlight-feature group h-auto p-0 whitespace-normal text-left overflow-hidden rounded-lg bg-card border border-border flex items-stretch justify-start gap-0' : 'group block h-auto p-0 whitespace-normal text-left overflow-hidden rounded-lg bg-card border border-border'}>
          <div className={items.length < 3 ? 'relative w-2/5 shrink-0 aspect-[2/3] overflow-hidden' : 'relative aspect-[2/3] overflow-hidden'}><img src={tmdbApi.getPosterUrl(item.poster_path)} alt={item.title || item.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" /><span className="absolute top-3 left-3 bg-cinema-background/80 text-cinema-foreground text-xs px-2 py-1 rounded-md">UPCOMING</span></div>
          <div className="p-4 sm:p-5 min-w-0"><p className="text-neon-cyan text-xs font-semibold mb-2">{String(index + 1).padStart(2, '0')} / ON THE RADAR</p><h3 className="text-lg font-semibold leading-snug">{item.title || item.name}</h3><p className="text-muted-foreground text-xs mt-3 flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" />{tmdbApi.formatDate(item.release_date || item.first_air_date || '')}</p>{items.length < 3 && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-4">{item.overview}</p>}<span className="inline-flex items-center gap-2 text-primary text-sm mt-4">Discover the story <ArrowRight className="h-4 w-4" /></span></div>
        </Button>)}
        {items.length === 1 && <div className="flex flex-col justify-center border-l-2 border-primary pl-6 py-6"><p className="section-eyebrow mb-3">MAKE ROOM FOR SOMETHING NEW</p><h3 className="text-3xl font-semibold max-w-sm">Your next favourite isn't out yet.</h3><p className="text-muted-foreground mt-4 max-w-sm leading-relaxed">The stories, the dates, the anticipation. Find what's next for your watchlist.</p><Button asChild variant="link" className="self-start px-0 mt-4"><Link to={path}>Browse the calendar <ArrowRight /></Link></Button></div>}
      </div> : <div className="border-l-2 border-neon-cyan pl-6 py-8"><h3 className="text-2xl font-semibold">More stories on the horizon.</h3><p className="text-muted-foreground mt-2">Explore upcoming release dates in the calendar.</p></div>}
      <Button asChild variant="outline" className="mt-7"><Link to={path}>Explore all upcoming {type === 'movie' ? 'movies' : 'series'} <ArrowRight /></Link></Button>
    </div>
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">{selected && <><DialogHeader><DialogTitle>{selected.title || selected.name}</DialogTitle><DialogDescription>{tmdbApi.formatDate(selected.release_date || selected.first_air_date || '')}</DialogDescription></DialogHeader><div className="flex gap-5"><img src={tmdbApi.getPosterUrl(selected.poster_path)} alt={selected.title || selected.name} className="w-28 sm:w-36 aspect-[2/3] object-cover self-start rounded-md" /><p className="text-sm text-muted-foreground leading-relaxed">{selected.overview || 'The story is still under wraps.'}</p></div><Button asChild><Link to={path}>View release calendar <ArrowRight /></Link></Button></>}</DialogContent></Dialog>
  </section>;
}