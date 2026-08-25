import React, { useState, useMemo, createContext, useContext } from 'react';
import { Person, BranchType } from '../types';
import { getLifespanText, getSiblings, getUnionTypeIcon, getUnionTypeLabel } from '../utils/genealogy';

const PersonsContext = createContext<Person[]>([]);
export const usePersonsContext = () => useContext(PersonsContext);
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  User, 
  Plus, 
  Info, 
  Users, 
  Heart, 
  Calendar, 
  MapPin, 
  Sparkles 
} from 'lucide-react';

interface TreeViewProps {
  persons: Person[];
  onSelectPerson: (person: Person) => void;
  onAddRelative: (targetPerson: Person, relationType: 'father' | 'mother' | 'spouse' | 'child') => void;
  searchQuery: string;
  branchFilter: string;
}

export const TreeView: React.FC<TreeViewProps> = ({
  persons,
  onSelectPerson,
  onAddRelative,
  searchQuery,
  branchFilter,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [focusedPersonId, setFocusedPersonId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'ancestors' | 'descendants' | 'pedigree'>('pedigree');

  // Filter persons by branch and search
  const filteredPersons = useMemo(() => {
    return persons.filter(p => {
      const matchesSearch = searchQuery === '' || 
        `${p.firstName} ${p.lastName} ${p.maidenName || ''} ${p.birthPlace || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      
      const matchesBranch = branchFilter === 'all' || p.branch === branchFilter;

      return matchesSearch && matchesBranch;
    });
  }, [persons, searchQuery, branchFilter]);

  // Selected root focus person or fallback to oldest/first
  const rootPerson = useMemo(() => {
    if (focusedPersonId) {
      const found = persons.find(p => p.id === focusedPersonId && p.showOnTree !== false);
      if (found) return found;
    }
    // Default to oldest person or first person with children (excluding hidden ones)
    const visiblePersons = persons.filter(p => p.showOnTree !== false);
    const listToUse = visiblePersons.length > 0 ? visiblePersons : persons;
    const sorted = [...listToUse].sort((a, b) => {
      const yearA = a.birthDate ? parseInt(a.birthDate.split('-')[0]) : 9999;
      const yearB = b.birthDate ? parseInt(b.birthDate.split('-')[0]) : 9999;
      return yearA - yearB;
    });
    return sorted[0] || null;
  }, [persons, focusedPersonId]);

  // Direct relatives for central section
  const father = useMemo(() => rootPerson?.fatherId ? persons.find(p => p.id === rootPerson.fatherId && p.showOnTree !== false) : null, [persons, rootPerson]);
  const mother = useMemo(() => rootPerson?.motherId ? persons.find(p => p.id === rootPerson.motherId && p.showOnTree !== false) : null, [persons, rootPerson]);
  const spouses = useMemo(() => {
    if (!rootPerson?.spouseIds) return [];
    const s = persons.filter(p => rootPerson.spouseIds.includes(p.id) && p.showOnTree !== false);
    return [...s].sort((a, b) => {
      const dateA = a.birthDate || '9999-12-31';
      const dateB = b.birthDate || '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    });
  }, [persons, rootPerson]);

  const siblings = useMemo(() => {
    if (!rootPerson) return [];
    const s = getSiblings(rootPerson, persons).filter(p => p.showOnTree !== false);
    return [...s].sort((a, b) => {
      const dateA = a.birthDate || '9999-12-31';
      const dateB = b.birthDate || '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    });
  }, [persons, rootPerson]);

  // Grandparents
  const paternalGrandfather = father?.fatherId ? persons.find(p => p.id === father.fatherId && p.showOnTree !== false) : null;
  const paternalGrandmother = father?.motherId ? persons.find(p => p.id === father.motherId && p.showOnTree !== false) : null;
  const maternalGrandfather = mother?.fatherId ? persons.find(p => p.id === mother.fatherId && p.showOnTree !== false) : null;
  const maternalGrandmother = mother?.motherId ? persons.find(p => p.id === mother.motherId && p.showOnTree !== false) : null;

  // Level +3: Arrière-grands-parents (Parents des grands-parents)
  const ppp = paternalGrandfather?.fatherId ? persons.find(p => p.id === paternalGrandfather.fatherId && p.showOnTree !== false) : null;
  const ppm = paternalGrandfather?.motherId ? persons.find(p => p.id === paternalGrandfather.motherId && p.showOnTree !== false) : null;
  const pmp = paternalGrandmother?.fatherId ? persons.find(p => p.id === paternalGrandmother.fatherId && p.showOnTree !== false) : null;
  const pmm = paternalGrandmother?.motherId ? persons.find(p => p.id === paternalGrandmother.motherId && p.showOnTree !== false) : null;

  const mpp = maternalGrandfather?.fatherId ? persons.find(p => p.id === maternalGrandfather.fatherId && p.showOnTree !== false) : null;
  const mpm = maternalGrandfather?.motherId ? persons.find(p => p.id === maternalGrandfather.motherId && p.showOnTree !== false) : null;
  const mmp = maternalGrandmother?.fatherId ? persons.find(p => p.id === maternalGrandmother.fatherId && p.showOnTree !== false) : null;
  const mmm = maternalGrandmother?.motherId ? persons.find(p => p.id === maternalGrandmother.motherId && p.showOnTree !== false) : null;

  // Level +4: Arrière-arrière-grands-parents (Parents des arrière-grands-parents)
  const pppFather = ppp?.fatherId ? persons.find(p => p.id === ppp.fatherId && p.showOnTree !== false) : null;
  const pppMother = ppp?.motherId ? persons.find(p => p.id === ppp.motherId && p.showOnTree !== false) : null;
  const ppmFather = ppm?.fatherId ? persons.find(p => p.id === ppm.fatherId && p.showOnTree !== false) : null;
  const ppmMother = ppm?.motherId ? persons.find(p => p.id === ppm.motherId && p.showOnTree !== false) : null;

  const pmpFather = pmp?.fatherId ? persons.find(p => p.id === pmp.fatherId && p.showOnTree !== false) : null;
  const pmpMother = pmp?.motherId ? persons.find(p => p.id === pmp.motherId && p.showOnTree !== false) : null;
  const pmmFather = pmm?.fatherId ? persons.find(p => p.id === pmm.fatherId && p.showOnTree !== false) : null;
  const pmmMother = pmm?.motherId ? persons.find(p => p.id === pmm.motherId && p.showOnTree !== false) : null;

  const mppFather = mpp?.fatherId ? persons.find(p => p.id === mpp.fatherId && p.showOnTree !== false) : null;
  const mppMother = mpp?.motherId ? persons.find(p => p.id === mpp.motherId && p.showOnTree !== false) : null;
  const mpmFather = mpm?.fatherId ? persons.find(p => p.id === mpm.fatherId && p.showOnTree !== false) : null;
  const mpmMother = mpm?.motherId ? persons.find(p => p.id === mpm.motherId && p.showOnTree !== false) : null;

  const mmpFather = mmp?.fatherId ? persons.find(p => p.id === mmp.fatherId && p.showOnTree !== false) : null;
  const mmpMother = mmp?.motherId ? persons.find(p => p.id === mmp.motherId && p.showOnTree !== false) : null;
  const mmmFather = mmm?.fatherId ? persons.find(p => p.id === mmm.fatherId && p.showOnTree !== false) : null;
  const mmmMother = mmm?.motherId ? persons.find(p => p.id === mmm.motherId && p.showOnTree !== false) : null;

  // Root's children
  const directChildren = useMemo(() => {
    if (!rootPerson) return [];
    const childMap = new Map<string, Person>();
    if (rootPerson.childrenIds) {
      rootPerson.childrenIds.forEach(id => {
        const found = persons.find(p => p.id === id && p.showOnTree !== false);
        if (found) childMap.set(found.id, found);
      });
    }
    persons.forEach(p => {
      if ((p.fatherId === rootPerson.id || p.motherId === rootPerson.id) && p.showOnTree !== false) {
        childMap.set(p.id, p);
      }
    });
    const sortedList = Array.from(childMap.values());
    return sortedList.sort((a, b) => {
      const dateA = a.birthDate || '9999-12-31';
      const dateB = b.birthDate || '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    });
  }, [persons, rootPerson]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  if (persons.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 my-8 max-w-xl mx-auto text-slate-300">
        <Users className="h-12 w-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Votre arbre généalogique est vide</h3>
        <p className="text-xs text-slate-400 mb-6">Commencez par ajouter le premier membre de votre famille.</p>
      </div>
    );
  }

  return (
    <PersonsContext.Provider value={persons}>
      <div className="relative min-h-[calc(100vh-130px)] bg-[#F9F6F0] text-[#2D2926] flex flex-col overflow-hidden font-sans">
      
      {/* Controls Bar */}
      <div className="bg-[#EFE9DB] border-b border-[#D9D2C2] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-10 shadow-xs">
        
        {/* Left: Root Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-[#8C7B6B] font-bold uppercase tracking-wider text-[11px]">Personne pivot:</span>
          <select
            value={rootPerson?.id || ''}
            onChange={(e) => setFocusedPersonId(e.target.value)}
            className="bg-white border border-[#D9D2C2] text-[#2D2926] font-serif text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
          >
            {persons.filter(p => p.showOnTree !== false).map(p => (
              <option key={p.id} value={p.id}>
                {p.gender === 'M' ? '♂️ ' : p.gender === 'F' ? '♀️ ' : ''}{p.firstName} {p.lastName} ({p.birthDate ? p.birthDate.split('-')[0] : '?'})
              </option>
            ))}
          </select>
        </div>

        {/* Center: View Mode Tabs */}
        <div className="flex items-center space-x-1 bg-white p-1 border border-[#D9D2C2]">
          <button
            onClick={() => setViewMode('pedigree')}
            className={`px-3 py-1 transition font-medium text-xs cursor-pointer ${
              viewMode === 'pedigree' ? 'bg-[#5C4D3F] text-white' : 'text-[#8C7B6B] hover:text-[#2D2926]'
            }`}
          >
            Vue Arbre Connecté
          </button>
          <button
            onClick={() => setViewMode('ancestors')}
            className={`px-3 py-1 transition font-medium text-xs cursor-pointer ${
              viewMode === 'ancestors' ? 'bg-[#5C4D3F] text-white' : 'text-[#8C7B6B] hover:text-[#2D2926]'
            }`}
          >
            Ascendance (Parents)
          </button>
          <button
            onClick={() => setViewMode('descendants')}
            className={`px-3 py-1 transition font-medium text-xs cursor-pointer ${
              viewMode === 'descendants' ? 'bg-[#5C4D3F] text-white' : 'text-[#8C7B6B] hover:text-[#2D2926]'
            }`}
          >
            Descendance (Enfants)
          </button>
        </div>

        {/* Right: Zoom Controls */}
        <div className="flex items-center space-x-1 bg-white p-1 border border-[#D9D2C2]">
          <button
            onClick={handleZoomOut}
            title="Zoom Arrière"
            className="p-1.5 hover:bg-[#F9F6F0] text-[#5C4D3F] transition cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="px-2 text-[#8C7B6B] font-mono text-[11px] min-w-[45px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom Avant"
            className="p-1.5 hover:bg-[#F9F6F0] text-[#5C4D3F] transition cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Réinitialiser Zoom"
            className="p-1.5 hover:bg-[#F9F6F0] text-[#5C4D3F] transition ml-1 cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Pedigree Stage */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 relative bg-[radial-gradient(#d9d2c2_1px,transparent_1px)] [background-size:24px_24px] flex">
        
        <div 
          className="m-auto transition-transform duration-200 ease-out flex flex-col items-center min-w-max p-8 sm:p-16"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          {rootPerson && (
            <div className="flex flex-col items-center">
              
              {/* --- ANCESTORS SECTION (Above Root) --- */}
              {(viewMode === 'pedigree' || viewMode === 'ancestors') && (
                <div className="flex flex-col items-center w-full mb-6">
                  
                  {/* Generation -2 to -4: Ancestors */}
                  <div className="flex items-end space-x-12 sm:space-x-16">
                    {/* Paternal Side */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7B6B] mb-3 bg-[#EFE9DB] px-3 py-0.5 border border-[#D9D2C2] rounded-xs shadow-3xs">Branche Paternelle</span>
                      <div className="flex items-end space-x-8 sm:space-x-12">
                        {/* Paternal Grandfather Subtree */}
                        <div className="flex flex-col items-center">
                          {/* Level +4 (Arrière-arrière-grands-parents for PPP) */}
                          {(ppp || ppm) && (
                            <div className="flex space-x-2 mb-2">
                              {ppp ? (
                                <div className="flex flex-col items-center">
                                  <div className="flex space-x-1">
                                    <CompactPersonCard
                                      person={pppFather}
                                      roleLabel="A-A-Grand-Père"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(ppp, 'father')}
                                      emptyLabel="A-A-G-Père (PPP)"
                                    />
                                    <CompactPersonCard
                                      person={pppMother}
                                      roleLabel="A-A-Grand-Mère"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(ppp, 'mother')}
                                      emptyLabel="A-A-G-Mère (PPM)"
                                    />
                                  </div>
                                  <div className="w-full flex justify-center h-4 relative mt-0.5">
                                    <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                    <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                                  </div>
                                  <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                                </div>
                              ) : (
                                <div className="w-20" />
                              )}

                              {ppm ? (
                                <div className="flex flex-col items-center">
                                  <div className="flex space-x-1">
                                    <CompactPersonCard
                                      person={ppmFather}
                                      roleLabel="A-A-Grand-Père"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(ppm, 'father')}
                                      emptyLabel="A-A-G-Père (PMP)"
                                    />
                                    <CompactPersonCard
                                      person={ppmMother}
                                      roleLabel="A-A-Grand-Mère"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(ppm, 'mother')}
                                      emptyLabel="A-A-G-Mère (PMM)"
                                    />
                                  </div>
                                  <div className="w-full flex justify-center h-4 relative mt-0.5">
                                    <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                    <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                                  </div>
                                  <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                                </div>
                              ) : (
                                <div className="w-20" />
                              )}
                            </div>
                          )}

                          {/* Level +3 (Arrière-grands-parents for Paternal Grandfather) */}
                          {paternalGrandfather && (
                            <div className="flex flex-col items-center">
                              <div className="flex space-x-2">
                                <CompactPersonCard
                                  person={ppp}
                                  roleLabel="A-Grand-Père"
                                  onFocus={(p) => setFocusedPersonId(p.id)}
                                  onSelect={onSelectPerson}
                                  onAddRelative={() => onAddRelative(paternalGrandfather, 'father')}
                                  emptyLabel="A-Grand-Père (PP)"
                                />
                                <CompactPersonCard
                                  person={ppm}
                                  roleLabel="A-Grand-Mère"
                                  onFocus={(p) => setFocusedPersonId(p.id)}
                                  onSelect={onSelectPerson}
                                  onAddRelative={() => onAddRelative(paternalGrandfather, 'mother')}
                                  emptyLabel="A-Grand-Mère (PM)"
                                />
                              </div>
                              <div className="w-full flex justify-center h-4 relative mt-0.5">
                                <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                              </div>
                              <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                            </div>
                          )}

                          {/* Level +2 (Paternal Grandfather) */}
                          <CompactPersonCard
                            person={paternalGrandfather}
                            roleLabel="Grand-Père Pat."
                            onFocus={(p) => setFocusedPersonId(p.id)}
                            onSelect={onSelectPerson}
                            onAddRelative={father ? () => onAddRelative(father, 'father') : undefined}
                            emptyLabel="Grand-Père P."
                          />
                        </div>

                        {/* Paternal Grandmother Subtree */}
                        <div className="flex flex-col items-center">
                          {/* Level +4 (Arrière-arrière-grands-parents for PMP) */}
                          {(pmp || pmm) && (
                            <div className="flex space-x-2 mb-2">
                              {pmp ? (
                                <div className="flex flex-col items-center">
                                  <div className="flex space-x-1">
                                    <CompactPersonCard
                                      person={pmpFather}
                                      roleLabel="A-A-Grand-Père"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(pmp, 'father')}
                                      emptyLabel="A-A-G-Père"
                                    />
                                    <CompactPersonCard
                                      person={pmpMother}
                                      roleLabel="A-A-Grand-Mère"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(pmp, 'mother')}
                                      emptyLabel="A-A-G-Mère"
                                    />
                                  </div>
                                  <div className="w-full flex justify-center h-4 relative mt-0.5">
                                    <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                    <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                                  </div>
                                  <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                                </div>
                              ) : (
                                <div className="w-20" />
                              )}

                              {pmm ? (
                                <div className="flex flex-col items-center">
                                  <div className="flex space-x-1">
                                    <CompactPersonCard
                                      person={pmmFather}
                                      roleLabel="A-A-Grand-Père"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(pmm, 'father')}
                                      emptyLabel="A-A-G-Père"
                                    />
                                    <CompactPersonCard
                                      person={pmmMother}
                                      roleLabel="A-A-Grand-Mère"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(pmm, 'mother')}
                                      emptyLabel="A-A-G-Mère"
                                    />
                                  </div>
                                  <div className="w-full flex justify-center h-4 relative mt-0.5">
                                    <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                    <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                                  </div>
                                  <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                                </div>
                              ) : (
                                <div className="w-20" />
                              )}
                            </div>
                          )}

                          {/* Level +3 (Arrière-grands-parents for Paternal Grandmother) */}
                          {paternalGrandmother && (
                            <div className="flex flex-col items-center">
                              <div className="flex space-x-2">
                                <CompactPersonCard
                                  person={pmp}
                                  roleLabel="A-Grand-Père"
                                  onFocus={(p) => setFocusedPersonId(p.id)}
                                  onSelect={onSelectPerson}
                                  onAddRelative={() => onAddRelative(paternalGrandmother, 'father')}
                                  emptyLabel="A-Grand-Père (MP)"
                                />
                                <CompactPersonCard
                                  person={pmm}
                                  roleLabel="A-Grand-Mère"
                                  onFocus={(p) => setFocusedPersonId(p.id)}
                                  onSelect={onSelectPerson}
                                  onAddRelative={() => onAddRelative(paternalGrandmother, 'mother')}
                                  emptyLabel="A-Grand-Mère (MM)"
                                />
                              </div>
                              <div className="w-full flex justify-center h-4 relative mt-0.5">
                                <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                              </div>
                              <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                            </div>
                          )}

                          {/* Level +2 (Paternal Grandmother) */}
                          <CompactPersonCard
                            person={paternalGrandmother}
                            roleLabel="Grand-Mère Pat."
                            onFocus={(p) => setFocusedPersonId(p.id)}
                            onSelect={onSelectPerson}
                            onAddRelative={father ? () => onAddRelative(father, 'mother') : undefined}
                            emptyLabel="Grand-Mère P."
                          />
                        </div>
                      </div>

                      {/* Lines down to Father */}
                      <div className="w-full flex justify-center h-5 relative mt-2">
                        <div className="w-1/2 border-l-2 border-b-2 border-[#8C7B6B] h-full" />
                        <div className="w-1/2 border-r-2 border-b-2 border-[#8C7B6B] h-full" />
                      </div>
                      <div className="w-0.5 h-4 bg-[#8C7B6B]" />
                    </div>

                    {/* Maternal Side */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7B6B] mb-3 bg-[#EFE9DB] px-3 py-0.5 border border-[#D9D2C2] rounded-xs shadow-3xs">Branche Maternelle</span>
                      <div className="flex items-end space-x-8 sm:space-x-12">
                        {/* Maternal Grandfather Subtree */}
                        <div className="flex flex-col items-center">
                          {/* Level +4 (Arrière-arrière-grands-parents for MPP) */}
                          {(mpp || mpm) && (
                            <div className="flex space-x-2 mb-2">
                              {mpp ? (
                                <div className="flex flex-col items-center">
                                  <div className="flex space-x-1">
                                    <CompactPersonCard
                                      person={mppFather}
                                      roleLabel="A-A-Grand-Père"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(mpp, 'father')}
                                      emptyLabel="A-A-G-Père"
                                    />
                                    <CompactPersonCard
                                      person={mppMother}
                                      roleLabel="A-A-Grand-Mère"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(mpp, 'mother')}
                                      emptyLabel="A-A-G-Mère"
                                    />
                                  </div>
                                  <div className="w-full flex justify-center h-4 relative mt-0.5">
                                    <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                    <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                                  </div>
                                  <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                                </div>
                              ) : (
                                <div className="w-20" />
                              )}

                              {mpm ? (
                                <div className="flex flex-col items-center">
                                  <div className="flex space-x-1">
                                    <CompactPersonCard
                                      person={mpmFather}
                                      roleLabel="A-A-Grand-Père"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(mpm, 'father')}
                                      emptyLabel="A-A-G-Père"
                                    />
                                    <CompactPersonCard
                                      person={mpmMother}
                                      roleLabel="A-A-Grand-Mère"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(mpm, 'mother')}
                                      emptyLabel="A-A-G-Mère"
                                    />
                                  </div>
                                  <div className="w-full flex justify-center h-4 relative mt-0.5">
                                    <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                    <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                                  </div>
                                  <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                                </div>
                              ) : (
                                <div className="w-20" />
                              )}
                            </div>
                          )}

                          {/* Level +3 (Arrière-grands-parents for Maternal Grandfather) */}
                          {maternalGrandfather && (
                            <div className="flex flex-col items-center">
                              <div className="flex space-x-2">
                                <CompactPersonCard
                                  person={mpp}
                                  roleLabel="A-Grand-Père"
                                  onFocus={(p) => setFocusedPersonId(p.id)}
                                  onSelect={onSelectPerson}
                                  onAddRelative={() => onAddRelative(maternalGrandfather, 'father')}
                                  emptyLabel="A-Grand-Père"
                                />
                                <CompactPersonCard
                                  person={mpm}
                                  roleLabel="A-Grand-Mère"
                                  onFocus={(p) => setFocusedPersonId(p.id)}
                                  onSelect={onSelectPerson}
                                  onAddRelative={() => onAddRelative(maternalGrandfather, 'mother')}
                                  emptyLabel="A-Grand-Mère"
                                />
                              </div>
                              <div className="w-full flex justify-center h-4 relative mt-0.5">
                                <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                              </div>
                              <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                            </div>
                          )}

                          {/* Level +2 (Maternal Grandfather) */}
                          <CompactPersonCard
                            person={maternalGrandfather}
                            roleLabel="Grand-Père Mat."
                            onFocus={(p) => setFocusedPersonId(p.id)}
                            onSelect={onSelectPerson}
                            onAddRelative={mother ? () => onAddRelative(mother, 'father') : undefined}
                            emptyLabel="Grand-Père M."
                          />
                        </div>

                        {/* Maternal Grandmother Subtree */}
                        <div className="flex flex-col items-center">
                          {/* Level +4 (Arrière-arrière-grands-parents for MMP) */}
                          {(mmp || mmm) && (
                            <div className="flex space-x-2 mb-2">
                              {mmp ? (
                                <div className="flex flex-col items-center">
                                  <div className="flex space-x-1">
                                    <CompactPersonCard
                                      person={mmpFather}
                                      roleLabel="A-A-Grand-Père"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(mmp, 'father')}
                                      emptyLabel="A-A-G-Père"
                                    />
                                    <CompactPersonCard
                                      person={mmpMother}
                                      roleLabel="A-A-Grand-Mère"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(mmp, 'mother')}
                                      emptyLabel="A-A-G-Mère"
                                    />
                                  </div>
                                  <div className="w-full flex justify-center h-4 relative mt-0.5">
                                    <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                    <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                                  </div>
                                  <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                                </div>
                              ) : (
                                <div className="w-20" />
                              )}

                              {mmm ? (
                                <div className="flex flex-col items-center">
                                  <div className="flex space-x-1">
                                    <CompactPersonCard
                                      person={mmmFather}
                                      roleLabel="A-A-Grand-Père"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(mmm, 'father')}
                                      emptyLabel="A-A-G-Père"
                                    />
                                    <CompactPersonCard
                                      person={mmmMother}
                                      roleLabel="A-A-Grand-Mère"
                                      onFocus={(p) => setFocusedPersonId(p.id)}
                                      onSelect={onSelectPerson}
                                      onAddRelative={() => onAddRelative(mmm, 'mother')}
                                      emptyLabel="A-A-G-Mère"
                                    />
                                  </div>
                                  <div className="w-full flex justify-center h-4 relative mt-0.5">
                                    <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                    <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                                  </div>
                                  <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                                </div>
                              ) : (
                                <div className="w-20" />
                              )}
                            </div>
                          )}

                          {/* Level +3 (Arrière-grands-parents for Maternal Grandmother) */}
                          {maternalGrandmother && (
                            <div className="flex flex-col items-center">
                              <div className="flex space-x-2">
                                <CompactPersonCard
                                  person={mmp}
                                  roleLabel="A-Grand-Père"
                                  onFocus={(p) => setFocusedPersonId(p.id)}
                                  onSelect={onSelectPerson}
                                  onAddRelative={() => onAddRelative(maternalGrandmother, 'father')}
                                  emptyLabel="A-Grand-Père"
                                />
                                <CompactPersonCard
                                  person={mmm}
                                  roleLabel="A-Grand-Mère"
                                  onFocus={(p) => setFocusedPersonId(p.id)}
                                  onSelect={onSelectPerson}
                                  onAddRelative={() => onAddRelative(maternalGrandmother, 'mother')}
                                  emptyLabel="A-Grand-Mère"
                                />
                              </div>
                              <div className="w-full flex justify-center h-4 relative mt-0.5">
                                <div className="w-1/2 border-l border-b border-[#8C7B6B] h-full" />
                                <div className="w-1/2 border-r border-b border-[#8C7B6B] h-full" />
                              </div>
                              <div className="w-0.5 h-1.5 bg-[#8C7B6B]" />
                            </div>
                          )}

                          {/* Level +2 (Maternal Grandmother) */}
                          <CompactPersonCard
                            person={maternalGrandmother}
                            roleLabel="Grand-Mère Mat."
                            onFocus={(p) => setFocusedPersonId(p.id)}
                            onSelect={onSelectPerson}
                            onAddRelative={mother ? () => onAddRelative(mother, 'mother') : undefined}
                            emptyLabel="Grand-Mère M."
                          />
                        </div>
                      </div>

                      {/* Lines down to Mother */}
                      <div className="w-full flex justify-center h-5 relative mt-2">
                        <div className="w-1/2 border-l-2 border-b-2 border-[#8C7B6B] h-full" />
                        <div className="w-1/2 border-r-2 border-b-2 border-[#8C7B6B] h-full" />
                      </div>
                      <div className="w-0.5 h-4 bg-[#8C7B6B]" />
                    </div>
                  </div>

                  {/* Generation -1: Parents */}
                  <div className="flex items-center space-x-8 sm:space-x-12 mt-1">
                    <CompactPersonCard
                      person={father}
                      roleLabel="Père"
                      onFocus={(p) => setFocusedPersonId(p.id)}
                      onSelect={onSelectPerson}
                      onAddRelative={() => onAddRelative(rootPerson, 'father')}
                      emptyLabel="Ajouter Père"
                    />

                    <div className="flex flex-col items-center text-[#8C7B6B]">
                      <Heart className="h-4 w-4 text-[#D97706] fill-[#D97706]/20" />
                      <div className="h-4 w-0.5 bg-[#8C7B6B] my-0.5" />
                    </div>

                    <CompactPersonCard
                      person={mother}
                      roleLabel="Mère"
                      onFocus={(p) => setFocusedPersonId(p.id)}
                      onSelect={onSelectPerson}
                      onAddRelative={() => onAddRelative(rootPerson, 'mother')}
                      emptyLabel="Ajouter Mère"
                    />
                  </div>

                  {/* Lines down to Central Person */}
                  <div className="w-36 flex justify-center h-5 relative mt-1">
                    <div className="w-1/2 border-l-2 border-b-2 border-[#8C7B6B] h-full" />
                    <div className="w-1/2 border-r-2 border-b-2 border-[#8C7B6B] h-full" />
                  </div>
                  <div className="w-0.5 h-5 bg-[#8C7B6B]" />

                </div>
              )}

              {/* --- CENTRAL PERSON SECTION (Generation 0) --- */}
              <div className="flex flex-col items-center relative my-2">
                
                <span className="text-[10px] uppercase font-bold tracking-widest text-white bg-[#5C4D3F] px-3 py-1 border border-[#4A3E32] flex items-center gap-1.5 mb-2 shadow-2xs">
                  <Sparkles className="h-3 w-3 text-[#D97706]" /> Personne Centrale
                </span>

                <div className="flex items-center space-x-6">
                  
                  {/* Siblings */}
                  {siblings.length > 0 && (
                    <div className="flex flex-col space-y-2 pr-4 border-r border-[#D9D2C2]">
                      <span className="text-[9px] text-[#8C7B6B] font-bold uppercase tracking-wider">Frères & Sœurs</span>
                      {siblings.map(sib => (
                        <CompactPersonCard
                          key={sib.id}
                          person={sib}
                          roleLabel="Frère/Sœur"
                          onFocus={(p) => setFocusedPersonId(p.id)}
                          onSelect={onSelectPerson}
                        />
                      ))}
                    </div>
                  )}

                  {/* Central Main Root Card & Spouses */}
                  <div className="flex items-center space-x-3">
                    
                    {/* Central Main Root Card */}
                    <div className="flex flex-col items-center">
                      <div className="w-48 bg-[#5C4D3F] text-white border-2 border-[#D97706] p-3 shadow-xl rounded-md relative flex flex-col justify-between">
                        <div className="flex items-start space-x-2.5 mb-2">
                          {rootPerson.photoUrl ? (
                            <img 
                              src={rootPerson.photoUrl} 
                              alt={rootPerson.firstName}
                              className="h-10 w-10 rounded-full object-cover border border-[#EFE9DB] shrink-0" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#EFE9DB] border border-[#D9D2C2] flex items-center justify-center text-[#5C4D3F] shrink-0 font-serif font-bold text-sm">
                              {rootPerson.firstName[0]}
                            </div>
                          )}

                          <div className="overflow-hidden flex-1 leading-tight">
                            <span className="inline-flex items-center gap-1 text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#4A3E32] text-[#EFE9DB] border border-[#D9D2C2]/40 mb-1">
                              <span>{rootPerson.gender === 'M' ? '♂️' : rootPerson.gender === 'F' ? '♀️' : ''}</span>
                              <span>{rootPerson.branch === 'paternal' ? 'Paternelle' : rootPerson.branch === 'maternal' ? 'Maternelle' : 'Famille'}</span>
                            </span>
                            <h3 className="text-sm font-serif font-bold text-white truncate flex items-center gap-1">
                              <span>{rootPerson.firstName}</span>
                            </h3>
                            <p className="text-[10px] font-bold text-[#EFE9DB] uppercase tracking-wider truncate">
                              {rootPerson.lastName}
                            </p>
                          </div>
                        </div>

                        <div className="text-[10px] text-[#EFE9DB] border-t border-[#4A3E32] pt-1.5 my-1 font-mono flex items-center justify-between">
                          <span>{getLifespanText(rootPerson)}</span>
                          <span>{directChildren.length} enfant(s)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 mt-1">
                          <button
                            onClick={() => onSelectPerson(rootPerson)}
                            className="bg-[#EFE9DB] hover:bg-white text-[#5C4D3F] font-bold text-[10px] uppercase py-1 px-1 transition flex items-center justify-center gap-1 rounded cursor-pointer"
                          >
                            <Info className="h-3 w-3" />
                            <span>Fiche</span>
                          </button>
                          <button
                            onClick={() => onAddRelative(rootPerson, 'spouse')}
                            className="bg-[#4A3E32] hover:bg-[#3D3329] text-white text-[10px] uppercase py-1 px-1 transition border border-[#D9D2C2]/30 flex items-center justify-center gap-0.5 rounded cursor-pointer"
                          >
                            <Plus className="h-3 w-3 text-[#D97706]" />
                            <span>Conjoint</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Spouses rendered next to Root */}
                    {spouses.length > 0 && (
                      <div className="flex items-center space-x-2">
                        {spouses.map(sp => (
                          <div key={sp.id} className="flex items-center space-x-2">
                            <div className="flex flex-col items-center text-[#D97706] shrink-0">
                              <Heart className="h-4 w-4 fill-[#D97706]/20" />
                              <span className="text-[8px] uppercase font-bold tracking-wider text-[#8C7B6B]">Union</span>
                            </div>
                            <CompactPersonCard
                              person={sp}
                              roleLabel={sp.gender === 'F' ? 'Conjointe' : 'Conjoint'}
                              onFocus={(p) => setFocusedPersonId(p.id)}
                              onSelect={onSelectPerson}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>
              </div>

              {/* --- DESCENDANTS SECTION (Generations +1, +2, +3, +4...) --- */}
              {(viewMode === 'pedigree' || viewMode === 'descendants') && (
                <div className="flex flex-col items-center w-full mt-2">
                  
                  {/* Line down from Central Person */}
                  <div className="w-0.5 h-6 bg-[#8C7B6B]" />

                  <div className="flex justify-between items-center w-full max-w-md px-4 my-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#8C7B6B] bg-[#EFE9DB] px-2.5 py-0.5 border border-[#D9D2C2]">
                      Descendance Directe ({directChildren.length} Enfants)
                    </span>
                    <button
                      onClick={() => onAddRelative(rootPerson, 'child')}
                      className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white text-[10px] px-2.5 py-1 font-sans uppercase tracking-wider flex items-center gap-1 transition cursor-pointer rounded"
                    >
                      <Plus className="h-3 w-3 text-[#D97706]" />
                      <span>Ajouter Enfant</span>
                    </button>
                  </div>

                  {directChildren.length === 0 ? (
                    <div className="text-center py-3 px-6 border border-dashed border-[#D9D2C2] bg-white text-[#8C7B6B] text-xs font-serif italic mt-2">
                      Aucun enfant enregistré pour {rootPerson.firstName}.
                    </div>
                  ) : (
                    /* Horizontal Connector Line & Children Nodes */
                    <div className="flex flex-row items-start justify-center w-full mt-1">
                      {directChildren.map((child, index) => {
                        const isFirst = index === 0;
                        const isLast = index === directChildren.length - 1;
                        const isOnly = directChildren.length === 1;

                        return (
                          <div key={child.id} className="flex flex-col items-center px-3 sm:px-4 relative">
                            
                            {/* Horizontal connector bar */}
                            {!isOnly && (
                              <div className="absolute top-0 left-0 right-0 flex h-0.5">
                                <div className={`w-1/2 ${!isFirst ? 'bg-[#8C7B6B]' : ''}`} />
                                <div className={`w-1/2 ${!isLast ? 'bg-[#8C7B6B]' : ''}`} />
                              </div>
                            )}

                            {/* Line down to child */}
                            <div className="w-0.5 h-5 bg-[#8C7B6B]" />

                            {/* Recursive Child Subtree Node */}
                            <DescendantTreeNode
                              person={child}
                              allPersons={persons}
                              focusedPersonId={focusedPersonId}
                              onFocus={(p) => setFocusedPersonId(p.id)}
                              onSelect={onSelectPerson}
                              onAddChild={(p) => onAddRelative(p, 'child')}
                              visitedIds={new Set([rootPerson.id])}
                              roleLabel="Enfant"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  </PersonsContext.Provider>
  );
};

/* --- COMPACT PERSON CARD COMPONENT --- */
const CompactPersonCard: React.FC<{
  person: Person | null | undefined;
  roleLabel?: string;
  isRoot?: boolean;
  onFocus?: (p: Person) => void;
  onSelect?: (p: Person) => void;
  onAddRelative?: () => void;
  emptyLabel?: string;
}> = ({ person, roleLabel, isRoot, onFocus, onSelect, onAddRelative, emptyLabel }) => {
  const allPersons = usePersonsContext();
  const [showCollat, setShowCollat] = useState(false);

  const collatList = useMemo(() => {
    if (!allPersons || !person) return [];
    const sibs = getSiblings(person, allPersons).filter(p => p.showOnTree !== false);
    const sortedSibs = [...sibs].sort((a, b) => {
      const dateA = a.birthDate || '9999-12-31';
      const dateB = b.birthDate || '9999-12-31';
      return dateA.localeCompare(dateB);
    });

    return sortedSibs.map(sib => {
      const childMap = new Map<string, Person>();
      if (sib.childrenIds) {
        sib.childrenIds.forEach(id => {
          const found = allPersons.find(p => p.id === id && p.showOnTree !== false);
          if (found) childMap.set(found.id, found);
        });
      }
      allPersons.forEach(p => {
        if ((p.fatherId === sib.id || p.motherId === sib.id) && p.showOnTree !== false) {
          childMap.set(p.id, p);
        }
      });
      const childList = Array.from(childMap.values()).sort((a, b) => {
        const dateA = a.birthDate || '9999-12-31';
        const dateB = b.birthDate || '9999-12-31';
        return dateA.localeCompare(dateB);
      });
      return { sibling: sib, children: childList };
    });
  }, [person, allPersons]);

  if (!person) {
    return (
      <div className="w-36 sm:w-40 h-[72px] bg-white/70 border border-dashed border-[#D9D2C2] rounded-md p-2 flex flex-col items-center justify-center text-center text-[#8C7B6B] text-[10px] shrink-0">
        {roleLabel && <span className="font-bold uppercase tracking-wider block mb-0.5 text-[9px]">{roleLabel}</span>}
        <span className="italic text-[9px] text-[#A39282]">{emptyLabel || 'Non renseigné'}</span>
        {onAddRelative && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddRelative(); }}
            className="mt-1 bg-[#5C4D3F] hover:bg-[#4A3E32] text-white text-[9px] px-2 py-0.5 rounded font-sans uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
          >
            <Plus className="h-2.5 w-2.5" />
            <span>Ajouter</span>
          </button>
        )}
      </div>
    );
  }

  const genderIcon = person.gender === 'M' ? '♂️' : person.gender === 'F' ? '♀️' : '';
  const lifespan = getLifespanText(person);

  return (
    <div 
      onClick={() => onFocus && onFocus(person)}
      className={`w-36 sm:w-40 min-h-[72px] rounded-md p-2 text-left cursor-pointer transition transform hover:-translate-y-0.5 shadow-2xs group relative shrink-0 flex flex-col justify-between ${
        isRoot 
          ? 'bg-[#5C4D3F] text-white border-2 border-[#D97706] shadow-md' 
          : 'bg-white hover:bg-[#F9F6F0] border border-[#D9D2C2] hover:border-[#8C7B6B] text-[#2D2926]'
      }`}
    >
      {/* Top row: Gender & Role Badge & Info button */}
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="text-[11px] leading-none shrink-0">{genderIcon}</span>
          {roleLabel && (
            <span className={`text-[8px] uppercase font-bold tracking-wider px-1 py-0.2 rounded truncate ${
              isRoot ? 'bg-[#4A3E32] text-[#EFE9DB]' : 'bg-[#EFE9DB] text-[#5C4D3F] border border-[#D9D2C2]'
            }`}>
              {roleLabel}
            </span>
          )}
        </div>

        {onSelect && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSelect(person); }}
            title="Voir la fiche complète"
            className={`p-0.5 rounded transition cursor-pointer shrink-0 ${
              isRoot ? 'text-[#EFE9DB] hover:text-white hover:bg-[#4A3E32]' : 'text-[#8C7B6B] hover:text-[#2D2926] hover:bg-[#EFE9DB]'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Middle row: Avatar + Name */}
      <div className="flex items-center space-x-1.5 my-0.5 overflow-hidden">
        {person.photoUrl ? (
          <img src={person.photoUrl} alt={person.firstName} className="h-7 w-7 rounded-full object-cover border border-[#D9D2C2] shrink-0" />
        ) : (
          <div className={`h-7 w-7 rounded-full border flex items-center justify-center font-serif font-bold text-xs shrink-0 ${
            isRoot ? 'bg-[#EFE9DB] text-[#5C4D3F] border-[#D9D2C2]' : 'bg-[#EFE9DB] text-[#5C4D3F] border-[#D9D2C2]'
          }`}>
            {person.firstName[0]}
          </div>
        )}

        <div className="overflow-hidden leading-tight flex-1">
          <p className={`font-bold font-serif text-xs truncate ${isRoot ? 'text-white' : 'text-[#2D2926]'}`}>
            {person.firstName}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-wider truncate ${isRoot ? 'text-[#EFE9DB]' : 'text-[#5C4D3F]'}`}>
            {person.lastName}
          </p>
        </div>
      </div>

      {/* Bottom row: Lifespan & Kids count & Collaterals button */}
      <div className="mt-1 pt-1 border-t border-[#D9D2C2]/40 flex items-center justify-between text-[9px] font-mono">
        <span className={isRoot ? 'text-[#EFE9DB]/90' : 'text-[#8C7B6B]'}>
          {lifespan}
        </span>
        <div className="flex items-center gap-1">
          {person.childrenIds && person.childrenIds.length > 0 && (
            <span className={isRoot ? 'text-[#D97706] font-bold' : 'text-[#8C7B6B]'} title="Enfants directs">
              {person.childrenIds.length} 👶
            </span>
          )}
          {collatList.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowCollat(!showCollat); }}
              className={`flex items-center gap-0.5 px-1 py-0.2 border rounded cursor-pointer text-[8px] font-sans font-bold transition-all ${
                showCollat 
                  ? 'bg-[#D97706] border-[#D97706] text-white' 
                  : isRoot
                    ? 'bg-[#4A3E32] border-[#EFE9DB]/30 text-[#EFE9DB] hover:bg-[#3D3329] hover:text-white'
                    : 'bg-[#FDFCF7] border-[#D9D2C2] text-[#5C4D3F] hover:bg-[#F4EFE6]'
              }`}
              title="Afficher les frères, sœurs et neveux/nièces"
            >
              👥 {collatList.length}
            </button>
          )}
        </div>
      </div>

      {/* Collateral Dropdown */}
      {showCollat && collatList.length > 0 && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 right-0 top-full mt-1.5 bg-[#FAF8F5] border-2 border-[#8C7B6B] text-[#2D2926] rounded-md shadow-lg z-50 p-2 max-h-48 overflow-y-auto space-y-2 text-[10px] animate-in fade-in slide-in-from-top-1 duration-100"
        >
          <div className="flex items-center justify-between border-b border-[#D9D2C2] pb-1.5 mb-1">
            <span className="font-bold text-[#5C4D3F] uppercase tracking-wider text-[8px] flex items-center gap-1">
              <Users className="h-3 w-3 text-[#D97706]" /> Collatéraux ({collatList.length})
            </span>
            <button 
              onClick={() => setShowCollat(false)}
              className="text-stone-400 hover:text-stone-700 font-bold px-1 rounded hover:bg-stone-200"
            >
              ×
            </button>
          </div>
          
          {collatList.map(({ sibling, children }) => (
            <div key={sibling.id} className="border-b border-[#EFE9DB] last:border-b-0 pb-1.5 last:pb-0">
              {/* Sibling row */}
              <div 
                onClick={() => { onFocus?.(sibling); setShowCollat(false); }}
                className="flex items-center justify-between hover:bg-[#F4EFE6] p-1 rounded cursor-pointer font-bold text-[#2D2926]"
              >
                <span className="truncate max-w-[105px] hover:underline">
                  {sibling.firstName} {sibling.lastName}
                </span>
                {onSelect && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSelect(sibling); setShowCollat(false); }}
                    title="Voir la fiche complète"
                    className="text-[#8C7B6B] hover:text-[#D97706] p-0.5"
                  >
                    <Info className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>

              {/* Sibling's children (nieces/nephews) */}
              {children.length > 0 && (
                <div className="pl-3 mt-1 space-y-1 border-l border-dashed border-[#D9D2C2]">
                  <p className="text-[7.5px] uppercase font-semibold text-[#8C7B6B] tracking-wide mb-0.5">Enfants :</p>
                  {children.map(child => (
                    <div 
                      key={child.id}
                      onClick={() => { onFocus?.(child); setShowCollat(false); }}
                      className="flex items-center justify-between hover:bg-[#F4EFE6] p-0.5 rounded cursor-pointer text-[9.5px] text-[#5C4D3F] italic"
                    >
                      <span className="truncate max-w-[95px] hover:underline">
                        ↳ {child.firstName} {child.lastName}
                      </span>
                      {onSelect && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSelect(child); setShowCollat(false); }}
                          title="Voir la fiche complète"
                          className="text-[#8C7B6B] hover:text-[#D97706] p-0.5"
                        >
                          <Info className="h-2 w-2" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* --- RECURSIVE DESCENDANT TREE NODE COMPONENT --- */
const DescendantTreeNode: React.FC<{
  person: Person;
  allPersons: Person[];
  focusedPersonId: string | null;
  onFocus: (p: Person) => void;
  onSelect: (p: Person) => void;
  onAddChild?: (p: Person) => void;
  visitedIds: Set<string>;
  roleLabel?: string;
}> = ({ person, allPersons, focusedPersonId, onFocus, onSelect, onAddChild, visitedIds, roleLabel }) => {
  // Spouses of this person
  const spouses = useMemo(() => {
    if (!person.spouseIds || person.spouseIds.length === 0) return [];
    const list = person.spouseIds
      .map(id => allPersons.find(p => p.id === id))
      .filter((p): p is Person => Boolean(p) && !visitedIds.has(p.id) && p.showOnTree !== false);
    return [...list].sort((a, b) => {
      const dateA = a.birthDate || '9999-12-31';
      const dateB = b.birthDate || '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    });
  }, [person, allPersons, visitedIds]);

  const currentVisited = useMemo(() => {
    const set = new Set(visitedIds);
    set.add(person.id);
    spouses.forEach(s => set.add(s.id));
    return set;
  }, [visitedIds, person.id, spouses]);

  // Find all children for this person and their spouses
  const children = useMemo(() => {
    const childMap = new Map<string, Person>();
    const parentIds = new Set([person.id, ...spouses.map(s => s.id)]);

    if (person.childrenIds) {
      person.childrenIds.forEach(id => {
        const found = allPersons.find(p => p.id === id && p.showOnTree !== false);
        if (found && !visitedIds.has(found.id)) childMap.set(found.id, found);
      });
    }
    spouses.forEach(sp => {
      if (sp.childrenIds) {
        sp.childrenIds.forEach(id => {
          const found = allPersons.find(p => p.id === id && p.showOnTree !== false);
          if (found && !visitedIds.has(found.id)) childMap.set(found.id, found);
        });
      }
    });

    allPersons.forEach(p => {
      if ((parentIds.has(p.fatherId || '') || parentIds.has(p.motherId || '')) && !visitedIds.has(p.id) && p.showOnTree !== false) {
        childMap.set(p.id, p);
      }
    });

    const list = Array.from(childMap.values());
    return [...list].sort((a, b) => {
      const dateA = a.birthDate || '9999-12-31';
      const dateB = b.birthDate || '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
    });
  }, [person, spouses, allPersons, visitedIds]);

  const isFocused = person.id === focusedPersonId;

  return (
    <div className="flex flex-col items-center">
      {/* Person & Spouses Couple Block */}
      <div className="flex items-center space-x-2">
        <CompactPersonCard
          person={person}
          isRoot={isFocused}
          roleLabel={roleLabel}
          onFocus={onFocus}
          onSelect={onSelect}
        />

        {spouses.map(spouse => {
          const spouseRole = spouse.gender === 'F' ? 'Conjointe' : spouse.gender === 'M' ? 'Conjoint' : 'Conjoint(e)';
          return (
            <div key={spouse.id} className="flex items-center space-x-2">
              <div className="flex flex-col items-center text-[#D97706] shrink-0">
                <Heart className="h-4 w-4 fill-[#D97706]/20" />
              </div>
              <CompactPersonCard
                person={spouse}
                roleLabel={spouseRole}
                onFocus={onFocus}
                onSelect={onSelect}
              />
            </div>
          );
        })}
      </div>

      {/* Children Connector Lines & Recursive Children */}
      {children.length > 0 && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical drop line down from parent/couple */}
          <div className="w-0.5 h-5 bg-[#8C7B6B]" />

          {/* Children container with horizontal connector line */}
          <div className="flex flex-row items-start justify-center w-full">
            {children.map((child, index) => {
              const isFirst = index === 0;
              const isLast = index === children.length - 1;
              const isOnly = children.length === 1;

              return (
                <div key={child.id} className="flex flex-col items-center px-2 sm:px-3 relative">
                  
                  {/* Horizontal connector bar */}
                  {!isOnly && (
                    <div className="absolute top-0 left-0 right-0 flex h-0.5">
                      <div className={`w-1/2 ${!isFirst ? 'bg-[#8C7B6B]' : ''}`} />
                      <div className={`w-1/2 ${!isLast ? 'bg-[#8C7B6B]' : ''}`} />
                    </div>
                  )}

                  {/* Vertical drop line to child */}
                  <div className="w-0.5 h-5 bg-[#8C7B6B]" />

                  {/* Recursive Child Node */}
                  <DescendantTreeNode
                    person={child}
                    allPersons={allPersons}
                    focusedPersonId={focusedPersonId}
                    onFocus={onFocus}
                    onSelect={onSelect}
                    onAddChild={onAddChild}
                    visitedIds={currentVisited}
                    roleLabel="Enfant"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
