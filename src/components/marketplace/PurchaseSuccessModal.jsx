import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Share2 } from 'lucide-react';

export default function PurchaseSuccessModal({ transaction, onClose }) {
  return (
    <div className="fixed inset-0 z-[510] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[500px] bg-gradient-to-br from-[rgba(10,4,18,0.99)] to-[rgba(4,2,8,1)] border border-fire-3/20 clip-cyber p-8 text-center"
      >
        <div className="absolute top-0 left-0 right-0 fire-line" />

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center"
        >
          <CheckCircle2 size={40} className="text-white" />
        </motion.div>

        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-2 uppercase">
          Purchase Complete!
        </h2>
        <p className="font-mono text-[11px] tracking-[4px] uppercase text-fire-3/30 mb-6">
          Token Successfully Acquired
        </p>

        <div className="bg-fire-3/5 border border-fire-3/10 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-fire-3/40 tracking-[1px]">TRANSACTION ID</span>
            <span className="font-mono text-xs text-fire-4">{transaction.id?.substring(0, 12)}...</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-fire-3/40 tracking-[1px]">QUANTITY</span>
            <span className="font-orbitron text-sm font-bold text-fire-5">{transaction.quantity}x</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-fire-3/40 tracking-[1px]">TOTAL PAID</span>
            <span className="font-orbitron text-lg font-black text-fire-5">€{transaction.total_amount?.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan/10 to-cyan/5 border border-cyan/20 p-4 mb-6">
          <div className="font-mono text-[9px] text-cyan/60 tracking-[2px] uppercase mb-2">Next Steps</div>
          <p className="font-rajdhani text-sm text-fire-4/60 leading-relaxed">
            Your token has been added to your account. Check your email for receipt and access to exclusive holder perks.
          </p>
        </div>

        <div className="flex gap-3 mb-4">
          <button className="btn-ghost flex-1 text-[10px] py-2.5 px-3 flex items-center justify-center gap-2">
            <Download size={14} />
            Download Receipt
          </button>
          <button className="btn-ghost flex-1 text-[10px] py-2.5 px-3 flex items-center justify-center gap-2">
            <Share2 size={14} />
            Share
          </button>
        </div>

        <button onClick={onClose} className="btn-fire w-full text-[11px] py-3">
          CONTINUE EXPLORING
        </button>
      </motion.div>
    </div>
  );
}