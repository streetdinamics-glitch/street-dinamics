import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Award, Users, Heart, Target, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function PerformanceScoreManager({ event }) {
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [scores, setScores] = useState({
    technical_progression: 0,
    engagement_generated: 0,
    consistency: 0,
    external_recognition: 0,
    fanbase_growth: 0,
    behavior_leadership: 0,
  });

  const queryClient = useQueryClient();

  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations', event.id],
    queryFn: () => base44.entities.Registration.filter({ 
      event_id: event.id,
      type: 'athlete',
      status: 'confirmed'
    }),
    initialData: [],
  });

  const createScoreMutation = useMutation({
    mutationFn: async (data) => {
      const totalScore = 
        (data.technical_progression * 0.25) +
        (data.engagement_generated * 0.20) +
        (data.consistency * 0.15) +
        (data.external_recognition * 0.15) +
        (data.fanbase_growth * 0.15) +
        (data.behavior_leadership * 0.10);

      return await base44.entities.AthletePerformanceScore.create({
        athlete_email: selectedAthlete.email,
        event_id: event.id,
        ...data,
        total_score: totalScore,
        score_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-performance-scores'] });
      setSelectedAthlete(null);
      setScores({
        technical_progression: 0,
        engagement_generated: 0,
        consistency: 0,
        external_recognition: 0,
        fanbase_growth: 0,
        behavior_leadership: 0,
      });
      toast.success('Performance score recorded!');
    },
  });

  const handleSubmit = () => {
    if (!selectedAthlete) {
      toast.error('Please select an athlete');
      return;
    }

    if (Object.values(scores).some(v => v < 0 || v > 100)) {
      toast.error('All scores must be between 0 and 100');
      return;
    }

    createScoreMutation.mutate(scores);
  };

  const criteria = [
    { key: 'technical_progression', label: 'Technical Progression', weight: '25%', icon: TrendingUp },
    { key: 'engagement_generated', label: 'Engagement Generated', weight: '20%', icon: Heart },
    { key: 'consistency', label: 'Consistency', weight: '15%', icon: Target },
    { key: 'external_recognition', label: 'External Recognition', weight: '15%', icon: Award },
    { key: 'fanbase_growth', label: 'Fanbase Growth', weight: '15%', icon: Users },
    { key: 'behavior_leadership', label: 'Behavior & Leadership', weight: '10%', icon: Shield },
  ];

  const calculatedTotal = 
    (scores.technical_progression * 0.25) +
    (scores.engagement_generated * 0.20) +
    (scores.consistency * 0.15) +
    (scores.external_recognition * 0.15) +
    (scores.fanbase_growth * 0.15) +
    (scores.behavior_leadership * 0.10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="w-6 h-6 text-fire-5" />
        <h3 className="font-orbitron font-bold text-xl text-fire-5">PERFORMANCE SCORE MANAGER</h3>
      </div>

      {/* Athlete Selection */}
      <div>
        <label className="font-orbitron text-sm font-bold text-fire-4 mb-3 block">
          SELECT ATHLETE
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {registrations.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setSelectedAthlete(reg)}
              className={`p-3 border text-left transition-all ${
                selectedAthlete?.id === reg.id
                  ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                  : 'border-fire-3/20 bg-fire-3/5 text-fire-4 hover:border-fire-3/40'
              }`}
            >
              <div className="font-rajdhani font-bold">
                {reg.first_name} {reg.last_name}
              </div>
              <div className="font-mono text-xs text-fire-3/60">{reg.sport}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedAthlete && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-fire-3/5 border border-fire-3/20 p-6"
        >
          <div className="mb-6">
            <div className="font-orbitron font-bold text-lg text-fire-5 mb-1">
              Scoring: {selectedAthlete.first_name} {selectedAthlete.last_name}
            </div>
            <div className="font-mono text-xs text-fire-3/60">{selectedAthlete.sport}</div>
          </div>

          {/* Score Inputs */}
          <div className="space-y-4 mb-6">
            {criteria.map((criterion) => {
              const Icon = criterion.icon;
              return (
                <div key={criterion.key} className="bg-fire-3/10 border border-fire-3/10 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={16} className="text-fire-3" />
                    <div className="flex-grow">
                      <div className="font-rajdhani font-bold text-sm text-fire-4">
                        {criterion.label}
                      </div>
                      <div className="font-mono text-xs text-fire-3/60">
                        Weight: {criterion.weight}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={scores[criterion.key]}
                      onChange={(e) => setScores({
                        ...scores,
                        [criterion.key]: parseFloat(e.target.value) || 0
                      })}
                      className="w-24 cyber-input text-center"
                    />
                  </div>
                  <div className="h-2 bg-fire-3/10 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fire-3 to-fire-5 transition-all"
                      style={{ width: `${scores[criterion.key]}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Score Display */}
          <div className="bg-gradient-to-br from-fire-3/20 to-fire-5/10 border-2 border-fire-3/40 p-6 mb-6">
            <div className="text-center">
              <div className="font-mono text-xs text-fire-3/60 tracking-[2px] uppercase mb-2">
                CALCULATED TOTAL SCORE
              </div>
              <div className="font-orbitron font-black text-6xl text-fire-gradient">
                {calculatedTotal.toFixed(1)}
              </div>
              <div className="font-mono text-sm text-fire-3/60 mt-1">/ 100</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedAthlete(null);
                setScores({
                  technical_progression: 0,
                  engagement_generated: 0,
                  consistency: 0,
                  external_recognition: 0,
                  fanbase_growth: 0,
                  behavior_leadership: 0,
                });
              }}
              className="btn-ghost flex-1"
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={createScoreMutation.isPending}
              className="btn-fire flex-1"
            >
              {createScoreMutation.isPending ? 'SAVING...' : 'SAVE SCORE'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Scoring Guidelines */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-6">
        <h4 className="font-orbitron font-bold text-sm text-fire-4 mb-3">SCORING GUIDELINES</h4>
        <div className="space-y-2 font-mono text-xs text-fire-3/60 leading-relaxed">
          <p><strong className="text-fire-4">Technical Progression (25%):</strong> Improvement % from baseline skill assessment</p>
          <p><strong className="text-fire-4">Engagement Generated (20%):</strong> Social media interactions related to performances</p>
          <p><strong className="text-fire-4">Consistency (15%):</strong> Number of high-level performances across events</p>
          <p><strong className="text-fire-4">External Recognition (15%):</strong> Awards, scouting interest, brand collaborations</p>
          <p><strong className="text-fire-4">Fanbase Growth (15%):</strong> New followers and community growth monthly</p>
          <p><strong className="text-fire-4">Behavior & Leadership (10%):</strong> Based on public criteria approved by assembly</p>
        </div>
      </div>
    </div>
  );
}