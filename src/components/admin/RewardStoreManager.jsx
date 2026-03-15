import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function RewardStoreManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    category: 'badge',
    token_cost: 100,
    image_url: '',
    stock_quantity: -1,
    rarity: 'common',
    benefits: [],
    is_active: true,
  });

  const { data: rewardItems = [] } = useQuery({
    queryKey: ['reward-items-admin'],
    queryFn: () => base44.entities.RewardItem.list('-created_date', 100),
    initialData: [],
  });

  const createItemMutation = useMutation({
    mutationFn: (data) => base44.entities.RewardItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-items-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reward-items'] });
      toast.success('Reward item created');
      resetForm();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RewardItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-items-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reward-items'] });
      toast.success('Reward item updated');
      resetForm();
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.RewardItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-items-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reward-items'] });
      toast.success('Reward item deleted');
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      item_name: '',
      description: '',
      category: 'badge',
      token_cost: 100,
      image_url: '',
      stock_quantity: -1,
      rarity: 'common',
      benefits: [],
      is_active: true,
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      description: item.description,
      category: item.category,
      token_cost: item.token_cost,
      image_url: item.image_url || '',
      stock_quantity: item.stock_quantity,
      rarity: item.rarity,
      benefits: item.benefits || [],
      is_active: item.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createItemMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={28} className="text-fire-5" />
          <h2 className="font-orbitron font-black text-2xl text-fire-gradient">REWARD STORE MANAGER</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-fire text-[11px] py-2.5 px-5 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Reward
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-fire-3/10 border border-fire-3/30"
        >
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">
            {editingItem ? 'Edit Reward' : 'New Reward'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-1">
                Item Name
              </label>
              <input
                className="cyber-input"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-1">
                Category
              </label>
              <select
                className="cyber-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="badge">Badge</option>
                <option value="event_pass">Event Pass</option>
                <option value="merchandise">Merchandise</option>
                <option value="nft">NFT</option>
                <option value="vip_access">VIP Access</option>
                <option value="exclusive_content">Exclusive Content</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-1">
                Token Cost
              </label>
              <input
                className="cyber-input"
                type="number"
                value={formData.token_cost}
                onChange={(e) => setFormData({ ...formData, token_cost: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-1">
                Stock (-1 for unlimited)
              </label>
              <input
                className="cyber-input"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-1">
                Rarity
              </label>
              <select
                className="cyber-input"
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
              >
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-1">
                Image URL
              </label>
              <input
                className="cyber-input"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-1">
              Description
            </label>
            <textarea
              className="cyber-input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="font-mono text-sm text-fire-3">
              Active (available for purchase)
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={resetForm} className="btn-ghost py-2 px-4 text-[10px]">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.item_name || !formData.description}
              className="btn-fire py-2 px-4 text-[10px] disabled:opacity-20"
            >
              {editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {rewardItems.map((item) => (
          <div key={item.id} className="p-4 bg-fire-3/5 border border-fire-3/10 flex items-center justify-between">
            <div className="flex-1">
              <div className="font-orbitron font-bold text-fire-4 mb-1">{item.item_name}</div>
              <div className="font-mono text-xs text-fire-3/40">
                {item.category} • {item.token_cost} tokens • {item.rarity} • 
                {item.stock_quantity === -1 ? ' Unlimited' : ` Stock: ${item.stock_quantity}`}
                {!item.is_active && ' • INACTIVE'}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="btn-cyan text-[10px] py-2 px-4"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${item.item_name}"?`)) {
                    deleteItemMutation.mutate(item.id);
                  }
                }}
                className="btn-ghost text-[10px] py-2 px-4 border-red-500/40 text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}