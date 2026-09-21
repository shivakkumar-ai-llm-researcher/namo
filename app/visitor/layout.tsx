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
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/formatters';
import { TirupatiHeaderBanner } from '@/components/layout/TirupatiHeaderBanner';

const navItems = [
  { href: '/visitor', label: 'Dashboard', icon: LayoutDashboard, tamil: 'டாஷ்போர்ட்' },
  { href: '/visitor/members', label: 'Devotee Sangam', icon: Users, tamil: 'உறுப்பினர்கள்' },
  { href: '/visitor/contributions', label: 'Contributions', icon: TrendingUp, tamil: 'வருமானம்' },
  { href: '/visitor/expenses', label: 'Expenditures', icon: TrendingDown, tamil: 'செலவுகள்' },
  { href: '/visitor/savings', label: 'Srivari Savings', icon: PiggyBank, tamil: 'சேமிப்பு' },
  { href: '/visitor/analytics', label: 'Analytics', icon: BarChart3, tamil: 'பகுப்பாய்வு' },
  { href: '/visitor/calendar', label: 'Calendar', icon: CalendarDays, tamil: 'நாட்காட்டி' },
];

import { useLanguage } from '@/context/LanguageContext';

export default function VisitorLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demoStr = localStorage.getItem('namo_demo_user');
      if (demoStr) {
        try {
          const parsed = JSON.parse(demoStr);
          if (parsed.profile?.role === 'visitor' || parsed.profile?.full_name?.includes('Anbu')) {
            localStorage.removeItem('namo_demo_user');
          }
        } catch {}
      }
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/visitor');
  };

  const currentTab =
    navItems.find((item) =>
      item.href === '/visitor'
        ? pathname === '/visitor'
        : pathname === item.href || pathname.startsWith(item.href + '/')
    ) || { label: 'Devotee Portal', tamil: 'பக்தர் தளம்', icon: LayoutDashboard };
  const TabIcon = currentTab.icon;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Navigation Links (No duplicate top-left brand box) */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/visitor' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 group"
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(133,29,29,0.25)',
                    }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <Icon
                size={18}
                className={isActive ? 'text-amber-300' : 'group-hover:text-amber-600 transition-colors'}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{item.label}</div>
                <div className="text-[10px] opacity-75 truncate">{item.tamil}</div>
              </div>
              {isActive && <ChevronRight size={14} className="ml-auto text-amber-300" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Admin Login or Sign Out */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {profile?.role === 'admin' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' }}
              >
                {getInitials(profile?.full_name || 'Admin')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile?.full_name || 'Admin'}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--gold)' }}>
                  Administrator • நிர்வாகி
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 text-xs font-bold w-full px-3 py-2 rounded-xl transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
              style={{ color: 'var(--error)', border: '1px solid var(--border)' }}
            >
              <LogOut size={15} /> Sign Out • வெளியேறு
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-xs font-bold w-full px-3 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 shadow-sm cursor-pointer"
            style={{ backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' }}
          >
            <Shield size={14} />
            <span>Admin Login • நிர்வாகி உள்நுழைவு</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* ── 100% Full-Width Tirupati Header Banner with Rounded-B Corners ── */}
      <div className="w-full flex-shrink-0" style={{ backgroundColor: 'var(--surface-variant)' }}>
        <TirupatiHeaderBanner onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* ── Sub-bar: Active Tab Indicator & Portal Status ── */}
      <div
        className="px-3 sm:px-4 lg:px-8 py-2 border-b flex items-center justify-between text-xs flex-shrink-0 gap-2"
        style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <TabIcon size={15} className="shrink-0" style={{ color: 'var(--primary)' }} />
          <span className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {language === 'ta' ? (currentTab.tamil || currentTab.label) : currentTab.label}
          </span>
          {language === 'en' && currentTab.tamil && (
            <span className="text-[11px] text-stone-500 font-medium truncate hidden xs:inline">
              ({currentTab.tamil})
            </span>
          )}
          {language === 'ta' && currentTab.label && (
            <span className="text-[11px] text-stone-500 font-medium truncate hidden xs:inline">
              ({currentTab.label})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40 hidden sm:inline-flex">
            {language === 'ta' ? '🙏 பக்தர் தளம்' : '🙏 Devotee Portal'}
          </span>
          {profile?.role === 'admin' ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Shield size={12} />
              <span>{language === 'ta' ? 'நிர்வாக பலகை →' : 'Admin Panel →'}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Shield size={12} />
              <span>{language === 'ta' ? 'நிர்வாக உள்நுழைவு' : 'Admin Login'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Main Workspace: Sidebar & Page Content ── */}
      <div className="flex-1 flex min-w-0">
        {/* Desktop Left Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-64 border-r flex-shrink-0"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            position: 'sticky',
            top: 0,
            height: 'calc(100vh - 116px)',
          }}
        >
          {sidebarContent}
        </aside>

        {/* Mobile Slide-out Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] shadow-2xl flex flex-col z-10"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <div
                className="h-[60px] flex items-center justify-between px-4 border-b flex-shrink-0"
                style={{ borderColor: 'var(--border)', borderBottom: '2px solid #D97706' }}
              >
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Devotee Navigation • பட்டி
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
