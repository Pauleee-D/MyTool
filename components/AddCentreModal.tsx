"use client";

import { useState } from "react";
import { X, Plus, Save } from "lucide-react";

interface Props {
  existing?: { id: string; name: string; state: string; url?: string };
  onSaved: (centre: { id: string; name: string; state: string; url?: string }) => void;
  onClose: () => void;
}

const STATES = ["ACT", "NSW", "NT", "NZ", "QLD", "SA", "TAS", "VIC", "WA"];

export default function AddCentreModal({ existing, onSaved, onClose }: Props) {
  const [name, setName] = useState(existing?.name ?? "");
  const [state, setState] = useState(existing?.state ?? "");
  const [url, setUrl] = useState(existing?.url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEditing = !!existing;

  const generateId = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 30);

  const handleSave = async () => {
    if (!name.trim() || !state) { setError("Name and state are required."); return; }
    setSaving(true);
    setError("");
    const id = isEditing ? existing.id : generateId(name);
    const res = await fetch("/api/centres", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: name.trim(), state, url: url.trim() || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save."); setSaving(false); return; }
    onSaved({ id, name: name.trim(), state, url: url.trim() || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-500" /> {isEditing ? "Edit Centre" : "Add New Centre"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Centre Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Springfield Aquatic Centre"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Select state…</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Website URL <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Centre"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
