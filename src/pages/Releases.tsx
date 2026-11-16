import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { tmdbApi } from '@/services/tmdb';
import { TMDB_MOVIE_GENRE_MAP, TMDB_TV_GENRE_MAP } from '@/utils/genreMapping';
import { toast as sonnerToast } from '@/components/ui/sonner';
import { Bell, CalendarDays, Film, Tv, ArrowLeft, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import watchverseLogo from '@/assets/watchverse-logo.png';

type PublicType = 'movies' | 'series';
type ReleaseWindow = 'week' | 'month' | 'soonest';

interface ReleaseItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  vote_average?: number;
}

const MOVIE_GENRE_BY_ID: Record<number, string> = Object.fromEntries(
  Object.entries(TMDB_MOVIE_GENRE_MAP).map(([name, id]) => [id, name])
);
const TV_GENRE_BY_ID: Record<number, string> = Object.fromEntries(
  Object.entries(TMDB_TV_GENRE_MAP).map(([name, id]) => [id, name])
);

const WINDOWS: { key: ReleaseWindow; label: string }[] = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'soonest', label: 'Next 4 Months' },
];

const WINDOW_LABELS: Record<ReleaseWindow, string> = {
  week: 'this week',
  month: 'this month',
  soonest: 'coming soon',
};

const daysUntil = (dateStr?: string): number | null => {
  if (!dateStr) return null;
  const diff = Math.ceil(
    (new Date(`${dateStr}T00:00:00Z`).getTime() - new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z').getTime()) / 86400000
  );
  return diff;
};

const daysLabel = (diff: number | null): string => {
  if (diff === null) return 'Date TBA';
  if (diff === 0) return 'Out Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0) return 'Just Released';
  return `In ${diff} days`;
};

export default function Releases() {
  const { type: typeParam } = useParams<{ type?: string }>();
  const navigate = useNavigate();
  const type: PublicType = typeParam === 'series' ? 'series' : 'movies';
  const [activeWindow, setWindow] = useState<ReleaseWindow>('week');
  const requestId = useRef(0);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<ReleaseItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReleaseItem | null>(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  const typeLabel = type === 'movies' ? 'Movies' : 'Series';
  const heading = type === 'movies'
    ? `New Movies ${WINDOW_LABELS[activeWindow] === 'coming soon' ? 'Coming Soon' : WINDOW_LABELS[activeWindow]}`
    : `New Series ${WINDOW_LABELS[activeWindow] === 'coming soon' ? 'Coming Soon' : WINDOW_LABELS[activeWindow]}`;

  // Per-route SEO metadata
  useEffect(() => {
    const title = `${heading} — Release Dates & Countdowns | WatchVerse`;
    const desc = `Browse upcoming ${typeLabel.toLowerCase()} ${WINDOW_LABELS[activeWindow]} with release dates, posters and countdowns. Get an alert before a ${type === 'movies' ? 'movie' : 'series'} releases — free on WatchVerse.`;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    window.scrollTo(0, 0);
  }, [heading, type, typeLabel, activeWindow]);

  // JSON-LD ItemList so search engines see the release data
  useEffect(() => {
    if (items.length === 0) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'releases-jsonld';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${heading} — WatchVerse`,
      itemListElement: items.slice(0, 20).map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': type === 'movies' ? 'Movie' : 'TVSeries',
          name: item.title || item.name,
          image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
          ...(type === 'movies'
            ? { datePublished: item.release_date }
            : { startDate: item.first_air_date }),
        },
      })),
    });
    document.head.appendChild(script);
    return () => { document.getElementById('releases-jsonld')?.remove(); };
  }, [items, heading, type]);

  const fetchItems = useCallback(async (targetPage: number, reset: boolean) => {
    const request = ++requestId.current;
    setLoading(true); setLoadError(false);
    if (reset) setItems([]);
    try {
      const data = await tmdbApi.discoverUpcomingPublic(type === 'movies' ? 'movie' : 'series', activeWindow, targetPage);
      if (request !== requestId.current) return;
      const today = new Date().toISOString().split('T')[0];
      const results: ReleaseItem[] = (data.results || []).filter((item: ReleaseItem) => (item.release_date || item.first_air_date || '') >= today);
      setTotalPages(Math.min(data.total_pages || 1, 5));
      setItems(prev => Array.from(new Map((reset ? results : [...prev, ...results]).map(item => [item.id, item])).values()));
    } catch {
      if (request === requestId.current) setLoadError(true);
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }, [type, activeWindow]);

  useEffect(() => {
    setPage(1);
    fetchItems(1, true);
  }, [fetchItems]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchItems(next, false);
  };

  const handleNotify = async () => {
    if (!selected) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail.trim())) { setEmailError('Enter a valid email address.'); return; }
    setEmailError('');
    setNotifying(true);
    try {
      const { error } = await supabase.from('notification_subscribers').insert({
        email: notifyEmail.trim().toLowerCase(),
        name: null,
        is_active: true,
        notification_type: type === 'movies' ? 'movies' : 'series',
      });
      if (error && error.code !== '23505') throw error;
      setNotified(true);
      sonnerToast.success('You joined the release-news list.');
    } catch {
      sonnerToast.error('Something went wrong, try again.');
    } finally {
      setNotifying(false);
    }
  };

  const getItemTitle = (item: ReleaseItem) => item.title || item.name || 'Untitled';
  const getItemDate = (item: ReleaseItem) => (type === 'movies' ? item.release_date : item.first_air_date) || '';
  const getItemGenres = (item: ReleaseItem) =>
    (item.genre_ids || [])
      .map(id => (type === 'movies' ? MOVIE_GENRE_BY_ID[id] : TV_GENRE_BY_ID[id]))
      .filter(Boolean)
      .slice(0, 3);

  const grid = useMemo(() => items.filter(i => (i.title || i.name || '').toLowerCase().includes(search.toLowerCase())), [items, search]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <nav className="sticky top-0 z-40 border-b border-primary/10 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src={watchverseLogo} alt="WatchVerse Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex-shrink-0" />
            <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-electric-blue bg-clip-text text-transparent truncate">
              WatchVerse
            </span>
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
              <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />Home</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-primary hover:shadow-glow transition-all text-xs sm:text-sm px-3 sm:px-4">
              <Link to="/#auth-section">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {/* Heading */}
        <div className="mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            THE WATCHVERSE CALENDAR
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            {heading}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            The stories coming next. Find your next movie or series.
          </p>
        </div>

        {/* Type tabs */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-md border border-primary/20 bg-card/50 p-1">
            {(['movies', 'series'] as PublicType[]).map(t => (
              <Button variant="ghost"
                key={t}
                onClick={() => navigate(`/releases/${t}`)}
                className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  type === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'movies' ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
                {t === 'movies' ? 'Movies' : 'Series'}
              </Button>
            ))}
          </div>
        </div>

        {/* Window chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8">
          {WINDOWS.map(w => (
            <Button variant="ghost"
              key={w.key}
              onClick={() => setWindow(w.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm border transition-all ${
                activeWindow === w.key
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {w.label}
            </Button>
          ))}
        </div>

        <Input aria-label="Find a release" placeholder="Find a title in these releases…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-md mb-6" />
        {/* Grid */}
        {loading && grid.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-card/40 border border-primary/10 animate-pulse" />
            ))}
          </div>
        ) : grid.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>{loadError ? "Releases couldn't load right now." : 'No releases found for this period.'}</p>
            <Button variant="outline" className="mt-4" onClick={() => loadError ? fetchItems(1, true) : setWindow('soonest')}>{loadError ? 'Try again' : 'Next 4 Months'}</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
              {grid.map(item => {
                const diff = daysUntil(getItemDate(item));
                return (
                  <Button variant="ghost"
                    key={`${type}-${item.id}`}
                    onClick={() => { setSelected(item); setNotified(false); setNotifyEmail(''); setEmailError(''); }}
                    className="release-card group block h-auto w-full p-0 whitespace-normal text-left rounded-lg overflow-hidden bg-card/50 border border-primary/10 hover:border-primary/40 transition-all hover:shadow-glow cursor-pointer"
                  >
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img
                        src={tmdbApi.getPosterUrl(item.poster_path)}
                        alt={getItemTitle(item)}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold backdrop-blur-md ${
                        diff !== null && diff <= 1
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/70 text-foreground border border-primary/20'
                      }`}>
                        {daysLabel(diff)}
                      </span>
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <h3 className="text-xs sm:text-sm font-semibold line-clamp-1">{getItemTitle(item)}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        {tmdbApi.formatDate(getItemDate(item))}
                      </p>
                      <p className="hidden sm:block text-[11px] text-muted-foreground/80 mt-1 line-clamp-2 min-h-[2.2rem]">
                        {item.overview}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <Button onClick={loadMore} disabled={loading} variant="outline" className="border-primary/30 hover:border-primary/50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}

        {/* Conversion strip */}
        <div className="mt-12 sm:mt-16 border-t border-border p-6 sm:p-8 text-center">
          <h2 className="text-lg sm:text-2xl font-bold">
            Want alerts for <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">your</span> taste?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Create a free account, pick the genres and platforms you love, and WatchVerse watches the calendar for you.
          </p>
          <Button asChild size="lg" className="mt-5 bg-gradient-primary hover:shadow-glow transition-all">
            <Link to="/#auth-section">Create free account</Link>
          </Button>
        </div>
      </main>

      {/* Detail + notify dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-2xl bg-card border-primary/20 max-h-[85vh] overflow-y-auto">
          {selected && (
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <img
                src={tmdbApi.getPosterUrl(selected.poster_path)}
                alt={getItemTitle(selected)}
                className="w-28 sm:w-40 aspect-[2/3] object-cover rounded-lg flex-shrink-0 mx-auto sm:mx-0"
              />
              <div className="min-w-0 flex-1">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-lg sm:text-2xl leading-snug">{getItemTitle(selected)}</DialogTitle>
                  <DialogDescription asChild>
                    <div className="mt-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {tmdbApi.formatDate(getItemDate(selected))}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-neon-pink/10 border border-neon-pink/20 text-xs text-neon-pink font-medium">
                          {daysLabel(daysUntil(getItemDate(selected)))}
                        </span>
                      </div>
                      {getItemGenres(selected).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {getItemGenres(selected).map(g => (
                            <span key={g} className="px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground">{g}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-6">
                  {selected.overview || 'No synopsis available yet.'}
                </p>

                {/* Notify capture */}
                <div className="mt-4 rounded-lg border border-primary/20 bg-background/50 p-4">
                  {notified ? (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle className="h-4 w-4" />
                      You're on the release-news list.
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Bell className="h-4 w-4 text-primary" />
                        Join the release-news list
                      </p>
                      <div className="mt-2.5 flex gap-2">
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={notifyEmail}
                          aria-invalid={!!emailError}
                          onChange={(e) => { setNotifyEmail(e.target.value); setEmailError(''); }}
                          className="bg-background/70 border-primary/20 focus:border-primary/50"
                        />
                        <Button
                          onClick={handleNotify}
                          disabled={notifying || !notifyEmail}
                          className="bg-gradient-to-r from-neon-purple to-neon-pink hover:shadow-glow whitespace-nowrap"
                        >
                          {notifying ? '...' : 'Notify Me'}
                        </Button>
                      </div>
                      {emailError && <p role="alert" className="mt-2 text-sm text-destructive">{emailError}</p>}
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Updates about upcoming releases. This does not schedule an alert for this specific title.
                      </p>
                    </>
                  )}
                </div>

                <Button asChild variant="ghost" className="mt-3 text-xs text-muted-foreground">
                  <Link to="/">Track your full watchlist — free account</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
