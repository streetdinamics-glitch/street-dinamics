import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Save, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const FIELDS = [
  {
    key: 'ATHLETE_TOKEN_ADDRESS',
    label: 'Athlete Token Contract Address',
    placeholder: '0x0000000000000000000000000000000000000000',
    hint: 'ERC-1155 contract address for Athlete Tokens on Polygon',
    sensitive: false,
    icon: '🏅',
  },
  {
    key: 'NFT_CLIPS_ADDRESS',
    label: 'NFT Clips Contract Address',
    placeholder: '0x0000000000000000000000000000000000000000',
    hint: 'ERC-1155 contract address for NFT Clips on Polygon',
    sensitive: false,
    icon: '🎬',
  },
  {
    key: 'POLYGON_RPC',
    label: 'Polygon RPC URL',
    placeholder: 'https://polygon-rpc.com',
    hint: 'RPC endpoint for Polygon mainnet (or Mumbai testnet)',
    sensitive: false,
    icon: '🔗',
  },
  {
    key: 'MINTING_PRIVATE_KEY',
    label: 'Minting Wallet Private Key',
    placeholder: '0x...',
    hint: '⚠️ This is the private key of the admin minting wallet. Keep this secret.',
    sensitive: true,
    icon: '🔑',
  },
];

// We store these as a simple entity record (key-value config store)
// Using a "Web3Config" approach stored on the admin's user record (safe, admin-only)
export default function Web3ConfigPanel() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState({
    ATHLETE_TOKEN_ADDRESS: '',
    NFT_CLIPS_ADDRESS: '',
    POLYGON_RPC: '',
    MINTING_PRIVATE_KEY: '',
  });
  const [showSensitive, setShowSensitive] = useState({});
  const [dirty, setDirty] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-self'],
    queryFn: () => base44.auth.me(),
  });

  // Load saved config from user's profile (admin-only field)
  useEffect(() => {
    if (user?.web3_config) {
      setValues(prev => ({ ...prev, ...user.web3_config }));
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: (config) => base44.auth.updateMe({ web3_config: config }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-self'] });
      toast.success('Web3 configuration saved');
      setDirty(false);
    },
    onError: (err) => toast.error('Failed to save: ' + err.message),
  });

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const handleSave = () => saveMutation.mutate(values);

  const isAddressValid = (val) => !val || /^0x[0-9a-fA-F]{40}$/.test(val);
  const isRpcValid = (val) => !val || val.startsWith('http');

  const validationStatus = (field) => {
    const val = values[field.key];
    if (!val) return null;
    if (field.key.includes('ADDRESS')) return isAddressValid(val);
    if (field.key === 'POLYGON_RPC') return isRpcValid(val);
    return true;
  };

  if (isLoading) {
    return <div className="text-center py-10 font-mono text-fire-3/30 text-xs tracking-[2px]">LOADING CONFIG...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-fire-gradient font-orbitron font-black text-2xl tracking-[2px] mb-1">
          ⛓️ WEB3 CONFIGURATION
        </h2>
        <p className="font-mono text-[10px] text-fire-3/40 tracking-[1px]">
          Smart contract addresses and RPC settings for minting operations on Polygon.
        </p>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20">
        <Shield size={16} className="text-yellow-500/70 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-orbitron text-[10px] text-yellow-400 tracking-[1px] uppercase mb-1">Admin-Only — Stored Securely</p>
          <p className="font-mono text-[9px] text-yellow-500/50 leading-relaxed">
            These values are stored on your admin account profile and are never exposed to regular users.
            The private key is used exclusively by server-side minting functions. Never share this panel.
          </p>
        </div>
      </div>

      {/* Config fields */}
      <div className="space-y-5">
        {FIELDS.map((field) => {
          const valid = validationStatus(field);
          const isVisible = showSensitive[field.key];
          return (
            <div key={field.key} className="p-5 border border-fire-3/10 bg-fire-3/3 clip-cyber">
              <div className="flex items-center justify-between mb-2">
                <label className="font-orbitron text-[11px] font-bold tracking-[2px] uppercase text-fire-4 flex items-center gap-2">
                  <span>{field.icon}</span>
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  {values[field.key] && valid === true && (
                    <CheckCircle2 size={13} className="text-green-400" />
                  )}
                  {values[field.key] && valid === false && (
                    <AlertCircle size={13} className="text-red-400" />
                  )}
                  {field.sensitive && (
                    <button
                      onClick={() => setShowSensitive(s => ({ ...s, [field.key]: !s[field.key] }))}
                      className="p-1 text-fire-3/30 hover:text-fire-3/70 transition-colors"
                    >
                      {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  type={field.sensitive && !isVisible ? 'password' : 'text'}
                  className={`cyber-input font-mono text-sm ${
                    values[field.key] && valid === false ? 'border-red-500/40' : ''
                  } ${values[field.key] && valid === true ? 'border-green-500/30' : ''}`}
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <p className={`font-mono text-[9px] mt-1.5 leading-relaxed ${
                field.sensitive ? 'text-yellow-500/50' : 'text-fire-3/30'
              }`}>
                {field.hint}
              </p>

              {values[field.key] && valid === false && (
                <p className="font-mono text-[9px] text-red-400/70 mt-1">
                  {field.key.includes('ADDRESS') ? 'Invalid Ethereum address format (must be 0x + 40 hex chars)' : 'Must start with http:// or https://'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Current saved state summary */}
      <div className="p-4 border border-white/8 bg-white/3">
        <p className="font-mono text-[9px] tracking-[2px] uppercase text-fire-3/30 mb-3">Current Status</p>
        <div className="grid grid-cols-2 gap-2">
          {FIELDS.map(field => {
            const saved = user?.web3_config?.[field.key];
            return (
              <div key={field.key} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${saved ? 'bg-green-400' : 'bg-fire-3/20'}`} />
                <span className="font-mono text-[9px] text-fire-3/40">{field.icon} {field.label.split(' ').slice(0,2).join(' ')}</span>
                <span className={`font-mono text-[9px] ${saved ? 'text-green-400' : 'text-fire-3/20'}`}>
                  {saved ? 'SET' : 'NOT SET'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !dirty}
          className="btn-fire text-[11px] py-3 px-8 flex items-center gap-2 disabled:opacity-30"
        >
          {saveMutation.isPending ? (
            <><RefreshCw size={13} className="animate-spin" /> Saving...</>
          ) : (
            <><Save size={13} /> Save Web3 Config</>
          )}
        </button>
        {!dirty && !saveMutation.isPending && (
          <span className="font-mono text-[9px] text-green-400/60 flex items-center gap-1">
            <CheckCircle2 size={11} /> Up to date
          </span>
        )}
      </div>
    </div>
  );
}