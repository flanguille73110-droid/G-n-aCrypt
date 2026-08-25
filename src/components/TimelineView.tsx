import React, { useState, useMemo } from 'react';
import { Person, FamilyEvent, EventType } from '../types';
import { generateTimelineEvents } from '../utils/genealogy';
import { Clock, Calendar, MapPin, Users, Filter, Search, Heart, Sparkles, User, Skull } from 'lucide-react';

interface TimelineViewProps {
  persons: Person[];
  customEvents: FamilyEvent[];
  onSelectPerson: (person: Person) => void;
  searchQuery: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  persons,
  customEvents,
  onSelectPerson,
  searchQuery,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');

  // Compute all merged events
  const allEvents = useMemo(() => {
    return generateTimelineEvents(persons, customEvents);
  }, [persons, customEvents]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      const matchesType = selectedType === 'all' || ev.type === selectedType;
      const matchesSearch = searchQuery === '' || 
        `${ev.title} ${ev.place || ''} ${ev.description || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [allEvents, selectedType, searchQuery]);

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case 'naissance':
        return {
          icon: <User className="h-4 w-4 text-[#5C4D3F]" />,
          bg: 'bg-white border-[#D9D2C2] text-[#5C4D3F]'
        };
      case 'mariage':
        return {
          icon: <Heart className="h-4 w-4 text-[#D97706] fill-[#D97706]/20" />,
          bg: 'bg-white border-[#D9D2C2] text-[#D97706]'
        };
      case 'deces':
        return {
          icon: <Skull className="h-4 w-4 text-[#8C7B6B]" />,
          bg: 'bg-white border-[#D9D2C2] text-[#8C7B6B]'
        };
      default:
        return {
          icon: <Sparkles className="h-4 w-4 text-[#5C4D3F]" />,
          bg: 'bg-white border-[#D9D2C2] text-[#5C4D3F]'
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-[#2D2926] space-y-6 font-sans">
      
      {/* Header Controls */}
      <div className="bg-[#EFE9DB] border border-[#D9D2C2] p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-[#5C4D3F] flex items-center justify-center text-white font-bold shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-[#5C4D3F]">Ligne du Temps Familiale</h2>
            <p className="text-xs text-[#8C7B6B]">Chronologie historique des événements, naissances et mariages ({filteredEvents.length})</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs bg-white p-1 border border-[#D9D2C2]">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 font-bold transition cursor-pointer ${
              selectedType === 'all' ? 'bg-[#5C4D3F] text-white' : 'text-[#5C4D3F] hover:bg-[#EFE9DB]'
            }`}
          >
            Tous les événements
          </button>
          <button
            onClick={() => setSelectedType('naissance')}
            className={`px-3 py-1.5 font-bold transition cursor-pointer ${
              selectedType === 'naissance' ? 'bg-[#5C4D3F] text-white' : 'text-[#5C4D3F] hover:bg-[#EFE9DB]'
            }`}
          >
            Naissances
          </button>
          <button
            onClick={() => setSelectedType('mariage')}
            className={`px-3 py-1.5 font-bold transition cursor-pointer ${
              selectedType === 'mariage' ? 'bg-[#5C4D3F] text-white' : 'text-[#5C4D3F] hover:bg-[#EFE9DB]'
            }`}
          >
            Mariages
          </button>
          <button
            onClick={() => setSelectedType('deces')}
            className={`px-3 py-1.5 font-bold transition cursor-pointer ${
              selectedType === 'deces' ? 'bg-[#5C4D3F] text-white' : 'text-[#5C4D3F] hover:bg-[#EFE9DB]'
            }`}
          >
            Décès
          </button>
        </div>

      </div>

      {/* Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#D9D2C2] text-[#8C7B6B] font-serif italic">
          <Calendar className="h-10 w-10 mx-auto mb-2 text-[#8C7B6B]" />
          <p>Aucun événement ne correspond à vos filtres.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#D9D2C2] ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8 my-8">
          
          {filteredEvents.map((ev, idx) => {
            const badge = getEventBadge(ev.type);
            const primaryPerson = ev.personIds?.[0] ? persons.find(p => p.id === ev.personIds[0]) : null;

            return (
              <div key={ev.id || idx} className="relative group">
                
                {/* Timeline Circle Marker */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 h-8 w-8 rounded-full bg-white border-2 border-[#5C4D3F] flex items-center justify-center text-[#5C4D3F] shadow-xs z-10 group-hover:scale-110 transition">
                  {badge.icon}
                </div>

                {/* Event Card */}
                <div className="bg-white hover:bg-[#F9F6F0] border border-[#D9D2C2] p-5 shadow-xs transition duration-200">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}>
                        {ev.type.toUpperCase()}
                      </span>
                      <span className="text-sm font-extrabold text-[#D97706] font-mono">
                        {ev.date}
                      </span>
                    </div>

                    {ev.place && (
                      <span className="text-xs text-[#8C7B6B] flex items-center gap-1 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-[#D97706]" />
                        {ev.place}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-serif text-[#5C4D3F] mb-1.5">
                    {ev.title}
                  </h3>

                  {ev.description && (
                    <p className="text-xs text-[#2D2926] leading-relaxed mb-3 font-serif">
                      {ev.description}
                    </p>
                  )}

                  {/* Associated Person Button */}
                  {primaryPerson && (
                    <div className="pt-3 border-t border-[#D9D2C2] flex items-center justify-between">
                      <button
                        onClick={() => onSelectPerson(primaryPerson)}
                        className="inline-flex items-center space-x-2 text-xs font-bold text-[#5C4D3F] hover:text-[#4A3E32] transition cursor-pointer"
                      >
                        {primaryPerson.photoUrl ? (
                          <img src={primaryPerson.photoUrl} alt="" className="h-6 w-6 rounded-full object-cover border border-[#D9D2C2]" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-[#EFE9DB] border border-[#D9D2C2] flex items-center justify-center text-[#5C4D3F] font-serif font-bold text-[10px]">
                            {primaryPerson.firstName[0]}
                          </div>
                        )}
                        <span>Voir la fiche de {primaryPerson.firstName} {primaryPerson.lastName} &rarr;</span>
                      </button>
                    </div>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};
