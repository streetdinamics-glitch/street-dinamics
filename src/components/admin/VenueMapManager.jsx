import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Map, Save, Power } from 'lucide-react';
import { toast } from 'sonner';

export default function VenueMapManager({ event }) {
  const [mapEnabled, setMapEnabled] = useState(event?.venue_map_enabled || false);
  const [latitude, setLatitude] = useState(event?.venue_latitude || '');
  const [longitude, setLongitude] = useState(event?.venue_longitude || '');
  const [mapData, setMapData] = useState(event?.venue_map_data || { zones: [], pois: [] });
  const queryClient = useQueryClient();

  const updateVenueMap = useMutation({
    mutationFn: (data) => base44.entities.Event.update(event.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Venue map settings saved');
    },
    onError: (err) => {
      toast.error('Failed to save: ' + err.message);
    },
  });

  const handleSave = () => {
    if (!latitude || !longitude) {
      toast.error('Please enter venue coordinates');
      return;
    }

    updateVenueMap.mutate({
      venue_latitude: parseFloat(latitude),
      venue_longitude: parseFloat(longitude),
      venue_map_enabled: mapEnabled,
      venue_map_data: mapData,
    });
  };

  const addZone = () => {
    setMapData({
      ...mapData,
      zones: [
        ...(mapData.zones || []),
        { id: `zone-${Date.now()}`, name: `Zone ${(mapData.zones?.length || 0) + 1}`, color: '#ff4400', type: 'general' },
      ],
    });
  };

  const addPOI = () => {
    setMapData({
      ...mapData,
      pois: [
        ...(mapData.pois || []),
        { id: `poi-${Date.now()}`, name: 'New POI', type: 'amenity', lat: latitude, lng: longitude },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Map size={24} className="text-fire-3" />
        <div>
          <h3 className="font-orbitron font-bold text-lg text-fire-4">Venue Map Manager</h3>
          <p className="font-mono text-xs text-fire-3/60">Configure venue layout visible to ticket holders</p>
        </div>
      </div>

      {/* Enable Map Toggle */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-5 flex items-center justify-between">
        <div>
          <div className="font-rajdhani font-bold text-fire-4 mb-1">Enable Venue Map</div>
          <p className="font-mono text-xs text-fire-3/60">Make map visible to attendees with tickets</p>
        </div>
        <button
          onClick={() => setMapEnabled(!mapEnabled)}
          className={`p-2 border transition-all ${
            mapEnabled
              ? 'border-green-500/40 bg-green-500/10 text-green-400'
              : 'border-fire-3/40 bg-fire-3/5 text-fire-3/40'
          }`}
        >
          <Power size={20} />
        </button>
      </div>

      {mapEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Venue Coordinates */}
          <div className="bg-black/40 border border-fire-3/10 p-5">
            <h4 className="font-rajdhani font-bold text-fire-4 mb-4">Venue Coordinates</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 43.7696"
                  className="cyber-input w-full"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., 11.2560"
                  className="cyber-input w-full"
                />
              </div>
            </div>
            <p className="font-mono text-[10px] text-fire-3/40 mt-2">
              💡 Use Google Maps to find coordinates (right-click → copy coordinates)
            </p>
          </div>

          {/* Zones */}
          <div className="bg-black/40 border border-fire-3/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-rajdhani font-bold text-fire-4">Seating Zones</h4>
              <button
                onClick={addZone}
                className="btn-cyan text-[9px] py-1.5 px-3"
              >
                + Add Zone
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {mapData.zones?.map((zone, idx) => (
                <div key={zone.id} className="bg-black/50 border border-fire-3/10 p-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={zone.color}
                    onChange={(e) => {
                      const updated = [...mapData.zones];
                      updated[idx].color = e.target.value;
                      setMapData({ ...mapData, zones: updated });
                    }}
                    className="w-8 h-8 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={zone.name}
                    onChange={(e) => {
                      const updated = [...mapData.zones];
                      updated[idx].name = e.target.value;
                      setMapData({ ...mapData, zones: updated });
                    }}
                    className="cyber-input flex-1 text-sm"
                    placeholder="Zone name"
                  />
                  <button
                    onClick={() => {
                      setMapData({
                        ...mapData,
                        zones: mapData.zones.filter((_, i) => i !== idx),
                      });
                    }}
                    className="btn-ghost text-[9px] py-1 px-2 border-red-500/40 text-red-400 hover:bg-red-500/5"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {!mapData.zones?.length && (
                <p className="font-mono text-[11px] text-fire-3/40 py-4 text-center">No zones added yet</p>
              )}
            </div>
          </div>

          {/* POIs (Points of Interest) */}
          <div className="bg-black/40 border border-fire-3/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-rajdhani font-bold text-fire-4">Points of Interest</h4>
              <button
                onClick={addPOI}
                className="btn-cyan text-[9px] py-1.5 px-3"
              >
                + Add POI
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {mapData.pois?.map((poi, idx) => (
                <div key={poi.id} className="bg-black/50 border border-fire-3/10 p-3 flex items-center gap-2">
                  <select
                    value={poi.type}
                    onChange={(e) => {
                      const updated = [...mapData.pois];
                      updated[idx].type = e.target.value;
                      setMapData({ ...mapData, pois: updated });
                    }}
                    className="cyber-input text-sm w-24"
                  >
                    <option value="amenity">🍽️ Amenity</option>
                    <option value="medical">🚑 Medical</option>
                    <option value="accessibility">♿ Accessibility</option>
                    <option value="restroom">🚻 Restroom</option>
                  </select>
                  <input
                    type="text"
                    value={poi.name}
                    onChange={(e) => {
                      const updated = [...mapData.pois];
                      updated[idx].name = e.target.value;
                      setMapData({ ...mapData, pois: updated });
                    }}
                    className="cyber-input flex-1 text-sm"
                    placeholder="POI name"
                  />
                  <button
                    onClick={() => {
                      setMapData({
                        ...mapData,
                        pois: mapData.pois.filter((_, i) => i !== idx),
                      });
                    }}
                    className="btn-ghost text-[9px] py-1 px-2 border-red-500/40 text-red-400 hover:bg-red-500/5"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {!mapData.pois?.length && (
                <p className="font-mono text-[11px] text-fire-3/40 py-4 text-center">No POIs added yet</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={updateVenueMap.isPending || !latitude || !longitude}
          className="btn-fire flex items-center gap-2 py-3 px-6 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {updateVenueMap.isPending ? 'Saving...' : 'Save Venue Map'}
        </button>
      </div>
    </div>
  );
}