import React, { useState } from 'react';
import { toast } from 'sonner';

export default function AthleteDetailsForm({ onSubmit }) {
  const [form, setForm] = useState({
    bio: '',
    sports: [],
    experience_level: '',
    social_links: { instagram: '', tiktok: '', youtube: '', twitter: '' },
    portfolio_url: '',
  });

  const sportsOptions = ['Skateboarding', 'Parkour', 'BMX', 'Climbing', 'Diving', 'Gymnastics', 'Martial Arts'];

  const handleSportToggle = (sport) => {
    setForm(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport],
    }));
  };

  const handleSocialChange = (platform, value) => {
    setForm(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.bio.trim()) {
      toast.error('Bio is required');
      return;
    }
    if (form.sports.length === 0) {
      toast.error('Select at least one sport');
      return;
    }
    if (!form.experience_level) {
      toast.error('Select experience level');
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Bio */}
      <div>
        <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-2">
          Bio
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Tell us about yourself, your achievements, and what drives you..."
          className="cyber-input w-full h-24"
          maxLength={500}
        />
        <p className="font-mono text-[9px] text-fire-3/40 mt-1">{form.bio.length}/500</p>
      </div>

      {/* Sports */}
      <div>
        <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-2">
          Sports
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sportsOptions.map((sport) => (
            <label key={sport} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.sports.includes(sport)}
                onChange={() => handleSportToggle(sport)}
                className="w-4 h-4 accent-fire-3"
              />
              <span className="font-mono text-[10px] text-fire-3/60">{sport}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-2">
          Experience Level
        </label>
        <select
          value={form.experience_level}
          onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
          className="cyber-input w-full"
        >
          <option value="">Select...</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      {/* Social Links */}
      <div>
        <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-2">
          Social Links (Optional)
        </label>
        <div className="space-y-2">
          {['instagram', 'tiktok', 'youtube', 'twitter'].map((platform) => (
            <input
              key={platform}
              type="url"
              placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} profile URL`}
              value={form.social_links[platform]}
              onChange={(e) => handleSocialChange(platform, e.target.value)}
              className="cyber-input w-full text-sm"
            />
          ))}
        </div>
      </div>

      {/* Portfolio */}
      <div>
        <label className="font-mono text-[11px] tracking-[2px] uppercase text-fire-3/30 block mb-2">
          Portfolio / Website (Optional)
        </label>
        <input
          type="url"
          placeholder="Link to your portfolio or website"
          value={form.portfolio_url}
          onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
          className="cyber-input w-full"
        />
      </div>

      <button
        type="submit"
        className="btn-fire w-full py-3 text-[13px] font-bold"
      >
        Proceed to Interview
      </button>
    </form>
  );
}