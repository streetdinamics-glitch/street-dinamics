import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Search, MessageSquare, Trash2, Crown, Star, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagementPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [messageModal, setMessageModal] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const users = useMemo(() => {
    return allUsers.slice(page * pageSize, (page + 1) * pageSize);
  }, [allUsers, page]);

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated');
    },
    onError: (err) => {
      toast.error('Failed: ' + err.message);
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
    },
    onError: (err) => {
      toast.error('Failed: ' + err.message);
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ email, subject, body }) => {
      return base44.integrations.Core.SendEmail({
        to: email,
        subject,
        body,
      });
    },
    onSuccess: () => {
      toast.success('Message sent');
      setMessageModal(null);
      setMessageText('');
      setMessageSubject('');
    },
    onError: (err) => {
      toast.error('Failed to send: ' + err.message);
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole =
        roleFilter === 'all' ||
        user.role === roleFilter ||
        (roleFilter === 'athlete' && user.athlete_profile) ||
        (roleFilter === 'fan' && !user.athlete_profile);
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleUpgradeToAthlete = (user) => {
    updateUser.mutate({
      id: user.id,
      data: {
        role: 'athlete',
        athlete_profile: {
          ...(user.athlete_profile || {}),
          verification_status: 'verified',
          created_at: user.athlete_profile?.created_at || new Date().toISOString(),
        },
        user_type: 'athlete',
      },
    });
  };

  const handleUpgradeToFan = (user) => {
    updateUser.mutate({
      id: user.id,
      data: {
        role: 'user',
        fan_benefits: {
          ...(user.fan_benefits || {}),
          verified: true,
          loyalty_level: 'bronze',
        },
      },
    });
  };

  const handleDelete = (user) => {
    if (confirm(`Delete ${user.full_name}? This cannot be undone.`)) {
      deleteUser.mutate(user.id);
    }
  };

  const handleSendMessage = () => {
    if (!messageModal || !messageText.trim() || !messageSubject.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }
    sendMessage.mutate({
      email: messageModal.email,
      subject: messageSubject,
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #ffe8c0; padding: 20px; border: 2px solid #ff5000;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ff9900; font-size: 24px; margin: 0;">STREET DINAMICS</h1>
        </div>
        <div style="background: rgba(255,100,0,0.05); border: 1px solid rgba(255,100,0,0.2); padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 14px; line-height: 1.6; margin: 0;">${messageText}</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #664422;">
          <p>© 2026 Street Dynamics — Admin Message</p>
        </div>
      </div>`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users size={24} className="text-fire-3" />
        <div>
          <h3 className="font-orbitron font-bold text-lg text-fire-4">User Management</h3>
          <p className="font-mono text-xs text-fire-3/60">Manage, upgrade, and communicate with users ({filteredUsers.length})</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fire-3/40" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cyber-input pl-9 w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'admin', 'athlete', 'user', 'fan'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 text-[10px] font-mono tracking-[1px] uppercase border transition-all ${
                roleFilter === role
                  ? 'border-fire-3 bg-fire-3/20 text-fire-4'
                  : 'border-fire-3/20 bg-transparent text-fire-3/60 hover:border-fire-3'
              }`}
            >
              {role === 'all' ? '👥 All' : role === 'athlete' ? '🏅' : role === 'admin' ? '🔧' : '👤'} {role}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {usersLoading && (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-fire-3/30 border-t-fire-3 rounded-full animate-spin"></div>
          <p className="font-mono text-sm text-fire-3/60 mt-2">Loading users...</p>
        </div>
      )}

      {/* Users Table */}
      {!usersLoading && (
        <div className="border border-fire-3/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-fire-3/5 border-b border-fire-3/10">
                <tr>
                  <th className="px-4 py-3 text-left font-orbitron text-fire-4 text-[11px] tracking-[1px]">NAME</th>
                  <th className="px-4 py-3 text-left font-orbitron text-fire-4 text-[11px] tracking-[1px]">EMAIL</th>
                  <th className="px-4 py-3 text-left font-orbitron text-fire-4 text-[11px] tracking-[1px]">ROLE</th>
                  <th className="px-4 py-3 text-left font-orbitron text-fire-4 text-[11px] tracking-[1px]">JOINED</th>
                  <th className="px-4 py-3 text-left font-orbitron text-fire-4 text-[11px] tracking-[1px]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fire-3/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-fire-3/5 transition-colors">
                    <td className="px-4 py-3 font-rajdhani text-fire-3/80">{user.full_name}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-fire-3/60">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className={`inline-block px-2.5 py-1 text-[9px] font-mono tracking-[1px] uppercase border ${
                          user.role === 'admin' ? 'border-purple-500/40 bg-purple-500/10 text-purple-400' :
                          user.role === 'athlete' ? 'border-cyan/40 bg-cyan/10 text-cyan' :
                          'border-fire-3/40 bg-fire-3/10 text-fire-4'
                        }`}>
                          {user.role}
                        </span>
                        {user.athlete_profile?.verification_status === 'verified' && (
                          <div className="text-[8px] text-cyan/60">✓ Tokenized</div>
                        )}
                        {user.fan_benefits?.verified && (
                          <div className="text-[8px] text-fire-5/60">⭐ {user.fan_benefits.loyalty_level}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-fire-3/60">
                      {new Date(user.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setMessageModal(user);
                            setMessageText('');
                            setMessageSubject('');
                          }}
                          title="Send message"
                          disabled={sendMessage.isPending}
                          className="p-1.5 border border-fire-3/20 hover:border-fire-3 hover:bg-fire-3/10 transition-all disabled:opacity-50"
                        >
                          <Mail size={14} className="text-fire-3/60 hover:text-fire-3" />
                        </button>
                        <button
                          onClick={() => handleUpgradeToAthlete(user)}
                          title="Upgrade to verified athlete"
                          disabled={updateUser.isPending || user.role === 'athlete'}
                          className="p-1.5 border border-cyan/20 hover:border-cyan hover:bg-cyan/10 transition-all disabled:opacity-50"
                        >
                          <Crown size={14} className="text-cyan/60 hover:text-cyan" />
                        </button>
                        <button
                          onClick={() => handleUpgradeToFan(user)}
                          title="Upgrade to verified fan"
                          disabled={updateUser.isPending || user.role === 'user'}
                          className="p-1.5 border border-fire-5/20 hover:border-fire-5 hover:bg-fire-5/10 transition-all disabled:opacity-50"
                        >
                          <Star size={14} className="text-fire-5/60 hover:text-fire-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          title="Delete user"
                          disabled={deleteUser.isPending}
                          className="p-1.5 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={14} className="text-red-500/60 hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <p className="font-mono text-sm text-fire-3/40">No users match your filters</p>
            </div>
          )}

          {/* Pagination */}
          {allUsers.length > pageSize && (
            <div className="flex items-center justify-between mt-4 px-4 py-3 bg-fire-3/5 border border-fire-3/10">
              <div className="font-mono text-[10px] text-fire-3/60">
                Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, allUsers.length)} of {allUsers.length} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-ghost py-1 px-3 text-[9px] disabled:opacity-30"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(Math.min(Math.ceil(allUsers.length / pageSize) - 1, page + 1))}
                  disabled={page >= Math.ceil(allUsers.length / pageSize) - 1}
                  className="btn-ghost py-1 px-3 text-[9px] disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Modal */}
      {messageModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-[700] bg-black/80 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setMessageModal(null)}
        >
          <div
            className="bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={20} className="text-fire-3" />
              <div>
                <h3 className="font-orbitron font-bold text-fire-4">Send Message</h3>
                <p className="font-mono text-[10px] text-fire-3/60">To: {messageModal.full_name} ({messageModal.email})</p>
              </div>
            </div>

            <div className="mb-3">
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-2">Subject</label>
              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Email subject..."
                className="cyber-input w-full"
              />
            </div>

            <div className="mb-4">
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/60 block mb-2">Message</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your message here..."
                rows={6}
                className="cyber-input w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMessageModal(null)}
                className="btn-ghost py-2 px-4 text-[10px] flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendMessage.isPending || !messageText.trim()}
                className="btn-fire py-2 px-4 text-[10px] flex-1 disabled:opacity-30"
              >
                {sendMessage.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}