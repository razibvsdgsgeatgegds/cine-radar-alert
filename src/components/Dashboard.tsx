import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { Settings, Radar, Calendar, Bell, Star, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { ContentCard } from '@/components/ContentCard';
import { Movie, TVShow } from '@/types';
import { tmdbApi } from '@/services/tmdb';
import { getMovieGenreIds, getSeriesGenreIds } from '@/utils/genreMapping';
import heroImage from '@/assets/hero-radar.jpg';

export const Dashboard: React.FC = () => {
  const { user, clearUser } = useUser();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get user's preferred genre IDs
        const movieGenreIds = getMovieGenreIds(user.interests.movies);
        const seriesGenreIds = getSeriesGenreIds(user.interests.series);

        // Fetch personalized content
        const [moviesData, seriesData] = await Promise.all([
          movieGenreIds.length > 0 
            ? tmdbApi.discoverMoviesByGenre(movieGenreIds)
            : tmdbApi.getUpcomingMovies(),
          seriesGenreIds.length > 0
            ? tmdbApi.discoverSeriesByGenre(seriesGenreIds) 
            : tmdbApi.getUpcomingSeries()
        ]);

        setMovies(moviesData.results?.slice(0, 6) || []);
        setSeries(seriesData.results?.slice(0, 6) || []);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [user]);

  if (!user) return null;

  const totalInterests = user.interests.movies.length + user.interests.series.length + user.interests.games.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-card/20">
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
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm" onClick={clearUser}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl mb-8">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Entertainment Radar" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
          </div>
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-neon-cyan bg-clip-text text-transparent">
                Your Entertainment Radar
              </h2>
              <p className="text-lg text-foreground/80 mb-6">
                Discover upcoming movies, series, and games tailored to your interests. Never miss a release again!
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-gradient-to-r from-primary to-neon-pink hover:shadow-lg hover:shadow-primary/25">
                  <Zap className="w-4 h-4 mr-2" />
                  Scan for Updates
                </Button>
                <Button variant="outline" className="border-primary/20 hover:border-primary">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-neon-cyan/10 to-electric-blue/10 border-neon-cyan/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neon-cyan">Movies Tracked</CardTitle>
              <Star className="h-4 w-4 text-neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-cyan">{user.interests.movies.length}</div>
              <p className="text-xs text-muted-foreground">genres selected</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-neon-pink/10 to-primary/10 border-neon-pink/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neon-pink">Series Tracked</CardTitle>
              <TrendingUp className="h-4 w-4 text-neon-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-pink">{user.interests.series.length}</div>
              <p className="text-xs text-muted-foreground">genres selected</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-golden/10 to-accent/10 border-golden/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-golden">Games Tracked</CardTitle>
              <Zap className="h-4 w-4 text-golden" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golden">{user.interests.games.length}</div>
              <p className="text-xs text-muted-foreground">genres selected</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interests</CardTitle>
              <Radar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInterests}</div>
              <p className="text-xs text-muted-foreground">across all categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Movies */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-neon-cyan">
                <Star className="w-5 h-5 mr-2" />
                Movies for You
              </CardTitle>
              <CardDescription>Based on your movie preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.interests.movies.slice(0, 3).map(genre => (
                    <Badge key={genre} variant="outline" className="border-neon-cyan/30 text-neon-cyan">
                      {genre}
                    </Badge>
                  ))}
                  {user.interests.movies.length > 3 && (
                    <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan">
                      +{user.interests.movies.length - 3} more
                    </Badge>
                  )}
                </div>
                
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p>Loading personalized movies...</p>
                  </div>
                ) : movies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {movies.map(movie => (
                      <ContentCard key={movie.id} item={movie} type="movie" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Radar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No movies found for your preferences</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Series */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-neon-pink">
                <TrendingUp className="w-5 h-5 mr-2" />
                Series for You
              </CardTitle>
              <CardDescription>Based on your series preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.interests.series.slice(0, 3).map(genre => (
                    <Badge key={genre} variant="outline" className="border-neon-pink/30 text-neon-pink">
                      {genre}
                    </Badge>
                  ))}
                  {user.interests.series.length > 3 && (
                    <Badge variant="outline" className="border-neon-pink/30 text-neon-pink">
                      +{user.interests.series.length - 3} more
                    </Badge>
                  )}
                </div>
                
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p>Loading personalized series...</p>
                  </div>
                ) : series.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {series.map(show => (
                      <ContentCard key={show.id} item={show} type="series" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Radar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No series found for your preferences</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Games Section - Placeholder for future IGDB integration */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-golden">
                <Zap className="w-5 h-5 mr-2" />
                Upcoming Games
              </CardTitle>
              <CardDescription>Gaming releases based on your preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.interests.games.slice(0, 5).map(genre => (
                    <Badge key={genre} variant="outline" className="border-golden/30 text-golden">
                      {genre}
                    </Badge>
                  ))}
                  {user.interests.games.length > 5 && (
                    <Badge variant="outline" className="border-golden/30 text-golden">
                      +{user.interests.games.length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="text-center text-muted-foreground py-12">
                  <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">IGDB Integration Coming Soon</h3>
                  <p>Game releases and recommendations will be available once IGDB API is integrated.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};