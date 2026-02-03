import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Brand - Left */}
          <Link to="/dashboard/my-news" className="text-2xl font-bold text-gray-900">
            MSE News Portal
          </Link>

          {/* Navigation - Right */}
          <div className="flex items-center space-x-6">
            <Link
              to="/dashboard/my-news"
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard/my-news')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My News
            </Link>
            <Link
              to="/dashboard/all-news"
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard/all-news')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All News
            </Link>
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}