import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle, FileText, User } from 'lucide-react';
import { toast } from 'sonner';

export default function MinorRegistrationApproval() {
  const queryClient = useQueryClient();
  const [selectedReg, setSelectedReg] = useState(null);

  const { data: pendingRegistrations = [] } = useQuery({
    queryKey: ['pending-minor-registrations'],
    queryFn: () => base44.entities.Registration.filter({ 
      status: 'pending',
      is_minor: true
    }),
    initialData: [],
  });

  const approveMutation = useMutation({
    mutationFn: async (regId) => {
      return await base44.entities.Registration.update(regId, {
        status: 'confirmed',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-minor-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      setSelectedReg(null);
      toast.success('Minor registration approved!');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (regId) => {
      return await base44.entities.Registration.update(regId, {
        status: 'rejected',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-minor-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      setSelectedReg(null);
      toast.success('Registration rejected.');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-cyan" />
        <h3 className="font-orbitron font-bold text-xl text-cyan">MINOR REGISTRATION APPROVALS</h3>
      </div>

      <div className="bg-cyan/10 border border-cyan/30 p-5">
        <p className="font-mono text-xs text-cyan/80 leading-relaxed">
          <strong>CRITICAL:</strong> All registrations from minors (under 18) require manual verification of parental consent 
          before confirmation. Verify: (1) Parent signature matches ID, (2) Parent ID document is valid, 
          (3) Parent relationship is legitimate, (4) All required fields are complete.
        </p>
      </div>

      {pendingRegistrations.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <p className="font-mono text-sm text-fire-3/60 tracking-[2px]">
            NO PENDING MINOR REGISTRATIONS
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRegistrations.map((reg) => (
            <div key={reg.id} className="bg-fire-3/5 border border-fire-3/20 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={18} className="text-fire-5" />
                    <h4 className="font-orbitron font-bold text-lg text-fire-5">
                      {reg.first_name} {reg.last_name}
                    </h4>
                    <div className="px-2 py-1 bg-cyan/20 border border-cyan/40 text-cyan text-xs font-mono tracking-[1px]">
                      MINOR
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs mb-3">
                    <div>
                      <span className="text-fire-3/60">Age:</span>
                      <p className="text-fire-4 font-semibold">{reg.age_at_registration} years</p>
                    </div>
                    <div>
                      <span className="text-fire-3/60">Email:</span>
                      <p className="text-fire-4 font-semibold">{reg.email}</p>
                    </div>
                    <div>
                      <span className="text-fire-3/60">Sport:</span>
                      <p className="text-fire-4 font-semibold">{reg.sport || 'Spectator'}</p>
                    </div>
                    <div>
                      <span className="text-fire-3/60">Type:</span>
                      <p className="text-fire-4 font-semibold capitalize">{reg.type}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReg(selectedReg?.id === reg.id ? null : reg)}
                    className="btn-cyan text-xs py-2 px-4"
                  >
                    {selectedReg?.id === reg.id ? 'HIDE DETAILS' : 'VIEW PARENTAL CONSENT'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => approveMutation.mutate(reg.id)}
                    disabled={approveMutation.isPending}
                    className="p-3 bg-green-500/10 border border-green-500/40 text-green-400 hover:bg-green-500/20 transition-all"
                    title="Approve"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(reg.id)}
                    disabled={rejectMutation.isPending}
                    className="p-3 bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Reject"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Parental Consent Details */}
              {selectedReg?.id === reg.id && reg.parental_consent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-cyan/10 border-2 border-cyan/40 p-5 mt-4"
                >
                  <h5 className="font-orbitron font-bold text-sm text-cyan mb-4 flex items-center gap-2">
                    <FileText size={16} />
                    PARENTAL CONSENT VERIFICATION
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="font-mono text-xs text-cyan/60">Parent Name:</span>
                      <p className="font-rajdhani font-bold text-cyan">
                        {reg.parental_consent.parent_full_name}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-cyan/60">ID Number:</span>
                      <p className="font-rajdhani font-bold text-cyan">
                        {reg.parental_consent.parent_id_number}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-cyan/60">Relationship:</span>
                      <p className="font-rajdhani font-bold text-cyan capitalize">
                        {reg.parental_consent.parent_relationship?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-cyan/60">Parent Email:</span>
                      <p className="font-rajdhani font-bold text-cyan">
                        {reg.parental_consent.parent_email}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-cyan/60">Parent Phone:</span>
                      <p className="font-rajdhani font-bold text-cyan">
                        {reg.parental_consent.parent_phone}
                      </p>
                    </div>
                  </div>

                  {/* Parent Signature */}
                  {reg.parental_consent.signature_url && (
                    <div className="bg-black/60 border border-cyan/30 p-4">
                      <p className="font-mono text-xs text-cyan/60 mb-2">Parent/Guardian Signature:</p>
                      <img
                        src={reg.parental_consent.signature_url}
                        alt="Parent signature"
                        className="max-h-24 border border-cyan/40 bg-black p-2"
                      />
                    </div>
                  )}

                  {/* Verification Checklist */}
                  <div className="mt-4 bg-fire-3/10 border border-fire-3/20 p-4">
                    <p className="font-mono text-xs text-fire-4 font-bold mb-2">ADMIN VERIFICATION CHECKLIST:</p>
                    <div className="space-y-1 text-xs font-mono text-fire-3/60">
                      <p>☐ Parent full name matches ID document</p>
                      <p>☐ Parent ID/passport number is valid and not expired</p>
                      <p>☐ Relationship to minor is documented (mother/father/guardian)</p>
                      <p>☐ Digital signature is present and legible</p>
                      <p>☐ Parent email and phone are reachable</p>
                      <p>☐ All declarations are complete</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legal Notice */}
      <div className="bg-fire-3/5 border border-fire-3/20 p-5">
        <h5 className="font-orbitron font-bold text-sm text-fire-4 mb-3">LEGAL COMPLIANCE REQUIREMENTS</h5>
        <div className="font-mono text-xs text-fire-3/60 space-y-2">
          <p>
            <strong className="text-fire-4">GDPR Article 8:</strong> Processing of minors' data (under 16 in EU, under 18 in UAE) 
            requires verifiable parental consent.
          </p>
          <p>
            <strong className="text-fire-4">UAE Child Protection Law:</strong> Organizations must maintain records of parental consent 
            for minors participating in organized activities.
          </p>
          <p>
            <strong className="text-fire-4">Documentation Retention:</strong> Store parental consent records for minimum 7 years 
            after the minor reaches age 18.
          </p>
          <p>
            <strong className="text-fire-4">Verification Standards:</strong> Admin must verify (1) ID authenticity, (2) Signature legitimacy, 
            (3) Parental authority, (4) Contact reachability before approving.
          </p>
        </div>
      </div>
    </div>
  );
}