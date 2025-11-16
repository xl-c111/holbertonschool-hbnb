import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/user-menu";

export function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-6 h-6" />
              <span className="text-xl font-semibold">HBnB</span>
            </Link>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-gray-600 transition-colors">
                Home
              </Link>
              <Link to="/listings" className="text-sm font-medium hover:text-gray-600 transition-colors">
                Listings
              </Link>
              <Link to="/search" className="text-sm font-medium hover:text-gray-600 transition-colors">
                Search
              </Link>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/host"
              className="hidden md:block text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Become a Host
            </Link>

            {/* Show Login/Sign Up OR User Menu based on auth state */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex border-gray-300 hover:bg-gray-50 rounded-full px-5"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-black text-white rounded-full px-5 hover:bg-gray-800">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
