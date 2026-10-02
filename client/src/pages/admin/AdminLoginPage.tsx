import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { authApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from '../../components/BrandMark';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      if (res.data?.user) {
        if (res.data.user.role !== 'ADMIN') {
          setError('This account does not have admin access.');
          setLoading(false);
          return;
        }
        login(res.data.user);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <BrandMark size={56} className="mx-auto shadow-md shadow-emerald-900/15" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console</h2>
          <p className="text-xs text-slate-500">Staff access only</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@childrenhope.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-slate-900 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
          <Link to="/login" className="hover:text-slate-600">
            ← Donor sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
