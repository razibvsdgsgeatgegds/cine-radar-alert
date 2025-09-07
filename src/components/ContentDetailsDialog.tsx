import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2, Star, VideoIcon } from 'lucide-react';
import { Movie, TVShow, Video } from '@/types';
import { tmdbApi } from '@/services/tmdb';

interface ContentDetailsDialogProps {
  item: Movie | TVShow | null;
  type: 'movie' | 'series';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContentDetailsDialog: React.FC<ContentDetailsDialogProps> = ({ item, type, open, onOpenChange }) => {
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item && open) {
      const fetchTrailer = async () => {
        setLoading(true);
        setTrailer(null);
        try {
          const videoData = type === 'movie'
            ? await tmdbApi.getMovieVideos(item.id)
            : await tmdbApi.getSeriesVideos(item.id);
          
          const videos = videoData.results || [];
          const videoPriority = ['Trailer', 'Teaser', 'Clip', 'Featurette'];
          
          let foundVideo: Video | null = null;
          
          // Prioritize official videos
          for (const videoType of videoPriority) {
            foundVideo = videos.find((v: Video) => v.type === videoType && v.official && v.site === 'YouTube');
            if (foundVideo) break;
          }

          // If no official video, find any video of the prioritized types
          if (!foundVideo) {
            for (const videoType of videoPriority) {
              foundVideo = videos.find((v: Video) => v.type === videoType && v.site === 'YouTube');
              if (foundVideo) break;
            }
          }
          
          setTrailer(foundVideo);
        } catch (error) {
          console.error("Error fetching trailer:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTrailer();
    }
  }, [item, type, open]);

  if (!item) return null;

  const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date;

  const addToCalendar = () => {
    const formattedDate = new Date(releaseDate).toISOString().split('T')[0].replace(/-/g, '');
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`RadarApp Release: ${title}`)}&dates=${formattedDate}/${formattedDate}&details=${encodeURIComponent(`${item.overview}\n\nTracked with RadarApp. Set a reminder so you don't miss it!`)}&sf=true&output=xml`;
    window.open(calendarUrl, '_blank');
  };

  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card/80 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent">{title}</DialogTitle>
          <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
            <span>{tmdbApi.formatDate(releaseDate)}</span>
            <Badge variant="outline" className="border-golden/50 text-golden"><Star className="w-3 h-3 mr-1 fill-golden" />{item.vote_average.toFixed(1)}</Badge>
            <span className="capitalize">{type}</span>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <h3 className="font-semibold">Overview</h3>
            <p className="text-sm text-muted-foreground">{item.overview || 'No overview available.'}</p>
            <Button onClick={addToCalendar} className="w-full">
              <Calendar className="w-4 h-4 mr-2" /> Add to Google Calendar
            </Button>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Trailer</h3>
            {loading && <div className="aspect-video flex items-center justify-center bg-muted rounded-lg"><Loader2 className="w-8 h-8 animate-spin" /></div>}
            {!loading && trailer && (
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-primary/20">
                <YouTube videoId={trailer.key} opts={youtubeOpts} className="w-full h-full" />
              </div>
            )}
            {!loading && !trailer && (
              <div className="aspect-video flex flex-col items-center justify-center bg-muted rounded-lg text-muted-foreground">
                <VideoIcon className="w-10 h-10 mb-2 opacity-50"/>
                <p>No trailer available</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
