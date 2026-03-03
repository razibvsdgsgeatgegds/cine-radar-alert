import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { Settings, Star, TrendingUp, Loader2, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import watchverseLogo from '@/assets/watchverse-logo.png';
import { ContentCard } from '@/components/ContentCard';
import { ContentDetailsDialog } from '@/components/ContentDetailsDialog';
import { Movie, TVShow } from '@/types';
import { tmdbApi } from '@/services/tmdb';
import { getMovieGenreIds, getSeriesGenreIds } from '@/utils/genreMapping';
import { useNavigate } from 'react-router-dom';
import { NotificationPrompt } from './NotificationPrompt';
import { DashboardFilters } from './DashboardFilters';
import { ThemeToggle } from './ThemeToggle';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ item: Movie | TVShow; type: 'movie' | 'series' } | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('radar-user-filters');
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch (error) {
        console.error('Failed to parse saved filters:', error);
      }
    }
    return {
      languages: user?.languages || [],
      industries: user?.industries || [],
      dateRange: 'all',
    };
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [oldContentAlert, setOldContentAlert] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchContent = useCallback(async (currentFilters: typeof filters, query: string = '', isResync: boolean = false, page: number = 1) => {
    if (!user) return;

    try {
      setLoading(true);
      setIsSearching(!!query);
      setOldContentAlert(null);
      
      let moviesData, seriesData;
      
      if (query.trim()) {
        const [allMoviesResult, allSeriesResult] = await Promise.all([
          tmdbApi.searchMoviesAll(query, user.location.country, currentFilters.languages, currentFilters.industries),
          tmdbApi.searchSeriesAll(query, user.location.country, currentFilters.languages, currentFilters.industries),
        ]);
        
        const today = new Date().toISOString().split('T')[0];
        const exactMovieMatch = allMoviesResult.results?.find((movie: Movie) => 
          movie.title.toLowerCase() === query.toLowerCase() && movie.release_date < today
        );
        const exactSeriesMatch = allSeriesResult.results?.find((series: TVShow) => 
          series.name.toLowerCase() === query.toLowerCase() && series.first_air_date < today
        );
        
        if (exactMovieMatch) {
          setOldContentAlert(`"${exactMovieMatch.title}" was released on ${tmdbApi.formatDate(exactMovieMatch.release_date)}`);
        } else if (exactSeriesMatch) {
          setOldContentAlert(`"${exactSeriesMatch.name}" was released on ${tmdbApi.formatDate(exactSeriesMatch.first_air_date)}`);
        }
        
        const [moviesResult, seriesResult] = await Promise.all([
          tmdbApi.searchMovies(query, user.location.country, currentFilters.languages, currentFilters.industries, currentFilters.dateRange),
          tmdbApi.searchSeries(query, user.location.country, currentFilters.languages, currentFilters.industries, currentFilters.dateRange),
        ]);
        moviesData = moviesResult;
        seriesData = seriesResult;
      } else {
        const movieGenreIds = getMovieGenreIds(user.interests.movies);
        const seriesGenreIds = getSeriesGenreIds(user.interests.series);

        const [moviesResult, seriesResult] = await Promise.all([
          tmdbApi.discoverMovies(movieGenreIds, user.location.country, currentFilters.languages, currentFilters.industries, [], currentFilters.dateRange, page),
          tmdbApi.discoverSeries(seriesGenreIds, user.location.country, currentFilters.languages, currentFilters.industries, [], currentFilters.dateRange, page),
        ]);
        moviesData = moviesResult;
        seriesData = seriesResult;
      }

      setMovies(moviesData.results?.slice(0, 12) || []);
      setSeries(seriesData.results?.slice(0, 12) || []);
      
      if (isResync) {
        toast.success("Content refreshed with new upcoming releases!");
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error("Failed to fetch content. Please try again later.");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [user]);

  const checkAndSendReleaseNotifications = useCallback(() => {
    if (!user || !user.notifications_enabled || user.notification_list.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const releasedItems: { id: number; type: 'movie' | 'series' }[] = [];
    const updatedNotificationList = user.notification_list.filter(item => {
      const releaseDate = new Date(item.date);
      releaseDate.setHours(0,0,0,0);
      
      if (releaseDate <= today) {
        new Notification(`Release Alert: ${item.name}`, {
          body: `${item.name} is now available!`,
          icon: tmdbApi.getPosterUrl(item.poster_path),
        });
        releasedItems.push({ id: item.id, type: item.type });
        return false;
      }
      return true;
    });

    if (releasedItems.length > 0) {
      setUser({ ...user, notification_list: updatedNotificationList });
      toast.info(`${releasedItems.length} item(s) on your watchlist have been released!`);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (user) {
      fetchContent(filters, searchQuery, false, 1);
      checkAndSendReleaseNotifications();

      if ('Notification' in window && Notification.permission === 'default') {
        const dismissed = sessionStorage.getItem('notificationPromptDismissed');
        if (!dismissed) {
          const timer = setTimeout(() => setShowNotificationPrompt(true), 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [user, checkAndSendReleaseNotifications, filters, searchQuery]);

  const handleCardClick = (item: Movie | TVShow, type: 'movie' | 'series') => {
    setSelectedItem({ item, type });
  };

  const handlePromptDismiss = () => {
    sessionStorage.setItem('notificationPromptDismissed', 'true');
    setShowNotificationPrompt(false);
  };

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    localStorage.setItem('radar-user-filters', JSON.stringify(newFilters));
    fetchContent(newFilters, searchQuery, false, 1);
  };

  const handleResync = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchContent(filters, searchQuery, true, nextPage);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchContent(filters, query, false, 1);
  };

  const handleToggleNotification = (e: React.MouseEvent, item: Movie | TVShow, type: 'movie' | 'series') => {
    e.stopPropagation();
    if (!user) return;

    const isInList = user.notification_list.some(i => i.id === item.id && i.type === type);
    let newNotificationList;

    if (isInList) {
      newNotificationList = user.notification_list.filter(i => !(i.id === item.id && i.type === type));
      toast.info("Removed from your notification list.");
    } else {
      if (!user.notifications_enabled) {
        toast.error("Enable notifications in settings first!");
        return;
      }
      const newItem = {
        id: item.id,
        type: type,
        name: type === 'movie' ? (item as Movie).title : (item as TVShow).name,
        date: type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date,
        poster_path: item.poster_path,
      };
      newNotificationList = [...user.notification_list, newItem];
      toast.success("Added to your notification list!");
    }
    setUser({ ...user, notification_list: newNotificationList });
  };

  if (!user) return null;

  return (
    <>
      <NotificationPrompt
        open={showNotificationPrompt}
        onOpenChange={setShowNotificationPrompt}
        onDismiss={handlePromptDismiss}
      />
      <ContentDetailsDialog
        item={selectedItem?.item || null}
        type={selectedItem?.type || 'movie'}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
        <header className="border-b border-border/50 backdrop-blur-sm bg-card/20 sticky top-0 z-20">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:space-x-3 min-w-0">
              <img src={watchverseLogo} alt="WatchVerse" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent truncate">
                  WatchVerse
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Welcome, {user.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:space-x-2 flex-shrink-0">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleResync} disabled={loading} className="hidden sm:flex">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Resync
              </Button>
              <Button variant="outline" size="icon" onClick={handleResync} disabled={loading} className="sm:hidden h-9 w-9">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="hidden sm:flex">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigate('/settings')} className="sm:hidden h-9 w-9">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <DashboardFilters initialFilters={filters} onApplyFilters={handleApplyFilters} loading={loading} />

          <div className="mb-4 sm:mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search movies & series..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary/40"
              />
            </div>
            {isSearching && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Searching all upcoming content...
              </p>
            )}
            {oldContentAlert && (
              <div className="max-w-md mx-auto mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm font-medium">{oldContentAlert}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 sm:space-y-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader className="px-3 sm:px-6"><CardTitle className="flex items-center text-neon-cyan text-base sm:text-lg"><Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />Upcoming Movies</CardTitle><CardDescription className="text-xs sm:text-sm">{searchQuery ? `Search results for "${searchQuery}"` : 'Based on your movie preferences'}</CardDescription></CardHeader>
              <CardContent className="px-3 sm:px-6">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8"><Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" /><p className="text-sm">Scanning for upcoming movies...</p></div>
                ) : movies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                    {movies.map(movie => (
                      <ContentCard 
                        key={movie.id} 
                        item={movie} 
                        type="movie" 
                        onClick={() => handleCardClick(movie, 'movie')}
                        onToggleNotification={(e) => handleToggleNotification(e, movie, 'movie')}
                        isNotificationEnabled={user.notification_list.some(i => i.id === movie.id && i.type === 'movie')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8"><Search className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">No upcoming movies found for your preferences.</p></div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader className="px-3 sm:px-6"><CardTitle className="flex items-center text-neon-pink text-base sm:text-lg"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />Upcoming Series</CardTitle><CardDescription className="text-xs sm:text-sm">{searchQuery ? `Search results for "${searchQuery}"` : 'Based on your series preferences'}</CardDescription></CardHeader>
              <CardContent className="px-3 sm:px-6">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8"><Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" /><p className="text-sm">Scanning for upcoming series...</p></div>
                ) : series.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                    {series.map(show => (
                      <ContentCard 
                        key={show.id} 
                        item={show} 
                        type="series" 
                        onClick={() => handleCardClick(show, 'series')} 
                        onToggleNotification={(e) => handleToggleNotification(e, show, 'series')}
                        isNotificationEnabled={user.notification_list.some(i => i.id === show.id && i.type === 'series')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8"><Search className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">No upcoming series found for your preferences.</p></div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};
