'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, TrendingUp, TrendingDown, PiggyBank, BarChart3, FileText, ClipboardList, CalendarDays, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../src/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BalajiNamam } from '@/components/ui';
import { getInitials } from '@/utils/formatters';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, tamil: 'டாஷ்போர்ட்' },
  { href: '/admin/members', label: 'Members', icon: Users, tamil: 'உறுப்பினர்கள்' },
  { href: '/admin/contributions', label: 'Contributions', icon: TrendingUp, tamil: 'வருமானம்' },
  { href: '/admin/expenses', label: 'Expenses', icon: TrendingDown, tamil: 'செலவுகள்' },
  { href: '/admin/savings', label: 'Savings', icon: PiggyBank, tamil: 'சேமிப்பு' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, tamil: 'பகுப்பாய்வு' },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays, tamil: 'நாட்காட்டி' },
  { href: '/admin/reports', label: 'Reports', icon: FileText, tamil: 'அறிக்கைகள்' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList, tamil: 'தணிக்கை' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.replace('/login');
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading Srivari Dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--border)', borderBottom: '2px solid #D97706' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' }}>
            <BalajiNamam size={22} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Srivari Community Fund</div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150"
              style={isActive ? { backgroundColor: 'var(--primary)', color: '#FFFFFF' } : { color: 'var(--text-secondary)' }}
            >
              <Icon size={18} />
              <div>
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-[10px] opacity-70">{item.tamil}</div>
              </div>
              {isActive && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{profile?.full_name || 'Admin'}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Administrator</div>
          </div>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-sm w-full px-3 py-2 rounded-xl hover:bg-red-50 transition-colors" style={{ color: 'var(--error)' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r flex-shrink-0" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', position: 'sticky', top: 0, height: '100vh' }}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 shadow-2xl" style={{ backgroundColor: 'var(--surface)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Menu</span>
              <button onClick={() => setSidebarOpen(false)} style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b" style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid #D97706' }}>
          <button className="lg:hidden p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }} onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
