import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { MapPin, Users, Utensils, AlertCircle, Accessibility } from 'lucide-react';

// Custom icons
const createIcon = (color, icon) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 0 8px rgba(0,0,0,0.4);
      ">
        ${icon}
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const athleteZoneIcon = createIcon('#ff6600', '🏅');
const poiIcon = createIcon('#00ffee', '📍');
const foodIcon = createIcon('#ffcc00', '🍕');
const medicalIcon = createIcon('#ff4444', '⚕️');
const accessibilityIcon = createIcon('#9b00ff', '♿');

export default function EventMap({ event, isOpen, onClose, restrictToTicketHolders = false }) {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['user-registration', event?.id],
    queryFn: () => base44.entities.Registration.filter({ event_id: event?.id, created_by: user?.email }),
    enabled: !!user && !!event,
  });

  const hasTicket = registrations.length > 0;

  // Check if user has ticket
  if (restrictToTicketHolders && !hasTicket) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-center">
        <p className="font-mono text-sm text-red-400">🔒 Venue map is only available to ticket holders</p>
      </div>
    );
  }
  const [selectedPOI, setSelectedPOI] = useState(null);

  if (!event || !event.coordinates) return null;

  // Fallback coordinates (Dubai)
  const center = event.coordinates || [25.2048, 55.2708];

  // Sample POI data (can be extended based on event data)
  const pois = [
    { id: 1, name: 'Main Stage', type: 'athlete', position: [center[0] + 0.001, center[1] + 0.001], description: 'Primary performance area' },
    { id: 2, name: 'VIP Seating', type: 'spectator', position: [center[0] - 0.001, center[1] + 0.002], description: 'Premium spectator zone' },
    { id: 3, name: 'Food Court', type: 'food', position: [center[0] + 0.002, center[1] - 0.001], description: 'Food & beverage vendors' },
    { id: 4, name: 'Medical Station', type: 'medical', position: [center[0] - 0.002, center[1] - 0.001], description: 'First aid & medical support' },
    { id: 5, name: 'Accessible Entrance', type: 'accessibility', position: [center[0], center[1] + 0.003], description: 'Wheelchair accessible entry' },
  ];

  // Athlete zones (polygons)
  const athleteZones = [
    {
      id: 'zone-a',
      name: 'Parkour Zone',
      positions: [
        [center[0] + 0.003, center[1]],
        [center[0] + 0.004, center[1] + 0.002],
        [center[0] + 0.002, center[1] + 0.003],
        [center[0], center[1] + 0.001],
      ],
    },
    {
      id: 'zone-b',
      name: 'Skateboarding Zone',
      positions: [
        [center[0] - 0.001, center[1] - 0.002],
        [center[0] + 0.001, center[1] - 0.003],
        [center[0] + 0.003, center[1] - 0.001],
        [center[0] + 0.001, center[1]],
      ],
    },
  ];

  const getIconForPOI = (type) => {
    switch (type) {
      case 'athlete':
        return athleteZoneIcon;
      case 'food':
        return foodIcon;
      case 'medical':
        return medicalIcon;
      case 'accessibility':
        return accessibilityIcon;
      default:
        return poiIcon;
    }
  };

  const getLegendIcon = (type) => {
    switch (type) {
      case 'athlete':
        return <Users size={16} className="text-fire-3" />;
      case 'food':
        return <Utensils size={16} className="text-fire-5" />;
      case 'medical':
        return <AlertCircle size={16} className="text-red-400" />;
      case 'accessibility':
        return <Accessibility size={16} className="text-cyan" />;
      default:
        return <MapPin size={16} className="text-cyan" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6"
    >
      <div className="mb-4">
        <h3 className="heading-fire text-2xl font-black mb-1">EVENT MAP</h3>
        <p className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40">Navigate the venue & explore zones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <div style={{ height: '500px', borderRadius: '0', border: '1px solid rgba(255,100,0,0.2)' }} className="overflow-hidden">
            <MapContainer
              center={center}
              zoom={17}
              style={{ height: '100%', width: '100%' }}
              className="z-10"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />

              {/* Athlete Zones */}
              {athleteZones.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.positions}
                  pathOptions={{
                    fillColor: '#ff6600',
                    color: '#ffcc00',
                    weight: 2,
                    opacity: 0.6,
                    fillOpacity: 0.15,
                  }}
                >
                  <Popup>
                    <div className="bg-cyber-void text-fire-3 p-2 rounded text-sm">
                      <strong>{zone.name}</strong>
                      <p className="text-xs text-fire-3/70 mt-1">Athlete performance area</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}

              {/* POI Markers */}
              {pois.map((poi) => (
                <Marker
                  key={poi.id}
                  position={poi.position}
                  icon={getIconForPOI(poi.type)}
                  eventHandlers={{
                    click: () => setSelectedPOI(poi),
                  }}
                >
                  <Popup>
                    <div className="bg-cyber-void text-fire-3 p-3 rounded min-w-[200px]">
                      <strong className="text-fire-5">{poi.name}</strong>
                      <p className="text-xs text-fire-3/70 mt-1">{poi.description}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Selected POI Details */}
          {selectedPOI && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-fire-3/10 border border-fire-3/20"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getLegendIcon(selectedPOI.type)}</div>
                <div className="flex-1">
                  <div className="font-rajdhani font-bold text-fire-5">{selectedPOI.name}</div>
                  <p className="font-mono text-xs text-fire-3/60 mt-1">{selectedPOI.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPOI(null)}
                  className="text-fire-3/40 hover:text-fire-3 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-black/40 border border-fire-3/10 p-4">
          <div className="font-orbitron font-bold text-sm text-fire-5 mb-3">LEGEND</div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'rgba(255,102,0,0.3)',
                  border: '2px solid #ffcc00',
                  borderRadius: '2px',
                }}
              />
              <span className="font-mono text-[11px] text-fire-3/60">Athlete Zone</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Users size={16} className="text-fire-3" />
              <span className="font-mono text-[11px] text-fire-3/60">Main Stage</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Utensils size={16} className="text-fire-5" />
              <span className="font-mono text-[11px] text-fire-3/60">Food & Drinks</span>
            </div>

            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-400" />
              <span className="font-mono text-[11px] text-fire-3/60">Medical</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Accessibility size={16} className="text-cyan" />
              <span className="font-mono text-[11px] text-fire-3/60">Accessible</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-fire-3/10">
            <p className="font-mono text-[10px] text-fire-3/40 leading-relaxed">
              Click markers for detailed info. Zones indicate performance & spectator areas.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}