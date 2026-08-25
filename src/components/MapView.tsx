import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Person } from '../types';
import { lookupCoordinates } from '../utils/genealogy';
import { LocationPickerModal } from './LocationPickerModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, User, Users, ChevronRight, Filter, Edit3, Trash2 } from 'lucide-react';

interface MapViewProps {
  persons: Person[];
  onSelectPerson: (person: Person) => void;
  onEditPerson?: (person: Person) => void;
  onSavePerson?: (person: Person) => void;
}

interface MapMarkerItem {
  id: string;
  type: 'naissance' | 'deces';
  placeName: string;
  coords: [number, number];
  person: Person;
  date?: string;
}

interface GroupedLocation {
  key: string;
  coords: [number, number];
  placeName: string;
  items: MapMarkerItem[];
}

export const MapView: React.FC<MapViewProps> = ({ 
  persons, 
  onSelectPerson,
  onEditPerson,
  onSavePerson 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [activeFilter, setActiveFilter] = useState<'all' | 'naissance' | 'deces'>('all');
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [editingLocationItem, setEditingLocationItem] = useState<{
    person: Person;
    type: 'naissance' | 'deces';
  } | null>(null);

  // Extract valid mapped locations
  const markerItems: MapMarkerItem[] = useMemo(() => {
    const items: MapMarkerItem[] = [];

    persons.forEach(p => {
      // Birth place
      if (p.birthPlace || p.birthCoords) {
        const coords = p.birthCoords || lookupCoordinates(p.birthPlace);
        if (coords) {
          items.push({
            id: `birth-${p.id}`,
            type: 'naissance',
            placeName: p.birthPlace || 'Lieu épinglé sur la carte',
            coords,
            person: p,
            date: p.birthDate
          });
        }
      }

      // Death place
      if (p.isDeceased && (p.deathPlace || p.deathCoords)) {
        const coords = p.deathCoords || lookupCoordinates(p.deathPlace);
        if (coords) {
          items.push({
            id: `death-${p.id}`,
            type: 'deces',
            placeName: p.deathPlace || 'Lieu épinglé sur la carte',
            coords,
            person: p,
            date: p.deathDate
          });
        }
      }
    });

    return items;
  }, [persons]);

  const filteredMarkers = useMemo(() => {
    if (activeFilter === 'all') return markerItems;
    return markerItems.filter(m => m.type === activeFilter);
  }, [markerItems, activeFilter]);

  // Group items by location
  const groupedLocations: GroupedLocation[] = useMemo(() => {
    const map = new Map<string, GroupedLocation>();

    filteredMarkers.forEach(item => {
      const placeKey = item.placeName.trim().toLowerCase();
      const latKey = item.coords[0].toFixed(3);
      const lngKey = item.coords[1].toFixed(3);
      const key = `${placeKey}_${latKey}_${lngKey}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          coords: item.coords,
          placeName: item.placeName,
          items: []
        });
      }
      map.get(key)!.items.push(item);
    });

    return Array.from(map.values()).sort((a, b) => b.items.length - a.items.length);
  }, [filteredMarkers]);

  // Delete a location point for a person
  const handleDeleteLocation = (item: MapMarkerItem) => {
    if (!onSavePerson) return;
    const p = item.person;
    const placeTitle = item.placeName;
    const labelType = item.type === 'naissance' ? 'lieu de naissance' : 'lieu de décès';

    if (!window.confirm(`Voulez-vous vraiment supprimer le ${labelType} ("${placeTitle}") pour ${p.firstName} ${p.lastName} ?`)) {
      return;
    }

    const updatedPerson: Person = item.type === 'naissance'
      ? { ...p, birthPlace: '', birthCoords: undefined }
      : { ...p, deathPlace: '', deathCoords: undefined };

    onSavePerson(updatedPerson);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [46.603354, 1.888334],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Leaflet Markers when filter or data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markersMapRef.current.clear();

    const bounds = L.latLngBounds([]);

    groupedLocations.forEach(group => {
      const count = group.items.length;
      const isBirthOnly = group.items.every(i => i.type === 'naissance');
      const isDeathOnly = group.items.every(i => i.type === 'deces');
      const bgColor = isBirthOnly ? '#5C4D3F' : isDeathOnly ? '#8C7B6B' : '#D97706';

      const customIcon = L.divIcon({
        className: 'custom-location-marker',
        html: `
          <div style="
            background-color: ${bgColor};
            color: white;
            min-width: 26px;
            height: 26px;
            padding: 0 6px;
            border-radius: 13px;
            border: 2px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            font-family: sans-serif;
            white-space: nowrap;
            cursor: pointer;
          ">
            ${count}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker(group.coords, { icon: customIcon });

      const birthCount = group.items.filter(i => i.type === 'naissance').length;
      const deathCount = group.items.filter(i => i.type === 'deces').length;

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; min-width: 250px; max-width: 320px;">
          <div style="font-size: 13px; font-weight: bold; color: #5C4D3F; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; border-bottom: 1px solid #D9D2C2; padding-bottom: 4px; margin-bottom: 6px;">
            📍 ${group.placeName}
          </div>
          <div style="font-size: 11px; color: #8C7B6B; font-weight: 600; margin-bottom: 8px;">
            ${count} personne${count > 1 ? 's' : ''} liée${count > 1 ? 's' : ''} 
            (${birthCount > 0 ? `${birthCount} naissance${birthCount > 1 ? 's' : ''}` : ''}${birthCount > 0 && deathCount > 0 ? ', ' : ''}${deathCount > 0 ? `${deathCount} décès` : ''})
          </div>
          <div style="max-height: 220px; overflow-y: auto; border-top: 1px solid #EFE9DB; padding-top: 4px;">
            ${group.items.map(item => `
              <div style="padding: 6px 0; border-bottom: 1px solid #EFE9DB; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <div>
                  <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-weight: bold; color: #2D2926;">
                    ${item.person.firstName} ${item.person.lastName}
                  </div>
                  <div style="font-size: 11px; color: #8C7B6B;">
                    ${item.type === 'naissance' ? '👶 Naissance' : '⚰️ Décès'} ${item.date ? `(${item.date.split('-')[0]})` : ''}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                  <button id="btn-popup-edit-${item.id}" title="Modifier le lieu" style="background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; padding: 3px 6px; font-size: 10px; font-weight: 600; cursor: pointer; border-radius: 2px;">
                    ✏️
                  </button>
                  <button id="btn-popup-del-${item.id}" title="Supprimer ce lieu" style="background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; padding: 3px 6px; font-size: 10px; font-weight: 600; cursor: pointer; border-radius: 2px;">
                    🗑️
                  </button>
                  <button id="btn-popup-${item.id}" title="Ouvrir la fiche" style="background: #5C4D3F; color: white; border: none; padding: 3px 7px; font-size: 10px; font-weight: bold; text-transform: uppercase; cursor: pointer; border-radius: 2px;">
                    Fiche
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        setSelectedGroupKey(group.key);
        group.items.forEach(item => {
          const btnFiche = document.getElementById(`btn-popup-${item.id}`);
          if (btnFiche) {
            btnFiche.onclick = () => onSelectPerson(item.person);
          }
          const btnEdit = document.getElementById(`btn-popup-edit-${item.id}`);
          if (btnEdit) {
            btnEdit.onclick = () => setEditingLocationItem({ person: item.person, type: item.type });
          }
          const btnDel = document.getElementById(`btn-popup-del-${item.id}`);
          if (btnDel) {
            btnDel.onclick = () => handleDeleteLocation(item);
          }
        });
      });

      layer.addLayer(marker);
      markersMapRef.current.set(group.key, marker);
      bounds.extend(group.coords);
    });

    if (groupedLocations.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [groupedLocations, onSelectPerson]);

  const handleGroupClick = (group: GroupedLocation) => {
    setSelectedGroupKey(group.key);
    const map = mapInstanceRef.current;
    const marker = markersMapRef.current.get(group.key);

    if (map) {
      map.setView(group.coords, 12, { animate: true });
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col md:flex-row bg-[#F9F6F0] text-[#2D2926] overflow-hidden font-sans">
      
      {/* Side Panel Location List */}
      <div className="w-full md:w-88 bg-[#EFE9DB] border-r border-[#D9D2C2] flex flex-col shrink-0">
        
        <div className="p-4 border-b border-[#D9D2C2] space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-[#D97706]" />
            <h2 className="font-bold font-serif text-[#5C4D3F] text-base">Carte des Ancrages Familiaux</h2>
          </div>

          <p className="text-xs text-[#8C7B6B]">
            Localisation géographique des naissances et décès de vos ancêtres ({groupedLocations.length} lieu{groupedLocations.length > 1 ? 'x' : ''}, {filteredMarkers.length} événement{filteredMarkers.length > 1 ? 's' : ''}).
          </p>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 text-xs bg-white p-1 border border-[#D9D2C2]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 py-1 text-center font-bold transition cursor-pointer ${
                activeFilter === 'all' ? 'bg-[#5C4D3F] text-white' : 'text-[#5C4D3F] hover:bg-[#EFE9DB]'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveFilter('naissance')}
              className={`flex-1 py-1 text-center font-bold transition cursor-pointer ${
                activeFilter === 'naissance' ? 'bg-[#5C4D3F] text-white' : 'text-[#5C4D3F] hover:bg-[#EFE9DB]'
              }`}
            >
              Naissances
            </button>
            <button
              onClick={() => setActiveFilter('deces')}
              className={`flex-1 py-1 text-center font-bold transition cursor-pointer ${
                activeFilter === 'deces' ? 'bg-[#5C4D3F] text-white' : 'text-[#5C4D3F] hover:bg-[#EFE9DB]'
              }`}
            >
              Décès
            </button>
          </div>
        </div>

        {/* Location Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {groupedLocations.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#8C7B6B]">
              Aucun lieu enregistré pour le filtre sélectionné.
            </div>
          ) : (
            groupedLocations.map(group => {
              const isSelected = selectedGroupKey === group.key;

              return (
                <div
                  key={group.key}
                  onClick={() => handleGroupClick(group)}
                  className={`bg-white border p-3 cursor-pointer transition text-xs space-y-2 shadow-xs ${
                    isSelected ? 'border-[#5C4D3F] ring-1 ring-[#5C4D3F] bg-[#F9F6F0]' : 'border-[#D9D2C2] hover:bg-[#F9F6F0]'
                  }`}
                >
                  {/* Location Header */}
                  <div className="flex items-center justify-between border-b border-[#EFE9DB] pb-1.5">
                    <div className="flex items-center space-x-1.5 font-bold text-[#2D2926] font-serif text-sm truncate">
                      <MapPin className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                      <span className="truncate">{group.placeName}</span>
                    </div>
                    <span className="bg-[#5C4D3F] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                      {group.items.length} {group.items.length > 1 ? 'pers.' : 'pers.'}
                    </span>
                  </div>

                  {/* Person List in this location */}
                  <div className="space-y-1.5 pl-1">
                    {group.items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs hover:bg-[#EFE9DB] p-1.5 rounded transition group/row"
                      >
                        <div 
                          className="truncate flex-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPerson(item.person);
                          }}
                        >
                          <span className="font-bold text-[#2D2926] group-hover/row:text-[#B45309]">{item.person.firstName} {item.person.lastName}</span>
                          <span className="text-[10px] text-[#8C7B6B] ml-1.5">
                            ({item.type === 'naissance' ? 'Naissance' : 'Décès'}{item.date ? ` ${item.date.split('-')[0]}` : ''})
                          </span>
                        </div>

                        {/* Inline Actions */}
                        <div className="flex items-center space-x-1 shrink-0 ml-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLocationItem({ person: item.person, type: item.type });
                            }}
                            className="p-1 hover:bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] rounded transition cursor-pointer"
                            title="Modifier ce lieu sur la carte"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLocation(item);
                            }}
                            className="p-1 hover:bg-red-100 text-red-700 border border-red-300 rounded transition cursor-pointer"
                            title="Supprimer ce point géographique"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPerson(item.person);
                            }}
                            className="p-1 text-[#8C7B6B] hover:text-[#2D2926]"
                            title="Voir la fiche"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Main Map Stage */}
      <div className="flex-1 relative bg-[#F9F6F0]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* Inline Location Picker Modal */}
      {editingLocationItem && (
        <LocationPickerModal
          isOpen={!!editingLocationItem}
          onClose={() => setEditingLocationItem(null)}
          title={editingLocationItem.type === 'naissance' 
            ? `Modifier le lieu de naissance de ${editingLocationItem.person.firstName} ${editingLocationItem.person.lastName}`
            : `Modifier le lieu de décès de ${editingLocationItem.person.firstName} ${editingLocationItem.person.lastName}`
          }
          initialPlaceName={editingLocationItem.type === 'naissance' ? editingLocationItem.person.birthPlace : editingLocationItem.person.deathPlace}
          initialCoords={editingLocationItem.type === 'naissance' 
            ? (editingLocationItem.person.birthCoords || lookupCoordinates(editingLocationItem.person.birthPlace))
            : (editingLocationItem.person.deathCoords || lookupCoordinates(editingLocationItem.person.deathPlace))
          }
          onSelectLocation={(newPlaceName, newCoords) => {
            if (!onSavePerson || !editingLocationItem) return;
            const p = editingLocationItem.person;
            const updatedPerson: Person = editingLocationItem.type === 'naissance'
              ? { ...p, birthPlace: newPlaceName, birthCoords: newCoords }
              : { ...p, deathPlace: newPlaceName, deathCoords: newCoords };
            onSavePerson(updatedPerson);
            setEditingLocationItem(null);
          }}
          onRemoveLocation={() => {
            if (!onSavePerson || !editingLocationItem) return;
            const p = editingLocationItem.person;
            const updatedPerson: Person = editingLocationItem.type === 'naissance'
              ? { ...p, birthPlace: '', birthCoords: undefined }
              : { ...p, deathPlace: '', deathCoords: undefined };
            onSavePerson(updatedPerson);
            setEditingLocationItem(null);
          }}
        />
      )}

    </div>
  );
};

