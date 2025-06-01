
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';
import { authAPI } from '../services/api';

const Login = () => {
  const handleLogin = () => {
    authAPI.login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,#1DB954_0%,transparent_50%)] opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,#1DB954_0%,transparent_50%)] opacity-10"></div>
      
      <Card className="w-full max-w-md bg-black/80 border-gray-800 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-500 rounded-full">
              <Music className="h-8 w-8 text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Spotify Analytics
          </CardTitle>
          <CardDescription className="text-gray-400">
            Discover your music listening patterns and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-300">
              Connect your Spotify account to view:
            </p>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Your top tracks and artists</li>
              <li>• Recently played music</li>
              <li>• Listening time statistics</li>
              <li>• Genre breakdowns and charts</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-12 text-base transition-all duration-200 hover:scale-105"
          >
            <Music className="mr-2 h-5 w-5" />
            Connect with Spotify
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            We only access your listening data and never modify your playlists or account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
