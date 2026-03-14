import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function NFTDropManager({ event }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    athlete_email: '',
    athlete_name: '',
    event_moment: '',
    rarity: 'common',
    mint_price: '',
    total_supply: '',
    image_url: '',
    drop_date: '',
  });

  const queryClient = useQueryClient();

  const { data: nftCards = [] } = useQuery({
    queryKey: ['event-nft-cards', event.id],
    queryFn: () => base44.entities.NFTCollectionCard.filter({ event_id: event.id }),
    initialData: [],
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations', event.id],
    queryFn: () => base44.entities.Registration.filter({ 
      event_id: event.id,
      type: 'athlete',
      status: 'confirmed'
    }),
    initialData: [],
  });

  const createNFTMutation = useMutation({
    mutationFn: async (data) => {
      const cardNumber = nftCards.length + 1;
      
      return await base44.entities.NFTCollectionCard.create({
        event_id: event.id,
        card_number: cardNumber,
        ...data,
        mint_price: parseFloat(data.mint_price),
        total_supply: parseInt(data.total_supply),
        minted_count: 0,
        current_floor_price: parseFloat(data.mint_price),
        status: new Date(data.drop_date) > new Date() ? 'upcoming' : 'live',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-nft-cards'] });
      queryClient.invalidateQueries({ queryKey: ['nft-cards'] });
      setShowForm(false);
      setFormData({
        athlete_email: '',
        athlete_name: '',
        event_moment: '',
        rarity: 'common',
        mint_price: '',
        total_supply: '',
        image_url: '',
        drop_date: '',
      });
      toast.success('NFT drop created!');
    },
  });

  const deleteNFTMutation = useMutation({
    mutationFn: (id) => base44.entities.NFTCollectionCard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-nft-cards'] });
      queryClient.invalidateQueries({ queryKey: ['nft-cards'] });
      toast.success('NFT drop deleted!');
    },
  });

  const activateDropMutation = useMutation({
    mutationFn: (id) => base44.entities.NFTCollectionCard.update(id, { status: 'live' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-nft-cards'] });
      queryClient.invalidateQueries({ queryKey: ['nft-cards'] });
      toast.success('Drop is now LIVE!');
    },
  });

  const handleSubmit = () => {
    if (!formData.athlete_email || !formData.event_moment || !formData.mint_price || !formData.total_supply) {
      toast.error('Please fill in all required fields');
      return;
    }
    createNFTMutation.mutate(formData);
  };

  const selectAthlete = (reg) => {
    setFormData({
      ...formData,
      athlete_email: reg.email,
      athlete_name: `${reg.first_name} ${reg.last_name}`,
    });
  };

  const raritySupplyRecommendations = {
    common: 100,
    rare: 50,
    epic: 25,
    legendary: 10,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron font-bold text-xl text-fire-5 flex items-center gap-2">
          <Sparkles size={20} />
          NFT DROP MANAGER
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-fire text-xs flex items-center gap-2"
        >
          <Plus size={14} />
          CREATE DROP
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-fire-3/5 border border-fire-3/20 p-6"
        >
          <div className="space-y-4">
            {/* Athlete Selection */}
            <div>
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                SELECT ATHLETE
              </label>
              {formData.athlete_name ? (
                <div className="p-3 bg-fire-3/10 border border-fire-3/20 flex items-center justify-between">
                  <div>
                    <div className="font-rajdhani font-bold text-fire-5">{formData.athlete_name}</div>
                    <div className="text-xs text-fire-3/60">{formData.athlete_email}</div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, athlete_email: '', athlete_name: '' })}
                    className="text-xs text-red-400"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {registrations.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => selectAthlete(reg)}
                      className="w-full text-left p-3 bg-fire-3/5 hover:bg-fire-3/10 border border-fire-3/10 text-sm"
                    >
                      <div className="font-rajdhani font-semibold text-fire-4">
                        {reg.first_name} {reg.last_name}
                      </div>
                      <div className="text-xs text-fire-3/60">{reg.sport}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Event Moment */}
            <div>
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                HISTORIC MOMENT *
              </label>
              <input
                type="text"
                value={formData.event_moment}
                onChange={(e) => setFormData({ ...formData, event_moment: e.target.value })}
                placeholder="e.g., 'Championship Winning Goal', 'Perfect 10 Landing'"
                className="cyber-input"
              />
            </div>

            {/* Rarity */}
            <div>
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                RARITY LEVEL
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(raritySupplyRecommendations).map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => setFormData({ 
                      ...formData, 
                      rarity,
                      total_supply: raritySupplyRecommendations[rarity].toString()
                    })}
                    className={`p-3 border text-center transition-all ${
                      formData.rarity === rarity
                        ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                        : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40'
                    }`}
                  >
                    <div className="font-rajdhani font-bold text-sm capitalize">{rarity}</div>
                    <div className="text-xs text-fire-3/60 mt-1">~{raritySupplyRecommendations[rarity]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Mint Price */}
              <div>
                <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                  MINT PRICE (EUR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.mint_price}
                  onChange={(e) => setFormData({ ...formData, mint_price: e.target.value })}
                  placeholder="10.00"
                  className="cyber-input"
                />
              </div>

              {/* Total Supply */}
              <div>
                <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                  TOTAL SUPPLY *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.total_supply}
                  onChange={(e) => setFormData({ ...formData, total_supply: e.target.value })}
                  placeholder="100"
                  className="cyber-input"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                IMAGE URL (Optional)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="cyber-input"
              />
            </div>

            {/* Drop Date */}
            <div>
              <label className="font-orbitron text-sm font-bold text-fire-4 mb-2 block">
                DROP DATE *
              </label>
              <input
                type="datetime-local"
                value={formData.drop_date}
                onChange={(e) => setFormData({ ...formData, drop_date: e.target.value })}
                className="cyber-input"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="btn-ghost flex-1"
              >
                CANCEL
              </button>
              <button
                onClick={handleSubmit}
                disabled={createNFTMutation.isPending}
                className="btn-fire flex-1"
              >
                {createNFTMutation.isPending ? 'CREATING...' : 'CREATE DROP'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* NFT Cards List */}
      <div className="space-y-3">
        {nftCards.map((card) => (
          <div key={card.id} className="bg-fire-3/5 border border-fire-3/20 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-orbitron font-bold text-lg text-fire-5">
                    #{card.card_number} {card.athlete_name}
                  </div>
                  <div className={`px-2 py-1 border text-xs font-mono uppercase ${
                    card.rarity === 'legendary' ? 'border-fire-5/40 text-fire-6 bg-fire-5/10' :
                    card.rarity === 'epic' ? 'border-purple-500/40 text-purple-400 bg-purple-500/10' :
                    card.rarity === 'rare' ? 'border-cyan/40 text-cyan bg-cyan/10' :
                    'border-fire-3/40 text-fire-3 bg-fire-3/10'
                  }`}>
                    {card.rarity}
                  </div>
                  <div className={`px-2 py-1 border text-xs font-mono uppercase ${
                    card.status === 'live' ? 'border-green-500/40 text-green-400 bg-green-500/10' :
                    card.status === 'sold_out' ? 'border-red-500/40 text-red-400 bg-red-500/10' :
                    'border-fire-3/40 text-fire-3/60 bg-fire-3/5'
                  }`}>
                    {card.status}
                  </div>
                </div>
                
                <div className="font-rajdhani text-sm text-fire-4/80 mb-2">{card.event_moment}</div>
                
                <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                  <div>
                    <div className="text-fire-3/60">Price</div>
                    <div className="text-fire-4 font-semibold">€{card.mint_price}</div>
                  </div>
                  <div>
                    <div className="text-fire-3/60">Minted</div>
                    <div className="text-fire-4 font-semibold">{card.minted_count} / {card.total_supply}</div>
                  </div>
                  <div>
                    <div className="text-fire-3/60">Drop Date</div>
                    <div className="text-fire-4 font-semibold">
                      {new Date(card.drop_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {card.status === 'upcoming' && (
                  <button
                    onClick={() => activateDropMutation.mutate(card.id)}
                    className="btn-fire text-xs py-2 px-4"
                  >
                    GO LIVE
                  </button>
                )}
                <button
                  onClick={() => deleteNFTMutation.mutate(card.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}