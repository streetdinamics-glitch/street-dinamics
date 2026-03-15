import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Package, CheckCircle, Copy, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function UserInventoryPanel({ onClose }) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['user-inventory', user?.email],
    queryFn: () => base44.entities.UserInventory.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const markAsUsedMutation = useMutation({
    mutationFn: async (itemId) => {
      await base44.entities.UserInventory.update(itemId, {
        is_used: true,
        used_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
      toast.success('Item marked as used');
      setSelectedItem(null);
    },
    onError: () => {
      toast.error('Failed to update item');
    },
  });

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Redemption code copied');
  };

  const activeItems = inventory.filter(item => !item.is_used);
  const usedItems = inventory.filter(item => item.is_used);

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-5xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fire-3 to-transparent" />
        
        <button
          onClick={onClose}
          className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Package size={32} className="text-fire-5" />
          <h2 className="font-orbitron font-black text-3xl text-fire-gradient">MY INVENTORY</h2>
        </div>

        <p className="font-mono text-sm text-fire-3/60 mb-8">
          Manage your redeemed rewards and access passes
        </p>

        {/* Active Items */}
        <div className="mb-8">
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">Active Items ({activeItems.length})</h3>
          
          {activeItems.length === 0 ? (
            <div className="text-center py-12 bg-fire-3/5 border border-fire-3/10">
              <Package size={48} className="text-fire-3/30 mx-auto mb-3" />
              <p className="font-mono text-sm text-fire-3/40">No active items</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-fire-3/10 to-transparent border border-fire-3/20 p-5 hover:border-fire-3/40 transition-all"
                >
                  <div className="flex gap-4">
                    {item.item_image_url && (
                      <div className="w-20 h-20 flex-shrink-0 bg-black/40 border border-fire-3/20 overflow-hidden">
                        <img src={item.item_image_url} alt={item.item_name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-orbitron font-bold text-fire-5 mb-1">{item.item_name}</div>
                      <div className="inline-block px-2 py-0.5 text-[8px] font-mono tracking-[1px] uppercase bg-fire-3/10 border border-fire-3/20 text-fire-3 mb-2">
                        {item.item_category.replace('_', ' ')}
                      </div>
                      <div className="font-mono text-xs text-fire-3/60 mb-3">
                        Redeemed: {new Date(item.redeemed_at).toLocaleDateString()}
                      </div>
                      
                      {/* Redemption Code */}
                      <div className="mb-3">
                        <div className="font-mono text-[9px] tracking-[1px] uppercase text-fire-3/60 mb-1">Code:</div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-2 py-1 bg-black/40 border border-fire-3/20 text-fire-4 font-mono text-xs">
                            {item.redemption_code}
                          </code>
                          <button
                            onClick={() => copyCode(item.redemption_code)}
                            className="p-1.5 border border-fire-3/20 hover:border-fire-3/40 transition-all"
                          >
                            <Copy size={14} className="text-fire-3" />
                          </button>
                        </div>
                      </div>

                      {/* Expiry */}
                      {item.expiry_date && (
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar size={12} className="text-fire-3/60" />
                          <span className="font-mono text-xs text-fire-3/60">
                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Mark as Used */}
                      <button
                        onClick={() => markAsUsedMutation.mutate(item.id)}
                        disabled={markAsUsedMutation.isPending}
                        className="w-full py-2 text-[9px] font-mono tracking-[2px] uppercase border border-fire-3/40 bg-fire-3/10 text-fire-3 hover:bg-fire-3/20 transition-all disabled:opacity-50"
                      >
                        {markAsUsedMutation.isPending ? 'Processing...' : 'Mark as Used'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Used Items */}
        {usedItems.length > 0 && (
          <div>
            <h3 className="font-orbitron font-bold text-lg text-fire-4/60 mb-4">Used Items ({usedItems.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-fire-3/5 to-transparent border border-fire-3/10 p-4 opacity-60"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <div className="font-orbitron font-bold text-sm text-fire-4">{item.item_name}</div>
                  </div>
                  <div className="font-mono text-xs text-fire-3/40">
                    Used: {new Date(item.used_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}