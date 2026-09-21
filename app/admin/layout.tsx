'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  BarChart3,
  FileText,
  ClipboardList,
  CalendarDays,
  Sparkles,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../src/hooks/useAuth';
import { getInitials } from '@/utils/formatters';
import { TirupatiHeaderBanner } from '@/components/layout/TirupatiHeaderBanner';
import { useLanguage } from '@/context/LanguageContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, tamil: 'டாஷ்போர்ட்' },
  { href: '/admin/members', label: 'Members', icon: Users, tamil: 'உறுப்பினர்கள்' },
  { href: '/admin/contributions', label: 'Contributions', icon: TrendingUp, tamil: 'வருமானம்' },
  { href: '/admin/expenses', label: 'Expenses', icon: TrendingDown, tamil: 'செலவுகள்' },
  { href: '/admin/savings', label: 'Savings', icon: PiggyBank, tamil: 'சேமிப்பு' },
  { href: '/admin/functions', label: 'Functions', icon: Sparkles, tamil: 'நிகழ்வுகள்' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, tamil: 'பகுப்பாய்வு' },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays, tamil: 'நாட்காட்டி' },
  { href: '/admin/reports', label: 'Reports', icon: FileText, tamil: 'அறிக்கைகள்' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList, tamil: 'தணிக்கை' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { language, t } = useLanguage();
  const { user, profile, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const currentTab =
    navItems.find((item) =>
      item.href === '/admin'
        ? pathname === '/admin'
        : pathname === item.href || pathname.startsWith(item.href + '/')
    ) || { label: 'Admin Portal', tamil: 'நிர்வாகம்', icon: LayoutDashboard };
  const TabIcon = currentTab.icon;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150"
              style={
                isActive
                  ? { backgroundColor: 'var(--primary)', color: '#FFFFFF' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <Icon size={18} />
              <div>
                <div className="text-sm font-semibold">{language === 'ta' ? item.tamil : item.label}</div>
                <div className="text-[10px] opacity-70">{language === 'ta' ? item.label : item.tamil}</div>
              </div>
              {isActive && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {profile?.full_name || 'Admin'}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {language === 'ta' ? 'நிர்வாகி' : 'Administrator'}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm w-full px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          style={{ color: 'var(--error)' }}
        >
          <LogOut size={16} /> {language === 'ta' ? 'வெளியேறு' : 'Sign Out'}
        </button>
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
        className="px-4 lg:px-8 py-2 border-b flex items-center justify-between text-xs flex-shrink-0"
        style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <TabIcon size={15} style={{ color: 'var(--primary)' }} />
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {language === 'ta' ? currentTab.tamil : currentTab.label}
          </span>
          <span className="text-[11px] text-stone-500 font-medium">
            ({language === 'ta' ? currentTab.label : currentTab.tamil})
          </span>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
          {language === 'ta' ? '👑 நிர்வாக தளம்' : '👑 Admin Portal • நிர்வாகம்'}
        </span>
      </div>

      {/* ── Main Workspace: Sidebar & Page Content ── */}
      <div className="flex-1 flex min-w-0">
        {/* Desktop Left Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-60 border-r flex-shrink-0"
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
                  Admin Menu • பட்டி
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
        <main className="flex-1 min-w-0 p-4 lg:p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
