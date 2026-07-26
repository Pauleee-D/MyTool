"use client";

import { useState, useEffect } from "react";
import { Globe, BookOpen, ArrowUpRight, Pencil, X, Check } from "lucide-react";

interface Props {
  centreId: string;
  websiteUrl: string;
  knowledgeUrl: string;
  isAdmin: boolean;
  onSaved: (websiteUrl: string, knowledgeUrl: string) => void;
}

function EditUrlPopover({ label, value, onSave, onClose }: { label: string; value: string; onSave: (val: string) => void; onClose: () => void; }) {
  const [text, setText] = useState(value);
  return (
    <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-72">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label} URL</p>
      <input
        type="url"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        placeholder="https://…"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-2"
      />
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors">
          <X className="w-3 h-3" /> Cancel
        </button>
        <button onClick={() => { onSave(text); onClose(); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors">
          <Check className="w-3 h-3" /> Save
        </button>
      </div>
    </div>
  );
}

type EditingField = "website" | "knowledge" | null;

export default function CentreLinks({ centreId, websiteUrl, knowledgeUrl, isAdmin, onSaved }: Props) {
  const [editing, setEditing] = useState<EditingField>(null);
  const [localWebsite, setLocalWebsite] = useState(websiteUrl);
  const [localKnowledge, setLocalKnowledge] = useState(knowledgeUrl);

  useEffect(() => { setLocalWebsite(websiteUrl); }, [websiteUrl]);
  useEffect(() => { setLocalKnowledge(knowledgeUrl); }, [knowledgeUrl]);

  const save = async (website: string, knowledge: string) => {
    setLocalWebsite(website);
    setLocalKnowledge(knowledge);
    onSaved(website, knowledge);
    await fetch("/api/centre-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: centreId, website_url: website, knowledge_url: knowledge }),
    });
  };

  const links = [
    { key: "website" as EditingField, label: "Website", url: localWebsite, icon: <Globe className="w-3.5 h-3.5" />, color: "bg-blue-50 hover:bg-blue-100 text-blue-700", onSave: (val: string) => save(val, localKnowledge) },
    { key: "knowledge" as EditingField, label: "Knowledge Library", url: localKnowledge, icon: <BookOpen className="w-3.5 h-3.5" />, color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700", onSave: (val: string) => save(localWebsite, val) },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {links.map((link) => (
        <div key={link.key} className="relative">
          <div className="flex items-center gap-1">
            {link.url ? (
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                style={{ minWidth: "300px" }}
                className={`tool-card inline-flex items-center justify-center gap-1.5 px-6 py-1.5 ${link.color} rounded-full text-xs font-semibold transition-colors whitespace-nowrap`}>
                {link.icon}{link.label}<ArrowUpRight className="w-3 h-3" />
              </a>
            ) : (
              <span style={{ minWidth: "300px" }} className="inline-flex items-center justify-center gap-1.5 px-6 py-1.5 bg-gray-100 text-gray-400 rounded-full text-xs font-semibold whitespace-nowrap">
                {link.icon}{link.label}
              </span>
            )}
            {isAdmin && (
              <button onClick={() => setEditing(editing === link.key ? null : link.key)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors" title={`Edit ${link.label} URL`}>
                <Pencil className="w-3 h-3 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          {editing === link.key && (
            <EditUrlPopover label={link.label} value={link.url} onSave={link.onSave} onClose={() => setEditing(null)} />
          )}
        </div>
      ))}
    </div>
  );
}
