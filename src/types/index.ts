export interface UserPreferences {
  name: string;
  email: string;
  location: string;
  age: number;
  interests: {
    movies: string[];
    series: string[];
    games: string[];
  };
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface Game {
  id: number;
  name: string;
  summary?: string;
  cover?: {
    url: string;
  };
  release_dates?: Array<{
    date: number;
    platform: number;
  }>;
  rating?: number;
  genres?: number[];
}