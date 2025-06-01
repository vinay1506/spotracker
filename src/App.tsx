
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import NotFound from "./pages/NotFound";
import { authAPI } from './services/api';
import { SpotifyUser } from './types/spotify';

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getStatus();
      if (response.authenticated && response.user) {
        setUser(response.user);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthenticated(false);
  };

  useEffect(() => {
    checkAuthStatus();

    // Check for auth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Remove the success parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Recheck auth status after successful login
      setTimeout(checkAuthStatus, 1000);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                authenticated && user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Dashboard user={user} />
                  </Layout>
                ) : (
                  <Login />
                )
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
