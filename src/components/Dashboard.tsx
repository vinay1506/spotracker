
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopTracks from './TopTracks';
import TopArtists from './TopArtists';
import RecentlyPlayed from './RecentlyPlayed';
import ListeningStats from './ListeningStats';
import { SpotifyUser } from '../types/spotify';

interface DashboardProps {
  user: SpotifyUser;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user.display_name}!
        </h1>
        <p className="text-gray-400">
          Here's your personalized music analytics dashboard
        </p>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-green-500 data-[state=active]:text-black"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="tracks" 
            className="data-[state=active]:bg-green-500 data-[state=active]:text-black"
          >
            Top Tracks
          </TabsTrigger>
          <TabsTrigger 
            value="artists" 
            className="data-[state=active]:bg-green-500 data-[state=active]:text-black"
          >
            Top Artists
          </TabsTrigger>
          <TabsTrigger 
            value="recent" 
            className="data-[state=active]:bg-green-500 data-[state=active]:text-black"
          >
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ListeningStats />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopTracks />
            <TopArtists />
          </div>
        </TabsContent>

        <TabsContent value="tracks">
          <TopTracks />
        </TabsContent>

        <TabsContent value="artists">
          <TopArtists />
        </TabsContent>

        <TabsContent value="recent">
          <RecentlyPlayed />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
