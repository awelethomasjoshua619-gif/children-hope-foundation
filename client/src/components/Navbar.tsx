import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
                Children Hope
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                Foundation
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/campaigns" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Causes & Campaigns
            </Link>
            <Link to="/transparency" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Transparency
            </Link>
            <Link to="/about" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Actions / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'ADMIN' ? (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>My History</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
            )}

            <Link
              to="/campaigns"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all hover:-translate-y-0.5"
            >
              Donate Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-700"
          >
            Home
          </Link>
          <Link
            to="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-700"
          >
            Causes & Campaigns
          </Link>
          <Link
            to="/transparency"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-700"
          >
            Transparency
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-700"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-700"
          >
            Contact
          </Link>

          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-semibold text-blue-600"
                >
                  Dashboard ({user.name})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-base font-semibold text-rose-600"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-semibold text-slate-700"
              >
                Sign In / Register
              </Link>
            )}

            <Link
              to="/campaigns"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md"
            >
              Donate Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
