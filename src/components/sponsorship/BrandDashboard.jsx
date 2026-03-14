/**
 * Brand Sponsorship Dashboard
 * Allows brands to browse athletes and propose sponsorship deals
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MessageSquare, TrendingUp, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import DealProposalModal from './DealProposalModal';
import AthleteProfileCard from './AthleteProfileCard';

export default function BrandDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: athletes = [] } = useQuery({
    queryKey: ['athletes-for-sponsorship'],
    queryFn: async () => {
      const users = await base44.entities.User.list('-created_date', 200);
      return users.filter(u => u.role === 'athlete' && u.athlete_profile);
    },
    initialData: [],
  });

  const { data: athleteStats = [] } = useQuery({
    queryKey: ['athlete-stats'],
    queryFn: () => base44.entities.AthleteStats.list(),
    initialData: [],
  });

  const { data: myDeals = [] } = useQuery({
    queryKey: ['brand-deals', user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.SponsorshipDeal.filter({ brand_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
    initialData: [],
  });

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch =
      athlete.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDiscipline =
      selectedDiscipline === 'all' ||
      (athlete.athlete_profile?.sports || []).includes(selectedDiscipline);

    return matchesSearch && matchesDiscipline;
  });

  const disciplines = [
    'all',
    ...new Set(athletes.flatMap(a => a.athlete_profile?.sports || [])),
  ];

  const proposeMutation = useMutation({
    mutationFn: async (dealData) => {
      return await base44.entities.SponsorshipDeal.create(dealData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-deals'] });
      setProposalModalOpen(false);
      setSelectedAthlete(null);
      toast.success('Sponsorship proposal sent!');
    },
    onError: () => {
      toast.error('Failed to send proposal');
    },
  });

  const handleProposeDeal = (dealData) => {
    proposeMutation.mutate({
      ...dealData,
      brand_email: user.email,
      brand_name: user.full_name,
      athlete_email: selectedAthlete.email,
      athlete_name: selectedAthlete.full_name,
    });
  };

  const dealStats = {
    active: myDeals.filter(d => d.status === 'in_progress').length,
    pending: myDeals.filter(d => d.status === 'proposed' && d.athlete_response === 'pending').length,
    completed: myDeals.filter(d => d.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-cyber-void text-foreground p-6">
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      <div className="cyber-vignette" />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-2">
            // BRAND SPONSORSHIP HUB //
          </p>
          <h1 className="heading-fire text-[clamp(36px,6vw,72px)] leading-none font-black mb-4">
            FIND & SPONSOR ATHLETES
          </h1>
          <div className="h-[2px] bg-gradient-to-r from-fire-3 via-fire-5 to-transparent" />
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: DollarSign, label: 'Active Deals', value: dealStats.active, color: 'green-400' },
            { icon: MessageSquare, label: 'Pending Responses', value: dealStats.pending, color: 'fire-4' },
            { icon: TrendingUp, label: 'Completed', value: dealStats.completed, color: 'cyan' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-fire-3/20 p-4"
              >
                <div className={`w-8 h-8 rounded-full bg-${stat.color}/10 flex items-center justify-center mb-2`}>
                  <Icon size={16} className={`text-${stat.color}`} />
                </div>
                <div className="font-mono text-xs text-fire-3/40 uppercase tracking-[1px] mb-1">
                  {stat.label}
                </div>
                <div className={`font-orbitron font-black text-2xl text-${stat.color}`}>{stat.value}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Search & Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-fire-3/40" size={20} />
            <input
              type="text"
              placeholder="Search athletes by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-fire-3/5 border border-fire-3/20 pl-10 pr-4 py-3 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {disciplines.map((discipline) => (
              <button
                key={discipline}
                onClick={() => setSelectedDiscipline(discipline)}
                className={`px-4 py-2 border text-xs font-orbitron tracking-[1px] uppercase transition-all ${
                  selectedDiscipline === discipline
                    ? 'border-fire-3 bg-fire-3/20 text-fire-5'
                    : 'border-fire-3/20 bg-fire-3/5 text-fire-3/60 hover:border-fire-3/40'
                }`}
              >
                {discipline === 'all' ? 'All Disciplines' : discipline}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Athletes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete, idx) => {
            const stats = athleteStats.find(s => s.athlete_email === athlete.email);
            return (
              <motion.div
                key={athlete.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <AthleteProfileCard
                  athlete={athlete}
                  stats={stats}
                  onPropose={() => {
                    setSelectedAthlete(athlete);
                    setProposalModalOpen(true);
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {filteredAthletes.length === 0 && (
          <div className="text-center py-20">
            <Users size={48} className="text-fire-3/20 mx-auto mb-4" />
            <p className="font-mono text-sm text-fire-3/40">No athletes match your criteria</p>
          </div>
        )}

        {/* Recent Deals */}
        {myDeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 pt-12 border-t border-fire-3/20"
          >
            <h2 className="font-orbitron font-black text-2xl text-fire-5 mb-6 flex items-center gap-2">
              <MessageSquare size={24} />
              Your Proposals
            </h2>

            <div className="space-y-3">
              {myDeals.slice(0, 5).map((deal, idx) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-black/40 border border-fire-3/10 p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-rajdhani font-bold text-fire-4 mb-1">{deal.campaign_title}</h4>
                    <p className="font-mono text-xs text-fire-3/60">
                      {deal.athlete_name} • €{deal.budget} • {deal.athlete_response}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 text-xs font-mono uppercase border ${
                      deal.status === 'in_progress'
                        ? 'border-green-500/30 text-green-400 bg-green-500/10'
                        : 'border-fire-3/30 text-fire-3 bg-fire-3/10'
                    }`}
                  >
                    {deal.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Proposal Modal */}
      <AnimatePresence>
        {proposalModalOpen && selectedAthlete && (
          <DealProposalModal
            athlete={selectedAthlete}
            onSubmit={handleProposeDeal}
            onClose={() => {
              setProposalModalOpen(false);
              setSelectedAthlete(null);
            }}
            isLoading={proposeMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}