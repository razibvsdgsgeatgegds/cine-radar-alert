import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { tmdbApi } from '@/services/tmdb';
import type { Movie, TVShow } from '@/types';

interface Pick { id: number; type: 'movie' | 'series'; reason: string }
interface Props { movies: Movie[]; series: TVShow[]; onSelect: (item: Movie | TVShow, type: 'movie' | 'series') => void }
export function AIPicks({ movies, series, onSelect }: Props) {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRequested, setHasRequested] = useState(false);
  const candidates = [...movies.map(item => ({ id:item.id,type:'movie' as const,title:item.title,date:item.release_date,overview:item.overview.slice(0,1500) })), ...series.map(item => ({id:item.id,type:'series' as const,title:item.name,date:item.first_air_date,overview:item.overview.slice(0,1500)}))];
  const generate = async () => {
    setLoading(true); setError(''); setHasRequested(true);
    try {
      const {data,error:invokeError} = await supabase.functions.invoke('personalize-releases', {body:{candidates}});
      if (invokeError || data?.error) throw new Error(data?.error || 'AI picks are unavailable right now. Your regular feed is ready below.');
      setPicks(Array.isArray(data?.picks) ? data.picks : []);
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not create AI picks.'); }
    finally { setLoading(false); }
  };
  return <section className="border-y border-border py-6 mb-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="text-primary w-5 h-5" />Your AI shortlist</h3><p className="text-muted-foreground text-sm mt-2">A fresh perspective on upcoming stories, matched to your saved tastes.</p></div><Button onClick={generate} disabled={loading || candidates.length === 0} variant="outline">{loading ? <Loader2 className="animate-spin" /> : <Sparkles />}{loading ? 'Finding your picks…' : 'Find my picks'}</Button></div>
    {error && <p role="alert" className="text-sm text-muted-foreground mt-4">{error}</p>}
    {!error && hasRequested && !loading && picks.length === 0 && <p className="text-sm text-muted-foreground mt-4">No AI picks from this set yet. Try a different set of releases.</p>}
    {picks.length > 0 && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">{picks.map(pick => {
      const item = pick.type === 'movie' ? movies.find(item => item.id === pick.id) : series.find(item => item.id === pick.id);
      if (!item) return null;
      const title = 'title' in item ? item.title : item.name;
      return <div key={`${pick.type}-${pick.id}`} className="flex gap-3"><img src={tmdbApi.getPosterUrl(item.poster_path)} alt={title} className="w-16 h-24 rounded-md object-cover shrink-0" /><div className="min-w-0"><h4 className="font-semibold text-sm">{title}</h4><p className="text-xs text-muted-foreground leading-relaxed mt-1">{pick.reason}</p><Button variant="link" className="px-0 h-auto py-2 text-xs" onClick={() => onSelect(item,pick.type)}>View story <ArrowRight /></Button></div></div>;
    })}</div>}
  </section>;
}