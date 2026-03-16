import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../components/useLang';
import { useTranslation } from '../components/translations';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Medal, Instagram, Youtube, Twitter, Award, MapPin, Users, Video } from 'lucide-react';
import CyberOverlays from '../components/cyber/CyberOverlays';
import ParticleField from '../components/cyber/ParticleField';
import Navbar from '../components/cyber/Navbar';
import Footer from '../components/cyber/Footer';
import EditProfileModal from '../components/profile/EditProfileModal';
import BadgeDisplay from '../components/profile/BadgeDisplay';
import PerformanceScoreCard from '../components/performance/PerformanceScoreCard';
import RoyaltyDashboard from '../components/royalty/RoyaltyDashboard';

export default function AthleteProfile() {
  const [searchParams] = useSearchParams();
  const athleteEmail = searchParams.get('email');
  const [editOpen, setEditOpen] = useState(false);
  const [lang, setLang] = useLang();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: athlete, isLoading: athleteLoading } = useQuery({
    queryKey: ['athlete', athleteEmail],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: athleteEmail });
      return users[0] || null;
    },
    enabled: !!athleteEmail,
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['athlete-registrations', athleteEmail],
    queryFn: () => base44.entities.Registration.filter({ 
      email: athleteEmail,
      type: 'athlete',
      status: 'confirmed'
    }),
    enabled: !!athleteEmail,
    initialData: [],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
    initialData: [],
  });

  const { data: stats } = useQuery({
    queryKey: ['athlete-stats', athleteEmail],
    queryFn: () => base44.entities.AthleteStats.filter({ athlete_email: athleteEmail }),
    enabled: !!athleteEmail,
    initialData: [],
  });

  const { data: badges = [], refetch: refetchBadges } = useQuery({
    queryKey: ['athlete-badges', athleteEmail],
    queryFn: async () => {
      // Award badges first
      await base44.functions.invoke('awardBadges', { athlete_email: athleteEmail });
      // Then fetch all badges
      return await base44.entities.AthleteBadge.filter({ athlete_email: athleteEmail });
    },
    enabled: !!athleteEmail,
    initialData: [],
  });

  const { data: performanceScores = [] } = useQuery({
    queryKey: ['athlete-performance-scores', athleteEmail],
    queryFn: () => base44.entities.AthletePerformanceScore.filter({ 
      athlete_email: athleteEmail 
    }),
    enabled: !!athleteEmail,
    initialData: [],
  });

  const latestScore = performanceScores.sort((a, b) => 
    new Date(b.score_date) - new Date(a.score_date)
  )[0];

  const isOwnProfile = currentUser?.email === athleteEmail;
  const t = useTranslation(lang);

  if (athleteLoading) {
    return (
      <div className="fixed inset-0 bg-cyber-void flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-fire-3/30 border-t-fire-3 rounded-full animate-spin" />
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen bg-cyber-void text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-orbitron font-black text-fire-gradient mb-4">{t('athlete_not_found')}</h1>
          <p className="text-fire-3/40 font-mono">{t('athlete_invalid_link')}</p>
        </div>
      </div>
    );
  }

  const athleteEvents = registrations.map(reg => {
    const event = events.find(e => e.id === reg.event_id);
    return { ...reg, event };
  }).filter(r => r.event);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-cyber-void text-foreground">
      <CyberOverlays />
      <ParticleField />
      <Navbar onScrollTo={scrollTo} lang={lang} onLangSwitch={setLang} />

      <div className="section-container pt-32 pb-20">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto mb-12"
        >
          <div className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 clip-cyber p-8 relative">
            <div className="absolute top-0 left-0 right-0 fire-line" />
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 rounded-full border-4 border-fire-3/40 flex-shrink-0 overflow-hidden bg-gradient-to-br from-fire-3/20 to-cyber-purple/20"
              >
                {athlete.photo_url ? (
                  <img src={athlete.photo_url} alt={athlete.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-orbitron text-5xl font-black text-fire-5">
                    {athlete.full_name?.charAt(0) || 'A'}
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-fire-gradient font-orbitron font-black text-4xl tracking-[2px] mb-2">
                      {athlete.nickname || athlete.full_name}
                    </h1>
                    <p className="font-mono text-sm text-fire-3/40 tracking-[2px]">
                      {athlete.sports?.join(' • ') || 'STREET ATHLETE'}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditOpen(true)}
                      className="btn-ghost text-[10px] py-2 px-4"
                    >
                      {t('athlete_edit_profile')}
                    </button>
                  )}
                </div>

                {athlete.bio && (
                  <p className="text-fire-4/60 font-rajdhani text-base leading-relaxed mb-4">
                    {athlete.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 font-mono text-sm text-fire-3/40">
                  {athlete.city && athlete.country && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-fire-3" />
                      {athlete.city}, {athlete.country}
                    </div>
                  )}
                  {athlete.team_name && (
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-fire-3" />
                      {athlete.team_name}
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {(athlete.instagram || athlete.youtube || athlete.tiktok || athlete.twitter) && (
                  <div className="flex gap-3 mt-4">
                    {athlete.instagram && (
                      <a
                        href={`https://instagram.com/${athlete.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-fire-3/10 border border-fire-3/30 flex items-center justify-center hover:bg-fire-3/20 hover:border-fire-3/50 transition-all"
                      >
                        <Instagram size={18} className="text-fire-3" />
                      </a>
                    )}
                    {athlete.youtube && (
                      <a
                        href={`https://youtube.com/@${athlete.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-fire-3/10 border border-fire-3/30 flex items-center justify-center hover:bg-fire-3/20 hover:border-fire-3/50 transition-all"
                      >
                        <Youtube size={18} className="text-fire-3" />
                      </a>
                    )}
                    {athlete.tiktok && (
                      <a
                        href={`https://tiktok.com/@${athlete.tiktok}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-fire-3/10 border border-fire-3/30 flex items-center justify-center hover:bg-fire-3/20 hover:border-fire-3/50 transition-all"
                      >
                        <Video size={18} className="text-fire-3" />
                      </a>
                    )}
                    {athlete.twitter && (
                      <a
                        href={`https://twitter.com/${athlete.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-fire-3/10 border border-fire-3/30 flex items-center justify-center hover:bg-fire-3/20 hover:border-fire-3/50 transition-all"
                      >
                        <Twitter size={18} className="text-fire-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-5xl mx-auto mb-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-fire-3/5 border border-fire-3/20 p-5 text-center">
            <Calendar className="w-8 h-8 text-fire-4 mx-auto mb-2" />
            <div className="font-orbitron font-black text-3xl text-fire-5">{athleteEvents.length}</div>
            <div className="font-mono text-xs text-fire-3/40 tracking-[1px] uppercase">{t('athlete_events_stat')}</div>
          </div>

          <div className="bg-fire-3/5 border border-fire-3/20 p-5 text-center">
            <Trophy className="w-8 h-8 text-fire-4 mx-auto mb-2" />
            <div className="font-orbitron font-black text-3xl text-fire-5">{stats[0]?.wins || 0}</div>
            <div className="font-mono text-xs text-fire-3/40 tracking-[1px] uppercase">{t('athlete_wins_stat')}</div>
          </div>

          <div className="bg-fire-3/5 border border-fire-3/20 p-5 text-center">
            <Medal className="w-8 h-8 text-fire-4 mx-auto mb-2" />
            <div className="font-orbitron font-black text-3xl text-fire-5">{stats[0]?.podium_finishes || 0}</div>
            <div className="font-mono text-xs text-fire-3/40 tracking-[1px] uppercase">{t('athlete_podiums_stat')}</div>
          </div>

          <div className="bg-fire-3/5 border border-fire-3/20 p-5 text-center">
            <Award className="w-8 h-8 text-fire-4 mx-auto mb-2" />
            <div className="font-orbitron font-black text-3xl text-fire-5">{stats[0]?.performance_rating || 0}</div>
            <div className="font-mono text-xs text-fire-3/40 tracking-[1px] uppercase">{t('athlete_rating_stat')}</div>
          </div>
        </motion.div>

        {/* Performance Score */}
        {latestScore && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto mb-12"
          >
            <h2 className="heading-fire text-4xl mb-8 font-black">{t('athlete_universal_score')}</h2>
            <PerformanceScoreCard score={latestScore} />
          </motion.div>
        )}

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto mb-12"
        >
          <h2 className="heading-fire text-4xl mb-8 font-black">{t('athlete_badges')}</h2>
          <div className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 clip-cyber p-6">
            <BadgeDisplay badges={badges} />
          </div>
        </motion.div>

        {/* Royalty Dashboard */}
        {isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-5xl mx-auto mb-12"
          >
            <h2 className="heading-fire text-4xl mb-8 font-black">{t('athlete_royalty')}</h2>
            <RoyaltyDashboard athleteEmail={athleteEmail} />
          </motion.div>
        )}

        {/* Event History */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="heading-fire text-4xl mb-8 font-black">{t('athlete_event_history')}</h2>
          
          {athleteEvents.length === 0 ? (
            <div className="text-center py-16 bg-fire-3/5 border border-fire-3/10">
              <Calendar size={48} className="text-fire-3/30 mx-auto mb-4" />
              <p className="font-mono text-sm text-fire-3/30 tracking-[2px]">{t('athlete_no_events')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {athleteEvents.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="bg-gradient-to-br from-[rgba(10,4,18,0.97)] to-[rgba(4,2,8,0.99)] border border-fire-3/20 p-6 hover:border-fire-3/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <h3 className="font-orbitron font-bold text-xl text-fire-6 mb-1">
                        {item.event.title}
                      </h3>
                      <p className="font-mono text-xs text-fire-3/40 tracking-[2px] mb-2">
                        {item.event.date} • {item.event.location}
                      </p>
                      <p className="text-sm text-fire-4/50">{item.event.sport}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded border text-xs font-mono tracking-[1px] ${
                      item.event.status === 'live' 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : item.event.status === 'ended'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-fire-3/10 border-fire-3/30 text-fire-3'
                    }`}>
                      {item.event.status.toUpperCase()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Achievements Section */}
        {athlete.achievements && athlete.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-5xl mx-auto mt-12"
          >
            <h2 className="heading-fire text-4xl mb-8 font-black">{t('athlete_achievements')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {athlete.achievements.map((achievement, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="bg-gradient-to-r from-fire-3/5 to-cyber-purple/5 border border-fire-3/20 p-5 flex items-start gap-3"
                >
                  <Trophy className="w-6 h-6 text-fire-4 flex-shrink-0 mt-0.5" />
                  <p className="text-fire-4/70 font-rajdhani text-base">{achievement}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer lang={lang} />

      {editOpen && (
        <EditProfileModal
          athlete={athlete}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}