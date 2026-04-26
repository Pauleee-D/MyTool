"use client";

import { useState } from "react";
import { Copy, Check, Pencil, X, Save } from "lucide-react";

interface Props {
  centreId: string;
  number: string;
  isAdmin: boolean;
  onSaved: (number: string) => void;
}

export default function VenueTab({ centreId, number, isAdmin, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"" | "saved" | "error">("");
  const [copied, setCopied] = useState(false);

  const handleEdit = () => { setEditText(number); setEditing(true); setStatus(""); };
  const handleCancel = () => { setEditing(false); setStatus(""); };

  const handleSave = async () => {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/venue-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: centreId, number: editText }),
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Edit controls */}
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

      <textarea
        value={editing ? editText : number}
        onChange={(e) => editing && setEditText(e.target.value)}
        readOnly={!editing}
        rows={4}
        placeholder={isAdmin && editing ? "Enter transfer number…" : "No transfer number set yet."}
        className={`w-full border rounded-xl p-4 text-sm font-mono focus:outline-none resize-none transition-colors ${
          editing
            ? "border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 bg-white"
            : "border-gray-200 bg-gray-50 text-gray-700 cursor-default"
        }`}
      />

      {!editing && number && (
        <button
          onClick={handleCopy}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
            copied ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      )}
    </div>
  );
}
