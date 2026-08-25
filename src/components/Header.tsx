import React from 'react';
import { 
  Network, 
  Clock, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  UserPlus, 
  FileText, 
  History, 
  Download, 
  Upload, 
  Search,
  KeyRound,
  BookOpen,
  Settings
} from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAddModal: () => void;
  onOpenSecurityModal: () => void;
  onLockSession: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  personCount: number;
  branchFilter: string;
  onBranchFilterChange: (branch: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenAddModal,
  onOpenSecurityModal,
  onLockSession,
  searchQuery,
  onSearchChange,
  personCount,
  branchFilter,
  onBranchFilterChange,
}) => {
  return (
    <header className="bg-[#EFE9DB] border-b border-[#D9D2C2] text-[#2D2926] sticky top-0 z-30 shadow-xs font-sans">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-[#5C4D3F] flex items-center justify-center text-[#F9F6F0] shadow-sm">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-[#5C4D3F] italic font-serif">GénéaCrypt</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-white text-[#8C7B6B] border border-[#D9D2C2]">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> AES-256
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#8C7B6B] font-bold">Archive Généalogique</p>
            </div>
          </div>

          {/* Quick Stats & Global Controls */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7B6B]" />
              <input
                type="text"
                placeholder="Rechercher un ancêtre..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] placeholder-[#8C7B6B] text-xs pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => onBranchFilterChange(e.target.value)}
              className="bg-white border border-[#D9D2C2] text-[#5C4D3F] text-xs font-medium px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
            >
              <option value="all">Toutes les branches ({personCount})</option>
              <option value="paternal">Branche Paternelle</option>
              <option value="maternal">Branche Maternelle</option>
              <option value="inlaw">Belles-Familles / Conjoints</option>
              <option value="secondary">Branches Secondaires</option>
            </select>

            {/* Add Person Action */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-[#5C4D3F] hover:bg-[#4A3E32] text-white text-xs font-sans uppercase tracking-widest px-3.5 py-2 transition shadow-xs active:scale-98 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>

            {/* Security Settings & Export */}
            <button
              onClick={onOpenSecurityModal}
              title="Sauvegarde & Chiffrement AES-256"
              className="inline-flex items-center gap-1 bg-white hover:bg-[#F9F6F0] text-[#5C4D3F] border border-[#D9D2C2] text-xs font-sans uppercase tracking-wider px-2.5 py-2 transition cursor-pointer"
            >
              <KeyRound className="h-4 w-4 text-[#D97706]" />
              <span className="hidden lg:inline">Coffre AES</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => onViewChange('settings')}
              title="Paramètres de l'application"
              className={`inline-flex items-center gap-1 text-xs font-sans uppercase tracking-wider px-2.5 py-2 transition cursor-pointer border ${
                currentView === 'settings'
                  ? 'bg-[#5C4D3F] text-white border-[#5C4D3F]'
                  : 'bg-white hover:bg-[#F9F6F0] text-[#5C4D3F] border-[#D9D2C2]'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </button>

            {/* Lock Session */}
            <button
              onClick={onLockSession}
              title="Verrouiller la session immédiatement"
              className="inline-flex items-center gap-1 bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-sans uppercase tracking-wider px-2.5 py-2 transition cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden lg:inline">Verrouiller</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-[#D9D2C2] text-xs font-sans">
          
          <button
            onClick={() => onViewChange('tree')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 font-medium whitespace-nowrap transition border ${
              currentView === 'tree'
                ? 'bg-[#5C4D3F] text-white border-[#5C4D3F] shadow-xs'
                : 'bg-white text-[#5C4D3F] border-[#D9D2C2] hover:bg-[#F9F6F0]'
            }`}
          >
            <Network className="h-4 w-4" />
            <span>Arbre Visuel</span>
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 font-medium whitespace-nowrap transition border ${
              currentView === 'timeline'
                ? 'bg-[#5C4D3F] text-white border-[#5C4D3F] shadow-xs'
                : 'bg-white text-[#5C4D3F] border-[#D9D2C2] hover:bg-[#F9F6F0]'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Chronologie Familiale</span>
          </button>

          <button
            onClick={() => onViewChange('map')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 font-medium whitespace-nowrap transition border ${
              currentView === 'map'
                ? 'bg-[#5C4D3F] text-white border-[#5C4D3F] shadow-xs'
                : 'bg-white text-[#5C4D3F] border-[#D9D2C2] hover:bg-[#F9F6F0]'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Carte des Lieux</span>
          </button>

          <button
            onClick={() => onViewChange('succession')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 font-medium whitespace-nowrap transition border ${
              currentView === 'succession'
                ? 'bg-[#5C4D3F] text-white border-[#5C4D3F] shadow-xs'
                : 'bg-white text-[#5C4D3F] border-[#D9D2C2] hover:bg-[#F9F6F0]'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Mode Succession & Actes</span>
          </button>

          <button
            onClick={() => onViewChange('history')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 font-medium whitespace-nowrap transition border ${
              currentView === 'history'
                ? 'bg-[#5C4D3F] text-white border-[#5C4D3F] shadow-xs'
                : 'bg-white text-[#5C4D3F] border-[#D9D2C2] hover:bg-[#F9F6F0]'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Historique & Audit</span>
          </button>

          <button
            onClick={() => onViewChange('list')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 font-medium whitespace-nowrap transition border ${
              currentView === 'list'
                ? 'bg-[#5C4D3F] text-white border-[#5C4D3F] shadow-xs'
                : 'bg-white text-[#5C4D3F] border-[#D9D2C2] hover:bg-[#F9F6F0]'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Annuaire ({personCount})</span>
          </button>

          <button
            onClick={() => onViewChange('settings')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 font-medium whitespace-nowrap transition border ${
              currentView === 'settings'
                ? 'bg-[#5C4D3F] text-white border-[#5C4D3F] shadow-xs'
                : 'bg-white text-[#5C4D3F] border-[#D9D2C2] hover:bg-[#F9F6F0]'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </button>
        </div>
      </div>
    </header>
  );
};
