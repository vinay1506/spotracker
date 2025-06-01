
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, ExternalLink, Clock } from 'lucide-react';
import { spotifyAPI } from '../services/api';
import { SpotifyTrack, TimeRange } from '../types/spotify';

const TopTracks = () => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [error, setError] = useState<string | null>(null);

  const timeRangeOptions = [
    { value: 'short_term' as TimeRange, label: 'Last 4 weeks' },
    { value: 'medium_term' as TimeRange, label: 'Last 6 months' },
    { value: 'long_term' as TimeRange, label: 'All time' },
  ];

  const fetchTopTracks = async (range: TimeRange) => {
    try {
      setLoading(true);
      setError(null);
      const response = await spotifyAPI.getTopTracks(range, 20);
      setTracks(response.items);
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      setError('Failed to load top tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopTracks(timeRange);
  }, [timeRange]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-black/60 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-white flex items-center">
            <Play className="mr-2 h-5 w-5 text-green-500" />
            Top Tracks
          </CardTitle>
          <div className="flex gap-2">
            {timeRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(option.value)}
                className={timeRange === option.value 
                  ? "bg-green-500 text-black hover:bg-green-600" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-gray-700" />
                  <Skeleton className="h-3 w-1/2 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-400 text-center py-8">{error}</p>
        ) : (
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="text-gray-400 font-mono text-sm">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="flex-shrink-0">
                  <img
                    src={track.album.images[2]?.url || track.album.images[0]?.url}
                    alt={track.album.name}
                    className="h-12 w-12 rounded shadow-lg"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate group-hover:text-green-400 transition-colors">
                    {track.name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-mono">
                      {formatDuration(track.duration_ms)}
                    </span>
                  </div>
                  
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-green-500"
                    title="Open in Spotify"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopTracks;
