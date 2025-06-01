
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Headphones, Music } from 'lucide-react';
import { spotifyAPI } from '../services/api';
import { ListeningStatsResponse } from '../types/spotify';

const ListeningStats = () => {
  const [stats, setStats] = useState<ListeningStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await spotifyAPI.getListeningStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching listening stats:', error);
      setError('Failed to load listening statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = ['#1DB954', '#1ed760', '#4d9b3a', '#6bc24a', '#89d75c', '#a8e56e', '#c6f480', '#e4ff92'];

  const dailyData = stats ? Object.entries(stats.dailyListening)
    .map(([date, hours]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: Math.round(hours * 100) / 100
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14) // Last 14 days
    : [];

  const genreData = stats ? stats.topGenres.slice(0, 8).map((genre, index) => ({
    ...genre,
    color: COLORS[index % COLORS.length]
  })) : [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/60 border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-gray-700" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-gray-700" />
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-gray-700" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full bg-gray-700" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="bg-black/60 border-gray-800">
        <CardContent className="py-8">
          <p className="text-red-400 text-center">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/60 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Hours</p>
                <p className="text-2xl font-bold text-white">{stats.totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Headphones className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tracks Played</p>
                <p className="text-2xl font-bold text-white">{stats.tracksCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Daily Average</p>
                <p className="text-2xl font-bold text-white">{stats.averageHoursPerDay}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Music className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Top Genres</p>
                <p className="text-2xl font-bold text-white">{stats.topGenres.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Listening Chart */}
        <Card className="bg-black/60 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
              Daily Listening (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value) => [`${value}h`, 'Hours']}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#1DB954"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Genre Distribution Chart */}
        <Card className="bg-black/60 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Music className="mr-2 h-5 w-5 text-green-500" />
              Top Genres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  label={({ genre, percent }) => `${genre} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={12}
                  fill="#1DB954"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value, name) => [value, 'Artists']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListeningStats;
