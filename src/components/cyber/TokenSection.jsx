import React from 'react';

const explainerItems = [
  { icon: '🃏', title: 'The Athlete Card', desc: 'Each athlete has their own digital Card — a token you can buy, hold, and sell. The earlier you buy, the less you pay.' },
  { icon: '📉', title: 'Scarcity by Level', desc: 'Every advance — Regional → National → Continental → International — fewer tokens issued. 1,000 Common down to 1 Legendary.' },
  { icon: '🏆', title: 'NFT Drop at Each Win', desc: 'When an athlete wins, all active token holders receive an exclusive NFT clip drop. Sell before the win? You get nothing.' },
  { icon: '⚡', title: 'The Snapshot', desc: 'The instant an athlete wins, the smart contract freezes time — photographing every active holder for the NFT drop.' },
  { icon: '👑', title: 'Sovereignty — You Vote', desc: 'Token holders vote to decide which performance clip becomes the official certified NFT. 10% cap per holder.' },
  { icon: '💰', title: 'Royalty Distribution', desc: '50% to the athlete, 50% split among all active token holders automatically via smart contract.' },
];

const levels = [
  { emoji: '🏙', name: 'COMMON', price: '~€1', supply: '1,000 tokens · Regional', cls: 'text-fire-4/70' },
  { emoji: '🇮🇹', name: 'UNCOMMON', price: '~€8–10', supply: '100 tokens · National · Bronze NFT', cls: 'text-purple-300/70 bg-purple-500/5' },
  { emoji: '🌍', name: 'RARE', price: '~€80–120', supply: '10 tokens · Continental · Silver NFT', cls: 'text-blue-300/70 bg-blue-500/5' },
  { emoji: '🌐', name: 'LEGENDARY', price: '~€1,000+', supply: '1 token only · International · Legendary NFT', cls: 'text-fire-5 bg-gradient-to-r from-fire-5/5 to-fire-3/5' },
];

export default function TokenSection() {
  return (
    <section id="tokens" className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">// NFT · BLOCKCHAIN · SCARCITY //</p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-14 font-black">ATHLETE TOKENS</h2>

      {/* Explainer */}
      <div className="max-w-[860px] mx-auto bg-gradient-to-br from-cyber-cyan/5 to-cyber-purple/5 border border-cyber-cyan/15 p-6 md:p-8 relative overflow-hidden mb-10">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent fire-line" />
        <div className="font-orbitron font-black text-sm tracking-[4px] uppercase text-cyber-cyan mb-4 flex items-center gap-2.5">
          🎫 How the Token System Works
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {explainerItems.map(item => (
            <div key={item.title} className="bg-black/35 border border-fire-3/10 p-3.5">
              <div className="text-xl mb-1.5">{item.icon}</div>
              <div className="font-orbitron font-bold text-[11px] tracking-[2px] text-fire-4 uppercase mb-1">{item.title}</div>
              <div className="font-rajdhani text-sm text-fire-4/50 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="font-mono text-[9px] tracking-[1px] text-fire-3/30 leading-loose border-t border-fire-3/10 pt-3 mt-3">
          ⚠ Token marketplace operates under Street Dinamics SRL (MiCA Reg. EU 2023/1114). Token values represent secondary market estimates, not guaranteed returns. Subject to Consob/Banca d'Italia supervision.
        </div>
      </div>

      {/* Level bar */}
      <div className="flex flex-wrap max-w-[860px] mx-auto border border-fire-3/10 overflow-hidden mb-10">
        {levels.map(lv => (
          <div key={lv.name} className={`flex-1 min-w-[120px] p-2.5 text-center font-orbitron text-[9px] font-bold tracking-[2px] uppercase border-r border-fire-3/10 last:border-r-0 ${lv.cls}`}>
            <span className="text-lg mb-0.5 block">{lv.emoji}</span>
            {lv.name}
            <div className="font-mono text-[9px] tracking-[1px] mt-0.5 opacity-70">{lv.price}</div>
            <div className="text-[8px] opacity-45 mt-0.5 tracking-[1px]">{lv.supply}</div>
          </div>
        ))}
      </div>

      {/* Snapshot banner */}
      <div className="max-w-[860px] mx-auto bg-black/50 border border-fire-5/20 border-l-[3px] border-l-fire-5 p-3.5 flex items-center gap-3.5 mb-10">
        <span className="text-xl flex-shrink-0">⚡</span>
        <div>
          <div className="font-orbitron font-bold text-[10px] tracking-[2px] uppercase text-fire-5 mb-0.5">The Snapshot — Last Man Standing Rule</div>
          <div className="font-rajdhani text-[13px] text-fire-4/50 leading-snug">
            The moment an athlete wins the final, the smart contract captures every active holder. Sell before the victory? You miss the NFT drop — permanently.
          </div>
        </div>
      </div>

      {/* Marketplace status */}
      <div className="text-center mt-10 p-7 border border-purple-500/15 bg-purple-500/5">
        <div className="font-orbitron text-[11px] tracking-[4px] text-purple-400/60 uppercase mb-2.5">⚡ Marketplace Status</div>
        <div className="font-rajdhani text-base text-purple-300/50 mb-4 leading-relaxed max-w-[600px] mx-auto">
          Full token marketplace launching with the first live event. Early access holders receive bonus NFT drops.
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          <button className="btn-cyan text-[9px] px-4 py-2.5">🔗 FOLLOW FOR UPDATES</button>
          <button className="btn-cyan text-[9px] px-4 py-2.5">📅 REGISTER FOR EVENT</button>
        </div>
      </div>
    </section>
  );
}