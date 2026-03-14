import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Wallet, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CONTRACT_ADDRESSES } from '@/lib/web3Config';
import { ATHLETE_TOKEN_ABI, eurToEth, generateTokenMetadata } from '@/lib/web3Utils';
import WalletConnectButton from './WalletConnectButton';

export default function Web3PurchaseModal({ token, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState('confirm'); // confirm, minting, success, error
  const queryClient = useQueryClient();
  
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const totalPriceEur = (token.current_price || token.base_price) * quantity;
  const totalPriceEth = eurToEth(totalPriceEur);
  const maxQuantity = Math.min(token.available_supply, 10);

  const recordPurchase = useMutation({
    mutationFn: async (txData) => {
      // Create transaction record
      const transaction = await base44.entities.TokenTransaction.create({
        token_id: token.id,
        buyer_email: address,
        seller_email: 'platform@streetdinamics.ae',
        transaction_type: 'primary_sale',
        quantity: quantity,
        price_per_token: token.current_price || token.base_price,
        total_amount: totalPriceEur,
        payment_status: 'completed',
        payment_method: 'crypto',
        transaction_hash: txHash,
      });

      // Create ownership record
      await base44.entities.TokenOwnership.create({
        athlete_name: token.athlete_name,
        token_tier: token.token_tier,
        purchase_price: token.current_price || token.base_price,
        purchase_date: new Date().toISOString().split('T')[0],
      });

      // Update token availability
      await base44.entities.AthleteToken.update(token.id, {
        available_supply: token.available_supply - quantity,
        status: token.available_supply - quantity === 0 ? 'sold_out' : 'active',
      });

      // Update athlete fan count
      const athleteStats = await base44.entities.AthleteStats.filter({ athlete_email: token.athlete_email });
      if (athleteStats.length > 0) {
        await base44.entities.AthleteStats.update(athleteStats[0].id, {
          fan_count: (athleteStats[0].fan_count || 0) + 1,
        });
      }

      return transaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      queryClient.invalidateQueries({ queryKey: ['my-tokens'] });
      setStep('success');
      setTimeout(() => {
        onSuccess?.(data);
      }, 2000);
    },
    onError: () => {
      setStep('error');
      toast.error('Failed to record purchase');
    }
  });

  React.useEffect(() => {
    if (isConfirmed && txHash) {
      recordPurchase.mutate({ txHash });
    }
  }, [isConfirmed, txHash]);

  React.useEffect(() => {
    if (isPending) {
      setStep('minting');
    }
  }, [isPending]);

  const handleMint = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!chain?.id || !CONTRACT_ADDRESSES.athleteTokenNFT[chain.id]) {
      toast.error('Please switch to a supported network');
      return;
    }

    try {
      const contractAddress = CONTRACT_ADDRESSES.athleteTokenNFT[chain.id];
      const pricePerToken = parseEther(eurToEth(token.current_price || token.base_price));
      const totalPrice = pricePerToken * BigInt(quantity);

      writeContract({
        address: contractAddress,
        abi: ATHLETE_TOKEN_ABI,
        functionName: 'mintToken',
        args: [address, token.athlete_name, token.token_tier],
        value: totalPrice,
      });
    } catch (error) {
      console.error('Minting error:', error);
      toast.error('Failed to mint token');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[550px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-cyan/30 clip-cyber p-6 md:p-8"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent" />
        <div className="absolute top-0 right-0 w-[22px] h-[22px] bg-gradient-to-bl from-cyan to-purple-500" style={{ clipPath: 'polygon(100% 0,100% 100%,0 0)' }} />

        <button onClick={onClose} className="absolute top-3 right-4 text-cyan/30 hover:text-cyan cursor-pointer">
          <X size={18} />
        </button>

        <h2 className="font-orbitron font-black text-2xl tracking-[2px] mb-1 uppercase bg-gradient-to-r from-cyan to-purple-400 bg-clip-text text-transparent">
          Mint NFT Token
        </h2>
        <p className="font-mono text-[11px] tracking-[4px] uppercase text-cyan/40 mb-6">Blockchain-Powered Athlete NFT</p>

        {/* Token Preview */}
        <div className="bg-cyan/5 border border-cyan/20 p-4 mb-5 flex items-center gap-4">
          <img
            src={token.avatar_url || 'https://via.placeholder.com/80'}
            alt={token.athlete_name}
            className="w-20 h-20 object-cover rounded border-2 border-cyan/30"
          />
          <div>
            <div className="font-orbitron font-bold text-lg text-cyan">{token.athlete_name}</div>
            <div className="font-mono text-[10px] text-cyan/40 tracking-[1px] uppercase">{token.sport} • {token.token_tier}</div>
            <div className="font-orbitron font-bold text-sm text-fire-4 mt-1">
              €{token.current_price || token.base_price} ≈ {eurToEth(token.current_price || token.base_price)} ETH
            </div>
          </div>
        </div>

        {step === 'confirm' && (
          <>
            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="font-mono text-[11px] tracking-[2px] uppercase text-cyan/40 block mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn-ghost text-[12px] py-2 px-4 border-cyan/20 text-cyan/60 hover:border-cyan/40"
                >
                  −
                </button>
                <div className="font-orbitron font-bold text-xl text-cyan min-w-[60px] text-center">{quantity}</div>
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  className="btn-ghost text-[12px] py-2 px-4 border-cyan/20 text-cyan/60 hover:border-cyan/40"
                >
                  +
                </button>
                <span className="font-mono text-[10px] text-cyan/30 ml-auto">Max: {maxQuantity}</span>
              </div>
            </div>

            {/* Wallet Connection */}
            {!isConnected && (
              <div className="mb-5 p-4 bg-cyan/5 border border-cyan/20 text-center">
                <p className="font-mono text-xs text-cyan/60 mb-3 tracking-[1px]">Connect your Web3 wallet to mint NFTs</p>
                <WalletConnectButton />
              </div>
            )}

            {/* Pricing Summary */}
            <div className="bg-gradient-to-r from-cyan/10 to-purple-500/10 border border-cyan/20 p-4 mb-5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-cyan/40 tracking-[1px]">PRICE (EUR)</span>
                <span className="font-rajdhani text-sm text-cyan/80">€{totalPriceEur.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-cyan/40 tracking-[1px]">PRICE (ETH)</span>
                <span className="font-rajdhani text-sm text-cyan/80">{totalPriceEth} ETH</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-cyan/40 tracking-[1px]">GAS FEES</span>
                <span className="font-rajdhani text-sm text-cyan/80">~$5-15</span>
              </div>
              <div className="h-[1px] bg-cyan/20 mb-2" />
              <div className="flex items-center justify-between">
                <span className="font-orbitron text-sm font-bold text-cyan tracking-[1px]">TOTAL</span>
                <span className="font-orbitron text-xl font-black text-cyan">{totalPriceEth} ETH</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-5 p-3 bg-purple-500/5 border border-purple-500/20">
              <p className="font-mono text-[9px] text-purple-400/60 tracking-[1px] uppercase mb-2">NFT Benefits:</p>
              <ul className="space-y-1">
                {token.token_benefits?.map((benefit, i) => (
                  <li key={i} className="font-rajdhani text-xs text-fire-4/70 flex items-start gap-2">
                    <span className="text-cyan">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-ghost py-3 px-5 text-[11px] border-cyan/20 text-cyan/60">
                Cancel
              </button>
              <button
                onClick={handleMint}
                disabled={!isConnected || isPending}
                className="btn-fire flex-1 text-[11px] py-3 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-cyan to-purple-500 hover:from-cyan/90 hover:to-purple-500/90"
              >
                <Wallet size={14} />
                {isPending ? 'Confirm in Wallet...' : 'Mint NFT'}
              </button>
            </div>
          </>
        )}

        {step === 'minting' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin mx-auto mb-4" />
            <h3 className="font-orbitron font-bold text-lg text-cyan mb-2">Minting NFT...</h3>
            <p className="font-mono text-xs text-cyan/60 tracking-[1px]">
              {isConfirming ? 'Waiting for blockchain confirmation...' : 'Please confirm transaction in your wallet'}
            </p>
            {txHash && (
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 font-mono text-[10px] text-cyan/80 hover:text-cyan underline"
              >
                View on Explorer →
              </a>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
            <h3 className="font-orbitron font-bold text-xl text-green-400 mb-2">NFT Minted!</h3>
            <p className="font-mono text-sm text-cyan/60 tracking-[1px] mb-4">
              Your {token.athlete_name} token has been successfully minted to your wallet
            </p>
            <button onClick={() => onClose()} className="btn-fire text-[11px] py-3 px-6 bg-green-500 hover:bg-green-600">
              View My Tokens
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-8">
            <AlertCircle size={64} className="text-red-400 mx-auto mb-4" />
            <h3 className="font-orbitron font-bold text-xl text-red-400 mb-2">Minting Failed</h3>
            <p className="font-mono text-sm text-red-400/60 tracking-[1px] mb-4">
              {writeError?.message || 'Transaction failed. Please try again.'}
            </p>
            <button onClick={() => setStep('confirm')} className="btn-fire text-[11px] py-3 px-6">
              Try Again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}