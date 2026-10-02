import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Shield, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from './BrandMark';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#dfe3da] bg-[#fdfcf8]/95 backdrop-blur-md">
      <div className="hidden border-b border-[#e7e8e1] bg-[#16352f] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4e8bd] sm:block">
        Community-led programs across Africa · Transparent project reporting
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px] items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <BrandMark size={42} className="transition-transform group-hover:scale-105" />
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#16352f] block leading-none">
                Children Hope
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#777551]">
                Foundation
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-7">
            <Link to="/" className="text-sm font-semibold text-[#52655f] hover:text-[#16352f] transition-colors">
              Home
            </Link>
            <Link to="/campaigns" className="text-sm font-semibold text-[#52655f] hover:text-[#16352f] transition-colors">
              Causes & Campaigns
            </Link>
            <Link to="/transparency" className="text-sm font-semibold text-[#52655f] hover:text-[#16352f] transition-colors">
              Transparency
            </Link>
            <Link to="/about" className="text-sm font-semibold text-[#52655f] hover:text-[#16352f] transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-semibold text-[#52655f] hover:text-[#16352f] transition-colors">
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
                    className="flex items-center space-x-1 text-xs font-bold bg-[#f5edcf] text-[#695b24] border border-[#dfd19c] px-3 py-2 rounded-lg hover:bg-[#eee2b8] transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 text-sm font-semibold text-[#52655f] hover:text-[#16352f] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>My History</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-[#16352f] rounded-lg hover:bg-[#f2f0e9] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-[#52655f] hover:text-[#16352f] transition-colors"
              >
                Sign In
              </Link>
            )}

            <Link
              to="/campaigns"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#c49d45] px-5 py-2.5 text-sm font-bold text-[#17332e] transition-colors hover:bg-[#d6b15e]"
            >
              Donate <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#52655f] hover:text-[#16352f]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#fdfcf8] border-b border-[#dfe3da] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[#16352f]"
          >
            Home
          </Link>
          <Link
            to="/campaigns"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[#16352f]"
          >
            Causes & Campaigns
          </Link>
          <Link
            to="/transparency"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[#16352f]"
          >
            Transparency
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[#16352f]"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[#16352f]"
          >
            Contact
          </Link>

          <div className="pt-4 border-t border-[#e7e8e1] flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-semibold text-[#16352f]"
                >
                  Dashboard ({user.name})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
              className="text-left py-2 text-base font-semibold text-rose-700"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-semibold text-[#16352f]"
              >
                Sign In / Register
              </Link>
            )}

            <Link
              to="/campaigns"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#c49d45] text-[#16352f] font-bold py-3 rounded-full"
            >
              Donate Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
