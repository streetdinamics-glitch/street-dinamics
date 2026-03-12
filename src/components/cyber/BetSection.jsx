import React from 'react';

export default function BetSection({ hasRegistration, onScrollToEvents }) {
  return (
    <section id="gamification" className="section-container relative min-h-[460px]" style={{ background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(0,255,238,0.03), transparent 65%)' }}>
      <p className="font-mono text-[9px] tracking-[6px] uppercase text-fire-3/40 text-center mb-3.5">// LIVE · ETHICAL · FREE REWARDS //</p>
      <h2 className="text-fire-gradient font-orbitron font-black text-[clamp(28px,5vw,56px)] tracking-[3px] text-center mb-2 leading-tight">BET & WIN</h2>
      <p className="font-rajdhani text-[clamp(15px,2.4vw,19px)] text-fire-4/35 text-center mb-12 tracking-[1px]">
        Register for an event first — then bet on fellow athletes during the live show. Predict outcomes, win real prizes.
      </p>

      {!hasRegistration ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-5">
          <span className="text-5xl mb-4">🔒</span>
          <div className="font-orbitron font-black text-lg tracking-[3px] uppercase text-fire-4 mb-2.5">Registration Required</div>
          <div className="font-rajdhani text-base text-fire-4/50 mb-6 leading-relaxed max-w-[420px]">
            You need to register as an Athlete or Spectator for an event before you can place bets. The system is free — no real money, real prizes at the event.
          </div>
          <button onClick={onScrollToEvents} className="btn-fire text-[11px] py-3 px-6">👆 VIEW EVENTS & REGISTER</button>
        </div>
      ) : (
        <div>
          {/* My bets */}
          <div className="max-w-[1060px] mx-auto mb-12">
            <div className="flex items-baseline justify-between mb-4 border-b border-cyber-cyan/10 pb-3">
              <div className="font-orbitron font-extrabold text-[13px] tracking-[3px] uppercase text-cyber-cyan">🎯 MY BETS</div>
              <div className="font-mono text-[9px] tracking-[2px] text-fire-3/30 uppercase">Place bets via the 🎯 BET button on each event card ↑</div>
            </div>
            <div className="text-center py-10">
              <span className="text-3xl block mb-2.5">🎯</span>
              <div className="font-mono text-xs tracking-[2px] text-fire-3/30 leading-loose">
                No bets placed yet.<br />Use the 🎯 BET button on any event card to start.
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="flex flex-col md:flex-row items-stretch gap-0 max-w-[1060px] mx-auto mb-7">
            {[
              { num: '01', text: <><strong className="text-fire-4/85">Register</strong> as Athlete or Spectator for any event above</> },
              { num: '02', text: <><strong className="text-fire-4/85">Hit 🎯 BET</strong> on the event card — select athlete, market & prediction</> },
              { num: '03', text: <><strong className="text-fire-4/85">Watch the event live</strong> — admin marks results in real time</> },
              { num: '04', text: <><strong className="text-fire-4/85">Win?</strong> Show your reward QR at the merch/food stand during the event</> },
            ].map((step, i) => (
              <React.Fragment key={step.num}>
                <div className="flex-1 p-5 bg-black/30 border border-fire-3/10">
                  <div className="font-orbitron font-black text-xl text-fire-3/25 mb-2">{step.num}</div>
                  <div className="font-rajdhani text-[15px] text-fire-4/50 leading-relaxed">{step.text}</div>
                </div>
                {i < 3 && <div className="hidden md:flex items-center px-2 font-orbitron text-lg text-fire-3/20">→</div>}
              </React.Fragment>
            ))}
          </div>

          <div className="max-w-[860px] mx-auto font-mono text-[11px] tracking-[1px] text-white/15 text-center leading-loose p-4 border border-dashed border-white/5">
            ⚠ Free ethical betting — no real money. Prizes are physical (food, merch, VIP access) redeemable only at live events via QR code.
          </div>
        </div>
      )}
    </section>
  );
}