import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { campaignApi } from '../../lib/api';
import { formatUsd } from '../../lib/currency';
import { Campaign } from '../../types';

const EMPTY_FORM: Partial<Campaign> = {
  title: '',
  slug: '',
  description: '',
  story: '',
  goalAmount: null,
  category: 'Education',
  imageUrl: '',
  status: 'ACTIVE',
};

export const AdminCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Campaign>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = () => {
    setLoading(true);
    campaignApi
      .list({ status: 'all', limit: 50 })
      .then((res) => {
        if (res.data?.campaigns) setCampaigns(res.data.campaigns);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (c: Campaign) => {
    setForm({ ...c, goalAmount: c.goalAmount == null ? null : c.goalAmount / 100 }); // stored in cents, entered in dollars
    setEditingId(c.id);
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      goalAmount: form.goalAmount == null ? null : Math.round(form.goalAmount * 100), // dollars→cents
      imageUrl: form.imageUrl?.trim() || null,
    };

    try {
      if (editingId) {
        await campaignApi.update(editingId, payload);
      } else {
        await campaignApi.create(payload);
      }
      setShowModal(false);
      fetchCampaigns();
    } catch (err: any) {
      setError(err.message || 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      await campaignApi.delete(id);
      fetchCampaigns();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const toggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await campaignApi.update(campaign.id, { status: newStatus });
      fetchCampaigns();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Campaign Management</h1>
          <p className="text-sm text-slate-500 mt-1">{campaigns.length} campaigns total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-blue-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-3 px-5">Campaign</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Goal</th>
                <th className="py-3 px-5">Raised</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900 max-w-xs truncate">{c.title}</div>
                    <div className="text-xs text-slate-400 font-mono">{c.slug}</div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{c.category}</span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-700">{c.goalAmount ? formatUsd(c.goalAmount) : 'Not set'}</td>
                  <td className="py-4 px-5 font-bold text-emerald-600">{formatUsd(c.raisedAmount)}</td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => toggleStatus(c)}
                      className={`flex items-center space-x-1 text-xs font-bold rounded-full px-2.5 py-0.5 transition-colors ${
                        c.status === 'ACTIVE'
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {c.status === 'ACTIVE' ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      <span>{c.status}</span>
                    </button>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-xl">{error}</div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Title *</label>
                <input
                  required
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                  placeholder="Campaign title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">URL Slug *</label>
                <input
                  required
                  value={form.slug || ''}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm font-mono"
                  placeholder="e.g. clean-water-wells"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Category *</label>
                  <select
                    value={form.category || ''}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                  >
                    <option>Education</option>
                    <option>Healthcare</option>
                    <option>Food Relief</option>
                    <option>Water</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Goal (USD, optional)</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    value={form.goalAmount ?? ''}
                    onChange={(e) => setForm({ ...form, goalAmount: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                    placeholder="e.g. 5000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Image URL</label>
                <input
                  value={form.imageUrl || ''}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Short Description *</label>
                <textarea
                  required
                  rows={2}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm resize-none"
                  placeholder="One-sentence summary shown on campaign cards"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Story *</label>
                <textarea
                  required
                  rows={8}
                  value={form.story || ''}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm resize-y"
                  placeholder="The full campaign story shown on the campaign page..."
                />
              </div>

              {editingId && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
                  <select
                    value={form.status || 'ACTIVE'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
