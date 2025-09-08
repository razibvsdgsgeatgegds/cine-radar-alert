import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { Settings, Radar, Star, TrendingUp, Loader2, Search } from 'lucide-react';
import { ContentCard } from '@/components/ContentCard';
import { ContentDetailsDialog } from '@/components/ContentDetailsDialog';
import { Movie, TVShow } from '@/types';
import { tmdbApi } from '@/services/tmdb';
import { getMovieGenreIds, getSeriesGenreIds } from '@/utils/genreMapping';
import { useNavigate } from 'react-router-dom';
import { NotificationPrompt } from './NotificationPrompt';
import { DashboardFilters } from './DashboardFilters';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ item: Movie | TVShow; type: 'movie' | 'series' } | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [filters, setFilters] = useState({
    languages: user?.languages || [],
    industries: user?.industries || [],
    dateRange: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchContent = useCallback(async (currentFilters: typeof filters, query: string = '') => {
    if (!user) return;

    try {
      setLoading(true);
      setIsSearching(!!query);
      
      let moviesData, seriesData;
      
      if (query.trim()) {
        // Search mode - search all content but respect date filters
        console.log('Searching for:', query, 'with filters:', currentFilters);
        const [moviesResult, seriesResult] = await Promise.all([
          tmdbApi.searchMovies(query, user.location.country, currentFilters.languages, currentFilters.industries, currentFilters.dateRange),
          tmdbApi.searchSeries(query, user.location.country, currentFilters.languages, currentFilters.industries, currentFilters.dateRange),
        ]);
        moviesData = moviesResult;
        seriesData = seriesResult;
      } else {
        // Default mode - show user's preferred content
        const movieGenreIds = getMovieGenreIds(user.interests.movies);
        const seriesGenreIds = getSeriesGenreIds(user.interests.series);
        
        console.log('User Movie Interests:', user.interests.movies);
        console.log('User Series Interests:', user.interests.series);
        console.log('User Location:', user.location.country);
        console.log('Current Filters:', currentFilters);

        const [moviesResult, seriesResult] = await Promise.all([
          tmdbApi.discoverMovies(movieGenreIds, user.location.country, currentFilters.languages, currentFilters.industries, [], currentFilters.dateRange),
          tmdbApi.discoverSeries(seriesGenreIds, user.location.country, currentFilters.languages, currentFilters.industries, [], currentFilters.dateRange),
        ]);
        moviesData = moviesResult;
        seriesData = seriesResult;
      }

      setMovies(moviesData.results?.slice(0, 12) || []);
      setSeries(seriesData.results?.slice(0, 12) || []);
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
        return false; // Remove from list
      }
      return true; // Keep in list
    });

    if (releasedItems.length > 0) {
      setUser({ ...user, notification_list: updatedNotificationList });
      toast.info(`${releasedItems.length} item(s) on your watchlist have been released!`);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (user) {
      fetchContent(filters, searchQuery);
      checkAndSendReleaseNotifications();

      if ('Notification' in window && Notification.permission === 'default') {
        const dismissed = sessionStorage.getItem('notificationPromptDismissed');
        if (!dismissed) {
          const timer = setTimeout(() => setShowNotificationPrompt(true), 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [user, fetchContent, checkAndSendReleaseNotifications, filters, searchQuery]);

  const handleCardClick = (item: Movie | TVShow, type: 'movie' | 'series') => {
    setSelectedItem({ item, type });
  };

  const handlePromptDismiss = () => {
    sessionStorage.setItem('notificationPromptDismissed', 'true');
    setShowNotificationPrompt(false);
  };

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchContent(newFilters, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchContent(filters, query);
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
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-neon-pink rounded-lg flex items-center justify-center">
                <Radar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent">
                  RadarApp
                </h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <DashboardFilters initialFilters={filters} onApplyFilters={handleApplyFilters} loading={loading} />

          <div className="mb-6">
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
          </div>

          <div className="space-y-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader><CardTitle className="flex items-center text-neon-cyan"><Star className="w-5 h-5 mr-2" />Upcoming Movies</CardTitle><CardDescription>{searchQuery ? `Search results for "${searchQuery}"` : 'Based on your movie preferences'}</CardDescription></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-muted-foreground py-8"><Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" /><p>Scanning for upcoming movies...</p></div>
                ) : movies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                  <div className="text-center text-muted-foreground py-8"><Radar className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No upcoming movies found for your preferences.</p></div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader><CardTitle className="flex items-center text-neon-pink"><TrendingUp className="w-5 h-5 mr-2" />Upcoming Series</CardTitle><CardDescription>{searchQuery ? `Search results for "${searchQuery}"` : 'Based on your series preferences'}</CardDescription></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-muted-foreground py-8"><Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" /><p>Scanning for upcoming series...</p></div>
                ) : series.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                  <div className="text-center text-muted-foreground py-8"><Radar className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No upcoming series found for your preferences.</p></div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};
