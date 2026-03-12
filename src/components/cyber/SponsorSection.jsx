import React from 'react';

export default function SponsorSection() {
  return (
    <section id="sponsors" className="section-container">
      <p className="font-mono text-[10px] tracking-[7px] uppercase text-fire-3 text-center mb-2">// PARTNERSHIP & VISIBILITY //</p>
      <h2 className="heading-fire text-[clamp(36px,7vw,88px)] text-center leading-none mb-14 font-black">PARTNER WITH US</h2>

      <div className="max-w-[600px] mx-auto bg-black/45 border border-fire-3/20 p-8 md:p-10 text-center relative overflow-hidden clip-cyber">
        <div className="absolute top-0 left-0 right-0 fire-line" />
        <div className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-bl from-fire-5 to-fire-2" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

        <span className="text-4xl mb-3.5 block">📩</span>
        <div className="font-orbitron font-black text-[clamp(18px,3vw,26px)] tracking-[3px] uppercase text-fire-gradient mb-2.5">
          Interested in Sponsoring Street Dinamics?
        </div>
        <div className="font-rajdhani text-[17px] text-fire-4/45 leading-relaxed mb-7">
          Put your brand in front of Italy's street sports community. Live events, streaming audiences, and a passionate 13–30 demographic.
        </div>
        <a
          href="mailto:info@streetdinamics.it"
          className="inline-flex items-center gap-2.5 font-orbitron font-bold text-[13px] tracking-[2px] uppercase text-fire-4 border border-fire-3/35 py-3.5 px-7 transition-all hover:bg-fire-3/10 hover:border-fire-3 hover:text-fire-5 hover:shadow-[0_0_28px_rgba(255,100,0,0.2)] no-underline clip-btn"
        >
          📧 info@streetdinamics.it
        </a>
        <div className="font-mono text-[9px] tracking-[3px] text-fire-3/25 uppercase mt-4">
          Reply within 48h · Full brochure + packages sent on request
        </div>
      </div>
    </section>
  );
}