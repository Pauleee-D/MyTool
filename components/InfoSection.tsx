"use client";

import { useState } from "react";
import { Pencil, X, Save, Clock, Info } from "lucide-react";

interface PanelProps {
  centreId: string;
  content: string;
  isAdmin: boolean;
  onSaved: (content: string) => void;
  apiRoute: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  iconBg: string;
}

function EditablePanel({ centreId, content, isAdmin, onSaved, apiRoute, label, placeholder, icon, iconBg }: PanelProps) {
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
      const res = await fetch(apiRoute, {
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <h3 className="text-base font-semibold text-gray-800">{label}</h3>
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

      {/* Content */}
      {editing ? (
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          style={{ height: "280px" }} className="w-full border border-indigo-300 rounded-xl p-4 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
          placeholder={placeholder}
        />
      ) : (
        <div style={{ height: "280px" }} className="w-full border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 text-gray-700 overflow-y-auto whitespace-pre-wrap">
          {content || <span className="text-gray-400">{isAdmin ? `No ${label.toLowerCase()} yet — click Edit to add.` : `No ${label.toLowerCase()} available.`}</span>}
        </div>
      )}
    </div>
  );
}

interface InfoSectionProps {
  centreId: string;
  openingHours: string;
  generalInfo: string;
  isAdmin: boolean;
  onHoursSaved: (content: string) => void;
  onInfoSaved: (content: string) => void;
}

export default function InfoSection({ centreId, openingHours, generalInfo, isAdmin, onHoursSaved, onInfoSaved }: InfoSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {/* Opening Hours — 1 column (same width as Email card) */}
      <div className="col-span-1">
        <EditablePanel
          centreId={centreId}
          content={openingHours}
          isAdmin={isAdmin}
          onSaved={onHoursSaved}
          apiRoute="/api/opening-hours"
          label="Opening Hours"
          placeholder="e.g. Mon–Fri: 6am–10pm&#10;Sat–Sun: 7am–8pm"
          icon={<Clock className="w-4 h-4 text-teal-500" />}
          iconBg="bg-teal-50"
        />
      </div>

      {/* General Information — 2 columns (same width as SMS + Venue Transfer combined) */}
      <div className="col-span-2">
        <EditablePanel
          centreId={centreId}
          content={generalInfo}
          isAdmin={isAdmin}
          onSaved={onInfoSaved}
          apiRoute="/api/general-info"
          label="General Information"
          placeholder="Enter general information about this centre…"
          icon={<Info className="w-4 h-4 text-teal-500" />}
          iconBg="bg-teal-50"
        />
      </div>
    </div>
  );
}
