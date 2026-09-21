'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { authService } from '../../src/services';

const schema = z.object({ email: z.string().email('Please enter a valid email address') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="px-6 py-6" style={{ backgroundColor: '#851D1D', borderBottom: '3px solid #D97706' }}>
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-sm mt-1" style={{ color: '#FDE68A' }}>Enter your email to receive a reset link</p>
        </div>
        <div className="p-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="mx-auto mb-3" style={{ color: 'var(--success)' }} />
              <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Email Sent!</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>A password reset link has been sent to your email address.</p>
              <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && <p className="text-sm p-3 rounded-lg" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>{error}</p>}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                  <input {...register('email')} type="email" placeholder="admin@community.org" className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: errors.email ? 'var(--error)' : 'var(--border)' }} />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#851D1D' }}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <Link href="/login" className="flex items-center justify-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}