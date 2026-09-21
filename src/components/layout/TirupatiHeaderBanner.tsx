'use client';
import { useState, useRef } from 'react';
import { Menu, Volume2, VolumeX } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface TirupatiHeaderBannerProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function TirupatiHeaderBanner({ onMenuClick, showMenuButton = true }: TirupatiHeaderBannerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sacred Temple Bell Chime using Web Audio API
  const playSacredChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      setIsPlaying(true);

      // Multi-harmonic temple bell sound (fundamental 432Hz + overtones)
      const frequencies = [432, 864, 1296, 1728];
      const gains = [0.4, 0.25, 0.15, 0.08];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Natural exponential decay of a bronze temple bell
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
      className="sticky top-0 z-40 w-full h-[72px] sm:h-[78px] flex items-center justify-between px-2 sm:px-4 lg:px-6 relative overflow-hidden border-b select-none shadow-md"
      style={{
        // Majestic sunset sky gradient of Tirumala hills
        background: 'linear-gradient(90deg, #8E6B88 0%, #A8819E 20%, #BE96B2 50%, #C49CB6 75%, #A87E9D 90%, #8D6684 100%)',
        borderColor: '#B45309',
        borderBottomWidth: '2.5px',
      }}
    >
      {/* ── Sacred Hills Silhouette: Left Side ── */}
      <div className="absolute left-0 bottom-0 top-0 w-28 sm:w-44 pointer-events-none opacity-40 z-0">
        <svg viewBox="0 0 160 80" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="leftHillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A2538" />
              <stop offset="100%" stopColor="#2D1220" />
            </linearGradient>
          </defs>
          <path
            d="M0,80 L0,35 Q20,38 35,28 Q55,15 75,25 Q95,35 110,48 Q130,62 160,70 L160,80 Z"
            fill="url(#leftHillGrad)"
          />
          {/* Jagged rocky crags */}
          <path
            d="M0,80 L0,50 Q15,45 30,42 Q45,38 60,48 Q85,60 110,72 L110,80 Z"
            fill="#230E19"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* ── Sacred Hills Silhouette & Glowing Sun: Right Side ── */}
      <div className="absolute right-0 bottom-0 top-0 w-36 sm:w-56 pointer-events-none z-0">
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            {/* Radiant Golden Sun Gradient */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
              <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#D97706" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rightHillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#603423" />
              <stop offset="50%" stopColor="#451A10" />
              <stop offset="100%" stopColor="#250B08" />
            </linearGradient>
          </defs>

          {/* Golden Sun rising/setting behind the sacred cliff */}
          <circle cx="165" cy="40" r="32" fill="url(#sunGlow)" />
          <circle cx="165" cy="40" r="16" fill="#FDE047" opacity="0.95" />

          {/* Rocky mountain crags of Tirumala Hills */}
          <path
            d="M130,80 Q138,55 145,45 Q152,32 160,35 Q168,38 175,22 Q182,10 188,18 Q194,26 200,32 L200,80 Z"
            fill="url(#rightHillGrad)"
          />
          {/* Detailed crags & foliage textures */}
          <path
            d="M142,80 L148,58 Q155,42 165,48 Q172,30 182,38 Q190,28 200,38 L200,80 Z"
            fill="#1E0705"
            opacity="0.8"
          />
          <path
            d="M158,80 L165,65 Q175,50 185,55 L200,62 L200,80 Z"
            fill="#120403"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* ── Left Content: Menu Button + TTD Emblem & Organization Name ── */}
      <div className="flex items-center gap-2 sm:gap-3 z-10 min-w-0">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-xl bg-black/20 hover:bg-black/35 text-white transition-colors flex-shrink-0 border border-white/25"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* TTD Circular Temple Gopuram Crest */}
          <div className="relative flex-shrink-0 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 p-0.5 shadow-md border-2 border-emerald-700 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Outer green ring */}
              <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#047857" strokeWidth="3.5" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="2,2" />

              {/* Circular inscription simulation */}
              <circle cx="50" cy="50" r="39" fill="#047857" opacity="0.08" />

              {/* Sacred Temple Gopuram (Anandhanilayam Vimanam) in golden orange */}
              <path
                d="M50,14 L53,20 L47,20 Z"
                fill="#D97706"
              />
              {/* Kalasam finial */}
              <circle cx="50" cy="13" r="2.2" fill="#F59E0B" />
              <circle cx="46.5" cy="15" r="1.5" fill="#F59E0B" />
              <circle cx="53.5" cy="15" r="1.5" fill="#F59E0B" />

              {/* Gopuram tiers */}
              <path d="M44,20 L56,20 L58,26 L42,26 Z" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />
              <path d="M41,26 L59,26 L62,34 L38,34 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="0.8" />
              <path d="M37,34 L63,34 L66,44 L34,44 Z" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />
              <path d="M33,44 L67,44 L70,56 L30,56 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="0.8" />
              <path d="M29,56 L71,56 L74,68 L26,68 Z" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />

              {/* Pillars & Base */}
              <rect x="25" y="68" width="50" height="12" fill="#92400E" rx="1" />
              {/* Temple Doorway Arch */}
              <path d="M43,80 L43,72 Q50,68 57,72 L57,80 Z" fill="#451A03" />
              {/* Sacred Base Lotus */}
              <path d="M20,80 Q50,86 80,80 L82,86 Q50,91 18,86 Z" fill="#047857" />
            </svg>
          </div>

          {/* Titles in Telugu/Tamil & English */}
          <div className="flex flex-col justify-center min-w-0">
            <span
              className="text-xs sm:text-sm font-extrabold tracking-tight truncate leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              తిరుమల తిరుపతి దేవస్థానములు
            </span>
            <span
              className="text-[10px] sm:text-xs font-bold truncate leading-tight text-yellow-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
            >
              Tirumala Tirupati Devasthanams<sup className="text-[8px] ml-0.5">®</sup>
            </span>
            <span className="text-[9px] font-semibold text-amber-200/90 truncate hidden sm:block">
              Srivari Community Fund • திருமலை திருப்பதி தேவஸ்தானம்
            </span>
          </div>
        </div>
      </div>

      {/* ── Center Content: The Sacred Trinity (Shankha - Thiruman/Namam - Chakra) ── */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 z-10 flex-shrink-0 px-2">
        {/* Sacred Shankha (Holy Conch) */}
        <div className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Shanku spiral in pure white with subtle grey shading */}
            <path
              d="M50,12 C40,12 30,22 28,38 C26,52 32,65 42,75 C47,80 50,88 52,94 C53,88 56,80 60,75 C68,66 74,54 72,38 C70,22 60,12 50,12 Z"
              fill="#FFFFFF"
            />
            {/* Inner spiral coils */}
            <path
              d="M48,22 C42,24 38,32 38,42 C38,55 45,66 52,72 C50,62 48,52 50,40 C52,28 58,24 48,22 Z"
              fill="#E5E7EB"
            />
            <path
              d="M52,32 C48,34 46,42 47,50 C48,58 52,65 55,68 C54,60 52,52 54,44 C55,36 58,33 52,32 Z"
              fill="#D1D5DB"
            />
            {/* Crown of Conch */}
            <path d="M46,12 Q50,4 54,12 Z" fill="#FFFFFF" />
            <circle cx="50" cy="7" r="2.5" fill="#F59E0B" />
          </svg>
        </div>

        {/* Sacred Thiruman / Balaji Namam (The Divine Mark) */}
        <div className="w-8 sm:w-11 h-9 sm:h-12 flex items-center justify-center filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
          <svg viewBox="0 0 80 100" className="w-full h-full">
            {/* Pure White U-shaped Namam (Thiruman) */}
            <path
              d="M14,14 L29,14 C29,14 30,55 40,68 C50,55 51,14 51,14 L66,14 C66,14 65,65 40,82 C15,65 14,14 14,14 Z"
              fill="#FFFFFF"
            />
            {/* Left upright top wing */}
            <path d="M14,14 L29,14 L26,8 L11,8 Z" fill="#FFFFFF" />
            {/* Right upright top wing */}
            <path d="M51,14 L66,14 L69,8 L54,8 Z" fill="#FFFFFF" />

            {/* Central Srichoornam / Red Vermillion Tilakam (Sri Mahalakshmi's grace) */}
            <path
              d="M36,6 L44,6 L43,58 Q40,62 37,58 Z"
              fill="#DC2626"
            />
            <path
              d="M38,6 L42,6 L41.5,56 Q40,59 38.5,56 Z"
              fill="#B91C1C"
            />

            {/* White round base dot underneath the Namam */}
            <circle cx="40" cy="90" r="5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Sacred Sudarshana Chakra (Holy Discus) */}
        <div className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer golden flame rim */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,2" />
            {/* Main white discus body */}
            <circle cx="50" cy="50" r="38" fill="#FFFFFF" />
            {/* Central hub */}
            <circle cx="50" cy="50" r="16" fill="#E5E7EB" stroke="#DC2626" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="7" fill="#F59E0B" />

            {/* Spokes / Flames of Chakra */}
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

      {/* ── Right Content: "Namaskaram Pilgrim" & "Om Namo Venkatesaya" + Chime & Theme ── */}
      <div className="flex items-center gap-2 sm:gap-3 z-10 flex-shrink-0">
        <div className="flex flex-col text-right hidden sm:flex">
          <span
            className="text-[11px] sm:text-xs font-semibold leading-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
            style={{ color: '#3B0764' }}
          >
            Namaskaram Pilgrim
          </span>
          <div className="flex items-center justify-end gap-1.5">
            <span
              className="text-xs sm:text-sm font-black leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]"
              style={{ color: '#4A0E4E' }}
            >
              Om Namo Venkatesaya
            </span>

            {/* Interactive Sacred Temple Bell Chime Speaker */}
            <button
              onClick={playSacredChime}
              title="Play Temple Bell Chime • கோவில் மணி ஒலி"
              className={`p-1 rounded-full transition-all cursor-pointer shadow-sm ${
                isPlaying
                  ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-white/80 hover:bg-white text-purple-900 border border-purple-300 hover:scale-105'
              }`}
            >
              {isPlaying ? <Volume2 size={13} className="text-stone-900" /> : <Volume2 size={13} />}
            </button>
          </div>
        </div>

        {/* Mobile-only compact chant badge */}
        <div className="sm:hidden flex flex-col items-end">
          <button
            onClick={playSacredChime}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/85 text-[10px] font-black shadow-sm"
            style={{ color: '#4A0E4E' }}
          >
            <span>Om Namo</span>
            <Volume2 size={11} className={isPlaying ? 'animate-bounce text-amber-600' : ''} />
          </button>
        </div>

        {/* Theme Toggle Button */}
        <div className="rounded-xl p-0.5 bg-black/15 border border-white/30 backdrop-blur-xs flex items-center shadow-xs">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
