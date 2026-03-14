/**
 * NFT Minting Audit Log Component
 * 
 * COMPLIANCE NOTES:
 * - All mints are timestamped and buyer-identified
 * - Serial numbers are immutable and sequential
 * - Prices are locked at mint time
 * - Each NFT ownership creates an audit trail entry
 * 
 * This is a READ-ONLY audit trail. Do not modify historical records.
 * For legal/regulatory inquiries, export via DataExportTool component.
 */

import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, User, DollarSign } from 'lucide-react';

export default function NFTMintingAuditLog({ nftId }) {
  const { data: mintRecords = [] } = useQuery({
    queryKey: ['nft-mints', nftId],
    queryFn: () => 
      base44.entities.NFTOwnership.filter({ 
        nft_id: nftId,
        purchase_type: 'mint'
      }, '-minted_at', 100),
    initialData: [],
  });

  return (
    <div className="space-y-3">
      <h4 className="font-orbitron text-sm font-bold text-fire-4 tracking-[1px] uppercase">
        Minting History
      </h4>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {mintRecords.length === 0 ? (
          <div className="text-xs text-fire-3/40 py-4 text-center">No mints recorded</div>
        ) : (
          mintRecords.map((record, idx) => (
            <div key={record.id} className="bg-fire-3/5 border border-fire-3/10 p-3 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono font-bold text-fire-5">
                  #{record.serial_number}
                </div>
                <div className="text-fire-3/60">
                  {new Date(record.minted_at).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-fire-3/70">
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span className="truncate">{record.buyer_email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={12} />
                  <span>€{record.purchase_price}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="font-mono text-[9px] text-fire-3/40 mt-4 leading-relaxed">
        ⓘ All mint transactions are immutable. Serial numbers are assigned sequentially.
        Prices locked at time of purchase. For regulatory compliance, contact support.
      </p>
    </div>
  );
}