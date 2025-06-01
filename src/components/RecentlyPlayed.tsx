
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, ExternalLink } from 'lucide-react';
import { spotifyAPI } from '../services/api';
import { RecentlyPlayedItem } from '../types/spotify';

const RecentlyPlayed = () => {
  const [tracks, setTracks] = useState<RecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentlyPlayed = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await spotifyAPI.getRecentlyPlayed(20);
      setTracks(response.items);
    } catch (error) {
      console.error('Error fetching recently played:', error);
      setError('Failed to load recently played tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentlyPlayed();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="bg-black/60 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Clock className="mr-2 h-5 w-5 text-green-500" />
          Recently Played
        </CardTitle>
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
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tracks.map((item, index) => (
              <div
                key={`${item.track.id}-${item.played_at}-${index}`}
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <img
                    src={item.track.album.images[2]?.url || item.track.album.images[0]?.url}
                    alt={item.track.album.name}
                    className="h-12 w-12 rounded shadow-lg"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate group-hover:text-green-400 transition-colors">
                    {item.track.name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {item.track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-400">
                  <span className="text-xs whitespace-nowrap">
                    {formatDate(item.played_at)}
                  </span>
                  
                  <a
                    href={item.track.external_urls.spotify}
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

export default RecentlyPlayed;
