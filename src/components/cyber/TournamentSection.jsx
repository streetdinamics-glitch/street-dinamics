import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TournamentBracket from '../tournament/TournamentBracket';

export default function TournamentSection({ event }) {
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

  if (!tournament) {
    return null;
  }

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
        <div className="mb-4 flex items-center justify-between">
          <div className="font-mono text-sm text-fire-4/60">
            Round <span className="text-fire-5 font-bold">{tournament.current_round}</span> of {tournament.total_rounds}
          </div>
          <div className={`px-3 py-1 text-xs font-mono tracking-[1px] border ${
            tournament.status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
            tournament.status === 'in_progress' ? 'bg-fire-3/10 border-fire-3/30 text-fire-3' :
            'bg-fire-3/5 border-fire-3/20 text-fire-3/40'
          }`}>
            {tournament.status.toUpperCase()}
          </div>
        </div>

        <TournamentBracket tournament={tournament} matches={matches} />
      </div>
    </motion.div>
  );
}