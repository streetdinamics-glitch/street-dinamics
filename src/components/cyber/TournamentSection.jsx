import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, UserPlus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import InteractiveBracket from '../tournament/InteractiveBracket';
import TournamentRegistrationModal from '../tournament/TournamentRegistrationModal';

export default function TournamentSection({ event }) {
  const [regModalOpen, setRegModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tournament } = useQuery({
    queryKey: ['tournament', event.id],
    queryFn: async () => {
      const tournaments = await base44.entities.Tournament.filter({ event_id: event.id });
      return tournaments[0] || null;
    },
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['tournament-matches', tournament?.id],
    queryFn: () => base44.entities.TournamentMatch.filter({ tournament_id: tournament.id }),
    enabled: !!tournament?.id,
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myRegistration } = useQuery({
    queryKey: ['my-tournament-registration', tournament?.id],
    queryFn: async () => {
      const user = await base44.auth.me();
      const registrations = await base44.entities.TournamentParticipant.filter({
        tournament_id: tournament.id,
        user_email: user.email,
      });
      return registrations[0] || null;
    },
    enabled: !!tournament && !!user,
  });

  if (!tournament) {
    return null;
  }

  const canRegister = event.status === 'upcoming' && !myRegistration;

  const handleMatchUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['tournament-matches', tournament?.id] });
    queryClient.invalidateQueries({ queryKey: ['tournament', event.id] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-fire-5" />
        <h3 className="font-orbitron font-bold text-xl text-fire-gradient tracking-[2px] uppercase">
          TOURNAMENT BRACKET
        </h3>
      </div>

      <div className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 clip-cyber p-6">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="font-mono text-sm text-fire-4/60">
            Round <span className="text-fire-5 font-bold">{tournament.current_round}</span> of {tournament.total_rounds}
          </div>
          <div className="flex items-center gap-3">
            {myRegistration && (
              <div className="px-3 py-1.5 rounded border border-cyan/30 bg-cyan/10 text-xs font-mono tracking-[1px] text-cyan">
                ✓ REGISTERED
              </div>
            )}
            {canRegister && (
              <button
                onClick={() => setRegModalOpen(true)}
                className="btn-fire text-[10px] py-2 px-4 flex items-center gap-2"
              >
                <UserPlus size={14} />
                REGISTER NOW
              </button>
            )}
            <div className={`px-3 py-1 text-xs font-mono tracking-[1px] border ${
              tournament.status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
              tournament.status === 'in_progress' ? 'bg-fire-3/10 border-fire-3/30 text-fire-3' :
              'bg-fire-3/5 border-fire-3/20 text-fire-3/40'
            }`}>
              {tournament.status.toUpperCase()}
            </div>
          </div>
        </div>

        <InteractiveBracket tournament={tournament} matches={matches} onMatchUpdate={handleMatchUpdate} />
      </div>

      {regModalOpen && (
        <TournamentRegistrationModal
          event={event}
          tournament={tournament}
          onClose={() => setRegModalOpen(false)}
          onSuccess={() => setRegModalOpen(false)}
        />
      )}
    </motion.div>
  );
}