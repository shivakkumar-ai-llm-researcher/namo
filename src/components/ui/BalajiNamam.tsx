export function BalajiNamam({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Tirupati Balaji Thirunamam"
    >
      <defs>
        {/* Sacred White Gradient */}
        <linearGradient id="namamWhite" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>

        {/* Sacred Vermilion Srichoornam Gradient */}
        <linearGradient id="namamRed" x1="50" y1="6" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="35%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* Soft Drop Shadow for Depth */}
        <filter id="namamGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#namamGlow)">
        {/* Left White Wing (Vishnu Padam) */}
        <path
          d="M 20 12 C 22 38, 29 68, 45 82 C 47 84, 47 89, 43 91 C 37 93, 30 89, 25 82 C 13 64, 9 38, 10 12 C 10 8, 15 7, 17 8 C 19 9, 20 10, 20 12 Z"
          fill="url(#namamWhite)"
          stroke="#FDE68A"
          strokeWidth="1"
        />

        {/* Right White Wing (Vishnu Padam) */}
        <path
          d="M 80 12 C 78 38, 71 68, 55 82 C 53 84, 53 89, 57 91 C 63 93, 70 89, 75 82 C 87 64, 91 38, 90 12 C 90 8, 85 7, 83 8 C 81 9, 80 10, 80 12 Z"
          fill="url(#namamWhite)"
          stroke="#FDE68A"
          strokeWidth="1"
        />

        {/* Bottom Connecting Padam Base */}
        <path
          d="M 38 79 C 45 87, 55 87, 62 79 C 59 88, 41 88, 38 79 Z"
          fill="url(#namamWhite)"
          stroke="#FDE68A"
          strokeWidth="0.8"
        />

        {/* Lotus Pedestal Base Tip */}
        <path
          d="M 45 88 C 48 95, 52 95, 55 88 C 54 97, 46 97, 45 88 Z"
          fill="#F59E0B"
        />

        {/* Center Sacred Srichoornam (Vermilion Flame Tip) */}
        <path
          d="M 50 6 C 46 11, 46 16, 50 19 C 54 16, 54 11, 50 6 Z"
          fill="url(#namamRed)"
        />

        {/* Center Sacred Srichoornam (Vertical Streak) */}
        <rect
          x="47"
          y="18"
          width="6"
          height="56"
          rx="3"
          fill="url(#namamRed)"
          stroke="#FEF08A"
          strokeWidth="0.5"
        />

        {/* Golden Bindu at Base of Red Tilak */}
        <circle
          cx="50"
          cy="78"
          r="2.5"
          fill="#F59E0B"
          stroke="#FEF3C7"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
}
