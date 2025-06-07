import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { spotifyAPI } from '../services/api';
import { SpotifyUser } from '../types/spotify';

interface DashboardProps {
  user: SpotifyUser;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { data: topTracks, isLoading: tracksLoading } = useQuery({
    queryKey: ['topTracks'],
    queryFn: () => spotifyAPI.getTopTracks()
  });

  const { data: topArtists, isLoading: artistsLoading } = useQuery({
    queryKey: ['topArtists'],
    queryFn: () => spotifyAPI.getTopArtists()
  });

  const { data: recentlyPlayed, isLoading: recentLoading } = useQuery({
    queryKey: ['recentlyPlayed'],
    queryFn: () => spotifyAPI.getRecentlyPlayed()
  });

  const { data: listeningStats, isLoading: statsLoading } = useQuery({
    queryKey: ['listeningStats'],
    queryFn: () => spotifyAPI.getListeningStats()
  });

  if (tracksLoading || artistsLoading || recentLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading your music data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Tracks */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-4">Top Tracks</h2>
          <div className="space-y-2">
            {topTracks?.items.slice(0, 5).map((track) => (
              <div key={track.id} className="flex items-center space-x-3">
                <img
                  src={track.album.images[0]?.url}
                  alt={track.name}
                  className="w-12 h-12 rounded"
                />
                <div>
                  <p className="text-white font-medium">{track.name}</p>
                  <p className="text-gray-400 text-sm">{track.artists[0].name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Artists */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-4">Top Artists</h2>
          <div className="space-y-2">
            {topArtists?.items.slice(0, 5).map((artist) => (
              <div key={artist.id} className="flex items-center space-x-3">
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full"
                />
                <p className="text-white font-medium">{artist.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Played */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-4">Recently Played</h2>
          <div className="space-y-2">
            {recentlyPlayed?.items.slice(0, 5).map((item) => (
              <div key={item.played_at} className="flex items-center space-x-3">
                <img
                  src={item.track.album.images[0]?.url}
                  alt={item.track.name}
                  className="w-12 h-12 rounded"
                />
                <div>
                  <p className="text-white font-medium">{item.track.name}</p>
                  <p className="text-gray-400 text-sm">{item.track.artists[0].name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listening Stats */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-4">Listening Stats</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">Total Listening Hours</p>
              <p className="text-2xl font-bold text-white">
                {listeningStats?.totalHours.toFixed(1)} hours
              </p>
            </div>
            <div>
              <p className="text-gray-400">Average Daily Listening</p>
              <p className="text-2xl font-bold text-white">
                {listeningStats?.averageDailyHours.toFixed(1)} hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
