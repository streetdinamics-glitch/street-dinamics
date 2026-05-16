import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CONTRACT_ADDRESSES, TIER_PRICES_MATIC, isContractDeployed, SUPPORTED_CHAIN_IDS } from './web3Config';
import { ATHLETE_TOKEN_ABI, TIER_TOKEN_ID, TIER_LABELS, TIER_COLORS, weiToMatic, shortAddress, explorerTxUrl } from './web3Utils';
import WalletConnectButton from './WalletConnectButton';

const STEPS = { confirm: 'confirm', wallet: 'wallet', minting: 'minting', success: 'success', error: 'error' };

export default function Web3PurchaseModal({ token, onClose, onSuccess }) {
  const [quantity, setQuantity]   = useState(1);
  const [step, setStep]           = useState(STEPS.confirm);
  const [errorMsg, setErrorMsg]   = useState('');
  const [dbSynced, setDbSynced]   = useState(false);
  const queryClient               = useQueryClient();

  const { address, isConnected }                        = useAccount();
  const chainId                                         = useChainId();
  const { switchChain }                                 = useSwitchChain();
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed }           = useWaitForTransactionReceipt({ hash: txHash });

  const price         = token.current_price || token.base_price;
  const pricePerMatic = TIER_PRICES_MATIC[token.token_tier] || '20';
  const totalMatic    = (parseFloat(pricePerMatic) * quantity).toFixed(0);
  const maxQty        = Math.min(token.available_supply || 1, 10);
  const tierId        = TIER_TOKEN_ID[token.token_tier] || 1;
  const tierColor     = TIER_COLORS[token.token_tier] || '#00ffee';

  const contractDeployed = isContractDeployed(chainId, 'athleteTokenNFT');
  const onSupportedChain = SUPPORTED_CHAIN_IDS.includes(chainId);

  // Step transitions based on wagmi state
  useEffect(() => { if (isPending) setStep(STEPS.wallet); }, [isPending]);
  useEffect(() => { if (isConfirming && txHash) setStep(STEPS.minting); }, [isConfirming, txHash]);

  // After on-chain confirmation → sync DB via backend
  useEffect(() => {
    if (!isConfirmed || !txHash || dbSynced) return;
    setDbSynced(true);
    syncDatabase();
  }, [isConfirmed, txHash]);

  const syncDatabase = async () => {
    try {
      // Call backend to record NFTOwnership + update supply
      await base44.functions.invoke('mintAthleteToken', {
        athleteTokenId:   token.id,
        recipientAddress: address,
        recipientEmail:   address, // wallet address as identifier
        amount:           quantity,
      });
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      queryClient.invalidateQueries({ queryKey: ['nft-owned'] });
      setStep(STEPS.success);
      setTimeout(() => onSuccess?.({ txHash }), 2500);
    } catch (err) {
      // DB sync failed but chain tx succeeded — show success anyway with warning
      console.warn('DB sync failed (on-chain mint succeeded):', err);
      toast.warning('Minted on-chain! Database sync issue — contact support if card missing.');
      setStep(STEPS.success);
    }
  };

  const handleMint = () => {
    if (!isConnected) { setStep(STEPS.confirm); return; }

    if (!onSupportedChain) {
      switchChain?.({ chainId: polygon.id });
      return;
    }

    if (!contractDeployed) {
      toast.error('Smart contract not yet deployed on this network.');
      return;
    }

    const contractAddress = CONTRACT_ADDRESSES.athleteTokenNFT[chainId];
    const value = parseEther(totalMatic);

    writeContract({
      address:      contractAddress,
      abi:          ATHLETE_TOKEN_ABI,
      functionName: 'mint',
      args:         [address, BigInt(tierId), BigInt(quantity), token.athlete_name],
      value,
    });
  };

  // Handle writeContract errors
  useEffect(() => {
    if (writeError) {
      const msg = writeError.shortMessage || writeError.message || 'Transaction rejected';
      setErrorMsg(msg);
      setStep(STEPS.error);
    }
  }, [writeError]);

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[520px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] clip-cyber p-6 md:p-8"
        style={{ border: `1px solid ${tierColor}44` }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${tierColor}, transparent)` }} />

        <button onClick={onClose} className="absolute top-3 right-4 text-white/20 hover:text-white/60 cursor-pointer">
          <X size={18} />
        </button>

        {/* Header */}
        <h2 className="font-orbitron font-black text-xl tracking-[2px] mb-0.5 uppercase"
          style={{ color: tierColor }}>
          Mint NFT Card
        </h2>
        <p className="font-mono text-[10px] tracking-[3px] uppercase mb-5" style={{ color: `${tierColor}66` }}>
          {TIER_LABELS[token.token_tier]} · Polygon Network
        </p>

        {/* Token Preview */}
        <div className="flex items-center gap-4 p-3 mb-5 border rounded"
          style={{ background: `${tierColor}08`, borderColor: `${tierColor}22` }}>
          <img
            src={token.avatar_url || `https://ui-avatars.com/api/?name=${token.athlete_name}&background=0a0412&color=${tierColor.slice(1)}`}
            alt={token.athlete_name}
            className="w-16 h-16 object-cover rounded border"
            style={{ borderColor: `${tierColor}44` }}
          />
          <div>
            <div className="font-orbitron font-bold text-base" style={{ color: tierColor }}>{token.athlete_name}</div>
            <div className="font-mono text-[9px] tracking-[1px] uppercase opacity-50">{token.sport} · #{token.card_number}</div>
            <div className="font-mono text-[11px] mt-1" style={{ color: tierColor }}>
              {pricePerMatic} MATIC / card
            </div>
          </div>
        </div>

        {/* ── CONFIRM STEP ── */}
        {step === STEPS.confirm && (
          <>
            {/* Quantity */}
            <div className="mb-4">
              <label className="font-mono text-[10px] tracking-[2px] uppercase opacity-40 block mb-2">Quantità</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 border border-white/10 text-white/60 hover:border-white/30 font-bold text-lg flex items-center justify-center">−</button>
                <span className="font-orbitron font-bold text-xl min-w-[50px] text-center" style={{ color: tierColor }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                  className="w-9 h-9 border border-white/10 text-white/60 hover:border-white/30 font-bold text-lg flex items-center justify-center">+</button>
                <span className="font-mono text-[9px] opacity-30 ml-auto">Max: {maxQty}</span>
              </div>
            </div>

            {/* Price summary */}
            <div className="p-4 mb-4 border rounded" style={{ background: `${tierColor}08`, borderColor: `${tierColor}22` }}>
              <div className="flex justify-between font-mono text-[10px] mb-1 opacity-50">
                <span>PREZZO UNITARIO</span><span>{pricePerMatic} MATIC</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] mb-1 opacity-50">
                <span>QUANTITÀ</span><span>×{quantity}</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] mb-2 opacity-40">
                <span>GAS FEES</span><span>~0.01 MATIC</span>
              </div>
              <div className="h-px mb-2" style={{ background: `${tierColor}22` }} />
              <div className="flex justify-between font-orbitron font-bold">
                <span style={{ color: tierColor }}>TOTALE</span>
                <span style={{ color: tierColor }}>{totalMatic} MATIC</span>
              </div>
            </div>

            {/* Wallet status */}
            {!isConnected ? (
              <div className="mb-4 p-4 border border-white/10 bg-white/5 text-center">
                <p className="font-mono text-[10px] opacity-50 mb-3">Connetti il wallet per mintare</p>
                <WalletConnectButton />
              </div>
            ) : (
              <div className="mb-4 p-3 border border-white/10 bg-white/5 flex items-center justify-between">
                <span className="font-mono text-[10px] opacity-40">WALLET</span>
                <span className="font-mono text-[11px]" style={{ color: tierColor }}>{shortAddress(address)}</span>
              </div>
            )}

            {/* Wrong chain warning */}
            {isConnected && !onSupportedChain && (
              <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 text-center">
                <p className="font-mono text-[10px] text-orange-400 mb-2">Passa a Polygon per mintare</p>
                <button onClick={() => switchChain?.({ chainId: polygon.id })}
                  className="font-orbitron text-[9px] px-4 py-1.5 border border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                  SWITCH TO POLYGON
                </button>
              </div>
            )}

            {/* Contract not deployed warning */}
            {isConnected && onSupportedChain && !contractDeployed && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30">
                <p className="font-mono text-[10px] text-yellow-400">
                  ⚠ Smart contract non ancora deployato su questa rete.
                  Imposta <code>VITE_NFT_CONTRACT_POLYGON</code> dopo il deploy.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-ghost py-3 px-5 text-[11px] border-white/10 text-white/40">
                Annulla
              </button>
              <button
                onClick={handleMint}
                disabled={!isConnected || isPending || !contractDeployed}
                className="flex-1 py-3 font-orbitron font-bold text-[11px] tracking-[2px] flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${tierColor}cc, ${tierColor}88)`, color: '#000' }}
              >
                <Wallet size={14} />
                {isPending ? 'Approva nel wallet…' : `MINT ${quantity > 1 ? `×${quantity}` : ''} NFT`}
              </button>
            </div>
          </>
        )}

        {/* ── WALLET PENDING ── */}
        {step === STEPS.wallet && (
          <div className="text-center py-10">
            <div className="w-14 h-14 border-4 border-white/10 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <Wallet size={24} style={{ color: tierColor }} />
            </div>
            <h3 className="font-orbitron font-bold text-lg mb-2" style={{ color: tierColor }}>
              Approva nel Wallet
            </h3>
            <p className="font-mono text-[11px] opacity-50">Conferma la transazione nel tuo wallet</p>
          </div>
        )}

        {/* ── MINTING ── */}
        {step === STEPS.minting && (
          <div className="text-center py-10">
            <div className="w-14 h-14 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: `${tierColor}22`, borderTopColor: tierColor }} />
            <h3 className="font-orbitron font-bold text-lg mb-2" style={{ color: tierColor }}>
              Minting on-chain…
            </h3>
            <p className="font-mono text-[10px] opacity-40 mb-3">In attesa di conferma Polygon</p>
            {txHash && (
              <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10px] underline opacity-60 hover:opacity-100"
                style={{ color: tierColor }}>
                <ExternalLink size={10} /> Vedi su Polygonscan
              </a>
            )}
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === STEPS.success && (
          <div className="text-center py-10">
            <CheckCircle size={60} className="mx-auto mb-4 text-green-400" />
            <h3 className="font-orbitron font-bold text-xl text-green-400 mb-2">NFT Mintato!</h3>
            <p className="font-mono text-sm opacity-50 mb-4">
              La card <span style={{ color: tierColor }}>{token.athlete_name}</span> è nel tuo wallet.
            </p>
            {txHash && (
              <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10px] underline text-green-400/70 hover:text-green-400 mb-4 block">
                <ExternalLink size={10} /> {txHash.slice(0, 20)}…
              </a>
            )}
            <button onClick={onClose}
              className="font-orbitron text-[11px] py-3 px-8 bg-green-500 hover:bg-green-400 text-black font-bold">
              VEDI LE MIE CARD
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === STEPS.error && (
          <div className="text-center py-10">
            <AlertCircle size={60} className="mx-auto mb-4 text-red-400" />
            <h3 className="font-orbitron font-bold text-xl text-red-400 mb-2">Minting Fallito</h3>
            <p className="font-mono text-xs text-red-400/60 mb-4 max-w-[340px] mx-auto">{errorMsg || 'Transazione rifiutata.'}</p>
            <button onClick={() => { setStep(STEPS.confirm); setErrorMsg(''); }}
              className="btn-fire text-[11px] py-3 px-8">
              RIPROVA
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}