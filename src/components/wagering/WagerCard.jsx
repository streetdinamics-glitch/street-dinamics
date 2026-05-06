import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Shield, Zap, Lock, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '../web3/web3Config';
import { polygon } from 'wagmi/chains';

// Minimal ABI for AthleteWager.sol
const WAGER_ABI = [
  { name: 'createWager', type: 'function', inputs: [
    { name: 'matchId', type: 'bytes32' },
    { name: 'athleteTokenIdA', type: 'uint256' },
    { name: 'athleteTokenIdB', type: 'uint256' },
    { name: 'amount', type: 'uint256' },
  ], outputs: [{ name: 'wagerId', type: 'uint256' }], stateMutability: 'nonpayable' },
  { name: 'acceptWager', type: 'function', inputs: [{ name: 'wagerId', type: 'uint256' }], stateMutability: 'nonpayable' },
  { name: 'cancelWager', type: 'function', inputs: [{ name: 'wagerId', type: 'uint256' }], stateMutability: 'nonpayable' },
  { name: 'getWager', type: 'function', inputs: [{ name: 'wagerId', type: 'uint256' }], outputs: [{
    components: [
      { name: 'matchId', type: 'bytes32' }, { name: 'sideA', type: 'address' },
      { name: 'sideB', type: 'address' }, { name: 'athleteTokenIdA', type: 'uint256' },
      { name: 'athleteTokenIdB', type: 'uint256' }, { name: 'amount', type: 'uint256' },
      { name: 'status', type: 'uint8' }, { name: 'result', type: 'uint8' },
      { name: 'createdAt', type: 'uint256' },
    ], type: 'tuple'
  }], stateMutability: 'view' },
];

const ERC1155_ABI = [
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }, { name: 'id', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
];

const STATUS_MAP = { 0: 'Open', 1: 'Matched', 2: 'Resolved', 3: 'Refunded' };
const OUTCOME_MAP = { 0: 'Pending', 1: 'Side A Wins', 2: 'Side B Wins', 3: 'Draw', 4: 'Cancelled' };

function StatusBadge({ status }) {
  const conf = {
    Open:     { color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/8', dot: 'bg-yellow-400' },
    Matched:  { color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/8',       dot: 'bg-cyan-400 animate-pulse' },
    Resolved: { color: 'text-green-400 border-green-500/30 bg-green-500/8',    dot: 'bg-green-400' },
    Refunded: { color: 'text-gray-400 border-gray-500/30 bg-gray-500/8',       dot: 'bg-gray-400' },
  }[status] || { color: 'text-white/30 border-white/10 bg-white/5', dot: 'bg-white/30' };
  return (
    <span className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[2px] px-2.5 py-1 border ${conf.color}`}
      style={{ clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}>
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />{status}
    </span>
  );
}

export default function WagerCard({ match, athleteA, athleteB, existingWager, onWagerCreated }) {
  const { address, isConnected } = useAccount();
  const [amountInput, setAmountInput] = useState('10');
  const [step, setStep] = useState('idle'); // idle | approving | creating | accepting | done | error
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const wagerAddress = CONTRACT_ADDRESSES?.athleteWager?.[polygon.id] || '0x0000000000000000000000000000000000000000';
  const nftAddress   = CONTRACT_ADDRESSES?.athleteTokenNFT?.[polygon.id] || '0x0000000000000000000000000000000000000000';

  // Check if user holds sideA token
  const { data: holdsA } = useReadContract({
    address: nftAddress, abi: ERC1155_ABI,
    functionName: 'balanceOf',
    args: [address, BigInt(athleteA?.tokenId || 0)],
    query: { enabled: !!address && !!athleteA?.tokenId },
  });

  // Check if user holds sideB token
  const { data: holdsB } = useReadContract({
    address: nftAddress, abi: ERC1155_ABI,
    functionName: 'balanceOf',
    args: [address, BigInt(athleteB?.tokenId || 0)],
    query: { enabled: !!address && !!athleteB?.tokenId },
  });

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isTxPending } = useWaitForTransactionReceipt({ hash: txHash || undefined });

  const userSide  = holdsA && Number(holdsA) > 0 ? 'A' : holdsB && Number(holdsB) > 0 ? 'B' : null;
  const amount    = parseFloat(amountInput) || 0;
  const isLocked  = !isConnected || !userSide;
  const hasWager  = !!existingWager;
  const isOpen    = hasWager && existingWager.status === 0;
  const isMatched = hasWager && existingWager.status === 1;

  const handleCreate = async () => {
    if (!address || !match?.id || amount <= 0) return;
    setStep('creating'); setErrorMsg('');
    try {
      const hash = await writeContractAsync({
        address: wagerAddress, abi: WAGER_ABI,
        functionName: 'createWager',
        args: [
          `0x${match.id.padStart(64, '0')}`,
          BigInt(athleteA.tokenId),
          BigInt(athleteB.tokenId),
          parseEther(amountInput),
        ],
      });
      setTxHash(hash);
      setStep('done');
      onWagerCreated?.({ hash, side: 'A', amount });
    } catch (e) {
      setErrorMsg(e.shortMessage || e.message);
      setStep('error');
    }
  };

  const handleAccept = async () => {
    if (!existingWager?.id) return;
    setStep('accepting'); setErrorMsg('');
    try {
      const hash = await writeContractAsync({
        address: wagerAddress, abi: WAGER_ABI,
        functionName: 'acceptWager',
        args: [BigInt(existingWager.id)],
      });
      setTxHash(hash);
      setStep('done');
      onWagerCreated?.({ hash, side: 'B', amount: Number(formatEther(existingWager.amount || 0n)) });
    } catch (e) {
      setErrorMsg(e.shortMessage || e.message);
      setStep('error');
    }
  };

  const handleCancel = async () => {
    if (!existingWager?.id) return;
    setStep('creating'); setErrorMsg('');
    try {
      await writeContractAsync({
        address: wagerAddress, abi: WAGER_ABI,
        functionName: 'cancelWager',
        args: [BigInt(existingWager.id)],
      });
      setStep('done');
    } catch (e) {
      setErrorMsg(e.shortMessage || e.message);
      setStep('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-fire-3/20 bg-gradient-to-br from-[rgba(10,4,18,0.98)] to-[rgba(4,2,8,1)] overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
    >
      <div className="absolute top-0 left-0 right-0 fire-line" />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="font-mono text-[8px] tracking-[4px] uppercase text-fire-3/40">P2P WAGER</p>
          <p className="font-orbitron font-bold text-sm text-fire-4 mt-0.5">{match?.title || 'Match'}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasWager && <StatusBadge status={STATUS_MAP[existingWager.status]} />}
          <div className="flex items-center gap-1 font-mono text-[9px] text-cyan-400/60 border border-cyan-400/20 px-2 py-1">
            <Shield size={10} /> TOKEN GATED
          </div>
        </div>
      </div>

      {/* Athletes */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-5">
          {/* Athlete A */}
          <div className={`p-3 border text-center transition-all ${
            userSide === 'A' ? 'border-fire-3/60 bg-fire-3/10' : 'border-white/8 bg-white/2'
          }`} style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
            <div className="text-2xl mb-1">{athleteA?.avatar || '🏆'}</div>
            <div className="font-orbitron font-bold text-xs text-fire-4">{athleteA?.name || 'Athlete A'}</div>
            <div className="font-mono text-[8px] text-white/30 mt-0.5">{athleteA?.discipline}</div>
            {userSide === 'A' && <div className="font-mono text-[8px] text-fire-3 mt-1">YOUR SIDE</div>}
          </div>

          <div className="text-center">
            <div className="font-orbitron font-black text-lg text-fire-3/40">VS</div>
            <div className="font-mono text-[7px] text-white/15 mt-1">MATCH #{match?.id?.slice(0,6)}</div>
          </div>

          {/* Athlete B */}
          <div className={`p-3 border text-center transition-all ${
            userSide === 'B' ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/8 bg-white/2'
          }`} style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}>
            <div className="text-2xl mb-1">{athleteB?.avatar || '⚔️'}</div>
            <div className="font-orbitron font-bold text-xs text-cyan-400">{athleteB?.name || 'Athlete B'}</div>
            <div className="font-mono text-[8px] text-white/30 mt-0.5">{athleteB?.discipline}</div>
            {userSide === 'B' && <div className="font-mono text-[8px] text-cyan-400 mt-1">YOUR SIDE</div>}
          </div>
        </div>

        {/* Token gate notice */}
        {!isConnected && (
          <div className="mb-4 px-4 py-2.5 border border-yellow-500/30 bg-yellow-500/5 text-center">
            <p className="font-mono text-[9px] text-yellow-400">Connect wallet to participate in P2P wagering</p>
          </div>
        )}
        {isConnected && !userSide && (
          <div className="mb-4 px-4 py-2.5 border border-red-500/20 bg-red-500/5 text-center">
            <p className="font-mono text-[9px] text-red-400/80 flex items-center justify-center gap-1.5">
              <Lock size={10} /> You must hold an athlete token to wager on this match
            </p>
          </div>
        )}

        {/* Wager info if exists */}
        {hasWager && (
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'AMOUNT', value: `${formatEther(existingWager.amount || 0n)} $SD` },
              { label: 'STATUS', value: STATUS_MAP[existingWager.status] },
              { label: 'RESULT', value: OUTCOME_MAP[existingWager.result] },
            ].map(item => (
              <div key={item.label} className="border border-white/5 bg-white/2 py-2">
                <div className="font-mono text-[7px] text-white/25 uppercase mb-0.5">{item.label}</div>
                <div className="font-orbitron text-xs text-fire-4">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Action area */}
        <AnimatePresence mode="wait">
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 py-3 border border-green-500/30 bg-green-500/5">
              <CheckCircle size={14} className="text-green-400" />
              <span className="font-mono text-[10px] text-green-400">Transaction submitted</span>
              {txHash && (
                <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300">
                  <ExternalLink size={10} />
                </a>
              )}
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-2 py-3 px-4 border border-red-500/30 bg-red-500/5">
              <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="font-mono text-[9px] text-red-400">{errorMsg}</span>
            </motion.div>
          )}

          {step === 'idle' && !hasWager && !isLocked && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div>
                <label className="font-mono text-[8px] uppercase tracking-[2px] text-fire-3/40 block mb-1">
                  WAGER AMOUNT ($SD)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number" min="1"
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    className="cyber-input flex-1 text-center font-orbitron"
                    placeholder="10"
                  />
                  <div className="flex gap-1">
                    {['10', '50', '100'].map(v => (
                      <button key={v} onClick={() => setAmountInput(v)}
                        className={`font-mono text-[9px] px-2 py-1 border transition-all ${
                          amountInput === v ? 'border-fire-3 text-fire-3' : 'border-white/10 text-white/30 hover:border-fire-3/40'
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="font-mono text-[8px] text-white/20 mt-1">
                  Platform fee: 2.5% · Pot: {(amount * 2).toFixed(1)} $SD · Payout: {(amount * 2 * 0.975).toFixed(1)} $SD
                </p>
              </div>
              <button
                onClick={handleCreate}
                disabled={step !== 'idle' || amount <= 0 || isTxPending}
                className="btn-fire w-full py-3 text-[11px] tracking-[2px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap size={12} className="inline mr-1.5" />
                LOCK {amountInput} $SD — CHALLENGE SIDE {userSide === 'A' ? 'B' : 'A'}
              </button>
            </motion.div>
          )}

          {step === 'idle' && isOpen && existingWager?.sideA !== address && userSide === 'B' && (
            <motion.div key="accept" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button onClick={handleAccept} disabled={isTxPending}
                className="btn-fire w-full py-3 text-[11px] tracking-[2px] disabled:opacity-40">
                ACCEPT WAGER — LOCK {formatEther(existingWager.amount || 0n)} $SD
              </button>
            </motion.div>
          )}

          {step === 'idle' && isOpen && existingWager?.sideA === address && (
            <motion.div key="cancel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button onClick={handleCancel} disabled={isTxPending}
                className="btn-ghost w-full py-2 text-[10px] tracking-[2px] opacity-60 hover:opacity-100">
                CANCEL WAGER
              </button>
            </motion.div>
          )}

          {step === 'idle' && isMatched && (
            <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 py-3 border border-cyan-400/20 bg-cyan-400/5">
              <Lock size={12} className="text-cyan-400" />
              <span className="font-mono text-[10px] text-cyan-400">
                FUNDS LOCKED · Awaiting oracle resolution
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Oracle note */}
      <div className="px-5 py-2.5 border-t border-white/5 bg-white/[0.01]">
        <p className="font-mono text-[7px] text-white/20 text-center">
          Settlement triggered by Street Dinamics result oracle · Smart contract on Polygon
        </p>
      </div>
    </motion.div>
  );
}