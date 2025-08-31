import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { BidAskTicker, TradingViewChart } from '../components';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string>("BTCUSDT");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // If user data is corrupted, clear it and redirect to signin
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/signin');
      }
    } else {
      // If no user data, try to fetch it from the backend
      fetchUserData();
    }
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user data:', error);
      // On error, clear storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signin');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAssetSelect = (asset: string) => {
    setSelectedAsset(asset);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="text-white text-2xl font-bold">Exness</div>
        <div className="flex items-center space-x-4">
          <span className="text-white hidden md:block">
            Welcome, {user.firstName} {user.lastName}
          </span>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - BidAskTicker */}
        <BidAskTicker 
          onAssetSelect={handleAssetSelect}
          selectedAsset={selectedAsset}
        />
        
        {/* Right Content - TradingViewChart */}
        <div className="flex-1 p-6">
          <TradingViewChart selectedAsset={selectedAsset} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
