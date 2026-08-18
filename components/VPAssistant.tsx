"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Bot, Pencil, X, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  centreId: string;
  centreName: string;
  knowledgeBase: string;
  isAdmin: boolean;
  onKbSaved: (content: string) => void;
}

export default function VPAssistant({ centreId, centreName, knowledgeBase, isAdmin, onKbSaved }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingKb, setEditingKb] = useState(false);
  const [kbText, setKbText] = useState(knowledgeBase);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKbText(knowledgeBase);
  }, [knowledgeBase]);

  useEffect(() => {
    if (messages.length === 0) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const userMsg = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, knowledgeBase, centreName }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer ?? "No response." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error getting response. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKb = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      const res = await fetch("/api/knowledge-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: centreId, content: kbText }),
      });
      if (!res.ok) throw new Error();
      onKbSaved(kbText);
      setEditingKb(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Knowledge Base button (admin only) */}
      {isAdmin && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {knowledgeBase ? "Knowledge base loaded" : <span className="text-amber-500">No knowledge base — click Edit to add</span>}
          </p>
          <button
            onClick={() => { setKbText(knowledgeBase); setEditingKb(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit Knowledge Base
          </button>
        </div>
      )}

      {/* Knowledge Base full-page modal */}
      {editingKb && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col animate-slideUp" style={{ height: "90vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Knowledge Base</h2>
                  <p className="text-xs text-gray-400">{centreName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {saveStatus === "saved" && <span className="text-sm text-emerald-600 font-medium">Saved</span>}
                {saveStatus === "error" && <span className="text-sm text-red-500 font-medium">Save failed</span>}
                <button
                  onClick={() => { setEditingKb(false); setKbText(knowledgeBase); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSaveKb}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
            {/* Editor */}
            <textarea
              value={kbText}
              onChange={(e) => setKbText(e.target.value)}
              autoFocus
              placeholder="Paste your knowledge base content here…"
              className="flex-1 w-full px-6 py-4 text-sm text-gray-700 focus:outline-none resize-none bg-white rounded-b-2xl"
            />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-b border-gray-100 pb-3 mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            placeholder="Ask VP a question…"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
          >
            <Send className="w-4 h-4" /> Ask
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div style={{ height: "340px" }} className="overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">VP is ready</p>
            <p className="text-xs text-gray-400 mt-1">Ask anything about {centreName}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-indigo-600 text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              {m.role === "assistant" && (
                <p className="text-[10px] font-semibold text-indigo-500 mb-1 uppercase tracking-wider">VP</p>
              )}
              {m.role === "assistant" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({ ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2 space-y-0.5 last:mb-0" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5 last:mb-0" {...props} />,
                    li: ({ ...props }) => <li {...props} />,
                    h1: ({ ...props }) => <h3 className="text-sm font-bold text-gray-900 mt-1 mb-1 first:mt-0" {...props} />,
                    h2: ({ ...props }) => <h3 className="text-sm font-bold text-gray-900 mt-1 mb-1 first:mt-0" {...props} />,
                    h3: ({ ...props }) => <h4 className="text-sm font-semibold text-gray-900 mt-1 mb-1 first:mt-0" {...props} />,
                    a: ({ ...props }) => <a className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    code: ({ ...props }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs" {...props} />,
                    table: ({ ...props }) => (
                      <div className="overflow-x-auto mb-2 last:mb-0">
                        <table className="text-xs border-collapse" {...props} />
                      </div>
                    ),
                    th: ({ ...props }) => <th className="border border-gray-300 px-2 py-1 bg-gray-50 text-left font-semibold" {...props} />,
                    td: ({ ...props }) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <p className="text-[10px] font-semibold text-indigo-500 mb-1 uppercase tracking-wider">VP</p>
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {messages.length > 0 && (
        <button
          onClick={() => setMessages([])}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Clear chat
        </button>
      )}
    </div>
  );
}
