"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Search, X, LogIn, LogOut, ChevronDown, Mail, MessageSquare, ArrowLeftRight, ArrowUpRight, Eye, EyeOff, Sun, Moon, Plus, Pencil, Trash2 } from "lucide-react";
import EmailTab from "@/components/EmailTab";
import SmsTab from "@/components/SmsTab";
import type { SmsOption } from "@/components/SmsTab";
import VenueTab from "@/components/VenueTab";
import Modal from "@/components/Modal";
import InfoSection from "@/components/InfoSection";
import CentreLinks from "@/components/CentreLinks";
import AddCentreModal from "@/components/AddCentreModal";

type Modal = "email" | "sms" | "venue" | "knowledge" | null;
type Centre = { id: string; name: string; state: string; url?: string };

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
  const [openModal, setOpenModal] = useState<Modal>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [emailTemplates, setEmailTemplates] = useState<Record<string, string>>({});
  const [smsTemplates, setSmsTemplates] = useState<Record<string, SmsOption[]>>({});
  const [venueNumbers, setVenueNumbers] = useState<Record<string, string>>({});
  const [generalInfo, setGeneralInfo] = useState<Record<string, string>>({});
  const [openingHours, setOpeningHours] = useState<Record<string, string>>({});
  const [centreLinks, setCentreLinks] = useState<Record<string, { website_url?: string; knowledge_url?: string }>>({});
  const [showInfo, setShowInfo] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch("/api/centres").then((r) => r.json()).then(setCentres);
    fetch("/api/templates").then((r) => r.json()).then(setEmailTemplates);
    fetch("/api/sms-templates").then((r) => r.json()).then(setSmsTemplates);
    fetch("/api/venue-numbers").then((r) => r.json()).then(setVenueNumbers);
    fetch("/api/general-info").then((r) => r.json()).then(setGeneralInfo);
    fetch("/api/opening-hours").then((r) => r.json()).then(setOpeningHours);
    fetch("/api/centre-links").then((r) => r.json()).then(setCentreLinks);
  }, []);

  const states = [...new Set(centres.map((c) => c.state))].sort();

  const handleDeleteCentre = async (id: string) => {
    if (!confirm("Delete this centre? This cannot be undone.")) return;
    await fetch("/api/centres", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setCentres((p) => p.filter((c) => c.id !== id));
    if (selectedCentre?.id === id) handleClear();
  };

  // Close dropdown on outside click
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

  const centreEmail = selectedCentre ? (emailTemplates[selectedCentre.id] ?? "") : "";
  const centreSms = selectedCentre ? (smsTemplates[selectedCentre.id] ?? []) : [];
  const centreVenue = selectedCentre ? (venueNumbers[selectedCentre.id] ?? "") : "";
  const centreInfo = selectedCentre ? (generalInfo[selectedCentre.id] ?? "") : "";
  const centreHours = selectedCentre ? (openingHours[selectedCentre.id] ?? "") : "";
  const centreLinks_data = selectedCentre ? (centreLinks[selectedCentre.id] ?? {}) : {};
  const centreWebsiteUrl = centreLinks_data.website_url ?? (selectedCentre?.url ?? "");
  const centreKnowledgeUrl = centreLinks_data.knowledge_url ?? "";

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
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />

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
          <section className="animate-slideUp">
            {/* Centre header card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 break-words">{selectedCentre.name}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{selectedCentre.state}</p>
                </div>
              </div>
              <CentreLinks
                centreId={selectedCentre.id}
                websiteUrl={centreWebsiteUrl}
                knowledgeUrl={centreKnowledgeUrl}
                isAdmin={isAdmin}
                onSaved={(website, knowledge) => setCentreLinks((p) => ({ ...p, [selectedCentre.id]: { website_url: website, knowledge_url: knowledge } }))}
              />
            </div>

            {/* Tool cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Email */}
              <button
                onClick={() => setOpenModal("email")}
                className="tool-card group bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Email Template</h3>
                <p className="text-xs text-gray-400">View &amp; copy email template</p>
              </button>

              {/* SMS */}
              <button
                onClick={() => setOpenModal("sms")}
                className="tool-card group bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <MessageSquare className="w-6 h-6 text-emerald-800" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-700 transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">SMS Templates</h3>
                <p className="text-xs text-gray-400">View &amp; copy SMS options</p>
              </button>

              {/* Venue Transfer */}
              <button
                onClick={() => setOpenModal("venue")}
                className="tool-card group bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Venue Transfer</h3>
                <p className="text-xs text-gray-400">View &amp; copy transfer number</p>
              </button>
            </div>

            {/* Opening Hours + General Information */}
            <div className="flex justify-end mb-2">
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

        {/* Modals */}
        {selectedCentre && (
          <>
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

            <Modal
              open={openModal === "sms"}
              onClose={() => setOpenModal(null)}
              title="SMS Templates"
              subtitle={selectedCentre.name}
              icon={<MessageSquare className="w-5 h-5 text-emerald-800" />}
              iconBg="bg-emerald-50"
              maxWidth="max-w-5xl"
            >
              <SmsTab
                centreId={selectedCentre.id}
                options={centreSms}
                isAdmin={isAdmin}
                onSaved={(opts) => setSmsTemplates((p) => ({ ...p, [selectedCentre.id]: opts }))}
              />
            </Modal>

            <Modal
              open={openModal === "venue"}
              onClose={() => setOpenModal(null)}
              title="Venue Transfer Number"
              subtitle={selectedCentre.name}
              icon={<ArrowLeftRight className="w-5 h-5 text-indigo-600" />}
              iconBg="bg-indigo-50"
              maxWidth="max-w-md"
            >
              <VenueTab
                centreId={selectedCentre.id}
                number={centreVenue}
                isAdmin={isAdmin}
                onSaved={(num) => setVenueNumbers((p) => ({ ...p, [selectedCentre.id]: num }))}
              />
            </Modal>

          </>
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
