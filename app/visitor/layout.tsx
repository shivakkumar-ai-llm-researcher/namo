'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, Users, LogOut, BarChart3, CalendarDays, UserCircle, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BalajiNamam } from '@/components/ui';
import { getInitials } from '@/utils/formatters';

const navItems = [
  { href: '/visitor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/visitor/contributions', label: 'Contributions', icon: TrendingUp },
  { href: '/visitor/expenses', label: 'Expenses', icon: TrendingDown },
  { href: '/visitor/savings', label: 'Savings', icon: PiggyBank },
  { href: '/visitor/members', label: 'Members', icon: Users },
  { href: '/visitor/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/visitor/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/visitor/profile', label: 'Profile', icon: UserCircle },
];

export default function VisitorLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid #D97706' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' }}
            >
              <BalajiNamam size={22} />
            </div>
            <div>
              <div className="text-sm font-bold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>
                {profile?.full_name || 'Srivari Devotee'}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Devotee Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                {getInitials(profile?.full_name)}
              </div>
              <button onClick={handleSignOut} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--error)' }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg md:hidden"
              style={{ color: 'var(--text-secondary)' }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            <div className="grid grid-cols-4 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-center"
                    style={isActive ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary)' } : { color: 'var(--text-secondary)' }}
                  >
                    <Icon size={18} />
                    <span className="text-[10px] font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-3 py-2 mt-2 rounded-xl text-sm" style={{ color: 'var(--error)' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Desktop navigation bar */}
      <div className="hidden md:block border-b sticky top-[61px] z-30" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                style={
                  isActive
                    ? { color: 'var(--primary)', borderBottomColor: 'var(--primary)', fontWeight: 600 }
                    : { color: 'var(--text-secondary)', borderBottomColor: 'transparent' }
                }
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 mb-16 md:mb-0">{children}</main>

      {/* Mobile bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-5 px-2 py-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg"
                style={isActive ? { color: 'var(--primary)' } : { color: 'var(--text-tertiary)' }}
              >
                <Icon size={20} />
                <span className="text-[9px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
