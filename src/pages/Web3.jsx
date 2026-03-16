import React from 'react';
import { motion } from 'framer-motion';
import CyberOverlays from '../components/cyber/CyberOverlays';
import Navbar from '../components/cyber/Navbar';
import FireRule from '../components/cyber/FireRule';
import Footer from '../components/cyber/Footer';
import WalletConnectButton from '../components/web3/WalletConnectButton';
import TokenStakingDashboard from '../components/staking/TokenStakingDashboard';
import { useLang } from '../components/useLang';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Web3Page() {
  const [lang, setLang] = useLang();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="relative min-h-screen bg-cyber-void text-[var(--text-main)]">
      <CyberOverlays />
      <Navbar lang={lang} onLangSwitch={setLang} onScrollTo={() => {}} />

      <div className="pt-[80px] section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3/40 mb-2">// Web3 Hub //</p>
          <h1 className="heading-fire text-[clamp(36px,6vw,72px)] leading-none font-black mb-4">
            WEB3 & WALLET
          </h1>
          <div className="h-[2px] bg-gradient-to-r from-fire-3 via-fire-5 to-transparent" />
        </motion.div>

        {/* Wallet Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] border border-cyan/20 p-8 clip-cyber"
        >
          <p className="font-mono text-[9px] tracking-[3px] uppercase text-cyan/40 mb-2">Connectivity</p>
          <h2 className="font-orbitron font-black text-2xl text-cyan mb-6">CONNECT WALLET</h2>
          <p className="font-rajdhani text-fire-3/60 mb-6 text-lg">
            Connect your Web3 wallet to unlock NFT minting, token staking, and on-chain rewards.
          </p>
          <WalletConnectButton minimal={false} />
        </motion.div>

        <FireRule />

        {/* Staking Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10"
          >
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-fire-3/40 mb-2">Staking</p>
            <h2 className="font-orbitron font-black text-2xl text-fire-5 mb-6">TOKEN STAKING</h2>
            <TokenStakingDashboard athleteEmail={user.email} />
          </motion.div>
        )}
      </div>

      <FireRule />
      <Footer lang={lang} />
    </div>
  );
}