import React, { useState, Suspense } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../translations';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import EventRegistrations from './EventRegistrations';
import Leaderboard from './Leaderboard';
import VenueTicketScanner from '../scanning/VenueTicketScanner';
import TournamentManager from './TournamentManager';
import VotingManager from '../voting/VotingManager';
import FanVotingManager from './FanVotingManager';
import PerformanceScoreManager from './PerformanceScoreManager';
import NFTDropManager from './NFTDropManager';
import RoyaltyDistributionManager from './RoyaltyDistributionManager';
import MinorRegistrationApproval from './MinorRegistrationApproval';
import ChatModerationPanel from '../chat/ChatModerationPanel';
import RegistrationAnalyticsDashboard from './RegistrationAnalyticsDashboard';
import AchievementClaimReview from './AchievementClaimReview';
import RewardStoreManager from './RewardStoreManager';
import BetSettlementPanel from './BetSettlementPanel';
import FanStatusManager from './FanStatusManager';
import SportCategoryManager from './SportCategoryManager';
import Web3ConfigPanel from './Web3ConfigPanel';

export default function AdminPanel({ lang, onClose }) {
  const t = useTranslation(lang);
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [liveLinks, setLiveLinks] = useState({ kick: '', youtube: '' });
  const [vodLinks, setVodLinks] = useState({ kick: '', youtube: '' });
  const [editingVod, setEditingVod] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [viewingRegistrations, setViewingRegistrations] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [pendingAthletes, setPendingAthletes] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '', sport: '', date: '', location: '', description: '', max_spots: 50
  });
  const [showScanner, setShowScanner] = useState(false);
  const [tournamentEvent, setTournamentEvent] = useState(null);
  const [votingEvent, setVotingEvent] = useState(null);
  const [fanVotingEvent, setFanVotingEvent] = useState(null);
  const [scoreEvent, setScoreEvent] = useState(null);
  const [nftEvent, setNftEvent] = useState(null);
  const [showRoyaltyManager, setShowRoyaltyManager] = useState(false);
  const [showMinorApprovals, setShowMinorApprovals] = useState(false);
  const [chatModeratingEvent, setChatModeratingEvent] = useState(null);
  const [showRegistrationAnalytics, setShowRegistrationAnalytics] = useState(false);

  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [showAchievementReview, setShowAchievementReview] = useState(false);
  const [showRewardStore, setShowRewardStore] = useState(false);
  const [settlingBetsEvent, setSettlingBetsEvent] = useState(null);
  const [showFanStatusMgr, setShowFanStatusMgr] = useState(false);
  const [showSportCatMgr, setShowSportCatMgr] = useState(false);
  const [showWeb3Config, setShowWeb3Config] = useState(false);

  // Lazy load components
  const UserManagementPanel = React.lazy(() => import('./UserManagementPanel'));

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
  });

  const { data: sportCategories = [] } = useQuery({
    queryKey: ['sport-categories'],
    queryFn: () => base44.entities.SportCategory.list('name', 100),
    initialData: [],
  });
  const activeSports = sportCategories.filter(c => c.is_active);

  const { data: users = [] } = useQuery({
    queryKey: ['pending-athletes'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-created_date', 100);
      return allUsers.filter(u => 
        u.user_type === 'athlete' && 
        u.athlete_profile?.verification_status === 'pending'
      );
    },
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setSelectedEvent(null);
      setEditingVod(null);
      setLiveLinks({ kick: '', youtube: '' });
      setVodLinks({ kick: '', youtube: '' });
      toast.success(variables.successMessage || 'Event updated');
    },
    onError: (err) => {
      toast.error('Failed to update event: ' + err.message);
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted');
    },
    onError: (err) => {
      toast.error('Failed to delete event: ' + err.message);
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ email, data }) => base44.entities.User.update(email, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-athletes'] });
      toast.success('Athlete status updated');
    },
    onError: (err) => {
      toast.error('Failed to update athlete: ' + err.message);
    },
  });

  const handleGoLive = (event) => {
    setSelectedEvent(event);
    setLiveLinks({
      kick: event.kick_live_url || '',
      youtube: event.youtube_live_url || '',
    });
  };

  const handleSaveLinks = () => {
    if (!selectedEvent) return;
    updateEvent.mutate({
      id: selectedEvent.id,
      data: {
        status: 'live',
        kick_live_url: liveLinks.kick,
        youtube_live_url: liveLinks.youtube,
      },
      successMessage: 'Event is now LIVE!',
    });
  };

  const handleEndEvent = (event) => {
    updateEvent.mutate({
      id: event.id,
      data: { status: 'ended' },
      successMessage: 'Event ended',
    });
  };

  const handleEditVod = (event) => {
    setEditingVod(event);
    setVodLinks({
      kick: event.kick_vod_url || '',
      youtube: event.youtube_vod_url || '',
    });
  };

  const handleSaveVod = () => {
    if (!editingVod) return;
    updateEvent.mutate({
      id: editingVod.id,
      data: {
        kick_vod_url: vodLinks.kick,
        youtube_vod_url: vodLinks.youtube,
      },
      successMessage: 'VOD links saved',
    });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      await base44.auth.updateMe({ password: newPassword });
      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Failed to change password: ' + err.message);
    }
  };

  const handleDeleteEvent = (event) => {
    if (confirm(`Delete event "${event.title}"? This cannot be undone.`)) {
      deleteEvent.mutate(event.id);
    }
  };

  const handleApproveAthlete = (user) => {
    updateUser.mutate({
      email: user.email,
      data: {
        athlete_profile: {
          ...user.athlete_profile,
          verification_status: 'verified',
        },
      },
    });
  };

  const handleRejectAthlete = (user) => {
    updateUser.mutate({
      email: user.email,
      data: {
        athlete_profile: {
          ...user.athlete_profile,
          verification_status: 'rejected',
        },
      },
    });
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title || '',
      sport: event.sport || '',
      date: event.date || '',
      location: event.location || '',
      description: event.description || '',
      max_spots: event.max_spots || 50,
    });
  };

  const handleSaveEventEdit = () => {
    if (!editingEvent) return;
    updateEvent.mutate({
      id: editingEvent.id,
      data: editForm,
      successMessage: 'Event details updated',
    });
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <div className="relative w-full max-w-[1100px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-auto">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <button onClick={onClose} className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3">
          CLOSE
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2">
          {t('admin_panel')}
        </h2>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            to={createPageUrl('CreateEvent')}
            className="btn-fire text-[11px] py-2.5 px-5 no-underline inline-block"
          >
            + {t('admin_create_event')}
          </Link>
          {events.length > 0 && (
            <button
              onClick={() => {
                setSelectedEvent(events[0]);
                setShowScanner(true);
              }}
              className="btn-fire text-[11px] py-2.5 px-5"
            >
              📱 Venue Check-In
            </button>
          )}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="btn-ghost text-[11px] py-2.5 px-5"
          >
            Leaderboard
          </button>
          <button
            onClick={() => setShowRoyaltyManager(true)}
            className="btn-ghost text-[11px] py-2.5 px-5"
          >
            💰 Royalty Distribution
          </button>
          <button
            onClick={() => setShowMinorApprovals(true)}
            className="btn-cyan text-[11px] py-2.5 px-5"
          >
            🛡️ Minor Approvals
          </button>
          <button
            onClick={() => setShowRegistrationAnalytics(true)}
            className="btn-ghost text-[11px] py-2.5 px-5"
          >
            📊 Registration Analytics
          </button>
          <button
            onClick={() => setShowUserMgmt(true)}
            className="btn-ghost text-[11px] py-2.5 px-5"
          >
            👥 User Management
          </button>
          <button
            onClick={() => setShowAchievementReview(true)}
            className="btn-cyan text-[11px] py-2.5 px-5"
          >
            🏆 Achievement Claims
          </button>
          <button
            onClick={() => setShowRewardStore(true)}
            className="btn-ghost text-[11px] py-2.5 px-5"
          >
            🎁 Reward Store
          </button>
          <button
            onClick={() => setShowFanStatusMgr(true)}
            className="btn-cyan text-[11px] py-2.5 px-5"
          >
            🏆 Fan Status
          </button>
          <button
            onClick={() => setShowSportCatMgr(true)}
            className="btn-fire text-[11px] py-2.5 px-5"
          >
            🏷️ Sport Categories
          </button>
          <button
            onClick={() => setShowWeb3Config(true)}
            className="btn-cyan text-[11px] py-2.5 px-5"
          >
            ⛓️ Web3 Config
          </button>
          {events.find(e => e.status === 'live') && (
            <button
              onClick={() => setChatModeratingEvent(events.find(e => e.status === 'live'))}
              className="btn-fire text-[11px] py-2.5 px-5"
            >
              💬 Live Chat
            </button>
          )}
        </div>

        {/* Pending Athletes */}
        {users.length > 0 && (
          <div className="mb-8 p-5 bg-fire-3/5 border border-fire-3/20">
            <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">
              PENDING ATHLETE APPROVALS ({users.length})
            </h3>
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="p-4 bg-black/30 border border-fire-3/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-fire-3/10 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-fire-3/20 border-2 border-fire-3/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-orbitron font-bold text-base text-fire-4">
                      {user.full_name}
                    </div>
                    <div className="font-mono text-xs text-fire-3/40">
                      {user.athlete_profile?.sports?.join(', ') || 'No sports'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveAthlete(user)}
                      className="btn-fire text-[9px] py-1.5 px-4"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectAthlete(user)}
                      className="btn-ghost text-[9px] py-1.5 px-4"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-16 mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-lg border-2 border-fire-3/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-md bg-fire-3/10 border border-fire-3/30" />
            </div>
            <p className="font-mono text-sm text-fire-3/30 mb-4">No events yet. Create your first event!</p>
            <Link to={createPageUrl('CreateEvent')} className="btn-fire text-[11px] py-3 px-6 inline-block no-underline">
              {t('admin_create_event')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {events.map(event => (
              <div key={event.id} className="p-4 md:p-5 bg-fire-3/5 border border-fire-3/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex-1">
                  <div className="font-orbitron font-bold text-base md:text-lg text-fire-4 mb-1">{event.title}</div>
                  <div className="font-mono text-xs text-fire-3/40">{event.date} • {event.location}</div>
                  <div className={`inline-block mt-2 px-3 py-1 text-[9px] font-mono tracking-[2px] uppercase border ${
                    event.status === 'live' ? 'border-green-500/40 text-green-400 bg-green-500/5' :
                    event.status === 'ended' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
                    'border-fire-3/40 text-fire-4 bg-fire-3/5'
                  }`}>
                    {event.status}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="btn-cyan text-[10px] py-2 px-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setViewingRegistrations(event)}
                    className="btn-cyan text-[10px] py-2 px-4"
                  >
                    Registrations
                  </button>
                  <button
                    onClick={() => setTournamentEvent(event)}
                    className="btn-cyan text-[10px] py-2 px-4"
                  >
                    Tournament
                  </button>
                  <button
                    onClick={() => setVotingEvent(event)}
                    className="btn-cyan text-[10px] py-2 px-4"
                  >
                    Voting
                  </button>
                  <button
                    onClick={() => setFanVotingEvent(event)}
                    className="btn-cyan text-[10px] py-2 px-4"
                  >
                    Fan Voting
                  </button>
                  <button
                    onClick={() => setScoreEvent(event)}
                    className="btn-cyan text-[10px] py-2 px-4"
                  >
                    Scores
                  </button>
                  <button
                    onClick={() => setNftEvent(event)}
                    className="btn-cyan text-[10px] py-2 px-4"
                  >
                    NFT Drops
                  </button>
                  {event.status === 'ended' && (
                    <button
                      onClick={() => setSettlingBetsEvent(event)}
                      className="btn-fire text-[10px] py-2 px-4"
                    >
                      💰 Settle Bets
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowScanner(true);
                      setLiveLinks({ kick: '', youtube: '' });
                    }}
                    className="btn-cyan text-[10px] py-2 px-4"
                  >
                    📱 Check-In
                  </button>
                  {event.status === 'upcoming' && (
                    <button
                      onClick={() => handleGoLive(event)}
                      className="btn-fire text-[10px] py-2 px-4"
                    >
                      {t('admin_go_live')}
                    </button>
                  )}
                  {event.status === 'live' && (
                    <button
                      onClick={() => handleEndEvent(event)}
                      className="btn-ghost text-[10px] py-2 px-4"
                    >
                      {t('admin_end_event')}
                    </button>
                  )}
                  {event.status === 'ended' && (
                    <button
                      onClick={() => handleEditVod(event)}
                      className="btn-cyan text-[10px] py-2 px-4"
                    >
                      Add VOD
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteEvent(event)}
                    className="btn-ghost text-[10px] py-2 px-4 border-red-500/40 text-red-400 hover:bg-red-500/5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live Links Modal */}
        {selectedEvent && !showScanner && (
          <div className="mb-8 p-6 bg-green-500/5 border border-green-500/20">
            <h3 className="font-orbitron font-bold text-lg text-green-400 mb-2">
              {t('admin_go_live')}: {selectedEvent.title}
            </h3>
            <p className="font-mono text-[9px] text-green-400/60 mb-4 tracking-[1px]">
              Enter live stream URLs. At least one platform required.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  {t('admin_kick_url')}
                </label>
                <input
                  className="cyber-input"
                  placeholder="https://kick.com/streetdinamics"
                  value={liveLinks.kick}
                  onChange={(e) => setLiveLinks({ ...liveLinks, kick: e.target.value })}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  {t('admin_youtube_url')}
                </label>
                <input
                  className="cyber-input"
                  placeholder="https://youtube.com/live/..."
                  value={liveLinks.youtube}
                  onChange={(e) => setLiveLinks({ ...liveLinks, youtube: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedEvent(null)} className="btn-ghost py-2 px-4 text-[10px]">
                Cancel
              </button>
              <button
                onClick={handleSaveLinks}
                disabled={updateEvent.isPending || (!liveLinks.kick && !liveLinks.youtube)}
                className="btn-fire py-2 px-4 text-[10px] disabled:opacity-20"
              >
                {updateEvent.isPending ? 'Saving...' : `${t('admin_save_links')} & GO LIVE`}
              </button>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {editingEvent && (
          <div className="mb-8 p-6 bg-cyan/5 border border-cyan/20">
            <h3 className="font-orbitron font-bold text-lg text-cyan mb-2">
              Edit Event: {editingEvent.title}
            </h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  Event Title
                </label>
                <input
                  className="cyber-input"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                    Sport / Discipline
                  </label>
                  <select
                    className="cyber-input"
                    value={editForm.sport}
                    onChange={(e) => setEditForm({ ...editForm, sport: e.target.value })}
                  >
                    <option value="">— Select discipline —</option>
                    {activeSports.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.emoji ? `${cat.emoji} ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                    Date
                  </label>
                  <input
                    className="cyber-input"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  Location
                </label>
                <input
                  className="cyber-input"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  Description
                </label>
                <textarea
                  className="cyber-input"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  Max Spots
                </label>
                <input
                  className="cyber-input"
                  type="number"
                  value={editForm.max_spots}
                  onChange={(e) => setEditForm({ ...editForm, max_spots: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingEvent(null)} className="btn-ghost py-2 px-4 text-[10px]">
                Cancel
              </button>
              <button
                onClick={handleSaveEventEdit}
                disabled={updateEvent.isPending || !editForm.title || !editForm.sport || !editForm.date || !editForm.location}
                className="btn-fire py-2 px-4 text-[10px] disabled:opacity-20"
              >
                {updateEvent.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* VOD Links Modal */}
        {editingVod && (
          <div className="mb-8 p-6 bg-purple-500/5 border border-purple-500/20">
            <h3 className="font-orbitron font-bold text-lg text-purple-400 mb-2">
              Add Replay Links: {editingVod.title}
            </h3>
            <p className="font-mono text-[9px] text-purple-400/60 mb-4 tracking-[1px]">
              Enter video-on-demand (VOD) / replay URLs for this event.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  Kick VOD URL
                </label>
                <input
                  className="cyber-input"
                  placeholder="https://kick.com/video/..."
                  value={vodLinks.kick}
                  onChange={(e) => setVodLinks({ ...vodLinks, kick: e.target.value })}
                />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                  YouTube VOD URL
                </label>
                <input
                  className="cyber-input"
                  placeholder="https://youtube.com/watch?v=..."
                  value={vodLinks.youtube}
                  onChange={(e) => setVodLinks({ ...vodLinks, youtube: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingVod(null)} className="btn-ghost py-2 px-4 text-[10px]">
                Cancel
              </button>
              <button
                onClick={handleSaveVod}
                disabled={updateEvent.isPending || (!vodLinks.kick && !vodLinks.youtube)}
                className="btn-fire py-2 px-4 text-[10px] disabled:opacity-20"
              >
                {updateEvent.isPending ? 'Saving...' : 'Save VOD Links'}
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {viewingRegistrations && (
          <EventRegistrations
            event={viewingRegistrations}
            onClose={() => setViewingRegistrations(null)}
            lang={lang}
          />
        )}
        {showLeaderboard && (
          <Leaderboard
            onClose={() => setShowLeaderboard(false)}
            lang={lang}
          />
        )}
        {showScanner && selectedEvent && (
          <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
            <div className="relative w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8">
              <div className="absolute top-0 left-0 right-0 fire-line" />
              <button
                onClick={() => {
                  setShowScanner(false);
                  setSelectedEvent(null);
                }}
                className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
              >
                CLOSE
              </button>
              <VenueTicketScanner eventId={selectedEvent.id} eventTitle={selectedEvent.title} />
            </div>
          </div>
        )}
        {tournamentEvent && (
          <TournamentManager
            event={tournamentEvent}
            onClose={() => setTournamentEvent(null)}
          />
        )}
        {votingEvent && (
          <VotingManager
            event={votingEvent}
            onClose={() => setVotingEvent(null)}
          />
        )}
        {fanVotingEvent && (
          <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-y-auto p-4">
            <div className="relative w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 fire-line" />
              <button
                onClick={() => setFanVotingEvent(null)}
                className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
              >
                CLOSE
              </button>
              <FanVotingManager event={fanVotingEvent} />
            </div>
          </div>
        )}
        {scoreEvent && (
          <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-y-auto p-4">
            <div className="relative w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 fire-line" />
              <button
                onClick={() => setScoreEvent(null)}
                className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
              >
                CLOSE
              </button>
              <PerformanceScoreManager event={scoreEvent} />
            </div>
          </div>
        )}
        {nftEvent && (
          <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-y-auto p-4">
            <div className="relative w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 fire-line" />
              <button
                onClick={() => setNftEvent(null)}
                className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
              >
                CLOSE
              </button>
              <NFTDropManager event={nftEvent} />
            </div>
          </div>
        )}
        {showRoyaltyManager && (
          <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-y-auto p-4">
            <div className="relative w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 fire-line" />
              <button
                onClick={() => setShowRoyaltyManager(false)}
                className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
              >
                CLOSE
              </button>
              <RoyaltyDistributionManager />
            </div>
          </div>
        )}
        {showMinorApprovals && (
          <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-y-auto p-4">
            <div className="relative w-full max-w-5xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-cyan/30 clip-cyber p-8 max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cyan/40 via-cyan/60 to-cyan/40 h-[2px]" />
              <button
                onClick={() => setShowMinorApprovals(false)}
                className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-cyan/60 hover:text-cyan"
              >
                CLOSE
              </button>
              <MinorRegistrationApproval />
            </div>
          </div>
        )}
        {chatModeratingEvent && (
           <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-y-auto p-4">
             <div className="relative w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 max-h-[90vh] overflow-y-auto">
               <div className="absolute top-0 left-0 right-0 fire-line" />
               <button
                 onClick={() => setChatModeratingEvent(null)}
                 className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
               >
                 CLOSE
               </button>
               <h2 className="text-fire-gradient font-orbitron font-black text-2xl mb-6">
                 💬 LIVE CHAT MODERATION: {chatModeratingEvent.title}
               </h2>
               <ChatModerationPanel event={chatModeratingEvent} />
             </div>
           </div>
         )}
         {showRegistrationAnalytics && (
            <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
              <div className="relative w-full max-w-6xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8">
                <div className="absolute top-0 left-0 right-0 fire-line" />
                <button
                  onClick={() => setShowRegistrationAnalytics(false)}
                  className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
                >
                  CLOSE
                </button>
                <RegistrationAnalyticsDashboard />
              </div>
            </div>
          )}

         {showUserMgmt && (
            <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
              <div className="relative w-full max-w-6xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8">
                <div className="absolute top-0 left-0 right-0 fire-line" />
                <button
                  onClick={() => setShowUserMgmt(false)}
                  className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
                >
                  CLOSE
                </button>
                <Suspense fallback={<div className="text-fire-3/40 text-center py-8">Loading...</div>}>
                  <UserManagementPanel />
                </Suspense>
              </div>
            </div>
          )}
         {showAchievementReview && (
            <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
              <div className="relative w-full max-w-5xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8">
                <div className="absolute top-0 left-0 right-0 fire-line" />
                <button
                  onClick={() => setShowAchievementReview(false)}
                  className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
                >
                  CLOSE
                </button>
                <AchievementClaimReview />
              </div>
            </div>
          )}
         {showRewardStore && (
            <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
              <div className="relative w-full max-w-5xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8">
                <div className="absolute top-0 left-0 right-0 fire-line" />
                <button
                  onClick={() => setShowRewardStore(false)}
                  className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
                >
                  CLOSE
                </button>
                <RewardStoreManager />
              </div>
            </div>
          )}
         {settlingBetsEvent && (
            <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-y-auto p-4">
              <div className="relative w-full max-w-3xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8">
                <div className="absolute top-0 left-0 right-0 fire-line" />
                <button
                  onClick={() => setSettlingBetsEvent(null)}
                  className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
                >
                  CLOSE
                </button>
                <BetSettlementPanel event={settlingBetsEvent} onClose={() => setSettlingBetsEvent(null)} />
              </div>
            </div>
          )}
         {showFanStatusMgr && (
            <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
              <div className="relative w-full max-w-6xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8">
                <div className="absolute top-0 left-0 right-0 fire-line" />
                <button
                  onClick={() => setShowFanStatusMgr(false)}
                  className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
                >
                  CLOSE
                </button>
                <FanStatusManager />
              </div>
            </div>
          )}
         {showSportCatMgr && (
            <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
              <div className="relative w-full max-w-4xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8">
                <div className="absolute top-0 left-0 right-0 fire-line" />
                <button
                  onClick={() => setShowSportCatMgr(false)}
                  className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-fire-3/30 hover:text-fire-3"
                >
                  CLOSE
                </button>
                <SportCategoryManager />
              </div>
            </div>
          )}

         {showWeb3Config && (
            <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
              <div className="relative w-full max-w-2xl bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-cyan/30 clip-cyber p-8 my-8">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />
                <button
                  onClick={() => setShowWeb3Config(false)}
                  className="absolute top-3 right-4 font-mono text-[10px] tracking-[2px] text-cyan/40 hover:text-cyan"
                >
                  CLOSE
                </button>
                <Web3ConfigPanel />
              </div>
            </div>
          )}

        {/* Change Password */}
        <div className="p-6 bg-fire-3/5 border border-fire-3/10">
          <h3 className="font-orbitron font-bold text-lg text-fire-4 mb-4">{t('admin_change_pass')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                {t('admin_new_pass')}
              </label>
              <input
                type="password"
                className="cyber-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-1">
                {t('admin_confirm_pass')}
              </label>
              <input
                type="password"
                className="cyber-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={!newPassword || newPassword !== confirmPassword}
            className="btn-fire text-[10px] py-2 px-4 disabled:opacity-20"
          >
            {t('admin_change_pass')}
          </button>
        </div>
      </div>
    </div>
  );
}