import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../translations';

export default function UserProfile({ lang, onClose }) {
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState('profile');

  const { data: user } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => base44.auth.me(),
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Registration.filter({ created_by: u.email });
    },
    initialData: [],
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['my-tokens'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.TokenOwnership.filter({ created_by: u.email });
    },
    initialData: [],
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['my-bets'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Bet.filter({ created_by: u.email });
    },
    initialData: [],
  });

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <div className="relative w-full max-w-[900px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-auto">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3">
          ✕ CLOSE
        </button>

        {/* Header */}
        <div className="flex items-start gap-6 mb-8 pb-6 border-b border-fire-3/10">
          <div className="w-20 h-20 rounded-full bg-fire-3/10 border border-fire-3/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">
              {user.full_name}
            </h2>
            <p className="font-mono text-[11px] tracking-[2px] text-fire-3/40 mb-2">{user.email}</p>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-[9px] font-mono tracking-[2px] uppercase border ${
                user.user_type === 'athlete' 
                  ? 'border-fire-3/40 text-fire-4 bg-fire-3/5'
                  : 'border-cyan/40 text-cyan bg-cyan/5'
              }`}>
                {user.user_type || 'spectator'}
              </span>
              {user.athlete_profile?.verification_status === 'verified' && (
                <span className="px-3 py-1 text-[9px] font-mono tracking-[2px] uppercase border border-green-500/40 text-green-400 bg-green-500/5">
                  ✓ VERIFIED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-fire-3/10 pb-0">
          {['profile', 'events', 'tokens', 'bets'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-orbitron text-[10px] font-bold tracking-[2px] uppercase px-4 py-2 transition-all ${
                activeTab === tab
                  ? 'text-fire-4 border-b-2 border-fire-3'
                  : 'text-fire-3/30 hover:text-fire-3/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/30 mb-1">Phone</div>
                <div className="text-fire-4/60">{user.phone || 'Not set'}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/30 mb-1">Date of Birth</div>
                <div className="text-fire-4/60">{user.date_of_birth || 'Not set'}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/30 mb-1">Country</div>
                <div className="text-fire-4/60">{user.country || 'Not set'}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/30 mb-1">City</div>
                <div className="text-fire-4/60">{user.city || 'Not set'}</div>
              </div>
            </div>

            {user.athlete_profile && (
              <div className="mt-6 p-4 bg-fire-3/5 border border-fire-3/10">
                <div className="font-orbitron text-sm font-bold tracking-[2px] text-fire-3 mb-3">ATHLETE PROFILE</div>
                <div className="mb-3">
                  <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/30 mb-1">Sports</div>
                  <div className="flex gap-2 flex-wrap">
                    {user.athlete_profile.sports?.map((sport, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-fire-3/10 border border-fire-3/20 text-fire-4">
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
                {user.athlete_profile.bio && (
                  <div>
                    <div className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/30 mb-1">Bio</div>
                    <div className="text-sm text-fire-4/60 leading-relaxed">{user.athlete_profile.bio}</div>
                  </div>
                )}
              </div>
            )}

            {user.spectator_profile && (
              <div className="mt-6 p-4 bg-cyan/5 border border-cyan/10">
                <div className="font-orbitron text-sm font-bold tracking-[2px] text-cyan mb-3">SPECTATOR PROFILE</div>
                <div>
                  <div className="font-mono text-[9px] tracking-[2px] uppercase text-cyan/40 mb-1">Favorite Sports</div>
                  <div className="flex gap-2 flex-wrap">
                    {user.spectator_profile.favorite_sports?.map((sport, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-cyan/10 border border-cyan/20 text-cyan">
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            {registrations.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-3xl block mb-2">🏅</span>
                <div className="font-mono text-xs text-fire-3/30">No event registrations yet</div>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map(reg => (
                  <div key={reg.id} className="p-4 bg-fire-3/5 border border-fire-3/10 flex justify-between items-center">
                    <div>
                      <div className="font-rajdhani font-bold text-fire-4 mb-1">{reg.type === 'athlete' ? '🏅 Athlete' : '🎫 Spectator'}</div>
                      <div className="font-mono text-xs text-fire-3/40">Ticket: {reg.ticket_code}</div>
                    </div>
                    <div className={`px-3 py-1 text-[9px] font-mono tracking-[2px] uppercase border ${
                      reg.status === 'confirmed' ? 'border-green-500/40 text-green-400' : 'border-fire-3/40 text-fire-4'
                    }`}>
                      {reg.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <div>
            {tokens.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-3xl block mb-2">🎫</span>
                <div className="font-mono text-xs text-fire-3/30">No athlete tokens owned</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tokens.map(token => (
                  <div key={token.id} className="p-4 bg-fire-3/5 border border-fire-3/10">
                    <div className="font-rajdhani font-bold text-lg text-fire-4 mb-2">{token.athlete_name}</div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs uppercase font-mono tracking-[2px] ${
                        token.token_tier === 'legendary' ? 'text-purple-400' :
                        token.token_tier === 'rare' ? 'text-fire-5' :
                        token.token_tier === 'uncommon' ? 'text-cyan' : 'text-fire-3/60'
                      }`}>
                        {token.token_tier}
                      </span>
                      <span className="text-xs text-fire-3/40">€{token.purchase_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bets Tab */}
        {activeTab === 'bets' && (
          <div>
            {bets.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-3xl block mb-2">🎯</span>
                <div className="font-mono text-xs text-fire-3/30">No active predictions</div>
              </div>
            ) : (
              <div className="space-y-3">
                {bets.map(bet => (
                  <div key={bet.id} className="p-4 bg-fire-3/5 border border-fire-3/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-rajdhani font-bold text-fire-4">{bet.athlete_name}</div>
                        <div className="font-mono text-xs text-fire-3/40">{bet.market}: {bet.prediction}</div>
                      </div>
                      <div className={`px-3 py-1 text-[9px] font-mono tracking-[2px] uppercase border ${
                        bet.status === 'won' ? 'border-green-500/40 text-green-400' :
                        bet.status === 'lost' ? 'border-red-500/40 text-red-400' :
                        'border-fire-3/40 text-fire-4'
                      }`}>
                        {bet.status}
                      </div>
                    </div>
                    {bet.status === 'won' && bet.prize && (
                      <div className="text-xs text-fire-5">🎁 Prize: {bet.prize}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}