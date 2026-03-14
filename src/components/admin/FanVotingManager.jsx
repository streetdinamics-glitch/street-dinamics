import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, Trophy, Award, User } from 'lucide-react';
import { toast } from 'sonner';

export default function FanVotingManager({ event }) {
  const [showMatchupForm, setShowMatchupForm] = useState(false);
  const [showPerformanceForm, setShowPerformanceForm] = useState(false);
  const [matchupData, setMatchupData] = useState({
    matchup_title: '',
    athlete1_email: '',
    athlete1_name: '',
    athlete1_discipline: '',
    athlete2_email: '',
    athlete2_name: '',
    athlete2_discipline: '',
  });
  const [performanceData, setPerformanceData] = useState({
    athlete_email: '',
    athlete_name: '',
    discipline: '',
    performance_description: '',
  });

  const queryClient = useQueryClient();

  const { data: matchups = [] } = useQuery({
    queryKey: ['event-matchups', event.id],
    queryFn: () => base44.entities.EventMatchup.filter({ event_id: event.id }),
    initialData: [],
  });

  const { data: nominees = [] } = useQuery({
    queryKey: ['performance-nominees', event.id],
    queryFn: () => base44.entities.PerformanceNominee.filter({ event_id: event.id }),
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

  const createMatchupMutation = useMutation({
    mutationFn: (data) => base44.entities.EventMatchup.create({
      event_id: event.id,
      ...data,
      status: 'upcoming',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-matchups'] });
      setShowMatchupForm(false);
      setMatchupData({
        matchup_title: '',
        athlete1_email: '',
        athlete1_name: '',
        athlete1_discipline: '',
        athlete2_email: '',
        athlete2_name: '',
        athlete2_discipline: '',
      });
      toast.success('Matchup created!');
    },
  });

  const deleteMatchupMutation = useMutation({
    mutationFn: (id) => base44.entities.EventMatchup.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-matchups'] });
      toast.success('Matchup deleted!');
    },
  });

  const createNomineeMutation = useMutation({
    mutationFn: (data) => base44.entities.PerformanceNominee.create({
      event_id: event.id,
      ...data,
      nominated_at: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-nominees'] });
      setShowPerformanceForm(false);
      setPerformanceData({
        athlete_email: '',
        athlete_name: '',
        discipline: '',
        performance_description: '',
      });
      toast.success('Nominee added!');
    },
  });

  const deleteNomineeMutation = useMutation({
    mutationFn: (id) => base44.entities.PerformanceNominee.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-nominees'] });
      toast.success('Nominee removed!');
    },
  });

  const selectAthlete = (field, registration) => {
    setMatchupData({
      ...matchupData,
      [`${field}_email`]: registration.email,
      [`${field}_name`]: `${registration.first_name} ${registration.last_name}`,
      [`${field}_discipline`]: registration.sport,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron font-bold text-xl text-fire-5">FAN VOTING MANAGER</h3>
      </div>

      {/* Matchups Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-orbitron font-bold text-fire-4 flex items-center gap-2">
            <Trophy size={18} />
            MATCHUPS
          </h4>
          <button
            onClick={() => setShowMatchupForm(!showMatchupForm)}
            className="btn-fire text-xs flex items-center gap-2"
          >
            <Plus size={14} />
            ADD MATCHUP
          </button>
        </div>

        {showMatchupForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-fire-3/5 border border-fire-3/20 p-4 mb-4"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Matchup Title (e.g., 'Semi-Final 1')"
                value={matchupData.matchup_title}
                onChange={(e) => setMatchupData({ ...matchupData, matchup_title: e.target.value })}
                className="cyber-input"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-fire-3/10 border border-fire-3/20 p-3">
                  <div className="font-mono text-xs text-fire-3/60 mb-2">ATHLETE 1</div>
                  {matchupData.athlete1_name ? (
                    <div className="mb-2">
                      <div className="font-rajdhani font-semibold text-fire-5">{matchupData.athlete1_name}</div>
                      <div className="text-xs text-fire-3/60">{matchupData.athlete1_discipline}</div>
                      <button
                        onClick={() => setMatchupData({
                          ...matchupData,
                          athlete1_email: '',
                          athlete1_name: '',
                          athlete1_discipline: '',
                        })}
                        className="text-xs text-red-400 mt-1"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {registrations.map((reg) => (
                        <button
                          key={reg.id}
                          onClick={() => selectAthlete('athlete1', reg)}
                          className="w-full text-left p-2 bg-fire-3/5 hover:bg-fire-3/10 border border-fire-3/10 text-xs"
                        >
                          <div className="font-rajdhani font-semibold text-fire-4">
                            {reg.first_name} {reg.last_name}
                          </div>
                          <div className="text-fire-3/60">{reg.sport}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-fire-3/10 border border-fire-3/20 p-3">
                  <div className="font-mono text-xs text-fire-3/60 mb-2">ATHLETE 2</div>
                  {matchupData.athlete2_name ? (
                    <div className="mb-2">
                      <div className="font-rajdhani font-semibold text-fire-5">{matchupData.athlete2_name}</div>
                      <div className="text-xs text-fire-3/60">{matchupData.athlete2_discipline}</div>
                      <button
                        onClick={() => setMatchupData({
                          ...matchupData,
                          athlete2_email: '',
                          athlete2_name: '',
                          athlete2_discipline: '',
                        })}
                        className="text-xs text-red-400 mt-1"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {registrations.map((reg) => (
                        <button
                          key={reg.id}
                          onClick={() => selectAthlete('athlete2', reg)}
                          className="w-full text-left p-2 bg-fire-3/5 hover:bg-fire-3/10 border border-fire-3/10 text-xs"
                        >
                          <div className="font-rajdhani font-semibold text-fire-4">
                            {reg.first_name} {reg.last_name}
                          </div>
                          <div className="text-fire-3/60">{reg.sport}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowMatchupForm(false)}
                  className="btn-ghost flex-1"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => createMatchupMutation.mutate(matchupData)}
                  disabled={!matchupData.athlete1_email || !matchupData.athlete2_email}
                  className="btn-fire flex-1"
                >
                  CREATE MATCHUP
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {matchups.map((matchup) => (
            <div key={matchup.id} className="bg-fire-3/5 border border-fire-3/20 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  {matchup.matchup_title && (
                    <div className="font-mono text-xs text-fire-3/60 mb-2">{matchup.matchup_title}</div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-rajdhani font-bold text-fire-5">{matchup.athlete1_name}</div>
                      <div className="text-xs text-fire-3/60">{matchup.athlete1_discipline}</div>
                      <div className="font-orbitron text-sm text-fire-4 mt-1">{matchup.athlete1_votes || 0} votes</div>
                    </div>
                    <div>
                      <div className="font-rajdhani font-bold text-fire-5">{matchup.athlete2_name}</div>
                      <div className="text-xs text-fire-3/60">{matchup.athlete2_discipline}</div>
                      <div className="font-orbitron text-sm text-fire-4 mt-1">{matchup.athlete2_votes || 0} votes</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteMatchupMutation.mutate(matchup.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Nominees Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-orbitron font-bold text-fire-4 flex items-center gap-2">
            <Award size={18} />
            PERFORMANCE OF THE NIGHT
          </h4>
          <button
            onClick={() => setShowPerformanceForm(!showPerformanceForm)}
            className="btn-fire text-xs flex items-center gap-2"
          >
            <Plus size={14} />
            ADD NOMINEE
          </button>
        </div>

        {showPerformanceForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-fire-3/5 border border-fire-3/20 p-4 mb-4"
          >
            <div className="space-y-3">
              <div>
                <label className="font-mono text-xs text-fire-3/60 mb-2 block">SELECT ATHLETE</label>
                <div className="max-h-40 overflow-y-auto space-y-1 mb-3">
                  {registrations.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => setPerformanceData({
                        ...performanceData,
                        athlete_email: reg.email,
                        athlete_name: `${reg.first_name} ${reg.last_name}`,
                        discipline: reg.sport,
                      })}
                      className={`w-full text-left p-2 border text-xs ${
                        performanceData.athlete_email === reg.email
                          ? 'bg-fire-3/20 border-fire-3/40 text-fire-5'
                          : 'bg-fire-3/5 border-fire-3/10 text-fire-4 hover:bg-fire-3/10'
                      }`}
                    >
                      <div className="font-rajdhani font-semibold">
                        {reg.first_name} {reg.last_name}
                      </div>
                      <div className="text-fire-3/60">{reg.sport}</div>
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Performance description (optional)"
                value={performanceData.performance_description}
                onChange={(e) => setPerformanceData({ ...performanceData, performance_description: e.target.value })}
                className="cyber-input h-20 resize-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPerformanceForm(false)}
                  className="btn-ghost flex-1"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => createNomineeMutation.mutate(performanceData)}
                  disabled={!performanceData.athlete_email}
                  className="btn-fire flex-1"
                >
                  ADD NOMINEE
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {nominees.map((nominee) => (
            <div key={nominee.id} className="bg-fire-3/5 border border-fire-3/20 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-rajdhani font-bold text-fire-5">{nominee.athlete_name}</div>
                  <div className="text-xs text-fire-3/60 mb-2">{nominee.discipline}</div>
                  {nominee.performance_description && (
                    <p className="text-sm text-fire-4/70 font-rajdhani mb-2">{nominee.performance_description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-fire-5" />
                    <span className="font-orbitron text-sm text-fire-4">{nominee.vote_count || 0} votes</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteNomineeMutation.mutate(nominee.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}