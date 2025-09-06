const TMDB_API_KEY = '8efe8647ea1db9fb32dcfdb0ea1dd302';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const tmdbApi = {
  // Get upcoming movies
  getUpcomingMovies: async () => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Get popular movies
  getPopularMovies: async () => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Get trending movies this week
  getTrendingMovies: async () => {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );
    return response.json();
  },

  // Get upcoming TV shows (airing today)
  getUpcomingSeries: async () => {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Get popular TV shows
  getPopularSeries: async () => {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    return response.json();
  },

  // Get trending TV shows this week
  getTrendingSeries: async () => {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}`
    );
    return response.json();
  },

  // Get movie genres
  getMovieGenres: async () => {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Get TV genres
  getTVGenres: async () => {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return response.json();
  },

  // Discover movies by genre
  discoverMoviesByGenre: async (genreIds: number[]) => {
    const genreString = genreIds.join(',');
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=${genreString}&sort_by=release_date.desc&page=1`
    );
    return response.json();
  },

  // Discover TV shows by genre
  discoverSeriesByGenre: async (genreIds: number[]) => {
    const genreString = genreIds.join(',');
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&with_genres=${genreString}&sort_by=first_air_date.desc&page=1`
    );
    return response.json();
  },

  // Get full poster URL
  getPosterUrl: (posterPath: string | null) => {
    if (!posterPath) return '/placeholder.svg';
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
  },

  // Format release date
  formatDate: (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};