import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { impactApi } from '../../lib/api';
import { ImpactStat } from '../../types';

export const AdminImpactPage: React.FC = () => {
  const [stats, setStats] = useState<ImpactStat[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    impactApi
      .get()
      .then((res) => {
        if (res.data?.stats) setStats(res.data.stats);
        if (res.data?.settings) setSettings(res.data.settings);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const s of stats) {
        await impactApi.updateStat(s.id, { label: s.label, value: s.value, sortOrder: s.sortOrder });
      }
      await impactApi.updateSettings({
        hero_headline_badge: settings.hero_headline_badge ?? '',
        hero_card_title: settings.hero_card_title ?? '',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Impact Stats & Site Copy</h1>
          <p className="text-sm text-slate-500 mt-1">
            These numbers appear live on the homepage. Update them as field reports come in.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-600/30 transition-colors disabled:opacity-50 shrink-0"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Impact Stats */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Homepage Impact Numbers</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {stats.map((s) => (
            <div key={s.id} className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-6">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Label</label>
                <input
                  value={s.label}
                  onChange={(e) => setStats((prev) => prev.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Value</label>
                <input
                  type="number"
                  min={0}
                  value={s.value}
                  onChange={(e) =>
                    setStats((prev) => prev.map((x) => (x.id === s.id ? { ...x, value: Math.max(0, Number(e.target.value)) } : x)))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Displays As</label>
                <div className="text-lg font-black text-blue-600">
                  {s.value >= 1_000_000
                    ? `${(s.value / 1_000_000).toFixed(s.value % 1_000_000 === 0 ? 0 : 1)}M`
                    : s.value >= 100_000
                    ? `${Math.round(s.value / 1000)}K`
                    : s.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero copy */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-slate-900">Hero Section Copy</h2>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Badge Text</label>
          <input
            value={settings.hero_headline_badge ?? ''}
            onChange={(e) => setSettings((prev) => ({ ...prev, hero_headline_badge: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hero Card Title</label>
          <input
            value={settings.hero_card_title ?? ''}
            onChange={(e) => setSettings((prev) => ({ ...prev, hero_card_title: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
