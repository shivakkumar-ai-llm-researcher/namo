'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Users,
  LogOut,
  BarChart3,
  CalendarDays,
  UserCircle,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BalajiNamam } from '@/components/ui';
import { getInitials } from '@/utils/formatters';

const navItems = [
  { href: '/visitor', label: 'Dashboard', icon: LayoutDashboard, tamil: 'டாஷ்போர்ட்' },
  { href: '/visitor/contributions', label: 'Contributions', icon: TrendingUp, tamil: 'என் பங்களிப்பு' },
  { href: '/visitor/expenses', label: 'Expenses', icon: TrendingDown, tamil: 'செலவுகள்' },
  { href: '/visitor/savings', label: 'Savings', icon: PiggyBank, tamil: 'சேமிப்பு' },
  { href: '/visitor/members', label: 'Members', icon: Users, tamil: 'உறுப்பினர்கள்' },
  { href: '/visitor/analytics', label: 'Analytics', icon: BarChart3, tamil: 'பகுப்பாய்வு' },
  { href: '/visitor/calendar', label: 'Calendar', icon: CalendarDays, tamil: 'நாட்காட்டி' },
  { href: '/visitor/profile', label: 'Profile', icon: UserCircle, tamil: 'சுயவிவரம்' },
];

export default function VisitorLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading Devotee Portal...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const currentTab = navItems.find((item) =>
    item.href === '/visitor'
      ? pathname === '/visitor'
      : pathname === item.href || pathname.startsWith(item.href + '/')
  ) || { label: 'Devotee Portal', tamil: 'பக்தர் தளம்', icon: LayoutDashboard };
  const TabIcon = currentTab.icon;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-[70px] px-4 flex items-center border-b flex-shrink-0" style={{ borderColor: 'var(--border)', borderBottom: '2px solid #D97706' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ backgroundColor: 'var(--primary)', border: '1.5px solid #F59E0B' }}
          >
            <BalajiNamam size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {profile?.full_name || 'Srivari Devotee'}
            </div>
            <div className="text-[11px] font-medium truncate" style={{ color: 'var(--text-tertiary)' }}>
              Devotee Portal • பக்தர் தளம்
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/visitor' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 group"
              style={
                isActive
                  ? { backgroundColor: 'var(--primary)', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(133,29,29,0.25)' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <Icon size={18} className={isActive ? 'text-amber-300' : 'group-hover:text-amber-600 transition-colors'} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{item.label}</div>
                <div className="text-[10px] opacity-75 truncate">{item.tamil}</div>
              </div>
              {isActive && <ChevronRight size={14} className="ml-auto text-amber-300" />}
            </Link>
          );
        })}
      </nav>

      {/* Devotee Info & Sign Out */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' }}
          >
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {profile?.full_name || 'Srivari Devotee'}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              Member • பக்தர்
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm w-full px-3 py-2 rounded-xl transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
          style={{ color: 'var(--error)' }}
        >
          <LogOut size={16} /> Sign Out • வெளியேறு
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Desktop & Laptop Left Sidebar (Sticky) */}
      <aside
        className="hidden lg:flex flex-col w-64 border-r flex-shrink-0"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Tablet & Mobile Slide-over Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop with smooth blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Slide-out Drawer */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-out"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div
              className="h-[70px] flex items-center justify-between px-4 border-b flex-shrink-0"
              style={{ borderColor: 'var(--border)', borderBottom: '2px solid #D97706' }}
            >
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Devotee Navigation • பட்டி
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Tab Name */}
        <header
          className="sticky top-0 z-40 h-[70px] flex items-center justify-between px-4 lg:px-6 border-b flex-shrink-0"
          style={{
            backgroundColor: 'var(--surface)',
            borderBottom: '2px solid #D97706',
          }}
        >
          {/* Mobile / Tablet Menu Button + Tab Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex-shrink-0"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Tab Name & Icon Badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{
                  backgroundColor: 'var(--surface-variant)',
                  border: '1px solid var(--border)',
                  color: 'var(--primary)',
                }}
              >
                <TabIcon size={19} />
              </div>
              <div className="flex items-baseline gap-2 min-w-0">
                <h1 className="text-base lg:text-lg font-bold truncate tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {currentTab.label}
                </h1>
                {currentTab.tamil && (
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full hidden sm:inline-block flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--surface-variant)',
                      color: 'var(--gold)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {currentTab.tamil}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
