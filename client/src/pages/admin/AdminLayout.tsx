import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Shield, LayoutDashboard, FolderHeart, ReceiptText, BarChart3, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/campaigns', label: 'Campaigns', icon: FolderHeart },
  { to: '/admin/donations', label: 'Donations', icon: ReceiptText },
  { to: '/admin/impact', label: 'Impact Stats', icon: BarChart3 },
];

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Console</p>
            <h1 className="text-xl font-black text-slate-900 leading-tight">Children Hope Foundation</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-slate-500 text-xs">
            Signed in as <strong className="text-slate-800">{user?.name}</strong>
          </span>
          <Link
            to="/"
            className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <nav className="mt-8 flex space-x-2 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
};
