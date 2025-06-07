import express, { Request, Response } from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth';
import { SpotifyTrack, SpotifyArtist, RecentlyPlayedItem } from '../types';

const router = express.Router();

// Apply auth middleware to all API routes
router.use(requireAuth);

// Helper function to make Spotify API calls
const spotifyRequest = async (req: Request, endpoint: string, params?: Record<string, string>) => {
  const url = new URL(`https://api.spotify.com/v1${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  try {
    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${req.session!.tokens!.access_token}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Token expired');
    }
    throw error;
  }
};

// Get top tracks
router.get('/top-tracks', async (req: Request, res: Response) => {
  try {
    const timeRange = (req.query.time_range as string) || 'medium_term';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const data = await spotifyRequest(req, '/me/top/tracks', {
      time_range: timeRange,
      limit: limit.toString()
    });

    res.json(data);
  } catch (error: any) {
    console.error('Top tracks error:', error.message);
    if (error.message === 'Token expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Get top artists
router.get('/top-artists', async (req: Request, res: Response) => {
  try {
    const timeRange = (req.query.time_range as string) || 'medium_term';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const data = await spotifyRequest(req, '/me/top/artists', {
      time_range: timeRange,
      limit: limit.toString()
    });

    res.json(data);
  } catch (error: any) {
    console.error('Top artists error:', error.message);
    if (error.message === 'Token expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
});

// Get recently played tracks
router.get('/recently-played', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const before = req.query.before as string;
    const after = req.query.after as string;

    const params: Record<string, string> = { limit: limit.toString() };
    if (before) params.before = before;
    if (after) params.after = after;

    const data = await spotifyRequest(req, '/me/player/recently-played', params);

    res.json(data);
  } catch (error: any) {
    console.error('Recently played error:', error.message);
    if (error.message === 'Token expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Failed to fetch recently played tracks' });
  }
});

// Get total listening hours (estimated from recently played)
router.get('/total-listening-hours', async (req: Request, res: Response) => {
  try {
    // Get recently played tracks from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const after = thirtyDaysAgo.getTime();

    let allTracks: RecentlyPlayedItem[] = [];
    let nextUrl = null;
    let hasMore = true;

    // Fetch all recently played tracks in batches
    while (hasMore && allTracks.length < 1000) { // Limit to prevent infinite loops
      const params: Record<string, string> = {
        limit: '50',
        after: after.toString()
      };

      if (nextUrl) {
        const urlObj = new URL(nextUrl);
        const searchParams = new URLSearchParams(urlObj.search);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
      }

      const data = await spotifyRequest(req, '/me/player/recently-played', params);
      
      if (data.items && data.items.length > 0) {
        allTracks = [...allTracks, ...data.items];
        nextUrl = data.next;
        hasMore = !!data.next;
      } else {
        hasMore = false;
      }
    }

    // Calculate total listening time
    const totalMs = allTracks.reduce((sum, item) => sum + item.track.duration_ms, 0);
    const totalHours = totalMs / (1000 * 60 * 60);

    // Group by day for daily breakdown
    const dailyListening: Record<string, number> = {};
    allTracks.forEach(item => {
      const date = new Date(item.played_at).toDateString();
      if (!dailyListening[date]) {
        dailyListening[date] = 0;
      }
      dailyListening[date] += item.track.duration_ms / (1000 * 60 * 60);
    });

    // Get genre breakdown from top artists
    const topArtistsData = await spotifyRequest(req, '/me/top/artists', {
      time_range: 'medium_term',
      limit: '50'
    });

    const genreCounts: Record<string, number> = {};
    topArtistsData.items.forEach((artist: SpotifyArtist) => {
      artist.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    // Sort genres by count and take top 10
    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([genre, count]) => ({ genre, count }));

    res.json({
      totalHours: Math.round(totalHours * 100) / 100,
      tracksCount: allTracks.length,
      dailyListening,
      topGenres,
      averageHoursPerDay: Math.round((totalHours / 30) * 100) / 100
    });
  } catch (error: any) {
    console.error('Total listening hours error:', error.message);
    if (error.message === 'Token expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Failed to calculate listening hours' });
  }
});

export default router;
