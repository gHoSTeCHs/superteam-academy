'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ZapIcon } from 'lucide-react';

interface XpBurstProps {
  xp: number;
  visible: boolean;
  onComplete?: () => void;
}

export function XpBurst({ xp, visible, onComplete }: XpBurstProps) {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [visible, onComplete]);

  if (!mounted || !animating) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="flex items-center gap-3"
        style={{
          animation: 'xpBurstRise 1.5s ease-out forwards',
        }}
      >
        <ZapIcon className="size-10 text-accent" style={{ color: '#ffd23f' }} />
        <span
          className="text-[48px] font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#ffd23f',
            textShadow: '0 2px 12px rgba(255, 210, 63, 0.4)',
          }}
        >
          +{xp} XP
        </span>
      </div>
      <style>{`
        @keyframes xpBurstRise {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.8);
          }
          30% {
            opacity: 1;
            transform: translateY(-20px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}
