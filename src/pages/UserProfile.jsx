import React from 'react';
import UserProfileDashboard from '../components/profile/UserProfileDashboard';

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-cyber-void p-6">
      <div className="max-w-6xl mx-auto">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <UserProfileDashboard />
      </div>
    </div>
  );
}