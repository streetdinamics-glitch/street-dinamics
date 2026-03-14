import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AdminPanel from '../components/admin/AdminPanel';

export default function Admin() {
  const navigate = useNavigate();
  const [lang, setLang] = React.useState('en');
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cyber-void flex items-center justify-center p-6">
        <div className="text-center">
          <span className="text-5xl block mb-4">🚫</span>
          <div className="font-orbitron font-bold text-xl text-fire-3 mb-2">ACCESS DENIED</div>
          <div className="font-mono text-sm text-fire-3/40 mb-6">Admin privileges required</div>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="btn-fire text-[11px] py-3 px-6"
          >
            ← Go Home
          </button>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    if (user?.preferences?.language) {
      setLang(user.preferences.language);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-cyber-void">
      <AdminPanel lang={lang} onClose={() => navigate(createPageUrl('Home'))} />
    </div>
  );
}