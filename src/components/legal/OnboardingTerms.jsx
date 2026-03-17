import React from 'react';

export default function OnboardingTerms({ userType }) {
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  return (
    <div className="font-mono text-[11px] leading-relaxed text-fire-4/50 space-y-3">
      <div className="text-center mb-3">
        <h5 className="font-orbitron font-black text-sm tracking-[2px] text-fire-3 uppercase">
          PLATFORM TERMS OF SERVICE
        </h5>
        <p className="text-[10px] text-fire-3/60 mt-1">Street Dynamics Holding FZE — Version 1.2 ({currentDate})</p>
      </div>

      <div className="h-[1px] bg-fire-3/20 my-3" />

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">1. ACCOUNT CREATION & USER OBLIGATIONS</h6>
        <p className="text-[11px]">
          By creating an account on Street Dynamics, you agree to: (a) provide accurate, current information, 
          (b) maintain security of your password, (c) notify us immediately of unauthorized access, 
          (d) accept responsibility for all activities under your account.
        </p>
        <p className="text-[11px] mt-1">
          <strong className="text-fire-4">Age Requirement:</strong> You must be 13+ years old. 
          Users 13-17 require parental consent. Token purchases and revenue-sharing require age 18+.
        </p>
      </div>

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">2. DATA PROTECTION (GDPR + UAE)</h6>
        <p className="text-[11px]">
          Your data is processed per GDPR (EU) 2016/679 and UAE Data Protection Law (DIFC Law No. 5/2020). 
          Data Controller: Street Dynamics Holding FZE. You have rights to access, rectify, erase, port, and object. 
          Contact: privacy@streetdynamics.ae. Full Privacy Policy: www.streetdynamics.ae/privacy
        </p>
      </div>

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">
          3. {userType === 'athlete' ? 'ATHLETE-SPECIFIC TERMS' : 'SPECTATOR-SPECIFIC TERMS'}
        </h6>
        {userType === 'athlete' ? (
          <p className="text-[11px]">
            <strong className="text-fire-4">Profile & Performance:</strong> You authorize Street Dynamics to display your profile, 
            stats, and performance metrics publicly. You grant image rights for promotional use and NFT minting (subject to separate event consent).<br/>
            <strong className="text-fire-4">Token Creation:</strong> If tokenized, your name and likeness will be used to create digital assets (Athlete Tokens). 
            You receive 70% of sponsorship revenue; 20% goes to token holders; 10% platform fee.<br/>
            <strong className="text-fire-4">Content Ownership:</strong> You retain ownership of pre-existing content but grant Street Dynamics 
            a license to use event-generated content (photos, videos, highlights).
          </p>
        ) : (
          <p className="text-[11px]">
            <strong className="text-fire-4">Spectator Rights:</strong> You may purchase tokens, NFTs, and trade on secondary markets (age 18+ only). 
            You may vote on event outcomes and participate in community governance.<br/>
            <strong className="text-fire-4">Token Ownership:</strong> Tokens grant utility (voting, access, rewards) but NO equity in Street Dynamics Holding FZE. 
            No guarantee of financial return. Tokens are for platform engagement, not investment.<br/>
            <strong className="text-fire-4">Conduct:</strong> Respect athletes, other spectators, and staff. Harassment, hate speech, or disruptive behavior results in account suspension.
          </p>
        )}
      </div>

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">4. TOKENS, NFTs & BLOCKCHAIN (MiCA COMPLIANCE)</h6>
        <p className="text-[11px]">
          <strong className="text-fire-4">Classification:</strong> SD Tokens are utility tokens under EU MiCA Regulation 2023/1114. NOT securities.<br/>
          <strong className="text-fire-4">Age Restriction:</strong> Token/NFT purchases ONLY for users 18+. Minors CANNOT participate in tokenomics.<br/>
          <strong className="text-fire-4">Blockchain Immutability:</strong> NFT metadata is immutable once minted. Right to erasure applies only to off-chain personal identifiers.<br/>
          <strong className="text-fire-4">Smart Contract Risks:</strong> No warranty on smart contracts. You assume all risks: bugs, exploits, network failures.<br/>
          <strong className="text-fire-4">Royalty Distribution:</strong> Athlete sponsorship revenue split: 70% athlete, 20% token holders, 10% platform. 
          Distributions quarterly, minimum €100 threshold per athlete.
        </p>
      </div>

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">5. PROHIBITED ACTIVITIES</h6>
        <p className="text-[11px]">
          You may NOT: (a) create fake accounts or impersonate others, (b) manipulate voting or betting systems, 
          (c) use bots or automated tools, (d) violate intellectual property rights, (e) engage in money laundering or fraud, 
          (f) upload illegal, harmful, or offensive content, (g) harass or threaten other users.
        </p>
        <p className="text-[11px] mt-1">
          <strong className="text-red-400">Penalties:</strong> Account suspension, permanent ban, forfeiture of tokens/NFTs, legal action.
        </p>
      </div>

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">6. INTELLECTUAL PROPERTY</h6>
        <p className="text-[11px]">
          "Street Dynamics," all logos, trademarks, platform code, and design are owned by Street Dynamics Holding FZE. 
          You receive a limited, non-exclusive, non-transferable license to use the platform for personal purposes only.
        </p>
      </div>

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">7. LIMITATION OF LIABILITY</h6>
        <p className="text-[11px]">
          Street Dynamics Holding FZE is NOT liable for: (a) indirect, incidental, or consequential damages, 
          (b) loss of profits, data, or goodwill, (c) third-party actions, (d) force majeure events, 
          (e) smart contract failures, EXCEPT in cases of gross negligence or willful misconduct.
        </p>
        <p className="text-[11px] mt-1">
          <strong className="text-fire-4">Maximum Liability:</strong> Limited to fees paid by you in the 12 months prior to the claim.
        </p>
      </div>

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">8. TERMINATION</h6>
        <p className="text-[11px]">
          You may terminate your account anytime via settings. Street Dynamics may suspend/terminate accounts for: 
          (a) violation of these Terms, (b) fraudulent activity, (c) legal requirements, (d) inactivity (2+ years). 
          Termination does NOT erase blockchain data (immutable) or revoke minted NFTs.
        </p>
      </div>

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">9. DISPUTE RESOLUTION</h6>
        <p className="text-[11px]">
          <strong>Governing Law:</strong> DIFC Law (Dubai International Financial Centre).<br/>
          <strong>Process:</strong> (1) Negotiation (30 days), (2) Mediation (DIFC-LCIA), (3) Binding Arbitration in Dubai.<br/>
          <strong>Class Action Waiver:</strong> All disputes must be individual, no class actions.<br/>
          <strong>EU Consumers:</strong> Retain right to use local consumer protection authorities per EU Regulation 524/2013.
        </p>
      </div>

      <div>
        <h6 className="font-rajdhani font-bold text-xs text-fire-3 uppercase mb-1">10. AMENDMENTS</h6>
        <p className="text-[11px]">
          These Terms may be updated with 30 days' notice. Continued use constitutes acceptance. 
          Material changes affecting minors require renewed parental consent.
        </p>
      </div>

      <div className="bg-cyan/10 border border-cyan/30 p-4 mt-4">
        <p className="font-mono text-[10px] text-cyan/80 leading-relaxed">
          <strong>GDPR TRANSPARENCY:</strong> Data Controller: Street Dynamics FZE, IFZA Business Park, Dubai, UAE. 
          DPO: privacy@streetdynamics.ae. You may lodge complaints with UAE Data Office or your local EU supervisory authority. 
          Cross-border transfers use Standard Contractual Clauses (SCC). Data retention: 7-10 years per legal requirements.
        </p>
      </div>

      <div className="text-center mt-4 pt-3 border-t border-fire-3/20">
        <p className="text-[9px] text-fire-3/40">
          © 2026 Street Dynamics FZE — All Rights Reserved<br/>
          IFZA License [TBD] — Dubai, United Arab Emirates
        </p>
      </div>
    </div>
  );
}