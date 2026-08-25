import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Search, Check, Target, Trash2 } from 'lucide-react';
import { lookupCoordinates, getCitySuggestions, CityRef, CITIES_DATABASE } from '../utils/genealogy';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (placeName: string, coords: [number, number]) => void;
  onRemoveLocation?: () => void;
  initialPlaceName?: string;
  initialCoords?: [number, number];
  title: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onRemoveLocation,
  initialPlaceName = '',
  initialCoords,
  title
}) => {
  const [placeName, setPlaceName] = useState(initialPlaceName);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    initialCoords || lookupCoordinates(initialPlaceName) || [46.603354, 1.888334]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CityRef[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      const name = initialPlaceName || '';
      setPlaceName(name);
      const coords = initialCoords || lookupCoordinates(name) || [46.603354, 1.888334];
      setSelectedCoords(coords);
      setSearchQuery('');
      setSuggestions([]);
    }
  }, [isOpen, initialPlaceName, initialCoords]);

  // Leaflet map setup
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Small delay to ensure modal container size is computed
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const center = selectedCoords || [46.603354, 1.888334];
        const zoom = selectedCoords && selectedCoords[0] !== 46.603354 ? 12 : 6;

        const map = L.map(mapContainerRef.current, {
          center,
          zoom,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Custom Leaflet icon to prevent broken default image paths
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="
            background-color: #D97706;
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: -14px;
            margin-top: -28px;
          ">
            <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        if (selectedCoords) {
          const marker = L.marker(selectedCoords, {
            draggable: true,
            icon: customIcon,
          }).addTo(map);

          marker.on('dragend', () => {
            const latLng = marker.getLatLng();
            setSelectedCoords([latLng.lat, latLng.lng]);
          });

          markerRef.current = marker;
        }

        // Map Click handler
        map.on('click', (e: L.LeafletMouseEvent) => {
          const newCoords: [number, number] = [e.latlng.lat, e.latlng.lng];
          setSelectedCoords(newCoords);

          if (markerRef.current) {
            markerRef.current.setLatLng(e.latlng);
          } else if (mapInstanceRef.current) {
            const marker = L.marker(newCoords, {
              draggable: true,
              icon: customIcon,
            }).addTo(mapInstanceRef.current);

            marker.on('dragend', () => {
              const latLng = marker.getLatLng();
              setSelectedCoords([latLng.lat, latLng.lng]);
            });

            markerRef.current = marker;
          }
        });
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (selectedCoords) {
          mapInstanceRef.current.setView(selectedCoords, selectedCoords[0] === 46.603354 ? 6 : 13);
          if (markerRef.current) {
            markerRef.current.setLatLng(selectedCoords);
          }
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Clean up map when modal closes completely
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const suggs = getCitySuggestions(val, 6);
    setSuggestions(suggs);
    setShowSearchDropdown(suggs.length > 0);
  };

  const handleSelectCitySuggestion = (city: CityRef) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    if (!placeName) {
      setPlaceName(city.label);
    }
    setSelectedCoords(city.coords);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(city.coords, 13);
      if (markerRef.current) {
        markerRef.current.setLatLng(city.coords);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedCoords) return;
    const finalName = placeName.trim() || 'Lieu personnalisé sur la carte';
    onSelectLocation(finalName, selectedCoords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
      <div className="bg-[#F9F6F0] w-full max-w-2xl border border-[#D9D2C2] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#5C4D3F] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-[#D97706]" />
            <h3 className="font-serif font-bold text-lg text-[#F9F6F0]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#D9D2C2] hover:text-white p-1 rounded transition cursor-pointer"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions & Search bar */}
        <div className="p-4 bg-[#EFE9DB] border-b border-[#D9D2C2] space-y-3 shrink-0">
          <p className="text-xs text-[#8C7B6B]">
            💡 <strong>Cliquez n'importe où sur la carte</strong> ou faites glisser l'épingle pour positionner exactement le village, le hameau ou le lieu-dit. Vous pouvez également rechercher une ville proche ci-dessous.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Quick city search */}
            <div className="relative flex-1">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-[#8C7B6B]" />
                <input
                  type="text"
                  placeholder="Centrer la carte sur une ville (ex: Senlis, Arras...)"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchQuery) setShowSearchDropdown(true);
                  }}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#5C4D3F]"
                />
              </div>

              {showSearchDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#D9D2C2] shadow-lg max-h-40 overflow-y-auto divide-y divide-[#EFE9DB] text-xs">
                  {suggestions.map((city, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectCitySuggestion(city);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#F9F6F0] flex items-center justify-between text-[#2D2926]"
                    >
                      <span>{city.label}</span>
                      <Target className="h-3.5 w-3.5 text-[#D97706]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[340px] bg-[#EFE9DB]">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

          {/* Floating coordinates badge */}
          {selectedCoords && (
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 border border-[#D9D2C2] px-3 py-1.5 shadow-md text-[11px] font-mono text-[#5C4D3F] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#D97706]" />
              <span>GPS : {selectedCoords[0].toFixed(5)}, {selectedCoords[1].toFixed(5)}</span>
            </div>
          )}
        </div>

        {/* Footer with Place Name Input & Validation */}
        <div className="p-4 bg-white border-t border-[#D9D2C2] space-y-3 shrink-0">
          <div>
            <label className="block text-xs text-[#8C7B6B] font-bold uppercase mb-1">
              Nom du lieu ou village à enregistrer
            </label>
            <input
              type="text"
              placeholder="Ex: Hameau de Raray, Village de Gerberoy, Senlis..."
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5C4D3F]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {onRemoveLocation ? (
              <button
                type="button"
                onClick={() => {
                  onRemoveLocation();
                  onClose();
                }}
                className="px-3 py-2 border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold uppercase flex items-center space-x-1 transition cursor-pointer"
                title="Supprimer ce point géographique"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                <span>Supprimer le lieu</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#D9D2C2] text-[#5C4D3F] hover:bg-[#EFE9DB] text-xs font-bold uppercase transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 bg-[#5C4D3F] text-white hover:bg-[#4A3E33] text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
              >
                <Check className="h-4 w-4 text-[#D97706]" />
                <span>Valider cet emplacement</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
