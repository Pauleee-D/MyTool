"use client";

import { useState } from "react";
import { Pencil, X, Save } from "lucide-react";

interface Props {
  centreId: string;
  content: string;
  isAdmin: boolean;
  onSaved: (content: string) => void;
}

export default function KnowledgeLibrary({ centreId, content, isAdmin, onSaved }: Props) {
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
      const res = await fetch("/api/knowledge-library", {
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
    <div>
      {isAdmin && (
        <div className="flex items-center justify-end gap-2 mb-4">
          {status === "saved" && <span className="text-sm text-emerald-600 font-medium">Saved</span>}
          {status === "error" && <span className="text-sm text-red-500 font-medium">Save failed</span>}
          {!editing && (
            <button onClick={handleEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {editing && (
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
      )}

      {editing ? (
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          style={{ height: "60vh" }}
          className="w-full border border-indigo-300 rounded-xl p-4 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
          placeholder="Enter knowledge library content for this centre…"
        />
      ) : (
        <div
          style={{ height: "60vh" }}
          className="w-full border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 text-gray-700 overflow-y-auto whitespace-pre-wrap"
        >
          {content || <span className="text-gray-400">{isAdmin ? "No content yet — click Edit to add." : "No knowledge library content available."}</span>}
        </div>
      )}
    </div>
  );
}
