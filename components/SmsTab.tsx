"use client";

import { useState } from "react";
import { Copy, Check, Pencil, X, Save, Plus, Trash2 } from "lucide-react";

const MAX_OPTIONS = 8;

export type SmsOption = { label: string; text: string };

interface Props {
  centreId: string;
  options: SmsOption[];
  isAdmin: boolean;
  onSaved: (options: SmsOption[]) => void;
}

export default function SmsTab({ centreId, options, isAdmin, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [editOptions, setEditOptions] = useState<SmsOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"" | "saved" | "error">("");
  const [copied, setCopied] = useState<number | null>(null);

  const handleEdit = () => { setEditOptions([...options]); setEditing(true); setStatus(""); };
  const handleCancel = () => { setEditing(false); setStatus(""); };

  const handleSave = async () => {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/sms-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: centreId, options: editOptions }),
      });
      if (!res.ok) throw new Error();
      onSaved([...editOptions]);
      setEditing(false);
      setStatus("saved");
      setTimeout(() => setStatus(""), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (i: number) => {
    await navigator.clipboard.writeText(options[i].text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
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

      {/* Read view — 2-row column-fill grid */}
      {!editing && (
        options.length === 0 ? (
          <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-200 rounded-xl text-sm">
            {isAdmin ? "No SMS options yet — click Edit to add some" : "No SMS templates set yet."}
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateRows: "repeat(2, auto)",
              gridAutoFlow: "column",
              gridAutoColumns: "1fr",
            }}
          >
            {options.map((opt, i) => {
              const pair = Math.floor(i / 2);
              const baseColor = pair === 1
                ? "bg-sky-500 hover:bg-sky-600"
                : pair === 2
                ? "bg-orange-400 hover:bg-orange-500"
                : pair === 3
                ? "bg-green-500 hover:bg-green-600"
                : "bg-indigo-600 hover:bg-indigo-700";
              return (
                <div key={i}>
                  <button
                    onClick={() => handleCopy(i)}
                    className={`mb-1.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors text-white ${copied === i ? "bg-emerald-600" : baseColor}`}
                  >
                    {copied === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied === i ? "Copied!" : opt.label}
                  </button>
                  <textarea value={opt.text} readOnly rows={8} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 text-gray-700 cursor-default resize-none" />
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Edit view — same 2-row column-fill grid */}
      {editing && (
        <div
          className="grid gap-4"
          style={{
            gridTemplateRows: "repeat(2, auto)",
            gridAutoFlow: "column",
            gridAutoColumns: "1fr",
          }}
        >
          {editOptions.map((opt, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <input
                  value={opt.label}
                  onChange={(e) => { const u = [...editOptions]; u[i] = { ...u[i], label: e.target.value }; setEditOptions(u); }}
                  placeholder="Option name…"
                  className="text-sm font-semibold text-gray-700 border border-indigo-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white mb-1"
                />
                <button onClick={() => setEditOptions(editOptions.filter((_, idx) => idx !== i))} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 transition-colors shrink-0 ml-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={opt.text}
                onChange={(e) => { const u = [...editOptions]; u[i] = { ...u[i], text: e.target.value }; setEditOptions(u); }}
                rows={8}
                className="w-full border border-indigo-300 rounded-xl p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>
          ))}
          {editOptions.length < MAX_OPTIONS && (
            <button
              onClick={() => setEditOptions([...editOptions, { label: `Option ${editOptions.length + 1}`, text: "" }])}
              className="py-3 rounded-xl text-sm font-medium border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Option {editOptions.length + 1}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
