import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Filter, ExternalLink, TrendingUp, Zap, Trophy, Gift, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_TYPES = {
  event: { icon: Calendar, color: 'text-cyan', bg: 'bg-cyan/10', border: 'border-cyan/30', label: 'Event' },
  milestone: { icon: Trophy, color: 'text-fire-4', bg: 'bg-fire-3/10', border: 'border-fire-3/30', label: 'Milestone' },
  voting: { icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Voting' },
  deal: { icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Deal' },
  reward: { icon: Gift, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Reward' },
};

export default function NotificationDashboard({ onClose }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_at', 100),
    enabled: !!user,
    initialData: [],
    refetchInterval: 30000, // Poll every 30s
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      await Promise.all(unreadIds.map(id => base44.entities.Notification.update(id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
  });

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.is_read);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      window.location.hash = notification.action_url;
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber my-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        
        {/* Header */}
        <div className="p-6 border-b border-fire-3/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fire-3 to-fire-5 flex items-center justify-center">
                <Bell size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-orbitron font-black text-2xl text-fire-5">NOTIFICATIONS</h2>
                <p className="font-mono text-xs text-fire-3/60">
                  {unreadCount} unread • {notifications.length} total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-fire-3/20 hover:border-fire-3/40 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-fire-3/60" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 font-mono text-[9px] tracking-[1px] uppercase border transition-all ${
                filter === 'all'
                  ? 'border-fire-3 bg-fire-3/20 text-fire-4'
                  : 'border-fire-3/20 text-fire-3/40 hover:border-fire-3/40'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 font-mono text-[9px] tracking-[1px] uppercase border transition-all ${
                filter === 'unread'
                  ? 'border-fire-3 bg-fire-3/20 text-fire-4'
                  : 'border-fire-3/20 text-fire-3/40 hover:border-fire-3/40'
              }`}
            >
              Unread ({unreadCount})
            </button>
            {Object.entries(NOTIFICATION_TYPES).map(([type, config]) => {
              const count = notifications.filter(n => n.type === type).length;
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 font-mono text-[9px] tracking-[1px] uppercase border transition-all ${
                    filter === type
                      ? `${config.border} ${config.bg} ${config.color}`
                      : 'border-fire-3/20 text-fire-3/40 hover:border-fire-3/40'
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="mt-4">
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="btn-cyan text-[9px] py-2 px-4 flex items-center gap-2"
              >
                <Check size={14} />
                Mark All Read
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[600px] overflow-y-auto p-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell size={48} className="text-fire-3/30 mx-auto mb-4" />
              <p className="font-mono text-sm text-fire-3/40">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {filteredNotifications.map((notification, i) => {
                  const config = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.event;
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`relative bg-gradient-to-br from-fire-3/5 to-transparent border ${
                        notification.is_read ? 'border-fire-3/10' : config.border
                      } p-4 cursor-pointer group hover:bg-fire-3/10 transition-all`}
                    >
                      {!notification.is_read && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-fire-3 shadow-[0_0_8px_var(--fire-3)]" />
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={18} className={config.color} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`font-orbitron font-bold text-sm ${
                              notification.is_read ? 'text-fire-4/60' : 'text-fire-5'
                            }`}>
                              {notification.title}
                            </h3>
                            <span className="font-mono text-[9px] text-fire-3/40 whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>

                          <p className={`font-rajdhani text-sm mb-2 ${
                            notification.is_read ? 'text-fire-4/40' : 'text-fire-4/70'
                          }`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2">
                            {notification.action_url && (
                              <div className="flex items-center gap-1 font-mono text-[8px] text-cyan/60 group-hover:text-cyan transition-colors">
                                <ExternalLink size={10} />
                                View Details
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 size={12} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}