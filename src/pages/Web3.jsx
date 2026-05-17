import React from 'react';
import { motion } from 'framer-motion';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import FireRule from '../components/cyber/FireRule';
import Footer from '../components/cyber/Footer';
import WalletConnectButton from '../components/web3/WalletConnectButton';
import Web3ConceptExplainer from '../components/web3/Web3ConceptExplainer';
import { useLang } from '../components/useLang';
import { useTranslation } from '../components/translations';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Web3StatusBanner from '../components/web3/Web3StatusBanner';
import Web3SetupGuide from '../components/admin/Web3SetupGuide';

export default function Web3Page() {
  const [lang, setLang] = useLang();
  const t = useTranslation(lang);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar lang={lang} onLangSwitch={setLang} onScrollTo={() => {}} />
      <Web3StatusBanner isAdmin={user?.role === 'admin'} />

      <div className="pt-[88px] section-container">

        {/* ── WALLET CONNECT (minimal, top) ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-14 flex-wrap gap-4"
        >
          <div>
            <p className="font-mono text-[10px] tracking-[6px] uppercase text-fire-3/40 mb-1">{t('web3_hub')}</p>
            <h1 className="heading-fire text-[clamp(28px,4vw,52px)] leading-none font-black">
              {t('web3_title')}
            </h1>
          </div>
          <WalletConnectButton minimal={true} />
        </motion.div>

        <FireRule />

        {/* ── CORE CONCEPT ── */}
        <div className="mt-14">
          <Web3ConceptExplainer lang={lang} />
        </div>

        <FireRule />

        {/* ── ADMIN: Setup Guide ── */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-14"
          >
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/40 mb-2">ADMIN</p>
            <h2 className="font-orbitron font-black text-2xl text-fire-4 mb-6">Setup & Configurazione Web3</h2>
            <Web3SetupGuide />
          </motion.div>
        )}

      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}