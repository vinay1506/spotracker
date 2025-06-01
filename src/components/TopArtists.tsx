
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Mic, ExternalLink, Users } from 'lucide-react';
import { spotifyAPI } from '../services/api';
import { SpotifyArtist, TimeRange } from '../types/spotify';

const TopArtists = () => {
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [error, setError] = useState<string | null>(null);

  const timeRangeOptions = [
    { value: 'short_term' as TimeRange, label: 'Last 4 weeks' },
    { value: 'medium_term' as TimeRange, label: 'Last 6 months' },
    { value: 'long_term' as TimeRange, label: 'All time' },
  ];

  const fetchTopArtists = async (range: TimeRange) => {
    try {
      setLoading(true);
      setError(null);
      const response = await spotifyAPI.getTopArtists(range, 20);
      setArtists(response.items);
    } catch (error) {
      console.error('Error fetching top artists:', error);
      setError('Failed to load top artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopArtists(timeRange);
  }, [timeRange]);

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Card className="bg-black/60 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-white flex items-center">
            <Mic className="mr-2 h-5 w-5 text-green-500" />
            Top Artists
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-3 p-4">
                <Skeleton className="h-24 w-24 rounded-full bg-gray-700" />
                <div className="space-y-2 text-center w-full">
                  <Skeleton className="h-4 w-3/4 mx-auto bg-gray-700" />
                  <Skeleton className="h-3 w-1/2 mx-auto bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-400 text-center py-8">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artists.map((artist, index) => (
              <div
                key={artist.id}
                className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 group"
              >
                <div className="relative">
                  <div className="absolute -top-2 -left-2 bg-green-500 text-black text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <img
                    src={artist.images[1]?.url || artist.images[0]?.url || '/placeholder.svg'}
                    alt={artist.name}
                    className="h-24 w-24 rounded-full shadow-lg object-cover"
                  />
                </div>
                
                <div className="text-center space-y-1 flex-1">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-green-400 transition-colors">
                    {artist.name}
                  </h3>
                  
                  <div className="flex items-center justify-center space-x-1 text-gray-400">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">
                      {formatFollowers(artist.followers.total)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {artist.genres.slice(0, 2).map((genre, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                
                <a
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-green-500 text-gray-400"
                  title="Open in Spotify"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopArtists;
