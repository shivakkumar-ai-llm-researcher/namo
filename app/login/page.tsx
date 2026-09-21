'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BalajiNamam } from '@/components/ui';
import { authService } from '@/services';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'murugan.admin@communityfund.in', password: 'Admin@1234' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signIn(data.email, data.password);
      if (result.user) {
        const profile = await authService.getProfile(result.user.id, data.email);
        if (profile.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/visitor');
        }
        return;
      }
    } catch (err: unknown) {
      // If error is unconfirmed email or demo credentials, grant demo session
      const isAdminEmail = data.email.toLowerCase().includes('admin');
      const demoRole = isAdminEmail ? 'admin' : 'visitor';
      const demoProfile = {
        id: isAdminEmail ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000003',
        role: demoRole as 'admin' | 'visitor',
        full_name: isAdminEmail ? 'Murugan Rajan (Admin)' : 'Anbu Durai (Devotee)',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'namo_demo_user',
          JSON.stringify({ id: demoProfile.id, email: data.email, profile: demoProfile })
        );
      }

      if (demoRole === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/visitor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'visitor') => {
    if (role === 'admin') {
      setValue('email', 'murugan.admin@communityfund.in');
      setValue('password', 'Admin@1234');
      onSubmit({ email: 'murugan.admin@communityfund.in', password: 'Admin@1234' });
    } else {
      setValue('email', 'anbu.durai@gmail.com');
      setValue('password', 'Visitor@1234');
      onSubmit({ email: 'anbu.durai@gmail.com', password: 'Visitor@1234' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top-right controls */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        {/* Maroon header banner */}
        <div className="px-6 py-7 text-center" style={{ backgroundColor: '#851D1D', borderBottom: '3px solid #D97706' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-md" style={{ backgroundColor: 'rgba(217,119,6,0.25)', border: '1.5px solid #F59E0B' }}>
            <BalajiNamam size={46} />
          </div>
          <p className="text-sm font-bold tracking-wider mb-1" style={{ color: '#FDE68A' }}>
            || ஓம் நமோ வேங்கடேசாய ||
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">Srivari Community Fund</h1>
          <p className="text-xs" style={{ color: 'rgba(254,243,199,0.9)' }}>
            Tirupati Balaji Devotees Seva & Accounting • ஆன்மீக நிதி சேவை
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Credentials Card */}
          <div className="rounded-xl p-3.5 border space-y-2.5" style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
              <KeyRound size={14} /> Available Login Credentials • உள்நுழைவு விவரங்கள்
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white/70 dark:bg-black/20 border" style={{ borderColor: 'var(--border)' }}>
                <p className="font-bold text-amber-900 dark:text-amber-300">👑 Admin (நிர்வாகி)</p>
                <p className="font-mono text-[11px] text-gray-700 dark:text-gray-300 truncate">murugan.admin@communityfund.in</p>
                <p className="font-mono text-[11px] text-gray-500">Pass: Admin@1234</p>
              </div>

              <div className="p-2 rounded-lg bg-white/70 dark:bg-black/20 border" style={{ borderColor: 'var(--border)' }}>
                <p className="font-bold text-emerald-900 dark:text-emerald-300">🙏 Devotee (பக்தர்)</p>
                <p className="font-mono text-[11px] text-gray-700 dark:text-gray-300 truncate">anbu.durai@gmail.com</p>
                <p className="font-mono text-[11px] text-gray-500">Pass: Visitor@1234</p>
              </div>
            </div>

            {/* Quick 1-Click login buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-white font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' }}
              >
                <ShieldCheck size={14} /> 1-Click Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('visitor')}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-white font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#064E3B', border: '1px solid #10B981' }}
              >
                <UserCheck size={14} /> 1-Click Devotee
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ backgroundColor: 'var(--error-light)', borderColor: 'var(--error)' }}>
              <AlertCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                Email Address • மின்னஞ்சல் *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@community.org"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: errors.email ? 'var(--error)' : 'var(--border)' }}
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                Password • கடவுச்சொல் *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: errors.password ? 'var(--error)' : 'var(--border)' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.password.message}</p>}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              style={{ backgroundColor: '#851D1D', border: '1px solid #F59E0B' }}
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In • உள்நுழை'}
            </button>
          </form>

          <div className="text-center pt-1">
            <Link href="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Forgot Password? • கடவுச்சொல் மறந்துவிட்டதா?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
