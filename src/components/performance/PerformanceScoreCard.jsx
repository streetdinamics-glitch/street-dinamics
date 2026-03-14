import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Users, Heart, Target, Shield } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function PerformanceScoreCard({ score }) {
  const criteria = [
    {
      name: 'Technical Progression',
      value: score.technical_progression,
      weight: 25,
      icon: TrendingUp,
      color: 'fire-3',
      shortName: 'Technical',
    },
    {
      name: 'Engagement Generated',
      value: score.engagement_generated,
      weight: 20,
      icon: Heart,
      color: 'fire-4',
      shortName: 'Engagement',
    },
    {
      name: 'Consistency',
      value: score.consistency,
      weight: 15,
      icon: Target,
      color: 'fire-5',
      shortName: 'Consistency',
    },
    {
      name: 'External Recognition',
      value: score.external_recognition,
      weight: 15,
      icon: Award,
      color: 'cyan',
      shortName: 'Recognition',
    },
    {
      name: 'Fanbase Growth',
      value: score.fanbase_growth,
      weight: 15,
      icon: Users,
      color: 'cyan',
      shortName: 'Fanbase',
    },
    {
      name: 'Behavior & Leadership',
      value: score.behavior_leadership,
      weight: 10,
      icon: Shield,
      color: 'purple-400',
      shortName: 'Leadership',
    },
  ];

  // Data for radar chart
  const radarData = criteria.map(c => ({
    name: c.shortName,
    value: c.value,
    fullScore: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 clip-cyber p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-orbitron font-bold text-xl text-fire-5 mb-1">UNIVERSAL SCORE</h3>
          <p className="font-mono text-xs text-fire-3/60 tracking-[1px]">
            {new Date(score.score_date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="font-orbitron font-black text-5xl text-fire-gradient">
            {score.total_score.toFixed(1)}
          </div>
          <div className="font-mono text-xs text-fire-3/60 tracking-[2px]">/ 100</div>
        </div>
      </div>

      {/* Radar Chart Visualization */}
      <div className="mb-8 bg-fire-3/5 border border-fire-3/10 p-6 flex flex-col items-center">
        <p className="font-mono text-xs text-fire-3/60 mb-4 tracking-[1px]">6-CRITERIA DISTRIBUTION</p>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,100,0,0.15)" />
            <PolarAngleAxis dataKey="name" stroke="rgba(255,100,0,0.4)" tick={{ fontSize: 12, fill: 'rgba(255,100,0,0.6)' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,100,0,0.2)" tick={{ fontSize: 10, fill: 'rgba(255,100,0,0.4)' }} />
            <Radar 
              name="Score" 
              dataKey="value" 
              stroke="#ff6600" 
              fill="#ff6600" 
              fillOpacity={0.25}
              animationDuration={1000}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Criteria Breakdown */}
      <div className="space-y-4">
        {criteria.map((criterion, index) => {
          const Icon = criterion.icon;
          const contribution = (criterion.value * criterion.weight) / 100;

          return (
            <motion.div
              key={criterion.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-fire-3/5 border border-fire-3/10 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Icon size={18} className={`text-${criterion.color}`} />
                  <div>
                    <div className="font-rajdhani font-bold text-sm text-fire-4">
                      {criterion.name}
                    </div>
                    <div className="font-mono text-xs text-fire-3/60">
                      Weight: {criterion.weight}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-orbitron font-bold text-lg text-fire-5">
                    {criterion.value.toFixed(1)}
                  </div>
                  <div className="font-mono text-xs text-fire-3/60">
                    +{contribution.toFixed(1)} pts
                  </div>
                </div>
              </div>

              <div className="h-2 bg-fire-3/10 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${criterion.value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r from-${criterion.color} to-fire-5`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-fire-3/20">
        <p className="font-mono text-xs text-fire-3/60 leading-relaxed">
          The Universal Score applies to all disciplines. It measures growth and value over time,
          not specific technical skills. Updated after each event based on transparent criteria.
        </p>
      </div>
    </motion.div>
  );
}