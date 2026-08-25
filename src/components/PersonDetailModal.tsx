import React, { useState } from 'react';
import { Person, DocumentItem } from '../types';
import { getLifespanText, getSiblings, getGrandparents, getUnionTypeIcon, getUnionTypeLabel, formatUnionSummary } from '../utils/genealogy';
import { 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Heart, 
  Users, 
  FileText, 
  Plus, 
  BookOpen, 
  ExternalLink,
  ShieldAlert,
  Image as ImageIcon
} from 'lucide-react';

interface PersonDetailModalProps {
  person: Person | null;
  allPersons: Person[];
  onClose: () => void;
  onEdit: (person: Person) => void;
  onDelete: (personId: string) => void;
  onSelectPerson: (person: Person) => void;
  onAddDocument: (personId: string, doc: DocumentItem) => void;
  onToggleShowOnTree?: (person: Person, showOnTree: boolean) => void;
}

const formatDateInFrench = (dateStr?: string): string => {
  if (!dateStr) return '';
  if (dateStr.length === 10 && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  allPersons,
  onClose,
  onEdit,
  onDelete,
  onSelectPerson,
  onAddDocument,
  onToggleShowOnTree,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'gallery' | 'succession'>('profile');
  const [selectedDocImage, setSelectedDocImage] = useState<string | null>(null);
  
  // Document upload state
  const [showDocUploadForm, setShowDocUploadForm] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('acte_naissance');
  const [docDate, setDocDate] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');

  if (!person) return null;

  // Direct relatives calculation
  const father = person.fatherId ? allPersons.find(p => p.id === person.fatherId) : null;
  const mother = person.motherId ? allPersons.find(p => p.id === person.motherId) : null;
  const spouses = person.spouseIds ? allPersons.filter(p => person.spouseIds.includes(p.id)) : [];
  const children = person.childrenIds ? allPersons.filter(p => person.childrenIds.includes(p.id)) : [];
  const siblings = getSiblings(person, allPersons);
  const grandparents = getGrandparents(person, allPersons);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setDocFileUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docFileUrl) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: docTitle,
      category: docCategory,
      date: docDate || undefined,
      notes: docNotes || undefined,
      urlOrData: docFileUrl
    };

    onAddDocument(person.id, newDoc);
    
    // Reset form
    setDocTitle('');
    setDocFileUrl('');
    setDocNotes('');
    setShowDocUploadForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2926]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-[#F9F6F0] border border-[#D9D2C2] w-full max-w-4xl shadow-2xl overflow-hidden my-8 text-[#2D2926] flex flex-col max-h-[90vh] font-sans">
        
        {/* Header Profile Hero */}
        <div className="relative bg-[#EFE9DB] p-6 border-b border-[#D9D2C2]">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#8C7B6B] hover:text-[#2D2926] p-2 bg-white border border-[#D9D2C2] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            {person.photoUrl ? (
              <img
                src={person.photoUrl}
                alt={person.firstName}
                className="h-24 w-24 rounded-full object-cover border-2 border-[#D9D2C2] shadow-md shrink-0"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white border-2 border-[#D9D2C2] flex items-center justify-center text-[#5C4D3F] font-bold text-2xl shrink-0">
                <User className="h-12 w-12" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-white text-[#5C4D3F] border border-[#D9D2C2]">
                  {person.branch === 'paternal' ? 'Branche Paternelle' : person.branch === 'maternal' ? 'Branche Maternelle' : 'Famille'}
                </span>
                {person.gender && (
                  <span className="text-xs text-[#8C7B6B] font-mono">
                    Sexe: {person.gender === 'M' ? 'Masculin' : person.gender === 'F' ? 'Féminin' : 'Autre'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-bold font-serif italic text-[#5C4D3F] tracking-tight">
                  {person.firstName} <span className="uppercase font-sans font-extrabold text-[#2D2926]">{person.lastName}</span>
                </h2>

                <label className="inline-flex items-center space-x-2 bg-white hover:bg-[#F9F6F0] border border-[#D9D2C2] px-3 py-1.5 rounded text-xs font-semibold text-[#5C4D3F] cursor-pointer shadow-2xs transition">
                  <input
                    type="checkbox"
                    checked={person.showOnTree !== false}
                    onChange={(e) => {
                      const val = e.target.checked;
                      if (onToggleShowOnTree) {
                        onToggleShowOnTree(person, val);
                      } else {
                        onEdit({ ...person, showOnTree: val });
                      }
                    }}
                    className="h-4 w-4 text-[#D97706] focus:ring-[#D97706] border-[#D9D2C2] rounded cursor-pointer"
                  />
                  <span>Afficher sur l'arbre</span>
                </label>
              </div>

              {person.maidenName && (
                <p className="text-xs text-[#8C7B6B] italic font-serif">
                  Nom de naissance: {person.maidenName}
                </p>
              )}

              <div className="mt-3.5 space-y-2 border-l-2 border-[#D97706] pl-3 py-0.5 text-xs text-[#2D2926]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-[#5C4D3F] min-w-[85px] uppercase tracking-wider text-[10px]">Naissance :</span>
                  <span className="font-semibold bg-white px-2 py-0.5 border border-[#D9D2C2] rounded-xs text-[#2D2926]">
                    {person.birthDate ? formatDateInFrench(person.birthDate) : 'Date inconnue'}
                  </span>
                  {person.birthPlace ? (
                    <span className="text-[#8C7B6B] flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#D97706] inline" />
                      à {person.birthPlace}
                    </span>
                  ) : (
                    <span className="text-stone-400 italic">Lieu inconnu</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-red-800 min-w-[85px] uppercase tracking-wider text-[10px]">Décès :</span>
                  {person.isDeceased ? (
                    <>
                      <span className="font-semibold bg-white px-2 py-0.5 border border-[#D9D2C2] rounded-xs text-red-800">
                        {person.deathDate ? formatDateInFrench(person.deathDate) : 'Date inconnue'}
                      </span>
                      {person.deathPlace ? (
                        <span className="text-[#8C7B6B] flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-red-600 inline" />
                          à {person.deathPlace}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">Lieu inconnu</span>
                      )}
                    </>
                  ) : (
                    <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 border border-emerald-200 text-[10px] uppercase tracking-wide">
                      Vivant(e)
                    </span>
                  )}
                </div>

                {person.profession && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-[#8C7B6B] min-w-[85px] uppercase tracking-wider text-[10px]">Profession :</span>
                    <span className="bg-white text-[#5C4D3F] border border-[#D9D2C2] px-2.5 py-0.5 text-[11px] font-serif italic">
                      {person.profession}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0">
              <button
                onClick={() => onEdit(person)}
                className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-sans text-xs uppercase tracking-wider px-3.5 py-2 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>Modifier</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Voulez-vous vraiment supprimer ${person.firstName} ${person.lastName} de l'arbre ?`)) {
                    onDelete(person.id);
                    onClose();
                  }
                }}
                className="bg-red-800 hover:bg-red-900 text-white font-sans text-xs uppercase tracking-wider px-3.5 py-2 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-[#D9D2C2] text-xs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#5C4D3F] text-white'
                  : 'bg-white text-[#5C4D3F] border border-[#D9D2C2] hover:bg-[#F9F6F0]'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Identité & Relations</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#5C4D3F] text-white'
                  : 'bg-white text-[#5C4D3F] border border-[#D9D2C2] hover:bg-[#F9F6F0]'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Galerie d'Actes ({person.documents?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('succession')}
              className={`px-4 py-2 font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'succession'
                  ? 'bg-[#5C4D3F] text-white'
                  : 'bg-white text-[#5C4D3F] border border-[#D9D2C2] hover:bg-[#F9F6F0]'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Succession & Légal</span>
            </button>
          </div>

        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: PROFILE & RELATIONSHIPS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Notes & Bio */}
              {person.notes && (
                <div className="bg-white border border-[#D9D2C2] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7B6B] mb-1">
                    Notes Biographiques
                  </h4>
                  <p className="text-xs text-[#2D2926] font-serif whitespace-pre-line leading-relaxed">
                    {person.notes}
                  </p>
                </div>
              )}

              {/* Direct Family Network Grid */}
              <div>
                <h3 className="text-sm font-extrabold font-serif text-[#5C4D3F] mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#D97706]" />
                  Réseau Familial Direct (Cliquer pour naviguer)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Parents */}
                  <div className="bg-white border border-[#D9D2C2] p-3.5">
                    <span className="text-[11px] font-bold text-[#8C7B6B] uppercase tracking-wider block mb-2">Parents</span>
                    <div className="space-y-2">
                      {father ? (
                        <PersonCompactBadge person={father} label="Père" onClick={() => onSelectPerson(father)} />
                      ) : (
                        <p className="text-xs text-[#8C7B6B] italic font-serif">Père non renseigné</p>
                      )}
                      {mother ? (
                        <PersonCompactBadge person={mother} label="Mère" onClick={() => onSelectPerson(mother)} />
                      ) : (
                        <p className="text-xs text-[#8C7B6B] italic font-serif">Mère non renseignée</p>
                      )}
                    </div>
                  </div>

                  {/* Spouses & Unions */}
                  <div className="bg-white border border-[#D9D2C2] p-3.5 md:col-span-2">
                    <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider block mb-2">
                      Conjoint(s), Partenaire(s) & Unions ({spouses.length})
                    </span>
                    {spouses.length === 0 ? (
                      <p className="text-xs text-[#8C7B6B] italic font-serif">Aucun conjoint ou union renseignée</p>
                    ) : (
                      <div className="space-y-2.5">
                        {spouses.map(sp => {
                          const unionDetail = person.unions?.find(u => u.partnerId === sp.id);
                          const summaryText = unionDetail ? formatUnionSummary(unionDetail) : undefined;

                          return (
                            <div key={sp.id} className="bg-[#F9F6F0] border border-[#D9D2C2] p-2 space-y-1">
                              <PersonCompactBadge person={sp} label="Conjoint" onClick={() => onSelectPerson(sp)} />
                              {unionDetail && (
                                <div className="pl-2 pt-1 border-t border-[#EFE9DB] text-[11px] text-[#5C4D3F] flex items-center justify-between font-serif">
                                  <span>{summaryText}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Siblings */}
                  <div className="bg-white border border-[#D9D2C2] p-3.5">
                    <span className="text-[11px] font-bold text-[#5C4D3F] uppercase tracking-wider block mb-2">Frères & Sœurs</span>
                    {siblings.length === 0 ? (
                      <p className="text-xs text-[#8C7B6B] italic font-serif">Aucun frère/sœur détecté(e)</p>
                    ) : (
                      <div className="space-y-2">
                        {siblings.map(sib => (
                          <PersonCompactBadge key={sib.id} person={sib} label="Fratrie" onClick={() => onSelectPerson(sib)} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Children */}
                  <div className="bg-white border border-[#D9D2C2] p-3.5">
                    <span className="text-[11px] font-bold text-[#5C4D3F] uppercase tracking-wider block mb-2">Enfants ({children.length})</span>
                    {children.length === 0 ? (
                      <p className="text-xs text-[#8C7B6B] italic font-serif">Aucun enfant enregistré</p>
                    ) : (
                      <div className="space-y-2">
                        {children.map(child => (
                          <PersonCompactBadge key={child.id} person={child} label="Enfant" onClick={() => onSelectPerson(child)} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grandparents */}
                  <div className="bg-white border border-[#D9D2C2] p-3.5 md:col-span-2">
                    <span className="text-[11px] font-bold text-[#8C7B6B] uppercase tracking-wider block mb-2">Grands-Parents</span>
                    {grandparents.length === 0 ? (
                      <p className="text-xs text-[#8C7B6B] italic font-serif">Grands-parents non enregistrés</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {grandparents.map(gp => (
                          <PersonCompactBadge key={gp.id} person={gp} label="Aïeul" onClick={() => onSelectPerson(gp)} />
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DOCUMENTS & GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold font-serif text-[#5C4D3F]">Actes de Naissance, Mariage & Photos</h3>
                  <p className="text-xs text-[#8C7B6B]">Archives numérisées rattachées à la personne.</p>
                </div>

                <button
                  onClick={() => setShowDocUploadForm(!showDocUploadForm)}
                  className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-sans text-xs uppercase tracking-wider px-3 py-2 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter un Document</span>
                </button>
              </div>

              {/* Upload Document Form */}
              {showDocUploadForm && (
                <form onSubmit={handleSaveDocument} className="bg-white border border-[#D9D2C2] p-4 space-y-4">
                  <h4 className="text-xs font-bold text-[#5C4D3F] uppercase tracking-wider">Nouveau Document Numérisé</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8C7B6B] uppercase mb-1">Titre du document *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Acte de Naissance 1920"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8C7B6B] uppercase mb-1">Catégorie</label>
                      <select
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value as any)}
                        className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs px-3 py-2"
                      >
                        <option value="acte_naissance">Acte de Naissance</option>
                        <option value="acte_mariage">Acte de Mariage</option>
                        <option value="acte_deces">Acte de Décès</option>
                        <option value="heritage">Document de Succession / Héritage</option>
                        <option value="photo">Photo d'Époque</option>
                        <option value="autre">Autre Document</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8C7B6B] uppercase mb-1">Date du document</label>
                      <input
                        type="date"
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                        className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8C7B6B] uppercase mb-1">Fichier (Image / Scan / PDF)</label>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleFileUpload}
                        className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs px-2 py-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8C7B6B] uppercase mb-1">Notes explicatives</label>
                    <textarea
                      rows={2}
                      placeholder="Commentaires, numéro de registre, détails notariale..."
                      value={docNotes}
                      onChange={(e) => setDocNotes(e.target.value)}
                      className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs p-2.5 font-serif"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDocUploadForm(false)}
                      className="px-3 py-1.5 text-xs text-[#8C7B6B] hover:text-[#2D2926] cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 cursor-pointer"
                    >
                      Enregistrer le document
                    </button>
                  </div>
                </form>
              )}

              {/* Document List */}
              {(!person.documents || person.documents.length === 0) ? (
                <div className="p-8 text-center border border-dashed border-[#D9D2C2] bg-white text-[#8C7B6B] text-xs font-serif italic">
                  <FileText className="h-8 w-8 text-[#8C7B6B] mx-auto mb-2" />
                  <p>Aucun document numérisé archivé pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {person.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="bg-white border border-[#D9D2C2] overflow-hidden hover:border-[#8C7B6B] transition flex flex-col group shadow-xs"
                    >
                      <div className="h-36 bg-[#EFE9DB] relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => setSelectedDocImage(doc.urlOrData)}>
                        <img src={doc.urlOrData} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="absolute inset-0 bg-[#2D2926]/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                          <ExternalLink className="h-4 w-4" />
                          <span>Agrandir</span>
                        </div>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-[#8C7B6B] block mb-1">
                            {doc.category.replace('_', ' ')}
                          </span>
                          <h4 className="font-bold font-serif text-xs text-[#2D2926] truncate">{doc.title}</h4>
                          {doc.date && <p className="text-[10px] text-[#8C7B6B] mt-0.5">{doc.date}</p>}
                          {doc.notes && <p className="text-[11px] text-[#5C4D3F] mt-1 font-serif italic line-clamp-2">{doc.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: SUCCESSION & LEGAL */}
          {activeTab === 'succession' && (
            <div className="space-y-6">
              
              <div className="bg-[#EFE9DB] border border-[#D9D2C2] p-4 flex items-start space-x-3">
                <BookOpen className="h-5 w-5 text-[#5C4D3F] shrink-0 mt-0.5" />
                <div className="text-xs text-[#2D2926]">
                  <h4 className="font-bold font-serif text-[#5C4D3F] text-sm mb-0.5">Mode Succession & Mémoire Sécurisée</h4>
                  <p>Conservez les dispositions légales, inventaires d'héritage, testament ou instructions patrimoniales en toute sécurité chiffrée.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-white border border-[#D9D2C2] p-4">
                  <h4 className="text-xs font-bold text-[#8C7B6B] uppercase tracking-wider mb-2">
                    Dispositions & Héritages
                  </h4>
                  <p className="text-xs text-[#2D2926] font-serif whitespace-pre-line leading-relaxed">
                    {person.successionInfo?.inheritanceNotes || 'Aucune note d\'héritage spécifiée.'}
                  </p>
                </div>

                <div className="bg-white border border-[#D9D2C2] p-4">
                  <h4 className="text-xs font-bold text-[#8C7B6B] uppercase tracking-wider mb-2">
                    Localisation des Actes & Notaire
                  </h4>
                  <p className="text-xs text-[#2D2926] font-serif whitespace-pre-line leading-relaxed">
                    {person.successionInfo?.willsLocation || person.successionInfo?.legalDocumentsNotes || 'Emplacement notarial non renseigné.'}
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Lightbox Modal for Documents */}
      {selectedDocImage && (
        <div className="fixed inset-0 z-60 bg-[#2D2926]/90 flex items-center justify-center p-4" onClick={() => setSelectedDocImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden">
            <img src={selectedDocImage} alt="Document Agrandit" className="max-w-full max-h-[85vh] object-contain border border-[#D9D2C2]" />
            <button
              onClick={() => setSelectedDocImage(null)}
              className="absolute top-2 right-2 bg-[#5C4D3F] text-white p-2 hover:bg-[#4A3E32] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

/* Compact person link badge */
const PersonCompactBadge: React.FC<{
  person: Person;
  label: string;
  onClick: () => void;
}> = ({ person, label, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-[#F9F6F0] hover:bg-[#EFE9DB] border border-[#D9D2C2] p-2 flex items-center space-x-2.5 cursor-pointer transition text-xs"
    >
      {person.photoUrl ? (
        <img src={person.photoUrl} alt={person.firstName} className="h-7 w-7 rounded-full object-cover border border-[#D9D2C2] shrink-0" />
      ) : (
        <div className="h-7 w-7 rounded-full bg-[#EFE9DB] border border-[#D9D2C2] flex items-center justify-center text-[#5C4D3F] font-serif font-bold shrink-0 text-xs">
          {person.firstName[0]}
        </div>
      )}
      <div className="overflow-hidden flex-1">
        <p className="font-bold text-[#2D2926] font-serif truncate">{person.firstName} {person.lastName}</p>
        <p className="text-[10px] text-[#8C7B6B]">{getLifespanText(person)}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-[#8C7B6B] shrink-0" />
    </div>
  );
};
