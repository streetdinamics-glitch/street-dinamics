import React from 'react';
import UserProfileDashboard from '../components/profile/UserProfileDashboard';
import { useLang } from '../components/useLang';

export default function UserProfile() {
  const [lang] = useLang();
  return (
    <div className="min-h-screen bg-cyber-void p-6">
      <div className="max-w-6xl mx-auto">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <UserProfileDashboard lang={lang} />
      </div>
    </div>
  );
}