'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Menu, Volume2, Sun, Moon } from 'lucide-react';

interface TirupatiHeaderBannerProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function TirupatiHeaderBanner({ onMenuClick, showMenuButton = true }: TirupatiHeaderBannerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  // Sacred Temple Bell Chime using Web Audio API (Bronze bell harmonics)
  const playSacredChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      setIsPlaying(true);

      // Multi-harmonic bronze temple bell sound (fundamental 432Hz + overtones)
      const frequencies = [432, 864, 1296, 1728];
      const gains = [0.45, 0.28, 0.18, 0.09];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Natural exponential decay of a sacred temple bronze bell
        gainNode.gain.setValueAtTime(gains[idx], ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 3.3);
      });

      setTimeout(() => {
        setIsPlaying(false);
      }, 3300);
    } catch (e) {
      console.warn('Audio chime could not play', e);
      setIsPlaying(false);
    }
  };

  return (
    <header className="w-full relative select-none shadow-md overflow-hidden bg-stone-950">
      {/* ── Natural Responsive Banner Image (Zero Cropping, 100% Fit) ── */}
      <img
        src={isDark ? '/images/banner-dark.png' : '/images/banner-light.png'}
        alt="Arulmigu Shridevi Poodevi Shri Varatharaja Perumal Alayam"
        className="w-full h-auto block select-none pointer-events-none transition-opacity duration-300"
      />

      {/* ── Mobile Sidebar Menu Button ── */}
      {showMenuButton && (
        <div className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-1.5 sm:p-2 rounded-full bg-black/45 hover:bg-black/70 text-white transition-colors flex-shrink-0 border border-white/30 backdrop-blur-md shadow-md cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>
        </div>
      )}

      {/* ── In-Artwork Interactive Celestial Hotspot (Moon in Dark / Sun in Light) ── */}
      {isDark ? (
        /* ── Moon Hotspot in Dark Theme (Center: 73.37% x, 25.80% y) ── */
        <button
          onClick={() => setTheme('light')}
          style={{ left: '73.37%', top: '25.80%' }}
          title="சந்திர தரிசனம் (Moon) • Press to change to Light Theme"
          aria-label="Moon image point. Press to change into Light Theme."
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[5.5vw] h-[5.5vw] max-w-16 max-h-16 min-w-8 min-h-8 rounded-full cursor-pointer z-20 group focus:outline-none"
        >
          {/* Subtle glowing lunar aura on hover */}
          <span className="absolute inset-0 rounded-full bg-indigo-300/10 group-hover:bg-indigo-300/35 group-hover:scale-125 transition-all duration-300 ring-1 sm:ring-2 ring-indigo-300/40 group-hover:ring-indigo-200 shadow-[0_0_16px_rgba(165,180,252,0.45)]" />
          <span className="sr-only">Switch to Light Theme</span>
        </button>
      ) : (
        /* ── Sun Hotspot in Light Theme (Center: 75.90% x, 53.62% y) ── */
        <button
          onClick={() => setTheme('dark')}
          style={{ left: '75.90%', top: '53.62%' }}
          title="சூரிய தரிசனம் (Sun) • Press to change to Dark Theme"
          aria-label="Sun image point. Press to change into Dark Theme."
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[5.5vw] h-[5.5vw] max-w-16 max-h-16 min-w-8 min-h-8 rounded-full cursor-pointer z-20 group focus:outline-none"
        >
          {/* Subtle glowing solar corona on hover */}
          <span className="absolute inset-0 rounded-full bg-amber-400/10 group-hover:bg-amber-400/40 group-hover:scale-125 transition-all duration-300 ring-1 sm:ring-2 ring-amber-300/40 group-hover:ring-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.5)] animate-pulse" />
          <span className="sr-only">Switch to Dark Theme</span>
        </button>
      )}

      {/* ── Mobile Compact Fallback Theme Switcher ── */}
      <div className="sm:hidden absolute right-2.5 top-2 z-30">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className={`p-1 rounded-full border backdrop-blur-md shadow-sm transition-transform active:scale-90 cursor-pointer ${
            isDark
              ? 'bg-stone-950/70 text-amber-300 border-amber-500/40'
              : 'bg-white/70 text-amber-800 border-amber-400/50'
          }`}
        >
          {isDark ? <Moon size={13} /> : <Sun size={13} />}
        </button>
      </div>

      {/* ── Interactive Pilgrim Greeting & Temple Bell Chime Hotspot ── */}
      <button
        onClick={playSacredChime}
        style={{ left: '83%', right: '2%', top: '12%', bottom: '12%' }}
        title="Play Sacred Temple Bell Chime • கோவில் மணி ஒலி"
        aria-label="Play Sacred Temple Bell Chime"
        className="absolute cursor-pointer z-20 group rounded-xl flex items-center justify-end pr-2 focus:outline-none transition-all"
      >
        {/* Discrete Bell Chime indicator badge */}
        <span
          className={`p-1 sm:p-1.5 rounded-full transition-all shadow-md backdrop-blur-md border ${
            isPlaying
              ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 animate-pulse border-amber-300'
              : isDark
              ? 'bg-black/30 hover:bg-black/60 text-amber-300/80 hover:text-amber-200 border-white/20 opacity-40 group-hover:opacity-100'
              : 'bg-white/40 hover:bg-white/80 text-purple-950/80 hover:text-purple-950 border-purple-300/40 opacity-40 group-hover:opacity-100'
          }`}
        >
          <Volume2 size={13} className={isPlaying ? 'animate-bounce text-amber-900' : ''} />
        </span>
      </button>
    </header>
  );
}
