import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Heart, MessageSquare, Home as HostIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
      >
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm font-medium hidden md:block">
          {user?.first_name || 'User'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-medium text-gray-900">
              {user ? `${user.first_name} ${user.last_name}` : ''}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>

          <div className="py-2">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Profile</span>
            </Link>

            <Link
              to="/bookings"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm">My Bookings</span>
            </Link>

            <Link
              to="/favorites"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Favorites</span>
            </Link>

            <Link
              to="/messages"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Messages</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 py-2">
            <Link
              to="/host"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <HostIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Switch to Hosting</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
