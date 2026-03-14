import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function EditProfileModal({ athlete, onClose }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    nickname: athlete.nickname || '',
    bio: athlete.bio || '',
    city: athlete.city || '',
    country: athlete.country || '',
    sports: athlete.sports?.join(', ') || '',
    team_name: athlete.team_name || '',
    instagram: athlete.instagram || '',
    youtube: athlete.youtube || '',
    tiktok: athlete.tiktok || '',
    twitter: athlete.twitter || '',
    achievements: athlete.achievements?.join('\n') || '',
    photo_url: athlete.photo_url || '',
  });

  const updateProfile = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['athlete'] });
      toast.success('Profile updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum 5MB allowed.');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('photo_url', file_url);
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const sportsArray = form.sports.split(',').map(s => s.trim()).filter(Boolean);
    const achievementsArray = form.achievements.split('\n').map(a => a.trim()).filter(Boolean);

    updateProfile.mutate({
      nickname: form.nickname,
      bio: form.bio,
      city: form.city,
      country: form.country,
      sports: sportsArray,
      team_name: form.team_name,
      instagram: form.instagram,
      youtube: form.youtube,
      tiktok: form.tiktok,
      twitter: form.twitter,
      achievements: achievementsArray,
      photo_url: form.photo_url,
    });
  };

  return (
    <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-xl flex items-start justify-center overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[700px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 my-8"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />
        
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-fire-3/30 hover:text-fire-3"
        >
          <X size={20} />
        </button>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-6 uppercase">
          EDIT PROFILE
        </h2>

        <div className="space-y-4 mb-6">
          {/* Photo Upload */}
          <div>
            <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-2">
              Profile Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-ghost w-full text-[11px] py-2.5 disabled:opacity-40"
            >
              {uploading ? 'Uploading...' : form.photo_url ? 'Change Photo' : 'Upload Photo'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
                Nickname
              </label>
              <input
                className="cyber-input"
                value={form.nickname}
                onChange={e => handleChange('nickname', e.target.value)}
                placeholder="Your stage name"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
                Team Name
              </label>
              <input
                className="cyber-input"
                value={form.team_name}
                onChange={e => handleChange('team_name', e.target.value)}
                placeholder="Your team (optional)"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
              Bio
            </label>
            <textarea
              className="cyber-input h-24 resize-none"
              value={form.bio}
              onChange={e => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
                City
              </label>
              <input
                className="cyber-input"
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
              />
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
                Country
              </label>
              <input
                className="cyber-input"
                value={form.country}
                onChange={e => handleChange('country', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
              Sports (comma-separated)
            </label>
            <input
              className="cyber-input"
              value={form.sports}
              onChange={e => handleChange('sports', e.target.value)}
              placeholder="Parkour, BMX, Skateboarding"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
              Achievements (one per line)
            </label>
            <textarea
              className="cyber-input h-32 resize-none"
              value={form.achievements}
              onChange={e => handleChange('achievements', e.target.value)}
              placeholder="1st Place - Street Games 2025&#10;National Champion - Parkour&#10;Red Bull Competition Finalist"
            />
          </div>

          <div className="border-t border-fire-3/10 pt-4 mt-4">
            <h3 className="font-orbitron font-bold text-sm text-fire-4 mb-3 tracking-[1px] uppercase">
              Social Media
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
                  Instagram
                </label>
                <input
                  className="cyber-input"
                  value={form.instagram}
                  onChange={e => handleChange('instagram', e.target.value)}
                  placeholder="username"
                />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
                  YouTube
                </label>
                <input
                  className="cyber-input"
                  value={form.youtube}
                  onChange={e => handleChange('youtube', e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
                  TikTok
                </label>
                <input
                  className="cyber-input"
                  value={form.tiktok}
                  onChange={e => handleChange('tiktok', e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/40 block mb-1">
                  Twitter
                </label>
                <input
                  className="cyber-input"
                  value={form.twitter}
                  onChange={e => handleChange('twitter', e.target.value)}
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-ghost flex-1 text-[11px] py-3"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateProfile.isPending}
            className="btn-fire flex-1 text-[11px] py-3 disabled:opacity-40"
          >
            {updateProfile.isPending ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}