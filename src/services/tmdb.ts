import { STREAMING_PLATFORMS } from '@/constants';

const TMDB_API_KEY = '8efe8647ea1db9fb32dcfdb0ea1dd302';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

if (!TMDB_API_KEY) {
  console.error("VITE_TMDB_API_KEY is not set in .env file. Please add it.");
}

const INDUSTRY_COUNTRY_MAP: Record<string, string> = {
  'Hollywood': 'US',
  'Bollywood': 'IN',
  'Lollywood': 'PK',
  'Tollywood': 'IN', // Telugu
  'Kollywood': 'IN', // Tamil
};

const LANGUAGE_CODE_MAP: Record<string, string> = {
  'English': 'en',
  'Hindi': 'hi',
  'Urdu': 'ur',
  'Telugu': 'te',
  'Tamil': 'ta',
  'Spanish': 'es',
  'French': 'fr',
};

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const buildApiUrl = (basePath: string, params: Record<string, string> = {}) => {
  const urlParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params
  });
  return `${TMDB_BASE_URL}${basePath}?${urlParams.toString()}`;
}

const buildDiscoverParams = (
  genreIds: number[],
  region: string,
  languages: string[],
  industries: string[],
  platforms: string[],
  dateRange: string,
  type: 'movie' | 'series'
) => {
  const params: Record<string, string> = {
    sort_by: 'popularity.desc',
    page: '1',
  };

  // Always include a watch_region. It's crucial for date and platform filtering.
  // Default to 'US' if the user has no region set to ensure API calls are valid.
  params.watch_region = region || 'US';

  // --- Simplified and Corrected Date Filter Logic ---
  const today = getTodayDateString();
  const currentYear = new Date().getFullYear();
  const dateKey = type === 'movie' ? 'primary_release_date' : 'first_air_date';
  
  switch (dateRange) {
    case 'today':
      params[`${dateKey}.gte`] = today;
      params[`${dateKey}.lte`] = today;
      break;
    case String(currentYear):
      // "This Year" means upcoming releases within the current year.
      params[`${dateKey}.gte`] = today;
      params[`${dateKey}.lte`] = `${currentYear}-12-31`;
      break;
    case String(currentYear + 1):
      params[`${dateKey}.gte`] = `${currentYear + 1}-01-01`;
      params[`${dateKey}.lte`] = `${currentYear + 1}-12-31`;
      break;
    case 'all':
    default:
      // "All Upcoming" means from today onwards - ALWAYS filter for upcoming only
      params[`${dateKey}.gte`] = today;
      break;
  }

  // --- Standard Filter Logic (using '|' for OR) ---

  if (genreIds.length > 0) {
    params.with_genres = genreIds.join('|');
  }

  const langCodes = languages.map(lang => LANGUAGE_CODE_MAP[lang]).filter(Boolean);
  if (langCodes.length > 0) {
    params.with_original_language = langCodes.join('|');
  }

  const countryCodes = [...new Set(industries.map(ind => INDUSTRY_COUNTRY_MAP[ind]).filter(Boolean))];
  if (countryCodes.length > 0) {
    params.with_origin_country = countryCodes.join('|');
  }
  
  const platformIds = platforms.map(p => STREAMING_PLATFORMS[p]).filter(Boolean);
  if (platformIds.length > 0) {
    params.with_watch_providers = platformIds.join('|');
  }

  return params;
};

export const tmdbApi = {
  discoverMovies: async (genreIds: number[], region: string, languages: string[], industries: string[], platforms: string[], dateRange: string, page: number = 1) => {
    const params = buildDiscoverParams(genreIds, region, languages, industries, platforms, dateRange, 'movie');
    params.page = page.toString();
    const url = buildApiUrl('/discover/movie', params);
    const response = await fetch(url);
    const data = await response.json();
    return data;
  },

  discoverSeries: async (genreIds: number[], region: string, languages: string[], industries: string[], platforms: string[], dateRange: string, page: number = 1) => {
    const params = buildDiscoverParams(genreIds, region, languages, industries, platforms, dateRange, 'series');
    params.page = page.toString();
    const url = buildApiUrl('/discover/tv', params);
    const response = await fetch(url);
    const data = await response.json();
    return data;
  },
  
  getMovieVideos: async (movieId: number) => {
    const url = buildApiUrl(`/movie/${movieId}/videos`);
    const response = await fetch(url);
    return response.json();
  },

  getMovieWatchProviders: async (movieId: number, region: string = 'US') => {
    const url = buildApiUrl(`/movie/${movieId}/watch/providers`);
    const response = await fetch(url);
    const data = await response.json();
    return data.results?.[region] || null;
  },

  getSeriesWatchProviders: async (seriesId: number, region: string = 'US') => {
    const url = buildApiUrl(`/tv/${seriesId}/watch/providers`);
    const response = await fetch(url);
    const data = await response.json();
    return data.results?.[region] || null;
  },

  getSeriesVideos: async (seriesId: number) => {
    const url = buildApiUrl(`/tv/${seriesId}/videos`);
    const response = await fetch(url);
    return response.json();
  },

  getPosterUrl: (posterPath: string | null) => {
    if (!posterPath) return '/placeholder.svg';
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
  },

  formatDate: (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC'
    });
  },

  searchMovies: async (query: string, region: string, languages: string[], industries: string[], dateRange: string) => {
    const params: Record<string, string> = {
      query: query,
      page: '1',
    };

    // Add region for better results
    if (region) {
      params.region = region;
    }

    // Apply date filters for upcoming content only
    const today = getTodayDateString();
    const currentYear = new Date().getFullYear();
    
    switch (dateRange) {
      case 'today':
        params['primary_release_date.gte'] = today;
        params['primary_release_date.lte'] = today;
        break;
      case String(currentYear):
        params['primary_release_date.gte'] = today;
        params['primary_release_date.lte'] = `${currentYear}-12-31`;
        break;
      case String(currentYear + 1):
        params['primary_release_date.gte'] = `${currentYear + 1}-01-01`;
        params['primary_release_date.lte'] = `${currentYear + 1}-12-31`;
        break;
      case 'all':
      default:
        params['primary_release_date.gte'] = today;
        break;
    }

    // Apply language filters
    const langCodes = languages.map(lang => LANGUAGE_CODE_MAP[lang]).filter(Boolean);
    if (langCodes.length > 0) {
      params.with_original_language = langCodes.join('|');
    }

    // Apply industry filters
    const countryCodes = [...new Set(industries.map(ind => INDUSTRY_COUNTRY_MAP[ind]).filter(Boolean))];
    if (countryCodes.length > 0) {
      params.with_origin_country = countryCodes.join('|');
    }

    const url = buildApiUrl('/search/movie', params);
    const response = await fetch(url);
    const data = await response.json();
    return data;
  },

  searchSeries: async (query: string, region: string, languages: string[], industries: string[], dateRange: string) => {
    const params: Record<string, string> = {
      query: query,
      page: '1',
    };

    // Add region for better results
    if (region) {
      params.region = region;
    }

    // Apply date filters for upcoming content only
    const today = getTodayDateString();
    const currentYear = new Date().getFullYear();
    
    switch (dateRange) {
      case 'today':
        params['first_air_date.gte'] = today;
        params['first_air_date.lte'] = today;
        break;
      case String(currentYear):
        params['first_air_date.gte'] = today;
        params['first_air_date.lte'] = `${currentYear}-12-31`;
        break;
      case String(currentYear + 1):
        params['first_air_date.gte'] = `${currentYear + 1}-01-01`;
        params['first_air_date.lte'] = `${currentYear + 1}-12-31`;
        break;
      case 'all':
      default:
        params['first_air_date.gte'] = today;
        break;
    }

    // Apply language filters
    const langCodes = languages.map(lang => LANGUAGE_CODE_MAP[lang]).filter(Boolean);
    if (langCodes.length > 0) {
      params.with_original_language = langCodes.join('|');
    }

    // Apply industry filters
    const countryCodes = [...new Set(industries.map(ind => INDUSTRY_COUNTRY_MAP[ind]).filter(Boolean))];
    if (countryCodes.length > 0) {
      params.with_origin_country = countryCodes.join('|');
    }

    const url = buildApiUrl('/search/tv', params);
    const response = await fetch(url);
    const data = await response.json();
    return data;
  },

  // Search all movies (including past ones) for exact match detection
  searchMoviesAll: async (query: string, region: string, languages: string[], industries: string[]) => {
    const params: Record<string, string> = {
      query: query,
      page: '1',
    };

    if (region) {
      params.region = region;
    }

    // Apply language filters
    const langCodes = languages.map(lang => LANGUAGE_CODE_MAP[lang]).filter(Boolean);
    if (langCodes.length > 0) {
      params.with_original_language = langCodes.join('|');
    }

    // Apply industry filters
    const countryCodes = [...new Set(industries.map(ind => INDUSTRY_COUNTRY_MAP[ind]).filter(Boolean))];
    if (countryCodes.length > 0) {
      params.with_origin_country = countryCodes.join('|');
    }

    const url = buildApiUrl('/search/movie', params);
    const response = await fetch(url);
    return response.json();
  },

  // Search all series (including past ones) for exact match detection
  searchSeriesAll: async (query: string, region: string, languages: string[], industries: string[]) => {
    const params: Record<string, string> = {
      query: query,
      page: '1',
    };

    if (region) {
      params.region = region;
    }

    // Apply language filters
    const langCodes = languages.map(lang => LANGUAGE_CODE_MAP[lang]).filter(Boolean);
    if (langCodes.length > 0) {
      params.with_original_language = langCodes.join('|');
    }

    // Apply industry filters
    const countryCodes = [...new Set(industries.map(ind => INDUSTRY_COUNTRY_MAP[ind]).filter(Boolean))];
    if (countryCodes.length > 0) {
      params.with_origin_country = countryCodes.join('|');
    }

    const url = buildApiUrl('/search/tv', params);
    const response = await fetch(url);
    return response.json();
  }
};
