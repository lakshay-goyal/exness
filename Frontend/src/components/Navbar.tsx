import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface NavbarProps {
  user?: User | null;
  onSignOut?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      // Default sign out behavior
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="text-white text-2xl font-bold">
        <Link to="/" className="hover:text-blue-300 transition-colors">
          Exness
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {user ? (
          // Authenticated user navigation
          <>
            <span className="text-white hidden md:block">
              Welcome, {user.firstName} {user.lastName}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              Sign Out
            </button>
          </>
        ) : (
          // Unauthenticated user navigation
          <>
            <Link 
              to="/signin" 
              className="text-white hover:text-blue-300 transition-colors text-sm md:text-base"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
