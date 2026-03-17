import React from 'react';

export default function ComprehensiveContract({ type, isMinor = false }) {
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  return (
    <div className="font-mono text-[12px] leading-loose text-fire-4/40 space-y-4">
      <div className="text-center mb-4">
        <h5 className="font-orbitron font-black text-base tracking-[3px] text-fire-3 uppercase mb-2">
          COMPREHENSIVE PARTICIPATION AGREEMENT
        </h5>
        <p className="text-xs text-fire-3/60">Street Dinamics FZE (IFZA, Dubai, UAE)</p>
        <p className="text-xs text-fire-3/60">Version 1.2 — Effective Date: {currentDate}</p>
      </div>

      <div className="h-[1px] bg-fire-3/20 my-4" />

      {/* ARTICLE 1 - PARTIES */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 1 — IDENTIFICATION OF PARTIES
        </h5>
        <p className="mb-2">
          <strong className="text-fire-4">1.1 ORGANIZER:</strong><br/>
          Street Dynamics Holding FZE, a company duly incorporated under the laws of the Dubai International Free Zone Authority (IFZA), 
          with License No. [To Be Assigned], registered office at IFZA Business Park, P.O. Box [TBD], Dubai, United Arab Emirates.
        </p>
        <p className="mb-2">
          <strong className="text-fire-4">Contact Details:</strong><br/>
          • Legal: legal@streetdynamics.ae<br/>
          • Privacy/GDPR: privacy@streetdynamics.ae<br/>
          • Support: support@streetdynamics.ae
        </p>
        <p>
          <strong className="text-fire-4">1.2 PARTICIPANT:</strong><br/>
          The undersigned individual ("Participant"), {isMinor ? 'a minor under 18 years of age, represented by their parent/legal guardian signing below' : 'of legal age (18+ years)'}, 
          identified by the personal data provided during registration.
        </p>
      </div>

      {/* ARTICLE 2 - SCOPE */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 2 — SCOPE OF AGREEMENT
        </h5>
        <p>
          <strong className="text-fire-4">2.1</strong> This Agreement governs the Participant's {type === 'athlete' ? 'active participation as an athlete/competitor' : 'attendance as a spectator'} 
          in events organized, branded, or licensed by Street Dynamics Holding FZE ("the Platform").
        </p>
        <p>
          <strong className="text-fire-4">2.2</strong> Registration constitutes full and unconditional acceptance of: (a) these Terms and Conditions, 
          (b) Event-Specific Rules published at www.streetdynamics.ae/rules, (c) Street Dynamics Privacy Policy, 
          (d) Code of Conduct, and (e) Tokenomics & NFT Terms (if applicable).
        </p>
        <p>
          <strong className="text-fire-4">2.3</strong> The Participant acknowledges having read, understood, and agreed to all terms voluntarily, 
          without duress, and with full capacity to contract.
        </p>
      </div>

      {/* ARTICLE 3 - DATA PROTECTION */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 3 — DATA PROTECTION & PRIVACY (GDPR + UAE LAW)
        </h5>
        <p>
          <strong className="text-fire-4">3.1 DATA CONTROLLER:</strong><br/>
          Street Dynamics Holding FZE, acting as Data Controller under GDPR (EU) 2016/679 and UAE Data Protection Law (DIFC Law No. 5/2020).
        </p>
        <p>
          <strong className="text-fire-4">3.2 PURPOSE OF PROCESSING:</strong><br/>
          • Event registration, ticketing, access control (contract performance — GDPR Art. 6.1.b);<br/>
          • Communication regarding events, schedule changes, safety notices (legitimate interest — GDPR Art. 6.1.f);<br/>
          • Marketing and promotional communications (explicit consent — GDPR Art. 6.1.a, opt-in required);<br/>
          • Blockchain/token operations, NFT minting, royalty distributions (explicit consent — GDPR Art. 6.1.a);<br/>
          • Legal compliance, fraud prevention, platform security (legal obligation — GDPR Art. 6.1.c).
        </p>
        <p>
          <strong className="text-fire-4">3.3 DATA COLLECTED:</strong><br/>
          Personal identifiers (name, email, phone, date of birth), ID documents (for age verification), 
          biometric data (digital signature), payment information (processed by third-party PCI-DSS compliant providers), 
          performance metrics (if athlete), blockchain wallet addresses (if applicable).
        </p>
        <p>
          <strong className="text-fire-4">3.4 DATA RETENTION:</strong><br/>
          • Event data: 7 years from event date (compliance with UAE Commercial Transactions Law);<br/>
          • Financial records: 10 years (UAE tax law requirements);<br/>
          • Marketing data: Until consent withdrawal + 30 days;<br/>
          • Blockchain data: Immutable by nature; right to erasure applies only to off-chain personal identifiers.
        </p>
        <p>
          <strong className="text-fire-4">3.5 PARTICIPANT RIGHTS (GDPR Art. 15-22):</strong><br/>
          • <strong>Access:</strong> Request a copy of all personal data held (privacy@streetdynamics.ae);<br/>
          • <strong>Rectification:</strong> Correct inaccurate or incomplete data;<br/>
          • <strong>Erasure ("Right to be Forgotten"):</strong> Request deletion, subject to legal retention obligations and blockchain immutability;<br/>
          • <strong>Portability:</strong> Receive data in structured, machine-readable format (JSON/CSV);<br/>
          • <strong>Objection:</strong> Object to processing based on legitimate interest;<br/>
          • <strong>Restriction:</strong> Limit processing under certain conditions;<br/>
          • <strong>Withdraw Consent:</strong> Revoke consent at any time (does not affect prior lawful processing);<br/>
          • <strong>Lodge Complaint:</strong> File complaint with UAE Data Office (DIFC) or EU supervisory authority.
        </p>
        <p>
          <strong className="text-fire-4">3.6 CROSS-BORDER DATA TRANSFERS:</strong><br/>
          Data may be transferred outside UAE/EU to service providers (cloud hosting, payment processors, blockchain networks). 
          All transfers comply with GDPR Chapter V via: Standard Contractual Clauses (SCC), Binding Corporate Rules (BCR), 
          or adequacy decisions. List of third countries: [USA (SCC), Singapore (SCC), Switzerland (Adequacy)].
        </p>
        <p>
          <strong className="text-fire-4">3.7 MINORS (UNDER 18):</strong><br/>
          • Processing of minors' data requires explicit, verifiable parental consent (GDPR Art. 8);<br/>
          • Parent/guardian must co-sign this agreement and provide proof of parental authority;<br/>
          • Minors CANNOT purchase tokens, NFTs, or participate in revenue-sharing (age restriction: 18+);<br/>
          • Parents retain control over image rights and may revoke consent at any time.
        </p>
        <p>
          <strong className="text-fire-4">3.8 BLOCKCHAIN & RIGHT TO ERASURE:</strong><br/>
          Once data is written to a blockchain (e.g., NFT metadata), it becomes immutable and cannot be erased. 
          Upon erasure request, Street Dynamics will: (a) remove personal identifiers from off-chain databases, 
          (b) de-index blockchain records from search engines, (c) provide pseudonymization where possible. 
          This complies with GDPR recital 26 and CNIL guidelines on blockchain/GDPR compatibility.
        </p>
      </div>

      {/* ARTICLE 4 - IMAGE RIGHTS */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 4 — IMAGE RIGHTS, CONTENT LICENSE & TOKENIZATION
        </h5>
        <p>
          <strong className="text-fire-4">4.1 GRANT OF RIGHTS:</strong><br/>
          The Participant grants Street Dynamics Holding FZE and its affiliates a worldwide, royalty-free, 
          perpetual, irrevocable, transferable, sublicensable license to:
        </p>
        <p className="ml-4">
          • Capture, record, and produce photographs, videos, audio, biometric data, and performance metrics during events;<br/>
          • Use, reproduce, distribute, display, and create derivative works from such materials;<br/>
          • Publish on websites, social media (Instagram, TikTok, YouTube, Kick, Snapchat), mobile apps, broadcast media;<br/>
          • Mint NFTs embedding Participant's image, name, performance data, and event moments;<br/>
          • Sublicense to sponsors, media partners, blockchain platforms, and third-party distributors.
        </p>
        <p>
          <strong className="text-fire-4">4.2 TOKENIZATION & NFT MINTING:</strong><br/>
          The Participant expressly consents to the creation of digital assets (NFTs) representing their performance moments. 
          Such NFTs may be sold, traded, or distributed on blockchain networks. The Participant acknowledges:
        </p>
        <p className="ml-4">
          • NFTs are immutable once minted and cannot be deleted;<br/>
          • Street Dynamics retains commercial rights; NFT buyers receive limited display/ownership rights only;<br/>
          • The Participant receives no direct payment from NFT primary sales unless specified in separate athlete contract;<br/>
          • Secondary market royalties (if applicable) are distributed per published tokenomics.
        </p>
        <p>
          <strong className="text-fire-4">4.3 REVOCATION OF CONSENT:</strong><br/>
          Consent for future use may be revoked by written notice to privacy@streetdynamics.ae. 
          Revocation is effective within 30 days but does NOT affect: (a) content already published, 
          (b) NFTs already minted, (c) third-party sublicenses already granted, (d) archived event footage.
        </p>
        <p>
          <strong className="text-fire-4">4.4 MINORS — PARENTAL CONTROL:</strong><br/>
          For participants under 18, the parent/guardian grants the above rights on behalf of the minor and may revoke consent at any time. 
          Upon revocation, Street Dynamics will cease new content creation but cannot un-mint existing NFTs.
        </p>
      </div>

      {/* ARTICLE 5 - LIABILITY WAIVER */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 5 — LIABILITY WAIVER & ASSUMPTION OF RISK
        </h5>
        <p>
          <strong className="text-fire-4">5.1 ACKNOWLEDGMENT OF RISKS:</strong><br/>
          {type === 'athlete' ? (
            <>The Participant acknowledges that athletic competition involves inherent risks including but not limited to: 
            physical injury, disability, death, equipment failure, collisions, environmental hazards, and medical emergencies. 
            The Participant voluntarily assumes all such risks.</>
          ) : (
            <>The Participant acknowledges that attending live sports events involves risks including: crowd-related incidents, 
            environmental hazards, noise levels, and unpredictable events. The Participant voluntarily attends at their own risk.</>
          )}
        </p>
        <p>
          <strong className="text-fire-4">5.2 RELEASE OF LIABILITY:</strong><br/>
          To the fullest extent permitted by UAE and international law, the Participant releases and holds harmless 
          Street Dynamics Holding FZE, its directors, officers, employees, agents, sponsors, and affiliates from any and all liability for:
        </p>
        <p className="ml-4">
          • Personal injury, illness, disability, or death;<br/>
          • Property damage or loss;<br/>
          • Economic losses;<br/>
          • Emotional distress or reputational harm;<br/>
          arising from participation, EXCEPT in cases of gross negligence, willful misconduct, or fraud by Street Dynamics Holding FZE.
        </p>
        <p>
          <strong className="text-fire-4">5.3 INSURANCE COVERAGE:</strong><br/>
          Street Dynamics Holding FZE maintains comprehensive public liability insurance covering third-party bodily injury and property damage 
          during events, with minimum coverage of AED 5,000,000 per occurrence. Participants are encouraged to maintain personal health/accident insurance.
        </p>
        <p>
          <strong className="text-fire-4">5.4 MEDICAL AUTHORIZATION:</strong><br/>
          In case of medical emergency, the Participant authorizes Street Dynamics staff to seek emergency medical treatment on their behalf 
          and acknowledges responsibility for all associated costs.
        </p>
        <p>
          <strong className="text-fire-4">5.5 FITNESS DECLARATION:</strong><br/>
          {type === 'athlete' && (
            <>The Participant certifies they are in good physical health, have no medical conditions that would prevent safe participation, 
            and have consulted a physician if unsure. FALSE DECLARATION may result in immediate disqualification without refund.</>
          )}
        </p>
      </div>

      {/* ARTICLE 6 - CODE OF CONDUCT */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 6 — CODE OF CONDUCT & DISCIPLINARY MEASURES
        </h5>
        <p>
          <strong className="text-fire-4">6.1 PROHIBITED CONDUCT:</strong><br/>
          The Participant agrees to refrain from:
        </p>
        <p className="ml-4">
          • Violence, harassment, discrimination, hate speech, bullying;<br/>
          • Doping, performance-enhancing drugs, or substance abuse;<br/>
          • Cheating, match-fixing, or manipulation of results;<br/>
          • Vandalism, theft, or property damage;<br/>
          • Unauthorized commercial activity or solicitation;<br/>
          • Interference with event operations or safety protocols.
        </p>
        <p>
          <strong className="text-fire-4">6.2 DISCIPLINARY ACTIONS:</strong><br/>
          Violations may result in: (a) warning, (b) temporary suspension, (c) permanent ban from all Street Dynamics events, 
          (d) forfeiture of prizes/tokens/NFTs, (e) legal action if applicable. Decisions are made by a Disciplinary Committee 
          and may be appealed within 14 days to legal@streetdynamics.ae.
        </p>
        <p>
          <strong className="text-fire-4">6.3 ANTI-DOPING COMPLIANCE:</strong><br/>
          {type === 'athlete' && (
            <>Athletes competing in events may be subject to random drug testing in accordance with WADA (World Anti-Doping Agency) standards. 
            Refusal to test or positive results lead to immediate disqualification and potential lifetime ban.</>
          )}
        </p>
      </div>

      {/* ARTICLE 7 - PAYMENT & REFUNDS */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 7 — PAYMENT, FEES & REFUND POLICY
        </h5>
        <p>
          <strong className="text-fire-4">7.1 REGISTRATION FEES:</strong><br/>
          {type === 'athlete' 
            ? 'Athlete registration fees (if applicable) are non-refundable except as specified below.' 
            : 'Spectator ticket fees are non-refundable except as specified below.'}
        </p>
        <p>
          <strong className="text-fire-4">7.2 PARTICIPANT-INITIATED CANCELLATION:</strong><br/>
          • Cancellation 14+ days before event: 75% refund;<br/>
          • Cancellation 7-13 days before event: 50% refund;<br/>
          • Cancellation within 7 days: No refund;<br/>
          • No-show: No refund.
        </p>
        <p>
          <strong className="text-fire-4">7.3 ORGANIZER-INITIATED CANCELLATION:</strong><br/>
          • Event cancelled due to force majeure (weather, health emergency, government order, safety concern): Full refund within 30 business days;<br/>
          • Event rescheduled: Ticket/registration valid for new date; refund available if Participant cannot attend.
        </p>
        <p>
          <strong className="text-fire-4">7.4 REFUND PROCESSING:</strong><br/>
          Refunds processed via original payment method within 30 business days of approved request. 
          Processing fees (up to 5%) may be deducted. Cryptocurrency payments refunded in EUR equivalent at time of refund.
        </p>
      </div>

      {/* ARTICLE 8 - TOKENS & NFTs */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 8 — TOKEN SYSTEM, NFTs & BLOCKCHAIN MECHANICS
        </h5>
        <p>
          <strong className="text-fire-4">8.1 TOKEN CLASSIFICATION (MiCA COMPLIANCE):</strong><br/>
          Street Dynamics tokens ("SD Tokens") are classified as utility tokens under EU Regulation 2023/1114 (MiCA). 
          SD Tokens are NOT securities, do NOT represent equity in Street Dynamics Holding FZE, and carry NO voting rights in corporate governance.
        </p>
        <p>
          <strong className="text-fire-4">8.2 TOKEN UTILITIES:</strong><br/>
          SD Tokens grant access to: (a) event voting systems, (b) exclusive content, (c) VIP experiences, 
          (d) revenue-sharing from athlete sponsorships (via separate royalty smart contracts), (e) governance voting on platform features (NOT corporate decisions).
        </p>
        <p>
          <strong className="text-fire-4">8.3 NO GUARANTEE OF RETURN:</strong><br/>
          Token values may fluctuate. There is NO guarantee of financial return, profit, or capital appreciation. 
          Tokens are purchased for utility and platform engagement, NOT as investment instruments.
        </p>
        <p>
          <strong className="text-fire-4">8.4 AGE RESTRICTION:</strong><br/>
          Token purchases, NFT minting, and revenue-sharing participation are RESTRICTED to individuals 18 years of age or older. 
          Minors may NOT purchase, own, or trade tokens/NFTs directly. Parental purchase on behalf of minors is subject to separate custody arrangements.
        </p>
        <p>
          <strong className="text-fire-4">8.5 BLOCKCHAIN IMMUTABILITY:</strong><br/>
          NFTs are minted on [Polygon/Ethereum - TBD] blockchain. Once minted, metadata and ownership records are immutable. 
          Participants acknowledge that blockchain data CANNOT be deleted or altered.
        </p>
        <p>
          <strong className="text-fire-4">8.6 SMART CONTRACT RISKS:</strong><br/>
          Smart contracts are provided "AS IS" without warranty. Participants assume all risks including: coding errors, exploits, network failures, 
          gas fee volatility, regulatory changes. Street Dynamics is NOT liable for smart contract malfunctions.
        </p>
        <p>
          <strong className="text-fire-4">8.7 ROYALTY DISTRIBUTION MECHANICS:</strong><br/>
          Athletes who generate sponsorship revenue, prize money, or content licensing fees share 20% with token holders proportionally. 
          Distribution formula: (Token Holder's Tokens / Total Outstanding Tokens) × 20% of Gross Revenue. 
          Distributions occur quarterly, minimum threshold: €100 per athlete. Platform fee: 10% of gross revenue.
        </p>
      </div>

      {/* ARTICLE 9 - DIGITAL SIGNATURE */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 9 — DIGITAL SIGNATURE VALIDITY (eIDAS + UAE LAW)
        </h5>
        <p>
          <strong className="text-fire-4">9.1 LEGAL EFFECT:</strong><br/>
          The digital signature affixed via touchscreen/mouse is legally binding and enforceable under:
        </p>
        <p className="ml-4">
          • eIDAS Regulation (EU) 910/2014 (Advanced Electronic Signature for EU participants);<br/>
          • UAE Federal Law No. 1/2006 on Electronic Transactions and Commerce;<br/>
          • DIFC Law No. 2/2017 on Electronic Transactions;<br/>
          • UNCITRAL Model Law on Electronic Signatures.
        </p>
        <p>
          <strong className="text-fire-4">9.2 AUTHENTICATION:</strong><br/>
          Signature authenticity is established via: (a) timestamp, (b) IP address logging, (c) device fingerprint, 
          (d) SHA-256 hash of signature image, (e) email verification link sent post-signature. 
          The signature hash is cryptographically stored as proof of informed consent.
        </p>
        <p>
          <strong className="text-fire-4">9.3 PARENTAL CO-SIGNATURE (MINORS):</strong><br/>
          For minors, both the minor AND parent/guardian must sign. The parent confirms: 
          (a) parental authority, (b) understanding of all terms, (c) consent to image rights and data processing on behalf of minor.
        </p>
      </div>

      {/* ARTICLE 10 - INTELLECTUAL PROPERTY */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 10 — INTELLECTUAL PROPERTY RIGHTS
        </h5>
        <p>
          <strong className="text-fire-4">10.1 PLATFORM IP:</strong><br/>
          "Street Dynamics," "Street Dinamics," all logos, trademarks, service marks, trade dress, and associated intellectual property 
          are the exclusive property of Street Dynamics Holding FZE. Unauthorized use is prohibited and subject to legal action.
        </p>
        <p>
          <strong className="text-fire-4">10.2 USER-GENERATED CONTENT:</strong><br/>
          Participants may upload content (photos, videos, comments). By uploading, Participant grants Street Dynamics a license to use such content. 
          Participant represents they own all rights to uploaded content and it does not infringe third-party rights.
        </p>
        <p>
          <strong className="text-fire-4">10.3 DMCA / COPYRIGHT CLAIMS:</strong><br/>
          Copyright infringement claims should be sent to legal@streetdynamics.ae with: (a) identification of copyrighted work, 
          (b) location of infringing material, (c) contact information, (d) good-faith statement, (e) signature under penalty of perjury.
        </p>
      </div>

      {/* ARTICLE 11 - DISPUTE RESOLUTION */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 11 — GOVERNING LAW, JURISDICTION & DISPUTE RESOLUTION
        </h5>
        <p>
          <strong className="text-fire-4">11.1 GOVERNING LAW:</strong><br/>
          This Agreement is governed by and construed in accordance with the laws of the Dubai International Financial Centre (DIFC), 
          without regard to conflict of law principles.
        </p>
        <p>
          <strong className="text-fire-4">11.2 DISPUTE RESOLUTION PROCESS:</strong><br/>
          Any dispute arising from this Agreement shall be resolved as follows:
        </p>
        <p className="ml-4">
          <strong>Step 1 — Good-Faith Negotiation (30 days):</strong> Parties shall attempt to resolve via direct negotiation;<br/>
          <strong>Step 2 — Mediation (60 days):</strong> If unresolved, refer to DIFC-LCIA Arbitration Centre for mediation;<br/>
          <strong>Step 3 — Binding Arbitration:</strong> If mediation fails, submit to binding arbitration under DIFC-LCIA Arbitration Rules, 
          seat of arbitration: Dubai, language: English, number of arbitrators: 1 (disputes &lt; $50,000) or 3 (disputes ≥ $50,000).
        </p>
        <p>
          <strong className="text-fire-4">11.3 WAIVER OF CLASS ACTIONS:</strong><br/>
          Participant waives the right to participate in class action lawsuits or class-wide arbitration. 
          All disputes must be brought individually.
        </p>
        <p>
          <strong className="text-fire-4">11.4 JURISDICTION FOR EU CONSUMERS:</strong><br/>
          Notwithstanding the above, EU consumers retain the right to bring disputes before their local consumer protection authority 
          or courts in their country of residence per EU Regulation 524/2013 (ODR Platform).
        </p>
      </div>

      {/* ARTICLE 12 - MISCELLANEOUS */}
      <div>
        <h5 className="font-rajdhani font-bold text-sm tracking-[2px] text-fire-3 uppercase mb-2">
          ARTICLE 12 — MISCELLANEOUS PROVISIONS
        </h5>
        <p>
          <strong className="text-fire-4">12.1 SEVERABILITY:</strong><br/>
          If any provision is found invalid, illegal, or unenforceable, the remaining provisions remain in full force and effect.
        </p>
        <p>
          <strong className="text-fire-4">12.2 AMENDMENTS:</strong><br/>
          Street Dynamics Holding FZE reserves the right to amend these Terms with 30 days' prior notice via email and website publication. 
          Continued participation after amendments constitutes acceptance. Material changes affecting minors require renewed parental consent.
        </p>
        <p>
          <strong className="text-fire-4">12.3 ENTIRE AGREEMENT:</strong><br/>
          This Agreement constitutes the entire agreement between parties and supersedes all prior oral or written agreements.
        </p>
        <p>
          <strong className="text-fire-4">12.4 FORCE MAJEURE:</strong><br/>
          Neither party is liable for failure to perform due to causes beyond reasonable control (acts of God, war, terrorism, 
          pandemic, government action, natural disasters, network failures).
        </p>
        <p>
          <strong className="text-fire-4">12.5 ASSIGNMENT:</strong><br/>
          Participant may not assign rights or obligations without written consent. Street Dynamics may assign this Agreement 
          to affiliates or successors without consent.
        </p>
        <p>
          <strong className="text-fire-4">12.6 NOTICES:</strong><br/>
          All legal notices must be sent via registered email to addresses specified in Article 1. 
          Notices are deemed received 24 hours after email delivery confirmation.
        </p>
      </div>

      {/* SIGNATURE BLOCK */}
      <div className="mt-6 pt-4 border-t border-fire-3/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <p className="text-fire-3/60 mb-1">DATE & PLACE:</p>
            <p className="text-fire-4">{currentDate} — Dubai, UAE</p>
          </div>
          <div>
            <p className="text-fire-3/60 mb-1">AGREEMENT VERSION:</p>
            <p className="text-fire-4">v1.2 (March 2026)</p>
          </div>
        </div>
        
        <div className="mt-4 bg-fire-3/10 border border-fire-3/20 p-4">
          <p className="text-fire-3 text-xs mb-2">
            <strong>BINDING ENTITY:</strong> Street Dynamics Holding FZE (IFZA License, Dubai, UAE)
          </p>
          <p className="text-fire-3/60 text-xs">
            {isMinor 
              ? 'PARTICIPANT (Minor) & PARENT/LEGAL GUARDIAN: [Digital Signature Required Below]'
              : 'PARTICIPANT: [Digital Signature Required Below]'}
          </p>
        </div>
      </div>

      {/* GDPR NOTICE */}
      <div className="mt-4 bg-cyan/5 border border-cyan/20 p-4">
        <p className="text-cyan text-xs font-bold mb-1">📋 GDPR TRANSPARENCY NOTICE</p>
        <p className="text-cyan/60 text-xs leading-relaxed">
          Your data is processed in accordance with GDPR and UAE Data Protection Law. 
          You have the right to access, rectify, erase (subject to legal retention), port, or object to processing. 
          Contact our Data Protection Officer: privacy@streetdynamics.ae. 
          You may lodge complaints with the UAE Data Office (DIFC) or your local EU supervisory authority.
        </p>
      </div>
    </div>
  );
}