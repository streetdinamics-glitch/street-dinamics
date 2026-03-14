/**
 * Deal Proposal Modal
 * Allows brands to propose sponsorship deals with deliverables
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

export default function DealProposalModal({ athlete, onSubmit, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    campaign_title: '',
    description: '',
    budget: '',
    duration_days: '',
    start_date: '',
    end_date: '',
    payment_terms: 'milestone',
    deliverables: [{ description: '', deadline: '' }],
  });

  const [errors, setErrors] = useState({});

  const handleAddDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, { description: '', deadline: '' }],
    }));
  };

  const handleRemoveDeliverable = (idx) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx),
    }));
  };

  const handleDeliverableChange = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) =>
        i === idx ? { ...d, [field]: value } : d
      ),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.campaign_title) newErrors.campaign_title = 'Campaign title required';
    if (!formData.budget || formData.budget <= 0) newErrors.budget = 'Valid budget required';
    if (!formData.duration_days || formData.duration_days <= 0) newErrors.duration_days = 'Duration required';
    if (!formData.start_date) newErrors.start_date = 'Start date required';
    if (!formData.end_date) newErrors.end_date = 'End date required';
    if (formData.deliverables.length === 0 || formData.deliverables.some(d => !d.description)) {
      newErrors.deliverables = 'At least one deliverable required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...formData,
      budget: parseFloat(formData.budget),
      duration_days: parseInt(formData.duration_days),
    });
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 rounded-lg p-8 my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-2">PROPOSE SPONSORSHIP DEAL</h2>
            <p className="font-rajdhani text-sm text-fire-4/70">
              Athlete: <span className="text-fire-4">{athlete.full_name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-fire-3/10 rounded transition-all">
            <X size={20} className="text-fire-3" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-orbitron font-bold text-fire-5 mb-4">Campaign Details</h3>

            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                Campaign Title *
              </label>
              <input
                type="text"
                value={formData.campaign_title}
                onChange={(e) => setFormData({ ...formData, campaign_title: e.target.value })}
                placeholder="e.g., Summer Collection Campaign"
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40"
              />
              {errors.campaign_title && <p className="text-red-400 text-xs mt-1">{errors.campaign_title}</p>}
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                Campaign Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the campaign, target audience, and brand values..."
                rows={3}
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40"
              />
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                Budget (EUR) *
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="10000"
                min="0"
                step="100"
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40"
              />
              {errors.budget && <p className="text-red-400 text-xs mt-1">{errors.budget}</p>}
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                Duration (days) *
              </label>
              <input
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                placeholder="30"
                min="1"
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40"
              />
              {errors.duration_days && <p className="text-red-400 text-xs mt-1">{errors.duration_days}</p>}
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani focus:outline-none focus:border-fire-3/40"
              />
              {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date}</p>}
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani focus:outline-none focus:border-fire-3/40"
              />
              {errors.end_date && <p className="text-red-400 text-xs mt-1">{errors.end_date}</p>}
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block font-rajdhani font-bold text-fire-4 mb-2 text-sm">
              Payment Terms
            </label>
            <select
              value={formData.payment_terms}
              onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              className="w-full bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani focus:outline-none focus:border-fire-3/40"
            >
              <option value="upfront">Upfront Payment</option>
              <option value="milestone">Milestone-based (Recommended)</option>
              <option value="on_completion">On Completion</option>
            </select>
            <p className="font-mono text-xs text-fire-3/60 mt-1">
              {formData.payment_terms === 'milestone'
                ? 'Funds held in escrow and released as deliverables are completed'
                : 'Adjust based on your risk comfort level'}
            </p>
          </div>

          {/* Deliverables */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-orbitron font-bold text-fire-5">Deliverables *</h3>
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="p-2 bg-fire-3/10 border border-fire-3/20 hover:bg-fire-3/20 transition-all text-fire-3 rounded"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {formData.deliverables.map((deliverable, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={deliverable.description}
                      onChange={(e) => handleDeliverableChange(idx, 'description', e.target.value)}
                      placeholder="e.g., Instagram post, TikTok video, brand appearance"
                      className="flex-1 bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 placeholder-fire-3/30 font-rajdhani focus:outline-none focus:border-fire-3/40"
                    />
                    <input
                      type="date"
                      value={deliverable.deadline}
                      onChange={(e) => handleDeliverableChange(idx, 'deadline', e.target.value)}
                      className="w-32 bg-fire-3/5 border border-fire-3/20 px-4 py-2 text-fire-4 font-rajdhani focus:outline-none focus:border-fire-3/40"
                    />
                    {formData.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-400 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {errors.deliverables && <p className="text-red-400 text-xs">{errors.deliverables}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-fire-3/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-fire-3/10 border border-fire-3/20 text-fire-3 font-orbitron font-bold py-3 rounded hover:bg-fire-3/20 transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-fire-3 to-fire-4 text-black font-orbitron font-bold py-3 rounded hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'SENDING...' : 'SEND PROPOSAL'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}