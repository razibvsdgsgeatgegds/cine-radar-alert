import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { UserPreferences } from '@/types';
import { Radar, Sparkles, Users, Calendar, Star } from 'lucide-react';

const MOVIE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const SERIES_GENRES = [
  'Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Kids', 'Mystery', 'News', 'Reality', 'Sci-Fi & Fantasy',
  'Soap', 'Talk', 'War & Politics', 'Western'
];

const GAME_GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports',
  'Racing', 'Fighting', 'Shooter', 'Platform', 'Puzzle', 'Arcade',
  'Horror', 'Indie', 'MMO', 'Battle Royale'
];

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    age: '',
    movieGenres: [] as string[],
    seriesGenres: [] as string[],
    gameGenres: [] as string[]
  });
  const { setUser } = useUser();

  const handleGenreToggle = (genre: string, type: 'movieGenres' | 'seriesGenres' | 'gameGenres') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(genre)
        ? prev[type].filter(g => g !== genre)
        : [...prev[type], genre]
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleComplete = () => {
    const userData: UserPreferences = {
      name: formData.name,
      email: formData.email,
      location: formData.location,
      age: parseInt(formData.age),
      interests: {
        movies: formData.movieGenres,
        series: formData.seriesGenres,
        games: formData.gameGenres
      }
    };
    setUser(userData);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.location && formData.age;
      case 2:
        return formData.movieGenres.length > 0;
      case 3:
        return formData.seriesGenres.length > 0;
      case 4:
        return formData.gameGenres.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-neon-pink rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent">
                Welcome to RadarApp
              </CardTitle>
              <CardDescription>
                Let's get to know you better to personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-neon-cyan to-electric-blue rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-neon-cyan to-electric-blue bg-clip-text text-transparent">
                Movie Preferences
              </CardTitle>
              <CardDescription>
                Select your favorite movie genres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {MOVIE_GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={formData.movieGenres.includes(genre) ? "default" : "outline"}
                    className={`cursor-pointer p-3 text-center transition-all ${
                      formData.movieGenres.includes(genre) 
                        ? 'bg-gradient-to-r from-neon-cyan to-electric-blue text-primary-foreground' 
                        : 'hover:border-neon-cyan'
                    }`}
                    onClick={() => handleGenreToggle(genre, 'movieGenres')}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 3:
        return (
          <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-neon-pink to-primary rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-neon-pink to-primary bg-clip-text text-transparent">
                Series Preferences
              </CardTitle>
              <CardDescription>
                Select your favorite TV series genres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SERIES_GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={formData.seriesGenres.includes(genre) ? "default" : "outline"}
                    className={`cursor-pointer p-3 text-center transition-all ${
                      formData.seriesGenres.includes(genre) 
                        ? 'bg-gradient-to-r from-neon-pink to-primary text-primary-foreground' 
                        : 'hover:border-neon-pink'
                    }`}
                    onClick={() => handleGenreToggle(genre, 'seriesGenres')}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-golden to-accent rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-golden to-accent bg-clip-text text-transparent">
                Gaming Preferences
              </CardTitle>
              <CardDescription>
                Select your favorite game genres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {GAME_GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={formData.gameGenres.includes(genre) ? "default" : "outline"}
                    className={`cursor-pointer p-3 text-center transition-all ${
                      formData.gameGenres.includes(genre) 
                        ? 'bg-gradient-to-r from-golden to-accent text-primary-foreground' 
                        : 'hover:border-golden'
                    }`}
                    onClick={() => handleGenreToggle(genre, 'gameGenres')}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {renderStep()}

        <div className="mt-8 flex justify-center space-x-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="border-primary/20 hover:border-primary"
            >
              Back
            </Button>
          )}
          
          <Button
            onClick={step === 4 ? handleComplete : handleNext}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-primary to-neon-pink hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            {step === 4 ? (
              <>
                <Radar className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};