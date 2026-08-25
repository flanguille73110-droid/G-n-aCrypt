import React from 'react';
import { Person } from '../types';
import { getLifespanText } from '../utils/genealogy';
import { User, MapPin, Calendar, Edit3, Trash2, ChevronRight, FileText } from 'lucide-react';

interface PersonListViewProps {
  persons: Person[];
  onSelectPerson: (person: Person) => void;
  onEditPerson: (person: Person) => void;
  onDeletePerson: (personId: string) => void;
  searchQuery: string;
  branchFilter: string;
}

export const PersonListView: React.FC<PersonListViewProps> = ({
  persons,
  onSelectPerson,
  onEditPerson,
  onDeletePerson,
  searchQuery,
  branchFilter,
}) => {
  const filtered = persons.filter(p => {
    const matchesSearch = searchQuery === '' || 
      `${p.firstName} ${p.lastName} ${p.maidenName || ''} ${p.birthPlace || ''} ${p.profession || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesBranch = branchFilter === 'all' || p.branch === branchFilter;

    return matchesSearch && matchesBranch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-[#2D2926] font-sans space-y-6">
      
      {/* Header */}
      <div className="bg-[#EFE9DB] border border-[#D9D2C2] p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-[#5C4D3F] flex items-center justify-center text-white font-bold">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-[#5C4D3F]">Annuaire Familial</h2>
            <p className="text-xs text-[#8C7B6B]">Liste complète des {filtered.length} membres répertoriés</p>
          </div>
        </div>
      </div>

      {/* Grid of Persons */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#D9D2C2] text-[#8C7B6B] text-xs font-serif italic">
          Aucun membre ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(person => (
            <div
              key={person.id}
              className="bg-white hover:bg-[#F9F6F0] border border-[#D9D2C2] p-4 shadow-xs transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start space-x-3 mb-3">
                  {person.photoUrl ? (
                    <img src={person.photoUrl} alt={person.firstName} className="h-12 w-12 rounded-full object-cover border border-[#D9D2C2] shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-[#EFE9DB] border border-[#D9D2C2] flex items-center justify-center text-[#5C4D3F] font-serif font-bold shrink-0">
                      {person.firstName[0]}
                    </div>
                  )}

                  <div className="overflow-hidden flex-1">
                    <span className="text-[10px] font-bold text-[#8C7B6B] uppercase tracking-wider block">
                      {person.branch === 'paternal' ? 'Branche Paternelle' : person.branch === 'maternal' ? 'Branche Maternelle' : 'Famille'}
                    </span>
                    <h3 className="font-bold text-[#5C4D3F] font-serif text-base truncate">{person.firstName}</h3>
                    <p className="font-extrabold text-[#2D2926] text-xs uppercase truncate">
                      {person.lastName} {person.maidenName && `(${person.maidenName})`}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#2D2926] border-t border-[#D9D2C2] pt-2 mb-3">
                  <p className="flex items-center gap-1.5 text-[#8C7B6B]">
                    <Calendar className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                    <span>{getLifespanText(person)}</span>
                  </p>
                  {person.birthPlace && (
                    <p className="flex items-center gap-1.5 text-[#8C7B6B] truncate">
                      <MapPin className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                      <span className="truncate">{person.birthPlace}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#D9D2C2] text-xs">
                <button
                  onClick={() => onSelectPerson(person)}
                  className="text-[#5C4D3F] font-bold hover:text-[#4A3E32] flex items-center gap-1 uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  <span>Fiche détaillée</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEditPerson(person)}
                    className="p-1.5 text-[#8C7B6B] hover:text-[#2D2926] hover:bg-[#EFE9DB] transition cursor-pointer"
                    title="Modifier"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer ${person.firstName} ${person.lastName} ?`)) {
                        onDeletePerson(person.id);
                      }
                    }}
                    className="p-1.5 text-red-800 hover:text-red-900 hover:bg-red-50 transition cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
