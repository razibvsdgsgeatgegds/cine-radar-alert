import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Bell, BellOff } from 'lucide-react';
import { Movie, TVShow } from '@/types';
import { tmdbApi } from '@/services/tmdb';
import { Button } from './ui/button';

interface ContentCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'series';
  onClick: () => void;
  onToggleNotification: (e: React.MouseEvent) => void;
  isNotificationEnabled: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, type, onClick, onToggleNotification, isNotificationEnabled }) => {
  const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date;
  const posterUrl = tmdbApi.getPosterUrl(item.poster_path);

  return (
    <Card 
      className="group overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow cursor-pointer relative"
      onClick={onClick}
    >
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 right-1 z-10 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/80"
        onClick={onToggleNotification}
        title={isNotificationEnabled ? 'Disable notification' : 'Enable notification'}
      >
        {isNotificationEnabled ? (
          <BellOff className="w-4 h-4 text-destructive" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
      </Button>

      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        <div className="absolute top-2 left-2">
          <Badge className="bg-background/80 backdrop-blur-sm border-none">
            <Star className="w-3 h-3 mr-1 fill-golden text-golden" />
            {item.vote_average.toFixed(1)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{tmdbApi.formatDate(releaseDate)}</span>
          <span className="capitalize">{type}</span>
        </div>
      </CardContent>
    </Card>
  );
};
