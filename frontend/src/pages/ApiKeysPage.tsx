import React, { useState, useEffect } from 'react';
import { fetchApiKeys, createApiKey, updateApiKey, revokeApiKey, ApiKeyRecord } from '../lib/api';
import { Key, Plus, Trash2, Copy, Check, ShieldAlert, AlertCircle } from 'lucide-react';

export const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [dailyQuota, setDailyQuota] = useState<number>(500);
  const [editingKey, setEditingKey] = useState<ApiKeyRecord | null>(null);
  const [editQuotaValue, setEditQuotaValue] = useState<number>(500);
  const [newKeyModal, setNewKeyModal] = useState<ApiKeyRecord | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      setLoading(true);
      const data = await fetchApiKeys();
      setKeys(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!keyName.trim()) return;
    try {
      const created = await createApiKey(keyName.trim(), dailyQuota);
      setNewKeyModal(created);
      setKeyName('');
      setDailyQuota(500);
      setCreating(false);
      loadKeys();
    } catch (err) {
      alert('Failed to generate API Key');
    }
  }

  async function handleUpdateQuota(e: React.FormEvent) {
    e.preventDefault();
    if (!editingKey) return;
    try {
      await updateApiKey(editingKey.id, { dailyQuota: editQuotaValue });
      setEditingKey(null);
      loadKeys();
    } catch (err) {
      alert('Failed to update quota');
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will be denied.')) return;
    try {
      await revokeApiKey(id);
      loadKeys();
    } catch (err) {
      alert('Failed to revoke key');
    }
  }

  function copyRawSecret(secret: string) {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">API Keys Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate and manage secret keys to authenticate external REST API requests to your AI Mini-Apps fleet.
          </p>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-md transition-all"
        >
          <Plus size={16} />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* Security Info */}
      <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/40 flex items-start gap-3 text-xs text-sky-200">
        <AlertCircle size={18} className="text-sky-400 shrink-0 mt-0.5" />
        <p leading-relaxed>
          Keys are stored using cryptographic SHA-256 hashes. Raw keys are never stored in plain text and are only shown once during creation.
        </p>
      </div>

      {/* Keys Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="p-4">Key Name</th>
              <th className="p-4">Key Prefix</th>
              <th className="p-4">Daily Quota</th>
              <th className="p-4">Created</th>
              <th className="p-4">Last Used</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">Loading keys...</td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">No active API keys found.</td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Key size={14} className="text-sky-400" />
                    <span>{k.name}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-300">{k.prefix}</td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        setEditingKey(k);
                        setEditQuotaValue(k.dailyQuota ?? 500);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-950/60 text-sky-300 border border-sky-800/40 hover:bg-sky-900/50 transition-colors"
                      title="Click to change quota"
                    >
                      {k.dailyQuota && k.dailyQuota > 0 ? `${k.dailyQuota.toLocaleString()} req/day` : 'Unlimited'}
                    </button>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-400">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleTimeString() : 'Never'}
                  </td>
                  <td className="p-4">
                    {k.isRevoked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-400 border border-red-800">
                        Revoked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!k.isRevoked && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateKey}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in"
          >
            <h3 className="text-lg font-bold text-white">Generate New API Key</h3>
            <p className="text-xs text-slate-400">Enter a descriptive label and set daily request quotas.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Key Label</label>
                <input
                  type="text"
                  placeholder="e.g. Production Mobile App"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Request Quota (req/day)</label>
                <input
                  type="number"
                  min="0"
                  value={dailyQuota}
                  onChange={(e) => setDailyQuota(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sky-500"
                />
                <div className="flex gap-1.5 mt-2">
                  {[100, 500, 1000, 5000, 0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDailyQuota(preset)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold border ${dailyQuota === preset ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                    >
                      {preset === 0 ? 'Unlimited' : preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-md"
              >
                Generate Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Quota Modal */}
      {editingKey && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateQuota}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in"
          >
            <h3 className="text-lg font-bold text-white">Adjust Daily Quota</h3>
            <p className="text-xs text-slate-400">Update request allowance for <strong>{editingKey.name}</strong> ({editingKey.prefix}).</p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Requests Limit (0 = unlimited)</label>
              <input
                type="number"
                min="0"
                value={editQuotaValue}
                onChange={(e) => setEditQuotaValue(Number(e.target.value))}
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sky-500"
              />
              <div className="flex gap-1.5 mt-2">
                {[100, 500, 1000, 5000, 0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEditQuotaValue(preset)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border ${editQuotaValue === preset ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                  >
                    {preset === 0 ? 'Unlimited' : preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingKey(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-md"
              >
                Save Quota
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Secret Reveal Modal */}
      {newKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldAlert size={20} />
              <span>API Key Created - Copy Secret Now</span>
            </div>
            <p className="text-xs text-slate-300">
              Please store this key securely. You will <strong>not</strong> be able to view it again once this modal is closed.
            </p>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs text-emerald-300">
              <span className="break-all">{newKeyModal.rawSecret}</span>
              <button
                onClick={() => copyRawSecret(newKeyModal.rawSecret || '')}
                className="ml-3 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors shrink-0"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setNewKeyModal(null)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                I have saved my key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
