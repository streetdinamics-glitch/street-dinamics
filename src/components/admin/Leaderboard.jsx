import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Leaderboard({ onClose, lang }) {
  const { data: stats = [] } = useQuery({
    queryKey: ['athlete-stats-leaderboard'],
    queryFn: () => base44.entities.AthleteStats.list('-performance_rating', 50),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['verified-athletes'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-created_date', 100);
      return allUsers.filter(u => u.user_type === 'athlete' && u.athlete_profile?.verification_status === 'verified');
    },
  });

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <div className="relative w-full max-w-[1000px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-6 md:p-8 my-auto">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3">
          ✕ CLOSE
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-6">
          🏆 ATHLETE LEADERBOARD
        </h2>

        {/* Verified Athletes */}
        <div className="mb-8">
          <h3 className="font-orbitron font-bold text-lg text-green-400 mb-4">
            ✓ VERIFIED ATHLETES ({users.length})
          </h3>
          {users.length === 0 ? (
            <p className="text-center py-8 font-mono text-xs text-fire-3/30">No verified athletes yet</p>
          ) : (
            <div className="space-y-3">
              {users.map((user, idx) => (
                <div key={user.id} className="p-4 bg-green-500/5 border border-green-500/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl">🏅</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-orbitron font-bold text-base text-green-400">
                      {user.full_name}
                    </div>
                    <div className="font-mono text-xs text-green-400/60">
                      {user.athlete_profile?.sports?.join(', ') || 'No sports listed'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs text-green-400/60">
                      {user.country || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Stats */}
        {stats.length > 0 && (
          <div>
            <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">
              📊 TOP PERFORMERS
            </h3>
            <div className="space-y-3">
              {stats.slice(0, 10).map((stat, idx) => (
                <div key={stat.id} className="p-4 bg-fire-3/5 border border-fire-3/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-fire-3/20 flex items-center justify-center">
                    <span className="font-orbitron font-black text-fire-4">#{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-orbitron font-bold text-base text-fire-4">
                      {stat.athlete_name}
                    </div>
                    <div className="font-mono text-xs text-fire-3/40">
                      {stat.sport} • {stat.events_participated} events • {stat.wins} wins
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-orbitron font-bold text-lg text-fire-5">
                      {stat.performance_rating}
                    </div>
                    <div className="font-mono text-[8px] text-fire-3/40 tracking-[2px]">
                      RATING
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}