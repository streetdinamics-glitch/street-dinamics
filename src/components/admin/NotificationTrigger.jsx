import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function NotificationTrigger({ event, type }) {
  const [sending, setSending] = useState(false);

  const sendNotifications = useMutation({
    mutationFn: () => base44.functions.invoke('sendEventNotifications', {
      event_id: event.id,
      notification_type: type
    }),
    onSuccess: (response) => {
      toast.success(`Notified ${response.data.notified} users`);
      setSending(false);
    },
    onError: () => {
      toast.error('Failed to send notifications');
      setSending(false);
    }
  });

  const handleSend = () => {
    if (!confirm(`Send ${type === 'event_live' ? 'event live' : 'new vote'} notifications to all registered users?`)) {
      return;
    }
    setSending(true);
    sendNotifications.mutate();
  };

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className="btn-ghost text-[10px] py-2 px-4 flex items-center gap-2 disabled:opacity-30"
    >
      <Bell size={14} />
      {sending ? 'Sending...' : 'Notify Users'}
    </button>
  );
}