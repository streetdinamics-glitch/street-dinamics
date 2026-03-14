import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export default function ExternalStreamChat({ kickUrl, youtubeUrl }) {
  const [activeStream, setActiveStream] = useState('youtube');

  const renderIframe = (url, platform) => {
    if (!url) return null;

    // Extract video ID from YouTube URL
    const getYoutubeId = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    if (platform === 'youtube') {
      const videoId = getYoutubeId(url);
      if (!videoId) return <p className="text-fire-3/40 text-sm">Invalid YouTube URL</p>;
      
      return (
        <iframe
          className="w-full h-full rounded border border-fire-3/20"
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (platform === 'kick') {
      // Kick embeds use a different format
      return (
        <iframe
          className="w-full h-full rounded border border-fire-3/20"
          src={url.includes('embed') ? url : `${url}/embed`}
          allowFullScreen
        />
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Stream Selector */}
      <div className="flex gap-2">
        {youtubeUrl && (
          <button
            onClick={() => setActiveStream('youtube')}
            className={`flex-1 px-4 py-2 text-sm font-mono tracking-[1px] uppercase transition-all ${
              activeStream === 'youtube'
                ? 'bg-fire-3 text-black border border-fire-3'
                : 'bg-transparent border border-fire-3/20 text-fire-3/60 hover:border-fire-3'
            }`}
          >
            📺 YouTube
          </button>
        )}
        {kickUrl && (
          <button
            onClick={() => setActiveStream('kick')}
            className={`flex-1 px-4 py-2 text-sm font-mono tracking-[1px] uppercase transition-all ${
              activeStream === 'kick'
                ? 'bg-fire-3 text-black border border-fire-3'
                : 'bg-transparent border border-fire-3/20 text-fire-3/60 hover:border-fire-3'
            }`}
          >
            🎬 Kick
          </button>
        )}
      </div>

      {/* Stream Embed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full bg-black border border-fire-3/20 rounded overflow-hidden"
        style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
      >
        <div className="absolute inset-0">
          {activeStream === 'youtube' ? (
            renderIframe(youtubeUrl, 'youtube')
          ) : (
            renderIframe(kickUrl, 'kick')
          )}
        </div>
      </motion.div>

      {/* Live Links */}
      <div className="flex gap-2">
        {youtubeUrl && (
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-fire-3/10 border border-fire-3/20 hover:border-fire-3 text-fire-4 text-sm font-mono text-center rounded transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} />
            Watch on YouTube
          </a>
        )}
        {kickUrl && (
          <a
            href={kickUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-fire-3/10 border border-fire-3/20 hover:border-fire-3 text-fire-4 text-sm font-mono text-center rounded transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} />
            Watch on Kick
          </a>
        )}
      </div>
    </div>
  );
}