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

  // Sacred Temple Bell Chime using Web Audio API (Bronze bell acoustics)
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
    <header
      className="w-full h-[84px] sm:h-[98px] md:h-[110px] lg:h-[120px] relative overflow-hidden rounded-b-2xl sm:rounded-b-3xl border-b-2 select-none transition-all duration-300 z-40 shadow-lg"
      style={{
        borderColor: isDark ? '#D97706' : '#B45309',
        boxShadow: isDark
          ? '0 8px 24px rgba(0, 0, 0, 0.7), 0 2px 10px rgba(217, 119, 6, 0.3)'
          : '0 6px 18px rgba(74, 37, 56, 0.25)',
      }}
    >
      {/* ── User-Uploaded Custom Temple Banner Image ── */}
      <img
        src={isDark ? '/images/banner-dark.png' : '/images/banner-light.png'}
        alt="Arulmigu Shridevi Poodevi Shri Varatharaja Perumal Alayam"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-500"
      />

      {/* ── Mobile Sidebar Menu Button ── */}
      {showMenuButton && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl bg-black/45 hover:bg-black/65 text-white transition-colors flex-shrink-0 border border-white/30 backdrop-blur-md shadow-md cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* ── Desktop/Tablet: Direct In-Artwork Celestial Hotspots ── */}
      {isDark ? (
        /* ── Moon Hotspot in Dark Theme (Moon Center: x ≈ 73.4%, y ≈ 25.8%) ── */
        <button
          onClick={() => setTheme('light')}
          title="சந்திர தரிசனம் (Moon) • Press to change to Light Theme"
          aria-label="Moon image point. Press to change into Light Theme."
          className="hidden sm:block absolute left-[73.4%] top-[25.8%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-18 md:h-18 rounded-full cursor-pointer z-20 group focus:outline-none"
        >
          {/* Pulsing lunar halo on hover */}
          <span className="absolute inset-0 rounded-full bg-indigo-300/10 group-hover:bg-indigo-300/35 group-hover:scale-125 transition-all duration-300 ring-2 ring-indigo-300/30 group-hover:ring-indigo-200 shadow-[0_0_20px_rgba(165,180,252,0.4)]" />
          <span className="sr-only">Switch to Light Theme</span>
        </button>
      ) : (
        /* ── Sun Hotspot in Light Theme (Sun Center: x ≈ 75.9%, y ≈ 55.0%) ── */
        <button
          onClick={() => setTheme('dark')}
          title="சூரிய தரிசனம் (Sun) • Press to change to Dark Theme"
          aria-label="Sun image point. Press to change into Dark Theme."
          className="hidden sm:block absolute left-[75.9%] top-[55.0%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-18 md:h-18 rounded-full cursor-pointer z-20 group focus:outline-none"
        >
          {/* Pulsing solar corona on hover */}
          <span className="absolute inset-0 rounded-full bg-amber-400/10 group-hover:bg-amber-400/40 group-hover:scale-125 transition-all duration-300 ring-2 ring-amber-300/40 group-hover:ring-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse" />
          <span className="sr-only">Switch to Dark Theme</span>
        </button>
      )}

      {/* ── Mobile-Only Interactive Celestial Button ── */}
      <div className="sm:hidden absolute right-12 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={
            isDark
              ? 'சந்திர தரிசனம் (Moon) • Press to change to Light Theme'
              : 'சூரிய தரிசனம் (Sun) • Press to change to Dark Theme'
          }
          className={`p-1.5 rounded-full border backdrop-blur-md shadow-md transition-transform active:scale-90 cursor-pointer ${
            isDark
              ? 'bg-stone-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(147,197,253,0.3)]'
              : 'bg-white/80 text-amber-700 border-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
          }`}
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      {/* ── Right Edge: Interactive Sacred Temple Bell Chime Button ── */}
      <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 flex items-center">
        <button
          onClick={playSacredChime}
          title="Play Sacred Temple Bell Chime • கோவில் மணி ஒலி"
          aria-label="Play Sacred Temple Bell Chime"
          className={`p-1.5 sm:p-2 rounded-full transition-all cursor-pointer shadow-md backdrop-blur-md border ${
            isPlaying
              ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 animate-pulse border-amber-300'
              : isDark
              ? 'bg-stone-900/80 hover:bg-stone-800 text-amber-300 border-amber-500/50 hover:scale-105 shadow-[0_0_10px_rgba(217,119,6,0.3)]'
              : 'bg-white/85 hover:bg-white text-purple-950 border-purple-300 hover:scale-105 shadow-[0_0_10px_rgba(120,53,15,0.2)]'
          }`}
        >
          <Volume2 size={15} className={isPlaying ? 'animate-bounce text-amber-900' : ''} />
        </button>
      </div>
    </header>
  );
}
