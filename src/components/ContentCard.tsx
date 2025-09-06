import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Plus } from 'lucide-react';
import { Movie, TVShow } from '@/types';
import { tmdbApi } from '@/services/tmdb';

interface ContentCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'series';
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, type }) => {
  const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date;
  const posterUrl = tmdbApi.getPosterUrl(item.poster_path);

  const addToCalendar = () => {
    const formattedDate = new Date(releaseDate).toISOString().split('T')[0].replace(/-/g, '');
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDate}/${formattedDate}&details=${encodeURIComponent(item.overview || 'No description available')}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <Card className="group overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow">
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Floating action buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all space-y-2">
          <Button
            size="sm"
            className="w-8 h-8 p-0 bg-primary/80 hover:bg-primary backdrop-blur-sm"
            onClick={addToCalendar}
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="w-8 h-8 p-0 bg-accent/80 hover:bg-accent backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 left-2">
          <Badge className="bg-background/80 backdrop-blur-sm border-none">
            <Star className="w-3 h-3 mr-1 fill-golden text-golden" />
            {item.vote_average.toFixed(1)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{tmdbApi.formatDate(releaseDate)}</span>
          <span className="capitalize">{type}</span>
        </div>

        {item.overview && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
            {item.overview}
          </p>
        )}
      </CardContent>
    </Card>
  );
};