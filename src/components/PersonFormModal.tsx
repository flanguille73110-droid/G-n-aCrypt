import React, { useState, useEffect, useRef } from 'react';
import { Person, Gender, BranchType, UnionDetails, UnionType } from '../types';
import { lookupCoordinates, getCitySuggestions, CityRef, getUnionTypeIcon, getUnionTypeLabel } from '../utils/genealogy';
import { LocationPickerModal } from './LocationPickerModal';
import { X, Save, User, MapPin, Calendar, Heart, Users, Upload, Sparkles, Navigation, Trash2, Plus } from 'lucide-react';

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Person) => void;
  personToEdit?: Person | null;
  allPersons: Person[];
  presetRelation?: {
    targetPerson: Person;
    relationType: 'father' | 'mother' | 'spouse' | 'child';
  } | null;
}

export const PersonFormModal: React.FC<PersonFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  personToEdit,
  allPersons,
  presetRelation,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [maidenName, setMaidenName] = useState('');
  const [gender, setGender] = useState<Gender>('M');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [profession, setProfession] = useState('');
  const [branch, setBranch] = useState<BranchType>('paternal');
  const [showOnTree, setShowOnTree] = useState(true);

  // Custom GPS coordinates state
  const [customBirthCoords, setCustomBirthCoords] = useState<[number, number] | undefined>(undefined);
  const [customDeathCoords, setCustomDeathCoords] = useState<[number, number] | undefined>(undefined);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [locationPickerTarget, setLocationPickerTarget] = useState<'birth' | 'death' | { type: 'union'; index: number }>('birth');

  const handleOpenLocationPicker = (target: 'birth' | 'death' | { type: 'union'; index: number }) => {
    setLocationPickerTarget(target);
    setIsLocationPickerOpen(true);
  };

  const handleSelectLocationFromMap = (placeName: string, coords: [number, number]) => {
    if (locationPickerTarget === 'birth') {
      setBirthPlace(placeName);
      setCustomBirthCoords(coords);
    } else if (locationPickerTarget === 'death') {
      setDeathPlace(placeName);
      setCustomDeathCoords(coords);
    } else if (typeof locationPickerTarget === 'object' && locationPickerTarget.type === 'union') {
      const idx = locationPickerTarget.index;
      setUnions(prev => prev.map((u, i) => i === idx ? { ...u, place: placeName, coords } : u));
    }
  };

  // Autocomplete state for places
  const [birthSuggestions, setBirthSuggestions] = useState<CityRef[]>([]);
  const [showBirthDropdown, setShowBirthDropdown] = useState(false);
  const [deathSuggestions, setDeathSuggestions] = useState<CityRef[]>([]);
  const [showDeathDropdown, setShowDeathDropdown] = useState(false);

  // Union places autocomplete index
  const [activeUnionSuggestionIdx, setActiveUnionSuggestionIdx] = useState<number | null>(null);
  const [unionSuggestions, setUnionSuggestions] = useState<CityRef[]>([]);

  const handleBirthPlaceChange = (val: string) => {
    setBirthPlace(val);
    const suggestions = getCitySuggestions(val);
    setBirthSuggestions(suggestions);
    setShowBirthDropdown(suggestions.length > 0);
  };

  const selectBirthCity = (city: CityRef) => {
    setBirthPlace(city.label);
    setCustomBirthCoords(city.coords);
    setShowBirthDropdown(false);
  };

  const handleDeathPlaceChange = (val: string) => {
    setDeathPlace(val);
    const suggestions = getCitySuggestions(val);
    setDeathSuggestions(suggestions);
    setShowDeathDropdown(suggestions.length > 0);
  };

  const selectDeathCity = (city: CityRef) => {
    setDeathPlace(city.label);
    setCustomDeathCoords(city.coords);
    setShowDeathDropdown(false);
  };

  // Direct Relations State
  const [fatherId, setFatherId] = useState<string>('');
  const [motherId, setMotherId] = useState<string>('');
  const [unions, setUnions] = useState<UnionDetails[]>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);

  // Succession notes
  const [inheritanceNotes, setInheritanceNotes] = useState('');
  const [willsLocation, setWillsLocation] = useState('');

  useEffect(() => {
    if (personToEdit) {
      setFirstName(personToEdit.firstName || '');
      setLastName(personToEdit.lastName || '');
      setMaidenName(personToEdit.maidenName || '');
      setGender(personToEdit.gender || 'M');
      setBirthDate(personToEdit.birthDate || '');
      setBirthPlace(personToEdit.birthPlace || '');
      setCustomBirthCoords(personToEdit.birthCoords);
      setDeathDate(personToEdit.deathDate || '');
      setDeathPlace(personToEdit.deathPlace || '');
      setCustomDeathCoords(personToEdit.deathCoords);
      setIsDeceased(personToEdit.isDeceased || false);
      setPhotoUrl(personToEdit.photoUrl || '');
      setNotes(personToEdit.notes || '');
      setProfession(personToEdit.profession || '');
      setBranch(personToEdit.branch || 'paternal');
      setShowOnTree(personToEdit.showOnTree !== false);
      setFatherId(personToEdit.fatherId || '');
      setMotherId(personToEdit.motherId || '');
      
      // Load unions or create default unions from spouseIds
      if (personToEdit.unions && personToEdit.unions.length > 0) {
        setUnions(personToEdit.unions);
      } else if (personToEdit.spouseIds && personToEdit.spouseIds.length > 0) {
        setUnions(personToEdit.spouseIds.map(spouseId => ({
          id: `u-${personToEdit.id}-${spouseId}`,
          partnerId: spouseId,
          type: 'mariage'
        })));
      } else {
        setUnions([]);
      }

      setSelectedChildrenIds(personToEdit.childrenIds || []);
      setInheritanceNotes(personToEdit.successionInfo?.inheritanceNotes || '');
      setWillsLocation(personToEdit.successionInfo?.willsLocation || '');
    } else {
      // Reset defaults
      setFirstName('');
      setLastName(presetRelation?.targetPerson.lastName || '');
      setMaidenName('');
      setGender('M');
      setBirthDate('');
      setBirthPlace('');
      setCustomBirthCoords(undefined);
      setDeathDate('');
      setDeathPlace('');
      setCustomDeathCoords(undefined);
      setIsDeceased(false);
      setPhotoUrl('');
      setNotes('');
      setProfession('');
      setBranch('paternal');
      setShowOnTree(true);
      setFatherId('');
      setMotherId('');
      setUnions([]);
      setSelectedChildrenIds([]);
      setInheritanceNotes('');
      setWillsLocation('');

      // Apply preset relation if adding from tree button
      if (presetRelation) {
        const target = presetRelation.targetPerson;
        if (presetRelation.relationType === 'father') {
          setGender('M');
          setSelectedChildrenIds([target.id]);
        } else if (presetRelation.relationType === 'mother') {
          setGender('F');
          setSelectedChildrenIds([target.id]);
        } else if (presetRelation.relationType === 'spouse') {
          setUnions([{
            id: `u-preset-${target.id}`,
            partnerId: target.id,
            type: 'mariage'
          }]);
        } else if (presetRelation.relationType === 'child') {
          if (target.gender === 'M') setFatherId(target.id);
          else if (target.gender === 'F') setMotherId(target.id);
        }
      }
    }
  }, [personToEdit, presetRelation, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddUnion = (partnerId: string) => {
    if (!partnerId) return;
    if (unions.some(u => u.partnerId === partnerId)) return;
    setUnions(prev => [...prev, {
      id: `u-${Date.now()}-${partnerId}`,
      partnerId,
      type: 'mariage'
    }]);
  };

  const handleRemoveUnion = (partnerId: string) => {
    setUnions(prev => prev.filter(u => u.partnerId !== partnerId));
  };

  const handleUpdateUnionField = (index: number, field: keyof UnionDetails, value: any) => {
    setUnions(prev => prev.map((u, i) => i === index ? { ...u, [field]: value } : u));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const birthCoords = customBirthCoords || lookupCoordinates(birthPlace);
    const deathCoords = customDeathCoords || lookupCoordinates(deathPlace);

    // Sync union coords if missing
    const preparedUnions = unions.map(u => ({
      ...u,
      coords: u.coords || lookupCoordinates(u.place)
    }));

    const spouseIds = preparedUnions.map(u => u.partnerId);

    const updatedPerson: Person = {
      id: personToEdit ? personToEdit.id : `p-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      maidenName: maidenName.trim() || undefined,
      gender,
      birthDate: birthDate || undefined,
      birthPlace: birthPlace.trim() || undefined,
      birthCoords,
      deathDate: isDeceased ? (deathDate || undefined) : undefined,
      deathPlace: isDeceased ? (deathPlace.trim() || undefined) : undefined,
      deathCoords,
      isDeceased,
      photoUrl: photoUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      profession: profession.trim() || undefined,
      branch,
      fatherId: fatherId || undefined,
      motherId: motherId || undefined,
      spouseIds,
      showOnTree,
      unions: preparedUnions,
      childrenIds: selectedChildrenIds,
      documents: personToEdit?.documents || [],
      successionInfo: (inheritanceNotes || willsLocation) ? {
        inheritanceNotes,
        willsLocation
      } : undefined,
      createdAt: personToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(updatedPerson);
    onClose();
  };

  // Filter available choices excluding current person
  const fatherOptions = allPersons.filter(p => p.id !== personToEdit?.id && (p.gender === 'M' || p.gender === 'O'));
  const motherOptions = allPersons.filter(p => p.id !== personToEdit?.id && (p.gender === 'F' || p.gender === 'O'));
  const spouseOptions = allPersons.filter(p => p.id !== personToEdit?.id);
  const childrenOptions = allPersons.filter(p => p.id !== personToEdit?.id);

  // Active location picker initial variables
  let locationPickerInitialPlace = '';
  let locationPickerInitialCoords: [number, number] | undefined = undefined;
  let locationPickerTitle = 'Sélectionner un lieu sur la carte';

  if (locationPickerTarget === 'birth') {
    locationPickerInitialPlace = birthPlace;
    locationPickerInitialCoords = customBirthCoords || lookupCoordinates(birthPlace);
    locationPickerTitle = 'Placer le lieu de naissance sur la carte';
  } else if (locationPickerTarget === 'death') {
    locationPickerInitialPlace = deathPlace;
    locationPickerInitialCoords = customDeathCoords || lookupCoordinates(deathPlace);
    locationPickerTitle = 'Placer le lieu de décès sur la carte';
  } else if (typeof locationPickerTarget === 'object' && locationPickerTarget.type === 'union') {
    const unionItem = unions[locationPickerTarget.index];
    if (unionItem) {
      locationPickerInitialPlace = unionItem.place || '';
      locationPickerInitialCoords = unionItem.coords || lookupCoordinates(unionItem.place);
      const partner = allPersons.find(p => p.id === unionItem.partnerId);
      locationPickerTitle = `Placer le lieu d'union avec ${partner ? `${partner.firstName} ${partner.lastName}` : 'le conjoint'}`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2926]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F6F0] border border-[#D9D2C2] w-full max-w-3xl shadow-2xl overflow-hidden my-8 text-[#2D2926] flex flex-col max-h-[90vh] font-sans">
        
        {/* Header */}
        <div className="bg-[#EFE9DB] p-5 border-b border-[#D9D2C2] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-[#5C4D3F] flex items-center justify-center text-white font-bold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#5C4D3F]">
                {personToEdit ? `Modifier ${personToEdit.firstName} ${personToEdit.lastName}` : 'Ajouter une personne'}
              </h2>
              <p className="text-xs text-[#8C7B6B]">
                Liaison automatique bi-directionnelle avec les parents et enfants.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8C7B6B] hover:text-[#2D2926] p-2 bg-white border border-[#D9D2C2] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 1: Identité */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C4D3F] font-serif flex items-center gap-1.5">
              <User className="h-4 w-4 text-[#D97706]" /> 1. Identité Principale
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Henri"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                />
              </div>

              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Nom de Famille *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                />
              </div>

              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Nom de Naissance / Jeune Fille</label>
                <input
                  type="text"
                  placeholder="Ex: Bernard"
                  value={maidenName}
                  onChange={(e) => setMaidenName(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Sexe</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                >
                  <option value="M">Masculin (Homme)</option>
                  <option value="F">Féminin (Femme)</option>
                  <option value="O">Autre / Non spécifié</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Branche Familiale</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as BranchType)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                >
                  <option value="paternal">Branche Paternelle</option>
                  <option value="maternal">Branche Maternelle</option>
                  <option value="inlaw">Belle-Famille / Conjoints</option>
                  <option value="secondary">Branche Secondaire</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Profession</label>
                <input
                  type="text"
                  placeholder="Ex: Architecte, Horloger..."
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="showOnTreeCheck"
                checked={showOnTree}
                onChange={(e) => setShowOnTree(e.target.checked)}
                className="bg-white border-[#D9D2C2] text-[#5C4D3F] h-4 w-4"
              />
              <label htmlFor="showOnTreeCheck" className="text-[#2D2926] font-semibold cursor-pointer">
                Afficher sur l'arbre généalogique visuel (coché par défaut)
              </label>
            </div>

            {/* Photo Avatar input */}
            <div>
              <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Photo Portrait (URL ou Téléversement)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="flex-1 bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                />
                <label className="bg-white hover:bg-[#EFE9DB] text-[#5C4D3F] border border-[#D9D2C2] px-3 py-2 cursor-pointer flex items-center gap-1 shrink-0 font-bold uppercase text-[10px] tracking-wider">
                  <Upload className="h-3.5 w-3.5 text-[#5C4D3F]" />
                  <span>Fichier</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Dates & Lieux */}
          <div className="space-y-4 pt-4 border-t border-[#D9D2C2]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C4D3F] font-serif flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#D97706]" /> 2. Naissance & Décès
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Date de Naissance</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#8C7B6B] font-bold uppercase">Lieu de Naissance</label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenLocationPicker('birth')}
                      className="text-[11px] text-[#B45309] hover:text-[#78350F] font-semibold flex items-center space-x-1 cursor-pointer bg-[#FEF3C7] hover:bg-[#FDE68A] px-2 py-0.5 border border-[#FCD34D] transition"
                      title="Sélectionner ou ajuster la position exacte sur la carte"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#D97706]" />
                      <span>{birthPlace || customBirthCoords ? 'Modifier carte' : 'Placer sur carte'}</span>
                    </button>
                    {(birthPlace || customBirthCoords) && (
                      <button
                        type="button"
                        onClick={() => {
                          setBirthPlace('');
                          setCustomBirthCoords(undefined);
                        }}
                        className="text-[11px] text-red-700 hover:text-red-900 font-semibold flex items-center space-x-0.5 cursor-pointer bg-red-50 hover:bg-red-100 px-1.5 py-0.5 border border-red-300 transition"
                        title="Supprimer ce lieu et son repère GPS"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        <span>Effacer</span>
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Senlis, Hameau de Raray, Gerberoy..."
                  value={birthPlace}
                  onChange={(e) => handleBirthPlaceChange(e.target.value)}
                  onFocus={() => {
                    if (birthPlace.trim().length > 0) {
                      const suggs = getCitySuggestions(birthPlace);
                      setBirthSuggestions(suggs);
                      setShowBirthDropdown(suggs.length > 0);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowBirthDropdown(false), 200)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                />
                
                {/* GPS indicator */}
                {(customBirthCoords || lookupCoordinates(birthPlace)) && (
                  <div className="text-[10px] text-[#8C7B6B] mt-1 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#D97706]" />
                      GPS : {(customBirthCoords || lookupCoordinates(birthPlace))![0].toFixed(4)}, {(customBirthCoords || lookupCoordinates(birthPlace))![1].toFixed(4)}
                    </span>
                    {customBirthCoords && (
                      <span className="text-[9px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.2 font-sans font-semibold">
                        Point carte épinglé
                      </span>
                    )}
                  </div>
                )}

                {showBirthDropdown && birthSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#D9D2C2] shadow-xl max-h-48 overflow-y-auto font-sans text-xs divide-y divide-[#EFE9DB]">
                    {birthSuggestions.map((city, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectBirthCity(city);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#F9F6F0] flex items-center justify-between transition-colors text-[#2D2926]"
                      >
                        <span className="font-semibold">{city.label}</span>
                        <span className="text-[10px] text-[#8C7B6B] flex items-center gap-1 shrink-0">
                          <MapPin className="h-3 w-3 text-[#D97706]" /> GPS
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isDeceasedCheck"
                checked={isDeceased}
                onChange={(e) => setIsDeceased(e.target.checked)}
                className="bg-white border-[#D9D2C2] text-[#5C4D3F] h-4 w-4"
              />
              <label htmlFor="isDeceasedCheck" className="text-[#2D2926] font-semibold cursor-pointer">
                Cette personne est décédée
              </label>
            </div>

            {isDeceased && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 border border-[#D9D2C2]">
                <div>
                  <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Date de Décès</label>
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#8C7B6B] font-bold uppercase">Lieu de Décès</label>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenLocationPicker('death')}
                        className="text-[11px] text-[#B45309] hover:text-[#78350F] font-semibold flex items-center space-x-1 cursor-pointer bg-[#FEF3C7] hover:bg-[#FDE68A] px-2 py-0.5 border border-[#FCD34D] transition"
                        title="Sélectionner ou ajuster la position exacte sur la carte"
                      >
                        <MapPin className="h-3.5 w-3.5 text-[#D97706]" />
                        <span>{deathPlace || customDeathCoords ? 'Modifier carte' : 'Placer sur carte'}</span>
                      </button>
                      {(deathPlace || customDeathCoords) && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeathPlace('');
                            setCustomDeathCoords(undefined);
                          }}
                          className="text-[11px] text-red-700 hover:text-red-900 font-semibold flex items-center space-x-0.5 cursor-pointer bg-red-50 hover:bg-red-100 px-1.5 py-0.5 border border-red-300 transition"
                          title="Supprimer ce lieu et son repère GPS"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          <span>Effacer</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: Senlis, Hameau de Raray, Gerberoy..."
                    value={deathPlace}
                    onChange={(e) => handleDeathPlaceChange(e.target.value)}
                    onFocus={() => {
                      if (deathPlace.trim().length > 0) {
                        const suggs = getCitySuggestions(deathPlace);
                        setDeathSuggestions(suggs);
                        setShowDeathDropdown(suggs.length > 0);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowDeathDropdown(false), 200)}
                    className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                  />

                  {/* GPS indicator */}
                  {(customDeathCoords || lookupCoordinates(deathPlace)) && (
                    <div className="text-[10px] text-[#8C7B6B] mt-1 flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#D97706]" />
                        GPS : {(customDeathCoords || lookupCoordinates(deathPlace))![0].toFixed(4)}, {(customDeathCoords || lookupCoordinates(deathPlace))![1].toFixed(4)}
                      </span>
                      {customDeathCoords && (
                        <span className="text-[9px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.2 font-sans font-semibold">
                          Point carte épinglé
                        </span>
                      )}
                    </div>
                  )}

                  {showDeathDropdown && deathSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#D9D2C2] shadow-xl max-h-48 overflow-y-auto font-sans text-xs divide-y divide-[#EFE9DB]">
                      {deathSuggestions.map((city, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectDeathCity(city);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[#F9F6F0] flex items-center justify-between transition-colors text-[#2D2926]"
                        >
                          <span className="font-semibold">{city.label}</span>
                          <span className="text-[10px] text-[#8C7B6B] flex items-center gap-1 shrink-0">
                            <MapPin className="h-3 w-3 text-[#D97706]" /> GPS
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Relations Familiales */}
          <div className="space-y-4 pt-4 border-t border-[#D9D2C2]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C4D3F] font-serif flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#D97706]" /> 3. Définition des Relations (Automatiques)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Father */}
              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Père</label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                >
                  <option value="">-- Aucun père sélectionné --</option>
                  {fatherOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mother */}
              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Mère</label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                >
                  <option value="">-- Aucune mère sélectionnée --</option>
                  {motherOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unions & Partners */}
            <div className="space-y-3 bg-[#EFE9DB]/50 p-3 border border-[#D9D2C2]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[#5C4D3F] font-bold uppercase text-xs">Conjoint(s) / Partenaire(s) & Unions</label>
                  <p className="text-[10px] text-[#8C7B6B]">Associez des unions détaillées avec type, date, lieu et séparation.</p>
                </div>
                
                {/* Add Partner selector */}
                <select
                  value=""
                  onChange={(e) => {
                    handleAddUnion(e.target.value);
                  }}
                  className="bg-white border border-[#D9D2C2] text-[#2D2926] px-2.5 py-1 text-xs font-medium cursor-pointer"
                >
                  <option value="">+ Ajouter un partenaire...</option>
                  {spouseOptions.filter(p => !unions.some(u => u.partnerId === p.id)).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} {p.maidenName ? `(${p.maidenName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {unions.length === 0 ? (
                <div className="p-3 text-center border border-dashed border-[#D9D2C2] text-[#8C7B6B] italic text-xs">
                  Aucun conjoint ou partenaire associé pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {unions.map((union, uIdx) => {
                    const partner = allPersons.find(p => p.id === union.partnerId);
                    const partnerName = partner ? `${partner.firstName} ${partner.lastName}` : 'Partenaire inconnu';

                    return (
                      <div key={union.id || uIdx} className="bg-white border border-[#D9D2C2] p-3 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-[#EFE9DB] pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-base">{getUnionTypeIcon(union.type)}</span>
                            <span className="font-bold text-[#5C4D3F] text-xs">{partnerName}</span>
                            {partner?.maidenName && (
                              <span className="text-[10px] text-[#8C7B6B]">({partner.maidenName})</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveUnion(union.partnerId)}
                            className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2 py-0.5 border border-red-200"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Retirer</span>
                          </button>
                        </div>

                        {/* Union options grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Type d'union */}
                          <div>
                            <label className="block text-[#8C7B6B] font-bold uppercase mb-1 text-[10px]">Type d'union</label>
                            <select
                              value={union.type}
                              onChange={(e) => handleUpdateUnionField(uIdx, 'type', e.target.value as UnionType)}
                              className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] px-2.5 py-1.5 text-xs"
                            >
                              <option value="mariage">💍 Mariage</option>
                              <option value="divorce">💍💔 Divorce / Séparation</option>
                              <option value="union_libre">🤝 Union libre / Concubinage</option>
                              <option value="pacs">📜 PACS</option>
                            </select>
                          </div>

                          {/* Date d'union */}
                          <div>
                            <label className="block text-[#8C7B6B] font-bold uppercase mb-1 text-[10px]">Date du mariage / union</label>
                            <input
                              type="date"
                              value={union.date || ''}
                              onChange={(e) => handleUpdateUnionField(uIdx, 'date', e.target.value)}
                              className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] px-2.5 py-1.5 text-xs"
                            />
                          </div>

                          {/* Lieu d'union */}
                          <div className="relative sm:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[#8C7B6B] font-bold uppercase text-[10px]">Lieu du mariage / union</label>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenLocationPicker({ type: 'union', index: uIdx })}
                                  className="text-[10px] text-[#B45309] hover:text-[#78350F] font-semibold flex items-center space-x-1 cursor-pointer bg-[#FEF3C7] hover:bg-[#FDE68A] px-2 py-0.5 border border-[#FCD34D]"
                                >
                                  <MapPin className="h-3 w-3 text-[#D97706]" />
                                  <span>{union.place || union.coords ? 'Modifier carte' : 'Placer sur carte'}</span>
                                </button>
                                {(union.place || union.coords) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateUnionField(uIdx, 'place', '');
                                      handleUpdateUnionField(uIdx, 'coords', undefined);
                                    }}
                                    className="text-[10px] text-red-700 hover:text-red-900 font-semibold flex items-center space-x-0.5 cursor-pointer bg-red-50 hover:bg-red-100 px-1.5 py-0.5 border border-red-200"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                    <span>Effacer</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            <input
                              type="text"
                              placeholder="Ex: Senlis, Paris, Lyon..."
                              value={union.place || ''}
                              onChange={(e) => handleUpdateUnionField(uIdx, 'place', e.target.value)}
                              className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] px-2.5 py-1.5 text-xs"
                            />
                            {(union.coords || lookupCoordinates(union.place)) && (
                              <div className="text-[10px] text-[#8C7B6B] mt-1 flex items-center justify-between font-mono">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-[#D97706]" />
                                  GPS : {(union.coords || lookupCoordinates(union.place))![0].toFixed(4)}, {(union.coords || lookupCoordinates(union.place))![1].toFixed(4)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Date de fin / divorce */}
                          <div className="sm:col-span-2 pt-1 border-t border-[#EFE9DB]">
                            <label className="block text-[#8C7B6B] font-bold uppercase mb-1 text-[10px]">
                              Date de fin / divorce <span className="text-[#8C7B6B] font-normal lowercase">(optionnelle)</span>
                            </label>
                            <input
                              type="date"
                              value={union.endDate || ''}
                              onChange={(e) => handleUpdateUnionField(uIdx, 'endDate', e.target.value)}
                              className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] px-2.5 py-1.5 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Children */}
            <div>
              <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Enfant(s)</label>
              <select
                multiple
                value={selectedChildrenIds}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions, (option) => (option as HTMLOptionElement).value);
                  setSelectedChildrenIds(opts);
                }}
                className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] p-2 h-24"
              >
                {childrenOptions.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#8C7B6B] mt-1 font-serif italic">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs enfants.</p>
            </div>
          </div>

          {/* Section 4: Notes & Succession */}
          <div className="space-y-4 pt-4 border-t border-[#D9D2C2]">
            <div>
              <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Notes Biographiques</label>
              <textarea
                rows={3}
                placeholder="Événements marquants, souvenirs, anecdotes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] p-2.5 font-serif"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Notes de Succession & Héritage</label>
                <input
                  type="text"
                  placeholder="Ex: Biens, testament, donations..."
                  value={inheritanceNotes}
                  onChange={(e) => setInheritanceNotes(e.target.value)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-[#8C7B6B] font-bold uppercase mb-1">Notaire / Localisation des actes</label>
                <input
                  type="text"
                  placeholder="Ex: Étude notariale Lyon 2e"
                  value={willsLocation}
                  onChange={(e) => setWillsLocation(e.target.value)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#D9D2C2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#8C7B6B] hover:text-[#2D2926] transition cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-sans text-xs uppercase tracking-wider font-bold px-5 py-2 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer la fiche</span>
            </button>
          </div>

        </form>

      </div>

      {/* Interactive Map Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelectLocation={handleSelectLocationFromMap}
        onRemoveLocation={() => {
          if (locationPickerTarget === 'birth') {
            setBirthPlace('');
            setCustomBirthCoords(undefined);
          } else if (locationPickerTarget === 'death') {
            setDeathPlace('');
            setCustomDeathCoords(undefined);
          } else if (typeof locationPickerTarget === 'object' && locationPickerTarget.type === 'union') {
            const idx = locationPickerTarget.index;
            setUnions(prev => prev.map((u, i) => i === idx ? { ...u, place: '', coords: undefined } : u));
          }
        }}
        initialPlaceName={locationPickerInitialPlace}
        initialCoords={locationPickerInitialCoords}
        title={locationPickerTitle}
      />
    </div>
  );
};
