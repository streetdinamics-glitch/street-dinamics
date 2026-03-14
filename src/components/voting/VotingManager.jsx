import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Play, StopCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function VotingManager({ event, onClose }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState(['', '']);

  const { data: votes = [] } = useQuery({
    queryKey: ['event-votes', event.id],
    queryFn: () => base44.entities.EventVote.filter({ event_id: event.id }),
    initialData: [],
  });

  const createVote = useMutation({
    mutationFn: (data) => base44.entities.EventVote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-votes'] });
      setCreating(false);
      setQuestion('');
      setChoices(['', '']);
      toast.success('Vote created');
    },
  });

  const updateVoteStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.EventVote.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-votes'] });
      toast.success('Vote status updated');
    },
  });

  const deleteVote = useMutation({
    mutationFn: (id) => base44.entities.EventVote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-votes'] });
      toast.success('Vote deleted');
    },
  });

  const handleAddChoice = () => {
    setChoices([...choices, '']);
  };

  const handleRemoveChoice = (index) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleCreate = () => {
    const validChoices = choices.filter(c => c.trim());
    if (!question.trim() || validChoices.length < 2) {
      toast.error('Need question and at least 2 choices');
      return;
    }

    createVote.mutate({
      event_id: event.id,
      question: question.trim(),
      choices: validChoices.map(label => ({ label, votes: 0 })),
      status: 'draft',
      total_votes: 0,
      created_at: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[900px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-fire-3/30 hover:text-fire-3"
        >
          <X size={20} />
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2 uppercase">
          FAN VOTING: {event.title}
        </h2>
        <p className="font-mono text-[10px] text-fire-3/40 tracking-[2px] mb-6 uppercase">
          Create voting questions for token holders
        </p>

        {/* Create New Vote */}
        {creating ? (
          <div className="mb-8 p-6 bg-fire-3/5 border border-fire-3/20">
            <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">CREATE NEW VOTE</h3>
            
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
                  Question
                </label>
                <input
                  className="cyber-input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Who will win this match?"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-2">
                  Choices (min 2)
                </label>
                <div className="space-y-2">
                  {choices.map((choice, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="cyber-input flex-1"
                        value={choice}
                        onChange={(e) => handleChoiceChange(i, e.target.value)}
                        placeholder={`Choice ${i + 1}`}
                      />
                      {choices.length > 2 && (
                        <button
                          onClick={() => handleRemoveChoice(i)}
                          className="btn-ghost text-[10px] py-2 px-3 border-red-500/40 text-red-400 hover:bg-red-500/5"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddChoice}
                  className="btn-ghost text-[10px] py-2 px-4 mt-2 flex items-center gap-2"
                >
                  <Plus size={14} />
                  Add Choice
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCreating(false)}
                className="btn-ghost text-[11px] py-2 px-5"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createVote.isPending}
                className="btn-fire text-[11px] py-2 px-5 disabled:opacity-30"
              >
                {createVote.isPending ? 'Creating...' : 'Create Vote'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="btn-fire text-[11px] py-3 px-6 mb-6 flex items-center gap-2"
          >
            <Plus size={16} />
            NEW VOTE
          </button>
        )}

        {/* Existing Votes */}
        <div className="space-y-4">
          <h3 className="font-orbitron font-bold text-lg text-fire-4">ACTIVE VOTES</h3>
          
          {votes.length === 0 ? (
            <div className="text-center py-12 bg-fire-3/5 border border-fire-3/10">
              <p className="font-mono text-sm text-fire-3/30 tracking-[2px]">No votes created yet</p>
            </div>
          ) : (
            votes.map((vote) => (
              <motion.div
                key={vote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-fire-3/5 border border-fire-3/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-orbitron font-bold text-base text-fire-5 mb-2">
                      {vote.question}
                    </h4>
                    <div className="flex items-center gap-3 font-mono text-xs text-fire-3/40">
                      <span>Total Votes: {vote.total_votes || 0}</span>
                      <span className={`px-2 py-1 border text-[9px] tracking-[1px] ${
                        vote.status === 'live' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                        vote.status === 'closed' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        'bg-fire-3/5 border-fire-3/20 text-fire-3/40'
                      }`}>
                        {vote.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {vote.status === 'draft' && (
                      <button
                        onClick={() => updateVoteStatus.mutate({ id: vote.id, status: 'live' })}
                        className="btn-fire text-[10px] py-2 px-4 flex items-center gap-1"
                      >
                        <Play size={12} />
                        Go Live
                      </button>
                    )}
                    {vote.status === 'live' && (
                      <button
                        onClick={() => updateVoteStatus.mutate({ id: vote.id, status: 'closed' })}
                        className="btn-ghost text-[10px] py-2 px-4 flex items-center gap-1"
                      >
                        <StopCircle size={12} />
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Delete this vote?')) deleteVote.mutate(vote.id);
                      }}
                      className="btn-ghost text-[10px] py-2 px-3 border-red-500/40 text-red-400 hover:bg-red-500/5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-2">
                  {vote.choices?.map((choice, i) => {
                    const percentage = vote.total_votes > 0 
                      ? ((choice.votes || 0) / vote.total_votes * 100).toFixed(1)
                      : 0;
                    return (
                      <div key={i} className="bg-black/40 p-3 border border-fire-3/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-rajdhani text-sm text-fire-4/70">{choice.label}</span>
                          <span className="font-mono text-xs text-fire-4">{choice.votes || 0} votes ({percentage}%)</span>
                        </div>
                        <div className="h-1 bg-fire-3/10 relative overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-fire-2 to-fire-5"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}