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

function EditUrlPopover({
  label,
  value,
  onSave,
  onClose,
}: {
  label: string;
  value: string;
  onSave: (val: string) => void;
  onClose: () => void;
}) {
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
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
        <button
          onClick={() => { onSave(text); onClose(); }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <Check className="w-3 h-3" /> Save
        </button>
      </div>
    </div>
  );
}

export default function CentreLinks({ centreId, websiteUrl, knowledgeUrl, isAdmin, onSaved }: Props) {
  const [editingWebsite, setEditingWebsite] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState(false);
  const [localWebsite, setLocalWebsite] = useState(websiteUrl);
  const [localKnowledge, setLocalKnowledge] = useState(knowledgeUrl);

  useEffect(() => {
    if (!editingWebsite) setLocalWebsite(websiteUrl);
  }, [websiteUrl, editingWebsite]);

  useEffect(() => {
    if (!editingKnowledge) setLocalKnowledge(knowledgeUrl);
  }, [knowledgeUrl, editingKnowledge]);

  const save = async (newWebsite: string, newKnowledge: string) => {
    setLocalWebsite(newWebsite);
    setLocalKnowledge(newKnowledge);
    onSaved(newWebsite, newKnowledge);
    await fetch("/api/centre-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: centreId, website_url: newWebsite, knowledge_url: newKnowledge }),
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
      {/* Website */}
      <div className="relative">
        <div className="flex items-center gap-1">
          {localWebsite ? (
            <a
              href={localWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="tool-card flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm font-semibold transition-colors"
            >
              <Globe className="w-4 h-4" />
              Website
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-full text-sm font-semibold">
              <Globe className="w-4 h-4" />
              Website
            </span>
          )}
          {isAdmin && (
            <button
              onClick={() => { setEditingWebsite(true); setEditingKnowledge(false); }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit website URL"
            >
              <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        {editingWebsite && (
          <EditUrlPopover
            label="Website"
            value={localWebsite}
            onSave={(val) => save(val, localKnowledge)}
            onClose={() => setEditingWebsite(false)}
          />
        )}
      </div>

      {/* Knowledge Library */}
      <div className="relative">
        <div className="flex items-center gap-1">
          {localKnowledge ? (
            <a
              href={localKnowledge}
              target="_blank"
              rel="noopener noreferrer"
              className="tool-card flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Knowledge Library
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-full text-sm font-semibold">
              <BookOpen className="w-4 h-4" />
              Knowledge Library
            </span>
          )}
          {isAdmin && (
            <button
              onClick={() => { setEditingKnowledge(true); setEditingWebsite(false); }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit knowledge library URL"
            >
              <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        {editingKnowledge && (
          <EditUrlPopover
            label="Knowledge Library"
            value={localKnowledge}
            onSave={(val) => save(localWebsite, val)}
            onClose={() => setEditingKnowledge(false)}
          />
        )}
      </div>
    </div>
  );
}
