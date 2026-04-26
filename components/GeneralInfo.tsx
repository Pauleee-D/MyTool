"use client";

import { useState } from "react";
import { Pencil, X, Save, Info } from "lucide-react";

interface Props {
  centreId: string;
  content: string;
  isAdmin: boolean;
  onSaved: (content: string) => void;
}

export default function GeneralInfo({ centreId, content, isAdmin, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"" | "saved" | "error">("");

  const handleEdit = () => { setEditText(content); setEditing(true); setStatus(""); };
  const handleCancel = () => { setEditing(false); setStatus(""); };

  const handleSave = async () => {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/general-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: centreId, content: editText }),
      });
      if (!res.ok) throw new Error();
      onSaved(editText);
      setEditing(false);
      setStatus("saved");
      setTimeout(() => setStatus(""), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Info className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">General Information</h3>
        </div>
        <div className="flex items-center gap-2">
          {status === "saved" && <span className="text-sm text-emerald-600 font-medium">Saved</span>}
          {status === "error" && <span className="text-sm text-red-500 font-medium">Save failed</span>}
          {isAdmin && !editing && (
            <button onClick={handleEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {isAdmin && editing && (
            <>
              <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content area — double the height of the tool cards row */}
      {editing ? (
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full h-56 border border-indigo-300 rounded-xl p-4 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
          placeholder="Enter general information about this centre…"
        />
      ) : (
        <div className="w-full h-56 border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 text-gray-700 overflow-y-auto whitespace-pre-wrap">
          {content || <span className="text-gray-400">{isAdmin ? "No general information yet — click Edit to add some." : "No general information available."}</span>}
        </div>
      )}
    </div>
  );
}
