import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import TournamentBracket from '../tournament/TournamentBracket';

export default function TournamentManager({ event, onClose }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

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

  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations', event.id],
    queryFn: () => base44.entities.Registration.filter({ 
      event_id: event.id, 
      type: 'athlete',
      status: 'confirmed'
    }),
    initialData: [],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    initialData: [],
  });

  const createTournament = useMutation({
    mutationFn: async (participantCount) => {
      const rounds = Math.ceil(Math.log2(participantCount));
      const newTournament = await base44.entities.Tournament.create({
        event_id: event.id,
        format: 'single_elimination',
        current_round: 1,
        total_rounds: rounds,
        status: 'upcoming'
      });

      // Create first round matches
      const matchesPerRound = Math.pow(2, rounds - 1);
      const firstRoundMatches = [];
      
      for (let i = 0; i < matchesPerRound; i++) {
        const reg1 = registrations[i * 2];
        const reg2 = registrations[i * 2 + 1];
        
        const user1 = users.find(u => u.email === reg1?.email);
        const user2 = users.find(u => u.email === reg2?.email);

        firstRoundMatches.push({
          tournament_id: newTournament.id,
          round_number: 1,
          match_number: i + 1,
          participant1_email: reg1?.email || null,
          participant1_name: user1?.team_name || user1?.nickname || user1?.full_name || 'TBD',
          participant2_email: reg2?.email || null,
          participant2_name: user2?.team_name || user2?.nickname || user2?.full_name || 'TBD',
          status: 'pending'
        });
      }

      await base44.entities.TournamentMatch.bulkCreate(firstRoundMatches);
      return newTournament;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      setCreating(false);
      toast.success('Tournament created');
    },
  });

  const updateMatch = useMutation({
    mutationFn: ({ matchId, data }) => base44.entities.TournamentMatch.update(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      setEditingMatch(null);
      toast.success('Match updated');
    },
  });

  const advanceRound = useMutation({
    mutationFn: async () => {
      const currentRoundMatches = matches.filter(m => m.round_number === tournament.current_round);
      const allCompleted = currentRoundMatches.every(m => m.status === 'completed' && m.winner_email);

      if (!allCompleted) {
        throw new Error('All matches in current round must be completed');
      }

      const nextRound = tournament.current_round + 1;
      if (nextRound > tournament.total_rounds) {
        throw new Error('Tournament is complete');
      }

      // Create next round matches
      const winners = currentRoundMatches.map(m => ({
        email: m.winner_email,
        name: m.winner_name
      }));

      const nextRoundMatches = [];
      for (let i = 0; i < winners.length / 2; i++) {
        const winner1 = winners[i * 2];
        const winner2 = winners[i * 2 + 1];

        nextRoundMatches.push({
          tournament_id: tournament.id,
          round_number: nextRound,
          match_number: i + 1,
          participant1_email: winner1?.email,
          participant1_name: winner1?.name,
          participant2_email: winner2?.email,
          participant2_name: winner2?.name,
          status: 'pending'
        });
      }

      await base44.entities.TournamentMatch.bulkCreate(nextRoundMatches);
      await base44.entities.Tournament.update(tournament.id, { 
        current_round: nextRound,
        status: nextRound === tournament.total_rounds ? 'in_progress' : tournament.status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      toast.success('Advanced to next round');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleUpdateMatch = (winner) => {
    if (!editingMatch) return;
    
    updateMatch.mutate({
      matchId: editingMatch.id,
      data: {
        winner_email: winner === 1 ? editingMatch.participant1_email : editingMatch.participant2_email,
        winner_name: winner === 1 ? editingMatch.participant1_name : editingMatch.participant2_name,
        status: 'completed'
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[1400px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-fire-3/30 hover:text-fire-3"
        >
          <X size={20} />
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2 uppercase">
          TOURNAMENT: {event.title}
        </h2>
        <p className="font-mono text-[10px] text-fire-3/40 tracking-[2px] mb-6 uppercase">
          {registrations.length} Athletes Registered
        </p>

        {!tournament ? (
          <div className="text-center py-12">
            {creating ? (
              <div className="space-y-4">
                <p className="font-mono text-sm text-fire-4/60 mb-4">Creating tournament bracket...</p>
                <button
                  onClick={() => createTournament.mutate(registrations.length)}
                  className="btn-fire text-[11px] py-3 px-6"
                >
                  GENERATE BRACKET ({registrations.length} PARTICIPANTS)
                </button>
                <button
                  onClick={() => setCreating(false)}
                  className="btn-ghost text-[11px] py-3 px-6 ml-3"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="btn-fire text-[11px] py-3 px-6 flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                CREATE TOURNAMENT
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="px-4 py-2 bg-fire-3/10 border border-fire-3/20">
                <span className="font-mono text-xs text-fire-3/40 tracking-[1px] uppercase mr-2">Round:</span>
                <span className="font-orbitron font-bold text-lg text-fire-5">
                  {tournament.current_round} / {tournament.total_rounds}
                </span>
              </div>
              <button
                onClick={() => advanceRound.mutate()}
                disabled={advanceRound.isPending || tournament.current_round >= tournament.total_rounds}
                className="btn-fire text-[11px] py-2 px-5 disabled:opacity-30"
              >
                ADVANCE TO NEXT ROUND
              </button>
            </div>

            <TournamentBracket tournament={tournament} matches={matches} />

            {/* Match Editor */}
            <div className="mt-8 p-6 bg-fire-3/5 border border-fire-3/20">
              <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">UPDATE MATCH RESULT</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select
                  className="cyber-input"
                  onChange={(e) => {
                    const match = matches.find(m => m.id === e.target.value);
                    setEditingMatch(match);
                  }}
                  value={editingMatch?.id || ''}
                >
                  <option value="">Select a match...</option>
                  {matches.filter(m => m.status !== 'completed').map(match => (
                    <option key={match.id} value={match.id}>
                      Round {match.round_number} - Match {match.match_number}: {match.participant1_name} vs {match.participant2_name}
                    </option>
                  ))}
                </select>
              </div>

              {editingMatch && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateMatch(1)}
                    className="btn-fire flex-1 text-[11px] py-3"
                  >
                    {editingMatch.participant1_name} WINS
                  </button>
                  <button
                    onClick={() => handleUpdateMatch(2)}
                    className="btn-fire flex-1 text-[11px] py-3"
                  >
                    {editingMatch.participant2_name} WINS
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}