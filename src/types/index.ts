export interface UserPreferences {
  name: string;
  email: string;
  gender: 'male' | 'female' | 'other' | '';
  location: {
    country: string;
  };
  age: number;
  interests: {
    movies: string[];
    series: string[];
    games: string[];
  };
  notifications_enabled: boolean;
  languages: string[];
  industries: string[];
  platforms: string[];
  notification_list: { 
    id: number; 
    type: 'movie' | 'series'; 
    name: string; 
    date: string;
    poster_path: string;
  }[];
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  watch_providers?: WatchProvider[];
}

export interface TVShow {
  id: number;
  name:string;
  overview: string;
  poster_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  watch_providers?: WatchProvider[];
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
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

export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}
