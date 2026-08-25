import React, { useState } from 'react';
import { Person, FamilyTreeData } from '../types';
import { BookOpen, ShieldCheck, FileText, User, Lock, Save, Sparkles, Building2 } from 'lucide-react';

interface SuccessionViewProps {
  persons: Person[];
  generalNotes?: string;
  onUpdateGeneralNotes: (notes: string) => void;
  onSelectPerson: (person: Person) => void;
}

export const SuccessionView: React.FC<SuccessionViewProps> = ({
  persons,
  generalNotes = '',
  onUpdateGeneralNotes,
  onSelectPerson,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(generalNotes);

  const personsWithSuccession = persons.filter(
    p => p.successionInfo?.inheritanceNotes || p.successionInfo?.willsLocation
  );

  const handleSaveNotes = () => {
    onUpdateGeneralNotes(notesText);
    setIsEditingNotes(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-[#2D2926] space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-[#EFE9DB] border border-[#D9D2C2] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-[#5C4D3F] flex items-center justify-center text-white shadow-xs shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#5C4D3F] flex items-center gap-2">
                Coffre de Succession & Inscription Patrimoniale
              </h2>
              <p className="text-xs text-[#8C7B6B] mt-0.5">
                Archivage confidentiel des actes, dispositions testamentaires et volontés familiales.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 border border-[#D9D2C2] text-xs text-[#5C4D3F] font-bold">
            <ShieldCheck className="h-4 w-4 text-[#D97706]" />
            <span>Protégé par le chiffrement maître AES-256</span>
          </div>

        </div>
      </div>

      {/* General Family Instructions & Will Box */}
      <div className="bg-white border border-[#D9D2C2] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-[#D97706]" />
            <h3 className="font-bold font-serif text-lg text-[#5C4D3F]">Instructions Générales de la Famille</h3>
          </div>

          {!isEditingNotes ? (
            <button
              onClick={() => {
                setNotesText(generalNotes);
                setIsEditingNotes(true);
              }}
              className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-bold text-xs px-4 py-2 transition cursor-pointer uppercase tracking-wider"
            >
              Modifier les instructions
            </button>
          ) : (
            <button
              onClick={handleSaveNotes}
              className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-bold text-xs px-4 py-2 transition flex items-center gap-1 cursor-pointer uppercase tracking-wider"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Enregistrer</span>
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <textarea
            rows={5}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Saisissez ici les instructions globales pour les ayants droit (emplacement du coffre fort, notaires référents, archives numérisées...)"
            className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs p-3 focus:outline-hidden focus:border-[#5C4D3F] font-serif"
          />
        ) : (
          <div className="bg-[#F9F6F0] border border-[#D9D2C2] p-4 text-xs text-[#2D2926] leading-relaxed whitespace-pre-line font-serif italic">
            {generalNotes || 'Aucune instruction générale enregistrée. Cliquez sur "Modifier les instructions" pour ajouter des informations patrimoniales.'}
          </div>
        )}
      </div>

      {/* Individual Succession Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-serif text-[#5C4D3F] flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#D97706]" />
          Fiches de Succession par Membre de la Famille ({personsWithSuccession.length})
        </h3>

        {personsWithSuccession.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#D9D2C2] text-[#8C7B6B] text-xs font-serif italic">
            <Lock className="h-8 w-8 text-[#8C7B6B] mx-auto mb-2" />
            <p>Aucune fiche individuelle n'a de disposition de succession enregistrée.</p>
            <p className="text-[11px] text-[#8C7B6B] mt-1">Vous pouvez ajouter des notes d'héritage directement lors de la modification d'une personne.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personsWithSuccession.map(p => (
              <div 
                key={p.id}
                className="bg-white border border-[#D9D2C2] p-5 shadow-xs hover:bg-[#F9F6F0] transition"
              >
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-[#D9D2C2]">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.firstName} className="h-10 w-10 rounded-full object-cover border border-[#D9D2C2]" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#EFE9DB] border border-[#D9D2C2] flex items-center justify-center font-bold font-serif text-[#5C4D3F]">
                      {p.firstName[0]}
                    </div>
                  )}

                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold font-serif text-[#5C4D3F] text-base truncate">{p.firstName} {p.lastName}</h4>
                    <p className="text-[11px] text-[#8C7B6B] font-bold uppercase">{p.profession || 'Membre de la famille'}</p>
                  </div>

                  <button
                    onClick={() => onSelectPerson(p)}
                    className="text-xs font-bold text-[#5C4D3F] hover:text-[#4A3E32] bg-[#EFE9DB] px-3 py-1.5 border border-[#D9D2C2] uppercase tracking-wider cursor-pointer"
                  >
                    Voir fiche &rarr;
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {p.successionInfo?.inheritanceNotes && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7B6B] block mb-1">
                        Dispositions & Patrimoine
                      </span>
                      <p className="text-[#2D2926] bg-[#F9F6F0] p-2.5 border border-[#D9D2C2] font-serif">
                        {p.successionInfo.inheritanceNotes}
                      </p>
                    </div>
                  )}

                  {p.successionInfo?.willsLocation && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7B6B] block mb-1">
                        Étude Notariale & Emplacement des Actes
                      </span>
                      <p className="text-[#2D2926] bg-[#F9F6F0] p-2.5 border border-[#D9D2C2] font-serif">
                        {p.successionInfo.willsLocation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
