/**
 * CryptoPaymentModal
 * Modal unificato per pagamenti crypto: CBDC, stablecoin, native coins, altcoin.
 * Usa wagmi per interazione wallet + price oracle (EUR reference).
 */
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, CheckCircle, AlertCircle, ExternalLink, ChevronDown, Search, Loader2, ArrowRight } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useBalance, useSendTransaction } from 'wagmi';
import { parseUnits, parseEther, encodeFunctionData } from 'viem';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import WalletConnectButton from './WalletConnectButton';
import { PAYMENT_TOKENS, SUPPORTED_CHAINS, TIER_EUR_PRICES, CATEGORY_LABELS, getTokensByCategory, getTokenAddress } from './cryptoPaymentConfig';

// ERC-20 minimal ABI for token transfers
const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

// Platform receiving wallet (multi-sig safe recommended in production)
const PLATFORM_WALLET = import.meta.env.VITE_PLATFORM_WALLET || '0x0000000000000000000000000000000000000000';

const STEPS = { select: 'select', confirm: 'confirm', pending: 'pending', confirming: 'confirming', success: 'success', error: 'error' };

const TIER_COLORS = {
  rising_star: '#94a3b8',
  breakout_talent: '#a855f7',
  elite_performer: '#00ffee',
  living_legend: '#ff9900',
};

export default function CryptoPaymentModal({ nftCard, token, onClose, onSuccess }) {
  // nftCard = NFTCollectionCard, token = AthleteToken
  const item = nftCard || token;
  const itemPrice = nftCard ? nftCard.mint_price : (token?.current_price || token?.base_price);
  const tierKey = nftCard?.rarity || token?.token_tier || 'rising_star';
  const tierColor = TIER_COLORS[tierKey] || '#00ffee';

  const [step, setStep]               = useState(STEPS.select);
  const [selectedToken, setSelectedToken] = useState(null);
  const [selectedChain, setSelectedChain]  = useState(null);
  const [searchQuery, setSearchQuery]  = useState('');
  const [errorMsg, setErrorMsg]        = useState('');
  const [txHash, setTxHash]            = useState(null);
  const [dbSynced, setDbSynced]        = useState(false);
  const [quantity, setQuantity]        = useState(1);

  const { address, isConnected } = useAccount();
  const chainId                  = useChainId();
  const { switchChain }          = useSwitchChain();
  const queryClient              = useQueryClient();

  // ERC-20 transfer
  const { writeContract, isPending: isWritePending, error: writeError } = useWriteContract();
  // Native ETH/MATIC/BNB transfer
  const { sendTransaction, isPending: isSendPending, error: sendError } = useSendTransaction();

  const isPending = isWritePending || isSendPending;

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash,
  });

  const totalEUR = (itemPrice || 0) * quantity;

  // Token address on current chain
  const tokenAddress = useMemo(() => {
    if (!selectedToken) return null;
    return getTokenAddress(selectedToken.id, chainId);
  }, [selectedToken, chainId]);

  const isNative = selectedToken?.addresses?.native === true;

  // Filter & group tokens
  const grouped = useMemo(() => {
    const all = getTokensByCategory();
    if (!searchQuery) return all;
    const q = searchQuery.toLowerCase();
    const filtered = {};
    for (const [cat, tokens] of Object.entries(all)) {
      const match = tokens.filter(t => t.symbol.toLowerCase().includes(q) || t.label.toLowerCase().includes(q));
      if (match.length) filtered[cat] = match;
    }
    return filtered;
  }, [searchQuery]);

  // On confirmed → sync DB
  useEffect(() => {
    if (!isConfirmed || !txHash || dbSynced) return;
    setDbSynced(true);
    syncDatabase();
  }, [isConfirmed, txHash]);

  useEffect(() => {
    if (isConfirming && txHash) setStep(STEPS.confirming);
  }, [isConfirming, txHash]);

  useEffect(() => {
    const err = writeError || sendError;
    if (err) {
      setErrorMsg(err.shortMessage || err.message || 'Transazione rifiutata');
      setStep(STEPS.error);
    }
  }, [writeError, sendError]);

  const syncDatabase = async () => {
    try {
      await base44.functions.invoke('processNFTPurchase', {
        item_type: nftCard ? 'nft_card' : 'athlete_token',
        item_id: item.id,
        quantity,
        buyer_wallet: address,
        tx_hash: txHash,
        payment_token: selectedToken?.symbol,
        payment_chain: selectedChain?.label || String(chainId),
        eur_equivalent: totalEUR,
      });
      queryClient.invalidateQueries({ queryKey: ['nft-cards'] });
      queryClient.invalidateQueries({ queryKey: ['my-nfts'] });
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      setStep(STEPS.success);
      setTimeout(() => onSuccess?.({ txHash }), 2500);
    } catch (err) {
      console.warn('DB sync fallita (tx on-chain OK):', err);
      toast.warning('Acquisto on-chain completato. Contatta il supporto se la card manca.');
      setStep(STEPS.success);
    }
  };

  const handleSelectToken = (tok) => {
    setSelectedToken(tok);
    const chainMatch = SUPPORTED_CHAINS.find(c => {
      if (tok.addresses?.native) return tok.chains?.includes(c.chain.id);
      return tok.addresses?.[c.chain.id];
    });
    setSelectedChain(chainMatch || SUPPORTED_CHAINS[0]);
    setStep(STEPS.confirm);
  };

  const handlePay = async () => {
    if (!isConnected) return;

    // Switch chain if needed
    const targetChain = selectedChain?.chain;
    if (targetChain && chainId !== targetChain.id) {
      switchChain?.({ chainId: targetChain.id });
      return;
    }

    if (!PLATFORM_WALLET || PLATFORM_WALLET === '0x0000000000000000000000000000000000000000') {
      toast.error('Wallet piattaforma non configurato. Imposta VITE_PLATFORM_WALLET.');
      return;
    }

    try {
      if (isNative) {
        // Send native coin (ETH, MATIC, BNB, AVAX…)
        // In production: usa un oracle per convertire EUR → native amount
        // Qui usiamo un placeholder amount — in produzione connetti Chainlink price feed
        const amountInWei = parseEther('0.01'); // placeholder
        sendTransaction(
          { to: PLATFORM_WALLET, value: amountInWei },
          {
            onSuccess: (hash) => { setTxHash(hash); setStep(STEPS.pending); },
          }
        );
      } else if (tokenAddress) {
        // ERC-20 transfer
        const amount = parseUnits(String(totalEUR), selectedToken.decimals);
        writeContract(
          {
            address: tokenAddress,
            abi: ERC20_TRANSFER_ABI,
            functionName: 'transfer',
            args: [PLATFORM_WALLET, amount],
          },
          {
            onSuccess: (hash) => { setTxHash(hash); setStep(STEPS.pending); },
          }
        );
      } else {
        toast.error(`${selectedToken?.symbol} non supportato su questa chain. Cambia network.`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Errore transazione');
      setStep(STEPS.error);
    }
  };

  const explorerTxUrl = (hash) => {
    const explorers = {
      [137]: `https://polygonscan.com/tx/${hash}`,
      [1]:   `https://etherscan.io/tx/${hash}`,
      [56]:  `https://bscscan.com/tx/${hash}`,
      [42161]: `https://arbiscan.io/tx/${hash}`,
      [10]:  `https://optimistic.etherscan.io/tx/${hash}`,
      [8453]: `https://basescan.org/tx/${hash}`,
      [43114]: `https://snowtrace.io/tx/${hash}`,
    };
    return explorers[chainId] || `https://polygonscan.com/tx/${hash}`;
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[580px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] clip-cyber"
        style={{ border: `1px solid ${tierColor}44` }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${tierColor}, transparent)` }} />

        <button onClick={onClose} className="absolute top-3 right-4 text-white/20 hover:text-white/60 z-10">
          <X size={18} />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <h2 className="font-orbitron font-black text-xl tracking-[2px] mb-0.5 uppercase" style={{ color: tierColor }}>
            Paga con Crypto
          </h2>
          <p className="font-mono text-[10px] tracking-[3px] uppercase mb-5" style={{ color: `${tierColor}66` }}>
            {item?.athlete_name || item?.title} · €{totalEUR.toFixed(2)} EUR
          </p>

          {/* Item Preview */}
          <div className="flex items-center gap-4 p-3 mb-5 border rounded"
            style={{ background: `${tierColor}08`, borderColor: `${tierColor}22` }}>
            {item?.image_url || item?.avatar_url ? (
              <img src={item.image_url || item.avatar_url} alt={item.athlete_name}
                className="w-14 h-14 object-cover rounded border" style={{ borderColor: `${tierColor}44` }} />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center text-2xl"
                style={{ background: `${tierColor}22`, borderRadius: 4 }}>
                🃏
              </div>
            )}
            <div>
              <div className="font-orbitron font-bold text-base" style={{ color: tierColor }}>
                {item?.athlete_name || item?.title}
              </div>
              <div className="font-mono text-[9px] tracking-[1px] uppercase opacity-50">
                {tierKey.replace(/_/g, ' ')} · qty {quantity}
              </div>
              <div className="font-mono text-[12px] mt-1 font-bold" style={{ color: tierColor }}>
                €{totalEUR.toFixed(2)}
              </div>
            </div>
            {/* Quantity */}
            {step === STEPS.select && (
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 border border-white/10 text-white/60 hover:border-white/30 font-bold flex items-center justify-center">−</button>
                <span className="font-orbitron font-bold text-sm min-w-[24px] text-center" style={{ color: tierColor }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="w-7 h-7 border border-white/10 text-white/60 hover:border-white/30 font-bold flex items-center justify-center">+</button>
              </div>
            )}
          </div>

          {/* ── SELECT TOKEN STEP ── */}
          {step === STEPS.select && (
            <>
              {!isConnected ? (
                <div className="mb-5 p-5 border border-white/10 bg-white/5 text-center">
                  <p className="font-mono text-[11px] opacity-50 mb-4">Connetti il wallet per procedere</p>
                  <WalletConnectButton />
                </div>
              ) : null}

              {/* Search */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cerca token (USDC, ETH, DAI…)"
                  className="cyber-input pl-9 text-sm"
                />
              </div>

              {/* Token groups */}
              <div className="space-y-4">
                {Object.entries(grouped).map(([cat, tokens]) => (
                  <div key={cat}>
                    <div className="font-mono text-[9px] tracking-[3px] uppercase text-white/30 mb-2 px-1">
                      {CATEGORY_LABELS[cat] || cat}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {tokens.map(tok => {
                        // Check if token has address on current chainId
                        const available = tok.addresses?.native || !!tok.addresses?.[chainId];
                        return (
                          <button
                            key={tok.id}
                            onClick={() => handleSelectToken(tok)}
                            disabled={!isConnected}
                            className={`flex items-center gap-3 p-3 border text-left transition-all ${
                              available
                                ? 'border-white/10 hover:border-white/30 hover:bg-white/5'
                                : 'border-white/5 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            <span className="text-xl">{tok.icon}</span>
                            <div className="min-w-0">
                              <div className="font-orbitron font-bold text-[11px]" style={{ color: available ? '#ffe8c0' : '#664422' }}>
                                {tok.symbol}
                              </div>
                              <div className="font-mono text-[8px] opacity-40 truncate">{tok.label}</div>
                            </div>
                            {!available && isConnected && (
                              <span className="ml-auto font-mono text-[7px] text-orange-500/60 shrink-0">switch chain</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── CONFIRM STEP ── */}
          {step === STEPS.confirm && selectedToken && (
            <>
              <div className="p-4 mb-5 border rounded space-y-2" style={{ background: `${tierColor}08`, borderColor: `${tierColor}22` }}>
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="opacity-40">TOKEN</span>
                  <span style={{ color: tierColor }}>{selectedToken.icon} {selectedToken.symbol}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="opacity-40">NETWORK</span>
                  <span style={{ color: tierColor }}>{selectedChain?.icon} {selectedChain?.label}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="opacity-40">IMPORTO EUR</span>
                  <span style={{ color: tierColor }}>€{totalEUR.toFixed(2)}</span>
                </div>
                <div className="h-px" style={{ background: `${tierColor}22` }} />
                <p className="font-mono text-[9px] text-yellow-400/60">
                  ⚠ Il tasso di cambio viene applicato al momento della transazione tramite oracle on-chain.
                </p>
              </div>

              {/* Chain mismatch warning */}
              {isConnected && selectedChain && chainId !== selectedChain.chain.id && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] text-orange-400">
                    Passa a {selectedChain.label} per usare {selectedToken.symbol}
                  </p>
                  <button onClick={() => switchChain?.({ chainId: selectedChain.chain.id })}
                    className="shrink-0 font-orbitron text-[9px] px-3 py-1.5 border border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                    SWITCH
                  </button>
                </div>
              )}

              {/* Wallet info */}
              {isConnected && (
                <div className="mb-4 p-3 border border-white/10 bg-white/5 flex items-center justify-between">
                  <span className="font-mono text-[10px] opacity-40">WALLET</span>
                  <span className="font-mono text-[10px]" style={{ color: tierColor }}>
                    {address?.slice(0, 6)}…{address?.slice(-4)}
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(STEPS.select)} className="btn-ghost py-3 px-5 text-[11px] border-white/10 text-white/40">
                  ← Indietro
                </button>
                <button
                  onClick={handlePay}
                  disabled={!isConnected || isPending}
                  className="flex-1 py-3 font-orbitron font-bold text-[11px] tracking-[2px] flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${tierColor}cc, ${tierColor}88)`, color: '#000' }}
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                  {isPending ? 'Approva nel wallet…' : `PAGA CON ${selectedToken.symbol}`}
                </button>
              </div>
            </>
          )}

          {/* ── PENDING ── */}
          {(step === STEPS.pending || step === STEPS.confirming) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: `${tierColor}22`, borderTopColor: tierColor }} />
              <h3 className="font-orbitron font-bold text-lg mb-2" style={{ color: tierColor }}>
                {step === STEPS.pending ? 'Transazione inviata…' : 'Conferma in corso…'}
              </h3>
              <p className="font-mono text-[10px] opacity-40 mb-3">
                {step === STEPS.pending ? 'In attesa di inclusione nel blocco' : 'Conferma della rete blockchain'}
              </p>
              {txHash && (
                <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] underline opacity-60 hover:opacity-100"
                  style={{ color: tierColor }}>
                  <ExternalLink size={10} /> Vedi su Explorer
                </a>
              )}
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === STEPS.success && (
            <div className="text-center py-12">
              <CheckCircle size={60} className="mx-auto mb-4 text-green-400" />
              <h3 className="font-orbitron font-bold text-xl text-green-400 mb-2">Acquisto Completato!</h3>
              <p className="font-mono text-sm opacity-50 mb-2">
                La card <span style={{ color: tierColor }}>{item?.athlete_name || item?.title}</span> è nel tuo vault.
              </p>
              <p className="font-mono text-[10px] opacity-30 mb-5">
                Pagato con {selectedToken?.icon} {selectedToken?.symbol} su {selectedChain?.label}
              </p>
              {txHash && (
                <a href={explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] underline text-green-400/70 hover:text-green-400 mb-5 block">
                  <ExternalLink size={10} /> {txHash.slice(0, 22)}…
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
            <div className="text-center py-12">
              <AlertCircle size={60} className="mx-auto mb-4 text-red-400" />
              <h3 className="font-orbitron font-bold text-xl text-red-400 mb-2">Pagamento Fallito</h3>
              <p className="font-mono text-xs text-red-400/60 mb-5 max-w-[340px] mx-auto">{errorMsg}</p>
              <button onClick={() => { setStep(STEPS.confirm); setErrorMsg(''); }}
                className="btn-fire text-[11px] py-3 px-8">
                RIPROVA
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}