"use client";

import { useRef, useState } from "react";
import { Copy, Check, Pencil, X, Save } from "lucide-react";

interface Props {
  centreId: string;
  emailText: string;
  isAdmin: boolean;
  onSaved: (html: string) => void;
}

export default function EmailTab({ centreId, emailText, isAdmin, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"" | "saved" | "error">("");
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleEdit = () => {
    setEditing(true);
    setStatus("");
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = emailText; }, 0);
  };

  const handleCancel = () => { setEditing(false); setStatus(""); };

  const handleSave = async () => {
    const html = editorRef.current?.innerHTML ?? "";
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: centreId, template: html }),
      });
      if (!res.ok) throw new Error();
      onSaved(html);
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
    try {
      const tmp = document.createElement("div");
      tmp.innerHTML = emailText;
      const plain = tmp.innerText;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([emailText], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
    } catch {
      await navigator.clipboard.writeText(emailText);
    }
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

      {/* Top copy button */}
      {!editing && emailText && (
        <button
          onClick={handleCopy}
          className={`mb-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            copied ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      )}

      {/* Editor / Viewer — fixed height with scroll */}
      {editing ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full border border-indigo-300 rounded-xl p-4 text-sm h-[60vh] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white [&_a]:text-indigo-600 [&_a]:underline overflow-y-auto"
        />
      ) : (
        <div
          className="w-full border border-gray-200 rounded-xl p-4 text-sm bg-gray-50 text-gray-700 h-[60vh] [&_a]:text-indigo-600 [&_a]:underline overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: emailText || "<span class='text-gray-400'>No email template set yet.</span>" }}
        />
      )}

      {/* Bottom copy button */}
      {!editing && emailText && (
        <button
          onClick={handleCopy}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
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
