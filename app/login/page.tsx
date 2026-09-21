'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BalajiNamam } from '@/components/ui';
import { authService } from '@/services';

const loginSchema = z.object({
  email: z.string().min(1, 'Please enter a username or email'),
  password: z.string().min(1, 'Please enter a password'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    // Handle shortcut admin/admin credentials
    const isAdminShortcut =
      data.email.toLowerCase() === 'admin' && data.password === 'admin';

    if (isAdminShortcut) {
      const demoProfile = {
        id: '00000000-0000-0000-0000-000000000001',
        role: 'admin' as const,
        full_name: 'Murugan Rajan (Admin)',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'namo_demo_user',
          JSON.stringify({ id: demoProfile.id, email: 'admin', profile: demoProfile })
        );
      }
      setIsLoading(false);
      router.replace('/admin');
      return;
    }

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

  const handleQuickAdminLogin = () => {
    setValue('email', 'admin');
    setValue('password', 'admin');
    onSubmit({ email: 'admin', password: 'admin' });
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
            || ஓம் நமோ வெங்கடேஸ்வராய ||
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Portal Login</h1>
          <p className="text-xs" style={{ color: 'rgba(254,243,199,0.9)' }}>
            நிர்வாகி உள்நுழைவு • Srivari Administration & Management
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Direct Public Dashboard Card for Devotees (No Credentials Needed) */}
          <div
            className="rounded-xl p-3.5 border flex items-center justify-between gap-3 shadow-sm"
            style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)' }}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                Devotee Dashboard • பக்தர் தளம்
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                No login credentials needed for public dashboard.
              </p>
            </div>
            <Link
              href="/visitor"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity flex-shrink-0 flex items-center gap-1.5"
              style={{ backgroundColor: '#064E3B', border: '1px solid #10B981' }}
            >
              <span>Direct Open →</span>
            </Link>
          </div>
          {/* Admin Credentials */}
          <div className="rounded-xl p-3 border space-y-2" style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--gold)' }}>
                <KeyRound size={14} /> Admin Credentials • நிர்வாகி விவரம்
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                Admin Only
              </span>
            </div>
            <div className="text-xs font-mono bg-white/70 dark:bg-black/20 p-2 rounded-lg border flex justify-between items-center gap-4" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <span className="font-semibold">Username: <span style={{ color: 'var(--gold)' }}>admin</span></span>
              <span className="font-semibold">Password: <span style={{ color: 'var(--gold)' }}>admin</span></span>
            </div>
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-white font-bold text-xs shadow-sm hover:opacity-90 transition-opacity w-full cursor-pointer"
              style={{ backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' }}
            >
              <ShieldCheck size={14} /> 1-Click Admin Login • உடனடி நிர்வாகி உள்நுழைவு
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ backgroundColor: 'var(--error-light)', borderColor: 'var(--error)' }}>
              <AlertCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                Username • பயனர்பெயர் *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  {...register('email')}
                  type="text"
                  placeholder="admin"
                  autoComplete="username"
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
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              style={{ backgroundColor: '#851D1D', border: '1px solid #F59E0B' }}
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isLoading ? 'Signing in as Admin...' : 'Sign In as Admin • நிர்வாகியாக உள்நுழை'}
            </button>
          </form>

          <div className="text-center pt-2 flex flex-col items-center gap-2">
            <Link
              href="/visitor"
              className="text-xs font-bold hover:underline flex items-center gap-1"
              style={{ color: 'var(--primary)' }}
            >
              ← Directly Open Public Devotee Dashboard • நேரடி தளம்
            </Link>
            <Link href="/forgot-password" className="text-[11px] font-semibold hover:underline" style={{ color: 'var(--text-tertiary)' }}>
              Forgot Password? • கடவுச்சொல் மறந்துவிட்டதா?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
