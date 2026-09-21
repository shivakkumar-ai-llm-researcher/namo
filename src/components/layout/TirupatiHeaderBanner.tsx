'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Menu, Volume2 } from 'lucide-react';

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

  // Sacred Temple Bell Chime using Web Audio API
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
      className="w-full h-[76px] sm:h-[82px] flex items-center justify-between px-3 sm:px-5 lg:px-8 relative overflow-hidden rounded-b-2xl sm:rounded-b-3xl border-b-2 select-none transition-all duration-300 z-40"
      style={{
        // Dynamic background design:
        // Light: Ethereal dusk sky mauve-rose gradient
        // Dark: Sacred midnight cosmos & deep temple indigo-purple gradient
        background: isDark
          ? 'linear-gradient(90deg, #180D21 0%, #2A1338 25%, #3B1B4A 50%, #2E133B 75%, #1B0C25 100%)'
          : 'linear-gradient(90deg, #8E6B88 0%, #A8819E 20%, #BE96B2 50%, #C49CB6 75%, #A87E9D 90%, #8D6684 100%)',
        borderColor: isDark ? '#D97706' : '#B45309',
        boxShadow: isDark
          ? '0 6px 20px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(217, 119, 6, 0.25)'
          : '0 4px 14px rgba(74, 37, 56, 0.25)',
      }}
    >
      {/* ── Sacred Hills Silhouette: Left Side ── */}
      <div
        className={`absolute left-0 bottom-0 top-0 w-32 sm:w-48 pointer-events-none z-0 transition-opacity duration-300 ${
          isDark ? 'opacity-30' : 'opacity-40'
        }`}
      >
        <svg viewBox="0 0 160 80" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="leftHillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#2D1432' : '#4A2538'} />
              <stop offset="100%" stopColor={isDark ? '#140718' : '#2D1220'} />
            </linearGradient>
          </defs>
          <path
            d="M0,80 L0,35 Q20,38 35,28 Q55,15 75,25 Q95,35 110,48 Q130,62 160,70 L160,80 Z"
            fill="url(#leftHillGrad)"
          />
          <path
            d="M0,80 L0,50 Q15,45 30,42 Q45,38 60,48 Q85,60 110,72 L110,80 Z"
            fill={isDark ? '#0F0513' : '#230E19'}
            opacity="0.6"
          />
        </svg>
      </div>

      {/* ── Sacred Hills Silhouette & Celestial Body (Sun/Moon): Right Side ── */}
      {/* ── Sacred Hills Silhouette & Celestial Body (Sun/Moon): Right Side ── */}
      <div className="absolute right-0 bottom-0 top-0 w-44 sm:w-64 z-20 pointer-events-none select-none">
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="w-full h-full pointer-events-none">
          <defs>
            {/* Sun Glow Gradient */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
              <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#D97706" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
            </radialGradient>

            {/* Moon Glow Gradient */}
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor="#E0E7FF" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#312E81" stopOpacity="0" />
            </radialGradient>

            {/* Moon Surface Gradient */}
            <radialGradient id="moonSurface" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </radialGradient>

            {/* Right Hill Gradient */}
            <linearGradient id="rightHillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#361528' : '#603423'} />
              <stop offset="50%" stopColor={isDark ? '#230C1A' : '#451A10'} />
              <stop offset="100%" stopColor={isDark ? '#11040D' : '#250B08'} />
            </linearGradient>
          </defs>

          {isDark ? (
            /* ── Dark Theme: Moon with Tirumala & Night Stars ── */
            <>
              {/* Night Sky Stars */}
              <circle cx="115" cy="18" r="0.9" fill="#FFFFFF" opacity="0.8" />
              <circle cx="132" cy="12" r="0.7" fill="#93C5FD" opacity="0.85" />
              <circle cx="148" cy="22" r="1.1" fill="#FEF08A" opacity="0.9" />
              <circle cx="178" cy="12" r="0.8" fill="#FFFFFF" opacity="0.7" />
              <circle cx="192" cy="22" r="1.0" fill="#BAE6FD" opacity="0.8" />
              {/* Twinkle star */}
              <path d="M125,8 L126,10 L128,11 L126,12 L125,14 L124,12 L122,11 L124,10 Z" fill="#FFFFFF" opacity="0.75" />

              {/* Interactive Moon Image Point in Background Image */}
              <g
                role="button"
                tabIndex={0}
                onClick={() => setTheme('light')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTheme('light');
                  }
                }}
                className="pointer-events-auto cursor-pointer group/celestial"
                aria-label="Tirumala Moon (Dark Theme). Press to change into Light Theme."
              >
                <title>சந்திர தரிசனம் (Moon) • Press to change to Light Theme</title>

                {/* Touch / Click hit target */}
                <circle cx="165" cy="38" r="30" fill="transparent" />

                {/* Glowing Moon Halo */}
                <circle
                  cx="165"
                  cy="38"
                  r="32"
                  fill="url(#moonGlow)"
                  className="transition-transform duration-300 group-hover/celestial:scale-110"
                  style={{ transformOrigin: '165px 38px' }}
                />

                {/* Lunar disc */}
                <circle
                  cx="165"
                  cy="38"
                  r="15"
                  fill="url(#moonSurface)"
                  className="transition-transform duration-300 group-hover/celestial:scale-105"
                  style={{ transformOrigin: '165px 38px' }}
                />

                {/* Subtle lunar craters */}
                <ellipse cx="162" cy="36" rx="3.2" ry="2.2" fill="#94A3B8" opacity="0.35" />
                <ellipse cx="168" cy="41" rx="2.5" ry="1.8" fill="#94A3B8" opacity="0.3" />
                <ellipse cx="170" cy="34" rx="2" ry="2.4" fill="#64748B" opacity="0.25" />
                <circle cx="160" cy="42" r="1.5" fill="#94A3B8" opacity="0.28" />

                {/* Celestial indicator text */}
                <text
                  x="165"
                  y="62"
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="6"
                  fontWeight="bold"
                  opacity="0.9"
                  className="transition-opacity duration-200 group-hover/celestial:opacity-100 select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                >
                  சந்திரன் ☽
                </text>
              </g>
            </>
          ) : (
            /* ── Light Theme: Radiant Golden Sun with Tirumala ── */
            <>
              {/* Interactive Sun Image Point in Background Image */}
              <g
                role="button"
                tabIndex={0}
                onClick={() => setTheme('dark')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTheme('dark');
                  }
                }}
                className="pointer-events-auto cursor-pointer group/celestial"
                aria-label="Tirumala Sun (Light Theme). Press to change into Dark Theme."
              >
                <title>சூரிய தரிசனம் (Sun) • Press to change to Dark Theme</title>

                {/* Touch / Click hit target */}
                <circle cx="165" cy="40" r="30" fill="transparent" />

                {/* Glowing Sun Corona */}
                <circle
                  cx="165"
                  cy="40"
                  r="34"
                  fill="url(#sunGlow)"
                  className="transition-transform duration-300 group-hover/celestial:scale-115"
                  style={{ transformOrigin: '165px 40px' }}
                />

                {/* Radiant Solar Rays */}
                <line x1="165" y1="18" x2="165" y2="12" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
                <line x1="180" y1="25" x2="186" y2="19" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
                <line x1="188" y1="40" x2="194" y2="40" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
                <line x1="180" y1="55" x2="186" y2="61" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
                <line x1="150" y1="25" x2="144" y2="19" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
                <line x1="142" y1="40" x2="136" y2="40" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />

                {/* Solar orb */}
                <circle
                  cx="165"
                  cy="40"
                  r="16"
                  fill="#FDE047"
                  opacity="0.95"
                  className="transition-transform duration-300 group-hover/celestial:scale-105"
                  style={{ transformOrigin: '165px 40px' }}
                />
                <circle cx="165" cy="40" r="11" fill="#FEF08A" opacity="0.95" />

                {/* Celestial indicator text */}
                <text
                  x="165"
                  y="64"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="6"
                  fontWeight="bold"
                  opacity="0.9"
                  className="transition-opacity duration-200 group-hover/celestial:opacity-100 select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                >
                  சூரியன் ☼
                </text>
              </g>
            </>
          )}

          {/* Rocky mountain crags of Tirumala Hills */}
          <path
            d="M130,80 Q138,55 145,45 Q152,32 160,35 Q168,38 175,22 Q182,10 188,18 Q194,26 200,32 L200,80 Z"
            fill="url(#rightHillGrad)"
          />
          {/* Subtle luminous rim light along Tirumala mountain crest */}
          <path
            d="M130,80 Q138,55 145,45 Q152,32 160,35 Q168,38 175,22 Q182,10 188,18 Q194,26 200,32"
            fill="none"
            stroke={isDark ? '#93C5FD' : '#FDE047'}
            strokeWidth="0.8"
            opacity={isDark ? '0.45' : '0.65'}
          />
          <path
            d="M142,80 L148,58 Q155,42 165,48 Q172,30 182,38 Q190,28 200,38 L200,80 Z"
            fill={isDark ? '#0C0309' : '#1E0705'}
            opacity="0.85"
          />
          <path
            d="M158,80 L165,65 Q175,50 185,55 L200,62 L200,80 Z"
            fill={isDark ? '#060105' : '#120403'}
            opacity="0.9"
          />
        </svg>
      </div>

      {/* ── Left Section: Menu Button + TTD Emblem & Organization Title ── */}
      <div className="flex items-center gap-2 sm:gap-3.5 z-10 min-w-0">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-black/25 hover:bg-black/40 text-white transition-colors flex-shrink-0 border border-white/20 shadow-xs"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* TTD Circular Temple Gopuram Crest */}
          <div className="relative flex-shrink-0 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white p-0.5 shadow-md border-2 border-emerald-700 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Outer green ring */}
              <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#047857" strokeWidth="3.5" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="2,2" />

              {/* Inscription simulation */}
              <circle cx="50" cy="50" r="39" fill="#047857" opacity="0.08" />

              {/* Temple Gopuram (Anandhanilayam Vimanam) in gold */}
              <path d="M50,14 L53,20 L47,20 Z" fill="#D97706" />
              <circle cx="50" cy="13" r="2.2" fill="#F59E0B" />
              <circle cx="46.5" cy="15" r="1.5" fill="#F59E0B" />
              <circle cx="53.5" cy="15" r="1.5" fill="#F59E0B" />

              {/* Gopuram tiers */}
              <path d="M44,20 L56,20 L58,26 L42,26 Z" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />
              <path d="M41,26 L59,26 L62,34 L38,34 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="0.8" />
              <path d="M37,34 L63,34 L66,44 L34,44 Z" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />
              <path d="M33,44 L67,44 L70,56 L30,56 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="0.8" />
              <path d="M29,56 L71,56 L74,68 L26,68 Z" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />

              {/* Base */}
              <rect x="25" y="68" width="50" height="12" fill="#92400E" rx="1" />
              <path d="M43,80 L43,72 Q50,68 57,72 L57,80 Z" fill="#451A03" />
              <path d="M20,80 Q50,86 80,80 L82,86 Q50,91 18,86 Z" fill="#047857" />
            </svg>
          </div>

          {/* Temple Title in Tamil & English */}
          <div className="flex flex-col justify-center min-w-0">
            <span
              className={`text-xs sm:text-sm md:text-[15px] font-black tracking-tight truncate leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] ${
                isDark ? 'text-amber-200' : 'text-white'
              }`}
              title="அருள்மிகு ஸ்ரீதேவி பூதேவி ஸ்ரீ வரதராஜ பெருமாள் ஆலயம்"
            >
              அருள்மிகு ஸ்ரீதேவி பூதேவி ஸ்ரீ வரதராஜ பெருமாள் ஆலயம்
            </span>
            <span
              className={`text-[9.5px] sm:text-xs font-bold truncate leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] ${
                isDark ? 'text-amber-300' : 'text-yellow-100'
              }`}
            >
              Arulmigu Shridevi Poodevi Shri Varatharaja Perumal Alayam
            </span>
            <span
              className={`text-[8.5px] sm:text-[9.5px] font-semibold truncate hidden sm:block ${
                isDark ? 'text-amber-200/80' : 'text-amber-100/90'
              }`}
            >
              திருக்கோயில் அறக்கட்டளை • Community Seva & Devotees Fund
            </span>
          </div>
        </div>
      </div>

      {/* ── Center Section: The Sacred Trinity (Shankha - Thiruman/Namam - Chakra) ── */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3.5 z-10 flex-shrink-0 px-2">
        {/* Sacred Shankha (Holy Conch) */}
        <div
          className={`w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center filter transition-all ${
            isDark
              ? 'drop-shadow-[0_0_8px_rgba(254,240,138,0.5)]'
              : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]'
          }`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M50,12 C40,12 30,22 28,38 C26,52 32,65 42,75 C47,80 50,88 52,94 C53,88 56,80 60,75 C68,66 74,54 72,38 C70,22 60,12 50,12 Z"
              fill="#FFFFFF"
            />
            <path
              d="M48,22 C42,24 38,32 38,42 C38,55 45,66 52,72 C50,62 48,52 50,40 C52,28 58,24 48,22 Z"
              fill="#E5E7EB"
            />
            <path
              d="M52,32 C48,34 46,42 47,50 C48,58 52,65 55,68 C54,60 52,52 54,44 C55,36 58,33 52,32 Z"
              fill="#D1D5DB"
            />
            <path d="M46,12 Q50,4 54,12 Z" fill="#FFFFFF" />
            <circle cx="50" cy="7" r="2.5" fill="#F59E0B" />
          </svg>
        </div>

        {/* Sacred Thiruman / Balaji Namam */}
        <div
          className={`w-8 sm:w-11 h-9 sm:h-12 flex items-center justify-center filter transition-all ${
            isDark
              ? 'drop-shadow-[0_0_12px_rgba(254,240,138,0.6)]'
              : 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]'
          }`}
        >
          <svg viewBox="0 0 80 100" className="w-full h-full">
            {/* Pure White U-shaped Namam */}
            <path
              d="M14,14 L29,14 C29,14 30,55 40,68 C50,55 51,14 51,14 L66,14 C66,14 65,65 40,82 C15,65 14,14 14,14 Z"
              fill="#FFFFFF"
            />
            <path d="M14,14 L29,14 L26,8 L11,8 Z" fill="#FFFFFF" />
            <path d="M51,14 L66,14 L69,8 L54,8 Z" fill="#FFFFFF" />

            {/* Central Srichoornam / Red Vermillion Tilakam */}
            <path d="M36,6 L44,6 L43,58 Q40,62 37,58 Z" fill="#DC2626" />
            <path d="M38,6 L42,6 L41.5,56 Q40,59 38.5,56 Z" fill="#B91C1C" />

            {/* White round base dot */}
            <circle cx="40" cy="90" r="5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Sacred Sudarshana Chakra */}
        <div
          className={`w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center filter transition-all ${
            isDark
              ? 'drop-shadow-[0_0_8px_rgba(254,240,138,0.5)]'
              : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]'
          }`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,2" />
            <circle cx="50" cy="50" r="38" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="16" fill="#E5E7EB" stroke="#DC2626" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="7" fill="#F59E0B" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1="50"
                y1="50"
                x2={50 + 35 * Math.cos((angle * Math.PI) / 180)}
                y2={50 + 35 * Math.sin((angle * Math.PI) / 180)}
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* ── Right Section: "Namaskaram Pilgrim" & "Om Namo Venkatesaya" + Chime ── */}
      <div className="flex items-center gap-2 sm:gap-3 z-10 flex-shrink-0 mr-14 sm:mr-22 md:mr-28">
        <div className="flex flex-col text-right hidden sm:flex">
          <span
            className={`text-[11px] sm:text-xs font-semibold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] ${
              isDark ? 'text-purple-200' : 'text-purple-950'
            }`}
          >
            Namaskaram Pilgrim
          </span>
          <div className="flex items-center justify-end gap-1.5">
            <span
              className={`text-xs sm:text-sm font-black leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${
                isDark ? 'text-amber-300' : 'text-purple-950'
              }`}
            >
              Om Namo Venkatesaya
            </span>

            {/* Interactive Sacred Temple Bell Chime Speaker */}
            <button
              onClick={playSacredChime}
              title="Play Sacred Temple Bell Chime • கோவில் மணி ஒலி"
              className={`p-1 rounded-full transition-all cursor-pointer shadow-sm ${
                isPlaying
                  ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 animate-pulse'
                  : isDark
                  ? 'bg-stone-900/80 hover:bg-stone-800 text-amber-300 border border-amber-500/50 hover:scale-105'
                  : 'bg-white/80 hover:bg-white text-purple-900 border border-purple-300 hover:scale-105'
              }`}
            >
              <Volume2 size={13} className={isPlaying ? 'animate-bounce' : ''} />
            </button>
          </div>
        </div>

        {/* Mobile-only compact chant badge */}
        <div className="sm:hidden flex flex-col items-end">
          <button
            onClick={playSacredChime}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm ${
              isDark ? 'bg-stone-900/90 text-amber-300 border border-amber-500/40' : 'bg-white/90 text-purple-950'
            }`}
          >
            <span>Om Namo</span>
            <Volume2 size={11} className={isPlaying ? 'animate-bounce text-amber-500' : ''} />
          </button>
        </div>

      </div>
    </header>
  );
}
