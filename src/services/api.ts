import axios from 'axios';
import { SpotifyUser, TopTracksResponse, TopArtistsResponse, RecentlyPlayedResponse, ListeningStatsResponse, TimeRange } from '../types/spotify';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Auth endpoints
export const authAPI = {
  login: () => {
    const currentUrl = window.location.origin;
    const redirectUri = `${currentUrl}/auth/callback`;
    window.location.href = `${API_BASE_URL}/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getStatus: async (): Promise<{ authenticated: boolean; user?: SpotifyUser }> => {
    const response = await api.get('/auth/status');
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },
};

// Spotify data endpoints
export const spotifyAPI = {
  getTopTracks: async (timeRange: TimeRange = 'medium_term', limit: number = 20): Promise<TopTracksResponse> => {
    const response = await api.get('/api/top-tracks', {
      params: { time_range: timeRange, limit }
    });
    return response.data;
  },
  
  getTopArtists: async (timeRange: TimeRange = 'medium_term', limit: number = 20): Promise<TopArtistsResponse> => {
    const response = await api.get('/api/top-artists', {
      params: { time_range: timeRange, limit }
    });
    return response.data;
  },
  
  getRecentlyPlayed: async (limit: number = 50): Promise<RecentlyPlayedResponse> => {
    const response = await api.get('/api/recently-played', {
      params: { limit }
    });
    return response.data;
  },
  
  getListeningStats: async (): Promise<ListeningStatsResponse> => {
    const response = await api.get('/api/total-listening-hours');
    return response.data;
  },
};

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.error === 'Token expired') {
      try {
        await authAPI.refreshToken();
        // Retry the original request
        return api.request(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
