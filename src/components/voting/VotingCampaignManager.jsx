import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function VotingCampaignManager({ eventId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campaign_type: 'matchup',
    options: ['', ''],
    ends_at: '',
  });

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch voting campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['voting-campaigns', eventId],
    queryFn: () => base44.entities.EventVote.filter({ event_id: eventId }),
  });

  // Create campaign mutation
  const createCampaign = useMutation({
    mutationFn: (data) =>
      base44.entities.EventVote.create({
        event_id: eventId,
        creator_email: user.email,
        creator_name: user.full_name,
        title: data.title,
        description: data.description,
        campaign_type: data.campaign_type,
        options: data.options.filter(o => o.trim()),
        status: 'active',
        created_at: new Date().toISOString(),
        ends_at: data.ends_at,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting-campaigns', eventId] });
      setShowForm(false);
      setFormData({ title: '', description: '', campaign_type: 'matchup', options: ['', ''], ends_at: '' });
      toast.success('Campaign created!');
    },
    onError: (err) => toast.error('Failed to create: ' + err.message),
  });

  // Update campaign mutation
  const updateCampaign = useMutation({
    mutationFn: (data) =>
      base44.entities.EventVote.update(editingCampaign.id, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting-campaigns', eventId] });
      setEditingCampaign(null);
      toast.success('Campaign updated');
    },
  });

  // Delete campaign mutation
  const deleteCampaign = useMutation({
    mutationFn: (id) => base44.entities.EventVote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting-campaigns', eventId] });
      toast.success('Campaign deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || formData.options.filter(o => o.trim()).length < 2) {
      toast.error('Fill all required fields');
      return;
    }
    createCampaign.mutate(formData);
  };

  const handleAddOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const userCampaigns = campaigns.filter(c => c.creator_email === user?.email);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-orbitron font-black text-2xl text-fire-5">Voting Campaigns</h2>
          <p className="font-mono text-xs text-fire-3/60 mt-1">Manage your event voting campaigns</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingCampaign(null);
          }}
          className="btn-fire px-4 py-2 text-xs flex items-center gap-2"
        >
          <Plus size={14} />
          New Campaign
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[9px] text-fire-3/60 uppercase tracking-[1px] block mb-2">
                Campaign Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="cyber-input w-full"
                placeholder="e.g., Best Moment of the Match"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] text-fire-3/60 uppercase tracking-[1px] block mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="cyber-input w-full h-20"
                placeholder="Tell voters what they're voting on"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] text-fire-3/60 uppercase tracking-[1px] block mb-2">
                  Campaign Type
                </label>
                <select
                  value={formData.campaign_type}
                  onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                  className="cyber-input w-full"
                >
                  <option value="matchup">Matchup</option>
                  <option value="award">Award</option>
                  <option value="poll">Poll</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[9px] text-fire-3/60 uppercase tracking-[1px] block mb-2">
                  Ends At
                </label>
                <input
                  type="datetime-local"
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  className="cyber-input w-full"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] text-fire-3/60 uppercase tracking-[1px] block mb-2">
                Voting Options
              </label>
              <div className="space-y-2">
                {formData.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="cyber-input w-full"
                    placeholder={`Option ${i + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs border border-fire-3/20 hover:border-fire-3 text-fire-3/60 hover:text-fire-3 py-2 px-3 w-full transition-all"
                >
                  + Add Option
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-ghost flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createCampaign.isPending}
                className="btn-fire flex-1 py-2 text-xs disabled:opacity-50"
              >
                {createCampaign.isPending ? 'Creating...' : 'Launch Campaign'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Campaigns List */}
      <div className="space-y-3">
        {userCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-fire-3/5 border border-fire-3/10">
            <p className="font-mono text-sm text-fire-3/40">No campaigns yet</p>
          </div>
        ) : (
          userCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-fire-3/10 to-fire-3/5 border border-fire-3/20 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-orbitron font-bold text-fire-4">{campaign.title}</h3>
                    <span className={`px-2 py-0.5 text-[8px] font-mono tracking-[1px] uppercase border ${
                      campaign.status === 'active'
                        ? 'border-green-500/40 bg-green-500/10 text-green-400'
                        : 'border-gray-500/40 bg-gray-500/10 text-gray-400'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="font-rajdhani text-sm text-fire-3/80 mb-2">{campaign.description}</p>
                  <div className="flex gap-2">
                    {campaign.options.map((opt, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-fire-3/20 border border-fire-3/30 text-fire-4">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {}}
                    className="p-2 border border-cyan/20 hover:border-cyan hover:bg-cyan/10 transition-all"
                    title="View results"
                  >
                    <BarChart3 size={16} className="text-cyan/60" />
                  </button>
                  <button
                    onClick={() => deleteCampaign.mutate(campaign.id)}
                    className="p-2 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={16} className="text-red-500/60" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}