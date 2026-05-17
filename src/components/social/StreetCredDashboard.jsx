import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Instagram, Youtube, Share2, Users, Star, Zap, Crown, Shield, Trophy, Copy, Check, ChevronRight } from 'lucide-react';

const SOCIALS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', border: 'border-pink-400/30', bg: 'bg-pink-400/8', pts: 100, url: 'https://instagram.com/streetdinamics' },
  { key: 'tiktok',    label: 'TikTok',    icon: Zap,       color: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-400/8', pts: 100, url: 'https://tiktok.com/@streetdinamics' },
  { key: 'youtube',   label: 'YouTube',   icon: Youtube,   color: 'text-red-400',  border: 'border-red-400/30',  bg: 'bg-red-400/8',  pts: 80,  url: 'https://youtube.com/@streetdinamics' },
  { key: 'kick',      label: 'Kick',      icon: Star,      color: 'text-green-400',border: 'border-green-400/30',bg: 'bg-green-400/8', pts: 80,  url: 'https://kick.com/streetdinamics' },
  { key: 'snapchat',  label: 'Snapchat',  icon: Share2,    color: 'text-yellow-400',border:'border-yellow-400/30',bg:'bg-yellow-400/8',pts: 60,  url: 'https://snapchat.com/streetdinamics' },
];

const LEVELS = [
  { id: 'newcomer',     label: 'Newcomer',      min: 0,    icon: '🌱', color: 'text-gray-400',   bar: 'bg-gray-400' },
  { id: 'follower',     label: 'Follower',       min: 100,  icon: '👁️', color: 'text-blue-400',   bar: 'bg-blue-400' },
  { id: 'hype_beast',   label: 'Hype Beast',     min: 500,  icon: '🔥', color: 'text-orange-400', bar: 'bg-orange-400' },
  { id: 'street_legend',label: 'Street Legend',  min: 1000, icon: '⚡', color: 'text-purple-400', bar: 'bg-purple-400' },
  { id: 'sd_icon',      label: 'SD Icon',        min: 2000, icon: '👑', color: 'text-yellow-400', bar: 'bg-yellow-400' },
];

const PERKS_MAP = {
  raffle_entry:    { label: 'Raffle Entry', icon: '🎟️', desc: 'Automatic entry at every event' },
  free_drink:      { label: 'Free Drink',   icon: '🥤', desc: 'One free drink at the event bar' },
  early_access:    { label: 'Early Access', icon: '⏩', desc: 'Enter venues 30 min before doors open' },
  free_merch:      { label: 'Free Merch',   icon: '👕', desc: 'SD branded merch package at events' },
  meet_athletes:   { label: 'Meet Athletes',icon: '🤝', desc: 'Exclusive meet & greet backstage' },
  vip_backstage:   { label: 'VIP Backstage',icon: '🌟', desc: 'Full backstage access all day' },
  exclusive_badge: { label: 'SD Icon Badge',icon: '🏆', desc: 'Exclusive on-profile legend badge' },
};

function LevelBar({ points }) {
  const cur = [...LEVELS].reverse().find(l => points >= l.min) || LEVELS[0];
  const next = LEVELS[LEVELS.indexOf(LEVELS.find(l => l.id === cur.id)) + 1];
  const progress = next ? Math.min(100, ((points - cur.min) / (next.min - cur.min)) * 100) : 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className={`font-orbitron font-bold text-xs ${cur.color}`}>{cur.icon} {cur.label}</span>
        {next ? (
          <span className="font-mono text-[9px] text-white/30">{next.icon} {next.label} — {next.min - points} pts needed</span>
        ) : (
          <span className="font-mono text-[9px] text-yellow-400/60">MAX LEVEL</span>
        )}
      </div>
      <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
        <motion.div className={`h-full ${cur.bar} rounded-full`} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
      </div>
    </div>
  );
}

export default function StreetCredDashboard({ onClose, lang = 'it' }) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(null);
  const [toast, setToast] = useState(null);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me() });

  const { data: cred, refetch } = useQuery({
    queryKey: ['street-cred', user?.email],
    queryFn: async () => {
      // Load via direct filter, or init by calling sync with no action
      const list = await base44.entities.StreetCred.filter({ user_email: user.email });
      if (list[0]) return list[0];
      const res = await base44.functions.invoke('syncStreetCred', {});
      return res.data?.record || null;
    },
    enabled: !!user?.email,
  });

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSocialFollow = async (key) => {
    if (cred?.actions?.[key]) return;
    setSyncing(key);
    const social = SOCIALS.find(s => s.key === key);
    window.open(social.url, '_blank');
    // Give the user 2 seconds to actually visit, then award
    await new Promise(r => setTimeout(r, 2000));
    const res = await base44.functions.invoke('syncStreetCred', { action: key });
    if (res.data?.gained > 0) showToast(`+${res.data.gained} Street Cred earned!`);
    await refetch();
    setSyncing(null);
  };

  const handleShare = async () => {
    const shareCount = (cred?.actions?.share_event || 0) + 1;
    if (navigator.share) {
      navigator.share({ title: 'Street Dinamics', text: 'Join the next SD event!', url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    setSyncing('share');
    const res = await base44.functions.invoke('syncStreetCred', { action: 'share_event', value: shareCount });
    if (res.data?.gained > 0) showToast(`+${res.data.gained} Street Cred earned!`);
    await refetch();
    setSyncing(null);
  };

  const copyReferral = () => {
    if (!cred?.referral_code) return;
    navigator.clipboard.writeText(cred.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const points = cred?.total_points || 0;
  const actions = cred?.actions || {};
  const perks = cred?.unlocked_perks || [];
  const referralCode = cred?.referral_code || '—';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#04020a] border border-fire-3/30 overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fire-5 to-transparent" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-fire-3/10">
          <div>
            <p className="font-mono text-[9px] tracking-[5px] uppercase text-fire-3/40">STREET DINAMICS</p>
            <h2 className="font-orbitron font-black text-xl text-fire-4 leading-tight">STREET CRED</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-orbitron font-black text-2xl text-fire-5">{points.toLocaleString()}</div>
              <div className="font-mono text-[8px] text-white/25 uppercase tracking-[2px]">pts</div>
            </div>
            <button onClick={onClose} className="p-2 border border-white/10 hover:border-fire-3/40 transition-colors">
              <X size={14} className="text-white/40" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[75vh] p-5 space-y-5">
          {/* Level Bar */}
          <LevelBar points={points} />

          {/* Social Follows */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[3px] text-fire-3/40 mb-3">FOLLOW & EARN</p>
            <div className="space-y-2">
              {SOCIALS.map(s => {
                const Icon = s.icon;
                const done = !!actions[s.key];
                const loading = syncing === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => handleSocialFollow(s.key)}
                    disabled={done || loading}
                    className={`w-full flex items-center justify-between px-4 py-3 border transition-all ${
                      done ? `${s.border} ${s.bg} opacity-60` : `border-white/8 bg-white/[0.02] hover:${s.border} hover:${s.bg}`
                    }`}
                    style={{ clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={15} className={done ? s.color : 'text-white/30'} />
                      <span className={`font-orbitron text-xs font-bold ${done ? s.color : 'text-white/50'}`}>{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9px] ${done ? s.color : 'text-white/25'}`}>+{s.pts} pts</span>
                      {done ? (
                        <span className="font-mono text-[8px] text-green-400">✓ DONE</span>
                      ) : loading ? (
                        <div className="w-3 h-3 border border-fire-3 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronRight size={12} className="text-white/20" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Share & Refer */}
          <div className="grid grid-cols-2 gap-3">
            {/* Share event */}
            <div className="border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 size={14} className="text-fire-4" />
                <span className="font-orbitron text-[10px] font-bold text-white/60">SHARE EVENT</span>
              </div>
              <p className="font-mono text-[8px] text-white/30 mb-3 leading-relaxed">+50 pts each share. Share as many times as you want.</p>
              <button
                onClick={handleShare}
                disabled={syncing === 'share'}
                className="w-full py-2 bg-fire-3/10 border border-fire-3/25 hover:bg-fire-3/20 hover:border-fire-3/50 font-orbitron text-[9px] text-fire-4 transition-all"
                style={{ clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}
              >
                {syncing === 'share' ? '...' : `SHARE  •  ×${actions.share_event || 0}`}
              </button>
            </div>

            {/* Referral */}
            <div className="border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-purple-400" />
                <span className="font-orbitron text-[10px] font-bold text-white/60">REFERRAL</span>
              </div>
              <p className="font-mono text-[8px] text-white/30 mb-3 leading-relaxed">+200 pts per friend who attends an event.</p>
              <button
                onClick={copyReferral}
                className="w-full py-2 bg-purple-500/10 border border-purple-500/25 hover:bg-purple-500/20 hover:border-purple-400/50 font-orbitron text-[9px] text-purple-400 flex items-center justify-center gap-2 transition-all"
                style={{ clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'COPIED!' : referralCode}
              </button>
            </div>
          </div>

          {/* Attended events */}
          <div className="border border-fire-3/10 bg-fire-3/[0.03] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-orbitron text-[10px] font-bold text-fire-4/70 mb-0.5">EVENTS ATTENDED</p>
              <p className="font-mono text-[8px] text-white/25">+150 pts per event — validated at check-in</p>
            </div>
            <div className="text-right">
              <span className="font-orbitron font-black text-xl text-fire-4">{actions.attended_events || 0}</span>
              <div className="font-mono text-[8px] text-white/25">{(actions.attended_events || 0) * 150} pts</div>
            </div>
          </div>

          {/* Unlocked Perks */}
          {perks.length > 0 && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[3px] text-green-400/50 mb-3">UNLOCKED EVENT PERKS</p>
              <div className="grid grid-cols-2 gap-2">
                {perks.map(p => {
                  const perk = PERKS_MAP[p];
                  if (!perk) return null;
                  return (
                    <div key={p} className="flex items-start gap-2 px-3 py-2.5 border border-green-400/20 bg-green-400/5"
                      style={{ clipPath: 'polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)' }}>
                      <span className="text-base leading-none mt-0.5">{perk.icon}</span>
                      <div>
                        <div className="font-orbitron text-[9px] font-bold text-green-400">{perk.label}</div>
                        <div className="font-mono text-[7px] text-white/30 leading-relaxed">{perk.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All levels overview */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[3px] text-white/20 mb-3">ALL LEVELS</p>
            <div className="space-y-1">
              {LEVELS.map(lvl => {
                const active = cred?.level === lvl.id;
                return (
                  <div key={lvl.id} className={`flex items-center justify-between px-3 py-2 border ${active ? 'border-fire-3/30 bg-fire-3/5' : 'border-white/5'}`}>
                    <span className={`font-orbitron text-[10px] font-bold ${active ? lvl.color : 'text-white/25'}`}>{lvl.icon} {lvl.label}</span>
                    <span className="font-mono text-[8px] text-white/20">{lvl.min.toLocaleString()} pts</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-fire-3 text-black font-orbitron text-xs font-bold whitespace-nowrap"
              style={{ clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}