"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Search, X, LogIn, LogOut, ChevronDown, Mail, MessageSquare, ArrowLeftRight, ArrowUpRight, Eye, EyeOff, Sun, Moon, Plus, Pencil, Trash2, Bot, Check } from "lucide-react";
import EmailTab from "@/components/EmailTab";
import Modal from "@/components/Modal";
import InfoSection from "@/components/InfoSection";
import CentreLinks from "@/components/CentreLinks";
import VPAssistant from "@/components/VPAssistant";
import AddCentreModal from "@/components/AddCentreModal";

type ModalType = "email" | null;
type Centre = { id: string; name: string; state: string; url?: string };
type CentreLinkData = { website_url?: string; knowledge_url?: string; sms_url?: string; transfer_url?: string };

function LinkToolCard({
  label, url, icon, hoverColor, accentColor, isAdmin, onSaveUrl,
}: {
  label: string; url: string; icon: React.ReactNode;
  hoverColor: string; accentColor: string;
  isAdmin: boolean; onSaveUrl: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(url);
  useEffect(() => { setText(url); }, [url]);

  const card = (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 ${hoverColor} rounded-lg flex items-center justify-center transition-colors shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
        <p className="text-xs text-gray-400">{url ? "Open link" : "No link set"}</p>
      </div>
      <ArrowUpRight className={`w-4 h-4 ${url ? accentColor : "text-gray-200"} transition-colors shrink-0`} />
    </div>
  );

  return (
    <div className="relative tool-card group bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none">
          {card}
        </a>
      ) : (
        <div className="opacity-60">{card}</div>
      )}
      {isAdmin && !editing && (
        <button
          onClick={() => setEditing(true)}
          className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
          title={`Edit ${label} URL`}
        >
          <Pencil className="w-3 h-3 text-gray-400" />
        </button>
      )}
      {editing && (
        <div className="absolute inset-0 bg-white rounded-2xl border border-indigo-200 shadow-lg z-10 p-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label} URL</p>
          <input
            type="url"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="https://…"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setText(url); }} className="flex-1 flex items-center justify-center gap-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors">
              <X className="w-3 h-3" /> Cancel
            </button>
            <button onClick={() => { onSaveUrl(text); setEditing(false); }} className="flex-1 flex items-center justify-center gap-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors">
              <Check className="w-3 h-3" /> Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const isAdmin = !!session;
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [showAddCentre, setShowAddCentre] = useState(false);
  const [editingCentre, setEditingCentre] = useState<Centre | null>(null);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [emailTemplates, setEmailTemplates] = useState<Record<string, string>>({});
  const [generalInfo, setGeneralInfo] = useState<Record<string, string>>({});
  const [openingHours, setOpeningHours] = useState<Record<string, string>>({});
  const [centreLinks, setCentreLinks] = useState<Record<string, CentreLinkData>>({});
  const [knowledgeLibrary, setKnowledgeLibrary] = useState<Record<string, string>>({});
  const [showInfo, setShowInfo] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch("/api/centres").then((r) => r.json()).then(setCentres);
    fetch("/api/templates").then((r) => r.json()).then(setEmailTemplates);
    fetch("/api/general-info").then((r) => r.json()).then(setGeneralInfo);
    fetch("/api/opening-hours").then((r) => r.json()).then(setOpeningHours);
    fetch("/api/centre-links").then((r) => r.json()).then(setCentreLinks);
    fetch("/api/knowledge-library").then((r) => r.json()).then(setKnowledgeLibrary);
  }, []);

  const states = [...new Set(centres.map((c) => c.state))].sort();

  const handleDeleteCentre = async (id: string) => {
    if (!confirm("Delete this centre? This cannot be undone.")) return;
    await fetch("/api/centres", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setCentres((p) => p.filter((c) => c.id !== id));
    if (selectedCentre?.id === id) handleClear();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCentres = centres
    .filter((c) => {
      const matchState = !selectedState || c.state === selectedState;
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.state.toLowerCase().includes(search.toLowerCase());
      return matchState && matchSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSelectCentre = (centre: Centre) => {
    setSelectedCentre(centre);
    setSearch(centre.name);
    setDropdownOpen(false);
    setOpenModal(null);
  };

  const handleClear = () => {
    setSelectedCentre(null);
    setSearch("");
    setSelectedState("");
    setDropdownOpen(false);
  };

  const saveCardUrl = async (field: "sms" | "transfer", url: string) => {
    if (!selectedCentre) return;
    const current = centreLinks[selectedCentre.id] ?? {};
    const updated: CentreLinkData = { ...current, [`${field}_url`]: url };
    setCentreLinks((p) => ({ ...p, [selectedCentre.id]: updated }));
    await fetch("/api/centre-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedCentre.id, website_url: updated.website_url, knowledge_url: updated.knowledge_url, sms_url: updated.sms_url, transfer_url: updated.transfer_url }),
    });
  };

  const centreEmail = selectedCentre ? (emailTemplates[selectedCentre.id] ?? "") : "";
  const centreInfo = selectedCentre ? (generalInfo[selectedCentre.id] ?? "") : "";
  const centreHours = selectedCentre ? (openingHours[selectedCentre.id] ?? "") : "";
  const centreLinks_data = selectedCentre ? (centreLinks[selectedCentre.id] ?? {}) : {};
  const centreWebsiteUrl = centreLinks_data.website_url ?? (selectedCentre?.url ?? "");
  const centreKnowledgeUrl = centreLinks_data.knowledge_url ?? "";
  const centreSmsUrl = centreLinks_data.sms_url ?? "";
  const centreTransferUrl = centreLinks_data.transfer_url ?? "";
  const centreKnowledge = selectedCentre ? (knowledgeLibrary[selectedCentre.id] ?? "") : "";

  return (
    <div className={darkMode ? "dark" : ""}>
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-none">LeisureHub</h1>
                <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Centre Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span><span className="font-semibold text-gray-700">{centres.length}</span> Centres</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full pulse-ring" />
                <span>{isAdmin ? "Admin" : "Read-only"}</span>
              </div>
              <button
                onClick={() => setDarkMode((v) => !v)}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowAddCentre(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Centre
                </button>
              )}
              {isAdmin ? (
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <LogIn className="w-4 h-4" /> Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Centre Selector */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* State filter */}
              <div className="sm:w-40">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => { setSelectedState(e.target.value); setSearch(""); setSelectedCentre(null); }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">All states</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Search + dropdown */}
              <div className="flex-1" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-indigo-500" />
                    Search Centre
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); if (!e.target.value) setSelectedCentre(null); }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="Type to search centres…"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown list */}
                  {dropdownOpen && filteredCentres.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-slideUp">
                      {filteredCentres.map((c) => (
                        <div key={c.id} className="flex items-center hover:bg-indigo-50 transition-colors">
                          <button
                            onMouseDown={(e) => { e.preventDefault(); handleSelectCentre(c); }}
                            className={`flex-1 px-4 py-2.5 text-left text-sm flex items-center justify-between ${selectedCentre?.id === c.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700"}`}
                          >
                            <span>{c.name}</span>
                            <span className="text-xs text-gray-400 ml-2 shrink-0">{c.state}</span>
                          </button>
                          {isAdmin && (
                            <div className="flex items-center gap-1 pr-2">
                              <button onMouseDown={(e) => { e.preventDefault(); setEditingCentre(c); setDropdownOpen(false); }} className="p-1 hover:bg-gray-200 rounded transition-colors" title="Edit centre">
                                <Pencil className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                              <button onMouseDown={(e) => { e.preventDefault(); handleDeleteCentre(c.id); }} className="p-1 hover:bg-red-100 rounded transition-colors" title="Delete centre">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {dropdownOpen && filteredCentres.length === 0 && search && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-400 animate-slideUp">
                      No centres match &ldquo;{search}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {/* Clear */}
              {(selectedCentre || search || selectedState) && (
                <div className="sm:flex sm:items-end">
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors"
                  >
                    <X className="w-4 h-4" /> Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Empty state */}
        {!selectedCentre && (
          <section className="flex flex-col items-center justify-center py-20">
            <div className="float-anim">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                <Building2 className="w-10 h-10 text-indigo-200" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">No Centre Selected</h2>
            <p className="text-gray-400 text-center max-w-sm text-sm">
              Search for a leisure centre above to view its templates and contact details.
            </p>
          </section>
        )}

        {/* Centre details */}
        {selectedCentre && (
          <section>
            {/* Centre header card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate">{selectedCentre.name}</h2>
                  <p className="text-xs text-gray-400">{selectedCentre.state}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <CentreLinks
                    centreId={selectedCentre.id}
                    websiteUrl={centreWebsiteUrl}
                    knowledgeUrl={centreKnowledgeUrl}
                    isAdmin={isAdmin}
                    onSaved={(website, knowledge) => setCentreLinks((p) => ({ ...p, [selectedCentre.id]: { ...p[selectedCentre.id], website_url: website, knowledge_url: knowledge } }))}
                  />
                </div>
              </div>
            </div>

            {/* Tool cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Email */}
              <button
                onClick={() => setOpenModal("email")}
                className="tool-card group bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors shrink-0">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">Email Template</h3>
                    <p className="text-xs text-gray-400">View &amp; copy</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors shrink-0" />
                </div>
              </button>

              {/* SMS — link card */}
              <LinkToolCard
                label="SMS Templates"
                url={centreSmsUrl}
                icon={<MessageSquare className="w-4 h-4 text-emerald-800" />}
                hoverColor="bg-emerald-50 group-hover:bg-emerald-100"
                accentColor="text-gray-300 group-hover:text-emerald-700"
                isAdmin={isAdmin}
                onSaveUrl={(url) => saveCardUrl("sms", url)}
              />

              {/* Venue Transfer — link card */}
              <LinkToolCard
                label="Venue Transfer"
                url={centreTransferUrl}
                icon={<ArrowLeftRight className="w-4 h-4 text-indigo-600" />}
                hoverColor="bg-indigo-50 group-hover:bg-indigo-100"
                accentColor="text-gray-300 group-hover:text-indigo-500"
                isAdmin={isAdmin}
                onSaveUrl={(url) => saveCardUrl("transfer", url)}
              />
            </div>

            {/* VP Assistant — inline */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">VP Assistant</h3>
                  <p className="text-xs text-gray-400">Ask VP anything about {selectedCentre.name}</p>
                </div>
              </div>
              <VPAssistant
                centreId={selectedCentre.id}
                centreName={selectedCentre.name}
                knowledgeBase={centreKnowledge}
                isAdmin={isAdmin}
                onKbSaved={(content: string) => setKnowledgeLibrary((p: Record<string, string>) => ({ ...p, [selectedCentre.id]: content }))}
              />
            </div>

            {/* Opening Hours + General Information */}
            <div className="flex justify-end mb-2 mt-4">
              <button
                onClick={() => setShowInfo((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-xs font-medium transition-colors"
              >
                {showInfo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showInfo ? "Hide Info" : "Show Info"}
              </button>
            </div>
            {showInfo && (
              <InfoSection
                centreId={selectedCentre.id}
                openingHours={centreHours}
                generalInfo={centreInfo}
                isAdmin={isAdmin}
                onHoursSaved={(h) => setOpeningHours((p) => ({ ...p, [selectedCentre.id]: h }))}
                onInfoSaved={(i) => setGeneralInfo((p) => ({ ...p, [selectedCentre.id]: i }))}
              />
            )}
          </section>
        )}

        {/* Email modal */}
        {selectedCentre && (
          <Modal
            open={openModal === "email"}
            onClose={() => setOpenModal(null)}
            title="Email Template"
            subtitle={selectedCentre.name}
            icon={<Mail className="w-5 h-5 text-purple-600" />}
            iconBg="bg-purple-50"
            maxWidth="max-w-5xl"
          >
            <EmailTab
              centreId={selectedCentre.id}
              emailText={centreEmail}
              isAdmin={isAdmin}
              onSaved={(html) => setEmailTemplates((p) => ({ ...p, [selectedCentre.id]: html }))}
            />
          </Modal>
        )}
      </main>

      {showAddCentre && (
        <AddCentreModal
          onSaved={(c) => { setCentres((p) => [...p, c].sort((a, b) => a.name.localeCompare(b.name))); setShowAddCentre(false); }}
          onClose={() => setShowAddCentre(false)}
        />
      )}
      {editingCentre && (
        <AddCentreModal
          existing={editingCentre}
          onSaved={(c) => {
            setCentres((p) => p.map((x) => x.id === c.id ? c : x).sort((a, b) => a.name.localeCompare(b.name)));
            if (selectedCentre?.id === c.id) setSelectedCentre(c);
            setEditingCentre(null);
          }}
          onClose={() => setEditingCentre(null)}
        />
      )}
    </div>
    </div>
  );
}
