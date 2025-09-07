import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Film, Tv, X } from 'lucide-react';
import { UserPreferences } from '@/types';

interface PreferenceEditorProps {
  user: UserPreferences;
  onUpdate: (updatedUser: UserPreferences) => void;
}

const MOVIE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const TV_GENRES = [
  'Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Kids', 'Mystery', 'News', 'Reality',
  'Sci-Fi & Fantasy', 'Soap', 'Talk', 'War & Politics', 'Western'
];

export const PreferenceEditor: React.FC<PreferenceEditorProps> = ({ user, onUpdate }) => {
  const [movieGenres, setMovieGenres] = useState(user.interests.movies);
  const [seriesGenres, setSeriesGenres] = useState(user.interests.series);
  const [isOpen, setIsOpen] = useState(false);

  const toggleGenre = (genre: string, type: 'movies' | 'series') => {
    if (type === 'movies') {
      setMovieGenres(prev => 
        prev.includes(genre) 
          ? prev.filter(g => g !== genre)
          : [...prev, genre]
      );
    } else {
      setSeriesGenres(prev => 
        prev.includes(genre) 
          ? prev.filter(g => g !== genre)
          : [...prev, genre]
      );
    }
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      interests: {
        ...user.interests,
        movies: movieGenres,
        series: seriesGenres,
      }
    };
    onUpdate(updatedUser);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setMovieGenres(user.interests.movies);
    setSeriesGenres(user.interests.series);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Content Preferences</DialogTitle>
          <DialogDescription>
            Select the genres you're interested in for movies and TV series.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Film className="w-5 h-5" />
                Movie Genres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {MOVIE_GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={movieGenres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer justify-center p-2 text-xs"
                    onClick={() => toggleGenre(genre, 'movies')}
                  >
                    {genre}
                    {movieGenres.includes(genre) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tv className="w-5 h-5" />
                TV Series Genres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {TV_GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={seriesGenres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer justify-center p-2 text-xs"
                    onClick={() => toggleGenre(genre, 'series')}
                  >
                    {genre}
                    {seriesGenres.includes(genre) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-neon-pink">
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};