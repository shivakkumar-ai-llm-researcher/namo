export function BalajiNamam({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Namam (Tilak) SVG for Tirupati Balaji */}
      <ellipse cx="50" cy="20" rx="12" ry="18" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1.5"/>
      <ellipse cx="50" cy="22" rx="7" ry="12" fill="#DC2626"/>
      <ellipse cx="50" cy="50" rx="20" ry="35" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2"/>
      <ellipse cx="50" cy="52" rx="12" ry="24" fill="#DC2626"/>
      <ellipse cx="50" cy="54" rx="6" ry="14" fill="#FFFFFF"/>
      <circle cx="50" cy="62" r="4" fill="#F59E0B"/>
    </svg>
  );
}
