import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Zap, MessageCircle, Vote, Target, Gift, Crown, Medal, Flame } from 'lucide-react';

export default function FanLeaderboard({ event }) {
  const [sortBy, setSortBy] = useState('total');
  const [timeRange, setTimeRange] = useState('event');

  const { data: fanPoints = [] } = useQuery({
    queryKey: ['fan-leaderboard', event.id],
    queryFn: () => base44.entities.FanPoints.filter(
      { event_id: event.id },
      '-total_points',
      100
    ),
    refetchInterval: 5000,
    initialData: [],
  });

  const { data: myRewards = [] } = useQuery({
    queryKey: ['my-rewards', event.id],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      return base44.entities.FanReward.filter({
        event_id: event.id,
        fan_email: user.email
      });
    },
    initialData: [],
  });

  const sorted = [...fanPoints].sort((a, b) => {
    if (sortBy === 'chat') return (b.chat_points || 0) - (a.chat_points || 0);
    if (sortBy === 'vote') return (b.vote_points || 0) - (a.vote_points || 0);
    if (sortBy === 'prediction') return (b.prediction_points || 0) - (a.prediction_points || 0);
    return (b.total_points || 0) - (a.total_points || 0);
  });

  const topFan = sorted[0];
  const user = base44.auth.me();

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={20} className="text-gray-400" />;
    if (rank === 3) return <Medal size={20} className="text-orange-600" />;
    return <Flame size={16} className="text-fire-3" />;
  };

  const rewardIcons = {
    digital_badge: '🏆',
    nft_collectible: '💎',
    exclusive_content: '🎁',
    merchandise_voucher: '🛍️',
    vip_access: '👑'
  };

  return (
    <div className="space-y-8">
      {/* Top Fan Spotlight */}
      {topFan && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 p-8 rounded-lg"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown size={24} className="text-yellow-400" />
            <h3 className="font-orbitron font-black text-2xl text-yellow-400 tracking-[2px]">
              TOP FAN
            </h3>
          </div>
          <div className="text-center">
            <div className="font-orbitron font-black text-3xl text-fire-5 mb-2">
              {topFan.fan_name}
            </div>
            <div className="font-orbitron text-4xl font-black text-yellow-400 mb-4">
              {topFan.total_points} PTS
            </div>
            <div className="flex justify-center gap-8 text-sm font-rajdhani">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-cyan" />
                <span className="text-fire-4">{topFan.messages_count || 0} chats</span>
              </div>
              <div className="flex items-center gap-2">
                <Vote size={16} className="text-purple-400" />
                <span className="text-fire-4">{topFan.votes_count || 0} votes</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-green-400" />
                <span className="text-fire-4">{topFan.correct_predictions || 0} predictions</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { value: 'total', label: 'Total Points', icon: Zap },
          { value: 'chat', label: 'Chat Activity', icon: MessageCircle },
          { value: 'vote', label: 'Voting', icon: Vote },
          { value: 'prediction', label: 'Predictions', icon: Target }
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setSortBy(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded border font-orbitron text-xs font-bold tracking-[1px] transition-all ${
              sortBy === value
                ? 'bg-fire-3/20 border-fire-3/40 text-fire-5'
                : 'bg-black/30 border-fire-3/10 text-fire-3/60 hover:border-fire-3/20'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-fire-3/10 border-b border-fire-3/20">
                <th className="px-4 py-3 text-left font-orbitron font-bold text-fire-4 text-xs tracking-[1px]">#</th>
                <th className="px-4 py-3 text-left font-orbitron font-bold text-fire-4 text-xs tracking-[1px]">FAN NAME</th>
                <th className="px-4 py-3 text-right font-orbitron font-bold text-fire-4 text-xs tracking-[1px]">
                  {sortBy === 'chat' && 'CHAT MSGS'}
                  {sortBy === 'vote' && 'VOTES CAST'}
                  {sortBy === 'prediction' && 'CORRECT'}
                  {sortBy === 'total' && 'TOTAL POINTS'}
                </th>
                <th className="px-4 py-3 text-center font-orbitron font-bold text-fire-4 text-xs tracking-[1px]">BREAKDOWN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fire-3/10">
              {sorted.slice(0, 20).map((fan, idx) => (
                <motion.tr
                  key={fan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-fire-3/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {getMedalIcon(idx + 1)}
                      <span className="font-orbitron font-bold text-fire-4 text-sm">
                        {idx + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-rajdhani font-bold text-fire-5">{fan.fan_name}</div>
                      <div className="font-mono text-[10px] text-fire-3/50">{fan.total_points} total pts</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {sortBy === 'chat' && (
                      <div className="font-orbitron font-black text-lg text-cyan">
                        {fan.messages_count || 0}
                      </div>
                    )}
                    {sortBy === 'vote' && (
                      <div className="font-orbitron font-black text-lg text-purple-400">
                        {fan.votes_count || 0}
                      </div>
                    )}
                    {sortBy === 'prediction' && (
                      <div className="font-orbitron font-black text-lg text-green-400">
                        {fan.correct_predictions || 0}
                      </div>
                    )}
                    {sortBy === 'total' && (
                      <div className="font-orbitron font-black text-lg text-fire-5">
                        {fan.total_points || 0}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-mono">
                      <span className="text-cyan" title="Chat points">
                        💬 {fan.chat_points || 0}
                      </span>
                      <span className="text-purple-400" title="Vote points">
                        🗳️ {fan.vote_points || 0}
                      </span>
                      <span className="text-green-400" title="Prediction points">
                        🎯 {fan.prediction_points || 0}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Rewards */}
      {myRewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-cyan/10 border border-purple-500/20 p-6 rounded-lg"
        >
          <h3 className="font-orbitron font-bold text-lg text-purple-400 mb-4 flex items-center gap-2">
            <Gift size={20} />
            MY UNLOCKED REWARDS ({myRewards.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {myRewards.map((reward, i) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 border border-purple-500/30 p-4 rounded-lg text-center hover:border-purple-500/60 transition-all"
              >
                <div className="text-4xl mb-2">{rewardIcons[reward.reward_type]}</div>
                <div className="font-orbitron font-bold text-sm text-purple-300 mb-1">
                  {reward.reward_name}
                </div>
                <div className="font-mono text-[9px] text-purple-400/70 mb-3">
                  {reward.points_required} pts
                </div>
                {reward.redeemed ? (
                  <div className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">
                    ✓ REDEEMED
                  </div>
                ) : (
                  <div className="text-xs font-mono text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                    ⚡ ACTIVE
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reward Tiers Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-fire-3/5 to-black border border-fire-3/20 p-6 rounded-lg"
      >
        <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4 flex items-center gap-2">
          <Zap size={20} />
          REWARD TIERS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { pts: 50, reward: '🏆 Rookie Fan', color: 'bg-blue-500/10 border-blue-500/20' },
            { pts: 150, reward: '⭐ Rising Enthusiast', color: 'bg-purple-500/10 border-purple-500/20' },
            { pts: 300, reward: '💎 Super Fan NFT', color: 'bg-cyan/10 border-cyan/20' },
            { pts: 500, reward: '👑 VIP Access', color: 'bg-yellow-500/10 border-yellow-500/20' },
            { pts: 1000, reward: '🏅 Hall of Fame', color: 'bg-orange-500/10 border-orange-500/20' }
          ].map(({ pts, reward, color }, i) => (
            <div key={i} className={`border rounded-lg p-4 ${color}`}>
              <div className="font-orbitron font-black text-lg text-fire-5 mb-1">{pts}</div>
              <div className="font-rajdhani text-xs text-fire-4/80">{reward}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How to Earn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-cyan/5 to-black border border-cyan/20 p-6 rounded-lg"
      >
        <h3 className="font-orbitron font-bold text-lg text-cyan mb-4">HOW TO EARN POINTS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <MessageCircle size={20} className="text-cyan flex-shrink-0 mt-1" />
            <div>
              <div className="font-rajdhani font-bold text-fire-5 text-sm">Live Chat</div>
              <div className="font-mono text-[10px] text-fire-3/60">+2 pts per message</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Vote size={20} className="text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <div className="font-rajdhani font-bold text-fire-5 text-sm">Vote on Polls</div>
              <div className="font-mono text-[10px] text-fire-3/60">+5 pts per vote</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Target size={20} className="text-green-400 flex-shrink-0 mt-1" />
            <div>
              <div className="font-rajdhani font-bold text-fire-5 text-sm">Correct Predictions</div>
              <div className="font-mono text-[10px] text-fire-3/60">+10 pts per prediction</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}