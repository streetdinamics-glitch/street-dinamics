import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const NOTIFICATION_TYPES = {
  event: { icon: Bell, color: 'from-fire-3/20 to-fire-3/5', label: 'Event Update' },
  milestone: { icon: CheckCircle, color: 'from-cyan/20 to-cyan/5', label: 'Milestone' },
  voting: { icon: AlertCircle, color: 'from-purple-500/20 to-purple-500/5', label: 'Voting' },
  deal: { icon: Clock, color: 'from-green-500/20 to-green-500/5', label: 'Sponsorship' },
  reward: { icon: Bell, color: 'from-yellow-500/20 to-yellow-500/5', label: 'Reward' },
};

export default function InAppInbox({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const events = await base44.entities.Notification?.filter?.({ user_email: user.email }).catch(() => []);
      return (events || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: (notificationId) =>
      base44.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (notificationId) =>
      base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      {/* Floating Bell Button */}
      <motion.button
        onClick={() => onClose?.()}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-fire-3 to-fire-5 shadow-[0_0_30px_rgba(255,100,0,0.5)] flex items-center justify-center text-black font-bold hover:shadow-[0_0_50px_rgba(255,100,0,0.7)] transition-shadow"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Inbox Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-y-0 right-0 w-96 z-50 bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border-l border-fire-3/20 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-fire-3/10 flex items-center justify-between">
              <h2 className="font-orbitron font-bold text-fire-4 text-lg">NOTIFICATIONS</h2>
              <button
                onClick={onClose}
                className="text-fire-3/40 hover:text-fire-3 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-3 border-b border-fire-3/10 flex gap-2 overflow-x-auto">
              {['all', 'event', 'milestone', 'voting', 'deal', 'reward'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 text-xs font-mono tracking-[1px] uppercase border whitespace-nowrap transition-all ${
                    filter === type
                      ? 'border-fire-3 bg-fire-3/10 text-fire-4'
                      : 'border-fire-3/20 text-fire-3/60 hover:border-fire-3/40'
                  }`}
                >
                  {type === 'all' ? 'All' : NOTIFICATION_TYPES[type]?.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex items-center justify-center h-full text-fire-3/40 text-center p-6">
                  <div>
                    <Bell size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  <AnimatePresence>
                    {filteredNotifications.map((notif, i) => {
                      const typeConfig = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.event;
                      const Icon = typeConfig.icon;

                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-3 rounded border-l-2 ${typeConfig.color} border ${notif.is_read ? 'border-fire-3/10' : 'border-fire-3/30 bg-fire-3/5'} group hover:bg-fire-3/10 transition-all`}
                        >
                          <div className="flex gap-3 items-start">
                            <Icon size={16} className="text-fire-3 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-mono text-xs font-bold text-fire-4 truncate">
                                {notif.title}
                              </h3>
                              <p className="text-xs text-fire-3/70 line-clamp-2 mt-1">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-fire-3/40 mt-2">
                                {new Date(notif.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.is_read && (
                              <button
                                onClick={() => markAsRead.mutate(notif.id)}
                                className="text-[10px] px-2 py-1 border border-cyan/40 text-cyan hover:bg-cyan/10 transition-all"
                              >
                                Mark Read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification.mutate(notif.id)}
                              className="text-[10px] px-2 py-1 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </>
  );
}