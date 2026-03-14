import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function AIInterviewStep({ athleteData, onInterviewComplete, onProceed, isPending }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there! I'm the Street Dynamics Secretary AI. I'll conduct a quick interview to verify your athlete profile. Let's start with your background in the sports you listed. Tell me about your journey and what makes you stand out.",
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const runInterview = useMutation({
    mutationFn: async (userMessage) => {
      // Call AI secretary agent for interview
      const response = await base44.functions.invoke('athlete_secretary_interview', {
        athleteData,
        conversationHistory: messages,
        userMessage,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userInput },
        { role: 'assistant', content: data.response },
      ]);
      setUserInput('');

      if (data.interviewComplete) {
        setInterviewComplete(true);
        onInterviewComplete?.();
      }
    },
    onError: (err) => {
      toast.error('Interview error: ' + err.message);
    },
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    runInterview.mutate(userInput);
  };

  return (
    <div className="space-y-4">
      {/* Chat Messages */}
      <div className="bg-black/50 border border-fire-3/10 rounded p-4 h-[400px] overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded ${
                msg.role === 'user'
                  ? 'bg-fire-3/20 border border-fire-3/40 text-fire-3'
                  : 'bg-cyan/10 border border-cyan/40 text-cyan'
              }`}
            >
              <p className="font-rajdhani text-sm leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {runInterview.isPending && (
          <div className="flex gap-2 items-center text-cyan/60">
            <Loader size={16} className="animate-spin" />
            <span className="font-mono text-[10px]">Secretary is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Status */}
      {interviewComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-500/10 border border-green-500/30 p-3 rounded"
        >
          <p className="font-mono text-[11px] text-green-400 tracking-[1px]">
            INTERVIEW COMPLETED - Ready to finalize verification
          </p>
        </motion.div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Your response..."
          disabled={runInterview.isPending || isPending}
          className="cyber-input flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={runInterview.isPending || isPending || !userInput.trim()}
          className="btn-fire py-2 px-4 disabled:opacity-20"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Proceed Button */}
      {interviewComplete && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onProceed}
          disabled={isPending}
          className="btn-fire w-full py-3 disabled:opacity-20"
        >
          {isPending ? 'Finalizing Verification...' : 'Complete Verification'}
        </motion.button>
      )}
    </div>
  );
}