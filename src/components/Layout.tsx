
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Music, User } from 'lucide-react';
import { SpotifyUser } from '../types/spotify';
import { authAPI } from '../services/api';

interface LayoutProps {
  user: SpotifyUser;
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, children, onLogout }) => {
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Force logout even if API call fails
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,#1DB954_0%,transparent_50%)] opacity-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,#1DB954_0%,transparent_50%)] opacity-5"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Music className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Spotify Analytics</h1>
                <p className="text-sm text-gray-400">Your music insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user.images?.[0]?.url ? (
                  <img 
                    src={user.images[0].url} 
                    alt={user.display_name}
                    className="h-8 w-8 rounded-full border border-gray-600"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-300" />
                  </div>
                )}
                <span className="text-white font-medium hidden sm:inline">
                  {user.display_name}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
