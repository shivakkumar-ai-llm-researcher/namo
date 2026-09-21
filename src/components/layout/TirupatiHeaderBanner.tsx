'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Menu, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TirupatiHeaderBannerProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function TirupatiHeaderBanner({ onMenuClick, showMenuButton = true }: TirupatiHeaderBannerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const droneOscsRef = useRef<OscillatorNode[]>([]);
  const chimeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bellCycleRef = useRef(0);
  const isMutedRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Bronze temple bell chime synthesis
  const ringTempleBell = useCallback((ctx: AudioContext, destination: AudioNode, pitchMultiplier = 1.0) => {
    try {
      const now = ctx.currentTime;
      const baseFreq = 432 * pitchMultiplier;
      // Multi-harmonic bronze temple bell overtones (432Hz fundamental + natural metallic harmonics)
      const frequencies = [baseFreq, baseFreq * 2.0, baseFreq * 2.98, baseFreq * 4.15, baseFreq * 5.8];
      const gains = [0.35, 0.22, 0.14, 0.08, 0.04];
      const decays = [3.8, 3.2, 2.6, 1.8, 1.2];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(gains[idx], now + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

        osc.connect(gainNode);
        gainNode.connect(destination);

        osc.start(now);
        osc.stop(now + decays[idx] + 0.1);
      });
    } catch (e) {
      console.warn('Temple bell chime error:', e);
    }
  }, []);

  // Continuous subtle meditative drone (Cosmic Om 136.1Hz & warm harmonics)
  const startDrone = useCallback((ctx: AudioContext, destination: AudioNode) => {
    // Stop any existing drone
    droneOscsRef.current.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    });
    droneOscsRef.current = [];

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.035, now); // Serene, tranquil background volume
    filter.connect(droneGain);
    droneGain.connect(destination);

    const omHarmonics = [136.1, 272.2, 408.3];
    const harmonicWeights = [0.6, 0.3, 0.1];

    omHarmonics.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(harmonicWeights[i], now);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start(now);
      droneOscsRef.current.push(osc);
    });
  }, []);

  // Start continuous sacred soundscape
  const startContinuousPlay = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.7, ctx.currentTime);
        master.connect(ctx.destination);
        audioContextRef.current = ctx;
        masterGainRef.current = master;
      }

      const ctx = audioContextRef.current;
      const master = masterGainRef.current;
      if (!master) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      master.gain.setTargetAtTime(0.7, ctx.currentTime, 0.1);
      startDrone(ctx, master);

      // Initial sacred welcome bell chime
      ringTempleBell(ctx, master, 1.0);

      // Periodic continuous bell chime loop (every 7 seconds with serene cadence)
      if (chimeTimerRef.current) clearInterval(chimeTimerRef.current);
      chimeTimerRef.current = setInterval(() => {
        if (!audioContextRef.current || audioContextRef.current.state === 'suspended' || isMutedRef.current) return;
        const pitches = [1.0, 0.89, 1.125, 1.0];
        const pitch = pitches[bellCycleRef.current % pitches.length];
        bellCycleRef.current += 1;
        ringTempleBell(audioContextRef.current, masterGainRef.current!, pitch);
      }, 7000);

      setIsPlaying(true);
    } catch (e) {
      console.warn('Continuous audio play failed:', e);
    }
  }, [ringTempleBell, startDrone]);

  // Stop continuous sacred soundscape
  const stopContinuousPlay = useCallback(() => {
    try {
      if (chimeTimerRef.current) {
        clearInterval(chimeTimerRef.current);
        chimeTimerRef.current = null;
      }
      if (masterGainRef.current && audioContextRef.current) {
        masterGainRef.current.gain.setTargetAtTime(0.0001, audioContextRef.current.currentTime, 0.1);
      }
      setTimeout(() => {
        droneOscsRef.current.forEach((node) => {
          try {
            node.stop();
            node.disconnect();
          } catch {}
        });
        droneOscsRef.current = [];
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          audioContextRef.current.suspend();
        }
      }, 200);
      setIsPlaying(false);
    } catch (e) {
      console.warn('Continuous audio stop failed:', e);
    }
  }, []);

  // Initialize and handle website open / page navigation
  useEffect(() => {
    setMounted(true);
    const savedMuted = localStorage.getItem('namo_audio_muted');
    const shouldMute = savedMuted === 'true';
    setIsMuted(shouldMute);

    if (!shouldMute) {
      startContinuousPlay();

      // Browser Autoplay Policy: if AudioContext suspended before first user gesture, unlock on first touch/click
      const unlockAudio = () => {
        if (localStorage.getItem('namo_audio_muted') !== 'true') {
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().then(() => {
              setIsPlaying(true);
            });
          } else if (!audioContextRef.current) {
            startContinuousPlay();
          }
        }
      };

      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });
      window.addEventListener('scroll', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
    }

    // Auto-suspend when user switches tabs; resume when returning
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          audioContextRef.current.suspend();
        }
      } else {
        if (localStorage.getItem('namo_audio_muted') !== 'true' && audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (chimeTimerRef.current) clearInterval(chimeTimerRef.current);
      droneOscsRef.current.forEach((node) => {
        try {
          node.stop();
          node.disconnect();
        } catch {}
      });
    };
  }, [startContinuousPlay]);

  // User click toggle mute / unmute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      localStorage.setItem('namo_audio_muted', 'false');
      startContinuousPlay();
    } else {
      setIsMuted(true);
      localStorage.setItem('namo_audio_muted', 'true');
      stopContinuousPlay();
    }
  };

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <header className="w-full relative select-none shadow-md overflow-hidden bg-transparent">
      {/* ── Clean Panoramic Banner Artwork ── */}
      <img
        src={isDark ? '/images/banner-dark.png' : '/images/banner-light.png'}
        alt="Arulmigu Shridevi Poodevi Shri Varatharaja Perumal Alayam"
        className="w-full h-auto block select-none pointer-events-none transition-opacity duration-300"
      />

      {/* ── Temple Name in Tamil & English (Sharp Crisp Vector Typography) ── */}
      <div className="absolute left-[12%] sm:left-[3.5%] top-1/2 -translate-y-1/2 flex flex-col justify-center min-w-0 z-20 pointer-events-none max-w-[60%] sm:max-w-[52%] md:max-w-[46%] ml-1 sm:ml-0">
        <h1
          className="text-[9.5px] xs:text-[11px] sm:text-sm md:text-base lg:text-[18px] font-black tracking-tight leading-snug sm:leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2 sm:line-clamp-none"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.95), 0 0 12px rgba(0, 0, 0, 0.85)',
          }}
          title="அருள்மிகு ஸ்ரீதேவி பூதேவி ஸ்ரீ வரதராஜ பெருமாள் ஆலயம்"
        >
          அருள்மிகு ஸ்ரீதேவி பூதேவி ஸ்ரீ வரதராஜ பெருமாள் ஆலயம்
        </h1>
        <span
          className="text-[7.5px] xs:text-[9px] sm:text-[10.5px] md:text-xs lg:text-[13px] font-bold text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-snug sm:leading-tight mt-0.5 line-clamp-1 sm:line-clamp-none"
          style={{
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.95)',
          }}
        >
          Arulmigu Shridevi Poodevi Shri Varatharaja Perumal Alayam
        </span>
        <span
          className="text-[7px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-semibold text-amber-100/90 leading-tight mt-0.5 hidden sm:block truncate"
          style={{
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
          }}
        >
          திருக்கோயில் அறக்கட்டளை • Community Seva & Devotees Fund
        </span>
      </div>

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

      {/* ── Top-Right Header Action Bar (Cleanly Placed Away From Venkatesaya Text) ── */}
      <div className="absolute top-2 right-2.5 sm:top-2.5 sm:right-4 z-30 flex items-center gap-1.5 sm:gap-2">


        {/* Mobile Compact Fallback Theme Switcher */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={isDark ? (language === 'ta' ? 'பகல் பயன்முறை' : 'Switch to Light Theme') : (language === 'ta' ? 'இரவு பயன்முறை' : 'Switch to Dark Theme')}
          className={`sm:hidden p-1 sm:p-1.5 rounded-full border backdrop-blur-md shadow-sm transition-transform active:scale-90 cursor-pointer ${
            isDark
              ? 'bg-stone-950/70 text-amber-300 border-amber-500/40'
              : 'bg-white/70 text-amber-800 border-amber-400/50'
          }`}
        >
          {isDark ? <Moon size={12} /> : <Sun size={12} />}
        </button>

        {/* Sacred Temple Continuous Sound Toggle (Mute / Unmute) */}
        <button
          onClick={toggleMute}
          title={isMuted ? (language === 'ta' ? 'மவுனம் • இசைக்க கிளிக் செய்க' : 'Muted • Click to play') : (language === 'ta' ? 'நாதம் ஒலிக்கிறது • மவுனமாக்க கிளிக் செய்க' : 'Continuous sound playing • Click to mute')}
          aria-label={isMuted ? 'Play continuous sacred temple sound' : 'Mute sacred temple sound'}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full border backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer select-none ${
            !isMuted
              ? isDark
                ? 'bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 border-amber-400/60 ring-1 ring-amber-400/40'
                : 'bg-white/90 hover:bg-white text-amber-950 border-amber-400/80 shadow-amber-900/15'
              : isDark
              ? 'bg-black/60 hover:bg-black/80 text-stone-400 hover:text-stone-200 border-white/20'
              : 'bg-stone-900/50 hover:bg-stone-900/70 text-white/80 hover:text-white border-white/25'
          }`}
        >
          {!isMuted ? (
            <>
              <Volume2 size={13} className="text-amber-500 dark:text-amber-300 animate-pulse shrink-0" />
              {/* Mini animated equalizer wave bars */}
              <span className="flex items-end gap-0.5 h-2.5 shrink-0" aria-hidden="true">
                <span className="w-0.5 bg-amber-500 dark:bg-amber-300 rounded-full h-full animate-[pulse_0.7s_ease-in-out_infinite]" />
                <span className="w-0.5 bg-amber-500 dark:bg-amber-300 rounded-full h-1.5 animate-[pulse_1.1s_ease-in-out_infinite]" />
                <span className="w-0.5 bg-amber-500 dark:bg-amber-300 rounded-full h-2 animate-[pulse_0.9s_ease-in-out_infinite]" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-tight uppercase hidden md:inline">
                {language === 'ta' ? 'நாதம்' : 'Sacred Sound'}
              </span>
            </>
          ) : (
            <>
              <VolumeX size={13} className="text-stone-400 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-medium tracking-tight text-stone-400 hidden md:inline">
                {language === 'ta' ? 'மவுனம்' : 'Muted'}
              </span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
